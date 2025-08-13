// components/Searchbar.jsx
import React, { useEffect, useRef, useState } from "react";
import { Search, Mic, Image as Photo } from "lucide-react";

// fix eslint warn
import { motion as Motion } from "framer-motion";

/**
 * Controlled searchbar:
 * props:
 *  - value (string)
 *  - onChange(q)
 *  - onSearch(q)
 */
export default function Searchbar({ value = "", onChange, onSearch }) {
  const [query, setQuery] = useState(value);
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef([]);

  useEffect(() => setQuery(value ?? ""), [value]);

  // mock suggestions — adapt to call your suggestion API if needed
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setSuggestions([]);
      setOpen(false);
      setActiveIndex(-1);
      if (onChange) onChange(query);
      return;
    }
    const sample = ["gmail.com", "news", "react docs", "tailwindcss", "github", "youtube"];
    const filtered = sample.filter((s) => s.toLowerCase().includes(q.toLowerCase())).slice(0, 6);
    setSuggestions(filtered);
    setOpen(filtered.length > 0);
    setActiveIndex(-1);
    if (onChange) onChange(query);
  }, [query, onChange]);

  function submit(q) {
    const val = (q ?? query).trim();
    if (!val) return;
    if (onSearch) onSearch(val);
    setOpen(false);
    inputRef.current?.blur();
  }

  function onKeyDown(e) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min((suggestions.length - 1), i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(-1, i - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0) {
        e.preventDefault();
        const s = suggestions[activeIndex];
        setQuery(s);
        submit(s);
      } else {
        submit();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  }

  useEffect(() => {
    // keep focus on active suggestion for ARIA friendliness
    if (activeIndex >= 0 && listRef.current[activeIndex]) {
      listRef.current[activeIndex].scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  return (
    <div className="w-full flex justify-center">
      {/* center and limit width to ~70% on md+ */}
      <div className="w-full md:w-[70%] px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="relative"
          aria-label="Search form"
        >
          <div
            className={`flex items-center gap-3 bg-white rounded-full px-4 py-3 shadow-[0_6px_20px_rgba(32,33,36,0.08)] border transition-all ${
              focused ? "ring-1 ring-blue-300" : "border-transparent"
            }`}
            role="search"
          >
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />

            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => { setFocused(true); if (suggestions.length) setOpen(true); }}
              onBlur={() => setTimeout(() => { setFocused(false); setOpen(false); }, 120)}
              onKeyDown={onKeyDown}
              placeholder="Search by name, email or ID..."
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-sm sm:text-base"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls="search-suggestion-list"
            />

            {/* right icons (kept subtle like screenshot) */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                aria-label="Image search"
                onClick={() => inputRef.current?.focus()}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <Photo className="w-4 h-4 text-gray-500" />
              </button>

              <button
                type="button"
                aria-label="Voice search"
                onClick={() => inputRef.current?.focus()}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <Mic className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* suggestion dropdown */}
          <div className="relative">
            {open && suggestions.length > 0 && (
              <Motion.ul
                id="search-suggestion-list"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.12 }}
                className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-md overflow-hidden z-30 max-h-60 overflow-auto"
                role="listbox"
                aria-label="Search suggestions"
              >
                {suggestions.map((s, i) => {
                  const active = i === activeIndex;
                  return (
                    <li
                      key={s + i}
                      ref={(el) => (listRef.current[i] = el)}
                      role="option"
                      aria-selected={active}
                      onMouseDown={(ev) => {
                        ev.preventDefault(); // prevents blur before click
                        setQuery(s);
                        submit(s);
                      }}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`px-4 py-3 flex items-center gap-3 text-sm cursor-pointer ${
                        active ? "bg-blue-50 text-gray-900" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 truncate">{s}</div>
                    </li>
                  );
                })}
              </Motion.ul>
            )}
          </div>
        </form>

        {/* subtle helper text matching your screenshot spacing */}
        <p className="mt-3 text-xs text-gray-500 text-center select-none">
          Quick search — try student name, email or ID
        </p>
      </div>
    </div>
  );
}
