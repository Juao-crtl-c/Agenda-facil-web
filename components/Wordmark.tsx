export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-semibold brand-text ${className}`}>
      Agenda Fácil
    </span>
  );
}
