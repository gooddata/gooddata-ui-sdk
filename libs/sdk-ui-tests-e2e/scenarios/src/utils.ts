// (C) 2021-2026 GoodData Corporation

import { type IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";

export interface IWorkspaceSourceState {
    isLoading: boolean;
    error?: Error;
    data?: IWorkspaceDescriptor[];
}
export const defaultSourceState: IWorkspaceSourceState = { isLoading: true };
