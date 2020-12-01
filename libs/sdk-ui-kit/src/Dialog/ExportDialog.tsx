// (C) 2020 GoodData Corporation
import React from "react";
import { Overlay } from "../Overlay";
import { ExportDialogBase } from "./ExportDialogBase";
import { IExportDialogBaseProps } from "./typings";

/**
 * @internal
 */
export const ExportDialog = (props: IExportDialogBaseProps): JSX.Element => {
    const {
        displayCloseButton,
        isPositive,
        isSubmitDisabled,

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
            alignPoints={[
                {
                    align: "cc cc",
                },
            ]}
            isModal
            positionType="fixed"
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
