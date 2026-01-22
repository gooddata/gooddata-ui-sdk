// (C) 2022-2025 GoodData Corporation

import { type ReactElement } from "react";

import { type ObjRef, areObjRefsEqual, objRefToString } from "@gooddata/sdk-model";

import { StylingSettingListItem } from "./StylingSettingListItem.js";
import { DialogListEmpty } from "../../Dialog/DialogList/DialogListEmpty.js";
import {
    type IStylingPickerItem,
    type StylingPickerItemContent,
} from "../../Dialog/StylingEditorDialog/StylingEditorDialog.js";

interface IStylingSettingListProps<T extends StylingPickerItemContent> {
    items: IStylingPickerItem<T>[];
    itemToColorPreview: (itemContent: T) => string[];
    emptyMessageElement: ReactElement;
    onItemClick: (ref: ObjRef) => void;
    initiallySelectedItemRef?: ObjRef;
    selectedItemRef?: ObjRef | null;
    onItemEdit?: (item: IStylingPickerItem<T>) => void;
    onItemDelete?: (ref: ObjRef) => void;
    onItemMenuToggle?: (ref: ObjRef) => void;
}

export function StylingSettingList<T extends StylingPickerItemContent>({
    items,
    itemToColorPreview,
    emptyMessageElement,
    onItemClick,
    onItemEdit,
    onItemDelete,
    initiallySelectedItemRef,
    selectedItemRef,
    onItemMenuToggle,
}: IStylingSettingListProps<T>): ReactElement {
    if (items.length === 0) {
        return <DialogListEmpty message={emptyMessageElement} className="gd-styling-picker-list-empty" />;
    }

    return (
        <div className="gd-styling-picker-list s-styling-picker-list">
            {items.map((item) => (
                <StylingSettingListItem<T>
                    key={item.ref ? objRefToString(item.ref) : "default"}
                    item={item}
                    itemToColorPreview={itemToColorPreview}
                    isSelected={areObjRefsEqual(item.ref, selectedItemRef)}
                    isDeletable={
                        !initiallySelectedItemRef || !areObjRefsEqual(item.ref, initiallySelectedItemRef)
                    }
                    onClick={onItemClick}
                    onDelete={onItemDelete}
                    onEdit={onItemEdit}
                    onMenuToggle={onItemMenuToggle}
                />
            ))}
        </div>
    );
}
