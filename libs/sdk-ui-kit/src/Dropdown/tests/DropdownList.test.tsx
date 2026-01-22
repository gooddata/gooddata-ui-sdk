// (C) 2007-2025 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { withIntl } from "@gooddata/sdk-ui";

import { customMessages } from "./customDictionary.js";
import { componentMock } from "./testUtils.js";
import { type IRenderListItemProps } from "../../List/List.js";
import {
    DropdownList,
    type IDropdownListNoDataRenderProps,
    type IDropdownListProps,
} from "../DropdownList.js";

type IDropdownListMockProps = IDropdownListProps<string>;

const noDataMock = componentMock<IDropdownListNoDataRenderProps>();
const itemMock = componentMock<IRenderListItemProps<string>>();
const itemRenderer = itemMock.componentWithProps(({ item }) => ({ children: item }));
const mockItems = Array.from(Array(10)).map((_, i): string => `${i}`);

const testIfItemListIsRendered = (mockItems: string[]) => {
    expect(screen.getByTestId("gd-list")).toBeInTheDocument();
    mockItems.every((item) => expect(screen.getByText(item)).toBeInTheDocument());
};

const renderDropdownList = (props: Partial<IDropdownListMockProps> = {}) => {
    const defaultProps = {
        renderItem: itemRenderer,
    };
    const Wrapper = withIntl<IDropdownListMockProps>(DropdownList, undefined, customMessages);
    return render(<Wrapper {...defaultProps} {...props} />);
};

describe("DropdownList", () => {
    it("should render the search field, when showSearch is true", () => {
        renderDropdownList({ showSearch: true });
        expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("should render the tabs, when showTabs is true", () => {
        renderDropdownList({ showTabs: true });
        expect(screen.getByRole("tablist")).toBeInTheDocument();
    });

    it("should render the loading state, when isLoading is true", () => {
        renderDropdownList({ isLoading: true });
        expect(screen.getByLabelText("loading")).toBeInTheDocument();
    });

    it("should render the no data state, when items are empty", () => {
        renderDropdownList({ renderNoData: noDataMock.component });
        expect(document.querySelector(noDataMock.selector)).toBeInTheDocument();
    });

    it("should render items, when items are not empty", () => {
        renderDropdownList({ items: mockItems });
        testIfItemListIsRendered(mockItems);
    });

    it("should render the footer", () => {
        const footerMock = componentMock();
        const footer = <footerMock.component />;
        renderDropdownList({ footer });
        expect(document.querySelector(footerMock.selector)).toBeInTheDocument();
    });
});
