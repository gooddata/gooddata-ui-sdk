// (C) 2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import defaultUserEvent from "@testing-library/user-event";
import { DialogListHeader, IDialogListHeaderProps } from "../DialogListHeader.js";
import { describe, it, expect, vi } from "vitest";
import { defaultImport } from "default-import";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

describe("DialogListHeader", () => {
    const createComponent = (props?: IDialogListHeaderProps) => {
        return render(<DialogListHeader {...props} />);
    };

    it("should call onClick when clicked on button", async () => {
        const buttonTitle = "Add";
        const onButtonClickMock = vi.fn();
        createComponent({ onButtonClick: onButtonClickMock, buttonTitle });

        expect(screen.getByRole("dialog-list-header")).toBeInTheDocument();

        await userEvent.click(screen.getByText(buttonTitle));
        await waitFor(() => {
            expect(onButtonClickMock).toHaveBeenCalledTimes(1);
        });
    });

    it("should not call onClick when clicked on disabled button", async () => {
        const buttonTitle = "Add";
        const onButtonClickMock = vi.fn();
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
