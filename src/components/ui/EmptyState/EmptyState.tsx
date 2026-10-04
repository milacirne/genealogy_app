import type { ReactNode } from "react";
import "./EmptyState.css";

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty-state" role="status">
      <span className="empty-state__ornament" aria-hidden="true" />
      <p>{title}</p>
      {children}
    </div>
  );
}
