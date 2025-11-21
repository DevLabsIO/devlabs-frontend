import { ReactNode } from "react";

interface DashboardHeaderProps {
    title: string;
    actions?: ReactNode;
}

export default function DashboardHeader({ title, actions }: DashboardHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{title}</h1>
            {actions && <div className="flex gap-2">{actions}</div>}
        </div>
    );
}
