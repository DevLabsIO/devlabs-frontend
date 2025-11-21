"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
}

export default function GlowButton({ children, className = "", ...props }: GlowButtonProps) {
    const router = useRouter();

    return (
        <button
            className={`
        relative overflow-hidden px-7 py-3.5 rounded-full
        bg-gradient-to-r from-blue-600 to-indigo-600
        text-white font-semibold text-base
        transition-all duration-300 ease-out
        hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20
        group ${className}
      `}
            onClick={() => router.push("/login")}
            {...props}
        >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" />

            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-full" />
            </div>

            <span className="relative z-10">{children}</span>
        </button>
    );
}
