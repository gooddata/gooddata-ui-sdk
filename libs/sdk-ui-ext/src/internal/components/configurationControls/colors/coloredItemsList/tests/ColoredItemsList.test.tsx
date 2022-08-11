// (C) 2019-2022 GoodData Corporation
import React from "react";
import { waitFor } from "@testing-library/react";
import noop from "lodash/noop";
import cloneDeep from "lodash/cloneDeep";
import ColoredItemsList, { IColoredItemsListProps } from "../ColoredItemsList";
import { colorPalette } from "../../../../../tests/mocks/testColorHelper";
import { setupComponent } from "../../../../../tests/testHelper";
import { InternalIntlWrapper, createInternalIntl } from "../../../../../utils/internalIntlProvider";
import { inputItemsMock } from "./mock";

const defaultProps: IColoredItemsListProps = {
    colorPalette,
    inputItems: [],
    onSelect: noop,
    intl: createInternalIntl(),
};

function createComponent(customProps: Partial<IColoredItemsListProps> = {}) {
    const props: IColoredItemsListProps = { ...cloneDeep(defaultProps), ...customProps };
    return setupComponent(
        <InternalIntlWrapper>
            <ColoredItemsList {...props} />
        </InternalIntlWrapper>,
    );
}

describe("ColoredItemsList", () => {
    it("should render empty ColoredItemsList control", () => {
        const { getByText } = createComponent();
        expect(getByText("No matching data")).toBeInTheDocument();
    });

    it("should hide search field for less than 7 items", () => {
        const { queryByRole } = createComponent({
            inputItems: inputItemsMock.slice(0, 3),
        });

        expect(queryByRole("textbox")).not.toBeInTheDocument();
    });

    it("should hide search field while loading", () => {
        const { getByLabelText } = createComponent({
            inputItems: inputItemsMock,
            isLoading: true,
        });

        expect(getByLabelText("loading")).toBeInTheDocument();
    });

    it("should show search field for more than 7 items", () => {
        const { getByRole } = createComponent({
            inputItems: inputItemsMock,
        });
        expect(getByRole("textbox")).toBeInTheDocument();
    });

    it("should use searchString when search field is visible", async () => {
        const { getByRole, user } = createComponent({
            inputItems: inputItemsMock,
        });

        await user.type(getByRole("textbox"), "abcd");
        await waitFor(() => {
            expect(getByRole("textbox")).toHaveValue("abcd");
        });
    });
});
