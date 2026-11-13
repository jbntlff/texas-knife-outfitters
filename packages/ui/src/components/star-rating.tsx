export function StarRating({
  rating,
  className = "",
}: {
  rating: number;
  className?: string;
}) {
  return (
    <span
      aria-label={`${rating} out of 5 stars`}
      className={className}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={
            index < rating
              ? "text-amber-500"
              : "text-muted-foreground/30"
          }
        >
          ★
        </span>
      ))}
    </span>
  );
}
