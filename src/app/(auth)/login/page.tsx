"use client";

import { signIn, useSession } from "next-auth/react";
import { Shield, Zap, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ParticleField from "@/components/hero/particle-field";
import "@/components/hero/styles/hero-animations.css";

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user && !isRedirecting) {
      setIsRedirecting(true);
      router.push("/dashboard");
    }
  }, [session, status, router, isRedirecting]);

  const handleKeycloakSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn("keycloak", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsSigningIn(false);
    }
  };

  if (session?.user) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden flex items-center justify-center">
      <ParticleField />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-gray-900/40" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-lg mx-4 animate-fadeInUp">
        <div className="relative p-10 rounded-2xl backdrop-blur-xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.08] shadow-2xl">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-blue-500/[0.03] via-transparent to-indigo-500/[0.03]" />

          {/* Content */}
          <div className="relative z-10">
            {/* Devlabs Logo */}
            <div className="text-center mb-10">
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-300 bg-clip-text text-transparent animate-fadeInUp">
                Devlabs
              </h1>
              <p className="text-gray-400 font-medium animate-fadeInUp animation-delay-300">
                Welcome back to your workspace
              </p>
            </div>{" "}
            {/* Login Form */}
            <div className="space-y-8 animate-fadeInUp animation-delay-600">
              {" "}
              {/* Keycloak Sign In Button */}
              <button
                onClick={handleKeycloakSignIn}
                disabled={isSigningIn}
                className="relative overflow-hidden w-full group disabled:opacity-75 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-xl" />
                </div>

                <div className="relative z-10 px-8 py-4 flex items-center justify-center gap-3 text-white font-semibold transition-transform duration-200 group-hover:scale-[0.98]">
                  {isSigningIn ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Connecting to Keycloak...
                    </>
                  ) : (
                    <>
                      <Shield size={20} />
                      Continue with Keycloak
                    </>
                  )}
                </div>
              </button>
              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="text-gray-500 text-sm font-medium">
                  Secure Authentication
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors duration-300">
                  <Shield className="w-7 h-7 mb-3 text-blue-400" />
                  <h3 className="font-semibold text-white mb-1">Secure</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Enterprise-grade security
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors duration-300">
                  <Zap className="w-7 h-7 mb-3 text-indigo-400" />
                  <h3 className="font-semibold text-white mb-1">Fast</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Quick and seamless access
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
