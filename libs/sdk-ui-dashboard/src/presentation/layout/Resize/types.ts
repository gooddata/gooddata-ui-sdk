// (C) 2021-2022 GoodData Corporation

export type IResizerStatus = "active" | "muted" | "error";

export interface IResizerProps {
    status: IResizerStatus;
}
