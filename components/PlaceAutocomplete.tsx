"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { OutlinedFieldShell } from "@/components/Field";
import type { PlaceValue } from "@/lib/booking/types";
import { loadGoogleMaps } from "@/lib/google-maps";

interface Props {
  value: PlaceValue | null;
  onChange: (v: PlaceValue | null) => void;
  placeholder?: string;
  kind: "location" | "airport";
  label?: string;
  error?: string;
}

type Suggestion = { placeId: string; text: string };

export function PlaceAutocomplete({
  value,
  onChange,
  placeholder,
  kind,
  label,
  error,
}: Props) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const kindRef = useRef(kind);
  const debounceRef = useRef<number | null>(null);
  const sessionRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  const [text, setText] = useState(value?.address ?? "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);

  kindRef.current = kind;

  useEffect(() => {
    loadGoogleMaps().catch((err: Error) => setMapsError(err.message));
  }, []);

  useEffect(() => {
    setText(value?.address ?? "");
  }, [value]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  const fetchSuggestions = useCallback(async (input: string) => {
    if (!input.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setFetching(true);
    try {
      await loadGoogleMaps();
      const places = (await google.maps.importLibrary(
        "places",
      )) as google.maps.PlacesLibrary;
      if (!sessionRef.current) {
        sessionRef.current = new places.AutocompleteSessionToken();
      }
      const { suggestions: raw } =
        await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input,
          sessionToken: sessionRef.current,
          includedPrimaryTypes:
            kindRef.current === "airport" ? ["airport"] : undefined,
        });
      const next = raw
        .map((sug) => {
          const p = sug.placePrediction;
          if (!p) return null;
          return {
            placeId: p.placeId,
            text: p.text?.toString() ?? "",
          };
        })
        .filter(Boolean) as Suggestion[];
      setSuggestions(next);
      setOpen(next.length > 0);
    } catch (e) {
      console.error(e);
      setSuggestions([]);
      setOpen(false);
    } finally {
      setFetching(false);
    }
  }, []);

  const onInput = (v: string) => {
    setText(v);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => fetchSuggestions(v), 200);
    if (value) onChange(null);
  };

  const pick = (s: Suggestion) => {
    setText(s.text);
    setOpen(false);
    setSuggestions([]);
    sessionRef.current = null;
    onChange({ placeId: s.placeId, address: s.text });
  };

  const showList = open && suggestions.length > 0;
  const fieldError = error || mapsError;

  return (
    <div className={`relative ${label ? "mt-1" : ""}`}>
      <OutlinedFieldShell
        label={label}
        icon={
          <span aria-hidden="true" className="text-base leading-none">
            📍
          </span>
        }
        error={!!fieldError}
      >
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => onInput(e.target.value)}
          onFocus={() => {
            if (text.trim()) void fetchSuggestions(text);
            else if (suggestions.length > 0) setOpen(true);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          autoComplete="off"
          disabled={!!mapsError}
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={showList ? listboxId : undefined}
          aria-busy={fetching}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-60"
        />
      </OutlinedFieldShell>
      {fieldError && (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {fieldError}
        </p>
      )}
      {showList && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-lg"
        >
          {suggestions.map((s) => (
            <li key={s.placeId} role="option">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(s)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              >
                {s.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
