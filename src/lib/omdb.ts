const OMDB_API_URL = "http://www.omdbapi.com";

export interface OmdbMovie {
    Title: string;
    Year: string;
    Poster: string;
    imdbID: string;
    Type: string;
    Director: string;
    Actors: string;
    Plot: string;
    Genre: string;
    Runtime: string;
}

export const getMovieMetadata = async (imdbId: string, apiKey: string) => {
    const response = await fetch(`${OMDB_API_URL}/?i=${imdbId}&apikey=${apiKey}`);

    if (!response.ok) {
        throw new Error("Failed to fetch OMDB data");
    }

    return response.json();
};
