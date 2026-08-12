// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

import { missingAlertStateProvider } from "./missingAlertStateProvider.js";
import { type useAlertFormState } from "./useAlertFormState.js";
import { type useAlertSupportedMetrics } from "./useAlertSupportedMetrics.js";

/**
 * The data the alerting dialog loads asynchronously: the supported measures and attributes with
 * their formats, the execution-result readers, and the current user's default recipients.
 *
 * Changes when an async load resolves, not per keystroke.
 *
 * @internal
 */
export type IAlertDataContextValue = Pick<
    ReturnType<typeof useAlertSupportedMetrics>,
    | "supportedMeasures"
    | "supportedAttributes"
    | "measureFormatMap"
    | "isResultLoading"
    | "getAttributeValues"
    | "getMetricValue"
> &
    Pick<ReturnType<typeof useAlertFormState>, "defaultUser" | "defaultRecipient">;

const AlertDataContext = createContext<IAlertDataContextValue | undefined>(undefined);
AlertDataContext.displayName = "AlertDataContext";

export const AlertDataContextProvider = AlertDataContext.Provider;

/**
 * Reads the data the alerting dialog loads asynchronously.
 *
 * Throws outside the alerting dialog's state providers, which mount only once
 * `useAlertingDialogContext().isLoading` is false — a replacement for `AlertingDialogComponent`
 * must check that flag before calling this. On the alerting side that state is reached only by an
 * automations refresh while the dialog is open, so it will not appear in manual testing.
 *
 * @internal
 */
export function useAlertData(): IAlertDataContextValue {
    return useContext(AlertDataContext) ?? missingAlertStateProvider("useAlertData");
}
