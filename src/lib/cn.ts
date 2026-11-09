/**
 * Tiny class-name combiner (no dependency on clsx / tailwind-merge).
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
