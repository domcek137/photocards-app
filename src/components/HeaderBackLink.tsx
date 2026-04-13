"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type HeaderBackLinkConfig = {
  href: string;
  label: string;
};

const resolveBackLink = (pathname: string): HeaderBackLinkConfig | null => {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 2 && segments[0] === "sets") {
    return { href: "/sets", label: "Back to sets" };
  }

  if (segments.length === 3 && segments[0] === "sets" && segments[2] === "batch-import") {
    return { href: `/sets/${segments[1]}`, label: "Back to set" };
  }

  if (segments.length === 2 && segments[0] === "study") {
    return { href: `/sets/${segments[1]}`, label: "Back to set" };
  }

  return null;
};

export default function HeaderBackLink() {
  const pathname = usePathname();
  const backLink = resolveBackLink(pathname);

  if (!backLink) {
    return <div aria-hidden="true" />;
  }

  return (
    <Link href={backLink.href} className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
      {backLink.label}
    </Link>
  );
}