import type { PropsWithChildren } from "react";
import "./PageContainer.css";

export function PageContainer({ children }: PropsWithChildren) { return <main className="page-container">{children}</main>; }
