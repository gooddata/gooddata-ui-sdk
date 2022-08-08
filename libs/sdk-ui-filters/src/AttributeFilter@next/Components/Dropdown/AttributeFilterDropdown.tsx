// (C) 2022 GoodData Corporation
import React from "react";
import { Dropdown } from "@gooddata/sdk-ui-kit";
import { useAttributeFilterComponentsContext } from "../../Context/AttributeFilterComponentsContext";
import { useAttributeFilterContext } from "../../Context/AttributeFilterContext";

const ALIGN_POINTS = [
    { align: "bl tl" },
    { align: "tr tl" },
    { align: "br tr", offset: { x: -11 } },
    { align: "tr tl", offset: { x: 0, y: -100 } },
    { align: "tr tl", offset: { x: 0, y: -50 } },
];

/**
 * @internal
 */
export const AttributeFilterDropdown: React.VFC = () => {
    const { AttributeFilterDropdownButton, AttributeFilterDropdownBody } =
        useAttributeFilterComponentsContext();

    const {
        title,
        subtitle,
        isInitializing,
        initError,
        isFiltering,
        committedSelectionElements,
        onReset,
        onApply,
    } = useAttributeFilterContext();

    return (
        <Dropdown
            className="gd-attribute-filter-dropdown__next"
            closeOnParentScroll={true}
            closeOnMouseDrag={true}
            closeOnOutsideClick={true}
            enableEventPropagation={true}
            alignPoints={ALIGN_POINTS}
            renderButton={({ toggleDropdown, isOpen }) => (
                <AttributeFilterDropdownButton
                    title={title}
                    subtitle={subtitle}
                    isFiltering={isFiltering}
                    isLoaded={!isInitializing && !initError}
                    isLoading={isInitializing}
                    isOpen={isOpen}
                    selectedItemsCount={committedSelectionElements.length}
                    onClick={toggleDropdown}
                />
            )}
            onOpenStateChanged={(isOpen) => {
                if (!isOpen) {
                    onReset();
                }
            }}
            renderBody={({ closeDropdown }) => (
                <AttributeFilterDropdownBody
                    onApplyButtonClick={() => {
                        onApply();
                        closeDropdown();
                    }}
                    onCloseButtonClick={closeDropdown}
                />
            )}
        />
    );
};
