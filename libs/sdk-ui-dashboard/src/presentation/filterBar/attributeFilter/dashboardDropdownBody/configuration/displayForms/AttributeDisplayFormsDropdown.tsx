// (C) 2022-2023 GoodData Corporation
import {
    areObjRefsEqual,
    IAttributeDisplayFormMetadataObject,
    idRef,
    ObjRef,
    uriRef,
} from "@gooddata/sdk-model";
import { Dropdown, DropdownList, IAlignPoint } from "@gooddata/sdk-ui-kit";
import React from "react";
import { AttributeDisplayFormDropdownButton } from "./AttributeDisplayFormDropdownButton.js";
import { AttributeDisplayFormDropDownItem } from "./AttributeDisplayFormDropDownItem.js";

interface IAttributeFilterDisplayFormDropdownProps {
    displayForms: IAttributeDisplayFormMetadataObject[];
    selectedDisplayForm: ObjRef;
    onChange: (displayForm: ObjRef) => void;
}

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

export const AttributeDisplayFormsDropdown: React.FC<IAttributeFilterDisplayFormDropdownProps> = ({
    displayForms,
    selectedDisplayForm,
    onChange,
}) => {
    // try matching both uri and id in case the type of ref is different from what is in the ref field
    const selectedDisplayFormTitle = displayForms.find(
        (df) =>
            areObjRefsEqual(idRef(df.id, "displayForm"), selectedDisplayForm) ||
            areObjRefsEqual(uriRef(df.uri), selectedDisplayForm),
    )!.title;

    return (
        <Dropdown
            alignPoints={ALIGN_POINTS}
            renderButton={({ isOpen, toggleDropdown }) => {
                return (
                    <AttributeDisplayFormDropdownButton
                        title={selectedDisplayFormTitle}
                        isOpened={isOpen}
                        toggleDropdown={toggleDropdown}
                    />
                );
            }}
            renderBody={({ closeDropdown }) => (
                <DropdownList
                    className="attribute-display-form-dropdown-body s-attribute-display-form-dropdown-body"
                    items={displayForms}
                    itemHeight={ITEM_HEIGHT}
                    width={DROPDOWN_WIDTH}
                    renderItem={({ item }) => {
                        const selected = areObjRefsEqual(selectedDisplayForm, item.ref);

                        const onClick = (displayForm: ObjRef) => {
                            closeDropdown();
                            if (!selected) {
                                onChange(displayForm);
                            }
                        };

                        return (
                            <AttributeDisplayFormDropDownItem
                                displayForm={item}
                                selected={selected}
                                onClick={onClick}
                            />
                        );
                    }}
                />
            )}
        />
    );
};
