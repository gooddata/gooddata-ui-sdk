// (C) 2019-2025 GoodData Corporation

import React from "react";
import {
    RenderDashboardEditLayout,
    IDashboardEditLayoutProps,
} from "./DashboardEditLayout/DashboardEditLayout.js";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { render } from "@testing-library/react";
import { IDashboardEditLayout } from "./DashboardEditLayout/DashboardEditLayoutTypes.js";
import { describe, it, expect } from "vitest";
import { suppressConsole } from "@gooddata/util";

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

describe("DashboardEditLayout in KD", async () => {
    it("should render layout in KD old edit mode - layout must not have dependency on SDK state, use selectors, context...", async () => {
        const { container } = await suppressConsole(createComponent, "error", [
            {
                type: "startsWith",
                value: "Warning: %s: Support for defaultProps will be removed from function components in a future major release.", // comes from react-grid-system
            },
        ]);

        expect(container.getElementsByClassName("gd-dashboards")).toHaveLength(1);
    });
});
