import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Asterisk, Menu } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { api, optimizeCloudinaryUrl } from '../utils/api';

gsap.registerPlugin(ScrollTrigger);

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4';

const fallbackImages = [
  'https://picsum.photos/seed/embodied-intelligence/1600/1000',
  'https://picsum.photos/seed/robotic-senses/1400/1000',
  'https://picsum.photos/seed/ai-research-studio/1200/1400',
  'https://picsum.photos/seed/intelligent-systems/1200/900',
];

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently published';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function cleanExcerpt(value) {
  if (!value) return 'Open the story to read the full perspective.';
  return value
    .replace(/```[\s\S]*?```/g, '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*|__/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 154);
}

function HomePage() {
  const root = useRef(null);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [activeStory, setActiveStory] = useState(0);

  const loadPosts = async () => {
    setStatus('loading');
    try {
      const response = await api.getPosts();
      setPosts(Array.isArray(response) ? response : []);
      setStatus('ready');
    } catch (error) {
      setStatus('error');
    }
  };

  useGSAP(
    () => {
      loadPosts();

      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const words = gsap.utils.toArray('[data-scrub-word]');
        gsap.to(words, {
          opacity: 1,
          stagger: 0.035,
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-scrub-copy]',
            start: 'top 76%',
            end: 'bottom 46%',
            scrub: 0.7,
          },
        });

        gsap.utils.toArray('[data-media-reveal]').forEach((element) => {
          gsap.fromTo(
            element,
            { scale: 0.82, opacity: 0.22 },
            {
              scale: 1,
              opacity: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: element,
                start: 'top 82%',
                end: 'bottom 24%',
                scrub: 0.9,
              },
            }
          );
        });
      });

      return () => media.revert();
    },
    { scope: root }
  );

  const editorialPosts = useMemo(
    () =>
      posts.map((post, index) => ({
        ...post,
        image: optimizeCloudinaryUrl(post.featuredImage, { width: 1400, height: 1000 }) || fallbackImages[index % fallbackImages.length],
        category: post.tags?.[0] || 'Essay',
        excerpt: cleanExcerpt(post.excerpt || post.content),
      })),
    [posts]
  );

  const latest = editorialPosts.slice(0, 4);
  const accordionPosts = editorialPosts.slice(1, 4);
  const carouselPosts = editorialPosts.slice(0, 3);
  const activeCarouselPost = carouselPosts[activeStory] || carouselPosts[0];
  const scrubWords = 'The consequential story is not what a model can say. It is what people can safely do when intelligence enters the room.'.split(' ');

  return (
    <main ref={root} className="w-full max-w-full overflow-x-hidden bg-[#10110f] font-sans text-[#f3f4ef]">
      <header className="absolute inset-x-0 top-0 z-30 px-4 pt-4 sm:px-6 lg:px-10 lg:pt-7">
        <nav className="mx-auto flex h-14 max-w-[1440px] items-center justify-between rounded-full border border-white/15 bg-[#151714]/70 px-3.5 backdrop-blur-xl sm:px-5" aria-label="Primary navigation">
          <Link to="/" className="inline-flex items-center gap-2.5 text-[13px] font-semibold tracking-[-0.04em] text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a6bcff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#151714]">
            <span className="flex size-8 items-center justify-center rounded-full bg-[#f3f4ef] text-[#151714]"><Asterisk size={14} strokeWidth={2.3} aria-hidden="true" /></span>
            Dinmay's Blog
          </Link>
          <div className="hidden items-center gap-7 text-[12px] font-medium text-white/65 md:flex">
            <a className="transition-colors hover:text-white" href="#latest">Latest</a>
            <a className="transition-colors hover:text-white" href="#perspective">Perspective</a>
            <Link className="transition-colors hover:text-white" to="/all-posts">Archive</Link>
          </div>
          <Link to="/admin" className="hidden rounded-full bg-[#f3f4ef] px-4 py-2 text-[12px] font-semibold text-[#151714] transition duration-300 hover:-translate-y-0.5 hover:bg-[#a6bcff] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a6bcff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#151714] md:inline-flex">Publish</Link>
          <Link to="/all-posts" className="inline-flex size-8 items-center justify-center rounded-full border border-white/20 text-white md:hidden" aria-label="Browse posts"><Menu size={16} aria-hidden="true" /></Link>
        </nav>
      </header>

      <section className="relative flex min-h-[100dvh] items-end overflow-hidden px-4 pb-8 pt-28 sm:px-6 sm:pb-12 lg:px-10 lg:pb-14">
        <video autoPlay loop muted playsInline preload="metadata" className="absolute inset-0 size-full object-cover" aria-hidden="true"><source src={VIDEO_URL} type="video/mp4" /></video>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,9,0.3)_0%,rgba(10,11,9,0.15)_28%,rgba(10,11,9,0.94)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_46%,transparent_0%,rgba(10,11,9,0.08)_36%,rgba(10,11,9,0.54)_100%)]" />
        <div className="relative z-10 mx-auto w-full max-w-[1440px]">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Dinmay's Blog</p>
          <h1 className="max-w-6xl text-[clamp(3.2rem,6.3vw,7rem)] font-medium leading-[0.88] tracking-[-0.075em] text-white">Where intelligence becomes human.</h1>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#latest" className="inline-flex items-center gap-2 rounded-full bg-[#f3f4ef] px-5 py-3 text-[13px] font-semibold text-[#151714] transition duration-300 hover:-translate-y-0.5 hover:bg-[#a6bcff] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a6bcff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#151714]">Read the latest <ArrowRight size={15} strokeWidth={2} aria-hidden="true" /></a>
            <Link to="/all-posts" className="inline-flex items-center rounded-full border border-white/45 bg-[#10110f]/15 px-5 py-3 text-[13px] font-semibold text-white backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a6bcff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#151714]">Browse archive</Link>
          </div>
        </div>
      </section>

      <section id="latest" className="mx-auto max-w-[1440px] px-4 py-32 sm:px-6 md:py-40 lg:px-10 lg:py-48">
        <div className="max-w-4xl">
          <p className="text-[13px] font-medium text-[#a6bcff]">Latest writing</p>
          <h2 className="mt-4 text-[clamp(2.6rem,5vw,5.5rem)] font-medium leading-[0.9] tracking-[-0.07em]">The part of technology that stays with you.</h2>
        </div>

        {status === 'loading' && <div className="mt-12 grid grid-flow-dense gap-4 lg:grid-cols-12 lg:auto-rows-[220px]" aria-label="Loading posts"><div className="min-h-[460px] animate-pulse rounded-[22px] bg-white/10 lg:col-span-7 lg:row-span-2" /><div className="min-h-[220px] animate-pulse rounded-[22px] bg-white/10 lg:col-span-5" /><div className="min-h-[220px] animate-pulse rounded-[22px] bg-white/10 lg:col-span-3" /><div className="min-h-[220px] animate-pulse rounded-[22px] bg-white/10 lg:col-span-2" /></div>}

        {status === 'error' && <div className="mt-12 rounded-[22px] border border-white/15 p-7 sm:p-10"><h3 className="text-2xl font-medium tracking-[-0.04em]">The publishing API is not responding.</h3><p className="mt-3 max-w-xl text-sm leading-6 text-white/60">Start the FastAPI service or set `REACT_APP_BACKEND_URL` to its deployed address, then retry this connection.</p><button onClick={loadPosts} className="mt-6 rounded-full border border-white/30 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:border-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a6bcff]">Retry connection</button></div>}

        {status === 'ready' && latest.length === 0 && <div className="mt-12 rounded-[22px] border border-white/15 p-7 sm:p-10"><h3 className="text-2xl font-medium tracking-[-0.04em]">No stories have been published yet.</h3><p className="mt-3 max-w-xl text-sm leading-6 text-white/60">The feed is connected and ready for the first post from the admin workspace.</p><Link to="/admin" className="mt-6 inline-flex rounded-full bg-[#f3f4ef] px-4 py-2.5 text-[13px] font-semibold text-[#151714]">Open publishing</Link></div>}

        {status === 'ready' && latest.length > 0 && (
          <div className={latest.length >= 4 ? 'mt-12 grid grid-flow-dense gap-4 lg:grid-cols-12 lg:auto-rows-[220px]' : 'mt-12 grid gap-4 md:grid-cols-2'}>
            {latest.map((post, index) => {
              const spans = ['lg:col-span-7 lg:row-span-2', 'lg:col-span-5', 'lg:col-span-3', 'lg:col-span-2'];
              return (
                <Link key={post.id || post.slug} to={`/post/${post.slug}`} className={`group relative min-h-[310px] overflow-hidden rounded-[22px] bg-[#1b1d1a] ${latest.length >= 4 ? spans[index] : ''}`}>
                  <img data-media-reveal src={post.image} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover opacity-80 grayscale transition duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,13,11,0.04)_0%,rgba(12,13,11,0.88)_100%)]" />
                  <article className="relative flex h-full min-h-[310px] flex-col justify-end p-5 sm:p-7">
                    <div className="flex items-center justify-between gap-3 text-[11px] font-medium text-white/60"><span>{post.category}</span><span>{formatDate(post.publishedDate)}</span></div>
                    <h3 className={index === 0 ? 'mt-3 max-w-2xl line-clamp-3 text-[clamp(2rem,3.5vw,3.5rem)] font-medium leading-[0.97] tracking-[-0.055em]' : 'mt-3 line-clamp-3 text-2xl font-medium leading-[1] tracking-[-0.045em]'}>{post.title}</h3>
                    <p className="mt-3 max-w-xl line-clamp-2 text-[13px] leading-5 text-white/68">{post.excerpt}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-[#a6bcff]">Read story <ArrowRight size={14} strokeWidth={2} aria-hidden="true" /></span>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {accordionPosts.length > 0 && (
        <section id="perspective" className="px-4 py-32 sm:px-6 md:py-40 lg:px-10 lg:py-48">
          <div className="mx-auto max-w-[1440px]">
            <div className="max-w-5xl">
              <p className="text-[13px] font-medium text-[#a6bcff]">A closer look</p>
              <h2 className="mt-4 text-[clamp(2.6rem,5vw,5.5rem)] font-medium leading-[0.9] tracking-[-0.07em]">Ideas that <span className="mx-1 inline-block h-[0.68em] w-[1.7em] rounded-full align-[0.02em] bg-cover bg-center" style={{ backgroundImage: `url(${accordionPosts[0].image})` }} /> change shape in the world.</h2>
            </div>
            <div className="mt-14 flex min-h-[560px] flex-col gap-3 lg:h-[640px] lg:flex-row">
              {accordionPosts.map((post) => (
                <Link key={post.id || post.slug} to={`/post/${post.slug}`} className="group relative min-h-[230px] flex-1 overflow-hidden rounded-[22px] transition-[flex] duration-700 ease-out hover:flex-[2.25] lg:min-h-0">
                  <img data-media-reveal src={post.image} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover grayscale transition duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,13,11,0.08)_16%,rgba(12,13,11,0.9)_100%)]" />
                  <div className="relative flex size-full flex-col justify-end p-5 sm:p-7"><span className="text-[11px] font-medium text-white/65">{post.category}</span><h3 className="mt-3 max-w-md text-2xl font-medium leading-[1] tracking-[-0.045em] opacity-100 transition-opacity duration-500 lg:opacity-0 lg:group-hover:opacity-100">{post.title}</h3><span className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-[#a6bcff] opacity-100 transition-opacity duration-500 lg:opacity-0 lg:group-hover:opacity-100">Read story <ArrowRight size={14} strokeWidth={2} aria-hidden="true" /></span></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 py-32 sm:px-6 md:py-40 lg:px-10 lg:py-48">
        <div className="mx-auto max-w-6xl text-center" data-scrub-copy>
          <p className="text-[clamp(2.5rem,5vw,5.2rem)] font-medium leading-[0.94] tracking-[-0.07em] text-white/18">
            {scrubWords.map((word, index) => <span data-scrub-word key={`${word}-${index}`} className="mr-[0.22em] inline-block">{word}</span>)}
          </p>
        </div>
      </section>

      {carouselPosts.length > 0 && activeCarouselPost && (
        <section className="px-4 pb-32 sm:px-6 md:pb-40 lg:px-10 lg:pb-48">
          <div className="mx-auto grid max-w-[1440px] overflow-hidden rounded-[22px] bg-[#1b1d1a] lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative min-h-[360px] overflow-hidden lg:min-h-[580px]"><img data-media-reveal src={activeCarouselPost.image} alt="" className="size-full object-cover grayscale" /><div className="absolute inset-0 bg-[#10110f]/15" /></div>
            <div className="flex min-h-[360px] flex-col justify-between p-7 sm:p-10 lg:min-h-[580px] lg:p-14">
              <div><p className="text-[13px] font-medium text-[#a6bcff]">Editor&apos;s selection</p><h2 className="mt-5 max-w-xl text-4xl font-medium leading-[0.96] tracking-[-0.06em] sm:text-5xl">{activeCarouselPost.title}</h2><p className="mt-6 max-w-lg text-[15px] leading-6 text-white/62">{activeCarouselPost.excerpt}</p></div>
              <div className="mt-10 flex items-center justify-between gap-4"><Link to={`/post/${activeCarouselPost.slug}`} className="inline-flex items-center gap-2 text-[13px] font-semibold text-white">Open story <ArrowRight size={15} strokeWidth={2} aria-hidden="true" /></Link><div className="flex gap-2"><button onClick={() => setActiveStory((activeStory - 1 + carouselPosts.length) % carouselPosts.length)} className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a6bcff]" aria-label="Previous featured story"><ArrowLeft size={16} aria-hidden="true" /></button><button onClick={() => setActiveStory((activeStory + 1) % carouselPosts.length)} className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a6bcff]" aria-label="Next featured story"><ArrowRight size={16} aria-hidden="true" /></button></div></div>
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-white/10 px-4 py-12 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-3xl font-medium tracking-[-0.055em]">Keep reading closely.</p><Link to="/all-posts" className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-[#a6bcff]">Browse every story <ArrowRight size={14} strokeWidth={2} aria-hidden="true" /></Link></div><div className="flex gap-5 text-[12px] text-white/60"><Link className="hover:text-white" to="/about">About</Link><Link className="hover:text-white" to="/all-posts">Archive</Link><Link className="hover:text-white" to="/admin">Publishing</Link></div></div>
      </footer>
    </main>
  );
}

export default HomePage;
