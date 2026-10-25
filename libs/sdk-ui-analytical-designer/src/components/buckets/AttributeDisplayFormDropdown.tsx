// (C) 2021-2026 GoodData Corporation

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { Dropdown, DropdownList, type IAlignPoint } from "@gooddata/sdk-ui-kit";

import { type ICacheItemDisplayForm } from "../../typings/state_objects.js";

import { AttributeDisplayFormButton } from "./AttributeDisplayFormDropdownButton.js";
import { AttributeDisplayFormDropdownItem } from "./AttributeDisplayFormDropdownItem.js";

const ITEM_HEIGHT = 23;
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
    displayForms: ICacheItemDisplayForm[];
    selectedDisplayForm: ObjRef;
    onSelect: (displayForm: ObjRef) => void;
    alignPoints?: IAlignPoint[];
}

export function AttributeDisplayFormDropdown({
    displayForms,
    selectedDisplayForm,
    onSelect,
    alignPoints,
}: IAttributeDisplayFormDropdownProps) {
    const getButtonLabel = () =>
        displayForms.find((displayForm) => areObjRefsEqual(displayForm.ref, selectedDisplayForm)).title;
    return (
        <Dropdown
            alignPoints={alignPoints ?? ALIGN_POINTS}
            closeOnMouseDrag
            closeOnParentScroll
            renderButton={({ isOpen, toggleDropdown }) => (
                <AttributeDisplayFormButton
                    text={getButtonLabel()}
                    isOpened={isOpen}
                    toggleDropdown={toggleDropdown}
                />
            )}
            renderBody={({ closeDropdown }) => (
                <DropdownList
                    className="gd-attribute-display-form-dropdown-body s-attribute-display-form-dropdown-body"
                    items={displayForms}
                    itemHeight={ITEM_HEIGHT}
                    renderItem={({ item }) => {
                        const selected = areObjRefsEqual(item.ref, selectedDisplayForm);
                        const onClick = (displayForm: ObjRef) => {
                            closeDropdown();
                            if (!selected) {
                                onSelect(displayForm);
                            }
                        };
                        return (
                            <AttributeDisplayFormDropdownItem
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
}
