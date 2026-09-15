'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { PhysicsHero } from '@/components/physics-hero';
import { LiquidMetalButton } from '@/components/liquid-metal-button';
import { Project, ProjectCard, ProjectCategory } from '@/components/project-card';
import { ProjectCurveField } from '@/components/project-curve-field';
import { RippleField } from '@/components/ripple-field';

const projectData: Project[] = [
  { title: 'Signal / 01', tags: 'ART DIRECTION • WEB • 3D', image: '/images/project-glass.png', position: 'center', categories: ['AI设计工程', '独立开发者'] },
  { title: 'Matter Study', tags: 'INTERACTION • MOTION • CGI', image: '/images/hero-forms.png', position: '52% 45%', categories: ['3D美术视觉品牌'] },
  { title: 'Blue Hour', tags: 'IDENTITY • DIGITAL • EXPERIENCE', image: '/images/project-glass.png', position: '72% center', categories: ['用户体验'] },
  { title: 'Form & Flow', tags: 'CONCEPT • DESIGN • DEVELOPMENT', image: '/images/hero-forms.png', position: '28% 60%', categories: ['数字孪生'] },
  { title: 'Spatial Signal', tags: 'UX • SYSTEM • PROTOTYPE', image: '/images/project-glass.png', position: '32% center', categories: ['用户体验', '数字孪生'] },
  { title: 'Synthetic Nature', tags: 'GENERATIVE • MOTION • 3D', image: '/images/hero-forms.png', position: '68% 42%', categories: ['AI设计工程', '3D美术视觉品牌'] },
  { title: 'Parallel Field', tags: 'DIGITAL TWIN • DATA • WEBGL', image: '/images/project-glass.png', position: '18% 55%', categories: ['数字孪生'] },
  { title: 'Future Archive', tags: 'EXPERIENCE • IDENTITY • AI', image: '/images/hero-forms.png', position: '82% 58%', categories: ['用户体验', 'AI设计工程'] },
  { title: 'Machine Poetry', tags: 'AI • CREATIVE CODE • VISUAL', image: '/images/project-glass.png', position: '58% 38%', categories: ['AI设计工程', '独立开发者'] },
  { title: 'Living Interface', tags: 'PRODUCT • MOTION • INTERACTION', image: '/images/hero-forms.png', position: '38% 64%', categories: ['用户体验'] },
  { title: 'Material Memory', tags: 'LOOKDEV • CGI • ART DIRECTION', image: '/images/project-glass.png', position: '78% 48%', categories: ['3D美术视觉品牌'] },
  { title: 'Independent / 12', tags: 'DESIGN • CODE • EXPERIMENT', image: '/images/hero-forms.png', position: '22% 46%', categories: ['独立开发者'] },
];

const projects: Project[] = projectData.map((project) => ({
  ...project,
  image: '/images/project-parallax-color.png',
  position: '50% 50%',
}));

const workCategories = ['全部', '用户体验', '数字孪生', 'AI设计工程', '3D美术视觉品牌', '独立开发者'] as const;
type WorkCategory = '全部' | ProjectCategory;
const detailSections = [
  { id: 'case-home', label: '首页', image: null, alt: '项目封面' },
  { id: 'case-research', label: '用户研究', image: '/images/project-parallax-depth.png', alt: '用户研究视觉' },
  { id: 'case-analysis', label: '分析', image: '/images/project-parallax-color.png', alt: '项目分析视觉' },
  { id: 'case-conclusion', label: '设计结论', image: '/images/hero-forms.png', alt: '设计结论视觉' },
  { id: 'case-result', label: '设计结果', image: '/images/project-glass.png', alt: '设计结果视觉' },
] as const;

function DetailMedia({ src, alt }: { src: string; alt: string }) {
  const isVideo = /\.(mp4|webm|mov)$/i.test(src);
  return (
    <div className="detail-media-frame" data-detail-media>
      {isVideo ? (
        <video src={src} aria-label={alt} autoPlay muted loop playsInline />
      ) : (
        <img src={src} alt={alt} />
      )}
    </div>
  );
}

function RevealText({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span
      className="reveal-text"
      data-reveal-text
      aria-label={text}
    >
      {Array.from(text).map((character, index) => (
        <span
          key={`${character}-${index}`}
          aria-hidden="true"
          className={`reveal-character${character === ' ' ? ' reveal-space' : ''}`}
          style={{ '--reveal-char-delay': `${delay + index * 28}ms` } as CSSProperties}
        >
          {character === ' ' ? '\u00a0' : character}
        </span>
      ))}
    </span>
  );
}

