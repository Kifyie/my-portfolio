import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import InfiniteGallery from '@/components/ui/3d-gallery-photography';
import { Component as LuminaSlider } from '@/components/ui/lumina-interactive-list';
import './css/gallery.css';

// Load Sail font from Google Fonts
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://fonts.googleapis.com/css2?family=Sail&display=swap';
document.head.appendChild(link);

class ErrorBoundary extends React.Component<
    { children: React.ReactNode; fallback: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('Gallery Error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

function GalleryApp() {
    return (
        <ErrorBoundary
            fallback={
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255,255,255,0.5)',
                        fontFamily: "'Inter', sans-serif",
                    }}
                >
                    <p>Gallery could not be loaded.</p>
                </div>
            }
        >
            <main style={{ position: 'relative', width: '100%', height: '100%' }}>
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        padding: '0 12px',
                        mixBlendMode: 'exclusion',
                        color: '#ffffff',
                    }}
                >
                    <h2
                        style={{
                            fontFamily: "'Sail', cursive",
                            fontSize: 'clamp(36px, 7vw, 84px)',
                            letterSpacing: '0.02em',
                            margin: 0,
                        }}
                    >
                        My Photography
                    </h2>
                </div>
            </main>
        </ErrorBoundary>
    );
}

// Mount into #gallery-root when DOM is ready
function mount() {
    const rootElement = document.getElementById('gallery-root');
    if (rootElement) {
        const root = createRoot(rootElement);
        root.render(<GalleryApp />);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
} else {
    mount();
}

// --- Lumina Slider Hero Background ---
function mountLuminaHero() {
    const heroRoot = document.getElementById('lumina-hero-root');
    if (heroRoot) {
        const root = createRoot(heroRoot);
        root.render(<LuminaSlider />);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountLuminaHero);
} else {
    mountLuminaHero();
}

// --- CardStack Section ---
import { CardStack, CardStackItem } from '@/components/ui/card-stack';
import './css/card-stack.css';

const cardStackItems: CardStackItem[] = [
    {
        id: 1,
        title: "Voxura",
        description: "Pixel-art branding with cherry blossom aesthetics",
        imageSrc: "/images/works/1.webp",
        href: "https://discord.gg/VcjXCUn6NZ",
    },
    {
        id: 2,
        title: "Voxmov",
        description: "Premium logo & brand identity design",
        imageSrc: "/images/works/2.webp",
        href: "https://voxmov.live/",
    },
    {
        id: 3,
        title: "Voxani",
        description: "Sleek brand identity with emerald tones",
        imageSrc: "/images/works/3.webp",
        href: "https://voxani.live/",
    },
    {
        id: 4,
        title: "Anime m3u8 Scrapper",
        description: "Automated streaming data extraction tool",
        imageSrc: "/images/works/4.webp",
    },
    {
        id: 5,
        title: "Web IDE",
        description: "Real-time sync code editor in the browser",
        imageSrc: "/images/works/5.webp",
    },
];

function CardStackApp() {
    return (
        <CardStack
            items={cardStackItems}
            initialIndex={0}
            autoAdvance
            intervalMs={2000}
            pauseOnHover
            showDots
        />
    );
}

function mountCardStack() {
    const rootEl = document.getElementById('cardstack-root');
    if (rootEl) {
        const root = createRoot(rootEl);
        root.render(<CardStackApp />);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountCardStack);
} else {
    mountCardStack();
}
