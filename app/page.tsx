"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { letterConfig, type InteractionKind } from "./letter-config";

const STORAGE_KEY = "friend-letter-progress-v1";

interface SavedProgress {
  unlocked: boolean;
  visibleSections: number;
  sealed: boolean;
}

const initialProgress: SavedProgress = {
  unlocked: false,
  visibleSections: 1,
  sealed: false,
};

function saveProgress(progress: SavedProgress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // The experience still works when storage is unavailable.
  }
}

async function hashPhrase(value: string) {
  const bytes = new TextEncoder().encode(value.trim());
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function QuietNext({ onClick }: { onClick: () => void }) {
  return (
    <button className="quiet-next" type="button" onClick={onClick}>
      也可以轻点这里继续
      <span aria-hidden="true">→</span>
    </button>
  );
}

function StarInteraction({ onComplete }: { onComplete: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [distance, setDistance] = useState(0);
  const startX = useRef(0);

  const begin = (event: ReactPointerEvent<HTMLButtonElement>) => {
    startX.current = event.clientX;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const move = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    const next = Math.max(0, Math.min(150, event.clientX - startX.current));
    setDistance(next);
    if (next >= 116) {
      setDragging(false);
      onComplete();
    }
  };

  const stop = () => {
    setDragging(false);
    if (distance < 116) setDistance(0);
  };

  return (
    <div className="interaction star-interaction">
      <p className="interaction-kicker">一个小小的动作</p>
      <p className="interaction-title">{letterConfig.sections[0].interactionHint}</p>
      <div className="star-track" aria-hidden="true">
        <span className="star-path" />
        <span className="star-home">✦</span>
      </div>
      <button
        className="draggable-star"
        type="button"
        aria-label="向右拖动星星，开启下一段；也可以按回车直接继续"
        style={{ transform: `translateX(${distance}px)` }}
        onPointerDown={begin}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerCancel={stop}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onComplete();
          }
        }}
      >
        ✦
      </button>
      <QuietNext onClick={onComplete} />
    </div>
  );
}

function BrushInteraction({ onComplete }: { onComplete: () => void }) {
  const [brushing, setBrushing] = useState(false);
  const [progress, setProgress] = useState(8);
  const lastPoint = useRef({ x: 0, y: 0 });

  const begin = (event: ReactPointerEvent<HTMLButtonElement>) => {
    setBrushing(true);
    lastPoint.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const move = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!brushing) return;
    const delta =
      Math.abs(event.clientX - lastPoint.current.x) +
      Math.abs(event.clientY - lastPoint.current.y);
    lastPoint.current = { x: event.clientX, y: event.clientY };
    if (delta < 3) return;
    setProgress((current) => {
      const next = Math.min(100, current + Math.min(18, delta / 2));
      if (next >= 92) window.setTimeout(onComplete, 120);
      return next;
    });
  };

  return (
    <div className="interaction brush-interaction">
      <p className="interaction-kicker">藏在纸纹里的记忆</p>
      <p className="interaction-title">{letterConfig.sections[1].interactionHint}</p>
      <button
        className="brush-surface"
        type="button"
        aria-label="在纸面上来回轻拂，开启下一段；也可以按回车直接继续"
        style={{ "--reveal": `${progress}%` } as React.CSSProperties}
        onPointerDown={begin}
        onPointerMove={move}
        onPointerUp={() => setBrushing(false)}
        onPointerCancel={() => setBrushing(false)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onComplete();
          }
        }}
      >
        <span className="hidden-line">有些记忆，不会被时间带走</span>
        <span className="paper-dust" aria-hidden="true" />
      </button>
      <QuietNext onClick={onComplete} />
    </div>
  );
}

function HoldInteraction({ onComplete }: { onComplete: () => void }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<number | null>(null);

  const start = () => {
    if (holding) return;
    setHolding(true);
    timer.current = window.setTimeout(() => {
      setHolding(false);
      onComplete();
    }, 1100);
  };

  const cancel = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if ((event.key === "Enter" || event.key === " ") && !event.repeat) {
      event.preventDefault();
      start();
    }
  };

  return (
    <div className="interaction hold-interaction">
      <p className="interaction-kicker">留一点时间给这句话</p>
      <p className="interaction-title">{letterConfig.sections[2].interactionHint}</p>
      <button
        className={`light-orb ${holding ? "is-holding" : ""}`}
        type="button"
        aria-label="按住微光一秒钟，开启下一段"
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onKeyDown={handleKeyDown}
        onKeyUp={(event) => {
          if (event.key === "Enter" || event.key === " ") cancel();
        }}
      >
        <span aria-hidden="true" />
      </button>
      <QuietNext onClick={onComplete} />
    </div>
  );
}

