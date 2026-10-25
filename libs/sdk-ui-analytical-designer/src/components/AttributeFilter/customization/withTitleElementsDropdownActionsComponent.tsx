// (C) 2007-2026 GoodData Corporation

import { useCallback } from "react";

import {
    AttributeFilterDropdownActions,
    type IAttributeFilterDropdownActionsProps,
    useAttributeFilterContext,
} from "@gooddata/sdk-ui-filters";

import { type IItemTitlesMap } from "../types.js";
import { elementsToItemTitlesMap } from "../utils.js";

/**
 * This function return custom AttributeFilterDropdownActions component, that catch AttributeFilter onApplyButtonClick use useAttributeFilterContext
 * to resolve selection elements titles and propagate it via onApplyTitles callback
 */
export function withTitleElementsDropdownActionsComponent(
    onApplyTitles: (itemTitles: IItemTitlesMap, totalElementsCount: number) => void,
) {
    function Component(props: IAttributeFilterDropdownActionsProps) {
        const { onApplyButtonClick } = props;

        const { workingSelectionElements, totalElementsCountWithCurrentSettings } =
            useAttributeFilterContext();

        const onCustomApply = useCallback(() => {
            const titlesMap = elementsToItemTitlesMap(workingSelectionElements);
            onApplyTitles(titlesMap, totalElementsCountWithCurrentSettings);
            onApplyButtonClick();
        }, [onApplyButtonClick, totalElementsCountWithCurrentSettings, workingSelectionElements]);

        return <AttributeFilterDropdownActions {...props} onApplyButtonClick={onCustomApply} />;
    }

    return Component;
}
