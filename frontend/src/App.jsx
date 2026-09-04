import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { Plus, ArrowUpRight, ArrowRight, Search, X, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import api, { optimizeCloudinaryUrl } from './utils/api';

const MarkdownRenderer = lazy(() => import('./components/MarkdownRenderer'));
const AdminStudio = lazy(() => import('./components/AdminStudio'));
const CommentThread = lazy(() => import('./components/CommentThread'));

gsap.registerPlugin(ScrollTrigger);

const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4';
const EASE = [0.16, 1, 0.3, 1];

const cleanText = (value = '') => String(value).replace(/[\u2013\u2014]/g, '-');
const readTime = (content = '') => `${Math.max(2, Math.ceil(String(content).split(/\s+/).length / 210))} min read`;
const formatDate = (value) => {
  if (!value) return 'Recent note';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Recent note' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const postSummary = (post) => cleanText(post?.excerpt || post?.content || 'A closer look at the systems that will shape the next decade.').replace(/[#*_`]/g, '').slice(0, 190);

function Mark() {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 44 44" fill="none">
      <rect x="8" y="5" width="13" height="34" rx="5" transform="rotate(-35 8 5)" fill="currentColor" />
      <rect x="23" y="5" width="13" height="34" rx="5" transform="rotate(-35 23 5)" fill="currentColor" />
    </svg>
  );
}

function GridIcon() {
  return <svg aria-hidden="true" width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="3" cy="3" r="1.5" fill="currentColor" /><circle cx="10" cy="3" r="1.5" fill="currentColor" /><circle cx="3" cy="10" r="1.5" fill="currentColor" /><circle cx="10" cy="10" r="1.5" fill="currentColor" /></svg>;
}

function SiteNav({ hero = false }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const links = [
    ['Stories', '/all-posts'],
    ['Search', '/search'],
    ['About', '/about'],
  ];

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open);
    return () => document.documentElement.classList.remove('menu-open');
  }, [open]);

  return (
    <>
      <motion.nav className={`site-nav ${hero ? 'site-nav--hero' : ''}`} initial={hero ? { y: -16, opacity: 0 } : false} animate={hero ? { y: 0, opacity: 1 } : undefined} transition={{ duration: 0.8, ease: EASE }} aria-label="Primary navigation">
        <div className="site-nav__left">
          <Link className="brand" to="/" aria-label="Dinmay's Blog home"><span className="brand__mark"><Mark /></span><span className="brand__name">Dinmay's Blog</span></Link>
          <button className="menu-pill" type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-controls="site-menu"><span className="menu-pill__icon"><Plus size={12} strokeWidth={3} /></span><span>Menu</span></button>
          <div className="nav-tags" aria-label="Editorial focus"><span>AI Research</span><span>Systems Thinking</span></div>
        </div>
        <div className="site-nav__right"><Link className="adaptive-pill" to="/all-posts"><span className="adaptive-pill__icon"><GridIcon /></span><span className="adaptive-pill__label">Field Notes</span></Link></div>
      </motion.nav>
      <div id="site-menu" className={`site-menu ${open ? 'site-menu--open' : ''}`} aria-hidden={!open}>
        <button className="site-menu__close" type="button" onClick={() => setOpen(false)} aria-label="Close menu"><X size={18} /></button>
        <p className="eyebrow">Dinmay's Blog</p>
        <nav aria-label="Menu links">{links.map(([label, to]) => <NavLink key={to} to={to}>{label}<ArrowUpRight size={16} /></NavLink>)}</nav>
        <Link className="site-menu__admin" to="/admin">Editor access</Link>
      </div>
    </>
  );
}

function SiteFooter() {
  return <footer className="site-footer"><Link to="/" className="site-footer__brand"><Mark /><span>Dinmay's Blog</span></Link><p>Independent notes on applied intelligence and the systems around it.</p><div><Link to="/all-posts">Stories</Link><Link to="/about">About</Link><Link to="/admin">Admin</Link></div></footer>;
}

