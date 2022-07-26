// (C) 2022 GoodData Corporation

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import cx from "classnames";
import { areObjRefsEqual, ObjRef } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { Bubble, BubbleHoverTrigger } from "../Bubble";
import { Typography } from "../Typography";
import { ContentDivider, DialogListHeader } from "../Dialog";
import { Button } from "../Button";
import { StylingPickerList } from "./StylingPickerList";
import { StylingPickerItem, StylingPickerListItem } from "./StylingPickerListItem";
import { DialogListLoading } from "../Dialog/DialogList/DialogListLoading";
import { useMediaQuery } from "../responsive/useMediaQuery";
import { Message } from "../Messages";
import { IAlignPoint } from "../typings/positioning";

const TOOLTIP_ALIGN_POINTS: IAlignPoint[] = [{ align: "bl tl", offset: { x: 10, y: 4 } }];

/**
 * @internal
 */
export interface IStylingPickerProps {
    title: string;
    basicItem: StylingPickerItem;
    customItems: StylingPickerItem[];
    emptyMessageElement: JSX.Element;
    selectedItemRef?: ObjRef;
    isLoading?: boolean;
    titleTooltip?: string;
    footerHelpLink?: string;
    footerHelpTitle?: string;
    footerMobileMessage?: string;
    className?: string;
    onApply?: (ref?: ObjRef) => void;
    onListActionClick?: () => void;
    locale?: string;
}

const StylingPickerCore: React.FC<IStylingPickerProps & WrappedComponentProps> = (props) => {
    const {
        intl,
        title,
        basicItem,
        customItems,
        emptyMessageElement,
        selectedItemRef,
        isLoading,
        titleTooltip,
        footerHelpLink,
        footerHelpTitle,
        footerMobileMessage,
        onApply,
        onListActionClick,
        className,
    } = props;
    const [currentItemRef, setCurrentItemRef] = useState(selectedItemRef);
    const isMobileDevice = useMediaQuery("mobileDevice");

    useEffect(() => {
        setCurrentItemRef(selectedItemRef);
    }, [selectedItemRef]);

    const onItemClick = useCallback((ref: ObjRef) => {
        setCurrentItemRef(ref);
    }, []);

    const showFooterButtons = useMemo(
        () => customItems.length > 0 && (selectedItemRef || currentItemRef),
        [customItems, selectedItemRef, currentItemRef],
    );

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
            <div className="gd-styling-picker-title s-styling-picker-title">
                <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                    <div className="gd-styling-picker-title-content">
                        <Typography tagName="h3">{title}</Typography>
                        {titleTooltip && (
                            <span className="gd-icon-circle-question gd-styling-picker-title-icon" />
                        )}
                    </div>
                    {titleTooltip && (
                        <Bubble className="bubble-primary" alignPoints={TOOLTIP_ALIGN_POINTS}>
                            {titleTooltip}
                        </Bubble>
                    )}
                </BubbleHoverTrigger>
            </div>
            <div className="gd-styling-picker-content">
                {isLoading ? (
                    <DialogListLoading className="gd-styling-picker-list-loading s-styling-picker-list-loading" />
                ) : (
                    <>
                        <div>
                            <DialogListHeader
                                title={intl.formatMessage({ id: "stylingPicker.title.basic" })}
                            />
                            <StylingPickerListItem
                                item={basicItem}
                                isSelected={!currentItemRef}
                                onClick={() => setCurrentItemRef(undefined)}
                            />
                        </div>
                        <div className="gd-styling-picker-list-wrapper">
                            <DialogListHeader
                                title={intl.formatMessage({ id: "stylingPicker.title.custom" })}
                                buttonTitle={
                                    isMobileDevice
                                        ? undefined
                                        : intl.formatMessage({ id: "stylingPicker.title.create" })
                                }
                                onButtonClick={onListActionClick}
                                className="s-styling-picker-list-header"
                            />
                            <StylingPickerList
                                items={customItems}
                                emptyMessageElement={emptyMessageElement}
                                onItemClick={onItemClick}
                                selectedItemRef={currentItemRef}
                            />
                        </div>
                    </>
                )}
            </div>
            <ContentDivider />
            <div className="gd-styling-picker-footer">
                {isMobileDevice && footerMobileMessage && (
                    <div className="gd-styling-picker-footer-message">
                        <Message type="progress">{footerMobileMessage}</Message>
                    </div>
                )}
                {footerHelpLink && footerHelpTitle && (
                    <div className="gd-styling-picker-footer-help s-styling-picker-footer-help">
                        <span className="gd-icon-circle-question gd-styling-picker-footer-icon" />
                        <span className="gd-styling-picker-footer-text">
                            <a
                                className="gd-button-link-dimmed"
                                rel="noopener noreferrer"
                                target="_blank"
                                href={footerHelpLink}
                            >
                                {footerHelpTitle}
                            </a>
                        </span>
                    </div>
                )}
                {showFooterButtons && (
                    <div className="gd-styling-picker-footer-buttons s-styling-picker-footer-buttons">
                        <Button
                            className="gd-button-secondary"
                            value={intl.formatMessage({ id: "cancel" })}
                            disabled={isApplyButtonDisabled}
                            onClick={handleCancel}
                        />
                        <Button
                            className="gd-button-action"
                            value={intl.formatMessage({ id: "apply" })}
                            disabled={isApplyButtonDisabled}
                            onClick={handleApply}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

const StylingPickerWithIntl = injectIntl(StylingPickerCore);

/**
 * @internal
 */
export class StylingPicker extends React.PureComponent<IStylingPickerProps> {
    public render() {
        return (
            <IntlWrapper locale={this.props.locale}>
                <StylingPickerWithIntl {...this.props} />
            </IntlWrapper>
        );
    }
}
