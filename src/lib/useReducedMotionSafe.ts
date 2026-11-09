import { useReducedMotion } from 'framer-motion';

/**
 * Thin wrapper around Framer Motion's reduced-motion hook so any module can
 * read the user's OS preference without importing framer-motion directly.
 */
export function useReducedMotionSafe(): boolean {
  return useReducedMotion() ?? false;
}
