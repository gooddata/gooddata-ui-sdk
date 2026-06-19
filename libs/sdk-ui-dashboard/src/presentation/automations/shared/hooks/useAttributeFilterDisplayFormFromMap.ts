// (C) 2025-2026 GoodData Corporation

import { useCallback } from "react";

import { type ObjRef } from "@gooddata/sdk-model";

import { useAutomationsContext } from "../../contexts/AutomationsContext.js";

export function useAttributeFilterDisplayFormFromMap() {
    const { getAttributeFilterDisplayForm } = useAutomationsContext();
    return useCallback(
        (displayForm: ObjRef) => getAttributeFilterDisplayForm(displayForm),
        [getAttributeFilterDisplayForm],
    );
}
