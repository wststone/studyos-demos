import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Filter, X } from "lucide-react";
import { demos, SUBJECT_LABELS, HIDDEN_CATS } from "@/demo-data";

const ALL_SUBJECTS = Object.keys(SUBJECT_LABELS);

const ALL_TAGS = Array.from(new Set(demos.flatMap((d) => d.tags))).sort();

export function CatalogPage() {
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [showTags, setShowTags] = useState(false);
  const [expandedHidden, setExpandedHidden] = useState<Set<string>>(new Set());

  const toggleHidden = (cat: string) => {
    setExpandedHidden((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const toggleSubject = (s: string) => {
    setSelectedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const toggleTag = (t: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const clearAll = () => {
    setSelectedSubjects(new Set());
    setSelectedTags(new Set());
  };

  const hasFilters = selectedSubjects.size > 0 || selectedTags.size > 0;

  const filtered = useMemo(() => {
    return demos.filter((d) => {
      if (selectedSubjects.size > 0 && !d.subjects.some((s) => selectedSubjects.has(s))) return false;
      if (selectedTags.size > 0 && !d.tags.some((t) => selectedTags.has(t))) return false;
      return true;
    });
  }, [selectedSubjects, selectedTags]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">StudyOS 教育组件 Demo</h1>
      <p className="text-text-muted mb-6">28 个交互式教育组件原型</p>

      {/* Filter section */}
      <div className="mb-6 space-y-3">
        {/* Subjects */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">📚 学科</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_SUBJECTS.map((s) => {
              const active = selectedSubjects.has(s);
              const count = demos.filter((d) => d.subjects.includes(s)).length;
              return (
                <button
                  key={s}
                  onClick={() => toggleSubject(s)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "bg-surface-alt text-text-muted hover:bg-surface-hover hover:text-text border border-border"
                  }`}
                >
                  {SUBJECT_LABELS[s]} <span className="opacity-60">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags toggle */}
        <div>
          <button
            onClick={() => setShowTags(!showTags)}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-text transition-colors"
          >
            <Filter className="w-3 h-3" />
            🏷️ 标签筛选 {selectedTags.size > 0 && `(${selectedTags.size})`}
            <span className="text-[10px] normal-case font-normal">{showTags ? "▲" : "▼"}</span>
          </button>
          {showTags && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {ALL_TAGS.map((t) => {
                const active = selectedTags.has(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleTag(t)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                      active
                        ? "bg-primary/20 text-primary-light border border-primary/50"
                        : "bg-surface-alt text-text-muted hover:bg-surface-hover border border-transparent"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Active filters & clear */}
        {hasFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-text-muted">
              显示 {filtered.length}/{demos.length} 个组件
            </span>
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-xs text-primary-light hover:text-primary transition-colors"
            >
              <X className="w-3 h-3" />
              清除筛选
            </button>
          </div>
        )}
      </div>

      {/* Demo grid */}
      {(() => {
        const main = filtered.filter((d) => !HIDDEN_CATS.includes(d.cat));
        const hiddenGroups = HIDDEN_CATS.map((cat) => ({
          cat,
          items: filtered.filter((d) => d.cat === cat),
        })).filter((g) => g.items.length > 0);

        const renderCard = (d: (typeof demos)[number]) => (
          <Link
            key={d.path}
            to={d.path}
            className="demo-card hover:border-primary/50 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary-light group-hover:bg-primary/20 transition-colors">
                <d.icon className="w-5 h-5" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <h3 className="font-semibold text-text group-hover:text-primary-light transition-colors">
                  {d.label}
                  {"isNew" in d && d.isNew && (
                    <span className="ml-2 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 uppercase leading-none align-middle">
                      NEW
                    </span>
                  )}
                </h3>
                <p className="text-sm text-text-muted mt-1">{d.desc}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="demo-tag">{d.cat}</span>
                  {d.subjects.map((s) => (
                    <span
                      key={s}
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        selectedSubjects.has(s)
                          ? "bg-primary/20 text-primary-light"
                          : "bg-surface-alt text-text-muted"
                      }`}
                    >
                      {SUBJECT_LABELS[s] || s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        );

        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {main.map(renderCard)}
            </div>

            {hiddenGroups.map((group) => {
              const isExpanded = expandedHidden.has(group.cat);
              const Icon = group.items[0].icon;
              return (
                <div key={group.cat} className="mt-8">
                  <button
                    onClick={() => toggleHidden(group.cat)}
                    className="flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors mb-4"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{group.cat} ({group.items.length})</span>
                    <span className="text-[10px]">{isExpanded ? "▲" : "▼"}</span>
                  </button>
                  {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {group.items.map(renderCard)}
                    </div>
                  )}
                </div>
              );
            })}

            {main.length === 0 && hiddenGroups.length === 0 && (
              <div className="text-center py-16">
                <Filter className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
                <p className="text-text-muted">没有匹配的组件</p>
                <button
                  onClick={clearAll}
                  className="mt-2 text-sm text-primary-light hover:underline"
                >
                  清除筛选
                </button>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}
