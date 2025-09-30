// (C) 2020-2025 GoodData Corporation

import { memo } from "react";

import { ExportDialogBase } from "./ExportDialogBase.js";
import { IExportDialogProps } from "./typings.js";
import { Overlay } from "../Overlay/index.js";
import { IAlignPoint } from "../typings/positioning.js";

const alignPoints: IAlignPoint[] = [{ align: "cc cc" }];

/**
 * @internal
 */
export const ExportDialog = memo<IExportDialogProps>(function ExportDialog({
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

    mergeHeadersDisabled = false,
    mergeHeadersText = "Keep attribute cells merged",
    mergeHeadersTitle = "CELLS",

    onCancel = () => {},
    onSubmit = () => {},
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
                mergeHeadersDisabled={mergeHeadersDisabled}
                mergeHeadersText={mergeHeadersText}
                mergeHeadersTitle={mergeHeadersTitle}
                onCancel={onCancel}
                onSubmit={onSubmit}
            />
        </Overlay>
    );
});
