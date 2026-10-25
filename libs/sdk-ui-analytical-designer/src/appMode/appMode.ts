// (C) 2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

import { ActionTypeKeys } from "../constants/actions.js";
import { getIsHostedComponentState } from "../store/embedding/embedding_selectors.js";
import { type IAppState } from "../store/types.js";

// Hosted-component mode: AD rendered in-process as a React component by a host app (e.g. the
// dashboards insight overlay), communicating through the embedding host adapter. The flag
// differentiates only where the default (host-shell) behavior is wrong: router choice (memory
// router instead of BrowserRouter) and postMessage listener registration (never touch the shared
// messagingUtils singleton).

export const setHostedComponentMode = createAction(
    ActionTypeKeys.SET_HOSTED_COMPONENT_MODE,
    (isHostedComponent: boolean) => ({ payload: { isHostedComponent } }),
);

export const isHostedComponentSelector = (state: IAppState): boolean => getIsHostedComponentState(state);

export interface IAppMode {
    isHostedComponent: boolean;
}

export function useAppMode(): IAppMode {
    const isHostedComponent = useSelector(isHostedComponentSelector);
    return { isHostedComponent };
}
