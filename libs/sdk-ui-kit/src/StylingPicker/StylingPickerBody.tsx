// (C) 2022 GoodData Corporation

import React from "react";
import { useIntl } from "react-intl";
import { ObjRef } from "@gooddata/sdk-model";
import { DialogListHeader, StylingPickerItem } from "../Dialog";
import { DialogListLoading } from "../Dialog/DialogList/DialogListLoading";
import { StylingPickerList } from "./StylingPickerList";
import { StylingPickerListItem } from "./StylingPickerListItem";

interface IStylingPickerBodyProps {
    isMobile: boolean;
    defaultItem: StylingPickerItem;
    customItems: StylingPickerItem[];
    emptyMessage: () => JSX.Element;
    isLoading?: boolean;
    onListActionClick?: () => void;
    selectedItemRef: ObjRef;
    onItemClick: (ref: ObjRef) => void;
}

export const StylingPickerBody: React.FC<IStylingPickerBodyProps> = ({
    isMobile,
    defaultItem,
    customItems,
    emptyMessage,
    isLoading,
    onListActionClick,
    selectedItemRef,
    onItemClick,
}) => {
    const intl = useIntl();

    return (
        <div className="gd-styling-picker-body">
            {isLoading ? (
                <DialogListLoading className="gd-styling-picker-body-loading s-styling-picker-body-loading" />
            ) : (
                <>
                    <div>
                        <DialogListHeader title={intl.formatMessage({ id: "stylingPicker.title.basic" })} />
                        <StylingPickerListItem
                            item={defaultItem}
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
                            className="s-styling-picker-list-header"
                        />
                        <StylingPickerList
                            items={customItems}
                            emptyMessageElement={emptyMessage()}
                            onItemClick={onItemClick}
                            selectedItemRef={selectedItemRef}
                        />
                    </div>
                </>
            )}
        </div>
    );
};
