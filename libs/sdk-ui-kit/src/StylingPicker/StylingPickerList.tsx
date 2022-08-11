// (C) 2022 GoodData Corporation

import React from "react";
import { StylingPickerListItem } from "./StylingPickerListItem";
import { areObjRefsEqual, ObjRef } from "@gooddata/sdk-model";
import { DialogListEmpty } from "../Dialog/DialogList/DialogListEmpty";
import { StylingPickerItem } from "../Dialog";

interface IStylingPickerListProps {
    items: StylingPickerItem[];
    emptyMessageElement: JSX.Element;
    onItemClick: (ref: ObjRef) => void;
    initiallySelectedItemRef?: ObjRef;
    selectedItemRef?: ObjRef;
    onItemEdit?: (item: StylingPickerItem) => void;
    onItemDelete?: (ref: ObjRef) => void;
}

export const StylingPickerList: React.FC<IStylingPickerListProps> = ({
    items,
    emptyMessageElement,
    onItemClick,
    onItemEdit,
    onItemDelete,
    initiallySelectedItemRef,
    selectedItemRef,
}) => {
    if (items.length === 0) {
        return <DialogListEmpty message={emptyMessageElement} className="gd-styling-picker-list-empty" />;
    }

    return (
        <div className="gd-styling-picker-list s-styling-picker-list">
            {items.map((item) => (
                <StylingPickerListItem
                    key={item.id}
                    item={item}
                    isSelected={areObjRefsEqual(item.ref, selectedItemRef)}
                    isDeletable={!areObjRefsEqual(item.ref, initiallySelectedItemRef)}
                    onClick={onItemClick}
                    onDelete={onItemDelete}
                    onEdit={onItemEdit}
                />
            ))}
        </div>
    );
};
