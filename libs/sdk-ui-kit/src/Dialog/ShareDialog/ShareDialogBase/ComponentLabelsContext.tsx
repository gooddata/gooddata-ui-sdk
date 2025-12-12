// (C) 2021-2025 GoodData Corporation

import { createContext, useContext } from "react";

import { type IComponentLabelsProviderProps } from "./types.js";
import { type IShareDialogLabels } from "../types.js";

const defaultLabels: IShareDialogLabels = {
    accessTypeLabel: "access-type-label",
    accessRegimeLabel: "access-regime-label",
    removeAccessGranteeTooltip: "remove-access-grantee-tooltip",
    removeAccessCreatorTooltip: "remove-access-creator-tooltip",
};

const LabelsContext = createContext<IShareDialogLabels>(defaultLabels);

/**
 * @internal
 */
export const useComponentLabelsContext = (): IShareDialogLabels => useContext(LabelsContext);

/**
 * @internal
 */
export function ComponentLabelsProvider({ children, labels }: IComponentLabelsProviderProps) {
    return <LabelsContext.Provider value={labels}>{children}</LabelsContext.Provider>;
}
