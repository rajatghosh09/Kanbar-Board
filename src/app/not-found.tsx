import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
      <p className="text-muted-foreground text-lg">Page not found</p>
      <Link
        href="/"
        className="text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
      >
        Go back home
      </Link>
    </div>
  );
}
