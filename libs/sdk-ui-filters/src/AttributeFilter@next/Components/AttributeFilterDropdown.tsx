// (C) 2022 GoodData Corporation
import React from "react";
import { Dropdown } from "@gooddata/sdk-ui-kit";
import { useAttributeFilterComponentsContext } from "../Context/AttributeFilterComponentsContext";
import { IAttributeFilterDropdownProps } from "./types";
import { useAttributeFilterButton } from "./AttributeFilterButton";

const ALIGN_POINTS = [
    { align: "bl tl" },
    { align: "tr tl" },
    { align: "br tr", offset: { x: -11 } },
    { align: "tr tl", offset: { x: 0, y: -100 } },
    { align: "tr tl", offset: { x: 0, y: -50 } },
];

export const AttributeFilterDropdown: React.FC<IAttributeFilterDropdownProps> = (props) => {
    const { isDropdownOpen, onDropdownOpenStateChanged, onApplyButtonClicked } = props;

    const { AttributeFilterButton, AttributeFilterDropdownBody } = useAttributeFilterComponentsContext();
    const attributeFilterProps = useAttributeFilterButton({ isOpen: isDropdownOpen });
    return (
        <Dropdown
            closeOnParentScroll={true}
            closeOnMouseDrag={true}
            closeOnOutsideClick={true}
            enableEventPropagation={true}
            alignPoints={ALIGN_POINTS}
            renderButton={({ toggleDropdown }) => (
                <AttributeFilterButton {...attributeFilterProps} onClick={toggleDropdown} />
            )}
            onOpenStateChanged={onDropdownOpenStateChanged}
            renderBody={({ closeDropdown }) => (
                <AttributeFilterDropdownBody
                    onApplyButtonClicked={onApplyButtonClicked}
                    closeDropdown={closeDropdown}
                />
            )}
        />
    );
};
