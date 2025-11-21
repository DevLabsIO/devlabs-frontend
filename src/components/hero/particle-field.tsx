"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
    twinkle: number;
    twinkleSpeed: number;
}

export default function ParticleField() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const particlesRef = useRef<Particle[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const particles = particlesRef.current;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        const createParticles = () => {
            particles.length = 0;
            const particleCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 15000));

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2 + 0.5,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: (Math.random() - 0.5) * 0.5,
                    opacity: Math.random() * 0.8 + 0.2,
                    twinkle: Math.random() * Math.PI * 2,
                    twinkleSpeed: Math.random() * 0.02 + 0.01,
                });
            }
        };

        createParticles();

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle) => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;

                particle.twinkle += particle.twinkleSpeed;
                const twinkleOpacity = (Math.sin(particle.twinkle) + 1) * 0.5;

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(147, 197, 253, ${particle.opacity * twinkleOpacity * 0.6})`;
                ctx.fill();

                if (twinkleOpacity > 0.8) {
                    ctx.strokeStyle = `rgba(219, 234, 254, ${twinkleOpacity * 0.8})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particle.x - particle.size * 2, particle.y);
                    ctx.lineTo(particle.x + particle.size * 2, particle.y);
                    ctx.moveTo(particle.x, particle.y - particle.size * 2);
                    ctx.lineTo(particle.x, particle.y + particle.size * 2);
                    ctx.stroke();
                }
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ background: "transparent" }}
        />
    );
}
