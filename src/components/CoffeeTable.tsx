"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import Case from "./Case";
import { MovieItem } from "@/lib/db";

interface CoffeeTableProps {
    movies: MovieItem[];
}

export default function CoffeeTable({ movies }: CoffeeTableProps) {
    const [stack, setStack] = useState(movies.slice(0, 5)); // Only show top 5

    const removeCard = (id: string | number) => {
        setStack((prev) => prev.filter((movie) => movie.id !== id));
    };

    return (
        <div style={{
            width: "100%",
            height: "500px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            perspective: "1000px",
            marginBottom: "40px"
        }}>
            {/* Table Surface Hint */}
            <div style={{
                position: "absolute",
                bottom: "50px",
                width: "80%",
                height: "300px",
                background: "radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 70%)",
                transform: "rotateX(60deg)",
                zIndex: 0,
                pointerEvents: "none"
            }} />

            <div style={{ position: "relative", width: "220px", height: "330px", zIndex: 1 }}>
                <AnimatePresence>
                    {stack.map((movie, index) => {
                        const isTop = index === stack.length - 1;
                        return (
                            <DraggableCase
                                key={movie.id}
                                movie={movie}
                                index={index}
                                total={stack.length}
                                isTop={isTop}
                                onRemove={() => removeCard(movie.id)}
                            />
                        );
                    })}
                </AnimatePresence>

                {stack.length === 0 && (
                    <div style={{
                        position: "absolute",
                        top: 0, left: 0, right: 0, bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "rgba(255,255,255,0.3)",
                        fontSize: "1.2rem",
                        fontWeight: "500",
                        fontFamily: "var(--font-oswald)",
                        textTransform: "uppercase",
                        letterSpacing: "2px"
                    }}>
                        Nothing Up Next
                    </div>
                )}
            </div>
        </div>
    );
}

function DraggableCase({ movie, index, total, isTop, onRemove }: {
    movie: MovieItem,
    index: number,
    total: number,
    isTop: boolean,
    onRemove: () => void
}) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-30, 30]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    // Random rotation for the "messy" look, stable based on ID
    const randomRotate = (movie.title.length % 10) - 5;

    return (
        <motion.div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: index,
                x: isTop ? x : 0,
                rotate: isTop ? rotate : randomRotate,
                opacity: isTop ? opacity : 1,
                scale: 1 - (total - 1 - index) * 0.05, // Stack depth effect
                y: (total - 1 - index) * -5, // Stack height effect
            }}
            drag={isTop ? "x" : false}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.7} // Bouncy feel
            onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 150) {
                    onRemove();
                }
            }}
            whileHover={isTop ? { scale: 1.05, cursor: "grab" } : {}}
            whileTap={isTop ? { cursor: "grabbing" } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <Case movie={movie} priority={isTop} />
        </motion.div>
    );
}
