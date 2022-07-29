// (C) 2021-2022 GoodData Corporation
import React, { useCallback, useState } from "react";
import { AttributeFilterDropdown } from "./AttributeFilterDropdown";
import { useAttributeFilterComponentsContext } from "../Context/AttributeFilterComponentsContext";
import { IAttributeFilterRendererProps, OnApplyCallbackType } from "./types";
import { useAttributeFilterContext } from "../Context/AttributeFilterContext";

export const AttributeFilterRenderer: React.FC<IAttributeFilterRendererProps> = (props) => {
    const { onApply } = props;

    const { isDropdownOpen, initStatus, onDropdownOpenStateChanged, onApplyCallback } =
        useAttributeFilterRenderer({ onApply });

    const { AttributeFilterError } = useAttributeFilterComponentsContext();

    return initStatus === "error" ? (
        <AttributeFilterError message={""} /> //TODO get specific error message
    ) : (
        <AttributeFilterDropdown
            isDropdownOpen={isDropdownOpen}
            onDropdownOpenStateChanged={onDropdownOpenStateChanged}
            onApplyButtonClicked={onApplyCallback}
        />
    );
};

export interface IUseAttributeFilterRendererProp {
    onApply: OnApplyCallbackType;
}
export const useAttributeFilterRenderer = (props: IUseAttributeFilterRendererProp) => {
    const { onApply } = props;

    const {
        initialization,
        commitSelection,
        getCurrentFilter,
        isCurrentFilterInverted,
        onReset,
        onFilterPlaceholderApply,
    } = useAttributeFilterContext();

    const [isDropdownOpen, setDropDownOpen] = useState(false);

    const onDropdownOpenStateChanged = useCallback(
        (isOpen: boolean) => {
            setDropDownOpen(isOpen);
            if (!isOpen) {
                onReset();
            }
        },
        [onReset],
    );

    const onApplyCallback = useCallback(() => {
        commitSelection();
        const currentFilter = getCurrentFilter();
        const isInverted = isCurrentFilterInverted();
        onFilterPlaceholderApply(currentFilter);
        onApply?.(currentFilter, isInverted);
    }, [onApply, onFilterPlaceholderApply, commitSelection, getCurrentFilter, isCurrentFilterInverted]);

    return {
        isDropdownOpen,
        initStatus: initialization.status,
        onDropdownOpenStateChanged,
        onApplyCallback,
    };
};
