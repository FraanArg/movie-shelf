import { MovieItem } from "@/lib/db";

// Internal badge with check function (server-side only)
interface BadgeDefinition {
    id: string;
    name: string;
    emoji: string;
    description: string;
    requirement: string;
    check: (items: MovieItem[], genreCounts: Record<string, number>) => boolean;
    color: string;
}

// Client-safe badge without check function
export interface Badge {
    id: string;
    name: string;
    emoji: string;
    description: string;
    requirement: string;
    color: string;
    earned?: boolean;
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
    // Collection Size Badges
    {
        id: "film-buff",
        name: "Film Buff",
        emoji: "🎬",
        description: "Building a nice collection",
        requirement: "Watch 50 movies",
        check: (items) => items.filter(i => i.type === "movie").length >= 50,
        color: "#f59e0b",
    },
    {
        id: "cinephile",
        name: "Cinephile",
        emoji: "🎥",
        description: "Truly dedicated to cinema",
        requirement: "Watch 100 movies",
        check: (items) => items.filter(i => i.type === "movie").length >= 100,
        color: "#8b5cf6",
    },
    {
        id: "collector",
        name: "Collector",
        emoji: "🏆",
        description: "An impressive library",
        requirement: "Watch 200 movies",
        check: (items) => items.filter(i => i.type === "movie").length >= 200,
        color: "#eab308",
    },
    // Genre Badges
    {
        id: "horror-aficionado",
        name: "Horror Aficionado",
        emoji: "🎃",
        description: "Lover of the spooky",
        requirement: "Watch 10+ horror films",
        check: (_, genreCounts) => (genreCounts["Horror"] || 0) >= 10,
        color: "#dc2626",
    },
    {
        id: "action-hero",
        name: "Action Hero",
        emoji: "💥",
        description: "Thrill seeker",
        requirement: "Watch 15+ action films",
        check: (_, genreCounts) => (genreCounts["Action"] || 0) >= 15,
        color: "#f97316",
    },
    {
        id: "romantic",
        name: "Hopeless Romantic",
        emoji: "💕",
        description: "Believer in love stories",
        requirement: "Watch 10+ romance films",
        check: (_, genreCounts) => (genreCounts["Romance"] || 0) >= 10,
        color: "#ec4899",
    },
    {
        id: "comedy-fan",
        name: "Comedy Fan",
        emoji: "😂",
        description: "Here for the laughs",
        requirement: "Watch 15+ comedies",
        check: (_, genreCounts) => (genreCounts["Comedy"] || 0) >= 15,
        color: "#fbbf24",
    },
    {
        id: "sci-fi-explorer",
        name: "Sci-Fi Explorer",
        emoji: "🚀",
        description: "Gazing at the stars",
        requirement: "Watch 10+ sci-fi films",
        check: (_, genreCounts) => (genreCounts["Sci-Fi"] || 0) >= 10,
        color: "#06b6d4",
    },
    // Era Badges
    {
        id: "90s-kid",
        name: "90s Kid",
        emoji: "📼",
        description: "Nostalgia for the 90s",
        requirement: "Watch 20+ films from the 90s",
        check: (items) => items.filter(i => {
            const year = parseInt(i.year);
            return year >= 1990 && year < 2000;
        }).length >= 20,
        color: "#a855f7",
    },
    {
        id: "classics-lover",
        name: "Classics Lover",
        emoji: "🎞️",
        description: "Appreciator of the golden age",
        requirement: "Watch 10+ films before 1980",
        check: (items) => items.filter(i => parseInt(i.year) < 1980).length >= 10,
        color: "#78716c",
    },
    {
        id: "modern-viewer",
        name: "Modern Viewer",
        emoji: "✨",
        description: "Keeping up with the times",
        requirement: "Watch 30+ films from 2020s",
        check: (items) => items.filter(i => parseInt(i.year) >= 2020).length >= 30,
        color: "#3b82f6",
    },
    // Quality Badges
    {
        id: "critics-choice",
        name: "Critic's Choice",
        emoji: "⭐",
        description: "Only the best will do",
        requirement: "Watch 10+ films rated 8.0+",
        check: (items) => items.filter(i => parseFloat(i.imdbRating || "0") >= 8.0).length >= 10,
        color: "#fcd34d",
    },
    // Variety Badges
    {
        id: "genre-explorer",
        name: "Genre Explorer",
        emoji: "🎭",
        description: "Eclectic taste",
        requirement: "Watch films from 5+ different genres",
        check: (_, genreCounts) => Object.keys(genreCounts).length >= 5,
        color: "#10b981",
    },
    {
        id: "binge-watcher",
        name: "Binge Watcher",
        emoji: "📺",
        description: "TV series enthusiast",
        requirement: "Watch 10+ TV shows",
        check: (items) => items.filter(i => i.type === "series").length >= 10,
        color: "#6366f1",
    },
];

// Convert BadgeDefinition to client-safe Badge (strips the check function)
function toClientBadge(def: BadgeDefinition, earned: boolean = false): Badge {
    return {
        id: def.id,
        name: def.name,
        emoji: def.emoji,
        description: def.description,
        requirement: def.requirement,
        color: def.color,
        earned,
    };
}

export function getEarnedBadges(items: MovieItem[], genreCounts: Record<string, number>): Badge[] {
    return BADGE_DEFINITIONS
        .filter(badge => badge.check(items, genreCounts))
        .map(badge => toClientBadge(badge, true));
}

export function getAllBadges(): Badge[] {
    return BADGE_DEFINITIONS.map(badge => toClientBadge(badge, false));
}

// Get all badges with earned status
export function getBadgesWithStatus(items: MovieItem[], genreCounts: Record<string, number>): Badge[] {
    return BADGE_DEFINITIONS.map(badge => toClientBadge(badge, badge.check(items, genreCounts)));
}