export default function Home() {
  const detailRef = useRef<HTMLElement>(null);
  const workSectionRef = useRef<HTMLElement>(null);
  const tabsStickyRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const scrollThumbRef = useRef<HTMLSpanElement>(null);
  const scrollIdleTimerRef = useRef<number | null>(null);
  const [transition, setTransition] = useState<{ project: Project; rect: DOMRect; expanding: boolean } | null>(null);
  const [detail, setDetail] = useState<Project | null>(null);
  const [activeDetailSection, setActiveDetailSection] = useState('case-home');
  const [activeCategory, setActiveCategory] = useState<WorkCategory>('全部');
  const [tabsPinned, setTabsPinned] = useState(false);
  const visibleProjects = activeCategory === '全部'
    ? projects
    : projects.filter((project) => project.categories.includes(activeCategory));
  const relatedProjects = detail
    ? projects
      .filter((project) => project.title !== detail.title && project.categories.some((category) => detail.categories.includes(category)))
      .slice(0, 3)
    : [];

  useEffect(() => {
    let frame = 0;
    const updateTabsPosition = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const workSection = workSectionRef.current;
        const stickyRegion = tabsStickyRef.current;
        if (!workSection || !stickyRegion) return;
        const stickyRect = stickyRegion.getBoundingClientRect();
        const workRect = workSection.getBoundingClientRect();
        const nextPinned = stickyRect.top <= 16 && workRect.bottom > stickyRect.height + 32;
        setTabsPinned((current) => current === nextPinned ? current : nextPinned);
      });
    };
    updateTabsPosition();
    window.addEventListener('scroll', updateTabsPosition, { passive: true });
    window.addEventListener('resize', updateTabsPosition);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateTabsPosition);
      window.removeEventListener('resize', updateTabsPosition);
    };
  }, []);

  useEffect(() => {
    const updateScrollIndicator = () => {
      const detailRoot = detailRef.current;
      const scrollTop = detailRoot ? detailRoot.scrollTop : window.scrollY;
      const scrollHeight = detailRoot ? detailRoot.scrollHeight : document.documentElement.scrollHeight;
      const clientHeight = detailRoot ? detailRoot.clientHeight : window.innerHeight;
      const scrollRange = Math.max(scrollHeight - clientHeight, 1);
      const progress = Math.min(Math.max(scrollTop / scrollRange, 0), 1);
      const track = scrollIndicatorRef.current;
      const thumb = scrollThumbRef.current;
      if (track && thumb) {
        const travel = Math.max(track.clientHeight - thumb.clientHeight, 0);
        thumb.style.setProperty('--scroll-y', `${progress * travel}px`);
      }
    };

    const onScroll = () => {
      updateScrollIndicator();
    };
    const onWheel = () => {
      scrollIndicatorRef.current?.classList.add('is-visible');
      if (scrollIdleTimerRef.current !== null) window.clearTimeout(scrollIdleTimerRef.current);
      scrollIdleTimerRef.current = window.setTimeout(() => {
        scrollIndicatorRef.current?.classList.remove('is-visible');
      }, 1050);
    };
    const scrollTarget: Window | HTMLElement = detailRef.current ?? window;
    updateScrollIndicator();
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    scrollTarget.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      scrollTarget.removeEventListener('scroll', onScroll);
      scrollTarget.removeEventListener('wheel', onWheel);
      if (scrollIdleTimerRef.current !== null) window.clearTimeout(scrollIdleTimerRef.current);
    };
  }, [detail]);

  useEffect(() => {
    if (!detail) return;
    setActiveDetailSection('case-home');
    const root = document.querySelector<HTMLElement>('.project-detail');
    if (!root) return;
    const sections = detailSections
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveDetailSection(visible.target.id);
    }, { root, rootMargin: '-22% 0px -58% 0px', threshold: [0, .15, .35, .6] });
    sections.forEach((section) => observer.observe(section));

    const mediaObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { root, rootMargin: '0px 0px -8% 0px', threshold: .12 });
    root.querySelectorAll<HTMLElement>('[data-detail-media]').forEach((media) => mediaObserver.observe(media));
    return () => {
      observer.disconnect();
      mediaObserver.disconnect();
    };
  }, [detail]);

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal-text]'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: .55, rootMargin: '0px 0px -4% 0px' });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  const openProject = (project: Project, rect: DOMRect) => {
    setTransition({ project, rect, expanding: false });
    requestAnimationFrame(() => requestAnimationFrame(() => setTransition((current) => current ? { ...current, expanding: true } : null)));
    window.setTimeout(() => {
      setDetail(project);
      setTransition(null);
      document.body.style.overflow = 'hidden';
      window.requestAnimationFrame(() => detailRef.current?.scrollTo({ top: 0 }));
    }, 820);
  };

  const returnHome = () => {
    setDetail(null);
    document.body.style.overflow = '';
    history.replaceState(null, '', '#top');
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const scrollToDetailSection = (id: string) => {
    setActiveDetailSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="site-shell">
      {!detail && <RippleField />}
      <ProjectCurveField />
      <div ref={scrollIndicatorRef} aria-hidden="true" className={`scroll-indicator${detail ? ' is-detail' : ''}`}>
        <span ref={scrollThumbRef} />
      </div>

      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Back to top">Ikun LAB</a>
      </header>

      <section id="top" className="hero">
        <div className="hero-heading">
          <h1><RevealText text="Hi，我是Ikun" /></h1>
          <p><RevealText text="AI、全栈体验设计、技术美术、独立开发者" delay={150} /></p>
          <LiquidMetalButton href="#work">查看作品</LiquidMetalButton>
        </div>
        <div className="hero-visual"><PhysicsHero /></div>
        <button className="scroll-cue" onClick={() => document.querySelector('#work')?.scrollIntoView({ behavior: 'smooth' })}><Plus size={18} /><span>继续下潜，查看作品案例</span><Plus size={18} /></button>
      </section>

      <section ref={workSectionRef} id="work" className="work-section">
        <div className="section-heading"><div><span className="eyebrow"><RevealText text="SELECTED WORK / 2022—26" /></span><h2><RevealText text="作品案例" delay={120} /></h2></div><p><RevealText text="只因你太美，Because You Are So Beautiful" delay={240} /></p></div>
        <div ref={tabsStickyRef} className={`work-tabs-sticky${tabsPinned ? ' is-pinned' : ''}`}>
          <div className="work-tabs" role="tablist" aria-label="作品分类">
            {workCategories.map((category) => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={activeCategory === category}
                aria-controls="project-grid"
                className={activeCategory === category ? 'is-active' : ''}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <div id="project-grid" className="project-grid">
          {visibleProjects.map((project) => {
            const projectIndex = projects.findIndex((item) => item.title === project.title);
            return <ProjectCard key={project.title} project={project} index={projectIndex} onOpen={openProject} />;
          })}
        </div>
      </section>

      <footer><div className="footer-top"><a href="mailto:hello@yourname.com">hello@yourname.com</a><div><span>SOCIAL</span><a href="#">Instagram</a><a href="#">LinkedIn</a><a href="#">Are.na</a></div><div><span>LOCATION</span><p>Shanghai / Everywhere<br />UTC +8</p></div></div><div className="footer-bottom"><span>©2026 YOUR—NAME</span><span>DESIGN + CODE WITH CARE</span><a href="#top">BACK TO TOP ↑</a></div></footer>

      {transition && <div className={`project-transition ${transition.expanding ? 'is-expanding' : ''}`} style={{ '--from-x': `${transition.rect.left}px`, '--from-y': `${transition.rect.top}px`, '--from-w': `${transition.rect.width}px`, '--from-h': `${transition.rect.height}px`, '--transition-image': `url(${transition.project.image})` } as React.CSSProperties} />}
      {detail && (
        <aside ref={detailRef} className="project-detail" aria-label={`${detail.title} 作品详情`}>
          <button className="project-detail-home" type="button" onClick={returnHome}>
            <ArrowLeft aria-hidden="true" />
            <span>返回首页</span>
          </button>
          <div className="detail-layout">
            <nav className="detail-anchor" aria-label="作品章节导航">
              {detailSections.map((section, index) => (
                <button
                  key={section.id}
                  type="button"
                  className={activeDetailSection === section.id ? 'is-active' : ''}
                  aria-current={activeDetailSection === section.id ? 'location' : undefined}
                  onClick={() => scrollToDetailSection(section.id)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {section.label}
                </button>
              ))}
            </nav>
            <article className="detail-content">
              {detailSections.map((section) => (
                <section key={section.id} id={section.id} className="detail-media-section">
                  <DetailMedia
                    src={section.image ?? detail.image}
                    alt={`${detail.title} ${section.alt}`}
                  />
                </section>
              ))}
              {relatedProjects.length > 0 && (
                <section className="detail-related" aria-labelledby="related-projects-title">
                  <div className="detail-related-heading">
                    <p>MORE IN THIS FIELD</p>
                    <h2 id="related-projects-title">更多同类作品</h2>
                    <span>{detail.categories.join(' · ')}</span>
                  </div>
                  <div className="detail-related-grid">
                    {relatedProjects.map((project) => {
                      const projectIndex = projects.findIndex((item) => item.title === project.title);
                      return <ProjectCard key={project.title} project={project} index={projectIndex} onOpen={openProject} />;
                    })}
                  </div>
                </section>
              )}
            </article>
          </div>
        </aside>
      )}
    </main>
  );
}

