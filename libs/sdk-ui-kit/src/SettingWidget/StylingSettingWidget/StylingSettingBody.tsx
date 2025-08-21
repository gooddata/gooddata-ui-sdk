// (C) 2022-2025 GoodData Corporation

import React, { ReactElement } from "react";

import { useIntl } from "react-intl";

import { ObjRef } from "@gooddata/sdk-model";

import { StylingSettingList } from "./StylingSettingList.js";
import { StylingSettingListItem } from "./StylingSettingListItem.js";
import { DialogListLoading } from "../../Dialog/DialogList/DialogListLoading.js";
import { DialogListHeader, IStylingPickerItem, StylingPickerItemContent } from "../../Dialog/index.js";

interface IStylingSettingBodyProps<T> {
    isMobile: boolean;
    defaultItem: IStylingPickerItem<T>;
    customItems: IStylingPickerItem<T>[];
    itemToColorPreview: (itemContent: T) => string[];
    emptyMessage: () => ReactElement;
    isLoading?: boolean;
    onListActionClick?: () => void;
    initiallySelectedItemRef: ObjRef;
    selectedItemRef: ObjRef;
    onItemClick: (ref: ObjRef) => void;
    onItemEdit?: (item: IStylingPickerItem<T>) => void;
    onItemDelete?: (ref: ObjRef) => void;
    onItemMenuToggle?: (ref: ObjRef) => void;
    isEditingSupported?: boolean;
}

export function StylingSettingBody<T extends StylingPickerItemContent>({
    isMobile,
    defaultItem,
    customItems,
    itemToColorPreview,
    emptyMessage,
    isLoading,
    onListActionClick,
    initiallySelectedItemRef,
    selectedItemRef,
    onItemClick,
    onItemEdit,
    onItemDelete,
    onItemMenuToggle,
    isEditingSupported,
}: IStylingSettingBodyProps<T>) {
    const intl = useIntl();

    return (
        <div className="gd-styling-picker-body">
            {isLoading ? (
                <DialogListLoading className="gd-styling-picker-body-loading s-styling-picker-body-loading" />
            ) : (
                <>
                    <div>
                        <DialogListHeader
                            className="gd-styling-picker-list-header"
                            title={intl.formatMessage({ id: "stylingPicker.title.basic" })}
                        />
                        <StylingSettingListItem
                            item={defaultItem}
                            itemToColorPreview={itemToColorPreview}
                            isSelected={!selectedItemRef}
                            onClick={() => onItemClick(null)}
                        />
                    </div>
                    <div className="gd-styling-picker-list-wrapper">
                        <DialogListHeader
                            title={intl.formatMessage({ id: "stylingPicker.title.custom" })}
                            buttonTitle={
                                isMobile || !isEditingSupported
                                    ? undefined
                                    : intl.formatMessage({ id: "stylingPicker.title.create" })
                            }
                            onButtonClick={onListActionClick}
                            className="gd-styling-picker-list-header s-styling-picker-list-header"
                        />
                        <StylingSettingList
                            items={customItems}
                            itemToColorPreview={itemToColorPreview}
                            emptyMessageElement={emptyMessage()}
                            onItemClick={onItemClick}
                            onItemEdit={isMobile || !isEditingSupported ? undefined : onItemEdit}
                            onItemDelete={isMobile || !isEditingSupported ? undefined : onItemDelete}
                            initiallySelectedItemRef={initiallySelectedItemRef}
                            selectedItemRef={selectedItemRef}
                            onItemMenuToggle={onItemMenuToggle}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
