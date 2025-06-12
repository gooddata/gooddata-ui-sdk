// (C) 2019-2022 GoodData Corporation

import React from "react";
import {
    RenderDashboardEditLayout,
    IDashboardEditLayoutProps,
} from "./DashboardEditLayout/DashboardEditLayout.js";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { render } from "@testing-library/react";
import { IDashboardEditLayout } from "./DashboardEditLayout/DashboardEditLayoutTypes.js";
import { describe, it, expect } from "vitest";

const lay: IDashboardEditLayout = {
    type: "IDashboardLayout",

    sections: [],
};

function createComponent(customProps: Partial<IDashboardEditLayoutProps> = {}) {
    return render(
        <IntlWrapper>
            <RenderDashboardEditLayout layout={lay} {...customProps} />
        </IntlWrapper>,
    );
}

describe("DashboardEditLayout in KD", () => {
    it("should render layout in KD old edit mode - layout must not have dependency on SDK state, use selectors, context...", () => {
        const { container } = createComponent();

        expect(container.getElementsByClassName("gd-dashboards")).toHaveLength(1);
    });
});
