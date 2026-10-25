// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { buildBucketItem } from "../../models/bucket_item.js";
import { EMPTY_BUCKET_LABEL } from "../../models/decorated_bucket.js";
import {
    defaultVisualizationClasses,
    measureBucketItems,
    setupAppStateWithDateDatasetMeta,
} from "../../tests/constants.test.helpers.js";
import { createDecoratedBucketsMock } from "../../tests/decorated_bucket.test.helpers.js";
import {
    type IDecoratedBucket,
    type IDecoratedBuckets,
    type IRawBucketItems,
} from "../../typings/buckets.js";
import { withDragDrop } from "../../utils/with_drag_drop_context.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import { Bucket } from "./Bucket.js";

describe("Bucket", () => {
    const measuresBucket = {
        localIdentifier: "measures",
        items: measureBucketItems.slice(0, 2).map(buildBucketItem),
    };

    const emptyBucket = {
        localIdentifier: "attribute",
        items: [] as IRawBucketItems,
    };

    const Wrapped = withRedux(withDragDrop(withIntl(Bucket)), setupAppStateWithDateDatasetMeta);

    function renderComponent(bucket: IDecoratedBucket, buckets: IDecoratedBuckets) {
        return render(
            <Wrapped
                buckets={buckets}
                bucket={bucket}
                configurationPanelCollapsed
                setConfigurationPanelCollapsed={() => {}}
                visualizationClass={defaultVisualizationClasses[1]}
            />,
        );
    }

    describe("single bucket", () => {
        const buckets = [measuresBucket];
        const decoratedBuckets = createDecoratedBucketsMock(buckets);
        const decoratedBucket = decoratedBuckets[0];

        it("should render bucket items", () => {
            renderComponent(decoratedBucket, decoratedBuckets);

            expect(document.querySelector(".s-bucket-item")).toBeInTheDocument();
        });

        it("shouldn't render subtitle for only one bucket", () => {
            renderComponent(decoratedBucket, decoratedBuckets);

            expect(document.querySelector(".bucket-subtitle")).not.toBeInTheDocument();
        });
    });

    describe("multiple buckets", () => {
        const buckets = [measuresBucket, emptyBucket];
        const decoratedBuckets = createDecoratedBucketsMock(buckets);
        const decoratedBucket = decoratedBuckets[0];

        it("should render subtitle for more than one bucket", () => {
            const decoratedBucketWithSubtitle = { ...decoratedBucket, subtitle: "subtitle1" };

            renderComponent(decoratedBucketWithSubtitle, decoratedBuckets);

            expect(document.querySelector(".bucket-subtitle")).toBeInTheDocument();
        });

        it("shouldn't render the empty-value sentinel as a subtitle", () => {
            const decoratedBucketWithSentinel = { ...decoratedBucket, subtitle: EMPTY_BUCKET_LABEL };

            renderComponent(decoratedBucketWithSentinel, decoratedBuckets);

            expect(document.querySelector(".bucket-subtitle")).not.toBeInTheDocument();
        });
    });
});
