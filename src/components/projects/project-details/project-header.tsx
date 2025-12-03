"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Edit3, CheckCircle, RotateCcw, Check, X, Calendar } from "lucide-react";
import { statusConfig } from "./status-config";

interface ProjectHeaderProps {
    title: string;
    status: string;
    createdAt: string;
    isFacultyOrAbove: boolean;
    canEdit?: boolean;
    isApprovePending: boolean;
    isRejectPending: boolean;
    isCompletePending: boolean;
    isRevertPending: boolean;
    isReProposePending: boolean;
    onApprove: () => void;
    onReject: () => void;
    onEdit: () => void;
    onComplete: () => void;
    onRevert: () => void;
    onRePropose: () => void;
}

export default function ProjectHeader({
    title,
    status,
    createdAt,
    isFacultyOrAbove,
    canEdit,
    isApprovePending,
    isRejectPending,
    isCompletePending,
    isRevertPending,
    isReProposePending,
    onApprove,
    onReject,
    onEdit,
    onComplete,
    onRevert,
    onRePropose,
}: ProjectHeaderProps) {
    const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig.PROPOSED;

    return (
        <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`${statusInfo.className} px-3 py-1`}>
                            <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor} mr-2`} />
                            {statusInfo.label}
                        </Badge>
                        {createdAt && (
                            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{title}</h1>
                </div>

                <div className="flex flex-wrap gap-2">
                    {isFacultyOrAbove && (
                        <>
                            {(status === "PROPOSED" || status === "REJECTED") && (
                                <Button
                                    onClick={onApprove}
                                    disabled={isApprovePending}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                >
                                    {isApprovePending ? (
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4 mr-2" />
                                    )}
                                    Approve
                                </Button>
                            )}
                            {(status === "PROPOSED" || status === "ONGOING") && (
                                <Button
                                    onClick={onReject}
                                    disabled={isRejectPending}
                                    variant="destructive"
                                    className="shadow-sm"
                                >
                                    {isRejectPending ? (
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <X className="w-4 h-4 mr-2" />
                                    )}
                                    Reject
                                </Button>
                            )}
                        </>
                    )}

                    {canEdit && (
                        <>
                            <Button variant="outline" onClick={onEdit} className="shadow-sm">
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit Project
                            </Button>

                            {status === "ONGOING" && (
                                <Button
                                    onClick={onComplete}
                                    disabled={isCompletePending}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                >
                                    {isCompletePending ? (
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                    )}
                                    Mark Completed
                                </Button>
                            )}

                            {status === "COMPLETED" && (
                                <Button
                                    onClick={onRevert}
                                    disabled={isRevertPending}
                                    variant="outline"
                                    className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 shadow-sm"
                                >
                                    {isRevertPending ? (
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                    )}
                                    Revert to Live
                                </Button>
                            )}

                            {status === "REJECTED" && (
                                <Button
                                    onClick={onRePropose}
                                    disabled={isReProposePending}
                                    className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                                >
                                    {isReProposePending ? (
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                    )}
                                    Re-propose
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
