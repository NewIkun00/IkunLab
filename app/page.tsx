'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowUpRight, Maximize2, Minimize2, Plus } from 'lucide-react';
import { PhysicsHero } from '@/components/physics-hero';
import { LiquidMetalButton } from '@/components/liquid-metal-button';
import { Project, ProjectCard, ProjectCategory } from '@/components/project-card';
import { ProjectCurveField } from '@/components/project-curve-field';
import { RippleField } from '@/components/ripple-field';

const projectData: Project[] = [
  {
    title: '海外EMS平台APP+Web',
    tags: '用户体验设计  ·  设计系统  ·  用户研究  ·  数据驱动设计',
    image: '/images/projects/overseas-ems/cover-color.png',
    depthImage: '/images/projects/overseas-ems/cover-depth.png',
    detailImages: Array.from({ length: 11 }, (_, index) => `/images/projects/overseas-ems/${index + 1}.png`),
    position: '50% 50%',
    categories: ['用户体验'],
  },
  {
    title: '星充车网互动V2G',
    tags: '用户体验设计  ·  风险系统  ·  数据驱动设计  ·  千万级用户量',
    image: '/images/projects/starcharge-v2g/cover-color.png',
    depthImage: '/images/projects/starcharge-v2g/cover-depth.png',
    detailImages: Array.from({ length: 13 }, (_, index) => `/images/projects/starcharge-v2g/${index + 1}.png`),
    position: '50% 50%',
    categories: ['用户体验'],
  },
  {
    title: '星码AI · CDE平台',
    tags: '用户体验设计  ·  Ai Coding  ·  早期产品，现已GG 交互体验思路可参考',
    image: '/images/projects/xingma-cde/cover-color.png',
    depthImage: '/images/projects/xingma-cde/cover-depth.png',
    detailImages: Array.from({ length: 7 }, (_, index) => `/images/projects/xingma-cde/${index + 1}.png`),
    position: '50% 50%',
    categories: ['用户体验'],
  },
  {
    title: 'BC端体验升级数据增长案例',
    tags: '用户体验设计  ·  体验迭代  ·  2个案例  ·  数据增长',
    image: '/images/projects/bc-experience-growth/cover-color.png',
    depthImage: '/images/projects/bc-experience-growth/cover-depth.png',
    detailImages: Array.from({ length: 4 }, (_, index) => `/images/projects/bc-experience-growth/${index + 1}.png`),
    position: '50% 50%',
    categories: ['用户体验'],
  },
  {
    title: 'AI语音交互产品体验',
    tags: '用户体验设计  ·  多模态交互  ·  2个案例',
    image: '/images/projects/ai-voice-interaction/cover-color.png',
    depthImage: '/images/projects/ai-voice-interaction/cover-depth.png',
    detailImages: Array.from({ length: 8 }, (_, index) => `/images/projects/ai-voice-interaction/${index + 1}.png`),
    position: '50% 50%',
    categories: ['用户体验'],
  },
  {
    title: '文誉城VR项目全栈',
    tags: '数字孪生全栈  ·  UI设计  ·  3D建模  ·  UE美术  ·  UE开发  ·  部署落地',
    image: '/images/projects/wenyucheng-vr-fullstack/cover-color.png',
    depthImage: '/images/projects/wenyucheng-vr-fullstack/cover-depth.png',
    detailImages: [
      '/images/projects/wenyucheng-vr-fullstack/1.png',
      '/images/projects/wenyucheng-vr-fullstack/2.mp4',
      '/images/projects/wenyucheng-vr-fullstack/3.png',
      '/images/projects/wenyucheng-vr-fullstack/4.png',
      '/images/projects/wenyucheng-vr-fullstack/5.png',
      '/images/projects/wenyucheng-vr-fullstack/6.png',
      '/images/projects/wenyucheng-vr-fullstack/7.png',
      '/images/projects/wenyucheng-vr-fullstack/8.png',
      '/images/projects/wenyucheng-vr-fullstack/9.png',
      '/images/projects/wenyucheng-vr-fullstack/10.png',
    ],
    position: '50% 50%',
    categories: ['数字孪生'],
  },
  {
    title: '西伏河项目全栈',
    tags: '数字孪生全栈  ·  UI设计  ·  3D建模  ·  UE美术  ·  UE开发  ·  部署落地',
    image: '/images/projects/xifuhe-fullstack/cover-color.png',
    depthImage: '/images/projects/xifuhe-fullstack/cover-depth.png',
    detailImages: [
      '/images/projects/xifuhe-fullstack/1.png',
      '/images/projects/xifuhe-fullstack/2.mp4',
      '/images/projects/xifuhe-fullstack/3.jpg',
      '/images/projects/xifuhe-fullstack/4.png',
    ],
    position: '50% 50%',
    categories: ['数字孪生'],
  },
  {
    title: '康华医院项目全栈',
    tags: '数字孪生全栈  ·  UI设计  ·  3D建模  ·  UE美术  ·  UE开发  ·  部署落地',
    image: '/images/projects/kanghua-hospital-fullstack/cover-color.png',
    depthImage: '/images/projects/kanghua-hospital-fullstack/cover-depth.png',
    detailImages: [
      '/images/projects/kanghua-hospital-fullstack/1.png',
      '/images/projects/kanghua-hospital-fullstack/2.mp4',
      '/images/projects/kanghua-hospital-fullstack/3.png',
      '/images/projects/kanghua-hospital-fullstack/4.png',
      '/images/projects/kanghua-hospital-fullstack/5.png',
      '/images/projects/kanghua-hospital-fullstack/6.png',
    ],
    position: '50% 50%',
    categories: ['数字孪生'],
  },
];

