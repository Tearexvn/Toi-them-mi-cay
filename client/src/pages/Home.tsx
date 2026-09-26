import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { trpc } from "@/lib/trpc";

type Mood = "beef" | "chicken" | "octopus";
type Board = Mood | "total";
type ParticleStyle = CSSProperties & {
  "--dx": string;
  "--dy": string;
  "--rot": string;
  "--duration": string;
};

const moods: { id: Mood; label: string; emoji: string; note: string }[] = [
  { id: "beef", label: "Bò", emoji: "🥩", note: "BÒ CHÍN TỚI" },
  { id: "chicken", label: "Đùi gà", emoji: "🍗", note: "GÀ GIÒN TAN" },
  { id: "octopus", label: "Bạch tuộc", emoji: "🐙", note: "BẠCH TUỘC GIÒN SỰT" },
];

const boards: { id: Board; label: string; emoji: string }[] = [
  { id: "total", label: "Tổng", emoji: "🏆" },
  { id: "beef", label: "Mì bò", emoji: "🥩" },
  { id: "chicken", label: "Mì đùi gà", emoji: "🍗" },
  { id: "octopus", label: "Mì bạch tuộc", emoji: "🐙" },
];

const scoreFields = {
  total: "totalClicks",
  beef: "beefClicks",
  chicken: "chickenClicks",
  octopus: "octopusClicks",
} as const;

const TOKEN_KEY = "mi-cay-player-token";
const NAME_KEY = "mi-cay-player-name";

