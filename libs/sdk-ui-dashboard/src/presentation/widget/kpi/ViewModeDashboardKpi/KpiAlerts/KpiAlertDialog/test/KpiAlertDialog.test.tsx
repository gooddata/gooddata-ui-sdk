// (C) 2007-2022 GoodData Corporation
import React from "react";
import { configure, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import noop from "lodash/noop";
import { DefaultLocale, withIntl } from "@gooddata/sdk-ui";

import KpiAlertDialog, { IKpiAlertDialogProps } from "../KpiAlertDialog";
import { translations } from "../../../../../../localization";

const DEFAULT_DATE_FORMAT = "MM/dd/yyyy";

const defaultProps: IKpiAlertDialogProps = {
    dateFormat: DEFAULT_DATE_FORMAT,
    onAlertDialogCloseClick: noop,
    onAlertDialogDeleteClick: noop,
    onAlertDialogSaveClick: noop,
    onAlertDialogUpdateClick: noop,
    onApplyAlertFiltersClick: noop,
    userEmail: "user@gooddata.com",
};

function renderKpiAlertDialog(options: Partial<IKpiAlertDialogProps>) {
    const customProps = {
        isThresholdRepresentingPercent: true,
        ...options,
    };
    const Wrapped: React.ComponentType<IKpiAlertDialogProps> = withIntl(
        KpiAlertDialog,
        undefined,
        translations[DefaultLocale],
    );

    return render(<Wrapped {...defaultProps} {...customProps} />);
}

configure({ defaultHidden: true });

describe("KpiAlertDialog", () => {
    it("should not try to save alert when input threshold empty", async () => {
        const onAlertDialogSaveClick = jest.fn();
        renderKpiAlertDialog({ onAlertDialogSaveClick });

        await userEvent.click(screen.getByText("Set alert"));
        await waitFor(() => {
            expect(onAlertDialogSaveClick).not.toHaveBeenCalled();
        });
    });

    it("should not try to save alert when threshold is invalid", async () => {
        const onAlertDialogSaveClick = jest.fn();
        renderKpiAlertDialog({ onAlertDialogSaveClick });

        await userEvent.type(screen.getByRole("textbox"), "foo!bar");
        await userEvent.click(screen.getByText("Set alert"));

        await waitFor(() => {
            expect(onAlertDialogSaveClick).not.toHaveBeenCalled();
        });
    });

    // it("should try to save alert with threshold divided by 100", async () => {
    //     const onAlertDialogSaveClick = jest.fn();
    //     renderKpiAlertDialog({ onAlertDialogSaveClick });
    //     await userEvent.type(screen.getByRole("textbox"), "12.0045");
    //     await userEvent.click(screen.getByText("Set alert"));

    //     await waitFor(() => {
    //         expect(onAlertDialogSaveClick).toHaveBeenCalledWith(0.120045, "aboveThreshold");
    //     });
    // });
});
