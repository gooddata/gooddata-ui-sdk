// (C) 2022-2024 GoodData Corporation

export type ResizerStatus = "default" | "active" | "muted" | "error";

export interface ResizerProps {
    status: ResizerStatus;
}
