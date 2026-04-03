import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Search } from "lucide-react";
import { getCategories, HIDDEN_CATS } from "@/demo-data";

const categories = getCategories();

export function Layout() {
  const [expandedHidden, setExpandedHidden] = useState<Set<string>>(new Set());

  const toggleHidden = (title: string) => {
    setExpandedHidden((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 shrink-0 border-r border-border bg-surface overflow-y-auto">
        <NavLink to="/" className="flex items-center gap-2 px-5 py-4 border-b border-border hover:bg-surface-hover transition-colors">
          <Search className="w-5 h-5 text-primary-light" />
          <span className="font-semibold text-lg text-text">StudyOS Demos</span>
        </NavLink>
        <nav className="py-2">
          {categories.map((cat) => {
            const isHidden = HIDDEN_CATS.includes(cat.title);
            const isExpanded = expandedHidden.has(cat.title);

            if (isHidden) {
              return (
                <div key={cat.title} className="mb-1">
                  <button
                    onClick={() => toggleHidden(cat.title)}
                    className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-text transition-colors w-full text-left"
                  >
                    <cat.icon className="w-3.5 h-3.5" />
                    {cat.title} ({cat.items.length})
                    <span className="text-[10px] ml-auto">{isExpanded ? "▲" : "▼"}</span>
                  </button>
                  {isExpanded &&
                    cat.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `block px-5 py-1.5 text-sm transition-colors ${
                            isActive
                              ? "text-primary-light bg-primary/10 border-r-2 border-primary"
                              : "text-text-muted hover:text-text hover:bg-surface-hover"
                          }`
                        }
                      >
                        {item.label}
                        {item.isNew && (
                          <span className="ml-1.5 text-[9px] font-bold px-1 py-0.5 rounded bg-green-500/20 text-green-400 uppercase leading-none">
                            NEW
                          </span>
                        )}
                      </NavLink>
                    ))}
                </div>
              );
            }

            return (
              <div key={cat.title} className="mb-1">
                <div className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  <cat.icon className="w-3.5 h-3.5" />
                  {cat.title}
                </div>
                {cat.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `block px-5 py-1.5 text-sm transition-colors ${
                        isActive
                          ? "text-primary-light bg-primary/10 border-r-2 border-primary"
                          : "text-text-muted hover:text-text hover:bg-surface-hover"
                      }`
                    }
                  >
                    {item.label}
                    {item.isNew && (
                      <span className="ml-1.5 text-[9px] font-bold px-1 py-0.5 rounded bg-green-500/20 text-green-400 uppercase leading-none">
                        NEW
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
