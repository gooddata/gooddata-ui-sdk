// (C) 2020 GoodData Corporation
import React from "react";
import { Overlay } from "../Overlay";
import { IAlignPoint } from "../typings/positioning";
import { ExportDialogBase } from "./ExportDialogBase";
import { IExportDialogBaseProps } from "./typings";

const alignPoints: IAlignPoint[] = [{ align: "cc cc" }];

/**
 * @internal
 */
export const ExportDialog = (props: IExportDialogBaseProps): JSX.Element => {
    const {
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
