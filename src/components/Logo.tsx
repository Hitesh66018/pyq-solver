import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      aria-label="CrackPYQ home"
      className="inline-flex shrink-0 items-center gap-2.5"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 56 48"
        className="h-10 w-12 shrink-0"
        fill="none"
      >
        <defs>
          <linearGradient id="crackpyq-mark" x1="5" y1="4" x2="51" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#34D399" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>
        </defs>
        <rect x="2" y="4" width="52" height="40" rx="20" fill="url(#crackpyq-mark)" />
        <path
          transform="translate(2 0)"
          d="M27.1 8.5 14.8 25.2c-.5.7 0 1.7.9 1.7h8l-2.1 12.6c-.2 1.1 1.2 1.6 1.8.7l11.8-17c.5-.7 0-1.7-.9-1.7h-7.8l2.3-12.2c.2-1.1-1.1-1.7-1.7-.8Z"
          fill="white"
          stroke="white"
          strokeLinejoin="round"
          strokeWidth="1.2"
        />
      </svg>
      <span className="text-[1.2rem] font-extrabold leading-none text-white">
        Crack<span className="text-emerald-400">PYQ</span>
      </span>
    </Link>
  );
}