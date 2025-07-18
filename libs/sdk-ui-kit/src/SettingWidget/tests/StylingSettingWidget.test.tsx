// (C) 2022-2025 GoodData Corporation

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { ITheme } from "@gooddata/sdk-model";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { defaultItemMock, customItemsMock } from "./mocks.js";

import * as useMediaQuery from "../../responsive/useMediaQuery.js";
import { StylingSettingWidget, IStylingSettingWidgetProps } from "../StylingSettingWidget/index.js";

const expectedButtonsState = (buttons: HTMLElement[], disabled = true) => {
    return buttons.forEach((item) => {
        if (disabled) {
            expect(item).toHaveClass("disabled");
        } else {
            expect(item).not.toHaveClass("disabled");
        }
    });
};

describe("StylingPicker", () => {
    const renderComponent = (props: Partial<IStylingSettingWidgetProps<ITheme>>) => {
        const defaultProps = {
            title: "Styling picker",
            defaultItem: defaultItemMock,
            customItems: customItemsMock,
            itemToColorPreview: (): string[] => [],
            emptyMessage: () => <span aria-label="empty-message-test" />,
        };

        return render(
            <IntlWrapper locale="en-US">
                <StylingSettingWidget {...defaultProps} {...props} />
            </IntlWrapper>,
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render component with basic item selected by default", () => {
        renderComponent({});
        expect(screen.getByText("Default")).toBeInTheDocument();

        expect(screen.getByLabelText("default_theme")).toBeChecked();
    });

    it("should be loading", () => {
        renderComponent({ isLoading: true });
        expect(screen.queryByText("Default")).not.toBeInTheDocument();
        expect(screen.getByLabelText("dialog-list-loading")).toBeInTheDocument();
    });

    it("should render provided basic and custom items", () => {
        renderComponent({});
        expect(screen.getByText("Default theme")).toBeInTheDocument();
        expect(screen.getByText("First theme")).toBeInTheDocument();
        expect(screen.getByText("Second theme")).toBeInTheDocument();
    });

    it("should render empty message when no custom items are provided", () => {
        renderComponent({
            customItems: [],
        });

        expect(screen.getByLabelText("empty-message-test")).toBeInTheDocument();
        expect(screen.queryByText("Cancel")).toBeInTheDocument();
        expect(screen.queryByText("Apply")).toBeInTheDocument();
    });

    it("should select provided selected item", () => {
        const selectedItemRef = customItemsMock[0].ref;
        renderComponent({ selectedItemRef });

        expect(screen.getByLabelText("first_theme")).toBeChecked();
    });

    it("should disable footer buttons when currently selected item is the same as provided selected item", () => {
        const selectedItemRef = customItemsMock[0].ref;
        renderComponent({ selectedItemRef });

        expectedButtonsState(screen.getAllByRole("button"));
    });

    it("should enable footer buttons after click on item that is not the same as provided selected item", async () => {
        const selectedItemRef = customItemsMock[0].ref;
        renderComponent({ selectedItemRef });
        const buttons = screen.getAllByRole("button");
        expectedButtonsState(buttons);

        await userEvent.click(screen.getByText("Second theme"));
        expectedButtonsState(buttons, false);
    });

    it("should reset list selection to provided selected item when cancel button is clicked", async () => {
        const selectedItemRef = customItemsMock[0].ref;
        renderComponent({ selectedItemRef });

        expect(screen.getByLabelText("first_theme")).toBeChecked();
        expect(screen.queryByLabelText("second_theme")).not.toBeChecked();

        await userEvent.click(screen.getByText("Second theme"));

        expect(screen.queryByLabelText("first_theme")).not.toBeChecked();
        expect(screen.getByLabelText("second_theme")).toBeChecked();

        await userEvent.click(screen.getByText("Cancel"));

        expect(screen.getByLabelText("first_theme")).toBeChecked();
        expect(screen.queryByLabelText("second_theme")).not.toBeChecked();
    });

    it("should call onCancel when shouldDisableCancelButton is false and cancel button is clicked", async () => {
        const selectedItemRef = customItemsMock[0].ref;
        const onCancel = vi.fn();
        renderComponent({ selectedItemRef, shouldDisableCancelButton: false, onCancel });

        await userEvent.click(screen.getByText("Cancel"));

        await waitFor(() => {
            expect(onCancel).toHaveBeenCalled();
        });
    });

    it("should call onListButtonClick when list action link is clicked", async () => {
        const onListActionClick = vi.fn();
        renderComponent({ onListActionClick });

        await userEvent.click(screen.getByText("Create"));

        await waitFor(() => {
            expect(onListActionClick).toHaveBeenCalled();
        });
    });

    it("should not render Actions menu if no onItemEdit and onItemDelete provided", () => {
        renderComponent({});
        expect(screen.queryByRole("button", { name: /\.\.\./ })).not.toBeInTheDocument();
    });

    it("should call onItemEdit when list item menu is clicked", async () => {
        const onItemEdit = vi.fn();
        renderComponent({ onItemEdit });

        await userEvent.click(screen.getAllByRole("button", { name: /\.\.\./ })[0]);
        await userEvent.click(screen.getByText("Edit"));
        await waitFor(() => {
            expect(onItemEdit).toHaveBeenCalled();
            expect(onItemEdit).toBeCalledWith(expect.objectContaining(customItemsMock[0]));
        });
    });

    it("should call onItemDelete when list item menu is clicked", async () => {
        const onItemDelete = vi.fn();
        renderComponent({ onItemDelete });

        await userEvent.click(screen.getAllByRole("button", { name: /\.\.\./ })[0]);
        await userEvent.click(screen.getByText("Delete"));
        await waitFor(() => {
            expect(onItemDelete).toBeCalledWith(expect.objectContaining(customItemsMock[0].ref));
        });
    });

    it("should call onApply when apply button is clicked", async () => {
        const onApply = vi.fn();
        renderComponent({ onApply });

        await userEvent.click(screen.getByText("First theme"));
        await userEvent.click(screen.getByText("Apply"));
        await waitFor(() => {
            expect(onApply).toBeCalledWith(customItemsMock[0].ref);
        });
    });

    it("should not render list action link on mobile device", () => {
        vi.spyOn(useMediaQuery, "useMediaQuery").mockReturnValue(true);
        renderComponent({});
        expect(screen.queryByText("Create")).not.toBeInTheDocument();
    });

    it("should not render list item Actions menu on mobile device", () => {
        vi.spyOn(useMediaQuery, "useMediaQuery").mockReturnValue(true);
        const onItemEdit = vi.fn();
        const onItemDelete = vi.fn();
        renderComponent({ onItemEdit, onItemDelete });
        expect(screen.queryByRole("button", { name: /\.\.\./ })).not.toBeInTheDocument();
    });
});
