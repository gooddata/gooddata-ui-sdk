// (C) 2020 GoodData Corporation
import React from "react";
import { mount, ReactWrapper } from "enzyme";
import noop from "lodash/noop";

import { Paging, IPagingProps } from "../Paging";
import { withIntl } from "@gooddata/sdk-ui";

describe("Paging", () => {
    function render(customProps: Partial<IPagingProps> = {}): ReactWrapper {
        const props: IPagingProps = {
            page: 1,
            pagesCount: 2,
            showNextPage: noop,
            showPrevPage: noop,
            ...customProps,
        };
        const Wrapped = withIntl(Paging);
        return mount(<Wrapped {...props} />);
    }

    it("should render Paging", () => {
        const pagingComponent = render();
        expect(pagingComponent.find(".paging")).toHaveLength(1);
        expect(pagingComponent.find(".paging span").text()).toBe("1 of 2");
    });

    it("should call showNextPage", async () => {
        const showNextPage = jest.fn();
        const pagingComponent = render({ showNextPage });
        pagingComponent.find("button.icon-chevron-down").simulate("click");
        expect(showNextPage).toHaveBeenCalledTimes(1);
    });
});
