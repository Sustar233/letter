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
  letterContent,
  type EndingKey,
  type PhotoMemory,
} from "../src/content/letter";

type SceneKey = "intro" | "apology" | "calm" | "blessing" | "choice" | "ending-a" | "ending-b";
type TransitionKey = "meteor" | "brighten" | "memory" | "two-stars" | "separate" | "future" | null;

const PHOTO_POSITIONS = [
  { x: "18%", y: "28%" },
  { x: "69%", y: "19%" },
  { x: "77%", y: "68%" },
  { x: "31%", y: "76%" },
];

type CanvasStar = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  phase: number;
  speed: number;
  depth: number;
  warm: boolean;
};

function StarField({ mood }: { mood: SceneKey }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    let width = 0;
    let height = 0;
    let frame = 0;
    let stars: CanvasStar[] = [];
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const moodLight = mood === "apology" ? 0.68 : mood === "calm" ? 1.08 : 0.9;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const ceiling = width < 768 ? 120 : 170;
      const count = Math.max(82, Math.min(ceiling, Math.round((width * height) / 8200)));
      stars = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: index % 19 === 0 ? 1.55 : 0.38 + Math.random() * 0.8,
        opacity: (0.36 + Math.random() * 0.42) * moodLight,
        phase: Math.random() * Math.PI * 2,
        speed: 0.00022 + Math.random() * 0.00034,
        depth: index % 10 === 0 ? 1 : index % 3 === 0 ? 0.64 : 0.32,
        warm: index % 37 === 0,
      }));
    };

    const move = (event: PointerEvent) => {
      if (coarsePointer || reducedMotion) return;
      pointer.targetX = (event.clientX / width - 0.5) * 28;
      pointer.targetY = (event.clientY / height - 0.5) * 22;
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      pointer.x += (pointer.targetX - pointer.x) * 0.025;
      pointer.y += (pointer.targetY - pointer.y) * 0.025;
      for (const star of stars) {
        const pulse = reducedMotion ? 0 : Math.sin(time * star.speed + star.phase) * 0.12;
        context.beginPath();
        context.fillStyle = star.warm
          ? `rgba(255, 239, 214, ${Math.max(0.18, star.opacity + pulse)})`
          : `rgba(224, 233, 255, ${Math.max(0.18, star.opacity + pulse)})`;
        context.arc(
          star.x + pointer.x * star.depth,
          star.y + pointer.y * star.depth,
          star.radius * (0.72 + star.depth * 0.36),
          0,
          Math.PI * 2,
        );
        context.fill();
      }
      frame = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    frame = window.requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.cancelAnimationFrame(frame);
    };
  }, [mood]);

  return <canvas ref={canvasRef} className="star-canvas" aria-hidden="true" />;
}

