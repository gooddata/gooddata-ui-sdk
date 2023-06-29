// (C) 2021 GoodData Corporation

import React, { useContext } from "react";
import { IShareDialogLabels } from "../types.js";
import { IComponentLabelsProviderProps } from "./types.js";

const defaultLabels: IShareDialogLabels = {
    accessTypeLabel: "access-type-label",
    accessRegimeLabel: "access-regime-label",
    removeAccessGranteeTooltip: "remove-access-grantee-tooltip",
    removeAccessCreatorTooltip: "remove-access-creator-tooltip",
};

const LabelsContext = React.createContext<IShareDialogLabels>(defaultLabels);

/**
 * @internal
 */
export const useComponentLabelsContext = (): IShareDialogLabels => useContext(LabelsContext);

/**
 * @internal
 */
export const ComponentLabelsProvider: React.FC<IComponentLabelsProviderProps> = (props) => {
    const { children, labels } = props;

    return <LabelsContext.Provider value={labels}>{children}</LabelsContext.Provider>;
};
