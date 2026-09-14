'use client';

import { CSSProperties, useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';

export type ProjectCategory = '用户体验' | '数字孪生' | 'AI设计工程' | '3D美术视觉品牌' | '独立开发者';

export type Project = {
  title: string;
  tags: string;
  image: string;
  position: string;
  categories: ProjectCategory[];
};

export function ProjectCard({ project, index, onOpen }: { project: Project; index: number; onOpen: (project: Project, rect: DOMRect) => void }) {
  const cardRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        card.classList.add('in-view');
        observer.disconnect();
      }
    }, { threshold: .16 });
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <button ref={cardRef} className={`project-card project-${index + 1}`} onClick={() => onOpen(project, cardRef.current!.getBoundingClientRect())}>
      <div className="project-card-body">
        <div className="project-image" data-depth="/images/project-parallax-depth.png"><img src={project.image} alt="" style={{ objectPosition: project.position }} /></div>
        <div className="project-meta"><span>{project.tags}</span></div>
        <div className="project-title-row">
          <span className="project-title-arrow" aria-hidden="true"><ArrowUpRight /></span>
          <h3 aria-label={project.title}>
            {Array.from(project.title).map((character, characterIndex) => (
              <span
                key={`${character}-${characterIndex}`}
                aria-hidden="true"
                className="project-title-character"
                style={{ '--character-index': characterIndex } as CSSProperties}
              >
                {character === ' ' ? '\u00a0' : character}
              </span>
            ))}
          </h3>
        </div>
      </div>
    </button>
  );
}
