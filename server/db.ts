import { createHash, randomBytes } from "node:crypto";
import { asc, count, desc, eq, gt, and, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, noodlePlayers, NoodlePlayer, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export class NoodleIdentityError extends Error {
  constructor(
    message: string,
    public readonly reason: "name-taken" | "invalid-session" | "not-found" | "database-unavailable",
  ) {
    super(message);
    this.name = "NoodleIdentityError";
  }
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function normalizeNoodleName(name: string) {
  return name.normalize("NFKC").trim().replace(/\s+/g, " ");
}

function noodleNameKey(name: string) {
  return normalizeNoodleName(name).toLocaleLowerCase("vi-VN");
}

function requireNoodleDb() {
  return getDb().then((db) => {
    if (!db) throw new NoodleIdentityError("Chưa kết nối được dữ liệu BXH.", "database-unavailable");
    return db;
  });
}

export async function joinNoodlePlayer(name: string, existingToken?: string) {
  const db = await requireNoodleDb();
  const displayName = normalizeNoodleName(name);
  const nameKey = noodleNameKey(displayName);

  if (existingToken) {
    const tokenHash = hashToken(existingToken);
    const existing = await db.select().from(noodlePlayers)
      .where(and(eq(noodlePlayers.nameKey, nameKey), eq(noodlePlayers.loginTokenHash, tokenHash)))
      .limit(1);
    if (existing[0]) {
      return { playerId: existing[0].id, name: existing[0].displayName, token: existingToken };
    }

    const nameAlreadyUsed = await db.select({ id: noodlePlayers.id }).from(noodlePlayers)
      .where(eq(noodlePlayers.nameKey, nameKey)).limit(1);
    if (nameAlreadyUsed[0]) {
      throw new NoodleIdentityError("Tên này đã có người chơi khác dùng rồi. Hãy chọn một tên khác nhé.", "name-taken");
    }
    throw new NoodleIdentityError("Phiên chơi trên thiết bị này không khớp với tên đã nhập.", "invalid-session");
  }

  const nameAlreadyUsed = await db.select({ id: noodlePlayers.id }).from(noodlePlayers)
    .where(eq(noodlePlayers.nameKey, nameKey)).limit(1);
  if (nameAlreadyUsed[0]) {
    throw new NoodleIdentityError("Tên này đã có người chơi khác dùng rồi. Hãy chọn một tên khác nhé.", "name-taken");
  }

  const token = randomBytes(32).toString("base64url");
  try {
    await db.insert(noodlePlayers).values({
      displayName,
      nameKey,
      loginTokenHash: hashToken(token),
      totalClicks: 0,
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ER_DUP_ENTRY") {
      throw new NoodleIdentityError("Tên này vừa được người khác chọn. Thử tên khác nhé.", "name-taken");
    }
    throw error;
  }

  const created = await db.select({ id: noodlePlayers.id }).from(noodlePlayers)
    .where(eq(noodlePlayers.nameKey, nameKey)).limit(1);
  if (!created[0]) throw new Error("Could not load the newly created player");
  return { playerId: created[0].id, name: displayName, token };
}

export async function getNoodleLeaderboard(token?: string) {
  const db = await requireNoodleDb();
  const top = await db.select({
    playerId: noodlePlayers.id,
    name: noodlePlayers.displayName,
    totalClicks: noodlePlayers.totalClicks,
  }).from(noodlePlayers)
    .orderBy(desc(noodlePlayers.totalClicks), asc(noodlePlayers.id))
    .limit(10);

  let me: { playerId: number; name: string; totalClicks: number; rank: number } | null = null;
  if (token) {
    const tokenHash = hashToken(token);
    const playerRows = await db.select({
      playerId: noodlePlayers.id,
      name: noodlePlayers.displayName,
      totalClicks: noodlePlayers.totalClicks,
      id: noodlePlayers.id,
    }).from(noodlePlayers).where(eq(noodlePlayers.loginTokenHash, tokenHash)).limit(1);
    const player = playerRows[0];
    if (player) {
      const ahead = await db.select({ value: count() }).from(noodlePlayers).where(
        and(
          gt(noodlePlayers.totalClicks, player.totalClicks),
          // The first clause above counts strictly higher scores; the id tie-break keeps rank stable.
        ),
      );
      const sameScoreAhead = await db.select({ value: count() }).from(noodlePlayers).where(
        and(eq(noodlePlayers.totalClicks, player.totalClicks), lt(noodlePlayers.id, player.id)),
      );
      me = {
        playerId: player.playerId,
        name: player.name,
        totalClicks: player.totalClicks,
        rank: Number(ahead[0]?.value ?? 0) + Number(sameScoreAhead[0]?.value ?? 0) + 1,
      };
    }
  }

  return { top, me };
}

export async function recordNoodleClick(token: string): Promise<NoodlePlayer | null> {
  const db = await requireNoodleDb();
  const tokenHash = hashToken(token);
  const playerRows = await db.select({ id: noodlePlayers.id }).from(noodlePlayers)
    .where(eq(noodlePlayers.loginTokenHash, tokenHash)).limit(1);
  const player = playerRows[0];
  if (!player) return null;

  await db.update(noodlePlayers)
    .set({ totalClicks: sql`${noodlePlayers.totalClicks} + 1` })
    .where(eq(noodlePlayers.id, player.id));

  const updated = await db.select().from(noodlePlayers).where(eq(noodlePlayers.id, player.id)).limit(1);
  return updated[0] ?? null;
}
