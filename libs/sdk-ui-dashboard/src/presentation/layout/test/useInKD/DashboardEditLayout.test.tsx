// (C) 2019-2022 GoodData Corporation
import { idRef } from "@gooddata/sdk-model";
import React from "react";

import * as Mocks from "./DashboardEditLayout/DashboardEditLayoutMocks";
import {
    RenderDashboardEditLayout,
    IDashboardEditLayoutProps,
} from "./DashboardEditLayout/DashboardEditLayout";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { render } from "@testing-library/react";

const dashboardEditLayout = Mocks.layoutMock([
    Mocks.rowMock([[Mocks.widgetKpiPlaceholderMock()]]),
    Mocks.rowMock([[Mocks.widgetDropzoneHotspotMock(idRef(""))]]),
    Mocks.rowMock([[Mocks.widgetDropzoneMock()]]),
    Mocks.rowMock([[Mocks.widgetMock()]]),
]);

function createComponent(customProps: Partial<IDashboardEditLayoutProps> = {}) {
    return render(
        <IntlWrapper>
            <RenderDashboardEditLayout layout={dashboardEditLayout} {...customProps} />
        </IntlWrapper>,
    );
}

describe("DashboardEditLayout in KD", () => {
    it("should render layout in KD old edit mode - layout must not have dependency on SDK state, use selectors, context...", () => {
        const { container } = createComponent();

        expect(container.getElementsByClassName("gd-dashboards")).toHaveLength(1);
    });
});
