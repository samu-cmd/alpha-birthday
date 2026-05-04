"use client";

import { useState } from "react";

type CopyLinkButtonProps = {
  path: string;
};

export function CopyLinkButton({ path }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const absoluteUrl = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(absoluteUrl);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  return (
    <button className="btn btn-secondary" type="button" onClick={handleCopy}>
      {copied ? "Link copied" : "Copy share link"}
    </button>
  );
}
