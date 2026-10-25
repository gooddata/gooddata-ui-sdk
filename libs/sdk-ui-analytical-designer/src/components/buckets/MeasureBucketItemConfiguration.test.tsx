// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type ChartInlineVisualizationType } from "@gooddata/sdk-ui-ext";

import { METRIC } from "../../constants/bucket.js";
import { buildBucketItem } from "../../models/bucket_item.js";
import { type IAppState } from "../../store/types.js";
import { createDecoratedBucketMock } from "../../tests/decorated_bucket.test.helpers.js";
import { withData, withRoot } from "../../tests/state_builder.test.helpers.js";
import {
    type IDecoratedBucket,
    type IDecoratedBucketItem,
    type IRawBucketItem,
} from "../../typings/buckets.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import { MeasureBucketItemConfiguration } from "./MeasureBucketItemConfiguration.js";

describe("MeasureBucketItemConfiguration", () => {
    let decoratedBucket: IDecoratedBucket;
    let item: IRawBucketItem;
    let onSetAttributeAggregation: (item: IRawBucketItem, aggregation: string) => void;

    function setupProjectId() {
        return (state: IAppState) =>
            withRoot(withRoot(state, { projectId: "my project" }), {
                featureFlags: {
                    approximateCountAvailable: true,
                },
            });
    }

    function renderComponent(_item: IDecoratedBucketItem) {
        const Wrapped = withRedux(withIntl(MeasureBucketItemConfiguration), setupProjectId());
        return render(
            <Wrapped
                bucketItem={_item}
                localIdentifier={"measures"}
                onSetAttributeAggregation={onSetAttributeAggregation}
                allowMetricVisualizations={false}
                disableMeasureFilters={false}
                supportedMetricVisualizationTypes={[]}
            />,
        );
    }

    beforeEach(() => {
        item = buildBucketItem({
            attribute: "fact.spend_analysis.cart_additions",
            aggregation: "count",
            type: METRIC,
        });

        const bucket = { localIdentifier: "measures", items: [item] };
        const buckets = [bucket];

        decoratedBucket = createDecoratedBucketMock(buckets);
        onSetAttributeAggregation = vi.fn();
    });

    function getAttributeMeasureBucketItem(): IDecoratedBucketItem {
        const attributeMeasureItem = buildBucketItem({
            attribute: "attr.product.id",
            aggregation: "count",
            type: METRIC,
        });
        const bucket = { localIdentifier: "measures", items: [attributeMeasureItem] };
        const buckets = [bucket];
        const decoratedAttributeBucket = createDecoratedBucketMock(buckets);

        return decoratedAttributeBucket.items[0];
    }

    function getComputedAttributeMeasureBucketItem(): IDecoratedBucketItem {
        const computedAttributeMeasureItem = buildBucketItem({
            attribute: "rep_performance",
            aggregation: "count",
            type: METRIC,
            isComputedAttribute: true,
        });
        const buckets = [{ localIdentifier: "measures", items: [computedAttributeMeasureItem] }];

        return createDecoratedBucketMock(buckets).items[0];
    }

    it("labels a computed-attribute measure the same way an attribute one is labelled", () => {
        // the decorated item resolves to the CA cache entry, whose type is `computedAttribute` — so
        // reading the raw type here would match neither the fact nor the attribute branch and the
        // configuration would render no "Count of" label at all
        const { container } = renderComponent(getComputedAttributeMeasureBucketItem());

        expect(container.querySelector("select.s-fact-aggregation-switch")).toBeNull();
        expect(container).toHaveTextContent("Count");
    });

    it("triggers onSetAttributeAggregation when user selects aggregation", () => {
        const { container } = renderComponent(decoratedBucket.items[0]);

        fireEvent.change(container.querySelector("select.s-fact-aggregation-switch"), {
            target: { value: "avg" },
        });
        expect(onSetAttributeAggregation).toHaveBeenCalledWith(item, "avg");
    });

    it("keeps attribute-backed measures on the static count path", () => {
        const { container } = renderComponent(getAttributeMeasureBucketItem());

        expect(container.querySelector("select.s-fact-aggregation-switch")).toBeNull();
        expect(container).toHaveTextContent("Count");
    });

    it("renders the inline visualization select from the properties state", () => {
        const bucketItem = decoratedBucket.items[0];
        const seedState = (state: IAppState) =>
            withData(setupProjectId()(state), {
                visualizationProperties: {
                    inlineVisualizations: { [bucketItem.localIdentifier]: { type: "line" } },
                },
            });
        const Wrapped = withRedux(withIntl(MeasureBucketItemConfiguration), seedState);
        const { container } = render(
            <Wrapped
                bucketItem={bucketItem}
                localIdentifier={"measures"}
                onSetAttributeAggregation={onSetAttributeAggregation}
                allowMetricVisualizations
                disableMeasureFilters={false}
                supportedMetricVisualizationTypes={
                    ["metric", "line", "column"] as ChartInlineVisualizationType[]
                }
            />,
        );

        expect(container.querySelector(".s-metric-visualization-select-item-line")).toHaveClass("is-active");
        expect(container.querySelector(".s-metric-visualization-select-item-metric")).not.toHaveClass(
            "is-active",
        );
    });
});
