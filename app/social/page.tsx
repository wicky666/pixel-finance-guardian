import Link from "next/link";

export default function SocialPage() {
  return (
    <main className="min-h-screen p-6">
      <Link href="/" className="text-slate-600 hover:underline">
        ← Home
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Social</h1>
      <p className="mt-2 text-slate-600">Placeholder. Coming soon.</p>
    </main>
  );
}
