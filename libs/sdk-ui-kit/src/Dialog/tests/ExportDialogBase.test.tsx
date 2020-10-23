// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import assignIn from "lodash/assignIn";
import { ExportDialogBase } from "../ExportDialogBase";

const FILTER_CONTEXT_CHECKBOX = "gs.dialog.export.checkbox.includeFilterContext";
const MERGE_HEADERS_CHECKBOX = "gs.dialog.export.checkbox.mergeHeaders";

describe("ExportDialogBase", () => {
    const defaultProps = {
        filterContextVisible: true,
        includeFilterContext: false,
        mergeHeaders: false,
        mergeHeadersDisabled: false,
    };

    const renderExportDialog = (options: any) => {
        const dialog = mount(<ExportDialogBase {...options} />);
        const includeFilterContextCheckbox = dialog
            .find({ name: FILTER_CONTEXT_CHECKBOX })
            .find("input")
            .first();
        const mergeHeadersCheckbox = dialog.find({ name: MERGE_HEADERS_CHECKBOX }).find("input").first();
        return {
            dialog,
            includeFilterContextCheckbox,
            mergeHeadersCheckbox,
        };
    };

    it("should render content", () => {
        const { dialog } = renderExportDialog({});

        expect(dialog.find(ExportDialogBase)).toBeDefined();

        dialog.unmount();
    });

    it("should load values correctly", () => {
        const props = {
            includeFilterContext: true,
            mergeHeaders: true,
            mergeHeadersDisabled: true,
        };
        const { dialog, includeFilterContextCheckbox, mergeHeadersCheckbox } = renderExportDialog(props);

        expect(includeFilterContextCheckbox.prop("checked")).toEqual(true);
        expect(mergeHeadersCheckbox.prop("checked")).toEqual(true);
        expect(mergeHeadersCheckbox.prop("disabled")).toEqual(true);

        dialog.unmount();
    });

    it("should update value correctly", () => {
        const submitSpy = jest.fn();
        const newProps = {
            includeFilterContext: defaultProps.includeFilterContext,
            mergeHeaders: defaultProps.mergeHeaders,
        };

        const { dialog, includeFilterContextCheckbox, mergeHeadersCheckbox } = renderExportDialog(
            assignIn({}, defaultProps, {
                onSubmit: submitSpy,
            }),
        );

        // click on checkbox includeFilterContext
        newProps.includeFilterContext = !newProps.includeFilterContext;
        includeFilterContextCheckbox
            .first()
            .simulate("change", { target: { checked: newProps.includeFilterContext } });

        // click on checkbox mergeHeaders
        newProps.mergeHeaders = !newProps.mergeHeaders;
        mergeHeadersCheckbox.first().simulate("change", { target: { checked: newProps.mergeHeaders } });

        // click on submit button
        dialog.find(".s-dialog-submit-button").first().simulate("click");
        expect(submitSpy).toHaveBeenCalledWith(newProps);

        submitSpy.mockRestore();
        dialog.unmount();
    });

    it("should hide checkbox includeFilterContext", () => {
        const props = {
            filterContextVisible: false,
        };
        const { dialog, includeFilterContextCheckbox } = renderExportDialog(props);

        expect(includeFilterContextCheckbox.exists()).toEqual(false);

        dialog.unmount();
    });
});
