"use client";

import React from "react";
import ParticleField from "./particle-field";
import HeroContent from "./hero-content";
import "./styles/hero-animations.css";

export default function DevlabsHero() {
    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden flex items-center justify-center">
            <ParticleField />

            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-gray-900/40" />

            <HeroContent />
        </div>
    );
}