function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    api.getPosts().then((data) => { if (active) setPosts(Array.isArray(data) ? data : []); }).catch(() => { if (active) setError('The archive is temporarily unavailable.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return { posts, loading, error };
}

function HomeHero() {
  return <section className="home-hero">
    <SiteNav hero />
    <motion.div className="hero-video-wrap" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.8, ease: EASE }}><video className="hero-video" src={VIDEO_URL} autoPlay muted loop playsInline /></motion.div>
    <motion.div className="hero-footer" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 1, ease: EASE }}>
      <div className="hero-footer__inner">
        <div className="hero-copy"><motion.p className="hero-kicker" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.8, ease: EASE }}><span />Independent AI systems journal</motion.p><motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 0.8, ease: EASE }}>Intelligence, made<br />legible.</motion.h1><motion.div className="hero-actions" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1, duration: 0.8, ease: EASE }}><Link to="/all-posts" className="button button--dark">Explore stories</Link><Link to="/about" className="button button--outline">About the journal</Link></motion.div></div>
        <div className="hero-topic-tags"><span>Models</span><span>Research</span><span>Infrastructure</span></div>
      </div>
    </motion.div>
  </section>;
}

function StoryCard({ post, feature = false }) {
  const image = optimizeCloudinaryUrl(post.featuredImage, { width: 1200, height: 900 });
  return <article className={`story-card ${feature ? 'story-card--feature' : ''}`}>
    <Link to={`/post/${post.slug}`} className="story-card__link" aria-label={`Read ${cleanText(post.title)}`}>
      <div className="story-card__media">{image ? <img src={image} alt="" loading="lazy" /> : <div className="story-card__signal"><span /><span /><span /></div>}<span className="story-card__number">{String((post.id || post.slug || '').length % 89).padStart(2, '0')}</span></div>
      <div className="story-card__body"><div className="story-card__meta"><span>{post.tags?.[0] || 'Field note'}</span><span>{formatDate(post.publishedDate)}</span></div><h3>{cleanText(post.title)}</h3><p>{postSummary(post)}</p><span className="story-card__read">Read article <ArrowUpRight size={15} /></span></div>
    </Link>
  </article>;
}

function HomeStories() {
  const { posts, loading, error } = usePosts();
  const scope = useRef(null);
  useGSAP(() => {
    const media = gsap.utils.toArray('.story-card__media');
    const context = gsap.matchMedia();
    context.add('(prefers-reduced-motion: no-preference)', () => media.map((item) => gsap.fromTo(item, { scale: 0.88, opacity: 0.25 }, { scale: 1, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: item, start: 'top 88%', end: 'top 45%', scrub: true } })));
    return () => context.revert();
  }, { scope });
  const featured = posts.slice(0, 5);
  return <section className="home-stories" ref={scope}><div className="section-heading"><p className="eyebrow">Open field</p><h2>Notes for the people building what comes next.</h2><Link to="/all-posts" className="text-link">Browse archive <ArrowRight size={16} /></Link></div>{error ? <p className="notice">{error}</p> : null}<div className="story-grid">{loading ? <p className="loading-copy">Loading field notes...</p> : featured.length ? featured.map((post, index) => <StoryCard key={post.id || post.slug} post={post} feature={index === 0} />) : <p className="loading-copy">New field notes are being prepared.</p>}</div></section>;
}

function HomePage() { return <><HomeHero /><HomeStories /><SiteFooter /></>; }

function PageFrame({ eyebrow, title, intro, children, narrow = false }) {
  return <><SiteNav /><main className={`page-frame ${narrow ? 'page-frame--narrow' : ''}`}><header className="page-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{intro ? <p>{intro}</p> : null}</header>{children}</main><SiteFooter /></>;
}

function AllPostsPage() {
  const { posts, loading, error } = usePosts();
  const [tag, setTag] = useState('All');
  const tags = useMemo(() => ['All', ...Array.from(new Set(posts.flatMap((post) => post.tags || []))).slice(0, 8)], [posts]);
  const visible = tag === 'All' ? posts : posts.filter((post) => post.tags?.includes(tag));
  return <PageFrame eyebrow="The archive" title="Deep work, without the noise." intro="Every post comes from a question worth staying with."><div className="filter-row" aria-label="Filter stories">{tags.map((item) => <button type="button" key={item} className={item === tag ? 'is-active' : ''} onClick={() => setTag(item)}>{item}</button>)}</div>{error ? <p className="notice">{error}</p> : null}<section className="archive-grid">{loading ? <p className="loading-copy">Loading the archive...</p> : visible.map((post) => <StoryCard key={post.id || post.slug} post={post} />)}</section></PageFrame>;
}

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const submit = async (event) => { event.preventDefault(); if (!query.trim()) return; setLoading(true); try { const data = await api.searchPosts({ q: query.trim() }); setResults(Array.isArray(data) ? data : []); } finally { setLoading(false); } };
  return <PageFrame eyebrow="Find a thread" title="Search the field notes." intro="Search titles, ideas, and categories across the archive."><form className="search-form" onSubmit={submit}><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search concepts, systems, or people" aria-label="Search posts" /><button className="button button--dark" type="submit">Search</button></form><section className="archive-grid search-results">{loading ? <p className="loading-copy">Searching...</p> : results.map((post) => <StoryCard key={post.id || post.slug} post={post} />)}{!loading && query && !results.length ? <p className="loading-copy">No matching field notes yet.</p> : null}</section></PageFrame>;
}

