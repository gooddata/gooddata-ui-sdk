// (C) 2022 GoodData Corporation

import React from "react";
import { useIntl } from "react-intl";
import { ObjRef } from "@gooddata/sdk-model";
import { DialogListHeader, IStylingPickerItem, StylingPickerItemContent } from "../../Dialog/index.js";
import { DialogListLoading } from "../../Dialog/DialogList/DialogListLoading.js";
import { StylingSettingList } from "./StylingSettingList.js";
import { StylingSettingListItem } from "./StylingSettingListItem.js";

interface IStylingSettingBodyProps<T> {
    isMobile: boolean;
    defaultItem: IStylingPickerItem<T>;
    customItems: IStylingPickerItem<T>[];
    itemToColorPreview: (itemContent: T) => string[];
    emptyMessage: () => JSX.Element;
    isLoading?: boolean;
    onListActionClick?: () => void;
    initiallySelectedItemRef: ObjRef;
    selectedItemRef: ObjRef;
    onItemClick: (ref: ObjRef) => void;
    onItemEdit?: (item: IStylingPickerItem<T>) => void;
    onItemDelete?: (ref: ObjRef) => void;
    onItemMenuToggle?: (ref: ObjRef) => void;
}

export const StylingSettingBody = <T extends StylingPickerItemContent>({
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
}: IStylingSettingBodyProps<T>) => {
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
                                isMobile
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
                            onItemEdit={isMobile ? undefined : onItemEdit}
                            onItemDelete={isMobile ? undefined : onItemDelete}
                            initiallySelectedItemRef={initiallySelectedItemRef}
                            selectedItemRef={selectedItemRef}
                            onItemMenuToggle={onItemMenuToggle}
                        />
                    </div>
                </>
            )}
        </div>
    );
};
