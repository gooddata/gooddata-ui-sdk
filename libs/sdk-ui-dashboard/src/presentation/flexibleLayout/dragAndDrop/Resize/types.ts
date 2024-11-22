// (C) 2022-2024 GoodData Corporation

export type ResizerStatus = "active" | "muted" | "error";

export interface ResizerProps {
    status: ResizerStatus;
}
