// (C) 2026 GoodData Corporation

import { screen } from "@testing-library/react";
import { setGlobalDevModeChecks } from "reselect";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { newDecoratedBucket } from "../../models/decorated_bucket.js";
import { newDecoratedBucketItem } from "../../models/decorated_bucket_item.js";
import { type IDecoratedBucketItem } from "../../typings/buckets.js";

import { DraggableBucketItem, type DraggableBucketItemProps } from "./DraggableBucketItem.js";
import { render } from "./render.test.utils.js";

/**
 * There is a precedence in other components and tests for the "An input selector returned a different result when passed same arguments" warnings.
 * The following only turns this warning off for this test suite so that vitest watch mode is not cluttered here (test-once runs with --silent=true).
 */
beforeAll(() => {
    setGlobalDevModeChecks({ inputStabilityCheck: "never" });
    return () => setGlobalDevModeChecks({ inputStabilityCheck: "once" });
});

function createDecoratedBucketItem(overrides: Partial<IDecoratedBucketItem> = {}) {
    return newDecoratedBucketItem({
        attribute: {},
        original: {},
        ...overrides,
    });
}

const requiredProps = {
    bucket: newDecoratedBucket(),
    bucketItem: createDecoratedBucketItem(),
    index: 1,
    onStartBucketItemDrag: () => {},
    onEndBucketItemDrag: () => {},
} satisfies DraggableBucketItemProps;

describe("DraggableBucketItem", () => {
    it("should allow proper text selection and cursor placement", async () => {
        const bucketItem = createDecoratedBucketItem({ isMeasure: true, label: "Some bucket item" });
        const { user } = render(<DraggableBucketItem {...requiredProps} bucketItem={bucketItem} />);

        await user.click(screen.getByRole("button", { name: "Some bucket item" }));
        // Selects "bucket" text inside "Some bucket item"
        await user.pointer([
            { target: screen.getByDisplayValue("Some bucket item"), keys: "[MouseLeft>]", offset: 5 },
            { offset: 11 },
        ]);
        await user.keyboard("CHANGED");

        expect(screen.getByDisplayValue("Some CHANGED item")).toBeVisible();
    });

    it("should not trigger dragging if clicked outside of editable label and then clicked back on it", async () => {
        const bucketItem = createDecoratedBucketItem({
            isMeasure: true,
            label: "Some bucket item",
            alias: "<some alias>", // Alias is need for subtitle to appear
            measureTitle: "Bucket subtitle",
        });
        const onStartBucketItemDrag = vi.fn();
        const { user } = render(
            <DraggableBucketItem
                {...requiredProps}
                bucketItem={bucketItem}
                onStartBucketItemDrag={onStartBucketItemDrag}
            />,
        );

        /**
         * NOTE: Clicking outside of the editable label first (but still in the bucket - for example on the subtitle)
         * in the line below is crucial to reproduce some failing behaviors. Do not delete this line.
         */
        await user.click(screen.getByText("Bucket subtitle"));
        // Simulate dragging
        await user.pointer([
            { target: screen.getByRole("button", { name: "Some bucket item" }), keys: "[MouseLeft>]" },
            { coords: { x: 100, y: 10 } },
        ]);

        expect(onStartBucketItemDrag).not.toHaveBeenCalled();
    });
});
