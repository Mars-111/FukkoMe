import './Shimmer.css'

type ShimmerTextProps = {
  width?: string | number;  // ширина (например "6rem" или 120)
  height?: string | number; // высота (например "1rem")
  rounded?: boolean;        // скруглённые края
  className?: string;       // для доп. стилей
};

export function ShimmerText({
  width = "6rem",
  height = "1rem",
  rounded = true,
  className = "",
}: ShimmerTextProps) {
  return (
    <div
      className={`shimmer ${rounded ? "rounded" : ""} ${className}`}
      style={{ width, height }}
    />
  );
}
