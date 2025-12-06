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
