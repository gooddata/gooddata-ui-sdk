// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { areObjRefsEqual } from "@gooddata/sdk-model";

import { useAttributeFilterContext } from "../Context/AttributeFilterContext.js";

/**
 * Hook that computes whether the attribute filter dropdown header should be shown
 * and provides the props needed to render it.
 *
 * @internal
 */
export function useAttributeFilterDropdownHeader() {
    const {
        title,
        attribute,
        displayForms,
        currentDisplayFormRef,
        currentDisplayAsDisplayFormRef,
        filterDetailRequestHandler,
        setDisplayForm,
        currentFilterMode,
        availableInternalFilterModes,
        onFilterModeChange,
        menuConfig,
        showHeader,
    } = useAttributeFilterContext();

    const showLabelsSwitch = menuConfig?.showLabelsSwitch ?? true;

    const currentLabel = useMemo(() => {
        return displayForms.find((df) => areObjRefsEqual(df.ref, currentDisplayFormRef));
    }, [displayForms, currentDisplayFormRef]);

    const canSwitchDisplayForms = showLabelsSwitch && displayForms.length > 1 && setDisplayForm;
    const totalAvailableModes = availableInternalFilterModes?.length ?? 0;
    const showFilterHeader =
        showHeader ||
        (totalAvailableModes > 1 &&
            ((onFilterModeChange && (availableInternalFilterModes?.length ?? 0) > 1) ||
                canSwitchDisplayForms));

    return {
        showFilterHeader,
        headerProps: {
            title,
            currentFilterMode,
            availableInternalFilterModes,
            onFilterModeChange,
            attribute,
            label: currentLabel,
            requestHandler: filterDetailRequestHandler,
            labels: canSwitchDisplayForms ? displayForms : [],
            selectedLabelRef: currentDisplayAsDisplayFormRef ?? currentDisplayFormRef,
            onLabelChange: setDisplayForm,
        },
    };
}
