import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function DemoShell({
  title,
  description,
  tags,
  children,
}: {
  title: string;
  description: string;
  tags?: string[];
  children: ReactNode;
}) {
  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回目录
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-text-muted mt-1">{description}</p>
        {tags && (
          <div className="flex gap-2 mt-3">
            {tags.map((t) => (
              <span key={t} className="demo-tag">{t}</span>
            ))}
          </div>
        )}
      </div>
      <div className="demo-card">{children}</div>
    </div>
  );
}
