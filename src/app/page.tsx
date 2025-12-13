import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { getTraktAuthUrl } from "@/lib/trakt";
import ThemeToggle from "@/components/ThemeToggle";
import SortControls from "@/components/SortControls";
import MovieGrid from "@/components/MovieGrid";
import CollectionRow from "@/components/CollectionRow";
import BrowseCard from "@/components/BrowseCard";
import SagaStack from "@/components/SagaStack";
import TimeDial from "@/components/TimeDial";
import CoffeeTable from "@/components/CoffeeTable";
import SpineGrid from "@/components/SpineGrid";
import HeroSpotlight from "@/components/HeroSpotlight";
import TimeTravelTimeline from "@/components/TimeTravelTimeline";
import QuickFilters from "@/components/QuickFilters";
import MoodFilter from "@/components/MoodFilter";
import RecommendationRow from "@/components/RecommendationRow";
import { MOODS } from "@/components/MoodFilter";
import { fetchMoviesAction } from "@/app/actions";
import { getDB, getDemoData } from "@/lib/db";
import DemoBanner from "@/components/DemoBanner";
import LargeTitle from "@/components/LargeTitle";
import DefaultSortRedirect from "@/components/DefaultSortRedirect";
import MobileFilters from "@/components/MobileFilters";

// Genre keywords for filtering
const genreKeywords: Record<string, string[]> = {
  action: ["action", "fight", "battle", "war", "hero"],
  comedy: ["comedy", "funny", "laugh", "humor"],
  drama: ["drama", "family", "life", "story"],
  horror: ["horror", "scary", "terror", "nightmare"],
  scifi: ["space", "future", "alien", "robot", "star", "galaxy"],
  romance: ["love", "romance", "heart", "wedding"],
  thriller: ["thriller", "suspense", "mystery", "crime", "detective"],
};

