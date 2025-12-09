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
    // ============ COLLECTION SIZE MILESTONES ============
    {
        id: "first-steps",
        name: "First Steps",
        emoji: "👶",
        description: "Every journey begins here",
        requirement: "Watch your first movie",
        check: (items) => items.filter(i => i.type === "movie").length >= 1,
        color: "#10b981",
    },
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
    {
        id: "movie-vault",
        name: "Movie Vault",
        emoji: "🏛️",
        description: "Your own personal archive",
        requirement: "Watch 500 movies",
        check: (items) => items.filter(i => i.type === "movie").length >= 500,
        color: "#7c3aed",
    },
    {
        id: "legendary",
        name: "Legendary",
        emoji: "👑",
        description: "A true legend of cinema",
        requirement: "Watch 1000 movies",
        check: (items) => items.filter(i => i.type === "movie").length >= 1000,
        color: "#fbbf24",
    },

    // ============ GENRE BADGES ============
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
        id: "scream-queen",
        name: "Scream Queen",
        emoji: "👻",
        description: "Master of terror",
        requirement: "Watch 50+ horror films",
        check: (_, genreCounts) => (genreCounts["Horror"] || 0) >= 50,
        color: "#7f1d1d",
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
        check: (_, genreCounts) => (genreCounts["Science Fiction"] || 0) + (genreCounts["Sci-Fi"] || 0) >= 10,
        color: "#06b6d4",
    },
    {
        id: "drama-queen",
        name: "Drama Enthusiast",
        emoji: "🎭",
        description: "Feeling all the emotions",
        requirement: "Watch 25+ drama films",
        check: (_, genreCounts) => (genreCounts["Drama"] || 0) >= 25,
        color: "#a855f7",
    },
    {
        id: "thriller-seeker",
        name: "Thriller Seeker",
        emoji: "🔪",
        description: "Living on the edge",
        requirement: "Watch 15+ thriller films",
        check: (_, genreCounts) => (genreCounts["Thriller"] || 0) >= 15,
        color: "#1e293b",
    },
    {
        id: "animation-lover",
        name: "Animation Lover",
        emoji: "🎨",
        description: "Appreciating the art form",
        requirement: "Watch 15+ animated films",
        check: (_, genreCounts) => (genreCounts["Animation"] || 0) >= 15,
        color: "#f472b6",
    },
    {
        id: "documentary-buff",
        name: "Documentary Buff",
        emoji: "🎓",
        description: "Seeker of truth",
        requirement: "Watch 10+ documentaries",
        check: (_, genreCounts) => (genreCounts["Documentary"] || 0) >= 10,
        color: "#22c55e",
    },
    {
        id: "fantasy-dreamer",
        name: "Fantasy Dreamer",
        emoji: "🧙",
        description: "Believer in magic",
        requirement: "Watch 10+ fantasy films",
        check: (_, genreCounts) => (genreCounts["Fantasy"] || 0) >= 10,
        color: "#8b5cf6",
    },
    {
        id: "crime-investigator",
        name: "Crime Investigator",
        emoji: "🕵️",
        description: "Always solving mysteries",
        requirement: "Watch 15+ crime films",
        check: (_, genreCounts) => (genreCounts["Crime"] || 0) + (genreCounts["Mystery"] || 0) >= 15,
        color: "#64748b",
    },
    {
        id: "war-historian",
        name: "War Historian",
        emoji: "⚔️",
        description: "Witness to history",
        requirement: "Watch 10+ war films",
        check: (_, genreCounts) => (genreCounts["War"] || 0) >= 10,
        color: "#78716c",
    },
    {
        id: "western-rider",
        name: "Western Rider",
        emoji: "🤠",
        description: "Saddle up, partner",
        requirement: "Watch 5+ western films",
        check: (_, genreCounts) => (genreCounts["Western"] || 0) >= 5,
        color: "#c2410c",
    },

    // ============ ERA BADGES ============
    {
        id: "golden-age",
        name: "Golden Age Fan",
        emoji: "🎩",
        description: "Appreciating Hollywood's finest",
        requirement: "Watch 5+ films before 1960",
        check: (items) => items.filter(i => parseInt(i.year) < 1960).length >= 5,
        color: "#d97706",
    },
    {
        id: "classics-lover",
        name: "Classics Lover",
        emoji: "🎞️",
        description: "Appreciator of the silver age",
        requirement: "Watch 10+ films before 1980",
        check: (items) => items.filter(i => parseInt(i.year) < 1980).length >= 10,
        color: "#78716c",
    },
    {
        id: "80s-enthusiast",
        name: "80s Enthusiast",
        emoji: "🕹️",
        description: "Totally radical, dude!",
        requirement: "Watch 15+ films from the 80s",
        check: (items) => items.filter(i => {
            const year = parseInt(i.year);
            return year >= 1980 && year < 1990;
        }).length >= 15,
        color: "#ec4899",
    },
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
        id: "y2k-survivor",
        name: "Y2K Survivor",
        emoji: "💿",
        description: "Embracing the new millennium",
        requirement: "Watch 30+ films from the 2000s",
        check: (items) => items.filter(i => {
            const year = parseInt(i.year);
            return year >= 2000 && year < 2010;
        }).length >= 30,
        color: "#3b82f6",
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

    // ============ DIRECTOR BADGES ============
    {
        id: "nolan-fan",
        name: "Nolan Devotee",
        emoji: "🌀",
        description: "Mind-bending cinema",
        requirement: "Watch 5+ Christopher Nolan films",
        check: (items) => items.filter(i => i.Director?.includes("Christopher Nolan")).length >= 5,
        color: "#1e40af",
    },
    {
        id: "spielberg-fan",
        name: "Spielberg Admirer",
        emoji: "🦖",
        description: "Hollywood's greatest storyteller",
        requirement: "Watch 5+ Steven Spielberg films",
        check: (items) => items.filter(i => i.Director?.includes("Steven Spielberg")).length >= 5,
        color: "#059669",
    },
    {
        id: "tarantino-fan",
        name: "Tarantino Fanatic",
        emoji: "🩸",
        description: "Pulp aficionado",
        requirement: "Watch 5+ Quentin Tarantino films",
        check: (items) => items.filter(i => i.Director?.includes("Quentin Tarantino")).length >= 5,
        color: "#dc2626",
    },
    {
        id: "scorsese-fan",
        name: "Scorsese Scholar",
        emoji: "🎰",
        description: "Gangster cinema expert",
        requirement: "Watch 5+ Martin Scorsese films",
        check: (items) => items.filter(i => i.Director?.includes("Martin Scorsese")).length >= 5,
        color: "#7f1d1d",
    },
    {
        id: "kubrick-fan",
        name: "Kubrick Connoisseur",
        emoji: "🎯",
        description: "Perfectionist's choice",
        requirement: "Watch 5+ Stanley Kubrick films",
        check: (items) => items.filter(i => i.Director?.includes("Stanley Kubrick")).length >= 5,
        color: "#18181b",
    },
    {
        id: "fincher-fan",
        name: "Fincher Follower",
        emoji: "🔍",
        description: "Dark and meticulous",
        requirement: "Watch 4+ David Fincher films",
        check: (items) => items.filter(i => i.Director?.includes("David Fincher")).length >= 4,
        color: "#27272a",
    },
    {
        id: "villeneuve-fan",
        name: "Villeneuve Voyager",
        emoji: "🏜️",
        description: "Epic scale cinema",
        requirement: "Watch 4+ Denis Villeneuve films",
        check: (items) => items.filter(i => i.Director?.includes("Denis Villeneuve")).length >= 4,
        color: "#d97706",
    },
    {
        id: "wes-anderson-fan",
        name: "Wes Anderson Aesthetic",
        emoji: "🎀",
        description: "Symmetry is everything",
        requirement: "Watch 4+ Wes Anderson films",
        check: (items) => items.filter(i => i.Director?.includes("Wes Anderson")).length >= 4,
        color: "#fb7185",
    },
    {
        id: "miyazaki-fan",
        name: "Miyazaki Dreamer",
        emoji: "🌿",
        description: "Studio Ghibli enthusiast",
        requirement: "Watch 4+ Hayao Miyazaki films",
        check: (items) => items.filter(i => i.Director?.includes("Hayao Miyazaki")).length >= 4,
        color: "#16a34a",
    },

    // ============ RUNTIME BADGES ============
    {
        id: "short-burst",
        name: "Quick Watch",
        emoji: "⚡",
        description: "Sometimes less is more",
        requirement: "Watch 10+ films under 90 minutes",
        check: (items) => items.filter(i => {
            const runtime = parseInt(i.Runtime || "0");
            return runtime > 0 && runtime < 90;
        }).length >= 10,
        color: "#fbbf24",
    },
    {
        id: "marathon-runner",
        name: "Marathon Runner",
        emoji: "🏃",
        description: "Endurance viewer",
        requirement: "Watch 10+ films over 150 minutes",
        check: (items) => items.filter(i => {
            const runtime = parseInt(i.Runtime || "0");
            return runtime >= 150;
        }).length >= 10,
        color: "#ef4444",
    },
    {
        id: "epic-viewer",
        name: "Epic Viewer",
        emoji: "⏳",
        description: "Patience is a virtue",
        requirement: "Watch 5+ films over 180 minutes",
        check: (items) => items.filter(i => {
            const runtime = parseInt(i.Runtime || "0");
            return runtime >= 180;
        }).length >= 5,
        color: "#7c3aed",
    },

    // ============ QUALITY BADGES ============
    {
        id: "critics-choice",
        name: "Critic's Choice",
        emoji: "⭐",
        description: "Only the best will do",
        requirement: "Watch 10+ films rated 8.0+",
        check: (items) => items.filter(i => parseFloat(i.imdbRating || "0") >= 8.0).length >= 10,
        color: "#fcd34d",
    },
    {
        id: "masterpiece-hunter",
        name: "Masterpiece Hunter",
        emoji: "🌟",
        description: "Seeking perfection",
        requirement: "Watch 5+ films rated 9.0+",
        check: (items) => items.filter(i => parseFloat(i.imdbRating || "0") >= 9.0).length >= 5,
        color: "#fbbf24",
    },
    {
        id: "hidden-gem-finder",
        name: "Hidden Gem Finder",
        emoji: "💎",
        description: "Discovering the underrated",
        requirement: "Watch 10+ films rated between 6.0-7.0",
        check: (items) => items.filter(i => {
            const rating = parseFloat(i.imdbRating || "0");
            return rating >= 6.0 && rating < 7.0;
        }).length >= 10,
        color: "#06b6d4",
    },
    {
        id: "guilty-pleasure",
        name: "Guilty Pleasure",
        emoji: "🍿",
        description: "Not everything needs to be art",
        requirement: "Watch 5+ films rated under 5.0",
        check: (items) => items.filter(i => {
            const rating = parseFloat(i.imdbRating || "0");
            return rating > 0 && rating < 5.0;
        }).length >= 5,
        color: "#f472b6",
    },

    // ============ VARIETY BADGES ============
    {
        id: "genre-explorer",
        name: "Genre Explorer",
        emoji: "🧭",
        description: "Eclectic taste",
        requirement: "Watch films from 5+ different genres",
        check: (_, genreCounts) => Object.keys(genreCounts).length >= 5,
        color: "#10b981",
    },
    {
        id: "genre-master",
        name: "Genre Master",
        emoji: "🌈",
        description: "Truly diverse taste",
        requirement: "Watch films from 10+ different genres",
        check: (_, genreCounts) => Object.keys(genreCounts).length >= 10,
        color: "#6366f1",
    },
    {
        id: "world-cinema",
        name: "World Cinema",
        emoji: "🌍",
        description: "International taste",
        requirement: "Watch 20+ non-English films",
        check: (items) => items.filter(i => {
            // Rough check - if Director name doesn't look English
            const dir = i.Director || "";
            return dir && !dir.includes("N/A") && (
                dir.includes("Hayao") || dir.includes("Bong") ||
                dir.includes("Park") || dir.includes("Zhang") ||
                dir.includes("Guillermo") || dir.includes("Pedro") ||
                dir.includes("Jean") || dir.includes("François")
            );
        }).length >= 5,
        color: "#0891b2",
    },

    // ============ TV SERIES BADGES ============
    {
        id: "binge-watcher",
        name: "Binge Watcher",
        emoji: "📺",
        description: "TV series enthusiast",
        requirement: "Watch 10+ TV shows",
        check: (items) => items.filter(i => i.type === "series").length >= 10,
        color: "#6366f1",
    },
    {
        id: "series-addict",
        name: "Series Addict",
        emoji: "🎬",
        description: "Can't stop, won't stop",
        requirement: "Watch 30+ TV shows",
        check: (items) => items.filter(i => i.type === "series").length >= 30,
        color: "#8b5cf6",
    },
    {
        id: "prestige-tv",
        name: "Prestige TV",
        emoji: "🏅",
        description: "Peak television connoisseur",
        requirement: "Watch 50+ TV shows",
        check: (items) => items.filter(i => i.type === "series").length >= 50,
        color: "#7c3aed",
    },

    // ============ SPECIAL ACHIEVEMENTS ============
    {
        id: "night-owl",
        name: "Night Owl",
        emoji: "🦉",
        description: "Late night screenings",
        requirement: "Have 50+ late watches (after 10pm)",
        check: (items) => items.filter(i => {
            const date = new Date(i.date);
            return date.getHours() >= 22 || date.getHours() < 4;
        }).length >= 50,
        color: "#1e1b4b",
    },
    {
        id: "early-bird",
        name: "Early Bird",
        emoji: "🐦",
        description: "Morning movie person",
        requirement: "Have 20+ morning watches (before 10am)",
        check: (items) => items.filter(i => {
            const date = new Date(i.date);
            return date.getHours() >= 6 && date.getHours() < 10;
        }).length >= 20,
        color: "#fbbf24",
    },
    {
        id: "weekend-warrior",
        name: "Weekend Warrior",
        emoji: "🛋️",
        description: "Weekends are for movies",
        requirement: "Have 100+ weekend watches",
        check: (items) => items.filter(i => {
            const day = new Date(i.date).getDay();
            return day === 0 || day === 6;
        }).length >= 100,
        color: "#f97316",
    },
    {
        id: "new-years-eve",
        name: "New Year's Movie",
        emoji: "🎆",
        description: "Celebrating with cinema",
        requirement: "Watch something on December 31st",
        check: (items) => items.some(i => {
            const d = new Date(i.date);
            return d.getMonth() === 11 && d.getDate() === 31;
        }),
        color: "#fbbf24",
    },
    {
        id: "valentine",
        name: "Valentine Viewer",
        emoji: "💝",
        description: "Love is in the air",
        requirement: "Watch something on February 14th",
        check: (items) => items.some(i => {
            const d = new Date(i.date);
            return d.getMonth() === 1 && d.getDate() === 14;
        }),
        color: "#ec4899",
    },
    {
        id: "halloween",
        name: "Halloween Spirit",
        emoji: "🎃",
        description: "Spooky season watcher",
        requirement: "Watch something on October 31st",
        check: (items) => items.some(i => {
            const d = new Date(i.date);
            return d.getMonth() === 9 && d.getDate() === 31;
        }),
        color: "#f97316",
    },
    {
        id: "christmas",
        name: "Christmas Viewer",
        emoji: "🎄",
        description: "Holiday movie tradition",
        requirement: "Watch something on December 25th",
        check: (items) => items.some(i => {
            const d = new Date(i.date);
            return d.getMonth() === 11 && d.getDate() === 25;
        }),
        color: "#16a34a",
    },

    // ============ FRANCHISE BADGES ============
    {
        id: "marvel-fan",
        name: "Marvel Fan",
        emoji: "🦸",
        description: "Superhero enthusiast",
        requirement: "Watch 10+ Marvel films",
        check: (items) => items.filter(i => {
            const title = i.title?.toLowerCase() || "";
            return title.includes("avengers") || title.includes("spider-man") ||
                title.includes("iron man") || title.includes("thor") ||
                title.includes("captain america") || title.includes("guardians of the galaxy") ||
                title.includes("black panther") || title.includes("ant-man") ||
                title.includes("doctor strange");
        }).length >= 10,
        color: "#dc2626",
    },
    {
        id: "dc-fan",
        name: "DC Fan",
        emoji: "🦇",
        description: "Dark Knight appreciator",
        requirement: "Watch 5+ DC films",
        check: (items) => items.filter(i => {
            const title = i.title?.toLowerCase() || "";
            return title.includes("batman") || title.includes("superman") ||
                title.includes("wonder woman") || title.includes("aquaman") ||
                title.includes("joker") || title.includes("justice league");
        }).length >= 5,
        color: "#1e3a8a",
    },
    {
        id: "star-wars-fan",
        name: "Star Wars Fan",
        emoji: "⚔️",
        description: "In a galaxy far, far away",
        requirement: "Watch 5+ Star Wars films",
        check: (items) => items.filter(i => i.title?.toLowerCase().includes("star wars")).length >= 5,
        color: "#fbbf24",
    },
    {
        id: "potterhead",
        name: "Potterhead",
        emoji: "🧙‍♂️",
        description: "Wizarding world fan",
        requirement: "Watch 5+ Harry Potter/Fantastic Beasts films",
        check: (items) => items.filter(i => {
            const title = i.title?.toLowerCase() || "";
            return title.includes("harry potter") || title.includes("fantastic beasts");
        }).length >= 5,
        color: "#7c3aed",
    },
    {
        id: "middle-earth",
        name: "Middle-Earth Traveler",
        emoji: "💍",
        description: "One ring to rule them all",
        requirement: "Watch 4+ LOTR/Hobbit films",
        check: (items) => items.filter(i => {
            const title = i.title?.toLowerCase() || "";
            return title.includes("lord of the rings") || title.includes("hobbit");
        }).length >= 4,
        color: "#16a34a",
    },
    {
        id: "pixar-lover",
        name: "Pixar Lover",
        emoji: "🏮",
        description: "To infinity and beyond",
        requirement: "Watch 8+ Pixar films",
        check: (items) => items.filter(i => {
            const title = i.title?.toLowerCase() || "";
            return title.includes("toy story") || title.includes("finding nemo") ||
                title.includes("finding dory") || title.includes("incredibles") ||
                title.includes("monsters, inc") || title.includes("inside out") ||
                title.includes("coco") || title.includes("up") || title.includes("wall-e") ||
                title.includes("ratatouille") || title.includes("brave") || title.includes("soul") ||
                title.includes("luca") || title.includes("turning red") || title.includes("elemental");
        }).length >= 8,
        color: "#06b6d4",
    },

    // ============ OBSCURE & FUN ============
    {
        id: "sequel-lover",
        name: "Sequel Lover",
        emoji: "2️⃣",
        description: "More is more",
        requirement: "Watch 10+ sequels (films with 2, 3, etc.)",
        check: (items) => items.filter(i => {
            const title = i.title || "";
            return /[2-9]|II|III|IV|V|VI/.test(title);
        }).length >= 10,
        color: "#f59e0b",
    },
    {
        id: "reboot-watcher",
        name: "Reboot Watcher",
        emoji: "🔄",
        description: "Everything comes back",
        requirement: "Watch 5+ reboots or remakes",
        check: (items) => items.filter(i => {
            const year = parseInt(i.year);
            // Films with same title as classics but from recent years
            return year >= 2010 && i.tmdbRating && i.tmdbRating > 0;
        }).length >= 100, // Approximate, hard to detect
        color: "#64748b",
    },
    {
        id: "complete-collection",
        name: "The Completionist",
        emoji: "✅",
        description: "Gotta watch 'em all",
        requirement: "Watch all films in a series (3+)",
        check: (items) => {
            // Check if watched multiple numbered sequels
            const toyStory = items.filter(i => i.title?.includes("Toy Story")).length >= 3;
            const lotr = items.filter(i => i.title?.includes("Lord of the Rings")).length >= 3;
            const matrix = items.filter(i => i.title?.includes("Matrix")).length >= 3;
            const darkKnight = items.filter(i => i.title?.includes("Batman")).length >= 3;
            return toyStory || lotr || matrix || darkKnight;
        },
        color: "#22c55e",
    },
    {
        id: "diverse-decade",
        name: "Time Traveler",
        emoji: "⌛",
        description: "Exploring every era",
        requirement: "Watch films from 5+ different decades",
        check: (items) => {
            const decades = new Set(items.map(i => Math.floor(parseInt(i.year) / 10)));
            return decades.size >= 5;
        },
        color: "#0891b2",
    },
    {
        id: "prolific-year",
        name: "Prolific Year",
        emoji: "📅",
        description: "A banner year for movies",
        requirement: "Watch 100+ items in a single year",
        check: (items) => {
            const yearCounts: Record<string, number> = {};
            items.forEach(i => {
                const year = new Date(i.date).getFullYear();
                yearCounts[year] = (yearCounts[year] || 0) + 1;
            });
            return Object.values(yearCounts).some(c => c >= 100);
        },
        color: "#7c3aed",
    },
    {
        id: "birthday-watch",
        name: "Birthday Watch",
        emoji: "🎂",
        description: "Special occasion viewing",
        requirement: "Watch something from your birth year",
        check: () => false, // Would need user's birth year
        color: "#ec4899",
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
