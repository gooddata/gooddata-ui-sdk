// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import defaultUserEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { defaultImport } from "default-import";

import { ConfirmDialogBase } from "../ConfirmDialogBase.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

describe("ConfirmDialogBase", () => {
    it("should render content", () => {
        render(
            <ConfirmDialogBase>
                <div className="test-content">ReactConfirmDialogBase content</div>
            </ConfirmDialogBase>,
        );

        expect(screen.getByText("ReactConfirmDialogBase content")).toBeInTheDocument();
    });

    it("should call cancel handler", async () => {
        const cancelSpy = vi.fn();
        render(
            <ConfirmDialogBase onCancel={cancelSpy} cancelButtonText="Cancel">
                ConfirmDialogBase content
            </ConfirmDialogBase>,
        );

        await userEvent.click(screen.getByText("Cancel"));
        await waitFor(() => expect(cancelSpy).toHaveBeenCalledTimes(1));
    });

    it("should call submit handler", async () => {
        const submitSpy = vi.fn();
        render(
            <ConfirmDialogBase onSubmit={submitSpy} submitButtonText="Submit">
                ConfirmDialogBase content
            </ConfirmDialogBase>,
        );

        await userEvent.click(screen.getByText("Submit"));

        await waitFor(() => expect(submitSpy).toHaveBeenCalledTimes(1));
    });
});
