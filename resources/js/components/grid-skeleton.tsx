export const GridSkeleton = ({ itemCount = 10 }: { itemCount?: number }) => {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: itemCount }).map((_, i) => (
                <div key={i} className="space-y-3 rounded-md border p-4">
                    <div className="bg-muted h-4 w-3/4 animate-pulse rounded"></div>
                    <div className="bg-muted h-3 w-1/2 animate-pulse rounded"></div>
                    <div className="bg-muted h-3 w-5/6 animate-pulse rounded"></div>
                    <div className="bg-muted h-3 w-2/3 animate-pulse rounded"></div>
                </div>
            ))}
        </div>
    );
};
