"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Target, Github, ExternalLink } from "lucide-react";
import Link from "next/link";

interface ProjectAboutProps {
    description: string;
    objectives?: string | null;
    githubUrl?: string | null;
}

export default function ProjectAbout({ description, objectives, githubUrl }: ProjectAboutProps) {
    return (
        <Card className="overflow-hidden border-0 shadow-sm">
            <CardContent className="space-y-6">
                <div className="flex items-center gap-2 text-lg font-semibold">
                    <Target className="h-5 w-5 text-primary" />
                    About This Project
                </div>
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                    <p className="text-foreground leading-relaxed">{description}</p>
                </div>

                {objectives && (
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Objectives
                        </h3>
                        <p className="text-foreground leading-relaxed">{objectives}</p>
                    </div>
                )}

                {githubUrl && (
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Repository
                        </h3>
                        <Link
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 dark:bg-zinc-800 text-white rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors group"
                        >
                            <Github className="h-5 w-5" />
                            <span className="font-medium">View on GitHub</span>
                            <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
