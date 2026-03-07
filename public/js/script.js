// =====================================================
// VOXEL PORTFOLIO - JavaScript
// =====================================================
import { isTouchPrimary, isMobile } from './mobile-detect.js';

document.addEventListener('DOMContentLoaded', () => {
    // Navigation scroll effect
    const nav = document.getElementById('nav');
    const scrollThreshold = 100;

    const handleScroll = () => {
        if (window.scrollY > scrollThreshold) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Menu toggle (MENU button) - Dropdown Panel
    const navMenuBtn = document.getElementById('navMenuBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    let menuOpen = false;
    let isAnimating = false;

    const closeMenu = () => {
        if (isAnimating) return;
        isAnimating = true;

        // Add closing class to trigger exit animation
        dropdownMenu.classList.add('closing');

        // Wait for exit animation to complete, then remove classes
        setTimeout(() => {
            dropdownMenu.classList.remove('active', 'closing');
            menuOpen = false;
            isAnimating = false;
            if (navMenuBtn) navMenuBtn.textContent = 'MENU';
        }, 400); // Match the exit animation duration
    };

    navMenuBtn?.addEventListener('click', () => {
        if (isAnimating) return;

        if (menuOpen) {
            closeMenu();
        } else {
            menuOpen = true;
            dropdownMenu.classList.add('active');
            navMenuBtn.textContent = 'CLOSE';
        }
    });

    // Close dropdown menu on link click
    document.querySelectorAll('.dropdown-link').forEach(link => {
        link.addEventListener('click', () => {
            if (menuOpen) closeMenu();
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Scroll reveal animations
    const revealElements = document.querySelectorAll('.service-card, .project-card, .process-step, .stat');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s cubic-bezier(0.33, 1, 0.68, 1), transform 0.6s cubic-bezier(0.33, 1, 0.68, 1)';
        revealObserver.observe(el);
    });

    // Section label animations
    const sectionLabels = document.querySelectorAll('.section-label:not(.hero .section-label)');

    const labelObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
                labelObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    sectionLabels.forEach(label => {
        label.style.opacity = '0';
        label.style.transform = 'translateX(-20px)';
        label.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        labelObserver.observe(label);
    });

    // Hero parallax handled by GSAP in smooth-scroll.js — removed duplicate listener

    // Project card hover/touch effect
    const projectCards = document.querySelectorAll('.project-card');
    if (isTouchPrimary) {
        // On touch: highlight the card that's most in view
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                entry.target.style.zIndex = entry.isIntersecting ? '10' : '';
            });
        }, { threshold: 0.6 });
        projectCards.forEach(c => cardObserver.observe(c));
    } else {
        // Desktop: keep original mouseenter/leave
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', function () {
                this.style.zIndex = '10';
            });
            card.addEventListener('mouseleave', function () {
                this.style.zIndex = '';
            });
        });
    }

    // =====================================================
    // IMAGE MOTION TRAIL EFFECT
    // =====================================================
    const initImageMotionTrail = () => {
        const wrapper = document.querySelector('.motion-trail-wrapper');
        const heroSection = document.querySelector('.hero');
        if (!wrapper || !heroSection) return;

        // Get all existing trail images from the HTML
        const imgElements = wrapper.querySelectorAll('.trail-img');
        if (imgElements.length === 0) return;

        // Create trail image objects with tracking data
        const trailImages = Array.from(imgElements).map(img => ({
            el: img,
            x: 0,
            y: 0,
            rotation: 0
        }));

        // --- TOUCH DEVICES: Gyroscope parallax or idle animation ---
        if (isTouchPrimary) {
            let gyroActive = false;
            let tiltX = 0;
            let tiltY = 0;

            const handleOrientation = (e) => {
                gyroActive = true;
                tiltX = (e.gamma || 0) * 0.3;  // Left-right tilt
                tiltY = (e.beta || 0) * 0.15;  // Front-back tilt, clamped
                tiltY = Math.max(-30, Math.min(30, tiltY));
            };

            const startGyro = () => {
                window.addEventListener('deviceorientation', handleOrientation, true);
                // If no events fire within 1s, fall back to idle CSS animation
                setTimeout(() => {
                    if (!gyroActive) {
                        window.removeEventListener('deviceorientation', handleOrientation, true);
                        wrapper.classList.add('touch-idle-animation');
                    }
                }, 1000);
            };

            // iOS 13+ requires permission for DeviceOrientation
            if (typeof DeviceOrientationEvent !== 'undefined' &&
                typeof DeviceOrientationEvent.requestPermission === 'function') {
                // iOS: request on first tap
                const requestPermission = () => {
                    DeviceOrientationEvent.requestPermission()
                        .then(state => {
                            if (state === 'granted') startGyro();
                            else wrapper.classList.add('touch-idle-animation');
                        })
                        .catch(() => wrapper.classList.add('touch-idle-animation'));
                    document.removeEventListener('touchstart', requestPermission);
                };
                document.addEventListener('touchstart', requestPermission, { once: true });
                // Add idle animation initially until permission is granted
                wrapper.classList.add('touch-idle-animation');
            } else if (window.DeviceOrientationEvent) {
                // Android: auto-start
                startGyro();
            } else {
                // No gyroscope
                wrapper.classList.add('touch-idle-animation');
            }

            // Gyroscope animation loop (only runs if gyro is active)
            const animateGyro = () => {
                if (gyroActive) {
                    trailImages.forEach((item, index) => {
                        const speed = 0.02 + (index * 0.005);
                        item.x += (tiltX - item.x) * speed;
                        item.y += (tiltY - item.y) * speed;
                        item.el.style.transform = `translateX(${item.x}px) translateY(${item.y}px)`;
                    });
                }
                requestAnimationFrame(animateGyro);
            };
            animateGyro();
            return; // Skip desktop mouse setup
        }

        // --- DESKTOP: Original mouse tracking ---
        let mouseX = 0;
        let mouseY = 0;

        const handleMouseMove = (e) => {
            const rect = wrapper.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            let rawX = (e.clientX - centerX) * 0.1;
            let rawY = (e.clientY - centerY) * 0.14;
            const maxYOffset = 400;
            mouseX = rawX;
            mouseY = Math.max(-maxYOffset, Math.min(maxYOffset, rawY));
        };

        let trailRafId = null;
        const animate = () => {
            trailImages.forEach((item, index) => {
                const speed = 0.02 + (index * 0.005);
                item.x += (mouseX - item.x) * speed;
                item.y += (mouseY - item.y) * speed;
                const targetRotation = mouseX * 0.1;
                item.rotation += (targetRotation - item.rotation) * speed;
                item.el.style.transform = `translateX(${item.x}px) translateY(${item.y}px) rotateZ(${item.rotation}deg)`;
            });
            trailRafId = requestAnimationFrame(animate);
        };

        document.addEventListener('mousemove', handleMouseMove);

        // Only run motion trail rAF loop when hero is visible
        const heroObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                if (!trailRafId) trailRafId = requestAnimationFrame(animate);
            } else {
                if (trailRafId) { cancelAnimationFrame(trailRafId); trailRafId = null; }
            }
        }, { rootMargin: '100px' });
        heroObserver.observe(heroSection);
    };

    initImageMotionTrail();

    // =====================================================
    // BUTTON TEXT ANIMATION
    // =====================================================
    const initButtonAnimation = () => {
        const btns = document.querySelectorAll('.glass-btn');
        if (btns.length === 0) return;

        btns.forEach(btn => {
            const text = btn.textContent.trim();
            btn.innerHTML = '';

            const wrapper = document.createElement('span');
            wrapper.className = 'text-wrapper';

            text.split('').forEach((char, index) => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.className = 'char';
                span.style.transitionDelay = `${index * 0.02}s`;
                wrapper.appendChild(span);
            });

            btn.appendChild(wrapper);
        });

        // On touch devices: trigger button reveal when scrolled into view
        if (isTouchPrimary) {
            const btnObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        btnObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            btns.forEach(btn => btnObserver.observe(btn));
        }
    };

    initButtonAnimation();

    // =====================================================
    // SCROLL TEXT REVEAL (GSAP)
    // =====================================================
    const initScrollReveal = () => {
        const headline = document.querySelector('.glass-headline');
        if (!headline) return;

        // Clean text: collapse multiple spaces/newlines into single space
        const rawText = headline.textContent.trim().replace(/\s+/g, ' ');

        // Clear content
        headline.innerHTML = '';

        // Split into characters
        const chars = rawText.split('');

        chars.forEach((char) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.opacity = '0.2'; // Start dim
            headline.appendChild(span);
        });

        // Animate with GSAP
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);

            const spans = headline.querySelectorAll('span');

            gsap.to(spans, {
                opacity: 1,
                stagger: 0.5, // Large number relative to scrub duration distributes it evenly
                ease: "power2.out", // Soft ease
                scrollTrigger: {
                    trigger: headline,
                    start: "top 90%",  // Start when top enters bottom 10%
                    end: "bottom 60%", // End when bottom is near center
                    scrub: 1,
                }
            });
        }
    };

    initScrollReveal();

});
