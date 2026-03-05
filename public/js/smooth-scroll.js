// =====================================================
// SMOOTH SCROLL & PARALLAX - GSAP + Lenis Integration
// Based on Osmo Supply parallax component
// =====================================================

(function () {
    'use strict';

    // Detect mobile for reduced parallax
    const isMobileDevice = window.matchMedia('(pointer: coarse)').matches && window.innerWidth <= 1024;

    // Register ScrollTrigger plugin first (before any usage)
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2
    });

    // Connect Lenis to ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Update scroll progress bar with auto-hide
    const progressBar = document.getElementById('scrollProgressBar');
    const progressContainer = document.querySelector('.scroll-progress');
    let scrollTimeout;

    lenis.on('scroll', ({ progress }) => {
        if (progressBar) {
            progressBar.style.height = `${progress * 100}%`;
        }

        // Show progress bar
        if (progressContainer) {
            progressContainer.classList.add('visible');

            // Clear existing timeout
            clearTimeout(scrollTimeout);

            // Hide after 2.5 seconds of no scrolling
            scrollTimeout = setTimeout(() => {
                progressContainer.classList.remove('visible');
            }, 2500);
        }
    });

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Wait for DOM to be ready
    function init() {
        // =====================================================
        // SCROLL REVEAL ANIMATIONS
        // =====================================================

        // Animate section labels
        gsap.utils.toArray('.section-label').forEach(label => {
            gsap.from(label, {
                scrollTrigger: {
                    trigger: label,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                x: -30,
                duration: 0.6,
                ease: 'power2.out'
            });
        });

        // Animate headings
        gsap.utils.toArray('.about-headline, .trading-quote, .cta-headline').forEach(heading => {
            gsap.from(heading, {
                scrollTrigger: {
                    trigger: heading,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                y: 40,
                duration: 0.8,
                ease: 'power3.out'
            });
        });

        // Animate service cards with stagger
        const serviceCards = gsap.utils.toArray('.service-card');
        if (serviceCards.length) {
            gsap.from(serviceCards, {
                scrollTrigger: {
                    trigger: '.services-grid',
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                y: 60,
                stagger: 0.1,
                duration: 0.7,
                ease: 'power2.out'
            });
        }

        // Animate project cards with stagger
        const projectCards = gsap.utils.toArray('.project-card');
        if (projectCards.length) {
            gsap.from(projectCards, {
                scrollTrigger: {
                    trigger: '.work-grid',
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                y: 80,
                stagger: 0.15,
                duration: 0.8,
                ease: 'power3.out'
            });
        }

        // Animate process steps
        const processSteps = gsap.utils.toArray('.process-step');
        if (processSteps.length) {
            gsap.from(processSteps, {
                scrollTrigger: {
                    trigger: '.process-grid',
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                x: -40,
                stagger: 0.1,
                duration: 0.6,
                ease: 'power2.out'
            });
        }

        // Animate trading stats
        const stats = gsap.utils.toArray('.stat');
        if (stats.length) {
            gsap.from(stats, {
                scrollTrigger: {
                    trigger: '.trading-stats',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                y: 30,
                scale: 0.9,
                stagger: 0.1,
                duration: 0.5,
                ease: 'back.out(1.7)'
            });
        }

        // =====================================================
        // PARALLAX EFFECTS
        // =====================================================

        // Hero section parallax
        const hero = document.querySelector('.hero');
        if (hero) {
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                gsap.to(heroContent, {
                    scrollTrigger: {
                        trigger: hero,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: 0.5
                    },
                    y: isMobileDevice ? 60 : 150,
                    opacity: 0.3,
                    ease: 'none'
                });
            }

            const scrollIndicator = document.querySelector('.scroll-indicator');
            if (scrollIndicator) {
                gsap.to(scrollIndicator, {
                    scrollTrigger: {
                        trigger: hero,
                        start: 'top top',
                        end: '30% top',
                        scrub: 0.3
                    },
                    opacity: 0,
                    y: 30,
                    ease: 'none'
                });
            }
        }

        // Project images parallax on hover
        const projectPlaceholders = document.querySelectorAll('.project-placeholder');
        projectPlaceholders.forEach(placeholder => {
            gsap.to(placeholder, {
                scrollTrigger: {
                    trigger: placeholder,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.5
                },
                y: isMobileDevice ? -10 : -30,
                ease: 'none'
            });
        });

        // 3D Gallery scroll integration - dispatch progress to gallery
        // Pin the section so it stays on screen longer for a slower, immersive parallax
        const gallerySection = document.querySelector('.gallery-section');
        if (gallerySection) {
            ScrollTrigger.create({
                trigger: gallerySection,
                start: 'top top',
                end: isMobileDevice ? '+=100%' : '+=200%',
                pin: true,
                scrub: 1,
                onUpdate: (self) => {
                    window.dispatchEvent(new CustomEvent('gallery-scroll', {
                        detail: { progress: self.progress }
                    }));
                }
            });
        }

        // Section background parallax
        const trading = document.querySelector('.trading');
        if (trading) {
            gsap.to('.trading', {
                scrollTrigger: {
                    trigger: trading,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                },
                backgroundPosition: '50% 30%',
                ease: 'none'
            });
        }

        // =====================================================
        // SMOOTH ANCHOR LINKS
        // =====================================================
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    lenis.scrollTo(target, {
                        offset: -100,
                        duration: 1.2
                    });
                }
            });
        });

    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        ScrollTrigger.getAll().forEach(st => st.kill());
        lenis.destroy();
    });
})();