const projects: Project[] = projectData;

const workCategories = ['全部', '用户体验', '数字孪生', 'AI设计工程', '3D美术视觉品牌', '独立开发者'] as const;
type WorkCategory = '全部' | ProjectCategory;
const detailSectionTemplates = [
  { id: 'case-home', label: '首页' },
  { id: 'case-research', label: '用户研究' },
  { id: 'case-analysis', label: '分析' },
  { id: 'case-conclusion', label: '设计结论' },
  { id: 'case-result', label: '设计结果' },
] as const;

function getDetailSections(imageCount: number) {
  const lastImageIndex = Math.max(0, imageCount - 1);
  return detailSectionTemplates.map((section, index) => ({
    ...section,
    startIndex: Math.round((lastImageIndex * index) / (detailSectionTemplates.length - 1)),
  }));
}

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
  const [detailFullscreen, setDetailFullscreen] = useState(false);
  const [activeDetailSection, setActiveDetailSection] = useState('case-home');
  const [activeCategory, setActiveCategory] = useState<WorkCategory>('全部');
  const [tabsPinned, setTabsPinned] = useState(false);
  const [heroActionsVisible, setHeroActionsVisible] = useState(true);
  const visibleProjects = activeCategory === '全部'
    ? projects
    : projects.filter((project) => project.categories.includes(activeCategory));
  const relatedProjects = detail
    ? projects
      .filter((project) => project.title !== detail.title)
      .sort((projectA, projectB) => {
        const scoreA = projectA.categories.some((category) => detail.categories.includes(category)) ? 1 : 0;
        const scoreB = projectB.categories.some((category) => detail.categories.includes(category)) ? 1 : 0;
        return scoreB - scoreA;
      })
      .slice(0, 5)
    : [];
  const currentDetailSections = detail ? getDetailSections(detail.detailImages.length) : [];

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
        const nextHeroActionsVisible = workRect.top > 0;
        setHeroActionsVisible((current) => current === nextHeroActionsVisible ? current : nextHeroActionsVisible);
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
    const sections = getDetailSections(detail.detailImages.length)
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

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-footer-reveal]'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { threshold: .12, rootMargin: '0px 0px -4% 0px' });
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
    setDetailFullscreen(false);
    document.body.style.overflow = '';
    history.replaceState(null, '', '#top');
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const changeCategory = (category: WorkCategory) => {
    setActiveCategory(category);
    if (!tabsPinned) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const stickyRegion = tabsStickyRef.current;
      if (!stickyRegion) return;
      let stickyStart = 0;
      let offsetNode: HTMLElement | null = stickyRegion;
      while (offsetNode) {
        stickyStart += offsetNode.offsetTop;
        offsetNode = offsetNode.offsetParent as HTMLElement | null;
      }
      window.scrollTo({ top: Math.max(0, stickyStart + 24), behavior: 'smooth' });
    }));
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

      <header className={`topbar${detail ? ' is-over-detail' : ''}`}>
        <a
          className="wordmark"
          href="#top"
          aria-label="返回首页顶部"
          onClick={(event) => {
            if (!detail) return;
            event.preventDefault();
            returnHome();
          }}
        >
          Ikun LAB
        </a>
        {!detail && (
          <div className={`hero-social-actions${heroActionsVisible ? ' is-visible' : ''}`} aria-label="社交媒体与联系方式">
            <div className="hero-social-item hero-wechat">
              <button type="button" className="hero-social-action" aria-label="显示微信二维码">
                <img src="/images/vx.svg" alt="" aria-hidden="true" />
              </button>
              <div className="wechat-popover" role="tooltip">
                <img src="/images/wechat-qr.png" alt="Ikun 的微信二维码" />
                <span>微信扫码联系</span>
              </div>
            </div>
            <a
              className="hero-social-action"
              href="https://space.bilibili.com/364418045?spm_id_from=333.40164.0.0"
              target="_blank"
              rel="noreferrer"
              aria-label="打开 Ikun 的哔哩哔哩主页"
            >
              <img src="/images/bilibili.svg" alt="" aria-hidden="true" />
            </a>
          </div>
        )}
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
                onClick={() => changeCategory(category)}
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

      <footer id="contact" className="contact-footer">
        <div className="contact-footer-intro" data-footer-reveal>
          <span>CONTACT / IKUN LAB</span>
          <h2>保持联系，<br />一起把想法做出来。</h2>
        </div>

        <a className="contact-email" href="mailto:892039651@qq.com" data-footer-reveal>
          <span className="contact-label">EMAIL</span>
          <span className="contact-email-address">892039651@qq.com</span>
          <ArrowUpRight aria-hidden="true" />
        </a>

        <div className="contact-channel-grid">
          <section className="contact-wechat" aria-labelledby="wechat-title" data-footer-reveal>
            <div className="contact-channel-copy">
              <span className="contact-label">WECHAT</span>
              <h3 id="wechat-title">微信</h3>
              <p>扫描二维码，添加我的微信</p>
            </div>
            <div className="contact-qr-frame">
              <img src="/images/wechat-qr.png" alt="Ikun 的微信二维码" />
            </div>
          </section>

          <a
            className="contact-bilibili"
            href="https://space.bilibili.com/364418045?spm_id_from=333.40164.0.0"
            target="_blank"
            rel="noreferrer"
            data-footer-reveal
          >
            <div className="contact-channel-copy">
              <span className="contact-label">BILIBILI</span>
              <h3>哔哩哔哩</h3>
              <p>设计、3D 与独立开发过程记录</p>
            </div>
            <span className="contact-external-link">
              访问主页
              <ArrowUpRight aria-hidden="true" />
            </span>
          </a>
        </div>

        <div className="contact-footer-bottom" data-footer-reveal>
          <span>© 2026 IKUN LAB</span>
          <a href="#top">返回顶部 ↑</a>
        </div>
      </footer>

      {transition && <div className={`project-transition ${transition.expanding ? 'is-expanding' : ''}`} style={{ '--from-x': `${transition.rect.left}px`, '--from-y': `${transition.rect.top}px`, '--from-w': `${transition.rect.width}px`, '--from-h': `${transition.rect.height}px`, '--transition-image': `url(${transition.project.image})` } as React.CSSProperties} />}
      {detail && (
        <aside ref={detailRef} className={`project-detail${detailFullscreen ? ' is-fullscreen' : ''}`} aria-label={`${detail.title} 作品详情`}>
          <button className="project-detail-home" type="button" onClick={returnHome}>
            <ArrowLeft aria-hidden="true" />
            <span>返回首页</span>
          </button>
          <button
            className="detail-fullscreen-toggle"
            type="button"
            aria-pressed={detailFullscreen}
            onClick={() => setDetailFullscreen((current) => !current)}
          >
            {detailFullscreen ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
            <span>{detailFullscreen ? '收起' : '全屏'}</span>
          </button>
          <div className="detail-layout">
            <nav className="detail-anchor" aria-label="作品章节导航">
              {currentDetailSections.map((section, index) => (
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
              {detail.detailImages.map((image, index) => {
                const section = currentDetailSections.find((item) => item.startIndex === index);
                return (
                  <section key={image} id={section?.id} className="detail-media-section">
                    <DetailMedia
                      src={image}
                      alt={`${detail.title} 详情图 ${index + 1}`}
                    />
                  </section>
                );
              })}
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
                      return <ProjectCard key={project.title} project={project} index={projectIndex} onOpen={openProject} variant="related" />;
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

