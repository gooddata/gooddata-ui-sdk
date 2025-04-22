// (C) 2020-2025 GoodData Corporation
import React from "react";
import noop from "lodash/noop.js";

import { Overlay } from "../Overlay/index.js";
import { IAlignPoint } from "../typings/positioning.js";

import { ExportDialogBase } from "./ExportDialogBase.js";
import { IExportDialogProps } from "./typings.js";

const alignPoints: IAlignPoint[] = [{ align: "cc cc" }];

/**
 * @internal
 */
export const ExportDialog = React.memo<IExportDialogProps>(function ExportDialog({
    className,
    displayCloseButton = true,
    isPositive = true,
    isSubmitDisabled = false,
    containerClassName,

    headline = "Export to XLSX",
    cancelButtonText = "Cancel",
    submitButtonText = "Export",

    filterContextText = "Include applied filters",
    filterContextTitle = "INSIGHT CONTEXT",
    filterContextVisible = true,
    includeFilterContext = true,

    mergeHeaders = true,
    mergeHeadersDisabled = false,
    mergeHeadersText = "Keep attribute cells merged",
    mergeHeadersTitle = "CELLS",

    onCancel = noop,
    onSubmit = noop,
}) {
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
});
