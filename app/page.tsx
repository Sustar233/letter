"use client";

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  letterConfig,
  type BranchKey,
  type LetterChapter,
} from "./letter-config";

const STORAGE_KEY = "starlit-letter-route-v2";

type SavedState = {
  opened: boolean;
  stage: number;
  branch: BranchKey | null;
};

const initialState: SavedState = { opened: false, stage: 0, branch: null };

function saveState(value: SavedState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // The letter remains fully usable when storage is unavailable.
  }
}

function Starfield() {
  const stars = Array.from({ length: 34 }, (_, index) => ({
    left: `${(index * 37 + 11) % 100}%`,
    top: `${(index * 61 + 7) % 96}%`,
    delay: `${(index % 9) * -0.53}s`,
    size: index % 7 === 0 ? 3 : index % 3 === 0 ? 2 : 1,
  }));

  return (
    <div className="sky" aria-hidden="true">
      <div className="sky-nebula" />
      <div className="moon-haze" />
      {stars.map((star, index) => (
        <i
          key={index}
          className="sky-star"
          style={
            {
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
            } as CSSProperties
          }
        />
      ))}
      <span className="shooting-star shooting-star-one" />
      <span className="shooting-star shooting-star-two" />
    </div>
  );
}

function ImageCard({
  item,
  index,
}: {
  item: LetterChapter["media"][number];
  index: number;
}) {
  const [turned, setTurned] = useState(false);

  return (
    <button
      className={`memory-card memory-card-${index + 1} ${turned ? "is-turned" : ""}`}
      type="button"
      onClick={() => setTurned((current) => !current)}
      aria-label={`${item.alt}，点击${turned ? "收起" : "查看"}`}
    >
      <span className="memory-card-inner">
        <span className="memory-face memory-front">
          {item.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.src} alt={item.alt} />
          ) : (
            <span className="media-placeholder" aria-hidden="true">
              <i />
              <b>✦</b>
              <small>在此放入照片</small>
            </span>
          )}
          <span className="media-label">{item.label}</span>
        </span>
        <span className="memory-face memory-back">
          <span className="memory-star">✦</span>
          <span>{item.caption}</span>
          <small>再次轻触，回到照片</small>
        </span>
      </span>
    </button>
  );
}

