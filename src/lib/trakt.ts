const TRAKT_API_URL = "https://api.trakt.tv";

// Use environment variable for the redirect URI, fallback to localhost for development
const getRedirectUri = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return `${baseUrl}/api/auth/callback`;
};

export interface TraktMovie {
    title: string;
    year: number;
    ids: {
        trakt: number;
        slug: string;
        imdb: string;
        tmdb: number;
    };
}

export interface TraktShow {
    title: string;
    year: number;
    ids: {
        trakt: number;
        slug: string;
        imdb: string;
        tmdb: number;
    };
}

export const getTraktAuthUrl = (clientId: string) => {
    const redirectUri = getRedirectUri();
    return `${TRAKT_API_URL}/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
};

export const exchangeCodeForToken = async (code: string, clientId: string, clientSecret: string) => {
    const response = await fetch(`${TRAKT_API_URL}/oauth/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: getRedirectUri(),
            grant_type: "authorization_code",
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to exchange code for token");
    }

    return response.json();
};

export const getWatchedHistory = async (accessToken: string, clientId: string, page = 1, limit = 50) => {
    const fetchWithRetry = async (url: string, options: RequestInit, retries = 3) => {
        for (let i = 0; i < retries; i++) {
            try {
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), 15000); // 15s timeout
                const res = await fetch(url, { ...options, signal: controller.signal });
                clearTimeout(id);
                if (res.ok) return res;
                if (res.status === 429) { // Rate limit
                    await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Backoff
                    continue;
                }
                throw new Error(`Request failed with status ${res.status}`);
            } catch (err) {
                if (i === retries - 1) throw err;
                await new Promise(r => setTimeout(r, 1000)); // Wait 1s before retry
            }
        }
        throw new Error("Max retries reached");
    };

    const response = await fetchWithRetry(`${TRAKT_API_URL}/sync/history?page=${page}&limit=${limit}&extended=metadata`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "trakt-api-version": "2",
            "trakt-api-key": clientId,
        },
    });

    return response.json();
};
export const getUserStats = async (accessToken: string, clientId: string) => {
    const response = await fetch(`${TRAKT_API_URL}/users/me/stats`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "trakt-api-version": "2",
            "trakt-api-key": clientId,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch user stats");
    }

    return response.json();
};
export const getMovieTrailer = async (imdbId: string, clientId: string) => {
    const response = await fetch(`${TRAKT_API_URL}/search/imdb/${imdbId}?type=movie&extended=full`, {
        headers: {
            "Content-Type": "application/json",
            "trakt-api-version": "2",
            "trakt-api-key": clientId,
        },
    });

    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    return data[0]?.movie?.trailer || null;
};
export const getTraktUser = async (accessToken: string, clientId: string) => {
    const response = await fetch(`${TRAKT_API_URL}/users/me`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "trakt-api-version": "2",
            "trakt-api-key": clientId,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch user");
    }

    return response.json();
};

export const getWatchlist = async (accessToken: string, clientId: string) => {
    const response = await fetch(`${TRAKT_API_URL}/sync/watchlist?extended=metadata`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "trakt-api-version": "2",
            "trakt-api-key": clientId,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch watchlist");
    }

    return response.json();
};

// Get all watched shows with progress data
export const getWatchedShows = async (accessToken: string, clientId: string) => {
    const response = await fetch(`${TRAKT_API_URL}/sync/watched/shows?extended=noseasons`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "trakt-api-version": "2",
            "trakt-api-key": clientId,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch watched shows");
    }

    return response.json();
};

// Get ALL watched movies in one call (not paginated like history)
export const getWatchedMovies = async (accessToken: string, clientId: string) => {
    const response = await fetch(`${TRAKT_API_URL}/sync/watched/movies`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "trakt-api-version": "2",
            "trakt-api-key": clientId,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch watched movies");
    }

    return response.json();
};

