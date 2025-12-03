export const statusConfig = {
    ONGOING: {
        label: "Live",
        className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
        dotColor: "bg-emerald-500",
    },
    COMPLETED: {
        label: "Completed",
        className: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
        dotColor: "bg-blue-500",
    },
    REJECTED: {
        label: "Rejected",
        className: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
        dotColor: "bg-red-500",
    },
    PROPOSED: {
        label: "Proposed",
        className: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
        dotColor: "bg-amber-500",
    },
};

export const getDisplayName = (path: string): string => {
    const name = path.split("/").pop() || path;
    const underscoreIndex = name.indexOf("_");
    if (underscoreIndex === -1) return name;
    const prefix = name.substring(0, underscoreIndex);
    if (/^\d+$/.test(prefix)) {
        return name.substring(underscoreIndex + 1);
    }
    return name;
};

export const getFileName = (path: string) => {
    return getDisplayName(path);
};

export const getFileExtension = (path: string) => {
    const name = getDisplayName(path);
    const ext = name.split(".").pop()?.toLowerCase() || "";
    return ext;
};

export const getFileIcon = (path: string) => {
    const ext = getFileExtension(path);
    const iconColors: Record<string, string> = {
        pdf: "text-red-500",
        doc: "text-blue-600",
        docx: "text-blue-600",
        xls: "text-green-600",
        xlsx: "text-green-600",
        ppt: "text-orange-500",
        pptx: "text-orange-500",
        zip: "text-amber-600",
        rar: "text-amber-600",
        "7z": "text-amber-600",
        txt: "text-gray-500",
        jpg: "text-purple-500",
        jpeg: "text-purple-500",
        png: "text-purple-500",
        gif: "text-purple-500",
    };
    return iconColors[ext] || "text-blue-500";
};
