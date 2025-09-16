// (C) 2021-2025 GoodData Corporation

import { useMemo } from "react";

import { IAttributeDisplayFormMetadataObject, ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { Dropdown, DropdownList, IAlignPoint } from "@gooddata/sdk-ui-kit";

import { AttributeDisplayFormDropdownButton } from "./AttributeDisplayFormDropdownButton.js";
import { AttributeDisplayFormSelectItem } from "./AttributeDisplayFormSelectItem.js";

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

/**
 * @internal
 */
export interface IAttributeDisplayFormDropdownProps {
    displayForms: IAttributeDisplayFormMetadataObject[];
    selectedDisplayForm: ObjRef;
    onSelect: (displayForm: ObjRef) => void;
    alignPoints?: IAlignPoint[];
}

/**
 * @internal
 */
export function AttributeDisplayFormDropdown(props: IAttributeDisplayFormDropdownProps) {
    const { displayForms, selectedDisplayForm, onSelect, alignPoints } = props;

    const buttonTitle = useMemo(() => {
        return displayForms.find((displayForm) => areObjRefsEqual(displayForm.ref, selectedDisplayForm))
            ?.title;
    }, [displayForms, selectedDisplayForm]);

    return (
        <Dropdown
            className="gd-attribute-display-form-dropdown"
            alignPoints={alignPoints ?? ALIGN_POINTS}
            closeOnMouseDrag={true}
            closeOnParentScroll={true}
            enableEventPropagation={true}
            renderButton={({ isOpen, toggleDropdown }) => (
                <AttributeDisplayFormDropdownButton
                    text={buttonTitle}
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
                            <AttributeDisplayFormSelectItem
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
