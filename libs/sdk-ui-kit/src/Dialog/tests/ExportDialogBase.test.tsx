// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import assignIn from "lodash/assignIn";

import { ExportDialogBase } from "../ExportDialogBase";

describe("ExportDialogBase", () => {
    const defaultProps = {
        filterContextVisible: true,
        includeFilterContext: false,
        mergeHeaders: false,
        mergeHeadersDisabled: false,
    };

    const renderExportDialog = (options: any) => {
        render(<ExportDialogBase {...options} />);
        const includeFilterContextCheckbox: HTMLElement = screen.getAllByRole("checkbox")[1];
        const mergeHeadersCheckbox: HTMLElement = screen.getAllByRole("checkbox")[0];

        return {
            includeFilterContextCheckbox,
            mergeHeadersCheckbox,
        };
    };

    it("should render content", () => {
        renderExportDialog({});

        expect(screen.getByText("Export to XLSX")).toBeInTheDocument();
    });

    it("should load values correctly", () => {
        const props = {
            includeFilterContext: true,
            mergeHeaders: true,
            mergeHeadersDisabled: true,
        };
        const { includeFilterContextCheckbox, mergeHeadersCheckbox } = renderExportDialog(props);

        expect(includeFilterContextCheckbox).toBeChecked();
        expect(mergeHeadersCheckbox).toBeChecked();
        expect(mergeHeadersCheckbox).toBeDisabled();
    });

    it("should update value correctly", async () => {
        const submitSpy = jest.fn();
        const newProps = {
            includeFilterContext: defaultProps.includeFilterContext,
            mergeHeaders: defaultProps.mergeHeaders,
        };

        const { includeFilterContextCheckbox, mergeHeadersCheckbox } = renderExportDialog(
            assignIn({}, defaultProps, {
                onSubmit: submitSpy,
            }),
        );

        newProps.includeFilterContext = !newProps.includeFilterContext;
        await userEvent.click(includeFilterContextCheckbox);

        newProps.mergeHeaders = !newProps.mergeHeaders;
        await userEvent.click(mergeHeadersCheckbox);

        await userEvent.click(screen.getByText("Export"));

        await waitFor(() => expect(submitSpy).toHaveBeenCalledWith(newProps));

        submitSpy.mockRestore();
    });
});
