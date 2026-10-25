// (C) 2022-2026 GoodData Corporation

export interface IApplicationContextState {
    apiToken?: string;
    apiTokenType?: string;
    isBackendInitialized: boolean;
}

export const defaultApplicationContextState: IApplicationContextState = {
    apiToken: undefined,
    apiTokenType: undefined,
    isBackendInitialized: false,
};
