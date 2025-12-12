// (C) 2022-2025 GoodData Corporation

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DialogListItemBasic } from "../DialogListItemBasic.js";
import { type IDialogListItemComponentProps } from "../typings.js";

describe("DialogListItemBasic", () => {
    const createComponent = (props?: Partial<IDialogListItemComponentProps>) => {
        return render(<DialogListItemBasic {...(props as IDialogListItemComponentProps)} />);
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
