import Image from "next/image";
import Link from "next/link";

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-bold">
      <Image src="/logo.svg" alt="Waypoint" width={size} height={size} className="rounded-lg" />
      Waypoint
    </Link>
  );
}
