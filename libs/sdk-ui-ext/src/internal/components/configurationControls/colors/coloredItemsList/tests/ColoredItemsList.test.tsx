// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import defaultUserEvent from "@testing-library/user-event";
import noop from "lodash/noop.js";
import cloneDeep from "lodash/cloneDeep.js";
import ColoredItemsList, { IColoredItemsListProps } from "../ColoredItemsList.js";
import { colorPalette } from "../../../../../tests/mocks/testColorHelper.js";
import { InternalIntlWrapper, createInternalIntl } from "../../../../../utils/internalIntlProvider.js";
import { inputItemsMock } from "./mock.js";
import { describe, it, expect } from "vitest";
import { defaultImport } from "default-import";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

const defaultProps: IColoredItemsListProps = {
    colorPalette,
    inputItems: [],
    onSelect: noop,
    intl: createInternalIntl(),
};

function createComponent(customProps: Partial<IColoredItemsListProps> = {}) {
    const props: IColoredItemsListProps = { ...cloneDeep(defaultProps), ...customProps };
    return render(
        <InternalIntlWrapper>
            <ColoredItemsList {...props} />
        </InternalIntlWrapper>,
    );
}

describe("ColoredItemsList", () => {
    it("should render empty ColoredItemsList control", () => {
        createComponent();
        expect(screen.getByText("No matching data")).toBeInTheDocument();
    });

    it("should hide search field for less than 7 items", () => {
        createComponent({
            inputItems: inputItemsMock.slice(0, 3),
        });

        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });

    it("should hide search field while loading", () => {
        createComponent({
            inputItems: inputItemsMock,
            isLoading: true,
        });

        expect(screen.getByLabelText("loading")).toBeInTheDocument();
    });

    it("should show search field for more than 7 items", () => {
        createComponent({
            inputItems: inputItemsMock,
        });
        expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("should use searchString when search field is visible", async () => {
        createComponent({
            inputItems: inputItemsMock,
        });

        await userEvent.type(screen.getByRole("textbox"), "abcd");
        await waitFor(() => {
            expect(screen.getByRole("textbox")).toHaveValue("abcd");
        });
    });
});
