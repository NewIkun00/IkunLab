'use client';

import { CSSProperties, useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';

export type ProjectCategory = '用户体验' | '数字孪生' | 'AI设计工程' | '3D美术视觉品牌' | '独立开发者';

export type Project = {
  title: string;
  tags: string;
  image: string;
  depthImage: string;
  detailImages: string[];
  position: string;
  categories: ProjectCategory[];
};

export function ProjectCard({
  project,
  index,
  onOpen,
  variant = 'default',
}: {
  project: Project;
  index: number;
  onOpen: (project: Project, rect: DOMRect) => void;
  variant?: 'default' | 'related';
}) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const metaRef = useRef<HTMLSpanElement>(null);
  const titleCharacters = Array.from(project.title);
  const isRelated = variant === 'related';

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    let scrambleTimer = 0;
    const startMetaScramble = () => {
      const meta = metaRef.current;
      if (!meta) return;
      window.clearTimeout(scrambleTimer);
      meta.textContent = '';
      const source = project.tags;
      const startedAt = performance.now();
      const charactersPerSecond = 55;
      const randomTailLength = 5;
      const tick = () => {
        const elapsed = (performance.now() - startedAt) / 1000;
        const settledCount = Math.min(source.length, Math.max(0, Math.floor(elapsed * charactersPerSecond) - randomTailLength));
        const visibleCount = Math.min(source.length, Math.floor(elapsed * charactersPerSecond));
        let text = source.slice(0, settledCount);
        for (let characterIndex = settledCount; characterIndex < visibleCount; characterIndex += 1) {
          text += source[characterIndex] === ' '
            ? ' '
            : String.fromCharCode(33 + Math.floor(Math.random() * 93));
        }
        meta.textContent = text;
        if (settledCount < source.length) scrambleTimer = window.setTimeout(tick, 25);
        else meta.textContent = source;
      };
      tick();
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        card.classList.add('in-view');
        card.classList.add('visual-in-view');
        if (!card.classList.contains('text-in-view')) {
          card.classList.add('text-in-view');
          startMetaScramble();
        }
      } else {
        card.classList.remove('text-in-view');
        card.classList.remove('visual-in-view');
        window.clearTimeout(scrambleTimer);
        if (metaRef.current) metaRef.current.textContent = '';
      }
    }, { threshold: 0, rootMargin: '40px 0px' });
    observer.observe(card);
    return () => {
      observer.disconnect();
      window.clearTimeout(scrambleTimer);
    };
  }, [project.tags]);

  return (
    <button ref={cardRef} className={`project-card project-${index + 1}${isRelated ? ' project-card-related' : ''}`} onClick={() => onOpen(project, cardRef.current!.getBoundingClientRect())}>
      <div className="project-card-body">
        <div className="project-image" data-depth={project.depthImage}><img src={project.image} alt="" style={{ objectPosition: project.position }} /></div>
        {!isRelated && (
          <div className="project-meta">
            <span ref={metaRef} className="project-meta-copy" aria-label={project.tags} />
          </div>
        )}
        <div className="project-title-row">
          {!isRelated && <span className="project-title-arrow" aria-hidden="true"><ArrowUpRight /></span>}
          <h3 aria-label={project.title}>
            {titleCharacters.map((character, characterIndex) => {
              const phase = titleCharacters.length > 1
                ? Math.PI / 2 + (characterIndex / (titleCharacters.length - 1)) * Math.PI
                : Math.PI;
              const centerLead = Math.max(0, -Math.cos(phase)) * 30;
              return (
                <span
                  key={`${character}-${characterIndex}`}
                  aria-hidden="true"
                  className="project-title-character"
                  style={{ '--character-index': characterIndex } as CSSProperties}
                >
                  <span
                    className="project-title-track"
                    style={{
                      '--title-intro-delay': `${66 - Math.round(centerLead)}ms`,
                    } as CSSProperties}
                  >
                    {[0, 1, 2, 3].map((copyIndex) => (
                      <span key={copyIndex} className="project-title-glyph">
                        {character === ' ' ? '\u00a0' : character}
                      </span>
                    ))}
                  </span>
                </span>
              );
            })}
          </h3>
        </div>
      </div>
    </button>
  );
}

