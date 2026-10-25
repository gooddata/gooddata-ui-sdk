// (C) 2020-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { tableVisualizationClass } from "../../tests/constants.test.helpers.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import { BucketsPanel, type IBucketsPanelProps } from "./BucketsPanel.js";

vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../components/buckets/notifications/BucketNotifications", () => ({
    BucketNotifications: () => <div className="s-bucket-notifications" />,
}));

describe("BucketsPanel", () => {
    it("should render BucketNotifications", () => {
        const props: IBucketsPanelProps = {
            visualizationClass: tableVisualizationClass,
            configurationPanelCollapsed: true,
        };
        const Component = withIntl(withRedux(BucketsPanel));
        const { container } = render(<Component {...props} />);
        expect(container.querySelectorAll(".s-bucket-notifications")).toHaveLength(1);
    });
});
