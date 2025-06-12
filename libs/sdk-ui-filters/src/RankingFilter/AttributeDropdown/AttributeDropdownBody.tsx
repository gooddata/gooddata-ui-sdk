// (C) 2020 GoodData Corporation
import React from "react";
import { ObjRefInScope, areObjRefsEqual, objRefToString } from "@gooddata/sdk-model";
import { Overlay } from "@gooddata/sdk-ui-kit";
import { AttributeItem } from "./DropdownItems/AttributeItem.js";
import { IAttributeDropdownItem, ICustomGranularitySelection } from "../types.js";
import { AllRecordsItem } from "./DropdownItems/AllRecordsItem.js";

interface IAttributeDropdownBodyProps {
    items: IAttributeDropdownItem[];
    selectedItemRef: ObjRefInScope;
    onSelect: (ref?: ObjRefInScope) => void;
    onClose: () => void;
    onDropDownItemMouseOver?: (ref: ObjRefInScope) => void;
    onDropDownItemMouseOut?: () => void;
    customGranularitySelection?: ICustomGranularitySelection;
}

export const AttributeDropdownBody: React.FC<IAttributeDropdownBodyProps> = ({
    items,
    selectedItemRef,
    onSelect,
    onClose,
    onDropDownItemMouseOver,
    onDropDownItemMouseOut,
    customGranularitySelection,
}) => {
    return (
        <Overlay
            closeOnOutsideClick={true}
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
};
