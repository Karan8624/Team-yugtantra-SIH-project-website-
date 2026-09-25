"use client";

import { useEffect, useRef, useState } from "react";
import { LOCALE_LABELS, useLocale, type Locale } from "@/lib/locale";
import { GlobeIcon, ChevronDownIcon, CheckIcon } from "./icons";
import { cn } from "@/lib/utils";

const LOCALES: Locale[] = ["en", "hi", "mr"];

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (compact) {
    return (
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 text-[11.5px] text-fg-muted"
        >
          <GlobeIcon width={12} height={12} strokeWidth={1.8} />
          {LOCALE_LABELS[locale]}
          <ChevronDownIcon width={10} height={10} />
        </button>
        {open && <LocaleMenu onPick={(l) => { setLocale(l); setOpen(false); }} className="top-6 right-0" />}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-lg border-[1.5px] border-panel-border text-[13.5px] font-semibold text-fg"
      >
        <GlobeIcon width={15} height={15} />
        {LOCALE_LABELS[locale]}
        <ChevronDownIcon width={12} height={12} />
      </button>
      {open && <LocaleMenu onPick={(l) => { setLocale(l); setOpen(false); }} className="top-[46px] right-0" />}
    </div>
  );
}

function LocaleMenu({ onPick, className }: { onPick: (l: Locale) => void; className?: string }) {
  const { locale } = useLocale();
  return (
    <div
      className={cn(
        "absolute w-[168px] bg-panel border border-panel-border rounded-[10px] shadow-lg p-1.5 z-20",
        className
      )}
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onPick(l)}
          className={cn(
            "w-full flex items-center justify-between px-2.5 py-2 rounded-md text-left text-[13.5px]",
            l === locale ? "bg-accent-soft font-semibold text-fg" : "text-fg-muted"
          )}
        >
          {LOCALE_LABELS[l]}
          {l === locale && <CheckIcon width={14} height={14} className="text-accent" />}
        </button>
      ))}
    </div>
  );
}