function ArticlePage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const scrollScope = useRef(null);
  useEffect(() => { let active = true; api.getPostBySlug(slug).then((data) => { if (active) setPost(data); }).catch(() => { if (active) setError('This field note could not be found.'); }); return () => { active = false; }; }, [slug]);
  useGSAP(() => {
    if (!post || !scrollScope.current) return undefined;
    const media = scrollScope.current.querySelector('.article-image');
    const header = scrollScope.current.querySelector('.article-header');
    const preferences = gsap.matchMedia();
    preferences.add('(prefers-reduced-motion: no-preference)', () => {
      if (header) gsap.to(header, { y: -22, ease: 'none', scrollTrigger: { trigger: scrollScope.current, start: 'top top', end: 'bottom bottom', scrub: 1.6 } });
      if (media) gsap.to(media, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: 1.9 } });
    });
    return () => preferences.revert();
  }, { scope: scrollScope, dependencies: [post?.id], revertOnUpdate: true });
  if (error) return <PageFrame eyebrow="Missing page" title="This route is quiet." intro={error} narrow><Link to="/all-posts" className="text-link">Return to archive <ArrowRight size={16} /></Link></PageFrame>;
  if (!post) return <PageFrame eyebrow="Field note" title="Loading..." narrow><p className="loading-copy">Opening the field note...</p></PageFrame>;
  return <><SiteNav /><main className="article-page" ref={scrollScope}><Link to="/all-posts" className="back-link"><ArrowLeft size={16} /> Archive</Link><header className="article-header"><div className="article-meta"><span>{post.tags?.[0] || 'Field note'}</span><span>{formatDate(post.publishedDate)}</span><span>{readTime(post.content)}</span></div><h1>{cleanText(post.title)}</h1><p>{postSummary(post)}</p></header>{post.featuredImage ? <img className="article-image" src={optimizeCloudinaryUrl(post.featuredImage, { width: 1800, height: 1100 })} alt="" /> : null}<article className="article-body"><MarkdownRenderer content={post.content} /></article><CommentThread postId={post.id} /></main><SiteFooter /></>;
}

function AboutPage() {
  const [about, setAbout] = useState('');
  useEffect(() => { let active = true; api.getAbout().then((data) => { if (active) setAbout(data.content || ''); }).catch(() => { if (active) setAbout('A home for ideas at the edge of technology.'); }); return () => { active = false; }; }, []);
  return <PageFrame eyebrow="About the publication" title="A slower way to look at fast technology." intro="Dinmay's Blog is an independent reading room for AI, infrastructure, and the people who shape both." narrow><article className="article-body article-body--about"><MarkdownRenderer content={about} /></article></PageFrame>;
}

function AdminPage() { return <AdminStudio SiteNav={SiteNav} SiteFooter={SiteFooter} PageFrame={PageFrame} />; }

function MissingPage() { return <PageFrame eyebrow="Missing page" title="This route is quiet." intro="The page you asked for is not in the current archive." narrow><Link to="/" className="text-link">Return home <ArrowRight size={16} /></Link></PageFrame>; }

function App() {
  return <BrowserRouter><Suspense fallback={<div className="route-loading">Opening the page...</div>}><Routes><Route path="/" element={<HomePage />} /><Route path="/all-posts" element={<AllPostsPage />} /><Route path="/search" element={<SearchPage />} /><Route path="/post/:slug" element={<ArticlePage />} /><Route path="/about" element={<AboutPage />} /><Route path="/admin" element={<AdminPage />} /><Route path="*" element={<MissingPage />} /></Routes></Suspense></BrowserRouter>;
}

export default App;
