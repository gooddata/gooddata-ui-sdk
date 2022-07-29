// (C) 2022 GoodData Corporation

import React, { useCallback, useEffect, useMemo, useState } from "react";
import cx from "classnames";
import { areObjRefsEqual, ObjRef } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { ContentDivider, StylingPickerItem } from "../Dialog";
import { useMediaQuery } from "../responsive";
import { StylingPickerHeader } from "./StylingPickerHeader";
import { StylingPickerFooter } from "./StylingPickerFooter";
import { StylingPickerBody } from "./StylingPickerBody";

/**
 * @internal
 */
export interface IStylingPickerProps {
    title: string;
    defaultItem: StylingPickerItem;
    customItems: StylingPickerItem[];
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
    locale?: string;
}

const StylingPickerCore: React.FC<IStylingPickerProps> = (props) => {
    const {
        title,
        defaultItem,
        customItems,
        emptyMessage,
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
    const [currentItemRef, setCurrentItemRef] = useState<ObjRef>(selectedItemRef || null);
    const isMobileDevice = useMediaQuery("mobileDevice");

    useEffect(() => {
        setCurrentItemRef(selectedItemRef);
    }, [selectedItemRef]);

    const onItemClick = useCallback((ref: ObjRef) => {
        setCurrentItemRef(ref);
    }, []);

    const showFooterButtons = useMemo(
        () => customItems.length > 0 && !!(selectedItemRef || currentItemRef),
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
            <StylingPickerHeader title={title} titleTooltip={titleTooltip} />
            <StylingPickerBody
                isMobile={isMobileDevice}
                defaultItem={defaultItem}
                customItems={customItems}
                emptyMessage={emptyMessage}
                isLoading={isLoading}
                onListActionClick={onListActionClick}
                selectedItemRef={currentItemRef}
                onItemClick={onItemClick}
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
            />
        </div>
    );
};

/**
 * @internal
 */
export class StylingPicker extends React.PureComponent<IStylingPickerProps> {
    public render() {
        return (
            <IntlWrapper locale={this.props.locale}>
                <StylingPickerCore {...this.props} />
            </IntlWrapper>
        );
    }
}
