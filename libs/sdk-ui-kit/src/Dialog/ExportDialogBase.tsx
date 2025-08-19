// (C) 2020-2025 GoodData Corporation
import React from "react";

import cx from "classnames";
import noop from "lodash/noop.js";

import { usePropState } from "@gooddata/sdk-ui";

import { ConfirmDialogBase } from "./ConfirmDialogBase.js";
import { IExportDialogBaseProps } from "./typings.js";
import { Checkbox } from "../Form/index.js";
import { useIdPrefixed } from "../utils/useId.js";

/**
 * @internal
 */
export const ExportDialogBase = React.memo<IExportDialogBaseProps>(function ExportDialogBase({
    className,
    displayCloseButton = true,
    isPositive = true,
    isSubmitDisabled = false,

    headline = "Export to XLSX",
    cancelButtonText = "Cancel",
    submitButtonText = "Export",

    onCancel = noop,
    onSubmit = noop,

    filterContextText = "Include applied filters",
    filterContextTitle = "INSIGHT CONTEXT",
    filterContextVisible = true,

    mergeHeadersDisabled = false,
    mergeHeadersText = "Keep attribute cells merged",
    mergeHeadersTitle = "CELLS",

    includeFilterContext = true,
    mergeHeaders = true,
}) {
    const [isFilterContextIncluded, setIsFilterContextIncluded] = usePropState(includeFilterContext);
    const [shouldMergeHeaders, setShouldMergeHeaders] = usePropState(mergeHeaders);

    const mergeHeadersId = useIdPrefixed("mergeHeaders");
    const filterContextId = useIdPrefixed("filterContext");

    const handleSubmit = React.useCallback(() => {
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
            initialFocus={mergeHeadersId}
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
