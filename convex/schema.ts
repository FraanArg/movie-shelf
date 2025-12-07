import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    movies: defineTable({
        clerkUserId: v.string(),
        imdbId: v.string(),
        title: v.string(),
        year: v.string(),
        posterUrl: v.optional(v.string()),
        type: v.union(v.literal("movie"), v.literal("series")),
        source: v.union(v.literal("trakt"), v.literal("local"), v.literal("manual")),
        date: v.string(),
        list: v.optional(v.string()),
        // Metadata
        director: v.optional(v.string()),
        actors: v.optional(v.string()),
        plot: v.optional(v.string()),
        genre: v.optional(v.string()),
        runtime: v.optional(v.string()),
        // Ratings
        tmdbRating: v.optional(v.number()),
        imdbRating: v.optional(v.string()),
        rtRating: v.optional(v.string()),
        metascore: v.optional(v.string()),
    })
        .index("by_user", ["clerkUserId"])
        .index("by_user_and_imdb", ["clerkUserId", "imdbId"]),
});
