"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
    decimals?: number;
}

export default function AnimatedCounter({
    value,
    duration = 1.5,
    suffix = "",
    prefix = "",
    decimals = 0,
}: AnimatedCounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const [hasAnimated, setHasAnimated] = useState(false);

    const spring = useSpring(0, {
        duration: duration * 1000,
        bounce: 0,
    });

    const display = useTransform(spring, (current) => {
        return `${prefix}${current.toFixed(decimals)}${suffix}`;
    });

    useEffect(() => {
        if (isInView && !hasAnimated) {
            spring.set(value);
            setHasAnimated(true);
        }
    }, [isInView, value, spring, hasAnimated]);

    return (
        <motion.span ref={ref}>
            {hasAnimated ? <motion.span>{display}</motion.span> : `${prefix}0${suffix}`}
        </motion.span>
    );
}
