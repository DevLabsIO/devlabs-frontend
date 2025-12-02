"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Link2, Loader2, BookMarked } from "lucide-react";

interface AddReferenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reference: { title: string; url?: string; description?: string }) => void;
    isLoading: boolean;
}

export function AddReferenceModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
}: AddReferenceModalProps) {
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        onSubmit({
            title: title.trim(),
            url: url.trim() || undefined,
            description: description.trim() || undefined,
        });

        setTitle("");
        setUrl("");
        setDescription("");
    };

    const handleClose = () => {
        setTitle("");
        setUrl("");
        setDescription("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookMarked className="h-5 w-5 text-primary" />
                        Add Reference
                    </DialogTitle>
                    <DialogDescription>
                        Add a reference link or resource to your project.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="ref-title">
                            Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="ref-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., React Documentation"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ref-url" className="flex items-center gap-2">
                            <Link2 className="h-3.5 w-3.5" />
                            URL (optional)
                        </Label>
                        <Input
                            id="ref-url"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ref-description">Description (optional)</Label>
                        <Textarea
                            id="ref-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of this reference..."
                            rows={3}
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !title.trim()}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Reference
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
