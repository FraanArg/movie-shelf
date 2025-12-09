"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface CountryMapProps {
    items: { Country?: string }[];
}

// ISO 3166-1 alpha-2 country name to code mapping
const countryNameToCode: Record<string, string> = {
    "United States of America": "US",
    "United States": "US",
    "USA": "US",
    "United Kingdom": "GB",
    "UK": "GB",
    "France": "FR",
    "Germany": "DE",
    "Italy": "IT",
    "Spain": "ES",
    "Japan": "JP",
    "South Korea": "KR",
    "China": "CN",
    "India": "IN",
    "Canada": "CA",
    "Australia": "AU",
    "Mexico": "MX",
    "Brazil": "BR",
    "Argentina": "AR",
    "Russia": "RU",
    "Sweden": "SE",
    "Norway": "NO",
    "Denmark": "DK",
    "Finland": "FI",
    "Netherlands": "NL",
    "Belgium": "BE",
    "Switzerland": "CH",
    "Austria": "AT",
    "Poland": "PL",
    "Ireland": "IE",
    "New Zealand": "NZ",
    "South Africa": "ZA",
    "Hong Kong": "HK",
    "Taiwan": "TW",
    "Thailand": "TH",
    "Indonesia": "ID",
    "Malaysia": "MY",
    "Philippines": "PH",
    "Singapore": "SG",
    "Vietnam": "VN",
    "Turkey": "TR",
    "Greece": "GR",
    "Portugal": "PT",
    "Czech Republic": "CZ",
    "Hungary": "HU",
    "Romania": "RO",
    "Ukraine": "UA",
    "Israel": "IL",
    "Egypt": "EG",
    "Nigeria": "NG",
    "Kenya": "KE",
    "Colombia": "CO",
    "Chile": "CL",
    "Peru": "PE",
    "Venezuela": "VE",
};

// Get flag emoji from country code
function getFlagEmoji(countryCode: string): string {
    const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

// Get country code from name
function getCountryCode(name: string): string | null {
    const trimmed = name.trim();
    if (countryNameToCode[trimmed]) return countryNameToCode[trimmed];
    // Try to find partial match
    for (const [key, code] of Object.entries(countryNameToCode)) {
        if (trimmed.toLowerCase().includes(key.toLowerCase()) ||
            key.toLowerCase().includes(trimmed.toLowerCase())) {
            return code;
        }
    }
    return null;
}

export default function CountryMap({ items }: CountryMapProps) {
    const countryData = useMemo(() => {
        const counts: Record<string, number> = {};

        items.forEach(item => {
            if (item.Country && item.Country !== "N/A") {
                // Split multiple countries
                const countries = item.Country.split(",");
                countries.forEach(c => {
                    const trimmed = c.trim();
                    if (trimmed) {
                        counts[trimmed] = (counts[trimmed] || 0) + 1;
                    }
                });
            }
        });

        return Object.entries(counts)
            .map(([name, count]) => ({
                name,
                count,
                code: getCountryCode(name),
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 12);
    }, [items]);

    const total = countryData.reduce((sum, d) => sum + d.count, 0);

    if (countryData.length === 0) {
        return (
            <div style={{
                padding: "20px",
                background: "var(--glass-bg)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: "16px",
                border: "1px solid var(--glass-border)",
                textAlign: "center",
            }}>
                <h3 style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: "var(--foreground)",
                    marginBottom: "15px",
                }}>
                    🌍 Countries
                </h3>
                <p style={{ color: "#666", fontSize: "0.9rem" }}>
                    Country data not available. Run re-enrich to populate.
                </p>
            </div>
        );
    }

    const maxCount = Math.max(...countryData.map(d => d.count));

    return (
        <div style={{
            padding: "20px",
            background: "var(--glass-bg)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "16px",
            border: "1px solid var(--glass-border)",
        }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
            }}>
                <h3 style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: "var(--foreground)",
                }}>
                    🌍 Countries
                </h3>
                <span style={{ fontSize: "0.85rem", color: "#888" }}>
                    {countryData.length} countries
                </span>
            </div>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: "10px",
            }}>
                {countryData.map((country, index) => (
                    <motion.div
                        key={country.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        style={{
                            padding: "12px",
                            background: index === 0
                                ? "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))"
                                : "rgba(255,255,255,0.05)",
                            borderRadius: "12px",
                            border: index === 0 ? "1px solid rgba(59, 130, 246, 0.3)" : "none",
                        }}
                    >
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "8px",
                        }}>
                            <span style={{ fontSize: "1.3rem" }}>
                                {country.code ? getFlagEmoji(country.code) : "🌐"}
                            </span>
                            <span style={{
                                fontSize: "0.85rem",
                                fontWeight: index === 0 ? "600" : "400",
                                flex: 1,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}>
                                {country.name}
                            </span>
                        </div>

                        {/* Progress bar */}
                        <div style={{
                            height: "4px",
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: "2px",
                            overflow: "hidden",
                            marginBottom: "4px",
                        }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(country.count / maxCount) * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.3 + index * 0.05 }}
                                style={{
                                    height: "100%",
                                    background: index === 0 ? "#3b82f6" : "rgba(255,255,255,0.3)",
                                    borderRadius: "2px",
                                }}
                            />
                        </div>

                        <div style={{
                            fontSize: "0.75rem",
                            color: "#888",
                            textAlign: "right",
                        }}>
                            {country.count} ({((country.count / total) * 100).toFixed(0)}%)
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
