// (C) 2020-2023 GoodData Corporation
import React from "react";
import { Overlay } from "../Overlay/index.js";
import { IAlignPoint } from "../typings/positioning.js";
import { ExportDialogBase } from "./ExportDialogBase.js";
import { IExportDialogBaseProps } from "./typings.js";

const alignPoints: IAlignPoint[] = [{ align: "cc cc" }];

/**
 * @internal
 */
export const ExportDialog = (props: IExportDialogBaseProps): JSX.Element => {
    const {
        className,
        displayCloseButton,
        isPositive,
        isSubmitDisabled,
        containerClassName,

        headline,
        cancelButtonText,
        submitButtonText,

        filterContextText,
        filterContextTitle,
        filterContextVisible,
        includeFilterContext,

        mergeHeaders,
        mergeHeadersDisabled,
        mergeHeadersText,
        mergeHeadersTitle,

        onCancel,
        onSubmit,
    } = props;
    return (
        <Overlay
            alignPoints={alignPoints}
            isModal
            positionType="fixed"
            containerClassName={containerClassName}
        >
            <ExportDialogBase
                className={className}
                displayCloseButton={displayCloseButton}
                isPositive={isPositive}
                isSubmitDisabled={isSubmitDisabled}
                headline={headline}
                cancelButtonText={cancelButtonText}
                submitButtonText={submitButtonText}
                filterContextText={filterContextText}
                filterContextTitle={filterContextTitle}
                filterContextVisible={filterContextVisible}
                includeFilterContext={includeFilterContext}
                mergeHeaders={mergeHeaders}
                mergeHeadersDisabled={mergeHeadersDisabled}
                mergeHeadersText={mergeHeadersText}
                mergeHeadersTitle={mergeHeadersTitle}
                onCancel={onCancel}
                onSubmit={onSubmit}
            />
        </Overlay>
    );
};

ExportDialog.defaultProps = ExportDialogBase.defaultProps;
