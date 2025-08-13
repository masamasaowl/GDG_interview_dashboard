import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Props:
 *  - value: "name" | "reg" | "priority" | "rating"
 *  - onChange: (field) => void
 *
 * NOTE: This component purposely has NO background so it blends into the
 * surrounding search pill. The dropdown panel still appears when opened.
 */
export default function SearchFields({ value = "name", onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const options = [
    { key: "name", label: "Name" },
    { key: "reg", label: "Regn No." },
    { key: "priority", label: "Priority" },
    { key: "rating", label: "Rating" },
  ];

  useEffect(() => {
    function onDocClick(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selected = options.find((o) => o.key === value) || options[0];

  return (
    <div className="relative inline-block text-left" ref={ref}>
      {/* Transparent button so it visually integrates with the pill */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        <span className="select-none">{selected.label}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Search field"
          className="absolute top-full left-0 mt-2 w-44 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden z-40"
        >
          {options.map((opt) => (
            <li
              key={opt.key}
              role="option"
              aria-selected={opt.key === value}
              onClick={() => {
                if (onChange) onChange(opt.key);
                setOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (onChange) onChange(opt.key);
                  setOpen(false);
                }
              }}
              tabIndex={0}
              className={`px-4 py-2 cursor-pointer text-sm ${
                opt.key === value ? "bg-blue-50 text-gray-900" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
