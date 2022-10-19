// (C) 2022 GoodData Corporation
import React, { useCallback, useEffect, useMemo, useState } from "react";
import cx from "classnames";
import noop from "lodash/noop";
import { useIntl } from "react-intl";
import { areObjRefsEqual, ObjRef } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { StylingSettingBody } from "./StylingSettingBody";
import { Separator } from "../Separator";
import { SettingWidget } from "../SettingWidget";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { Button } from "../../Button";
import { Message } from "../../Messages";
import { IStylingPickerItem, StylingPickerItemContent } from "../../Dialog";
import { useMediaQuery } from "../../responsive";
import { Title } from "../Title";
import { FooterButtons } from "../FooterButtons";
import { Hyperlink } from "../../Hyperlink";

/**
 * @internal
 */
export interface IStylingSettingWidgetProps<T> {
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
        onApply,
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
                {showFooterButtons ? (
                    <FooterButtons>
                        <Button
                            className="gd-button-secondary"
                            onClick={handleCancel}
                            disabled={isApplyButtonDisabled}
                            value={intl.formatMessage({ id: "cancel" })}
                        />
                        <Button
                            className="gd-button-action"
                            onClick={handleApply}
                            disabled={isApplyButtonDisabled}
                            value={intl.formatMessage({ id: "apply" })}
                        />
                    </FooterButtons>
                ) : null}
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
