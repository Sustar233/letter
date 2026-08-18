"use client";

import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  letterContent,
  type EndingKey,
  type PhotoMemory,
} from "../src/content/letter";

type SceneKey = "intro" | "apology" | "calm" | "blessing" | "choice" | "ending-a" | "ending-b";
type TransitionKey = "meteor" | "brighten" | "memory" | "two-stars" | "separate" | "future" | null;

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
    const moodLight = mood === "intro" ? 0.62 : mood === "apology" ? 0.72 : mood === "calm" ? 1.08 : 0.9;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const ceiling = mood === "intro" ? (width < 768 ? 88 : 112) : (width < 768 ? 120 : 170);
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

function useOnceInView<T extends HTMLElement>(threshold = 0.24) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold });
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible] as const;
}

function IntroScene({ onNext }: { onNext: () => void }) {
  const intro = letterContent.intro;
  return (
    <section className="scene intro-scene" aria-labelledby="intro-title">
      <div className="first-star" aria-hidden="true"><i /></div>
      <p className="intro-project">{intro.title}</p>
      <p className="scene-kicker">01 · {intro.time}</p>
      <h1 id="intro-title">{intro.chapter}</h1>
      <p className="intro-subtitle">{intro.subtitle}</p>
      <div className="intro-letter">
        {intro.paragraphs.map((paragraph, index) => {
          const phrase = "全程友情没有变质";
          const parts = paragraph.split(phrase);
          return (
            <div className="intro-paragraph" key={paragraph}>
              <p>
                {parts.length === 2 ? <>{parts[0]}<mark>{phrase}</mark>{parts[1]}</> : paragraph}
              </p>
              {index === 1 && (
                <span className="draft-status" aria-label="第一版已送入碎纸机">
                  <s>第一版</s><i aria-hidden="true" /> <em>已送入碎纸机</em>
                </span>
              )}
            </div>
          );
        })}
      </div>
      <StoryAction onClick={onNext}>{intro.action}</StoryAction>
      <p className="swipe-hint">向上滑动 · 沿着时间继续</p>
    </section>
  );
}

