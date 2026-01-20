// (C) 2022-2026 GoodData Corporation

export type ResizerStatus = "default" | "active" | "muted" | "error";

export interface IResizerProps {
    status: ResizerStatus;
}