// Get detailed progress for a specific show
export interface ShowProgress {
    aired: number;
    completed: number;
    last_watched_at: string;
    seasons: Array<{
        number: number;
        aired: number;
        completed: number;
        episodes: Array<{
            number: number;
            completed: boolean;
        }>;
    }>;
}

export const getShowProgress = async (
    accessToken: string,
    clientId: string,
    traktId: number | string
): Promise<ShowProgress | null> => {
    try {
        const response = await fetch(`${TRAKT_API_URL}/shows/${traktId}/progress/watched?hidden=false&specials=false`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
                "trakt-api-version": "2",
                "trakt-api-key": clientId,
            },
        });

        if (!response.ok) {
            console.error(`Failed to fetch progress for show ${traktId}: ${response.status}`);
            return null;
        }

        return response.json();
    } catch (error) {
        console.error(`Error fetching show progress for ${traktId}:`, error);
        return null;
    }
};

// Get shows that are currently being watched (started but not completed)
export const getShowsInProgress = async (accessToken: string, clientId: string) => {
    try {
        // First get all watched shows
        const watchedShows = await getWatchedShows(accessToken, clientId);

        // For each show, check if it's in progress (completed < aired)
        const inProgressShows: Array<{
            show: TraktShow;
            progress: { aired: number; completed: number; percent: number };
        }> = [];

        // Limit to avoid too many API calls - check first 50 shows
        const showsToCheck = watchedShows.slice(0, 50);

        for (const item of showsToCheck) {
            const show = item.show;
            if (!show?.ids?.trakt) continue;

            const progress = await getShowProgress(accessToken, clientId, show.ids.trakt);
            if (!progress) continue;

            // Calculate completion percentage
            const percent = progress.aired > 0 ? (progress.completed / progress.aired) * 100 : 0;

            // Include if started but not complete (1-94%)
            if (progress.completed > 0 && percent < 95) {
                inProgressShows.push({
                    show,
                    progress: {
                        aired: progress.aired,
                        completed: progress.completed,
                        percent,
                    },
                });
            }

            // Add small delay to respect rate limits
            await new Promise(r => setTimeout(r, 100));
        }

        return inProgressShows;
    } catch (error) {
        console.error("Error fetching shows in progress:", error);
        return [];
    }
};

// Get user's personal ratings for movies and shows
export interface TraktRating {
    rated_at: string;
    rating: number; // 1-10 scale
    type: "movie" | "show";
    movie?: TraktMovie;
    show?: TraktShow;
}

export const getUserRatings = async (accessToken: string, clientId: string): Promise<TraktRating[]> => {
    try {
        const [movieRatings, showRatings] = await Promise.all([
            fetch(`${TRAKT_API_URL}/sync/ratings/movies`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                    "trakt-api-version": "2",
                    "trakt-api-key": clientId,
                },
            }).then(r => r.ok ? r.json() : []),
            fetch(`${TRAKT_API_URL}/sync/ratings/shows`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                    "trakt-api-version": "2",
                    "trakt-api-key": clientId,
                },
            }).then(r => r.ok ? r.json() : []),
        ]);

        return [...movieRatings, ...showRatings];
    } catch (error) {
        console.error("Error fetching user ratings:", error);
        return [];
    }
};

// Get user's comments on movies and shows
export interface TraktComment {
    id: number;
    comment: string;
    spoiler: boolean;
    review: boolean;
    created_at: string;
    type: "movie" | "show";
    movie?: TraktMovie;
    show?: TraktShow;
}

export const getUserComments = async (accessToken: string, clientId: string): Promise<TraktComment[]> => {
    try {
        const response = await fetch(`${TRAKT_API_URL}/users/me/comments?include_replies=false&limit=100`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
                "trakt-api-version": "2",
                "trakt-api-key": clientId,
            },
        });

        if (!response.ok) {
            console.error("Failed to fetch user comments:", response.status);
            return [];
        }

        return response.json();
    } catch (error) {
        console.error("Error fetching user comments:", error);
        return [];
    }
};
