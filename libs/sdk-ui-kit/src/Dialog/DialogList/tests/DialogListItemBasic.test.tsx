// (C) 2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import defaultUserEvent from "@testing-library/user-event";
import { DialogListItemBasic } from "../DialogListItemBasic.js";
import { IDialogListItemComponentProps } from "../typings.js";
import { describe, it, expect, vi } from "vitest";
import { defaultImport } from "default-import";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

describe("DialogListItemBasic", () => {
    const createComponent = (props?: IDialogListItemComponentProps) => {
        return render(<DialogListItemBasic {...props} />);
    };

    it("should call onClick when clicked on item", async () => {
        const onClickMock = vi.fn();
        createComponent({
            item: { id: "id", title: "title", isClickable: true },
            onClick: onClickMock,
        });

        await userEvent.click(screen.getByRole("dialog-list-item-content"));
        await waitFor(() => {
            expect(onClickMock).toHaveBeenCalledTimes(1);
        });
    });

    it("should not call onClick when clicked on disabled item", async () => {
        const onClickMock = vi.fn();
        createComponent({
            item: { id: "id", title: "title", isDisabled: true },
            onClick: onClickMock,
        });

        await userEvent.click(screen.getByRole("dialog-list-item-content"));
        await waitFor(() => {
            expect(onClickMock).toHaveBeenCalledTimes(0);
        });
    });

    it("should not call onClick when clicked on item that is not clickable", async () => {
        const onClickMock = vi.fn();
        createComponent({
            item: { id: "id", title: "title", isClickable: false },
            onClick: onClickMock,
        });

        await userEvent.click(screen.getByRole("dialog-list-item-content"));
        await waitFor(() => {
            expect(onClickMock).toHaveBeenCalledTimes(0);
        });
    });

    it("should call onDelete when clicked on delete icon", async () => {
        const onDeleteMock = vi.fn();
        createComponent({ item: { id: "id", title: "title" }, onDelete: onDeleteMock });

        await userEvent.click(screen.getByRole("icon-delete"));
        await waitFor(() => {
            expect(onDeleteMock).toHaveBeenCalledTimes(1);
        });
    });

    it("should not createComponent delete icon for disabled item", () => {
        createComponent({
            item: { id: "id", title: "title", isDisabled: true },
        });

        expect(screen.queryByRole("icon-delete")).not.toBeInTheDocument();
    });

    it("should not createComponent delete icon for non-deletable item", () => {
        createComponent({
            item: { id: "id", title: "title", isDeletable: false },
        });

        expect(screen.queryByRole("icon-delete")).not.toBeInTheDocument();
    });
});