function Progress({ stage, branch }: { stage: number; branch: BranchKey | null }) {
  const steps = ["失礼", "静心", "祝愿", branch === "farewell" ? "告别" : branch === "forward" ? "展望" : "未定"];
  const active = Math.min(stage, 3);

  return (
    <nav className="chapter-progress" aria-label="信件章节">
      <span className="progress-wordmark">STELLAR LETTER</span>
      <ol>
        {steps.map((step, index) => (
          <li className={index <= active ? "is-reached" : ""} key={step}>
            <i aria-hidden="true" />
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <span className="progress-count">{String(active + 1).padStart(2, "0")} / 04</span>
    </nav>
  );
}

function ChapterVisual({ chapter }: { chapter: LetterChapter }) {
  if (chapter.id === "apology") {
    return (
      <div className="chapter-visual memory-visual" aria-label="可替换的截图区域">
        {chapter.media.map((item, index) => (
          <ImageCard item={item} index={index} key={item.label} />
        ))}
        <span className="memory-thread memory-thread-one" aria-hidden="true" />
        <span className="memory-thread memory-thread-two" aria-hidden="true" />
      </div>
    );
  }

  if (chapter.id === "stillness") {
    const item = chapter.media[0];
    return (
      <div className="chapter-visual travel-visual">
        <div className="travel-ticket">
          <span className="ticket-route" aria-hidden="true">
            <i>✦</i><b /><i>✦</i><b /><i>✦</i>
          </span>
          <p>MEMORY ADMIT ONE</p>
          <strong>世界之窗</strong>
          <small>[在这里补充旅行日期]</small>
        </div>
        <div className="travel-photo">
          {item.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.src} alt={item.alt} />
          ) : (
            <span className="media-placeholder travel-placeholder" aria-hidden="true">
              <i />
              <b>✧</b>
              <small>在此放入世界之窗照片</small>
            </span>
          )}
          <p>{item.caption}</p>
        </div>
      </div>
    );
  }

  if (chapter.id === "wishes") {
    return (
      <div className="chapter-visual wish-visual" aria-hidden="true">
        <span className="wish-orbit orbit-one" />
        <span className="wish-orbit orbit-two" />
        <div className="wish-word wish-word-one"><i>01</i><strong>感谢</strong><small>GRATITUDE</small></div>
        <div className="wish-word wish-word-two"><i>02</i><strong>收获</strong><small>GROWTH</small></div>
        <div className="wish-word wish-word-three"><i>03</i><strong>祝愿</strong><small>WISHES</small></div>
      </div>
    );
  }

  return (
    <div className={`chapter-visual ending-visual ${chapter.id}`} aria-hidden="true">
      <div className="ending-orbit">
        <i className="ending-star ending-star-left">✦</i>
        <i className="ending-star ending-star-right">✦</i>
        <span />
      </div>
      <p>{chapter.id === "farewell" ? "向各自的远方，平安顺遂" : "在遥远的现实里，仍旧彼此照亮"}</p>
    </div>
  );
}

function ChapterPage({
  chapter,
  onNext,
  onBack,
  last,
}: {
  chapter: LetterChapter;
  onNext: () => void;
  onBack: () => void;
  last?: boolean;
}) {
  return (
    <section className={`scene chapter-scene chapter-${chapter.id}`} aria-labelledby={`${chapter.id}-title`}>
      <div className="scene-grid">
        <div className="chapter-copy">
          <p className="chapter-eyebrow">{chapter.eyebrow}</p>
          <span className="chapter-number" aria-hidden="true">{chapter.number}</span>
          <h1 id={`${chapter.id}-title`}>{chapter.title}</h1>
          <p className="chapter-lead">{chapter.lead}</p>
          <div className="chapter-body">
            {chapter.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
        <ChapterVisual chapter={chapter} />
      </div>
      <div className="scene-actions">
        <button className="text-button" type="button" onClick={onBack}>
          <span aria-hidden="true">←</span> 上一页
        </button>
        <button className="star-button" type="button" onClick={onNext}>
          <span>{last ? "读到信的末尾" : chapter.prompt}</span>
          <i aria-hidden="true">✦</i>
        </button>
      </div>
    </section>
  );
}

function BranchQuestion({
  onChoose,
  onBack,
}: {
  onChoose: (branch: BranchKey) => void;
  onBack: () => void;
}) {
  return (
    <section className="scene branch-scene" aria-labelledby="branch-question">
      <header className="branch-heading">
        <p>{letterConfig.question.overline}</p>
        <h1 id="branch-question">{letterConfig.question.title}</h1>
        <span>{letterConfig.question.note}</span>
      </header>
      <div className="branch-lines" aria-hidden="true"><i /><b /><span /></div>
      <div className="branch-options">
        {letterConfig.question.options.map((option) => (
          <button
            className={`branch-card branch-${option.key}`}
            type="button"
            key={option.key}
            onClick={() => onChoose(option.key)}
          >
            <span className="branch-marker">{option.marker}</span>
            <span className="branch-constellation" aria-hidden="true">
              <i /><i /><i /><b />
            </span>
            <span className="branch-card-copy">
              <small>{option.key === "farewell" ? "FAREWELL" : "TOGETHER, FORWARD"}</small>
              <strong>{option.title}</strong>
              <em>{option.description}</em>
            </span>
            <span className="branch-enter">选择这条星轨 <i>↗</i></span>
          </button>
        ))}
      </div>
      <button className="branch-back text-button" type="button" onClick={onBack}>← 回到上一页</button>
    </section>
  );
}

function Finish({ branch, onRestart }: { branch: BranchKey; onRestart: () => void }) {
  return (
    <section className={`scene finish-scene finish-${branch}`} aria-labelledby="finish-title">
      <div className="finish-constellation" aria-hidden="true">
        <i /><i /><i /><i /><i /><span /><b />
      </div>
      <p className="finish-overline">{letterConfig.finish.overline}</p>
      <h1 id="finish-title">{letterConfig.finish.title}</h1>
      <p className="finish-note">{letterConfig.finish.note}</p>
      <div className="signature">
        <span>你的朋友</span>
        <strong>{letterConfig.sender}</strong>
      </div>
      <p className="chosen-route">本次抵达：{branch === "farewell" ? "A 线 · 告别篇" : "B 线 · 展望篇"}</p>
      <button className="restart-button" type="button" onClick={onRestart}>
        <span>重新拆开这封信</span><i aria-hidden="true">↺</i>
      </button>
    </section>
  );
}

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const [reading, setReading] = useState<SavedState>(initialState);
  const [transitioning, setTransitioning] = useState(false);
  const touchStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SavedState>;
        setReading({
          opened: Boolean(saved.opened),
          stage: Math.max(0, Math.min(5, Number(saved.stage) || 0)),
          branch: saved.branch === "farewell" || saved.branch === "forward" ? saved.branch : null,
        });
      }
    } catch {
      // Start from the sealed envelope when saved progress is invalid.
    } finally {
      setHydrated(true);
    }
  }, []);

  const changeReading = useCallback((next: SavedState) => {
    setTransitioning(true);
    window.setTimeout(() => {
      setReading(next);
      saveState(next);
      window.scrollTo({ top: 0, behavior: "instant" });
      window.setTimeout(() => setTransitioning(false), 60);
    }, 300);
  }, []);

  const goBack = useCallback(() => {
    if (!reading.opened) return;
    if (reading.stage === 0) {
      changeReading(initialState);
    } else if (reading.stage === 4) {
      changeReading({ ...reading, stage: 3, branch: null });
    } else if (reading.stage < 5) {
      changeReading({ ...reading, stage: reading.stage - 1 });
    }
  }, [changeReading, reading]);

  const goNext = useCallback(() => {
    if (!reading.opened || reading.stage === 3 || reading.stage >= 5) return;
    changeReading({ ...reading, stage: reading.stage + 1 });
  }, [changeReading, reading]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goBack();
      if (event.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goBack, goNext]);

  const beginTouch = (event: ReactPointerEvent<HTMLElement>) => {
    touchStart.current = { x: event.clientX, y: event.clientY };
  };

  const endTouch = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "touch" || (event.target as HTMLElement).closest("button")) return;
    const x = event.clientX - touchStart.current.x;
    const y = event.clientY - touchStart.current.y;
    if (Math.abs(x) < 70 || Math.abs(x) < Math.abs(y)) return;
    if (x < 0) goNext();
    else goBack();
  };

  if (!hydrated) {
    return <main className="letter-app loading" aria-label="正在取出信件"><Starfield /></main>;
  }

  let content;
  if (!reading.opened) {
    content = (
      <section className="scene cover-scene" aria-labelledby="cover-title">
        <p className="cover-overline">{letterConfig.cover.overline}</p>
        <div className="cover-orbit" aria-hidden="true"><i /><i /><span /></div>
        <button
          className="envelope"
          type="button"
          aria-label="拆开这封信"
          onClick={() => changeReading({ opened: true, stage: 0, branch: null })}
        >
          <span className="envelope-shadow" />
          <span className="envelope-back" />
          <span className="envelope-paper"><small>TO</small><strong>{letterConfig.recipient}</strong></span>
          <span className="envelope-left" />
          <span className="envelope-right" />
          <span className="envelope-front" />
          <span className="envelope-flap" />
          <span className="wax-seal">信</span>
        </button>
        <div className="cover-copy">
          <span className="cover-index">LETTER · 001</span>
          <h1 id="cover-title">{letterConfig.cover.title}</h1>
          <p>{letterConfig.cover.subtitle}</p>
          <button className="cover-open" type="button" onClick={() => changeReading({ opened: true, stage: 0, branch: null })}>
            {letterConfig.cover.openLabel}<i aria-hidden="true">✦</i>
          </button>
        </div>
        <p className="cover-tip">轻触信封 · 开启一段只属于我们的星轨</p>
      </section>
    );
  } else if (reading.stage <= 2) {
    content = <ChapterPage chapter={letterConfig.chapters[reading.stage]} onBack={goBack} onNext={goNext} />;
  } else if (reading.stage === 3) {
    content = (
      <BranchQuestion
        onBack={goBack}
        onChoose={(branch) => changeReading({ ...reading, branch, stage: 4 })}
      />
    );
  } else if (reading.stage === 4 && reading.branch) {
    content = <ChapterPage chapter={letterConfig.endings[reading.branch]} onBack={goBack} onNext={goNext} last />;
  } else if (reading.stage === 5 && reading.branch) {
    content = <Finish branch={reading.branch} onRestart={() => changeReading(initialState)} />;
  } else {
    content = <BranchQuestion onBack={goBack} onChoose={(branch) => changeReading({ ...reading, branch, stage: 4 })} />;
  }

  return (
    <main
      className={`letter-app ${reading.opened ? "is-reading" : "is-sealed"} ${transitioning ? "is-transitioning" : ""}`}
      onPointerDown={beginTouch}
      onPointerUp={endTouch}
    >
      <Starfield />
      <div className="edge-coordinate edge-coordinate-left" aria-hidden="true">31°14′ N · 121°29′ E</div>
      <div className="edge-coordinate edge-coordinate-right" aria-hidden="true">A PRIVATE CONSTELLATION</div>
      {reading.opened && reading.stage < 5 && <Progress stage={reading.stage} branch={reading.branch} />}
      <div className="scene-transition" aria-hidden="true" />
      <div className="scene-shell" key={`${reading.opened}-${reading.stage}-${reading.branch ?? "none"}`}>{content}</div>
    </main>
  );
}
