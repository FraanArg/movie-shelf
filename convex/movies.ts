import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all movies for a user
export const getMovies = query({
    args: { clerkUserId: v.string() },
    handler: async (ctx, args) => {
        const movies = await ctx.db
            .query("movies")
            .withIndex("by_user", (q) => q.eq("clerkUserId", args.clerkUserId))
            .collect();
        return movies;
    },
});

// Add a single movie
export const addMovie = mutation({
    args: {
        clerkUserId: v.string(),
        imdbId: v.string(),
        title: v.string(),
        year: v.string(),
        posterUrl: v.optional(v.string()),
        type: v.union(v.literal("movie"), v.literal("series")),
        source: v.union(v.literal("trakt"), v.literal("local"), v.literal("manual")),
        date: v.string(),
        list: v.optional(v.string()),
        director: v.optional(v.string()),
        actors: v.optional(v.string()),
        plot: v.optional(v.string()),
        genre: v.optional(v.string()),
        runtime: v.optional(v.string()),
        tmdbRating: v.optional(v.number()),
        imdbRating: v.optional(v.string()),
        rtRating: v.optional(v.string()),
        metascore: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check if movie already exists for this user
        const existing = await ctx.db
            .query("movies")
            .withIndex("by_user_and_imdb", (q) =>
                q.eq("clerkUserId", args.clerkUserId).eq("imdbId", args.imdbId)
            )
            .first();

        if (existing) {
            // Update existing
            await ctx.db.patch(existing._id, args);
            return existing._id;
        }

        // Insert new
        return await ctx.db.insert("movies", args);
    },
});

// Bulk upsert movies (for initial sync)
export const syncMovies = mutation({
    args: {
        clerkUserId: v.string(),
        movies: v.array(
            v.object({
                imdbId: v.string(),
                title: v.string(),
                year: v.string(),
                posterUrl: v.optional(v.string()),
                type: v.union(v.literal("movie"), v.literal("series")),
                source: v.union(v.literal("trakt"), v.literal("local"), v.literal("manual")),
                date: v.string(),
                list: v.optional(v.string()),
                director: v.optional(v.string()),
                actors: v.optional(v.string()),
                plot: v.optional(v.string()),
                genre: v.optional(v.string()),
                runtime: v.optional(v.string()),
                tmdbRating: v.optional(v.number()),
                imdbRating: v.optional(v.string()),
                rtRating: v.optional(v.string()),
                metascore: v.optional(v.string()),
            })
        ),
    },
    handler: async (ctx, args) => {
        let added = 0;
        let updated = 0;

        for (const movie of args.movies) {
            const existing = await ctx.db
                .query("movies")
                .withIndex("by_user_and_imdb", (q) =>
                    q.eq("clerkUserId", args.clerkUserId).eq("imdbId", movie.imdbId)
                )
                .first();

            if (existing) {
                await ctx.db.patch(existing._id, { ...movie, clerkUserId: args.clerkUserId });
                updated++;
            } else {
                await ctx.db.insert("movies", { ...movie, clerkUserId: args.clerkUserId });
                added++;
            }
        }

        return { added, updated, total: added + updated };
    },
});

// Delete a movie
export const deleteMovie = mutation({
    args: {
        clerkUserId: v.string(),
        imdbId: v.string(),
    },
    handler: async (ctx, args) => {
        const movie = await ctx.db
            .query("movies")
            .withIndex("by_user_and_imdb", (q) =>
                q.eq("clerkUserId", args.clerkUserId).eq("imdbId", args.imdbId)
            )
            .first();

        if (movie) {
            await ctx.db.delete(movie._id);
            return true;
        }
        return false;
    },
});
