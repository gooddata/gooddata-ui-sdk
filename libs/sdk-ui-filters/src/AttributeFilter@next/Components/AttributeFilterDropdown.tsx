// (C) 2022 GoodData Corporation
import React from "react";
import { Dropdown } from "@gooddata/sdk-ui-kit";
import { useAttributeFilterComponentsContext } from "../Context/AttributeFilterComponentsContext";
import { IAttributeFilterDropdownProps } from "./types";

const ALIGN_POINTS = [
    { align: "bl tl" },
    { align: "tr tl" },
    { align: "br tr", offset: { x: -11 } },
    { align: "tr tl", offset: { x: 0, y: -100 } },
    { align: "tr tl", offset: { x: 0, y: -50 } },
];

export const AttributeFilterDropdown: React.FC<IAttributeFilterDropdownProps> = (props) => {
    const {
        isFiltering,
        isDropdownOpen,
        isOriginalTotalCountLoading,
        title,
        subtitle,
        selectedFilterOptions,
        onDropdownOpenStateChanged,
        hasNoMatchingData,
        hasNoData,
        isApplyDisabled,
        onApplyButtonClicked,
        dropDownProps,
    } = props;

    const { AttributeFilterButton, AttributeFilterDropdownBody } = useAttributeFilterComponentsContext();

    return (
        <Dropdown
            closeOnParentScroll={true}
            closeOnMouseDrag={true}
            closeOnOutsideClick={true}
            enableEventPropagation={true}
            alignPoints={ALIGN_POINTS}
            renderButton={({ toggleDropdown }) => (
                <AttributeFilterButton
                    isFiltering={isFiltering}
                    isOpen={isDropdownOpen}
                    title={title}
                    subtitleText={subtitle}
                    subtitleItemCount={selectedFilterOptions.length}
                    isLoaded={!isOriginalTotalCountLoading}
                    onClick={toggleDropdown}
                />
            )}
            onOpenStateChanged={onDropdownOpenStateChanged}
            renderBody={({ closeDropdown }) => (
                <AttributeFilterDropdownBody
                    isApplyDisabled={isApplyDisabled}
                    hasNoMatchingData={hasNoMatchingData}
                    onApplyButtonClicked={onApplyButtonClicked}
                    closeDropdown={closeDropdown}
                    hasNoData={hasNoData}
                    bodyProps={dropDownProps}
                />
            )}
        />
    );
};
