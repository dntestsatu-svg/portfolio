"use client";

import { useDeferredValue, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownEditorProps = {
  name: string;
  defaultValue?: string;
};

type ViewMode = "write" | "split" | "preview";

type SelectionResult = {
  selectionStart: number;
  selectionEnd: number;
};

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function replaceSelection(
  input: HTMLTextAreaElement,
  nextText: string,
  selection: SelectionResult,
  setValue: (value: string) => void,
) {
  setValue(nextText);

  requestAnimationFrame(() => {
    input.focus();
    input.setSelectionRange(selection.selectionStart, selection.selectionEnd);
  });
}

function wrapSelection(
  input: HTMLTextAreaElement,
  prefix: string,
  suffix: string,
  placeholder: string,
  setValue: (value: string) => void,
) {
  const { selectionStart, selectionEnd, value } = input;
  const selected = value.slice(selectionStart, selectionEnd) || placeholder;
  const inserted = `${prefix}${selected}${suffix}`;
  const nextValue = `${value.slice(0, selectionStart)}${inserted}${value.slice(selectionEnd)}`;

  replaceSelection(
    input,
    nextValue,
    {
      selectionStart: selectionStart + prefix.length,
      selectionEnd: selectionStart + prefix.length + selected.length,
    },
    setValue,
  );
}

function prefixLines(
  input: HTMLTextAreaElement,
  prefix: string,
  placeholder: string,
  setValue: (value: string) => void,
) {
  const { selectionStart, selectionEnd, value } = input;
  const selected = value.slice(selectionStart, selectionEnd);
  const block = selected || placeholder;
  const formatted = block
    .split("\n")
    .map((line) => (line.trim().length > 0 ? `${prefix}${line}` : prefix.trimEnd()))
    .join("\n");
  const nextValue = `${value.slice(0, selectionStart)}${formatted}${value.slice(selectionEnd)}`;

  replaceSelection(
    input,
    nextValue,
    {
      selectionStart,
      selectionEnd: selectionStart + formatted.length,
    },
    setValue,
  );
}

function orderedList(
  input: HTMLTextAreaElement,
  placeholder: string,
  setValue: (value: string) => void,
) {
  const { selectionStart, selectionEnd, value } = input;
  const selected = value.slice(selectionStart, selectionEnd);
  const block = selected || placeholder;
  const formatted = block
    .split("\n")
    .map((line, index) => `${index + 1}. ${line}`)
    .join("\n");
  const nextValue = `${value.slice(0, selectionStart)}${formatted}${value.slice(selectionEnd)}`;

  replaceSelection(
    input,
    nextValue,
    {
      selectionStart,
      selectionEnd: selectionStart + formatted.length,
    },
    setValue,
  );
}

function insertCodeBlock(input: HTMLTextAreaElement, setValue: (value: string) => void) {
  const { selectionStart, selectionEnd, value } = input;
  const selected = value.slice(selectionStart, selectionEnd) || "const result = await fetchData();";
  const inserted = `\`\`\`ts\n${selected}\n\`\`\``;
  const nextValue = `${value.slice(0, selectionStart)}${inserted}${value.slice(selectionEnd)}`;

  replaceSelection(
    input,
    nextValue,
    {
      selectionStart: selectionStart + 6,
      selectionEnd: selectionStart + 6 + selected.length,
    },
    setValue,
  );
}

function insertLink(input: HTMLTextAreaElement, setValue: (value: string) => void) {
  const { selectionStart, selectionEnd, value } = input;
  const selected = value.slice(selectionStart, selectionEnd) || "Judul tautan";
  const inserted = `[${selected}](https://example.com)`;
  const nextValue = `${value.slice(0, selectionStart)}${inserted}${value.slice(selectionEnd)}`;
  const urlStart = selectionStart + selected.length + 3;

  replaceSelection(
    input,
    nextValue,
    {
      selectionStart: urlStart,
      selectionEnd: urlStart + "https://example.com".length,
    },
    setValue,
  );
}

function insertImage(input: HTMLTextAreaElement, setValue: (value: string) => void) {
  const { selectionStart, selectionEnd, value } = input;
  const inserted = "![Deskripsi gambar](https://example.com/image.webp)";
  const nextValue = `${value.slice(0, selectionStart)}${inserted}${value.slice(selectionEnd)}`;

  replaceSelection(
    input,
    nextValue,
    {
      selectionStart: selectionStart + 2,
      selectionEnd: selectionStart + "Deskripsi gambar".length + 2,
    },
    setValue,
  );
}

const viewOptions: Array<{ value: ViewMode; label: string }> = [
  { value: "write", label: "Tulis" },
  { value: "split", label: "Split" },
  { value: "preview", label: "Preview" },
];

export function MarkdownEditor({ name, defaultValue = "" }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [view, setView] = useState<ViewMode>("split");
  const deferredValue = useDeferredValue(value);
  const wordCount = countWords(value);
  const readMinutes = Math.max(1, Math.ceil(wordCount / 220));
  const runWithTextarea = (callback: (input: HTMLTextAreaElement) => void) => {
    const input = textareaRef.current;

    if (!input) {
      return;
    }

    callback(input);
  };
  const handleHeading = () =>
    runWithTextarea((input) => prefixLines(input, "## ", "Judul section", setValue));
  const handleBold = () =>
    runWithTextarea((input) => wrapSelection(input, "**", "**", "teks penting", setValue));
  const handleItalic = () =>
    runWithTextarea((input) => wrapSelection(input, "_", "_", "penekanan", setValue));
  const handleBullet = () =>
    runWithTextarea((input) => prefixLines(input, "- ", "Poin pertama\nPoin kedua", setValue));
  const handleOrdered = () =>
    runWithTextarea((input) => orderedList(input, "Langkah pertama\nLangkah kedua", setValue));
  const handleQuote = () =>
    runWithTextarea((input) => prefixLines(input, "> ", "Catatan atau insight penting", setValue));
  const handleLink = () => runWithTextarea((input) => insertLink(input, setValue));
  const handleCode = () => runWithTextarea((input) => insertCodeBlock(input, setValue));
  const handleImage = () => runWithTextarea((input) => insertImage(input, setValue));

  const showEditor = view !== "preview";
  const showPreview = view !== "write";

  return (
    <div className="admin-editor">
      <div className="admin-editor-toolbar">
        <div className="admin-editor-tools">
          <button type="button" className="admin-tool-button" onClick={handleHeading}>
            H2
          </button>
          <button type="button" className="admin-tool-button" onClick={handleBold}>
            Bold
          </button>
          <button type="button" className="admin-tool-button" onClick={handleItalic}>
            Italic
          </button>
          <button type="button" className="admin-tool-button" onClick={handleBullet}>
            Bullet
          </button>
          <button type="button" className="admin-tool-button" onClick={handleOrdered}>
            Ordered
          </button>
          <button type="button" className="admin-tool-button" onClick={handleQuote}>
            Quote
          </button>
          <button type="button" className="admin-tool-button" onClick={handleLink}>
            Link
          </button>
          <button type="button" className="admin-tool-button" onClick={handleCode}>
            Code
          </button>
          <button type="button" className="admin-tool-button" onClick={handleImage}>
            Image
          </button>
        </div>

        <div className="admin-editor-view-toggle" role="tablist" aria-label="Mode editor">
          {viewOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`admin-view-button${view === option.value ? " is-active" : ""}`}
              aria-pressed={view === option.value}
              onClick={() => setView(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`admin-editor-body${view === "split" ? " is-split" : ""}`}>
        {showEditor ? (
          <div className="admin-editor-panel">
            <textarea
              ref={textareaRef}
              id={name}
              name={name}
              rows={18}
              className="admin-editor-textarea"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Tulis artikel dengan Markdown. Gunakan heading untuk struktur, list untuk langkah, dan code block untuk potongan kode."
              spellCheck
              required
            />
          </div>
        ) : null}

        {showPreview ? (
          <div className="admin-editor-panel">
            <div className="admin-editor-preview">
              {deferredValue.trim().length > 0 ? (
                <div className="markdown-prose">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{deferredValue}</ReactMarkdown>
                </div>
              ) : (
                <div className="admin-editor-placeholder">
                  Preview akan muncul saat Anda mulai menulis. Gunakan toolbar di atas untuk
                  menyisipkan heading, list, link, code block, dan gambar Markdown dengan cepat.
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className="admin-editor-meta">
        <span>{wordCount} kata</span>
        <span>Estimasi baca {readMinutes} menit</span>
        <span>Format: Markdown + GFM</span>
      </div>
    </div>
  );
}
