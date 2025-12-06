"use client";

import React, { createContext, useContext, useState } from "react";

interface XRayContextType {
    isXRayEnabled: boolean;
    toggleXRay: () => void;
}

const XRayContext = createContext<XRayContextType | undefined>(undefined);

export function useXRay() {
    const context = useContext(XRayContext);
    if (!context) {
        throw new Error("useXRay must be used within a XRayProvider");
    }
    return context;
}

export default function XRayProvider({ children }: { children: React.ReactNode }) {
    const [isXRayEnabled, setIsXRayEnabled] = useState(false);

    const toggleXRay = () => setIsXRayEnabled(prev => !prev);

    return (
        <XRayContext.Provider value={{ isXRayEnabled, toggleXRay }}>
            {children}
        </XRayContext.Provider>
    );
}
