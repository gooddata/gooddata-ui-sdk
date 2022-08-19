// (C) 2022 GoodData Corporation

import React, { useCallback, useEffect, useMemo, useState } from "react";
import cx from "classnames";
import { areObjRefsEqual, ObjRef } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { ContentDivider, IStylingPickerItem, StylingPickerItemContent } from "../Dialog";
import { useMediaQuery } from "../responsive";
import { StylingPickerHeader } from "./StylingPickerHeader";
import { StylingPickerFooter } from "./StylingPickerFooter";
import { StylingPickerBody } from "./StylingPickerBody";
import noop from "lodash/noop";

/**
 * @internal
 */
export interface IStylingPickerProps<T> {
    title: string;
    defaultItem: IStylingPickerItem<T>;
    customItems: IStylingPickerItem<T>[];
    itemToColorPreview: (itemContent: T) => string[];
    emptyMessage: () => JSX.Element;
    selectedItemRef?: ObjRef;
    isLoading?: boolean;
    titleTooltip?: string;
    footerHelpLink?: string;
    footerHelpTitle?: string;
    footerMobileMessage?: string;
    className?: string;
    onApply?: (ref: ObjRef) => void;
    onListActionClick?: () => void;
    onItemEdit?: (modifiedItem: IStylingPickerItem<T>) => void;
    onItemDelete?: (ref: ObjRef) => void;
    locale?: string;
    onHelpClick?: () => void;
    onItemMenuToggle?: (ref: ObjRef) => void;
    onItemSelect?: (ref: ObjRef) => void;
}

const StylingPickerCore = <T extends StylingPickerItemContent>(
    props: IStylingPickerProps<T>,
): JSX.Element => {
    const {
        title,
        defaultItem,
        customItems,
        itemToColorPreview,
        emptyMessage,
        selectedItemRef,
        isLoading,
        titleTooltip,
        footerHelpLink,
        footerHelpTitle,
        footerMobileMessage,
        onApply,
        onListActionClick,
        onItemEdit,
        onItemDelete,
        className,
        onHelpClick,
        onItemSelect = noop,
        onItemMenuToggle,
    } = props;
    const isMobileDevice = useMediaQuery("mobileDevice");

    const initiallySelectedItemRef = selectedItemRef || null;
    const [currentItemRef, setCurrentItemRef] = useState<ObjRef>(initiallySelectedItemRef);

    useEffect(() => {
        setCurrentItemRef(selectedItemRef);
    }, [selectedItemRef]);

    useEffect(() => {
        // currentItemRef == null represents basic default theme, skip this check
        if (currentItemRef && !customItems.find((ci) => areObjRefsEqual(ci.ref, currentItemRef))) {
            setCurrentItemRef(initiallySelectedItemRef);
        }
    }, [currentItemRef, customItems, customItems.length, initiallySelectedItemRef]);

    const onItemClick = useCallback(
        (ref: ObjRef) => {
            onItemSelect(ref);
            setCurrentItemRef(ref);
        },
        [onItemSelect],
    );

    const showFooterButtons = useMemo(() => customItems.length > 0, [customItems]);

    const isApplyButtonDisabled = useMemo(
        () => areObjRefsEqual(currentItemRef, selectedItemRef),
        [currentItemRef, selectedItemRef],
    );

    const handleCancel = useCallback(() => {
        setCurrentItemRef(selectedItemRef);
    }, [selectedItemRef]);

    const handleApply = useCallback(() => {
        onApply?.(currentItemRef);
    }, [onApply, currentItemRef]);

    return (
        <div className={cx("gd-styling-picker s-styling-picker", className)}>
            <StylingPickerHeader title={title} titleTooltip={titleTooltip} />
            <StylingPickerBody
                isMobile={isMobileDevice}
                defaultItem={defaultItem}
                customItems={customItems}
                itemToColorPreview={itemToColorPreview}
                emptyMessage={emptyMessage}
                isLoading={isLoading}
                onListActionClick={onListActionClick}
                initiallySelectedItemRef={initiallySelectedItemRef}
                selectedItemRef={currentItemRef}
                onItemClick={onItemClick}
                onItemEdit={onItemEdit}
                onItemDelete={onItemDelete}
                onItemMenuToggle={onItemMenuToggle}
            />
            <ContentDivider />
            <StylingPickerFooter
                showButtons={showFooterButtons}
                disableButtons={isApplyButtonDisabled}
                isMobile={isMobileDevice}
                footerHelpLink={footerHelpLink}
                footerHelpTitle={footerHelpTitle}
                footerMobileMessage={footerMobileMessage}
                onApply={handleApply}
                onCancel={handleCancel}
                onHelpClick={onHelpClick}
            />
        </div>
    );
};

/**
 * @internal
 */
export const StylingPicker = <T extends StylingPickerItemContent>(
    props: IStylingPickerProps<T>,
): JSX.Element => {
    return (
        <IntlWrapper locale={props.locale}>
            <StylingPickerCore {...props} />
        </IntlWrapper>
    );
};
