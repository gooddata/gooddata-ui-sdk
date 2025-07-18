// (C) 2020-2025 GoodData Corporation
import { fireEvent, render, screen } from "@testing-library/react";
import noop from "lodash/noop.js";

import { Paging, IPagingProps } from "../Paging.js";
import { Intl } from "@gooddata/sdk-ui";
import { describe, it, expect, vi } from "vitest";

describe("Paging", () => {
    function renderComponent(customProps: Partial<IPagingProps> = {}) {
        const props: IPagingProps = {
            page: 1,
            pagesCount: 2,
            showNextPage: noop,
            showPrevPage: noop,
            ...customProps,
        };
        return render(
            <Intl forTest>
                <Paging {...props} />
            </Intl>,
        );
    }

    it("should render Paging", () => {
        renderComponent();
        expect(screen.getByTestId("Paging")).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("of 2")).toBeInTheDocument();
    });

    it("should call showNextPage", async () => {
        const showNextPage = vi.fn();
        renderComponent({ showNextPage });
        fireEvent.click(screen.getAllByRole("button")[1]);
        expect(showNextPage).toHaveBeenCalledTimes(1);
    });
});
