// (C) 2020 GoodData Corporation
import React from "react";
import Overlay from "@gooddata/goodstrap/lib/core/Overlay";
import { objRefToString, areObjRefsEqual, ObjRefInScope } from "@gooddata/sdk-model";
import { MeasureDropdownItem } from "./MeasureDropdownItem";
import { IMeasureDropdownItem } from "../types";

interface IMeasureDropdownBodyProps {
    items: IMeasureDropdownItem[];
    selectedItemRef: ObjRefInScope;
    onSelect: (ref: ObjRefInScope) => void;
    onClose: () => void;
    onDropDownItemMouseOver?: (ref: ObjRefInScope) => void;
    onDropDownItemMouseOut?: () => void;
}

export const MeasureDropdownBody: React.FC<IMeasureDropdownBodyProps> = ({
    items,
    selectedItemRef,
    onSelect,
    onClose,
    onDropDownItemMouseOver,
    onDropDownItemMouseOut,
}) => {
    return (
        <Overlay
            closeOnOutsideClick={true}
            alignTo=".gd-rf-measure-dropdown-button"
            alignPoints={[{ align: "bl tl" }, { align: "tl bl" }]}
            onClose={onClose}
        >
            <div className="gd-dropdown overlay gd-rf-inner-overlay-dropdown gd-rf-measure-dropdown-body s-rf-measure-dropdown-body">
                {items.map((item) => {
                    const { ref } = item;
                    return (
                        <MeasureDropdownItem
                            key={objRefToString(ref)}
                            item={item}
                            isSelected={areObjRefsEqual(ref, selectedItemRef)}
                            onSelect={onSelect}
                            onDropDownItemMouseOver={onDropDownItemMouseOver}
                            onDropDownItemMouseOut={onDropDownItemMouseOut}
                        />
                    );
                })}
            </div>
        </Overlay>
    );
};
