// (C) 2007-2026 GoodData Corporation

import { type ComponentType } from "react";

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { METRIC } from "../../../../constants/bucket.js";
import { buildBucketItem } from "../../../../models/bucket_item.js";
import { type IAppState } from "../../../../store/types.js";
import { createDecoratedBucketMock } from "../../../../tests/decorated_bucket.test.helpers.js";
import { withAppState, withData, withRoot } from "../../../../tests/state_builder.test.helpers.js";
import { type IDecoratedBucketItem } from "../../../../typings/buckets.js";
import { getIntlOptions, withIntl } from "../../../../utils/with_intl.js";
import { withRedux } from "../../../../utils/with_redux.js";

import {
    ArithmeticMeasureBucketItem,
    type IArithmeticMeasureBucketItemProps,
} from "./ArithmeticMeasureBucketItem.js";

// Every test below renders the SAME bucket item against the SAME state, differing only in
// `isRenaming` and in the props handed to the component. Building the decorated item, the intl
// message map (~2.5k messages) and the redux store per test made each `it` pay for setup that
// cannot vary between them, so all of it is built once here and shared.
function createBucketItem(): IDecoratedBucketItem {
    const item = buildBucketItem({
        operator: "sum",
        operandLocalIdentifiers: [null, null],
        type: METRIC,
    });

    return createDecoratedBucketMock([{ localIdentifier: "measures", items: [item] }]).items[0];
}

const BUCKET_ITEM = createBucketItem();

const INTL_OPTIONS = getIntlOptions();

function getSetupStateFunction(isRenaming: boolean) {
    const bucket = { localIdentifier: "measures", items: [BUCKET_ITEM.original] };
    const buckets = [bucket];

    return function setupState(state: IAppState) {
        return withAppState(withData(withRoot(state, { projectId: "my project" }), { buckets: buckets }), {
            renamingBucketItem: isRenaming,
        });
    };
}

// One store (and one wrapper) per state variant instead of one per test — the store is only ever
// read by these tests, never dispatched to, so it is safe to share.
function createWrapper(isRenaming: boolean): ComponentType<IArithmeticMeasureBucketItemProps> {
    return withIntl(withRedux(ArithmeticMeasureBucketItem, getSetupStateFunction(isRenaming)), INTL_OPTIONS);
}

const Wrapped = createWrapper(false);
const WrappedRenaming = createWrapper(true);

describe("ArithmeticMeasureBucketItem", () => {
    function renderComponent(props: IArithmeticMeasureBucketItemProps, isRenaming = false) {
        const Component = isRenaming ? WrappedRenaming : Wrapped;
        return render(<Component {...props} />);
    }

    describe("rendering", () => {
        it("should render measure bucket item header", () => {
            const props = {
                bucketItem: BUCKET_ITEM,
                localIdentifier: "metrics",
            };

            const { container } = renderComponent(props);
            expect(container.querySelectorAll(".s-bucket-item-header")).toHaveLength(1);
        });

        it("should NOT render content when item is collapsed", () => {
            const props = { bucketItem: BUCKET_ITEM, localIdentifier: "metrics" };

            const { container } = renderComponent(props);

            expect(container.querySelectorAll(".s-adi-arithmetic-measure-configuration")).toHaveLength(0);
        });

        it("should render content when item is expanded", () => {
            const props = {
                bucketItem: { ...BUCKET_ITEM, collapsed: false },
            };

            const { container } = renderComponent(props);
            expect(container.querySelectorAll(".s-adi-arithmetic-measure-configuration")).toHaveLength(1);
        });
    });

    describe("draggable", () => {
        it("should be draggable when NOT renaming", () => {
            const connectDragSource = vi.fn();
            const props = {
                bucketItem: BUCKET_ITEM,
                localIdentifier: "measures",
                connectDragSource,
            };

            renderComponent(props);

            expect(connectDragSource).toBeCalled();
        });

        it("should NOT be draggable when renaming", () => {
            const connectDragSource = vi.fn();
            const props = {
                bucketItem: BUCKET_ITEM,
                localIdentifier: "measures",
                connectDragSource,
            };

            renderComponent(props, true);

            expect(connectDragSource).not.toBeCalled();
        });
    });
});
