import React, { useEffect, useRef, useState } from "react";
import { Search, Mic } from "lucide-react";
import SearchFields from "./SearchFields";

/**
 * Searchbar (Google-like single-pill look).
 *
 * Props:
 * - value (string)
 * - field (string) initial value: "name" | "reg" | "priority" | "rating"
 * - onChange(query, field)  -- called live on typing or when field changes
 * - onSearch(query, field)  -- called on submit (Enter)
 */
export default function Searchbar({
  value = "",
  field = "name",
  onChange,
  onSearch,
}) {
  const [query, setQuery] = useState(value ?? "");
  const [selectedField, setSelectedField] = useState(field);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => setQuery(value ?? ""), [value]);
  useEffect(() => {
    if (onChange) onChange(query, selectedField);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedField]);

  function handleInputChange(e) {
    setQuery(e.target.value);
    if (onChange) onChange(e.target.value, selectedField);
  }

  function handleSubmit(e) {
    e?.preventDefault();
    const v = (query ?? "").trim();
    if (!v) return;
    if (onSearch) onSearch(v, selectedField);
  }

  return (
    <div className="flex flex-col items-center justify-start pt-[8vh] pb-14 bg-gray-50 p-4">
      <h1 className="text-7xl font-google font-medium tracking-tight text-gray-800 mb-8 sm:mb-12 text-center select-none">
        Student <br className="sm:hidden" /> Dashboard
      </h1>

      <div className="w-full max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="relative w-full"
          aria-label="Search form"
        >
          <div
            className={`mx-auto flex items-center gap-3
                        rounded-full px-5 py-4
                        bg-white shadow-lg transition-all duration-300
                        ${focused ? "ring-2 ring-blue-500" : "hover:shadow-xl"}`}
            role="search"
          >
            <div className="flex items-center gap-3 pr-3 border-r border-gray-200">
              <SearchFields
                value={selectedField}
                onChange={(f) => {
                  setSelectedField(f);
                  if (onChange) onChange(query, f);
                  setTimeout(() => inputRef.current?.focus(), 0);
                }}
              />
            </div>

            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />

            <input
              ref={inputRef}
              value={query}
              onChange={handleInputChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 120)}
              placeholder={
                selectedField === "name"
                  ? "Search by name..."
                  : selectedField === "reg"
                  ? "Search by regn no..."
                  : selectedField === "priority"
                  ? "Search by priority (High / Medium / Low or 1/2/3)"
                  : "Search by rating (show users with latest rating >= value)"
              }
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-base md:text-lg px-3"
              aria-label="Search input"
            />

            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                aria-label="Voice search"
                onClick={() => inputRef.current?.focus()}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Mic className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-500 text-center select-none">
            Quick search — choose a field and type to filter results
          </p>
        </form>
      </div>
    </div>
  );
}