function MemoryStarTrail({ memories }: { memories: typeof letterContent.apology.memories }) {
  const [active, setActive] = useState<number | null>(null);
  const [ref, visible] = useOnceInView<HTMLElement>(0.18);

  return (
    <section
      className={`memory-trail ${visible ? "is-visible" : ""} ${active !== null ? "has-active" : ""}`}
      aria-labelledby="memory-trail-title"
      ref={ref}
    >
      <header className="interaction-heading">
        <span>01 · 时间</span>
        <h2 id="memory-trail-title">那一天的星轨</h2>
        <p>轻触星点，让那一天慢慢亮起来。</p>
      </header>
      <div
        className="memory-track"
        onMouseLeave={() => setActive(null)}
        onPointerDown={(event) => {
          if (!(event.target as HTMLElement).closest("button")) setActive(null);
        }}
      >
        <svg className="memory-path memory-path-desktop" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
          <path pathLength="1" d="M 100 48 C 170 22, 228 84, 300 73 S 430 30, 500 56 S 630 104, 700 82 S 830 22, 900 47" />
        </svg>
        <svg className="memory-path memory-path-mobile" viewBox="0 0 80 360" preserveAspectRatio="none" aria-hidden="true">
          <path pathLength="1" d="M 28 28 C 21 50, 43 74, 40 100 S 17 137, 24 172 S 49 207, 42 244 S 22 282, 31 316" />
        </svg>
        {memories.map((memory, index) => (
          <button
            className={`memory-point ${active === index ? "is-active" : ""} ${memory.detail ? `memory-${memory.detail}` : ""}`}
            type="button"
            aria-expanded={active === index}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            onClick={(event) => {
              const pointerType = (event.nativeEvent as PointerEvent).pointerType;
              setActive((current) => pointerType === "touch" && current === index ? null : index);
            }}
            key={memory.id}
          >
            <span className="memory-node" aria-hidden="true"><i /></span>
            <strong>{memory.label}</strong>
            <span className="memory-point-copy">{memory.text}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ResonanceStars({ similarities, source }: { similarities: typeof letterContent.apology.similarities; source: string }) {
  const [active, setActive] = useState<number | null>(null);
  const [ref, visible] = useOnceInView<HTMLElement>(0.2);
  const desktopPaths = [
    "M 88 210 C 205 42, 420 42, 912 210",
    "M 88 210 C 244 85, 598 18, 912 210",
    "M 88 210 C 275 142, 505 110, 912 210",
    "M 88 210 C 300 204, 615 248, 912 210",
    "M 88 210 C 235 310, 540 336, 912 210",
    "M 88 210 C 250 380, 690 350, 912 210",
  ];
  const mobilePaths = [
    "M 42 48 C 70 96, 206 82, 318 412",
    "M 42 48 C 112 88, 250 130, 318 412",
    "M 42 48 C 94 154, 202 178, 318 412",
    "M 42 48 C 142 188, 246 218, 318 412",
    "M 42 48 C 82 236, 188 292, 318 412",
    "M 42 48 C 122 270, 260 314, 318 412",
  ];

  return (
    <section
      className={`resonance ${visible ? "is-visible" : ""} ${active !== null ? "is-resonating" : ""}`}
      aria-labelledby="resonance-title"
      aria-label={source}
      ref={ref}
    >
      <header className="interaction-heading resonance-heading">
        <span>02 · 关系</span>
        <h2 id="resonance-title">双星共振</h2>
        <p>一些很小的事情，也会让两颗星同时亮一下。</p>
      </header>
      <div
        className="resonance-sky"
        onMouseLeave={() => setActive(null)}
        onPointerDown={(event) => {
          if (!(event.target as HTMLElement).closest("button")) setActive(null);
        }}
      >
        <div className="resonance-star resonance-star-me" aria-hidden="true" key={`me-${active ?? "rest"}`}><i /><span>我</span></div>
        <div className="resonance-star resonance-star-you" aria-hidden="true" key={`you-${active ?? "rest"}`}><i /><span>余音</span></div>
        <svg className="resonance-paths resonance-paths-desktop" viewBox="0 0 1000 420" preserveAspectRatio="none" aria-hidden="true">
          {desktopPaths.map((path, index) => <path className={active === index ? "is-active" : ""} d={path} pathLength="1" key={similarities[index].id} />)}
        </svg>
        <svg className="resonance-paths resonance-paths-mobile" viewBox="0 0 360 460" preserveAspectRatio="none" aria-hidden="true">
          {mobilePaths.map((path, index) => <path className={active === index ? "is-active" : ""} d={path} pathLength="1" key={similarities[index].id} />)}
        </svg>
        <div className="similarity-list">
          {similarities.map((item, index) => (
            <button
              className={active === index ? "is-active" : ""}
              type="button"
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={(event) => {
                const pointerType = (event.nativeEvent as PointerEvent).pointerType;
                setActive((current) => pointerType === "touch" && current === index ? null : index);
              }}
              key={item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function PossibilityBlock({ children }: { children: string }) {
  const [ref, visible] = useOnceInView<HTMLQuoteElement>(0.55);
  return <blockquote className={`possibility-block ${visible ? "is-visible" : ""}`} ref={ref}>{children}</blockquote>;
}

function ApologyEnding({ lead, finalLine }: { lead: readonly string[]; finalLine: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.45 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const secondPartIndex = finalLine.indexOf("失礼了");
  const firstPart = secondPartIndex >= 0 ? finalLine.slice(0, secondPartIndex) : finalLine;
  const secondPart = secondPartIndex >= 0 ? finalLine.slice(secondPartIndex) : "";

  return (
    <div className={`apology-coda ${visible ? "is-visible" : ""}`} ref={ref}>
      {lead.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      <h2><span>{firstPart}</span><span>{secondPart}</span></h2>
    </div>
  );
}

function ApologyScene({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const content = letterContent.apology;
  return (
    <section className="scene apology-scene" aria-labelledby="apology-title">
      <article className="apology-article">
        <div id="apology-title">
        <SceneHeading chapter={content.chapter} time={content.time} />
        </div>
        <section className="letter-section distance-section">
          {content.distance.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>

        <p className="meeting-lead">{content.meetingLead}</p>
        <MemoryStarTrail memories={content.memories} />

        <section className="letter-section reflection-section">
          {content.afterMeeting.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>

        <section className="similarity-intro">
          <p>{content.similarityIntro}</p>
        </section>
        <ResonanceStars similarities={content.similarities} source={content.similaritySource} />
        <p className="resonance-after">{content.afterSimilarity}</p>

        <section className="envy-turn">
          <p>{content.envyTurn[0]}</p>
          <h2>{content.envyTurn[1]}</h2>
        </section>

        <section className="letter-section envy-section">
          <p>{content.envy}</p>
          <PossibilityBlock>{content.possibility}</PossibilityBlock>
        </section>

        <section className="letter-section closing-section">
          {content.closing.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>
        <p className="hope-line">{content.hope}</p>
        <ApologyEnding lead={content.apologyLead} finalLine={content.finalLine} />
      </article>

      <div className="scene-footer apology-footer">
        <button className="story-back" type="button" onClick={onBack}>回到今夜</button>
        <StoryAction onClick={onNext}>{content.action}</StoryAction>
      </div>
    </section>
  );
}

function PhotoCard({
  photo,
  index,
  onOpen,
}: {
  photo: PhotoMemory;
  index: number;
  onOpen: (index: number) => void;
}) {
  return (
    <figure className={`travel-photo photo-${photo.priority}`}>
      <button type="button" onClick={() => onOpen(index)} aria-label={`查看照片 ${index + 1}：${photo.alt}`}>
        <span className="travel-photo-media">
          {photo.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.src} alt={photo.alt} loading={index < 2 ? "eager" : "lazy"} />
          ) : (
            <span className="travel-photo-placeholder" role="img" aria-label={photo.alt}>
              <i aria-hidden="true" />
              <strong>{String(index + 1).padStart(2, "0")}</strong>
              <small>照片待放入</small>
            </span>
          )}
        </span>
      </button>
      <figcaption>
        <span>{photo.date}{photo.location ? ` · ${photo.location}` : ""}</span>
        {photo.tag && <em>{photo.tag}</em>}
        {photo.caption && <p>{photo.caption}</p>}
      </figcaption>
    </figure>
  );
}

function PhotoStoryGroup({
  group,
  photos,
  allPhotos,
  onOpen,
}: {
  group: (typeof letterContent.calm.groups)[number];
  photos: readonly PhotoMemory[];
  allPhotos: readonly PhotoMemory[];
  onOpen: (index: number) => void;
}) {
  const [ref, visible] = useOnceInView<HTMLElement>(0.08);
  const hero = photos.find((photo) => photo.priority === "hero");
  const normal = photos.filter((photo) => photo.priority === "normal");
  const fragments = photos.filter((photo) => photo.priority === "fragment");
  const card = (photo: PhotoMemory) => (
    <PhotoCard
      photo={photo}
      index={allPhotos.findIndex((item) => item.id === photo.id)}
      onOpen={onOpen}
      key={photo.id}
    />
  );

  return (
    <section className={`photo-story-group phase-${group.phase} ${visible ? "is-visible" : ""}`} ref={ref} aria-labelledby={`photo-group-${group.id}`}>
      <header className="photo-group-heading">
        <span>{group.number} / 05</span>
        <h3 id={`photo-group-${group.id}`}>{group.title}</h3>
        <p>{group.note}</p>
      </header>
      {hero && <div className="hero-photo-wrap">{card(hero)}</div>}
      {normal.length > 0 && <div className="photo-pair-grid">{normal.map(card)}</div>}
      {fragments.length > 0 && (
        <div className="photo-filmstrip" aria-label={`${group.title}的旅行碎片`}>
          {fragments.map(card)}
        </div>
      )}
    </section>
  );
}

function AfternoonPause() {
  const content = letterContent.calm.afternoon;
  const [ref, visible] = useOnceInView<HTMLElement>(0.25);
  return (
    <section className={`afternoon-pause ${visible ? "is-visible" : ""}`} ref={ref} aria-labelledby="afternoon-title">
      <div className="auditorium-light" aria-hidden="true"><i /><i /><i /></div>
      <div className="afternoon-copy">
        <p id="afternoon-title">{content.label}<span aria-hidden="true">|</span></p>
        <blockquote>{content.location}</blockquote>
      </div>
    </section>
  );
}

function NightReturn({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const content = letterContent.calm;
  const [ref, visible] = useOnceInView<HTMLElement>(0.22);
  return (
    <section className={`calm-night-return ${visible ? "is-visible" : ""}`} ref={ref} aria-labelledby="night-return-title">
      <div className="night-first-star" aria-hidden="true"><i /></div>
      <div className="night-copy">
        <span>{content.night.label}</span>
        <h3 id="night-return-title">{content.night.title}</h3>
        <p>{content.night.note}</p>
        <button className="night-media-reserve" type="button" disabled aria-label="现场声音素材待补充">
          <i aria-hidden="true" />
          <span>{content.night.media}</span>
        </button>
      </div>
      <div className="next-chapter-reserve">
        <p>{content.nextChapter}</p>
        <div className="scene-footer calm-footer">
          <button className="story-back" type="button" onClick={onBack}>回到那封删掉的信</button>
          <StoryAction onClick={onNext}>{content.action}</StoryAction>
        </div>
      </div>
    </section>
  );
}

function CalmScene({ onNext, onBack, onOpen }: { onNext: () => void; onBack: () => void; onOpen: (index: number) => void }) {
  const content = letterContent.calm;
  return (
    <section className="scene calm-scene" aria-labelledby="calm-title">
      <div className="calm-opening">
        <div className="calm-day-stars" aria-hidden="true"><i /><i /><i /></div>
        <div className="calm-date" aria-label="八月八日，世界之窗">
          <span>08.08</span>
          <small>WINDOW OF THE WORLD</small>
        </div>
        <p className="calm-chapter-no">03</p>
        <SceneHeading chapter={content.chapter} time={content.time} />
        <h2 className="chapter-title" id="calm-title">{content.title}</h2>
        <div className="letter-paragraphs calm-intro-copy">
          {content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <p className="calm-scroll-cue">沿着白昼继续</p>
      </div>
      <div className="photo-story">
        {content.groups.map((group) => (
          <PhotoStoryGroup
            group={group}
            photos={content.photos.filter((photo) => photo.group === group.id)}
            allPhotos={content.photos}
            onOpen={onOpen}
            key={group.id}
          />
        ))}
      </div>
      <AfternoonPause />
      <section className="calm-reflection" aria-labelledby="reflection-title">
        <span>REFLECTION</span>
        <h3 id="reflection-title">停下来以后</h3>
        {content.reflection.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </section>
      <div className="sunset-bridge" aria-hidden="true"><i /></div>
      <NightReturn onBack={onBack} onNext={onNext} />
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
  const coarse = useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia("(pointer: coarse)");
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(pointer: coarse)").matches,
    () => false,
  );

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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onStep(-1);
      if (event.key === "ArrowRight") onStep(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, onStep]);

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
          {photo.caption && <p>{photo.caption}</p>}
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
    window.scrollTo({ top: 0, behavior: "instant" });
    const timer = window.setTimeout(() => setLoaded(true), 650);
    const debugEnding = new URLSearchParams(window.location.search).get("ending");
    const debugScene = new URLSearchParams(window.location.search).get("scene");
    const debugTimer = window.setTimeout(() => {
      if (debugScene === "calm") setScene("calm");
      else if (debugEnding === "a" || debugEnding === "b") setScene(`ending-${debugEnding}`);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(debugTimer);
    };
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
