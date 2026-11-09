import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { SECTIONS } from '@/lib/nav';
import { useReducedMotionSafe } from '@/lib/useReducedMotionSafe';
import { cn } from '@/lib/cn';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const reducedMotion = useReducedMotionSafe();
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const firstDrawerLinkRef = useRef<HTMLAnchorElement>(null);

  /* Frosted state once the page scrolls */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Active-section tracking */
  useEffect(() => {
    const sections = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  /* Mobile drawer: initial focus + Escape */
  useEffect(() => {
    if (!menuOpen) return;
    firstDrawerLinkRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        hamburgerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-all duration-500',
          scrolled
            ? 'border-b border-gold/15 bg-midnight/85 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <nav
          aria-label="Site"
          className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 md:h-20 md:px-8"
        >
          {/* Brand */}
          <a href="#home" className="group flex items-center gap-3">
            <span
              aria-hidden="true"
              className="block size-7 transition-transform duration-500 group-hover:rotate-[72deg]"
              style={{
                clipPath:
                  'polygon(50% 0, 63% 37%, 100% 50%, 63% 63%, 50% 100%, 37% 63%, 0 50%, 37% 37%)',
                background: 'linear-gradient(135deg, #e8cd92, #c9a45c)',
                boxShadow: '0 0 18px 2px rgba(201,164,92,0.5)',
              }}
            />
            <span className="font-display text-lg font-semibold tracking-wide text-parchment sm:text-xl">
              A Yaksha's <span className="text-gold-gradient">Wish</span>
            </span>
          </a>

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 lg:flex">
            {SECTIONS.map((section) => {
              const isActive = active === section.id;
              return (
                <li key={section.id} className="relative">
                  <a
                    href={`#${section.id}`}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'relative block rounded-full px-3.5 py-2 text-[0.72rem] font-medium uppercase tracking-[0.18em] transition-all duration-300',
                      isActive
                        ? 'text-gold-bright text-shadow-anemo'
                        : 'text-silver hover:text-anemo',
                    )}
                  >
                    {section.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-2.5 -bottom-0.5 h-px rounded-full"
                        style={{
                          background: 'linear-gradient(90deg, rgba(70,199,178,0.9), rgba(201,164,92,0.9))',
                          boxShadow: '0 0 12px 1px rgba(70,199,178,0.55)',
                        }}
                        transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Mobile hamburger */}
          <button
            ref={hamburgerRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-full border border-gold/30 p-2.5 text-gold-bright transition-colors hover:border-gold/70 hover:bg-gold/10 lg:hidden"
          >
            {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </nav>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-midnight/95 backdrop-blur-2xl lg:hidden"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.35, ease: 'easeOut' }}
          >
            <div
              aria-hidden="true"
              className="halo-anemo pointer-events-none absolute left-1/2 top-1/3 size-[70vmin] -translate-x-1/2 rounded-full"
            />
            <ul className="relative flex flex-col items-center gap-2 px-6">
              {SECTIONS.map((section, index) => (
                <motion.li
                  key={section.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + index * 0.05, duration: 0.4 }}
                >
                  <a
                    ref={index === 0 ? firstDrawerLinkRef : undefined}
                    href={`#${section.id}`}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active === section.id ? 'true' : undefined}
                    className={cn(
                      'block py-2.5 font-display text-2xl tracking-wide transition-colors sm:text-3xl',
                      active === section.id ? 'text-gold-gradient' : 'text-silver hover:text-anemo',
                    )}
                  >
                    {section.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <p className="relative mt-10 text-[0.65rem] uppercase tracking-[0.35em] text-gold/60">
              Carried on the wind
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