function Timeline({ active }: { active: number }) {
  return (
    <aside className="timeline" aria-label="故事时间">
      <ol>
        {letterContent.timeline.map((label, index) => (
          <li className={index === active ? "is-current" : index < active ? "is-past" : ""} key={label}>
            <i aria-hidden="true" />
            <span>{label}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function SceneHeading({ chapter, time }: { chapter: string; time: string }) {
  return (
    <header className="scene-heading">
      <p>{time}</p>
      <h1>{chapter}</h1>
    </header>
  );
}

function StoryAction({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button className="story-button" type="button" onClick={onClick}>
      <span>{children}</span>
      <i aria-hidden="true">✦</i>
    </button>
  );
}

function IntroScene({ onNext }: { onNext: () => void }) {
  const intro = letterContent.intro;
  return (
    <section className="scene intro-scene" aria-labelledby="intro-title">
      <div className="first-star" aria-hidden="true"><i /></div>
      <p className="scene-kicker">{intro.chapter} · {intro.time}</p>
      <h1 id="intro-title">{intro.title}</h1>
      <p className="intro-subtitle">{intro.subtitle}</p>
      <div className="intro-rule" aria-hidden="true"><i /></div>
      <p className="intro-note">{intro.note}</p>
      <StoryAction onClick={onNext}>{intro.action}</StoryAction>
      <p className="swipe-hint">向上滑动 · 沿着时间继续</p>
    </section>
  );
}

function ApologyScene({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const content = letterContent.apology;
  return (
    <section className="scene reading-scene apology-scene" aria-labelledby="apology-title">
      <div className="reading-copy">
        <SceneHeading chapter={content.chapter} time={content.time} />
        <p className="chapter-opening" id="apology-title">{content.opening}</p>
        <div className="deleted-letter" aria-hidden="true">
          <span>写下来的话在这里停了一会儿</span>
          <span>有些句子还没有找到合适的位置</span>
          <span>光标闪烁，字迹又慢慢退回夜里</span>
          <i />
        </div>
        <p className="deleted-note">{content.deletedNote}</p>
        <div className="letter-paragraphs">
          {content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </div>
      <div className="scene-footer">
        <button className="story-back" type="button" onClick={onBack}>回到今夜</button>
        <StoryAction onClick={onNext}>{content.action}</StoryAction>
      </div>
    </section>
  );
}

function PhotoMap({ photos, onOpen }: { photos: readonly PhotoMemory[]; onOpen: (index: number) => void }) {
  return (
    <div className="photo-map" aria-label="世界之窗照片星图">
      <div className="photo-orbit orbit-one" aria-hidden="true" />
      <div className="photo-orbit orbit-two" aria-hidden="true" />
      {photos.map((photo, index) => (
        <button
          className="photo-star"
          style={{ "--x": PHOTO_POSITIONS[index].x, "--y": PHOTO_POSITIONS[index].y } as CSSProperties}
          type="button"
          onClick={() => onOpen(index)}
          aria-label={`打开照片 ${index + 1}：${photo.alt}`}
          key={`${photo.alt}-${index}`}
        >
          <i aria-hidden="true" />
          <span>{String(index + 1).padStart(2, "0")}</span>
        </button>
      ))}
      <p>轻触更亮的星</p>
    </div>
  );
}

function CalmScene({ onNext, onBack, onOpen }: { onNext: () => void; onBack: () => void; onOpen: (index: number) => void }) {
  const content = letterContent.calm;
  return (
    <section className="scene reading-scene calm-scene" aria-labelledby="calm-title">
      <div className="scene-split">
        <div className="reading-copy">
          <SceneHeading chapter={content.chapter} time={content.time} />
          <h2 className="chapter-title" id="calm-title">{content.title}</h2>
          <div className="letter-paragraphs">
            {content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
        <PhotoMap photos={content.photos} onOpen={onOpen} />
      </div>
      <div className="scene-footer">
        <button className="story-back" type="button" onClick={onBack}>回到那封删掉的信</button>
        <StoryAction onClick={onNext}>{content.action}</StoryAction>
      </div>
    </section>
  );
}

function BlessingScene({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const content = letterContent.blessing;
  const [active, setActive] = useState(0);
  const [visited, setVisited] = useState(() => new Set([0]));

  const select = (index: number) => {
    setActive(index);
    setVisited((current) => new Set(current).add(index));
  };

  const complete = visited.size === content.items.length;
  return (
    <section className="scene blessing-scene" aria-labelledby="blessing-title">
      <div className="blessing-layout">
        <div className="reading-copy">
          <SceneHeading chapter={content.chapter} time={content.time} />
          <h2 className="chapter-title" id="blessing-title">{content.title}</h2>
          <div className="blessing-copy" aria-live="polite">
            <span>{String(active + 1).padStart(2, "0")}</span>
            <h3>{content.items[active].label}</h3>
            <p>{content.items[active].caption}</p>
          </div>
        </div>
        <div className="blessing-stars" role="tablist" aria-label="三份祝愿">
          {content.items.map((item, index) => (
            <button
              className={active === index ? "is-active" : ""}
              type="button"
              role="tab"
              aria-selected={active === index}
              onClick={() => select(index)}
              key={item.label}
            >
              <i aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          ))}
          <div className="blessing-track" aria-hidden="true" />
        </div>
      </div>
      <div className="scene-footer">
        <button className="story-back" type="button" onClick={onBack}>回到世界之窗</button>
        <div className="blessing-next">
          {!complete && <small>再读完 {content.items.length - visited.size} 颗星</small>}
          <StoryAction onClick={complete ? onNext : () => select((active + 1) % content.items.length)}>
            {complete ? content.action : "读下一颗星"}
          </StoryAction>
        </div>
      </div>
    </section>
  );
}

function ChoiceScene({ onChoose, onBack }: { onChoose: (ending: EndingKey) => void; onBack: () => void }) {
  const content = letterContent.choice;
  const [selected, setSelected] = useState<EndingKey | null>(null);
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const activate = (key: EndingKey) => {
    if (!coarse) {
      onChoose(key);
      return;
    }
    if (selected === key) onChoose(key);
    else setSelected(key);
  };

  return (
    <section className={`scene choice-scene ${selected ? `has-choice choice-${selected}` : ""}`} aria-labelledby="choice-title">
      <header className="choice-heading">
        <p>{content.time}</p>
        <h1 id="choice-title">{content.title}</h1>
        <h2>{content.subtitle}</h2>
      </header>
      <div className="choice-system">
        <div className="choice-track" aria-hidden="true"><i /></div>
        {(Object.keys(content.options) as EndingKey[]).map((key) => {
          const option = content.options[key];
          return (
            <button
              className={`choice-option choice-option-${key} ${selected === key ? "is-selected" : ""}`}
              type="button"
              onClick={() => activate(key)}
              onMouseEnter={() => !coarse && setSelected(key)}
              onFocus={() => setSelected(key)}
              aria-label={`${option.label}。${option.lines.join("")}`}
              key={key}
            >
              <span className="choice-star" aria-hidden="true"><i /></span>
              <span className="choice-copy">
                <small>{key === "a" ? "A · 告别篇" : "B · 展望篇"}</small>
                <strong>{option.label}</strong>
                {option.lines.map((line) => <em key={line}>{line}</em>)}
              </span>
            </button>
          );
        })}
      </div>
      {coarse && selected && (
        <button className="choice-confirm" type="button" onClick={() => onChoose(selected)}>
          选择这颗星
        </button>
      )}
      <button className="story-back choice-back" type="button" onClick={onBack}>回到三颗祝愿</button>
    </section>
  );
}

function EndingScene({ ending, onRestart, onBack }: { ending: EndingKey; onRestart: () => void; onBack: () => void }) {
  const content = letterContent.endings[ending];
  return (
    <section className={`scene ending-scene ending-${ending}`} aria-labelledby="ending-title">
      <div className="ending-sky" aria-hidden="true">
        <div className="ending-trail trail-a" />
        <div className="ending-trail trail-b" />
        <i className="ending-star ending-star-a" />
        <i className="ending-star ending-star-b" />
      </div>
      <div className="ending-copy">
        <SceneHeading chapter={content.chapter} time={content.time} />
        <h2 id="ending-title">{content.title}</h2>
        <div className="letter-paragraphs">
          {content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <p className="ending-closing">{content.closing}</p>
        <div className="ending-actions">
          <button className="story-back" type="button" onClick={onBack}>重新选择</button>
          <button className="restart-button" type="button" onClick={onRestart}>再看一次星空 <i aria-hidden="true">↺</i></button>
        </div>
      </div>
    </section>
  );
}

function PhotoModal({ photo, index, total, onClose, onStep }: { photo: PhotoMemory; index: number; total: number; onClose: () => void; onStep: (direction: number) => void }) {
  const startX = useRef(0);
  const onStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    startX.current = event.clientX;
  };
  const onEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const delta = event.clientX - startX.current;
    if (event.pointerType === "touch" && Math.abs(delta) > 55) onStep(delta < 0 ? 1 : -1);
  };

  return (
    <div className="photo-modal" role="dialog" aria-modal="true" aria-label={`照片 ${index + 1} / ${total}`} onPointerDown={onStart} onPointerUp={onEnd}>
      <button className="modal-close" type="button" onClick={onClose} aria-label="关闭照片">×</button>
      <button className="modal-step modal-prev" type="button" onClick={() => onStep(-1)} aria-label="上一张照片">‹</button>
      <figure>
        <div className="photo-frame">
          {photo.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.src} alt={photo.alt} loading="lazy" />
          ) : (
            <div className="photo-placeholder" role="img" aria-label={photo.alt}>
              <i aria-hidden="true" />
              <span>请将照片放入 public/memories</span>
            </div>
          )}
        </div>
        <figcaption>
          <span>{photo.date}{photo.location ? ` · ${photo.location}` : ""}</span>
          <p>{photo.caption}</p>
          <small>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</small>
        </figcaption>
      </figure>
      <button className="modal-step modal-next" type="button" onClick={() => onStep(1)} aria-label="下一张照片">›</button>
    </div>
  );
}

function AmbientAudio() {
  return <button className="audio-reserve" type="button" disabled aria-label="声音功能已预留，当前没有音频">声音 · 未启用</button>;
}

export default function Home() {
  const [scene, setScene] = useState<SceneKey>("intro");
  const [loaded, setLoaded] = useState(false);
  const [transition, setTransition] = useState<TransitionKey>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const touchStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 650);
    const debugEnding = new URLSearchParams(window.location.search).get("ending");
    if (debugEnding === "a" || debugEnding === "b") setScene(`ending-${debugEnding}`);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scene !== "apology") return;
    for (const photo of letterContent.calm.photos) {
      if (photo.src) {
        const image = new Image();
        image.src = photo.src;
      }
    }
  }, [scene]);

  const go = useCallback((next: SceneKey, kind: Exclude<TransitionKey, null>) => {
    if (transitioning) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTransition(kind);
    setTransitioning(true);
    window.setTimeout(() => {
      setScene(next);
      setPhotoIndex(null);
      window.scrollTo({ top: 0, behavior: "instant" });
    }, reduced ? 20 : 640);
    window.setTimeout(() => setTransitioning(false), reduced ? 40 : 1080);
    window.setTimeout(() => setTransition(null), reduced ? 50 : 1600);
  }, [transitioning]);

  const choose = useCallback((ending: EndingKey) => {
    try {
      window.localStorage.setItem("starLetterEnding", ending.toUpperCase());
    } catch {
      // The story remains usable if local storage is unavailable.
    }
    const url = new URL(window.location.href);
    url.searchParams.set("ending", ending);
    window.history.replaceState({}, "", url);
    go(`ending-${ending}`, ending === "a" ? "separate" : "future");
  }, [go]);

  const restart = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("ending");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    go("intro", "memory");
  }, [go]);

  const advance = useCallback(() => {
    if (photoIndex !== null) return;
    if (scene === "intro") go("apology", "meteor");
    else if (scene === "apology") go("calm", "brighten");
    else if (scene === "calm") go("blessing", "memory");
    else if (scene === "blessing") go("choice", "two-stars");
  }, [go, photoIndex, scene]);

  const beginTouch = (event: ReactPointerEvent<HTMLElement>) => {
    touchStart.current = { x: event.clientX, y: event.clientY };
  };

  const endTouch = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "touch" || photoIndex !== null || (event.target as HTMLElement).closest("button")) return;
    const deltaX = event.clientX - touchStart.current.x;
    const deltaY = event.clientY - touchStart.current.y;
    if (deltaY < -72 && Math.abs(deltaY) > Math.abs(deltaX)) advance();
  };

  const activeTime = scene === "intro" ? 0 : scene === "apology" ? 1 : scene === "calm" ? 2 : scene === "blessing" ? 3 : 4;
  const sceneContent = scene === "intro" ? (
    <IntroScene onNext={() => go("apology", "meteor")} />
  ) : scene === "apology" ? (
    <ApologyScene onBack={() => go("intro", "memory")} onNext={() => go("calm", "brighten")} />
  ) : scene === "calm" ? (
    <CalmScene onBack={() => go("apology", "memory")} onNext={() => go("blessing", "memory")} onOpen={setPhotoIndex} />
  ) : scene === "blessing" ? (
    <BlessingScene onBack={() => go("calm", "memory")} onNext={() => go("choice", "two-stars")} />
  ) : scene === "choice" ? (
    <ChoiceScene onBack={() => go("blessing", "memory")} onChoose={choose} />
  ) : (
    <EndingScene ending={scene === "ending-a" ? "a" : "b"} onBack={() => go("choice", "two-stars")} onRestart={restart} />
  );

  return (
    <main
      className={`letter-app scene-${scene} ${loaded ? "is-loaded" : "is-loading"} ${transitioning ? "is-transitioning" : ""}`}
      onPointerDown={beginTouch}
      onPointerUp={endTouch}
    >
      <StarField mood={scene} />
      <div className="sky-wash" aria-hidden="true" />
      <div className="cloud cloud-one" aria-hidden="true" />
      <div className="cloud cloud-two" aria-hidden="true" />
      <Timeline active={activeTime} />
      <AmbientAudio />

      <div className={`transition-layer ${transition ? `transition-${transition}` : ""}`} aria-hidden="true">
        <i /><span /><b />
      </div>

      <div className="scene-shell" key={scene}>{sceneContent}</div>

      <div className="loading-mark" aria-live="polite">
        <i aria-hidden="true" />
        <span>星光正在抵达。</span>
      </div>

      {photoIndex !== null && (
        <PhotoModal
          photo={letterContent.calm.photos[photoIndex]}
          index={photoIndex}
          total={letterContent.calm.photos.length}
          onClose={() => setPhotoIndex(null)}
          onStep={(direction) => setPhotoIndex((current) => current === null ? 0 : (current + direction + letterContent.calm.photos.length) % letterContent.calm.photos.length)}
        />
      )}
    </main>
  );
}
