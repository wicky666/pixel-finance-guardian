import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-3xl font-semibold text-slate-800">
          Pixel Finance Guardian
        </h1>
        <p className="text-slate-600">
          Math simulation and behavior review. Cost analysis and decision
          impact—no price predictions, no trading advice.
        </p>

        <nav
          className="flex flex-wrap justify-center gap-4 pt-4"
          aria-label="Main navigation"
        >
          <Link
            href="/sandbox"
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300 transition"
          >
            Sandbox
          </Link>
          <Link
            href="/shadow"
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300 transition"
          >
            Shadow
          </Link>
          <Link
            href="/behavior"
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300 transition"
          >
            Behavior
          </Link>
          <Link
            href="/vision"
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300 transition"
          >
            Vision
          </Link>
          <Link
            href="/social"
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300 transition"
          >
            Social
          </Link>
          <Link
            href="/report"
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300 transition"
          >
            Report
          </Link>
        </nav>
      </div>
    </main>
  );
}
