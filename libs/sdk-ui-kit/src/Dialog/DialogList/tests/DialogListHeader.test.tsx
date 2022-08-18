// (C) 2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DialogListHeader, IDialogListHeaderProps } from "../DialogListHeader";

describe("DialogListHeader", () => {
    const createComponent = (props?: IDialogListHeaderProps) => {
        return render(<DialogListHeader {...props} />);
    };

    it("should call onClick when clicked on button", async () => {
        const buttonTitle = "Add";
        const onButtonClickMock = jest.fn();
        createComponent({ onButtonClick: onButtonClickMock, buttonTitle });

        expect(screen.getByRole("dialog-list-header")).toBeInTheDocument();

        await userEvent.click(screen.getByText(buttonTitle));
        await waitFor(() => {
            expect(onButtonClickMock).toHaveBeenCalledTimes(1);
        });
    });

    it("should not call onClick when clicked on disabled button", async () => {
        const buttonTitle = "Add";
        const onButtonClickMock = jest.fn();
        createComponent({
            onButtonClick: onButtonClickMock,
            buttonTitle,
            buttonDisabled: true,
        });

        await userEvent.click(screen.getByText(buttonTitle));
        await waitFor(() => {
            expect(onButtonClickMock).toHaveBeenCalledTimes(0);
        });
    });
});
