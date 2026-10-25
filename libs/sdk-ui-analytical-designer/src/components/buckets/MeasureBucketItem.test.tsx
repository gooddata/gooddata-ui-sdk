// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { buildBucketItem } from "../../models/bucket_item.js";
import { type IAppState } from "../../store/types.js";
import { createDecoratedBucketMock } from "../../tests/decorated_bucket.test.helpers.js";
import { withRoot } from "../../tests/state_builder.test.helpers.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import { type IMeasureBucketItemProps, MeasureBucketItemBase } from "./MeasureBucketItem.js";

describe("MeasureBucketItem", () => {
    const defaultProps: IMeasureBucketItemProps = {
        requestCatalogItemTooltipDetails: vi.fn(),
        setBucketItemAggregation: vi.fn(),
        toggleBucketItemExpanded: vi.fn(),
        bucketItem: null,
        isRenamingBucketItem: false,
        localIdentifier: "localId",
        allowMetricVisualizations: false,
        disableMeasureFilters: false,
        supportedMetricVisualizationTypes: [],
    };

    function setupProjectId(state: IAppState) {
        return withRoot(state, { projectId: "my project" });
    }

    function renderComponent(props: Partial<IMeasureBucketItemProps>) {
        const Wrapped = withIntl(withRedux(MeasureBucketItemBase, setupProjectId));
        return render(<Wrapped {...defaultProps} {...props} />);
    }

    function getBucketItem(bucketItemConfig = {}) {
        const attribute = "fact.spend_analysis.cart_additions";
        const item = buildBucketItem({ attribute, type: "metric", aggregation: "sum", ...bucketItemConfig });
        const bucket = { localIdentifier: "measures", items: [item] };
        const buckets = [bucket];
        return createDecoratedBucketMock(buckets).items[0];
    }

    it("should render header", () => {
        const props = { bucketItem: getBucketItem(), localIdentifier: "metrics" };
        renderComponent(props);
        expect(document.querySelector(".s-bucket-item-header")).toBeInTheDocument();
    });

    describe("configuration", () => {
        it("should NOT render content when item is collapsed", () => {
            const props = { bucketItem: getBucketItem(), localIdentifier: "metrics" };
            renderComponent(props);
            expect(document.querySelector(".s-metric-bucket-item-configuration")).not.toBeInTheDocument();
        });

        it("should render content when item is expanded", () => {
            const props = {
                bucketItem: { ...getBucketItem(), collapsed: false, aggregation: "count" },
            };
            renderComponent(props);
            expect(document.querySelector(".s-metric-bucket-item-configuration")).toBeInTheDocument();
        });
    });

    it("should trigger setBucketItemAggregation on select change", () => {
        const setBucketItemAggregation = vi.fn();
        const props = {
            bucketItem: { ...getBucketItem(), collapsed: false, aggregation: "count" },
            setBucketItemAggregation,
            localIdentifier: "measures",
        };
        renderComponent(props);

        const event = { target: { value: "sum" } };
        fireEvent.change(document.querySelector("select.s-fact-aggregation-switch"), event);

        expect(setBucketItemAggregation).toHaveBeenCalledTimes(1);
    });

    describe("draggable", () => {
        it("should be decorated draggable when NOT renaming", () => {
            const connectDragSource = vi.fn();
            const props = {
                bucketItem: getBucketItem(),
                localIdentifier: "measures",
                connectDragSource,
            };

            renderComponent(props);

            expect(connectDragSource).toBeCalled();
        });

        it("should NOT be decorated draggable when renaming", () => {
            const connectDragSource = vi.fn();
            const props = {
                bucketItem: getBucketItem(),
                localIdentifier: "measures",
                connectDragSource,
                isRenamingBucketItem: true,
            };

            renderComponent(props);

            expect(connectDragSource).not.toBeCalled();
        });
    });
});
