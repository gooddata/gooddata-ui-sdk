// (C) 2021-2022 GoodData Corporation

import React from "react";
import { areObjRefsEqual, ObjRef, IAttributeDisplayFormMetadataObject } from "@gooddata/sdk-model";
import { Dropdown, DropdownList, IAlignPoint } from "@gooddata/sdk-ui-kit";

import { DisplayFormButton } from "./DisplayFormButton.js";
import { DisplayDropdownItem } from "./DisplayFormItem.js";

const ITEM_HEIGHT = 23;
const DROPDOWN_WIDTH = 225;
const ALIGN_POINTS: IAlignPoint[] = [
    {
        align: "bl tl",
        offset: { x: 0, y: 1 },
    },
    {
        align: "tl bl",
        offset: { x: 0, y: -1 },
    },
];

export interface IAttributeDisplayFormDropdownProps {
    displayForms: IAttributeDisplayFormMetadataObject[];
    selectedDisplayForm: ObjRef;
    onChange: (displayForm: ObjRef) => void;
}

export const DisplayFormDropdown: React.FC<IAttributeDisplayFormDropdownProps> = ({
    displayForms,
    selectedDisplayForm,
    onChange,
}) => {
    const getButtonLabel = () =>
        displayForms.find((displayForm) => {
            return areObjRefsEqual(displayForm.ref, selectedDisplayForm);
        })?.title || "";

    return (
        <Dropdown
            alignPoints={ALIGN_POINTS}
            renderButton={({ isOpen, toggleDropdown }) => (
                <DisplayFormButton
                    text={getButtonLabel()}
                    isOpened={isOpen}
                    toggleDropdown={toggleDropdown}
                />
            )}
            renderBody={({ closeDropdown }) => (
                <DropdownList
                    className="attribute-display-form-dropdown-body s-attribute-display-form-dropdown-body"
                    items={displayForms}
                    itemHeight={ITEM_HEIGHT}
                    width={DROPDOWN_WIDTH}
                    renderItem={({ item }) => {
                        const selected = areObjRefsEqual(item.ref, selectedDisplayForm);
                        const onClick = (displayForm: ObjRef) => {
                            closeDropdown();
                            if (!selected) {
                                onChange(displayForm);
                            }
                        };
                        return (
                            <DisplayDropdownItem
                                key={item.id}
                                displayForm={item}
                                onClick={onClick}
                                selected={selected}
                            />
                        );
                    }}
                />
            )}
        />
    );
};
