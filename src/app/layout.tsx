import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
    title: "Devlabs – Project Management Platform",
    description: "Organize, track, and evaluate projects",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`antialiased`}>
                <Providers>
                    {children}
                    <Toaster
                        position="bottom-right"
                        richColors
                        closeButton
                        expand={false}
                        visibleToasts={9}
                    />
                </Providers>
            </body>
        </html>
    );
}