function readSession(key: string) {
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function medalFor(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return String(rank).padStart(2, "0");
}

export default function Home() {
  const [mood, setMood] = useState<Mood>("beef");
  const [activeBoard, setActiveBoard] = useState<Board>("total");
  const [particles, setParticles] = useState<{ id: number; style: ParticleStyle }[]>([]);
  const [clicksThisVisit, setClicksThisVisit] = useState(0);
  const [playerToken, setPlayerToken] = useState(() => readSession(TOKEN_KEY));
  const [playerName, setPlayerName] = useState(() => readSession(NAME_KEY));
  const [draftName, setDraftName] = useState("");
  const [notice, setNotice] = useState("");

  const utils = trpc.useUtils();
  const leaderboardInput = useMemo(
    () => ({ token: playerToken || undefined, board: activeBoard }),
    [playerToken, activeBoard],
  );
  const leaderboard = trpc.noodle.leaderboard.useQuery(
    leaderboardInput,
    { refetchInterval: 10_000, refetchOnWindowFocus: true, retry: 1 },
  );
  const joinPlayer = trpc.noodle.join.useMutation({
    onSuccess: (session) => {
      try {
        window.localStorage.setItem(TOKEN_KEY, session.token);
        window.localStorage.setItem(NAME_KEY, session.name);
      } catch {
        setNotice("Thiết bị đang chặn lưu phiên. Lần sau bạn có thể cần nhập lại tên.");
      }
      setPlayerToken(session.token);
      setPlayerName(session.name);
      setDraftName("");
      setNotice(session.returning
        ? `Chào ${session.name}! Đã vào lại hồ sơ, điểm cũ còn nguyên.`
        : `Chào ${session.name}! Bấm mì là lên bảng.`);
      void utils.noodle.leaderboard.invalidate();
    },
  });
  const recordClick = trpc.noodle.click.useMutation({
    onSuccess: async () => {
      await utils.noodle.leaderboard.invalidate();
    },
    onError: (error) => setNotice(error.message || "Không ghi được lượt bấm. Thử lại nhé."),
  });

  const activeMood = moods.find((item) => item.id === mood) ?? moods[0];
  const scoreField = scoreFields[activeBoard];
  const lastRecordedScore = recordClick.variables?.token === playerToken
    ? recordClick.data?.[scoreField] ?? 0
    : 0;
  const myScore = Math.max(leaderboard.data?.me?.score ?? 0, lastRecordedScore);
  const activeBoardLabel = boards.find((board) => board.id === activeBoard)?.label ?? "Tổng";

  function makeItRain() {
    if (!playerToken) {
      setNotice("Nhập tên trước để được ghi tên lên BXH nha.");
      document.getElementById("player-name")?.focus();
      return;
    }

    const now = Date.now();
    const newParticles = Array.from({ length: 14 }, (_, index) => {
      const angle = (Math.PI * 2 * index) / 14 + Math.random() * 0.5;
      const distance = 150 + Math.random() * 240;
      const id = now + index;
      return {
        id,
        style: {
          "--dx": `${Math.cos(angle) * distance}px`,
          "--dy": `${Math.sin(angle) * distance - 55}px`,
          "--rot": `${Math.random() * 100 - 50}deg`,
          "--duration": `${850 + Math.random() * 550}ms`,
          left: "50%",
          top: "61%",
          animationDelay: `${Math.random() * 100}ms`,
          fontSize: `${22 + Math.random() * 17}px`,
        } as ParticleStyle,
      };
    });

    setParticles((current) => [...current.slice(-28), ...newParticles]);
    setClicksThisVisit((current) => current + 1);
    setNotice("");
    recordClick.mutate({ token: playerToken, mood });
    window.setTimeout(() => {
      setParticles((current) => current.filter((particle) => !newParticles.some((created) => created.id === particle.id)));
    }, 1600);
  }

  function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = draftName.trim().replace(/\s+/g, " ");
    if (!name) {
      setNotice("Nhập tên trước đã nhé.");
      return;
    }
    setNotice("");
    joinPlayer.mutate({ name, token: playerToken || undefined });
  }

  function leavePlayer() {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(NAME_KEY);
    } catch {
      // The in-memory session can still be cleared if storage is unavailable.
    }
    setPlayerToken("");
    setPlayerName("");
    setClicksThisVisit(0);
    setNotice("Đã thoát khỏi lượt chơi. Điểm cũ vẫn nằm trên BXH nhé.");
    void utils.noodle.leaderboard.invalidate();
  }

  const nameError = joinPlayer.error?.message;
  const leaderboardError = leaderboard.error?.message;

  return (
    <main className="site-shell" data-theme={mood}>
      <div className="paper-grain" aria-hidden="true" />
      <div className="ambient ambient-one" aria-hidden="true">{activeMood.emoji}</div>
      <div className="ambient ambient-two" aria-hidden="true">🌶️</div>
      <div className="ambient ambient-three" aria-hidden="true">{activeMood.emoji}</div>

      <header className="topbar">
        <a className="brand" href="#top" aria-label="Tôi thèm mì cay, về đầu trang">
          <span className="brand-mark" aria-hidden="true"><span>🍜</span></span>
          <span className="brand-name">tôi thèm<br />mì cay</span>
        </a>
        <div className="spice-indicator"><span className="spice-dot" /> cơn thèm cấp độ 7</div>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-kicker"><span className="kicker-line" /> một trang web rất cần thiết <span className="kicker-line" /></div>
        <h1 id="hero-title">tôi thèm <span>mì cay.</span></h1>
        <p className="hero-caption">Không có lý do. Chỉ là tự nhiên thèm thôi.</p>

        {!playerName ? (
          <form className="join-form" onSubmit={handleJoin}>
            <label className="join-label" htmlFor="player-name">Nhập tên để ghi danh hoặc vào lại</label>
            <div className="join-controls">
              <input
                id="player-name"
                type="text"
                value={draftName}
                onChange={(event) => { setDraftName(event.target.value); joinPlayer.reset(); }}
                placeholder="Tên của bạn là…"
                maxLength={24}
                autoComplete="nickname"
                aria-label="Tên người chơi"
                aria-describedby="join-message"
              />
              <button className="join-button" type="submit" disabled={joinPlayer.isPending}>
                {joinPlayer.isPending ? "Đang vào…" : "Vào chơi"}
                <span aria-hidden="true">↗</span>
              </button>
            </div>
            <p id="join-message" className={`join-hint ${nameError ? "is-error" : ""}`} aria-live="polite">
              {nameError || "Nhập tên cũ để giữ điểm · không cần mật khẩu."}
            </p>
          </form>
        ) : (
          <div className="player-welcome">
            <span className="welcome-avatar" aria-hidden="true">🍜</span>
            <span>đang chơi với tên <strong>{playerName}</strong></span>
            <button type="button" onClick={leavePlayer} className="change-player">đổi tên</button>
          </div>
        )}

        <div className="button-stage">
          <div className="burst-layer" aria-hidden="true">
            {particles.map((particle) => (
              <span key={particle.id} className="noodle-particle" style={particle.style}>🍜</span>
            ))}
          </div>
          <button className="noodle-button" onClick={makeItRain} aria-label="Bấm để mì cay bay tung tóe">
            <span className="button-bowl" aria-hidden="true">🍜</span>
            <span>mì cay</span>
            <span className="button-spark" aria-hidden="true">✳</span>
          </button>
        </div>
        <div className="tiny-counter" aria-live="polite">
          <span className="counter-spark" aria-hidden="true">✳</span>
          {!playerToken
            ? "nhập tên, rồi bấm mì để lên BXH"
            : `lượt này: ${clicksThisVisit} · ${activeBoardLabel}: ${myScore} lần bấm`}
        </div>
        {notice && <p className="action-notice" role="status">{notice}</p>}

        <div className="mood-picker" aria-label="Chọn vị mì cay">
          <p className="picker-label">hôm nay thèm vị nào?</p>
          <div className="mood-options" role="group" aria-label="Chọn topping nền">
            {moods.map((item) => (
              <button
                key={item.id}
                className={`mood-option ${mood === item.id ? "is-active" : ""}`}
                onClick={() => setMood(item.id)}
                aria-pressed={mood === item.id}
              >
                <span className="mood-emoji" aria-hidden="true">{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <p className="mood-note" aria-live="polite">{activeMood.note} · cay 7 cấp</p>
        </div>
      </section>

      <section className="leaderboard-wrap" aria-labelledby="leaderboard-title">
        <div className="leaderboard-card">
          <div className="leaderboard-heading">
            <div>
              <p className="leaderboard-eyebrow"><span className="rank-spark">✳</span> BẢNG XẾP HẠNG</p>
              <h2 id="leaderboard-title">Ai thèm mì nhất?</h2>
            </div>
            <span className="live-tag"><span className="live-dot" /> cập nhật liên tục</span>
          </div>
          <div className="leaderboard-tabs" role="tablist" aria-label="Chọn bảng xếp hạng">
            {boards.map((board) => (
              <button
                key={board.id}
                type="button"
                role="tab"
                aria-selected={activeBoard === board.id}
                className={`leaderboard-tab ${activeBoard === board.id ? "is-active" : ""}`}
                onClick={() => setActiveBoard(board.id)}
              >
                <span aria-hidden="true">{board.emoji}</span>
                <span>{board.label}</span>
              </button>
            ))}
          </div>
          {leaderboardError ? (
            <div className="leaderboard-empty" role="status">
              <span aria-hidden="true">🍜</span>
              <p>BXH đang nghỉ ăn mì một chút.</p>
              <button type="button" onClick={() => void leaderboard.refetch()}>Thử tải lại</button>
            </div>
          ) : leaderboard.isLoading ? (
            <div className="leaderboard-empty" role="status"><span aria-hidden="true">🥢</span><p>Đang đếm mì…</p></div>
          ) : !leaderboard.data?.top.length ? (
            <div className="leaderboard-empty">
              <span aria-hidden="true">🍜</span>
              <p>{activeBoard === "total" ? "Chưa ai ghi danh cả. Mở hàng đi nào!" : "Chưa ai bấm vị này cả. Mở hàng đi nào!"}</p>
            </div>
          ) : (
            <ol className="leaderboard-list" role="tabpanel" aria-label={`BXH ${activeBoardLabel}`}>
              {leaderboard.data.top.map((entry, index) => {
                const rank = index + 1;
                const isMe = entry.playerId === leaderboard.data?.me?.playerId;
                return (
                  <li key={entry.playerId} className={`leaderboard-row ${rank <= 3 ? `top-rank rank-${rank}` : ""} ${isMe ? "is-me" : ""}`}>
                    <span className="rank-number" aria-label={`Hạng ${rank}`}>{medalFor(rank)}</span>
                    <span className="rank-avatar" aria-hidden="true">{rank === 1 ? "👑" : "🍜"}</span>
                    <span className="rank-name">{entry.name}{isMe && <span className="you-tag">BẠN</span>}</span>
                    <span className="rank-score">{entry.score.toLocaleString("vi-VN")} <small>lần bấm</small></span>
                  </li>
                );
              })}
              {leaderboard.data.me && !leaderboard.data.top.some((entry) => entry.playerId === leaderboard.data?.me?.playerId) && (
                <li className="leaderboard-row is-me outside-top">
                  <span className="rank-number">{leaderboard.data.me.rank}</span>
                  <span className="rank-avatar" aria-hidden="true">🍜</span>
                  <span className="rank-name">{leaderboard.data.me.name}<span className="you-tag">BẠN</span></span>
                  <span className="rank-score">{leaderboard.data.me.score.toLocaleString("vi-VN")} <small>lần bấm</small></span>
                </li>
              )}
            </ol>
          )}
          <div className="leaderboard-footnote"><span>🏆</span> Mỗi lần bấm mì cay = 1 điểm ở vị đã chọn và 1 điểm tổng.</div>
        </div>
      </section>

      <footer className="bottom-note"><span>MI CAY CLUB</span><span className="footer-asterisk">✳</span><span>hết thèm thì thôi</span></footer>
    </main>
  );
}
