import React, { useState, useEffect, useRef } from 'react';

interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    width: number | string;
    height: number | string;
    placeholderSrc?: string;
    isPriority?: boolean;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
    src,
    alt,
    width,
    height,
    placeholderSrc,
    isPriority = false,
    className = '',
    style,
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(isPriority);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (isPriority) {
            setShouldLoad(true);
            return;
        }

        const currentImg = imgRef.current;

        // Intersection Observer to determine when the image enters the viewport
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setShouldLoad(true);
                        observer.disconnect();
                    }
                });
            },
            { rootMargin: '200px' } // Start loading slightly before it enters viewport
        );

        if (currentImg) {
            observer.observe(currentImg);
        }

        return () => {
            if (currentImg) {
                observer.unobserve(currentImg);
            }
        };
    }, [isPriority]);

    // Set fetchpriority via DOM to avoid React warning
    useEffect(() => {
        if (imgRef.current) {
            imgRef.current.setAttribute('fetchpriority', isPriority ? 'high' : 'auto');
        }
    }, [isPriority]);

    return (
        <div
            className={`progressive-image-container ${className}`}
            style={{
                width,
                height,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#111', // Placeholder color to prevent CLS
                ...style
            }}
        >
            <img
                ref={imgRef}
                src={shouldLoad ? src : (placeholderSrc || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7')}
                alt={alt}
                width={width}
                height={height}
                loading={isPriority ? 'eager' : 'lazy'}
                onLoad={() => setIsLoaded(true)}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: isLoaded ? 1 : 0,
                    transition: 'opacity 0.4s ease-in-out',
                }}
                {...props}
            />
        </div>
    );
};
