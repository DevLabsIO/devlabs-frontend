import React from "react";
import GlowButton from "./glow-button";

export default function HeroContent() {
    return (
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-4 animate-fadeInUp">
                    <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">
                        Devlabs
                    </span>
                </h1>

                <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 font-light animate-fadeInUp animation-delay-300">
                    Build. Collaborate. Deploy.
                </p>
            </div>

            <div className="animate-fadeInUp animation-delay-600">
                <GlowButton>Get Started</GlowButton>
            </div>
        </div>
    );
}
