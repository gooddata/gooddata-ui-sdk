// (C) 2020-2025 GoodData Corporation

import { type ObjRefInScope, areObjRefsEqual, objRefToString } from "@gooddata/sdk-model";
import { Overlay } from "@gooddata/sdk-ui-kit";

import { type IAttributeDropdownItem, type ICustomGranularitySelection } from "../types.js";
import { AllRecordsItem } from "./DropdownItems/AllRecordsItem.js";
import { AttributeItem } from "./DropdownItems/AttributeItem.js";

interface IAttributeDropdownBodyProps {
    items: IAttributeDropdownItem[];
    selectedItemRef?: ObjRefInScope;
    onSelect: (ref?: ObjRefInScope) => void;
    onClose: () => void;
    onDropDownItemMouseOver?: (ref: ObjRefInScope) => void;
    onDropDownItemMouseOut?: () => void;
    customGranularitySelection?: ICustomGranularitySelection;
}

export function AttributeDropdownBody({
    items,
    selectedItemRef,
    onSelect,
    onClose,
    onDropDownItemMouseOver,
    onDropDownItemMouseOut,
    customGranularitySelection,
}: IAttributeDropdownBodyProps) {
    return (
        <Overlay
            closeOnOutsideClick
            alignTo=".gd-rf-attribute-dropdown-button"
            alignPoints={[{ align: "bl tl" }, { align: "tl bl" }]}
            onClose={onClose}
        >
            <div className="gd-dropdown overlay gd-rf-inner-overlay-dropdown gd-rf-attribute-dropdown-body s-rf-attribute-dropdown-body">
                {items.map((item) => {
                    const { type, ref } = item;
                    return (
                        <AttributeItem
                            key={objRefToString(ref)}
                            iconClass={type === "DATE" ? "gd-icon-date" : "gd-icon-attribute"}
                            item={item}
                            isSelected={areObjRefsEqual(ref, selectedItemRef)}
                            onSelect={onSelect}
                            onDropDownItemMouseOver={onDropDownItemMouseOver}
                            onDropDownItemMouseOut={onDropDownItemMouseOut}
                            customGranularitySelection={customGranularitySelection}
                        />
                    );
                })}
                <div className="gd-rf-attribute-dropdown-separator" />
                <AllRecordsItem isSelected={!selectedItemRef} onSelect={onSelect} />
            </div>
        </Overlay>
    );
}
