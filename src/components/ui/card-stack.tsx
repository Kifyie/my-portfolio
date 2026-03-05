import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { SquareArrowOutUpRight } from "lucide-react";
import { ProgressiveImage } from "./ProgressiveImage";
import { isTouchPrimary, isMobile } from '../../js/mobile-detect';

function cn(...classes: Array<string | undefined | null | false>) {
    return classes.filter(Boolean).join(" ");
}

export type CardStackItem = {
    id: string | number;
    title: string;
    description?: string;
    imageSrc?: string;
    href?: string;
    ctaLabel?: string;
    tag?: string;
};

export type CardStackProps<T extends CardStackItem> = {
    items: T[];

    /** Selected index on mount */
    initialIndex?: number;

    /** How many cards are visible around the active (odd recommended) */
    maxVisible?: number;

    /** Card sizing */
    cardWidth?: number;
    cardHeight?: number;

    /** How much cards overlap each other (0..0.8). Higher = more overlap */
    overlap?: number;

    /** Total fan angle (deg). Higher = wider arc */
    spreadDeg?: number;

    /** 3D / depth feel */
    perspectivePx?: number;
    depthPx?: number;
    tiltXDeg?: number;

    /** Active emphasis */
    activeLiftPx?: number;
    activeScale?: number;
    inactiveScale?: number;

    /** Motion */
    springStiffness?: number;
    springDamping?: number;

    /** Behavior */
    loop?: boolean;
    autoAdvance?: boolean;
    intervalMs?: number;
    pauseOnHover?: boolean;

    /** UI */
    showDots?: boolean;
    className?: string;

    /** Hooks */
    onChangeIndex?: (index: number, item: T) => void;

    /** Custom renderer (optional) */
    renderCard?: (item: T, state: { active: boolean }) => React.ReactNode;
};

function wrapIndex(n: number, len: number) {
    if (len <= 0) return 0;
    return ((n % len) + len) % len;
}

/** Minimal signed offset from active index to i, with wrapping (for loop behavior). */
function signedOffset(i: number, active: number, len: number, loop: boolean) {
    const raw = i - active;
    if (!loop || len <= 1) return raw;

    // consider wrapped alternative
    const alt = raw > 0 ? raw - len : raw + len;
    return Math.abs(alt) < Math.abs(raw) ? alt : raw;
}

