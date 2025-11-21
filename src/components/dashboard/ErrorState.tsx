interface ErrorStateProps {
    error: string;
}

export default function ErrorState({ error }: ErrorStateProps) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-destructive">{error}</p>
        </div>
    );
}
