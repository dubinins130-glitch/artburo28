export function Arrow({ direction = "out" }: { direction?: "out" | "down" | "up" | "right" }) {
  return <span className={`arrow arrow--${direction}`} aria-hidden="true" />;
}