export default async function Home({ searchParams }: { searchParams: Promise<{ sort?: string, decade?: string, view?: string, genre?: string, mood?: string }> }) {
  const { sort, decade, view, genre, mood } = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get("trakt_access_token")?.value;
  const clientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID;
  const isAuthenticated = !!token;

  // 1. Read from Local DB
  let items = await getDB();

  // 2. Check if we should use demo data
  // Use demo data when: no Trakt connected AND no items in the library
  const isDemoMode = !isAuthenticated && items.length === 0;

  if (isDemoMode) {
    items = await getDemoData();
  }

  // Deduplicate
  const uniqueItems = Array.from(new Map(items.map(m => [m.imdbId || m.id, m])).values());

  // Separate watched from watchlist - explicitly only show watched or undefined (local manual adds)
  // For TV shows: only include if 95%+ complete (to account for skippable recap episodes)
  const watchlistMovies = uniqueItems.filter(m => m.list === "watchlist");
  const libraryMovies = uniqueItems.filter(m => {
    // Must be watched or undefined (local manual adds)
    if (m.list !== "watched" && m.list !== undefined && m.list !== null) return false;

    // For TV shows, require 95%+ completion
    if (m.type === "series") {
      const watched = m.watchedEpisodes || 0;
      const total = m.totalEpisodes || 0;
      if (total > 0) {
        const completionPercent = (watched / total) * 100;
        return completionPercent >= 95;
      }
      // If no episode data, include it (assume complete)
      return true;
    }

    // Movies are always included
    return true;
  });

  // Filter Logic
  let displayedMovies = libraryMovies;
  let pageTitle = "Library";

  if (sort === "movies") {
    displayedMovies = libraryMovies.filter(m => m.type === "movie");
    pageTitle = "All Movies";
  } else if (sort === "shows") {
    displayedMovies = libraryMovies.filter(m => m.type === "series");
    pageTitle = "TV Shows";
  } else if (sort === "scifi") {
    displayedMovies = libraryMovies.filter(m => m.type === "movie" && (m.title.toLowerCase().includes("star") || m.title.toLowerCase().includes("space") || m.title.toLowerCase().includes("alien") || m.title.toLowerCase().includes("future")));
    pageTitle = "Sci-Fi & Fantasy";
  } else if (sort === "90s") {
    displayedMovies = libraryMovies.filter(m => {
      const y = parseInt(m.year);
      return y >= 1990 && y < 2000;
    });
    pageTitle = "90s Classics";
  } else if (sort === "recent") {
    displayedMovies = libraryMovies.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 50);
    pageTitle = "Recently Added";
  }

  // Apply sorting (Default to A-Z unless 'recent' is selected)
  if (sort !== "recent") {
    if (sort === "random") {
      // Fisher-Yates shuffle for random order
      for (let i = displayedMovies.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [displayedMovies[i], displayedMovies[j]] = [displayedMovies[j], displayedMovies[i]];
      }
    } else {
      displayedMovies.sort((a, b) => {
        if (sort === "year") {
          return parseInt(b.year) - parseInt(a.year);
        } else if (sort === "rating") {
          return parseFloat(b.imdbRating || "0") - parseFloat(a.imdbRating || "0");
        } else if (sort === "date") {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else {
          // Default: Title A-Z
          return a.title.localeCompare(b.title);
        }
      });
    }
  }

  const isHome = sort === "dashboard"; // Default to A-Z grid, only show dashboard if requested

  // Time Travel Logic
  if (decade) {
    const decadeStart = parseInt(decade);
    const decadeEnd = decadeStart + 10;
    displayedMovies = libraryMovies.filter(m => {
      const y = parseInt(m.year);
      return y >= decadeStart && y < decadeEnd;
    });
    pageTitle = `${decadeStart}s Time Travel`;
  }

  // Genre filtering logic
  if (genre && genreKeywords[genre]) {
    const keywords = genreKeywords[genre];
    displayedMovies = displayedMovies.filter(m => {
      const titleLower = m.title.toLowerCase();
      const genreLower = (m.Genre || "").toLowerCase();
      return keywords.some(k => titleLower.includes(k) || genreLower.includes(k));
    });
    pageTitle = genre.charAt(0).toUpperCase() + genre.slice(1);
  }

  // Mood-based filtering
  if (mood) {
    const selectedMood = MOODS.find(m => m.id === mood);
    if (selectedMood) {
      displayedMovies = displayedMovies.filter(m => {
        const movieGenres = (m.Genre || "").split(", ").map(g => g.trim());
        return selectedMood.genres.some(g => movieGenres.includes(g));
      });
      pageTitle = `${selectedMood.emoji} ${selectedMood.label}`;
    }
  }

  // Director Spotlights Logic
  const directors: Record<string, any[]> = {};
  libraryMovies.forEach(m => {
    if (m.Director && m.Director !== "N/A") {
      // Handle multiple directors? Usually comma separated.
      // For simplicity, take the first one or split.
      const directorList = m.Director.split(", ");
      directorList.forEach((d: string) => {
        if (!directors[d]) directors[d] = [];
        directors[d].push(m);
      });
    }
  });

  // Filter for directors with 3+ movies
  const spotlightDirectors = Object.entries(directors)
    .filter(([_, movies]) => movies.length >= 3)
    .sort((a, b) => b[1].length - a[1].length) // Sort by count
    .slice(0, 3); // Top 3 directors

  // Saga Logic
  const sagas: Record<string, any[]> = {};
  const sagaKeywords = ["Harry Potter", "Star Wars", "Lord of the Rings", "Matrix", "Indiana Jones", "Avengers"];

  sagaKeywords.forEach(keyword => {
    const matches = libraryMovies.filter(m => m.title.includes(keyword));
    if (matches.length >= 2) {
      sagas[keyword] = matches;
    }
  });

  const hasSagas = Object.keys(sagas).length > 0;

  // Get Trakt auth URL for demo banner
  const traktAuthUrl = clientId ? getTraktAuthUrl(clientId) : undefined;

  return (
    <main style={{ padding: "0 0 80px 0", minHeight: "100vh" }}>
      {/* Apply default sort from settings */}
      <Suspense fallback={null}>
        <DefaultSortRedirect />
      </Suspense>

      {/* Demo banner for unauthenticated users */}
      {isDemoMode && <DemoBanner traktAuthUrl={traktAuthUrl} />}

      <TimeDial />

      {/* Page header with large title */}
      <div style={{ padding: "0 var(--space-md)" }}>
        {(sort || decade) ? (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-sm)",
            paddingTop: "var(--space-lg)",
            paddingBottom: "var(--space-md)",
          }}>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-full)",
                color: "var(--tint)",
                textDecoration: "none",
                fontSize: "1.5rem",
              }}
            >
              ←
            </Link>
            <h1
              className="large-title"
              style={{
                fontSize: "var(--font-size-title1)",
                fontWeight: 700,
                color: "var(--label-primary)",
                margin: 0,
                letterSpacing: "-0.3px",
                fontFamily: "var(--font-system)",
              }}
            >
              {pageTitle}
            </h1>
          </div>
        ) : (
          <LargeTitle action={<SortControls />}>
            {pageTitle}
          </LargeTitle>
        )}
      </div>

      {/* Quick genre filter chips */}
      <div style={{ padding: "0 40px" }}>
        <Suspense fallback={null}>
          <QuickFilters />
        </Suspense>
      </div>

      {/* Mood-based filters */}
      <div style={{ padding: "0 40px", marginTop: "10px" }}>
        <Suspense fallback={null}>
          <MoodFilter />
        </Suspense>
      </div>

      {/* Personalized Recommendations - pick a random highly-rated movie */}
      {libraryMovies.length > 5 && (() => {
        const highRated = libraryMovies.filter(m => parseFloat(m.imdbRating || "0") >= 7.5 && m.imdbId);
        if (highRated.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(highRated.length, 20));
          const basedOn = highRated[randomIndex];
          return <RecommendationRow basedOnTitle={basedOn.title} basedOnImdbId={basedOn.imdbId} />;
        }
        return null;
      })()}

      {isHome ? (
        <>
          {/* Hero Spotlight (Random Featured Item) */}
          {watchlistMovies.length > 0 && (
            <HeroSpotlight movie={watchlistMovies[0]} />
          )}

          {/* Coffee Table (Secondary) */}
          {watchlistMovies.length > 0 && view === "spine" && (
            <div style={{ marginBottom: "60px", padding: "0 60px" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "30px", color: "var(--foreground)", fontFamily: "var(--font-oswald)", textTransform: "uppercase", letterSpacing: "1px" }}>
                On The Table
              </h2>
              <CoffeeTable movies={watchlistMovies} />
            </div>
          )}

          {/* Sagas Row */}
          {hasSagas && (
            <div style={{ padding: "0 40px 40px 40px" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "20px", color: "var(--foreground)" }}>Box Sets</h2>
              <div style={{ display: "flex", gap: "40px", overflowX: "auto", paddingBottom: "40px" }} className="hide-scrollbar">
                {Object.entries(sagas).map(([name, movies]) => (
                  <SagaStack key={name} label={name} movies={movies} />
                ))}
              </div>
            </div>
          )}

          {/* Director Spotlights */}
          {spotlightDirectors.map(([director, movies]) => (
            <CollectionRow key={director} label={`Directed by ${director}`} movies={movies} />
          ))}

          {/* Browse Grid */}
          <div style={{ padding: "0 40px" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "20px", color: "var(--foreground)" }}>Browse</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
              <BrowseCard label="All Movies" icon="🎬" href="/?sort=movies" color="#FF512F" />
              <BrowseCard label="TV Shows" icon="📺" href="/?sort=shows" color="#DD2476" />
              <BrowseCard label="Sci-Fi" icon="🚀" href="/?sort=scifi" color="#4776E6" />
              <BrowseCard label="90s Classics" icon="📼" href="/?sort=90s" color="#8E54E9" />
              <BrowseCard label="Connections" icon="🕸️" href="/connections" color="#11998e" />
              <BrowseCard label="Recently Added" icon="✨" href="/?sort=recent" color="#1FA2FF" />
              <BrowseCard label="Poster Wall" icon="🖼️" href="/wall" color="#f59e0b" />
              <BrowseCard label="Blind Spots" icon="🔍" href="/blindspots" color="#ef4444" />
            </div>
          </div>
        </>
      ) : (
        <div style={{ padding: "0 40px" }}>
          {view === "spine" ? (
            <SpineGrid initialMovies={displayedMovies} sort={sort || "title"} />
          ) : (
            <MovieGrid initialMovies={displayedMovies.slice(0, 50)} allMovies={displayedMovies} sort={sort || "title"} />
          )}
        </div>
      )}

      {/* Mobile Filter FAB + BottomSheet */}
      <Suspense fallback={null}>
        <MobileFilters />
      </Suspense>
    </main>
  );
}
