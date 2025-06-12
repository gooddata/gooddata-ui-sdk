// (C) 2020-2025 GoodData Corporation

import React from "react";
import { ArrowOffsets } from "../Bubble/index.js";
import { IAlignPoint } from "../typings/positioning.js";
import { IButtonAccessibilityConfig } from "../Button/typings.js";

/**
 * @internal
 */
export interface IDialogBaseProps {
    children?: React.ReactNode;
    className?: string;
    displayCloseButton?: boolean;
    accessibilityConfig?: {
        closeButton?: IButtonAccessibilityConfig;
        titleElementId?: string;
        descriptionElementId?: string;
        isModal?: boolean;
        title?: string;
    };
    isModal?: boolean;
    submitOnEnterKey?: boolean;
    shouldCloseOnEscape?: boolean;
    onCancel?: (data?: any) => void;
    onClose?: (data?: any) => void;
    onSubmit?: (data?: any) => void;
    /**
     * These properties will be placed to the container, which wraps overlay background and dialog content elements
     */
    containerClassName?: string;
    shouldCloseOnClick?: (e: Event) => boolean;
    onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onMouseOver?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onMouseUp?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    /**
     * If true, the dialog will autofocus on the first focusable element when it is opened.
     * Default is true.
     */
    autofocusOnOpen?: boolean;
    CloseButton?: React.ComponentType<IDialogCloseButtonProps>;
    initialFocus?: React.RefObject<HTMLElement> | string;
    returnFocusTo?: React.RefObject<HTMLElement> | string;
    returnFocusAfterClose?: boolean;
}

/**
 * @internal
 */
export interface IDialogProps extends IDialogBaseProps {
    /**
     * These properties will be placed to the container, which wraps overlay background and dialog content elements
     */
    containerClassName?: string;
    shouldCloseOnClick?: (e: Event) => boolean;
    onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onMouseOver?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onMouseUp?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onClose?: () => void;
    isModal?: boolean;
    alignPoints?: IAlignPoint[];
    closeOnEscape?: boolean;
    closeOnParentScroll?: boolean;
    closeOnMouseDrag?: boolean;
}

/**
 * @internal
 */
export interface IConfirmDialogBaseProps extends Omit<IDialogBaseProps, "accessibilityConfig"> {
    isSubmitDisabled?: boolean;
    isCancelDisabled?: boolean;
    isPositive?: boolean;
    cancelButtonText?: string;
    submitButtonText?: string;
    submitButtonTooltipText?: string;
    submitButtonTooltipAlignPoints?: IAlignPoint[];
    submitButtonTooltipArrowOffsets?: ArrowOffsets;
    warning?: string | React.ReactElement;
    showProgressIndicator?: boolean;
    headerLeftButtonRenderer?: () => JSX.Element;
    footerLeftRenderer?: () => JSX.Element;
    dialogHeaderClassName?: string;
    titleRightIconRenderer?: () => JSX.Element;
    headline?: string;
    initialFocus?: React.RefObject<HTMLElement> | string;
    returnFocusTo?: React.RefObject<HTMLElement> | string;
    accessibilityConfig?: {
        closeButton?: IButtonAccessibilityConfig;
        titleElementId?: string;
        descriptionElementId?: string;
    };
}

/**
 * @internal
 */
export interface IExportDialogProps extends IExportDialogBaseProps {
    containerClassName?: string;
}

/**
 * @internal
 */
export interface IExportDialogBaseProps
    extends Pick<
        IConfirmDialogBaseProps,
        | "className"
        | "displayCloseButton"
        | "isPositive"
        | "isSubmitDisabled"
        | "headline"
        | "cancelButtonText"
        | "submitButtonText"
        | "onCancel"
    > {
    filterContextText?: string;
    filterContextTitle?: string | null;
    filterContextVisible?: boolean;
    includeFilterContext?: boolean;
    mergeHeaders?: boolean;
    mergeHeadersDisabled?: boolean;
    mergeHeadersText?: string;
    mergeHeadersTitle?: string | null;
    onSubmit?: (data: IExportDialogData) => void;
}

/**
 * @internal
 */
export type IDialogCloseButtonProps = Pick<IDialogBaseProps, "onClose" | "accessibilityConfig"> & {
    className?: string;
};

/**
 * @internal
 */
export type IExportDialogData = Pick<IExportDialogBaseProps, "includeFilterContext" | "mergeHeaders">;
