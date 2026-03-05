// =====================================================
// MOBILE DETECT — Feature-based device capability utility
// Single source of truth for all mobile/touch detection
// =====================================================

const touchQuery = window.matchMedia('(pointer: coarse)');
const hoverQuery = window.matchMedia('(hover: none)');
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * @type {boolean} True if the primary input is touch (no precise pointer)
 */
export const isTouchPrimary = touchQuery.matches;

/**
 * @type {boolean} True if hover is NOT available (pure touch device)
 */
export const isHoverUnavailable = hoverQuery.matches;

/**
 * @type {boolean} True if screen width ≤ 768px AND primary input is touch
 */
export const isMobile = isTouchPrimary && window.screen.width <= 768;

/**
 * @type {boolean} True if device has low-end hardware
 * hardwareConcurrency ≤ 4 OR deviceMemory ≤ 4
 */
export const isLowEnd = (() => {
    const cores = navigator.hardwareConcurrency || 8;
    const mem = /** @type {any} */ (navigator).deviceMemory || 8;
    return cores <= 4 && mem <= 4;
})();

/**
 * @type {boolean} True if user prefers reduced motion
 */
export const prefersReducedMotion = motionQuery.matches;

/**
 * @type {number} Effective device pixel ratio — capped at 1.5 on mobile for WebGL perf
 */
export const effectiveDPR = isMobile
    ? Math.min(window.devicePixelRatio, 1.5)
    : Math.min(window.devicePixelRatio, 2);

/**
 * @type {boolean} True if WebGL is available AND device is not low-end
 */
export const shouldEnableWebGL = (() => {
    if (isLowEnd) return false;
    try {
        const c = document.createElement('canvas');
        const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
        return !!gl;
    } catch {
        return false;
    }
})();

/**
 * Consolidated device object for convenience
 */
export const device = {
    isTouchPrimary,
    isHoverUnavailable,
    isMobile,
    isLowEnd,
    prefersReducedMotion,
    effectiveDPR,
    shouldEnableWebGL,
};

export default device;
