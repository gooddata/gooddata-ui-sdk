// (C) 2020-2023 GoodData Corporation
import React from "react";
import cx from "classnames";
import { DialogBase } from "./DialogBase.js";
import noop from "lodash/noop.js";
import { IExportDialogBaseProps, IExportDialogBaseState } from "./typings.js";
import { Checkbox } from "../Form/index.js";
import { ConfirmDialogBase } from "./ConfirmDialogBase.js";

/**
 * @internal
 */
export class ExportDialogBase extends DialogBase<IExportDialogBaseProps> {
    static defaultProps: IExportDialogBaseProps = {
        displayCloseButton: true,
        isPositive: true,
        isSubmitDisabled: false,
        headline: "Export to XLSX",
        cancelButtonText: "Cancel",
        submitButtonText: "Export",
        filterContextText: "Include applied filters",
        filterContextTitle: "INSIGHT CONTEXT",
        filterContextVisible: true,
        includeFilterContext: true,
        mergeHeaders: true,
        mergeHeadersDisabled: false,
        mergeHeadersText: "Keep attribute cells merged",
        mergeHeadersTitle: "CELLS",
        onCancel: noop,
        onSubmit: noop,
    };

    public state: IExportDialogBaseState = {
        includeFilterContext: this.props.includeFilterContext,
        mergeHeaders: this.props.mergeHeaders,
    };

    public render(): JSX.Element {
        const {
            className,
            displayCloseButton,
            isPositive,
            isSubmitDisabled,

            headline,
            cancelButtonText,
            submitButtonText,

            onCancel,

            filterContextText,
            filterContextTitle,
            filterContextVisible,

            mergeHeadersDisabled,
            mergeHeadersText,
            mergeHeadersTitle,
        } = this.props;
        const { includeFilterContext, mergeHeaders } = this.state;

        let filterContextCheckbox;
        if (filterContextVisible) {
            filterContextCheckbox = (
                <Checkbox
                    name="gs.dialog.export.checkbox.includeFilterContext"
                    text={filterContextText}
                    title={filterContextTitle}
                    value={includeFilterContext}
                    onChange={this.onFilterContextChange}
                />
            );
        }

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
                onSubmit={this.onSubmit}
            >
                <Checkbox
                    disabled={mergeHeadersDisabled}
                    name="gs.dialog.export.checkbox.mergeHeaders"
                    text={mergeHeadersText}
                    title={mergeHeadersTitle}
                    value={mergeHeaders}
                    onChange={this.onMergeHeadersChange}
                />
                {filterContextCheckbox}
            </ConfirmDialogBase>
        );
    }

    private onFilterContextChange = (value: boolean) => {
        this.setState({ includeFilterContext: value });
    };

    private onMergeHeadersChange = (value: boolean) => {
        this.setState({ mergeHeaders: value });
    };

    private onSubmit = () => {
        const { filterContextVisible } = this.props;
        const { includeFilterContext, mergeHeaders } = this.state;

        this.props.onSubmit({
            includeFilterContext: filterContextVisible && includeFilterContext,
            mergeHeaders,
        });
    };
}
