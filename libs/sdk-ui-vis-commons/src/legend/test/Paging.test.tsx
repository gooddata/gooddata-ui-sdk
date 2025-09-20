// (C) 2020-2025 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { noop } from "lodash-es";
import { describe, expect, it, vi } from "vitest";

import { withIntl } from "@gooddata/sdk-ui";

import { IPagingProps, Paging } from "../Paging.js";

describe("Paging", () => {
    function renderComponent(customProps: Partial<IPagingProps> = {}) {
        const props: IPagingProps = {
            page: 1,
            pagesCount: 2,
            showNextPage: noop,
            showPrevPage: noop,
            ...customProps,
        };
        const Wrapped = withIntl(Paging);
        return render(<Wrapped {...props} />);
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
