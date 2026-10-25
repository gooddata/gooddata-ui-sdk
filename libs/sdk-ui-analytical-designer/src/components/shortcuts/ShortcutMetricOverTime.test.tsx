// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { legacy_createStore as createStore } from "redux";
import { describe, expect, it, vi } from "vitest";

import { FACT } from "../../constants/bucket.js";
import type { shortcutMetricOverTimeSelector } from "../../selectors/shortcut_metric_over_time_selector.js";
import { type IDateDataset } from "../../typings/datasets.js";
import { withIntl } from "../../utils/with_intl.js";

import { ShortcutMetricOverTime } from "./ShortcutMetricOverTime.js";

vi.hoisted(() => {
    vi.resetModules();
});

/**
 * The component reads its date datasets through shortcutMetricOverTimeSelector; the tests drive
 * that selector directly instead of assembling a whole root state.
 */
type IStateProps = Partial<ReturnType<typeof shortcutMetricOverTimeSelector>>;

let stateProps: IStateProps;

vi.mock("../../selectors/shortcut_metric_over_time_selector.js", () => ({
    shortcutMetricOverTimeSelector: () => stateProps,
}));

describe("ShortcutMetricOverTime", () => {
    function renderComponent(customProps: { itemType?: string; title?: string } & IStateProps = {}) {
        const { areDateDatasetsLoaded = false, availableDateDatasets = [], ...ownProps } = customProps;

        stateProps = { areDateDatasetsLoaded, availableDateDatasets };

        const props = {
            itemType: "bar",
            title: FACT,
            ...ownProps,
        };

        const store = createStore((state: null = null) => state);
        const Wrapped = withIntl(ShortcutMetricOverTime);

        return render(
            <Provider store={store}>
                <Wrapped {...props} />
            </Provider>,
        );
    }

    describe("datasets were not loaded yet", () => {
        it("should render loading icon", () => {
            const { container } = renderComponent();
            expect(container.querySelectorAll(".s-loading")).toHaveLength(1);
        });
    });

    describe("no datasets were loaded", () => {
        it("should render cant be trended", () => {
            const { container } = renderComponent({
                areDateDatasetsLoaded: true,
            });
            expect(container.querySelectorAll(".s-cant-be-trended")).toHaveLength(1);
        });
    });

    describe("shortcut is ready", () => {
        it("should render decorated title if item is fact", () => {
            const { container } = renderComponent({
                title: "Some title",
                itemType: FACT,
                areDateDatasetsLoaded: true,
                availableDateDatasets: [{ foo: "bar" }] as unknown as IDateDataset[],
            });
            expect(container.querySelector("p").textContent).toContain("Sum of Some title");
        });
    });
});