function BookmarkInteraction({ onComplete }: { onComplete: () => void }) {
  const [pulling, setPulling] = useState(false);
  const [distance, setDistance] = useState(0);
  const startY = useRef(0);

  const begin = (event: ReactPointerEvent<HTMLButtonElement>) => {
    startY.current = event.clientY;
    setPulling(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const move = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!pulling) return;
    const next = Math.max(0, Math.min(96, event.clientY - startY.current));
    setDistance(next);
    if (next >= 72) {
      setPulling(false);
      onComplete();
    }
  };

  const stop = () => {
    setPulling(false);
    if (distance < 72) setDistance(0);
  };

  return (
    <div className="interaction bookmark-interaction">
      <p className="interaction-kicker">故事还剩一页</p>
      <p className="interaction-title">{letterConfig.sections[3].interactionHint}</p>
      <div className="bookmark-stage">
        <div className="page-edge" aria-hidden="true" />
        <button
          className="bookmark"
          type="button"
          aria-label="向下拉动书签，开启最后一段；也可以按回车直接继续"
          style={{ transform: `translateY(${distance}px)` }}
          onPointerDown={begin}
          onPointerMove={move}
          onPointerUp={stop}
          onPointerCancel={stop}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onComplete();
            }
          }}
        >
          <span>最后一页</span>
        </button>
      </div>
      <QuietNext onClick={onComplete} />
    </div>
  );
}

function SealInteraction({ onComplete }: { onComplete: () => void }) {
  const [pressed, setPressed] = useState(false);
  return (
    <div className="interaction seal-interaction">
      <p className="interaction-kicker">写到这里，刚刚好</p>
      <p className="interaction-title">{letterConfig.sections[4].interactionHint}</p>
      <button
        className={`wax-seal ${pressed ? "is-pressed" : ""}`}
        type="button"
        aria-label="轻点封印，读完这封信"
        onClick={() => {
          setPressed(true);
          window.setTimeout(onComplete, 520);
        }}
      >
        <span aria-hidden="true">友</span>
      </button>
    </div>
  );
}

function SectionInteraction({
  kind,
  onComplete,
}: {
  kind: InteractionKind;
  onComplete: () => void;
}) {
  if (kind === "star") return <StarInteraction onComplete={onComplete} />;
  if (kind === "brush") return <BrushInteraction onComplete={onComplete} />;
  if (kind === "hold") return <HoldInteraction onComplete={onComplete} />;
  if (kind === "bookmark") return <BookmarkInteraction onComplete={onComplete} />;
  return <SealInteraction onComplete={onComplete} />;
}

