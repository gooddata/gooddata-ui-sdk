// (C) 2019-2025 GoodData Corporation

import React from "react";

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IntlWrapper } from "@gooddata/sdk-ui";

import {
    IDashboardEditLayoutProps,
    RenderDashboardEditLayout,
} from "./DashboardEditLayout/DashboardEditLayout.js";
import { IDashboardEditLayout } from "./DashboardEditLayout/DashboardEditLayoutTypes.js";

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
