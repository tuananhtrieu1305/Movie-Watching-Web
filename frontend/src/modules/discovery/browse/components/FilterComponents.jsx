import React from "react";
import { FaTimes } from "react-icons/fa";

export function SidebarSection({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function SidebarChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
        ${
          active
            ? "bg-[#ffdd95] text-gray-900"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }`}
    >
      {label}
    </button>
  );
}

export function ActiveFilterBadge({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1 px-2.5 py-1 bg-[#ffdd95]/15 text-[#ffdd95] border border-[#ffdd95]/30 rounded-full text-xs font-medium">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-white transition-colors focus-visible:ring-1 focus-visible:ring-[#ffdd95] rounded-full"
        aria-label={`Remove ${label}`}
      >
        <FaTimes size={9} />
      </button>
    </span>
  );
}
