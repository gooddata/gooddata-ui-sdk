// (C) 2022-2026 GoodData Corporation

import {
    type ApplicationContextStoreAction,
    ApplicationContextStoreActionTypeKeys,
    type IStoreApiTokenStoreAction,
} from "./app_context_actions.js";
import {
    type IApplicationContextState,
    defaultApplicationContextState,
} from "./application_context_state.js";

const storeApiToken = (
    state: IApplicationContextState,
    { payload: { token, type } }: IStoreApiTokenStoreAction,
): IApplicationContextState => ({
    ...state,
    apiToken: token,
    apiTokenType: type,
});

const storeBackendInitialized = (state: IApplicationContextState): IApplicationContextState => ({
    ...state,
    isBackendInitialized: true,
});

export const applicationContextReducer = (
    state = defaultApplicationContextState,
    action: ApplicationContextStoreAction,
): IApplicationContextState => {
    switch (action.type) {
        case ApplicationContextStoreActionTypeKeys.STORE_API_TOKEN:
            return storeApiToken(state, action);
        case ApplicationContextStoreActionTypeKeys.STORE_BACKEND_INITIALIZED:
            return storeBackendInitialized(state);
        default:
            return state;
    }
};
