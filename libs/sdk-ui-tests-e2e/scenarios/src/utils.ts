// (C) 2021 GoodData Corporation

import { type IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi/esm/workspace";

export interface IWorkspaceSourceState {
    isLoading: boolean;
    error?: Error;
    data?: IWorkspaceDescriptor[];
}
export const defaultSourceState: IWorkspaceSourceState = { isLoading: true };
