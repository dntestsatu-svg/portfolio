"use client";

import { useState } from "react";

type CodeBlockProps = {
  code: string;
  language?: string;
};

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="content-code-block">
      <div className="content-code-header">
        <span className="content-code-language">{language || "code"}</span>
        <button
          type="button"
          className="content-copy-button"
          data-copied={copied}
          aria-live="polite"
          onClick={handleCopy}
        >
          {copied ? "Tersalin" : "Copy"}
        </button>
      </div>
      <div className="content-code-scroll" data-code-scroll>
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
