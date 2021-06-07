// (C) 2020 GoodData Corporation
import React from "react";
import { DialogBase } from "./DialogBase";
import noop from "lodash/noop";
import { IExportDialogBaseProps, IExportDialogBaseState } from "./typings";
import { Checkbox } from "../Form";
import { ConfirmDialogBase } from "./ConfirmDialogBase";

/**
 * @internal
 */
export class ExportDialogBase extends DialogBase<IExportDialogBaseProps> {
    static defaultProps: Partial<IExportDialogBaseProps> = {
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
                className="gd-export-dialog"
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
