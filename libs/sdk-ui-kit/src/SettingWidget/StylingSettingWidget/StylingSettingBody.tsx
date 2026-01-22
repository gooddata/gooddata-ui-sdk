// (C) 2022-2025 GoodData Corporation

import { type ReactElement } from "react";

import { useIntl } from "react-intl";

import { type ObjRef } from "@gooddata/sdk-model";

import { StylingSettingList } from "./StylingSettingList.js";
import { StylingSettingListItem } from "./StylingSettingListItem.js";
import { DialogListHeader } from "../../Dialog/DialogList/DialogListHeader.js";
import { DialogListLoading } from "../../Dialog/DialogList/DialogListLoading.js";
import {
    type IStylingPickerItem,
    type StylingPickerItemContent,
} from "../../Dialog/StylingEditorDialog/StylingEditorDialog.js";

interface IStylingSettingBodyProps<T extends StylingPickerItemContent> {
    isMobile: boolean;
    defaultItem: IStylingPickerItem<T>;
    customItems: IStylingPickerItem<T>[];
    itemToColorPreview: (itemContent: T) => string[];
    emptyMessage: () => ReactElement;
    isLoading?: boolean;
    onListActionClick?: () => void;
    initiallySelectedItemRef: ObjRef | null;
    selectedItemRef: ObjRef | null;
    onItemClick: (ref: ObjRef | null) => void;
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
                            initiallySelectedItemRef={initiallySelectedItemRef ?? undefined}
                            selectedItemRef={selectedItemRef}
                            onItemMenuToggle={onItemMenuToggle}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
