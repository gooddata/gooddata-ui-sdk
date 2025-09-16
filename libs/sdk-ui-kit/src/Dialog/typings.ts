// (C) 2020-2025 GoodData Corporation

import { ComponentType, MouseEvent, ReactElement, ReactNode, RefObject } from "react";

import { ArrowOffsets } from "../Bubble/index.js";
import { IButtonAccessibilityConfig } from "../Button/typings.js";
import { IAlignPoint } from "../typings/positioning.js";

/**
 * @internal
 */
export interface IDialogBaseProps {
    children?: ReactNode;
    className?: string;
    displayCloseButton?: boolean;
    accessibilityConfig?: {
        closeButton?: IButtonAccessibilityConfig;
        titleElementId?: string;
        descriptionElementId?: string;
        isModal?: boolean;
        title?: string;
        dialogId?: string;
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
    onClick?: (e: MouseEvent<HTMLDivElement>) => void;
    onMouseOver?: (e: MouseEvent<HTMLDivElement>) => void;
    onMouseUp?: (e: MouseEvent<HTMLDivElement>) => void;
    /**
     * If true, the dialog will autofocus on the first focusable element when it is opened.
     * Default is true.
     */
    autofocusOnOpen?: boolean;
    CloseButton?: ComponentType<IDialogCloseButtonProps>;
    initialFocus?: RefObject<HTMLElement | null> | string;
    returnFocusTo?: RefObject<HTMLElement | null> | string;
    returnFocusAfterClose?: boolean;
    /**
     * customize if you know that dialog content has some custom focusIn logic which modifies focused element, eg. table which shifts its focus from table wrapper to first table cell
     * default is check if active element is exactly focused element.
     */
    focusCheckFn?: (element: HTMLElement) => boolean;
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
    onClick?: (e: MouseEvent<HTMLDivElement>) => void;
    onMouseOver?: (e: MouseEvent<HTMLDivElement>) => void;
    onMouseUp?: (e: MouseEvent<HTMLDivElement>) => void;
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
    hideSubmitButton?: boolean;
    warning?: string | ReactElement;
    showProgressIndicator?: boolean;
    headerLeftButtonRenderer?: () => ReactElement;
    footerLeftRenderer?: () => ReactElement;
    dialogHeaderClassName?: string;
    titleRightIconRenderer?: () => ReactElement;
    headline?: string;
    initialFocus?: RefObject<HTMLElement | null> | string;
    returnFocusTo?: RefObject<HTMLElement | null> | string;
    accessibilityConfig?: {
        closeButton?: IButtonAccessibilityConfig;
        titleElementId?: string;
        descriptionElementId?: string;
        dialogId?: string;
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
