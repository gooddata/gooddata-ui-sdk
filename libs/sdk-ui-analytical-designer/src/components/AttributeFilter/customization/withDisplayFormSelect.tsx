// (C) 2007-2026 GoodData Corporation

import { useCallback } from "react";

import { type ObjRef } from "@gooddata/sdk-model";
import {
    AttributeDisplayFormSelect,
    AttributeFilterStatusBar,
    type IAttributeFilterStatusBarProps,
    useAttributeFilterContext,
} from "@gooddata/sdk-ui-filters";

import { type OnDisplayFormChangeHandler } from "../types.js";

/**
 * This function customize AttributeFilterStatusBar by adding AttributeDisplayFormSelect
 */
export function withDisplayFormSelect(onSelect: OnDisplayFormChangeHandler) {
    function Component(props: IAttributeFilterStatusBarProps) {
        const { currentDisplayFormRef, committedSelectionElements } = useAttributeFilterContext();
        const onSelectHandler = useCallback(
            (df: ObjRef) => {
                onSelect(df, currentDisplayFormRef, committedSelectionElements);
            },
            [committedSelectionElements, currentDisplayFormRef],
        );
        return (
            <>
                <AttributeFilterStatusBar {...props} />
                <AttributeDisplayFormSelect onSelect={onSelectHandler} />
            </>
        );
    }

    return Component;
}
