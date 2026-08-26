import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-black/10 px-6 py-6 text-center text-xs text-zinc-400 dark:border-white/10">
      <span>KutijaObroka — prototip. </span>
      <Link href="/admin" className="underline hover:text-zinc-600 dark:hover:text-zinc-300">
        Admin panel
      </Link>
    </footer>
  );
}
