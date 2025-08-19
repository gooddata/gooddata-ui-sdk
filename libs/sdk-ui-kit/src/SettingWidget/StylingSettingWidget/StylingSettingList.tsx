// (C) 2022-2025 GoodData Corporation

import React, { ReactElement } from "react";

import { ObjRef, areObjRefsEqual, objRefToString } from "@gooddata/sdk-model";

import { StylingSettingListItem } from "./StylingSettingListItem.js";
import { DialogListEmpty } from "../../Dialog/DialogList/DialogListEmpty.js";
import { IStylingPickerItem, StylingPickerItemContent } from "../../Dialog/index.js";

interface IStylingSettingListProps<T> {
    items: IStylingPickerItem<T>[];
    itemToColorPreview: (itemContent: T) => string[];
    emptyMessageElement: ReactElement;
    onItemClick: (ref: ObjRef) => void;
    initiallySelectedItemRef?: ObjRef;
    selectedItemRef?: ObjRef;
    onItemEdit?: (item: IStylingPickerItem<T>) => void;
    onItemDelete?: (ref: ObjRef) => void;
    onItemMenuToggle?: (ref: ObjRef) => void;
}

export const StylingSettingList = <T extends StylingPickerItemContent>({
    items,
    itemToColorPreview,
    emptyMessageElement,
    onItemClick,
    onItemEdit,
    onItemDelete,
    initiallySelectedItemRef,
    selectedItemRef,
    onItemMenuToggle,
}: IStylingSettingListProps<T>): ReactElement => {
    if (items.length === 0) {
        return <DialogListEmpty message={emptyMessageElement} className="gd-styling-picker-list-empty" />;
    }

    return (
        <div className="gd-styling-picker-list s-styling-picker-list">
            {items.map((item) => (
                <StylingSettingListItem<T>
                    key={objRefToString(item.ref)}
                    item={item}
                    itemToColorPreview={itemToColorPreview}
                    isSelected={areObjRefsEqual(item.ref, selectedItemRef)}
                    isDeletable={!areObjRefsEqual(item.ref, initiallySelectedItemRef)}
                    onClick={onItemClick}
                    onDelete={onItemDelete}
                    onEdit={onItemEdit}
                    onMenuToggle={onItemMenuToggle}
                />
            ))}
        </div>
    );
};
