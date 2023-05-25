// (C) 2022-2023 GoodData Corporation
import React, { useCallback, useEffect, useMemo, useState } from "react";
import cx from "classnames";
import noop from "lodash/noop.js";
import { useIntl } from "react-intl";
import { areObjRefsEqual, ObjRef } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { StylingSettingBody } from "./StylingSettingBody.js";
import { Separator } from "../Separator.js";
import { SettingWidget } from "../SettingWidget.js";
import { Header } from "../Header.js";
import { Footer } from "../Footer.js";
import { Button } from "../../Button/index.js";
import { Message } from "../../Messages/index.js";
import { IStylingPickerItem, StylingPickerItemContent } from "../../Dialog/index.js";
import { useMediaQuery } from "../../responsive/index.js";
import { Title } from "../Title.js";
import { FooterButtons } from "../FooterButtons.js";
import { Hyperlink } from "../../Hyperlink/index.js";

/**
 * @internal
 */
export interface IStylingSettingWidgetProps<T extends StylingPickerItemContent> {
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
    shouldDisableCancelButton?: boolean;
    shouldDisableApplyButton?: boolean;
    onApply?: (ref: ObjRef) => void;
    onCancel?: () => void;
    onListActionClick?: () => void;
    onItemEdit?: (modifiedItem: IStylingPickerItem<T>) => void;
    onItemDelete?: (ref: ObjRef) => void;
    locale?: string;
    onHelpClick?: () => void;
    onItemMenuToggle?: (ref: ObjRef) => void;
    onItemSelect?: (ref: ObjRef) => void;
}

const StylingSettingWidgetCore = <T extends StylingPickerItemContent>(
    props: IStylingSettingWidgetProps<T>,
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
        shouldDisableCancelButton,
        shouldDisableApplyButton,
        onApply,
        onCancel,
        onListActionClick,
        onItemEdit,
        onItemDelete,
        className,
        onHelpClick,
        onItemSelect = noop,
        onItemMenuToggle,
    } = props;
    const intl = useIntl();
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

    const isApplyButtonDisabled = useMemo(
        () => areObjRefsEqual(currentItemRef, selectedItemRef),
        [currentItemRef, selectedItemRef],
    );

    const handleCancel = useCallback(() => {
        setCurrentItemRef(selectedItemRef);
        onCancel?.();
    }, [onCancel, selectedItemRef]);

    const handleApply = useCallback(() => {
        onApply?.(currentItemRef);
    }, [onApply, currentItemRef]);

    return (
        <SettingWidget className={cx("s-styling-picker", className)}>
            <Header>
                <Title title={title} tooltip={titleTooltip} />
            </Header>
            <StylingSettingBody
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
            <Separator />
            <Footer>
                {isMobileDevice && footerMobileMessage ? (
                    <Message className="gd-styling-picker-footer-message" type="progress">
                        {footerMobileMessage}
                    </Message>
                ) : null}
                {footerHelpLink && footerHelpTitle ? (
                    <Hyperlink
                        text={footerHelpTitle}
                        href={footerHelpLink}
                        iconClass="gd-icon-circle-question"
                        onClick={onHelpClick}
                    />
                ) : null}
                <FooterButtons>
                    <Button
                        className="gd-button-secondary"
                        onClick={handleCancel}
                        disabled={shouldDisableCancelButton ?? isApplyButtonDisabled}
                        value={intl.formatMessage({ id: "cancel" })}
                    />
                    <Button
                        className="gd-button-action"
                        onClick={handleApply}
                        disabled={shouldDisableApplyButton ?? isApplyButtonDisabled}
                        value={intl.formatMessage({ id: "apply" })}
                    />
                </FooterButtons>
            </Footer>
        </SettingWidget>
    );
};

/**
 * @internal
 */
export const StylingSettingWidget = <T extends StylingPickerItemContent>(
    props: IStylingSettingWidgetProps<T>,
): JSX.Element => {
    return (
        <IntlWrapper locale={props.locale}>
            <StylingSettingWidgetCore {...props} />
        </IntlWrapper>
    );
};
