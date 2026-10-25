// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { buildBucketItem } from "../../models/bucket_item.js";
import { measureBucketItems, setupAppStateWithDateDatasetMeta } from "../../tests/constants.test.helpers.js";
import { createDecoratedBucketsMock } from "../../tests/decorated_bucket.test.helpers.js";
import { withDragDrop } from "../../utils/with_drag_drop_context.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import { BucketContent } from "./BucketContent.js";

vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../AttributeFilter/AttributeFilter", () => ({
    default: vi.fn(() => <div className="s-filter-button" />),
}));

describe("BucketContent", () => {
    const items = measureBucketItems.filter((x) => !!x.attribute);
    const bucket = {
        localIdentifier: "measures",
        items: items.map(buildBucketItem),
    };

    const buckets = [bucket];
    const decoratedBuckets = createDecoratedBucketsMock(buckets);
    const decoratedBucket = decoratedBuckets[0];

    it("should render all measures", () => {
        const BucketContentWithRedux = withRedux(
            withDragDrop(withIntl(BucketContent)),
            setupAppStateWithDateDatasetMeta,
        );

        const { container } = render(
            <BucketContentWithRedux buckets={decoratedBuckets} bucket={decoratedBucket} />,
        );

        expect(container.querySelectorAll(".s-bucket-item").length).toBe(bucket.items.length);
    });
});