export function CardStack<T extends CardStackItem>({
    items,
    initialIndex = 0,
    maxVisible = 7,

    cardWidth = 520,
    cardHeight = 320,

    overlap = 0.48,
    spreadDeg = 48,

    perspectivePx = 1100,
    depthPx = 140,
    tiltXDeg = 12,

    activeLiftPx = 22,
    activeScale = 1.03,
    inactiveScale = 0.94,

    springStiffness = 280,
    springDamping = 28,

    loop = true,
    autoAdvance = false,
    intervalMs = 2800,
    pauseOnHover = true,

    showDots = true,
    className,

    onChangeIndex,
    renderCard,
}: CardStackProps<T>) {
    const reduceMotion = useReducedMotion();
    const len = items.length;

    const [active, setActive] = React.useState(() =>
        wrapIndex(initialIndex, len),
    );
    const [hovering, setHovering] = React.useState(false);

    // keep active in bounds if items change
    React.useEffect(() => {
        setActive((a) => wrapIndex(a, len));
    }, [len]);

    React.useEffect(() => {
        if (!len) return;
        onChangeIndex?.(active, items[active]!);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    const maxOffset = Math.max(0, Math.floor(maxVisible / 2));

    const cardSpacing = Math.max(10, Math.round(cardWidth * (1 - overlap)));
    const stepDeg = maxOffset > 0 ? spreadDeg / maxOffset : 0;

    const canGoPrev = loop || active > 0;
    const canGoNext = loop || active < len - 1;

    const prev = React.useCallback(() => {
        if (!len) return;
        if (!canGoPrev) return;
        setActive((a) => wrapIndex(a - 1, len));
    }, [canGoPrev, len]);

    const next = React.useCallback(() => {
        if (!len) return;
        if (!canGoNext) return;
        setActive((a) => wrapIndex(a + 1, len));
    }, [canGoNext, len]);

    // keyboard navigation (when container focused)
    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
    };

    // autoplay
    React.useEffect(() => {
        if (!autoAdvance) return;
        if (reduceMotion) return;
        if (!len) return;
        if (pauseOnHover && hovering && !isTouchPrimary) return;

        const id = window.setInterval(
            () => {
                if (loop || active < len - 1) next();
            },
            Math.max(700, intervalMs),
        );

        return () => window.clearInterval(id);
    }, [
        autoAdvance,
        intervalMs,
        hovering,
        pauseOnHover,
        reduceMotion,
        len,
        loop,
        active,
        next,
    ]);

    if (!len) return null;

    const activeItem = items[active]!;

    return (
        <div
            className={cn("cs-wrapper", className)}
            onMouseEnter={isTouchPrimary ? undefined : () => setHovering(true)}
            onMouseLeave={isTouchPrimary ? undefined : () => setHovering(false)}
        >
            {/* Stage */}
            <div
                className="cs-stage"
                style={{ height: Math.max(380, cardHeight + 80) }}
                tabIndex={0}
                onKeyDown={onKeyDown}
            >
                {/* background wash / spotlight */}
                <div className="cs-spotlight-top" aria-hidden="true" />
                <div className="cs-spotlight-bottom" aria-hidden="true" />

                <div
                    className="cs-perspective-container"
                    style={{
                        perspective: `${isMobile ? Math.min(perspectivePx, 700) : perspectivePx}px`,
                    }}
                >
                    <AnimatePresence initial={false}>
                        {items.map((item, i) => {
                            const off = signedOffset(i, active, len, loop);
                            const abs = Math.abs(off);
                            const visible = abs <= maxOffset;

                            // hide far-away cards cleanly
                            if (!visible) return null;

                            // fan geometry
                            const rotateZ = off * stepDeg;
                            const x = off * cardSpacing;
                            const y = abs * 10; // subtle arc-down feel
                            const z = -abs * depthPx;

                            const isActive = off === 0;

                            const scale = isActive ? activeScale : inactiveScale;
                            const lift = isActive ? -activeLiftPx : 0;

                            const rotateX = isActive ? 0 : tiltXDeg;

                            const zIndex = 100 - abs;

                            // drag only on the active card
                            const dragProps = isActive
                                ? {
                                    drag: "x" as const,
                                    dragConstraints: { left: 0, right: 0 },
                                    dragElastic: 0.18,
                                    onDragEnd: (
                                        _e: any,
                                        info: { offset: { x: number }; velocity: { x: number } },
                                    ) => {
                                        if (reduceMotion) return;
                                        const travel = info.offset.x;
                                        const v = info.velocity.x;
                                        const threshold = Math.min(160, cardWidth * 0.22);

                                        // swipe logic
                                        if (travel > threshold || v > 650) prev();
                                        else if (travel < -threshold || v < -650) next();
                                    },
                                }
                                : {};

                            return (
                                <motion.div
                                    key={item.id}
                                    className={cn(
                                        "cs-card",
                                        isActive
                                            ? "cs-card-active"
                                            : "cs-card-inactive",
                                    )}
                                    style={{
                                        width: cardWidth,
                                        height: cardHeight,
                                        zIndex,
                                        transformStyle: "preserve-3d",
                                    }}
                                    initial={
                                        reduceMotion
                                            ? false
                                            : {
                                                opacity: 0,
                                                y: y + 40,
                                                x,
                                                rotateZ,
                                                rotateX,
                                                scale,
                                            }
                                    }
                                    animate={{
                                        opacity: 1,
                                        x,
                                        y: y + lift,
                                        rotateZ,
                                        rotateX,
                                        scale,
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: springStiffness,
                                        damping: springDamping,
                                    }}
                                    onClick={() => {
                                        if (isActive && item.href) {
                                            window.open(item.href, '_blank', 'noopener,noreferrer');
                                        } else {
                                            setActive(i);
                                        }
                                    }}
                                    {...dragProps}
                                >
                                    <div
                                        className="cs-card-inner"
                                        style={{
                                            transform: `translateZ(${z}px)`,
                                            transformStyle: "preserve-3d",
                                        }}
                                    >
                                        {renderCard ? (
                                            renderCard(item, { active: isActive })
                                        ) : (
                                            <DefaultFanCard item={item} active={isActive} />
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Dots navigation centered at bottom */}
            {showDots ? (
                <div className="cs-dots-row">
                    <div className="cs-dots">
                        {items.map((it, idx) => {
                            const on = idx === active;
                            return (
                                <button
                                    key={it.id}
                                    onClick={() => setActive(idx)}
                                    className={cn(
                                        "cs-dot",
                                        on ? "cs-dot-active" : "cs-dot-inactive",
                                    )}
                                    aria-label={`Go to ${it.title}`}
                                />
                            );
                        })}
                    </div>
                    {activeItem.href ? (
                        <a
                            href={activeItem.href}
                            target="_blank"
                            rel="noreferrer"
                            className="cs-external-link"
                            aria-label="Open link"
                        >
                            <SquareArrowOutUpRight size={16} />
                        </a>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

function DefaultFanCard({ item, active }: { item: CardStackItem; active: boolean }) {
    return (
        <div className="cs-default-card">
            {/* image */}
            <div className="cs-default-card-image">
                {item.imageSrc ? (
                    <ProgressiveImage
                        src={item.imageSrc}
                        alt={item.title}
                        draggable={false}
                        width={520}
                        height={320}
                        isPriority={active}
                    />
                ) : (
                    <div className="cs-default-card-noimage">
                        No image
                    </div>
                )}
            </div>

            {/* subtle gradient overlay at bottom for text readability */}
            <div className="cs-default-card-overlay" />

            {/* content */}
            <div className="cs-default-card-content">
                <div className="cs-default-card-title">
                    {item.title}
                </div>
                {item.description ? (
                    <div className="cs-default-card-desc">
                        {item.description}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
