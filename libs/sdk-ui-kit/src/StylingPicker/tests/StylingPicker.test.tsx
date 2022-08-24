// (C) 2022 GoodData Corporation

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { ITheme } from "@gooddata/sdk-model";

import { defaultItemMock, customItemsMock } from "./mocks";

import { IStylingPickerProps, StylingPicker } from "../StylingPicker";

import * as useMediaQuery from "../../responsive/useMediaQuery";

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
    const renderComponent = (props: Partial<IStylingPickerProps<ITheme>>) => {
        const defaultProps = {
            title: "Styling picker",
            defaultItem: defaultItemMock,
            customItems: customItemsMock,
            itemToColorPreview: (): string[] => [],
            emptyMessage: () => <span aria-label="empty-message-test" />,
        };

        return render(
            <IntlWrapper locale="en-US">
                <StylingPicker {...defaultProps} {...props} />
            </IntlWrapper>,
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
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

    it("should render empty message and no footer buttons when no custom items are provided", () => {
        renderComponent({
            customItems: [],
        });

        expect(screen.getByLabelText("empty-message-test")).toBeInTheDocument();
        expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
        expect(screen.queryByText("Apply")).not.toBeInTheDocument();
    });

    it("should select provided selected item", () => {
        const selectedItemRef = customItemsMock[0].ref;
        renderComponent({ selectedItemRef });

        expect(screen.getByLabelText("first_theme")).toBeChecked();
    });

    it("should render footer buttons when selected item is different from basic item", () => {
        const selectedItemRef = customItemsMock[0].ref;
        renderComponent({ selectedItemRef });

        expect(screen.getByText("Cancel")).toBeInTheDocument();
        expect(screen.getByText("Apply")).toBeInTheDocument();
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

    it("should call onListButtonClick when list action link is clicked", async () => {
        const onListActionClick = jest.fn();
        renderComponent({ onListActionClick });

        await userEvent.click(screen.getByText("Create"));

        await waitFor(() => {
            expect(onListActionClick).toHaveBeenCalled();
        });
    });

    it("should not render Actions menu if no onItemEdit and onItemDelete provided", () => {
        renderComponent({});
        expect(screen.queryByRole("button", { name: /\.\.\./i })).not.toBeInTheDocument();
    });

    it("should call onItemEdit when list item menu is clicked", async () => {
        const onItemEdit = jest.fn();
        renderComponent({ onItemEdit });

        await userEvent.click(screen.getAllByRole("button", { name: /\.\.\./i })[0]);
        await userEvent.click(screen.getByText("Edit"));
        await waitFor(() => {
            expect(onItemEdit).toHaveBeenCalled();
            expect(onItemEdit).toBeCalledWith(expect.objectContaining(customItemsMock[0]));
        });
    });

    it("should call onItemDelete when list item menu is clicked", async () => {
        const onItemDelete = jest.fn();
        renderComponent({ onItemDelete });

        await userEvent.click(screen.getAllByRole("button", { name: /\.\.\./i })[0]);
        await userEvent.click(screen.getByText("Delete"));
        await waitFor(() => {
            expect(onItemDelete).toBeCalledWith(expect.objectContaining(customItemsMock[0].ref));
        });
    });

    it("should call onApply when apply button is clicked", async () => {
        const onApply = jest.fn();
        renderComponent({ onApply });

        await userEvent.click(screen.getByText("First theme"));
        await userEvent.click(screen.getByText("Apply"));
        await waitFor(() => {
            expect(onApply).toBeCalledWith(customItemsMock[0].ref);
        });
    });

    it("should not render list action link on mobile device", () => {
        jest.spyOn(useMediaQuery, "useMediaQuery").mockReturnValue(true);
        renderComponent({});
        expect(screen.queryByText("Create")).not.toBeInTheDocument();
    });

    it("should not render list item Actions menu on mobile device", () => {
        jest.spyOn(useMediaQuery, "useMediaQuery").mockReturnValue(true);
        const onItemEdit = jest.fn();
        const onItemDelete = jest.fn();
        renderComponent({ onItemEdit, onItemDelete });
        expect(screen.queryByRole("button", { name: /\.\.\./i })).not.toBeInTheDocument();
    });
});
