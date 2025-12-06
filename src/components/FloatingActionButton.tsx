"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface QuickAction {
    icon: string;
    label: string;
    onClick: () => void;
    color: string;
}

export default function FloatingActionButton() {
    const [isExpanded, setIsExpanded] = useState(false);
    const router = useRouter();

    const actions: QuickAction[] = [
        {
            icon: "🎲",
            label: "Shuffle",
            onClick: () => router.push("/shuffle"),
            color: "#FF6B6B"
        },
        {
            icon: "🔍",
            label: "Search",
            onClick: () => router.push("/search"),
            color: "#4ECDC4"
        },
        {
            icon: "🔄",
            label: "Sync",
            onClick: () => {
                fetch("/api/sync").then(() => window.location.reload());
            },
            color: "#45B7D1"
        }
    ];

    return (
        <div style={{
            position: "fixed",
            bottom: "90px",
            right: "24px",
            zIndex: 1001,
            display: "flex",
            flexDirection: "column-reverse",
            alignItems: "center",
            gap: "12px"
        }}>
            {/* Expanded Actions */}
            <AnimatePresence>
                {isExpanded && actions.map((action, index) => (
                    <motion.button
                        key={action.label}
                        initial={{ opacity: 0, y: 20, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.5 }}
                        transition={{
                            duration: 0.2,
                            delay: index * 0.05,
                            type: "spring",
                            stiffness: 400,
                            damping: 20
                        }}
                        onClick={() => {
                            action.onClick();
                            setIsExpanded(false);
                        }}
                        className="btn-micro"
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "24px",
                            background: "rgba(30, 30, 32, 0.9)",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.3rem",
                            cursor: "pointer",
                            boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px ${action.color}22`
                        }}
                        title={action.label}
                    >
                        {action.icon}
                    </motion.button>
                ))}
            </AnimatePresence>

            {/* Main FAB */}
            <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ rotate: isExpanded ? 45 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "28px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.8rem",
                    cursor: "pointer",
                    boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                    color: "#fff"
                }}
            >
                +
            </motion.button>
        </div>
    );
}