export default function Home() {
  const [phrase, setPhrase] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [progress, setProgress] = useState<SavedProgress>(initialProgress);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<SavedProgress>;
          setProgress({
            unlocked: Boolean(parsed.unlocked),
            visibleSections: Math.max(
              1,
              Math.min(letterConfig.sections.length, parsed.visibleSections ?? 1),
            ),
            sealed: Boolean(parsed.sealed),
          });
        }
      } catch {
        // Ignore invalid or unavailable local progress.
      } finally {
        setHydrated(true);
      }
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, []);

  const updateProgress = useCallback((next: SavedProgress) => {
    setProgress(next);
    saveProgress(next);
  }, []);

  const unlock = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!phrase.trim()) {
      setError("先写下暗号，再轻轻拆开这封信。");
      return;
    }

    setChecking(true);
    setError("");
    try {
      const digest = await hashPhrase(phrase);
      if (digest !== letterConfig.accessPhraseHash) {
        setError("暗号好像差了一点。再想想那句只有你们知道的话。");
        return;
      }
      updateProgress({ unlocked: true, visibleSections: 1, sealed: false });
      setAnnouncement("暗号正确，信封已经打开。第一段信出现在眼前。");
    } catch {
      setError("浏览器暂时无法验证暗号，请换一个现代浏览器再试。");
    } finally {
      setChecking(false);
    }
  };

  const advance = useCallback(
    (sectionIndex: number) => {
      if (sectionIndex < letterConfig.sections.length - 1) {
        const visibleSections = Math.max(progress.visibleSections, sectionIndex + 2);
        updateProgress({ ...progress, visibleSections });
        setAnnouncement(`第 ${sectionIndex + 2} 段信已经打开。`);
        window.setTimeout(() => {
          document
            .querySelector(`[data-letter-section="${sectionIndex + 1}"]`)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 180);
      } else {
        updateProgress({ ...progress, sealed: true });
        setAnnouncement("这封信已经读完，并被好好收起。");
        window.setTimeout(() => {
          document.getElementById("letter-finish")?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 180);
      }
    },
    [progress, updateProgress],
  );

  const restart = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing else is needed when storage is unavailable.
    }
    setPhrase("");
    setError("");
    setProgress(initialProgress);
    setAnnouncement("阅读进度已经清除，回到信封前。想再读一次时，请重新输入暗号。");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!hydrated) {
    return <main className="loading-view" aria-label="正在取出信件" />;
  }

  return (
    <main className={progress.unlocked ? "night night-reading" : "night"}>
      <div className="stars stars-one" aria-hidden="true" />
      <div className="stars stars-two" aria-hidden="true" />
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {!progress.unlocked ? (
        <section className="cover" aria-labelledby="cover-title">
          <p className="cover-overline">A LETTER FOR A DEAR FRIEND</p>
          <div className="envelope-scene" aria-hidden="true">
            <div className="envelope-shadow" />
            <div className="envelope">
              <div className="envelope-back" />
              <div className="envelope-letter">
                <span>给 {letterConfig.recipient}</span>
              </div>
              <div className="envelope-left" />
              <div className="envelope-right" />
              <div className="envelope-front" />
              <div className="envelope-flap" />
              <div className="cover-seal">友</div>
            </div>
          </div>

          <div className="cover-copy">
            <p className="cover-note">有一封信，在这里等你</p>
            <h1 id="cover-title">写下暗号，再慢慢拆开</h1>
            <p className="cover-intro">
              不必着急。等周围安静一点，再让这些话一页一页出现。
            </p>
          </div>

          <form className="phrase-form" onSubmit={unlock} noValidate>
            <label htmlFor="phrase">我们之间的暗号</label>
            <div className="phrase-row">
              <input
                id="phrase"
                type="password"
                value={phrase}
                onChange={(event) => {
                  setPhrase(event.target.value);
                  if (error) setError("");
                }}
                placeholder="写在这里"
                autoComplete="off"
                aria-describedby="phrase-hint phrase-error"
                aria-invalid={Boolean(error)}
              />
              <button type="submit" disabled={checking}>
                {checking ? "正在确认" : "拆开信封"}
                <span aria-hidden="true">↗</span>
              </button>
            </div>
            <p id="phrase-hint" className="phrase-hint">
              {letterConfig.accessHint} · 分享前请替换
            </p>
            <p id="phrase-error" className="phrase-error" role="alert">
              {error}
            </p>
          </form>
          <p className="privacy-note">暗号只在这台设备上验证 · 不记录任何访问数据</p>
        </section>
      ) : (
        <div className="reading-layout">
          <aside className="reading-progress" aria-label="阅读进度">
            <span className="progress-label">LETTER</span>
            <div className="progress-line" aria-hidden="true">
              <span
                style={{
                  height: `${((progress.visibleSections - 1) / 4) * 100}%`,
                }}
              />
            </div>
            <ol>
              {letterConfig.sections.map((section, index) => (
                <li key={section.id}>
                  <button
                    type="button"
                    disabled={index >= progress.visibleSections}
                    className={index < progress.visibleSections ? "is-visible" : ""}
                    aria-label={`前往第 ${index + 1} 段：${section.title}`}
                    onClick={() =>
                      document
                        .querySelector(`[data-letter-section="${index}"]`)
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    {String(index + 1).padStart(2, "0")}
                  </button>
                </li>
              ))}
            </ol>
          </aside>

          <article className="letter-paper">
            <header className="letter-header">
              <div className="letter-address">
                <span>TO</span>
                <strong>{letterConfig.recipient}</strong>
              </div>
              <div className="letter-mark" aria-hidden="true">
                <span>✦</span>
                <small>PRIVATE NOTE</small>
              </div>
              <p className="letter-date">{letterConfig.date}</p>
              <h1>{letterConfig.title}</h1>
              <p className="letter-preface">{letterConfig.preface}</p>
              <div className="opening-constellation" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
                <span />
              </div>
            </header>

            {letterConfig.sections.map((section, index) => {
              if (index >= progress.visibleSections) return null;
              const interactionComplete =
                index < progress.visibleSections - 1 ||
                (index === letterConfig.sections.length - 1 && progress.sealed);

              return (
                <section
                  className="letter-section"
                  key={section.id}
                  data-letter-section={index}
                  aria-labelledby={`${section.id}-title`}
                >
                  <div className="section-number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <p className="section-label">{section.label}</p>
                  <h2 id={`${section.id}-title`}>{section.title}</h2>
                  <div className="section-copy">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>

                  {!interactionComplete && (
                    <SectionInteraction
                      kind={section.interaction}
                      onComplete={() => advance(index)}
                    />
                  )}

                  {interactionComplete && index < letterConfig.sections.length - 1 && (
                    <div className="opened-marker" aria-label="这一页已经打开">
                      <span aria-hidden="true">✦</span>
                      <span>这一页，已经好好读过</span>
                    </div>
                  )}
                </section>
              );
            })}

            {progress.sealed && (
              <footer className="letter-finish" id="letter-finish">
                <div className="finished-seal" aria-hidden="true">
                  友
                </div>
                <p className="finish-overline">UNTIL WE MEET AGAIN</p>
                <h2>信读完了，故事还会继续</h2>
                <p>
                  愿你抬头时有星光，低头时有路，也一直有可以放心说话的朋友。
                </p>
                <p className="signature">
                  <span>你的朋友</span>
                  <strong>{letterConfig.sender}</strong>
                </p>
                <button className="restart-button" type="button" onClick={restart}>
                  从头再读
                  <span aria-hidden="true">↺</span>
                </button>
              </footer>
            )}
          </article>
        </div>
      )}
    </main>
  );
}
