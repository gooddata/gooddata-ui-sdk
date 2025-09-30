// (C) 2020-2025 GoodData Corporation

import { memo, useCallback, useState } from "react";

import cx from "classnames";

import { usePropState } from "@gooddata/sdk-ui";

import { ConfirmDialogBase } from "./ConfirmDialogBase.js";
import { IExportDialogBaseProps } from "./typings.js";
import { Checkbox } from "../Form/index.js";
import { useIdPrefixed } from "../utils/useId.js";

/**
 * @internal
 */
export const ExportDialogBase = memo<IExportDialogBaseProps>(function ExportDialogBase({
    className,
    displayCloseButton = true,
    isPositive = true,
    isSubmitDisabled = false,

    headline = "Export to XLSX",
    cancelButtonText = "Cancel",
    submitButtonText = "Export",

    onCancel = () => {},
    onSubmit = () => {},

    filterContextText = "Include applied filters",
    filterContextTitle = "INSIGHT CONTEXT",
    filterContextVisible = true,

    mergeHeadersDisabled = false,
    mergeHeadersText = "Keep attribute cells merged",
    mergeHeadersTitle = "CELLS",

    includeFilterContext = true,
}) {
    const effectiveIncludeFilterContext = filterContextVisible ? includeFilterContext : false;

    const [isFilterContextIncluded, setIsFilterContextIncluded] = usePropState(effectiveIncludeFilterContext);
    const [shouldMergeHeaders, setShouldMergeHeaders] = useState(true);

    const dialogId = useIdPrefixed("exportDialog");
    const mergeHeadersId = useIdPrefixed("mergeHeaders");
    const filterContextId = useIdPrefixed("filterContext");

    const handleSubmit = useCallback(() => {
        onSubmit({
            includeFilterContext: isFilterContextIncluded,
            mergeHeaders: shouldMergeHeaders,
        });
    }, [isFilterContextIncluded, onSubmit, shouldMergeHeaders]);

    return (
        <ConfirmDialogBase
            className={cx("gd-export-dialog", className)}
            displayCloseButton={displayCloseButton}
            isPositive={isPositive}
            isSubmitDisabled={isSubmitDisabled}
            headline={headline}
            cancelButtonText={cancelButtonText}
            submitButtonText={submitButtonText}
            onCancel={onCancel}
            onSubmit={handleSubmit}
            autofocusOnOpen={true}
            accessibilityConfig={{
                dialogId,
            }}
        >
            <div className="gd-export-dialog-item">
                {mergeHeadersTitle ? <h4>{mergeHeadersTitle}</h4> : null}
                <Checkbox
                    id={mergeHeadersId}
                    disabled={mergeHeadersDisabled}
                    name="gs.dialog.export.checkbox.mergeHeaders"
                    text={mergeHeadersText}
                    value={shouldMergeHeaders}
                    onChange={setShouldMergeHeaders}
                    labelSize="normal"
                />
            </div>
            {filterContextVisible ? (
                <div className="gd-export-dialog-item">
                    {filterContextTitle ? <h4>{filterContextTitle}</h4> : null}
                    <Checkbox
                        id={filterContextId}
                        name="gs.dialog.export.checkbox.includeFilterContext"
                        text={filterContextText}
                        value={isFilterContextIncluded}
                        onChange={setIsFilterContextIncluded}
                        labelSize="normal"
                    />
                </div>
            ) : null}
        </ConfirmDialogBase>
    );
});
