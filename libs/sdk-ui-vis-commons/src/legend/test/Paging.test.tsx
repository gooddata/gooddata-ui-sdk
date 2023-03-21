// (C) 2020-2023 GoodData Corporation
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import noop from "lodash/noop";

import { Paging, IPagingProps } from "../Paging";
import { withIntl } from "@gooddata/sdk-ui";

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
        expect(screen.getByLabelText("Paging")).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("of 2")).toBeInTheDocument();
    });

    it("should call showNextPage", async () => {
        const showNextPage = jest.fn();
        renderComponent({ showNextPage });
        fireEvent.click(screen.getAllByRole("button")[1]);
        expect(showNextPage).toHaveBeenCalledTimes(1);
    });
});
