"use client";

import { useState, useCallback } from "react";
import Image, { ImageProps } from "next/image";

interface BlurUpImageProps extends Omit<ImageProps, "onLoad"> {
    lowQualitySrc?: string;
}

export default function BlurUpImage({ src, alt, lowQualitySrc, className = "", ...props }: BlurUpImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    const handleLoad = useCallback(() => {
        setIsLoaded(true);
    }, []);

    return (
        <Image
            src={src}
            alt={alt}
            className={`blur-up ${isLoaded ? "loaded" : ""} ${className}`}
            onLoad={handleLoad}
            {...props}
        />
    );
}
