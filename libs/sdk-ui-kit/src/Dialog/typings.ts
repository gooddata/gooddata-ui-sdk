// (C) 2020-2022 GoodData Corporation

import React from "react";
import { ArrowOffsets } from "../Bubble/index.js";
import { IAlignPoint } from "../typings/positioning.js";

/**
 * @internal
 */
export interface IDialogBaseProps {
    children?: React.ReactNode;
    className?: string;
    displayCloseButton?: boolean;
    submitOnEnterKey?: boolean;
    onCancel?: (data?: any) => void;
    onClose?: (data?: any) => void;
    onSubmit?: (data?: any) => void;
    /**
     * These properties will be placed to the container, which wraps overlay background and dialog content elements
     */
    containerClassName?: string;
    onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onMouseOver?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onMouseUp?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

/**
 * @internal
 */
export interface IConfirmDialogBaseProps extends IDialogBaseProps {
    isSubmitDisabled?: boolean;
    isPositive?: boolean;
    headline?: string;
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
}

/**
 * @internal
 */
export interface IExportDialogBaseProps extends IDialogBaseProps {
    isSubmitDisabled?: boolean;
    isPositive?: boolean;
    headline?: string;
    cancelButtonText?: string;
    submitButtonText?: string;
    filterContextText?: string;
    filterContextTitle?: string;
    filterContextVisible?: boolean;
    includeFilterContext?: boolean;
    mergeHeaders?: boolean;
    mergeHeadersDisabled?: boolean;
    mergeHeadersText?: string;
    mergeHeadersTitle?: string;
}

/**
 * @internal
 */
export interface IExportDialogBaseState {
    includeFilterContext: boolean;
    mergeHeaders: boolean;
}

/**
 * @internal
 */
export interface IExportDialogData {
    includeFilterContext: boolean;
    mergeHeaders: boolean;
}
