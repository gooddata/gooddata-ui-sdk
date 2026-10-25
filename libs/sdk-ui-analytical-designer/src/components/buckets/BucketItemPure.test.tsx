// (C) 2007-2026 GoodData Corporation

import { type ComponentProps } from "react";

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ATTRIBUTE, METRIC } from "../../constants/bucket.js";
import { type IBucketItemProps, buildBucketItem } from "../../models/bucket_item.js";
import { newDecoratedBucketItem } from "../../models/decorated_bucket_item.js";
import { rootReducer } from "../../reducers/root_reducer.js";
import { type IBucketSequenceNumbers } from "../../selectors/measure_sequence_numbers_selector.js";
import {
    setAboutToBeRemovedBucketAndFilterItems,
    setHighlightedBucketItems,
} from "../../store/highlighting/highlighting_actions.js";
import { type IAppState } from "../../store/types.js";
import { itemCache } from "../../tests/constants.test.helpers.js";
import { createDecoratedBucketMock } from "../../tests/decorated_bucket.test.helpers.js";
import { withData, withRoot } from "../../tests/state_builder.test.helpers.js";
import { type IDecoratedBucketItem, type IDecoratedBucketItems } from "../../typings/buckets.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import { BucketItemPure, getBucketItemIdClassName } from "./BucketItemPure.js";

describe("BucketItemPure", () => {
    const itemCachePlain = itemCache;

    function getSetupStateFunction(
        measureBucketItems: IDecoratedBucketItems,
        highlightedMeasureLocalIdentifier: string[],
        aboutToBeRemovedItemsLocalIdentifier: string[],
    ) {
        const originalMeasureBucketItems = measureBucketItems.map(
            (bucketItem: IDecoratedBucketItem) => bucketItem.original,
        );
        const bucket = {
            localIdentifier: "measures",
            items: originalMeasureBucketItems,
        };
        const buckets = [bucket];

        return function setupState(state: IAppState) {
            const setHighlightedBucketItemsAction = setHighlightedBucketItems(
                highlightedMeasureLocalIdentifier,
            );
            let updatedState = rootReducer(state, setHighlightedBucketItemsAction);

            const setAboutToBeRemovedBucketAndFilterItemsAction = setAboutToBeRemovedBucketAndFilterItems(
                aboutToBeRemovedItemsLocalIdentifier,
            );
            updatedState = rootReducer(updatedState, setAboutToBeRemovedBucketAndFilterItemsAction);

            return withData(
                withData(withRoot(updatedState, { projectId: "my project" }), { buckets: buckets }),
                { itemCache: itemCachePlain },
            );
        };
    }

    function getBucketItem(props: IBucketItemProps) {
        const item = buildBucketItem(props);
        const bucket = { localIdentifier: "measures", items: [item] };
        const buckets = [bucket];

        return createDecoratedBucketMock(buckets).items[0];
    }

    function renderComponent(
        renderedMeasureLocalIdentifier: string,
        bucketItemsProps: IBucketItemProps[],
        otherProps: Partial<ComponentProps<typeof BucketItemPure>> & {
            highlightedMeasureLocalIdentifier?: string[];
            aboutToBeRemovedBucketAndFilterItems?: string[];
        } = {},
    ) {
        const allBucketItems = bucketItemsProps.map((itemProps) => getBucketItem(itemProps));
        const bucketItem = allBucketItems.find(
            (item: IDecoratedBucketItem) => item.localIdentifier === renderedMeasureLocalIdentifier,
        );
        const { highlightedMeasureLocalIdentifier, aboutToBeRemovedBucketAndFilterItems } = otherProps;

        const setupState = getSetupStateFunction(
            allBucketItems,
            highlightedMeasureLocalIdentifier,
            aboutToBeRemovedBucketAndFilterItems,
        );
        const Wrapped = withIntl(withRedux(BucketItemPure, setupState));

        return render(<Wrapped bucketItem={bucketItem} {...otherProps} />);
    }

    const defaultBucketItemsProps = [
        {
            localIdentifier: "m1",
            attribute: "fact.spend_analysis.cart_additions",
            type: METRIC,
            aggregation: "sum",
        },
    ];

    it("should render SimpleBucketItem when the bucket item is not a measure", () => {
        const { container } = renderComponent("m1", [
            {
                localIdentifier: "m1",
                attribute: "attr.product.id",
                type: ATTRIBUTE,
            },
        ]);

        const simpleBucketItemElement = document.querySelectorAll(".s-bucket-item-header");

        expect(simpleBucketItemElement.length).toBe(1);
        expect(container.querySelector(".s-bucket-item")).toHaveClass("s-id-attr_product_id");
    });

    it("should render MeasureBucketItem when the bucket item is measure", () => {
        const { container } = renderComponent("m1", [
            {
                localIdentifier: "m1",
                attribute: "aaeFKXFYiCc0",
                type: METRIC,
            },
        ]);

        const measureBucketItemElement = document.querySelectorAll(".s-bucket-item-header");

        expect(measureBucketItemElement.length).toBe(1);
        expect(container.querySelector(".s-bucket-item")).toHaveClass("s-id-aaefkxfyicc0");
    });

    it("should render MeasureBucketItem when the bucket item is fact-based measure", () => {
        const { container } = renderComponent("m1", defaultBucketItemsProps);

        const measureBucketItemElement = document.querySelectorAll(".s-bucket-item-header");

        expect(measureBucketItemElement.length).toBe(1);
        expect(container.querySelector(".s-bucket-item")).toHaveClass(
            "s-id-fact_spend_analysis_cart_additions_generated",
        );
    });

    it("should render MeasureBucketItem when the bucket item is derived measure", () => {
        const { container } = renderComponent("m1", [
            {
                localIdentifier: "m1",
                masterLocalIdentifier: "m2",
                attribute: "aaeFKXFYiCc0",
                type: METRIC,
            },
        ]);
        const measureBucketItemElement = document.querySelectorAll(".s-bucket-item-header");

        expect(measureBucketItemElement.length).toBe(1);
        expect(container.querySelector(".s-bucket-item")).toHaveClass("s-id-aaefkxfyicc0");
    });

    it("should render ArithmeticMeasureBucketItem when the bucket item is arithmetic measure", () => {
        const { container } = renderComponent("m1", [
            {
                localIdentifier: "m1",
                operator: "sum",
                operandLocalIdentifiers: [null, null],
                type: METRIC,
            },
        ]);

        const arithmeticBucketItemElement = document.querySelectorAll(".s-bucket-item-header");

        expect(arithmeticBucketItemElement.length).toBe(1);
        const component = container.querySelector(".s-bucket-item");
        expect(component).toHaveClass("s-id-arithmetic_1");
        expect(component).toHaveClass("s-type-arithmetic");
        expect(component).toHaveClass("s-type-master");
    });

    it("should render MeasureBucketItem when the bucket item is derived from arithmetic measure", () => {
        const { container } = renderComponent("m3", [
            {
                localIdentifier: "m1",
                attribute: "aaeFKXFYiCc0",
                type: METRIC,
            },
            {
                localIdentifier: "m2",
                type: METRIC,
                operator: "sum",
                operandLocalIdentifiers: ["m1", "m1"],
            },
            {
                localIdentifier: "m3",
                type: METRIC,
                masterLocalIdentifier: "m2",
            },
        ]);

        const measureBucketItemElement = document.querySelectorAll(".s-bucket-item-header");

        expect(measureBucketItemElement.length).toBe(1);
        expect(container.querySelector(".s-bucket-item")).toHaveClass("s-id-derived_arithmetic_2");
    });

    it("should add expected test class name for rendered derived measure", () => {
        const { container } = renderComponent("m1", [
            {
                localIdentifier: "m1",
                masterLocalIdentifier: "m2",
                attribute: "fact.spend_analysis.cart_additions",
                type: METRIC,
                aggregation: "sum",
            },
        ]);
        expect(container.querySelector(".s-bucket-item")).toHaveClass("s-type-derived");
    });

    it("should add expected test class name for rendered master measure", () => {
        const { container } = renderComponent("m1", defaultBucketItemsProps);
        expect(container.querySelector(".s-bucket-item")).toHaveClass("s-type-master");
    });

    describe("'highlight' className", () => {
        it("should add className if bucket item is highlighted", () => {
            const { container } = renderComponent("m1", defaultBucketItemsProps, {
                highlightedMeasureLocalIdentifier: ["m1"],
            });
            expect(container.querySelector(".s-bucket-item")).toHaveClass("highlight");
        });

        it("should not add className if bucket item is not highlighted", () => {
            const { container } = renderComponent("m1", defaultBucketItemsProps, {
                highlightedMeasureLocalIdentifier: ["someLocalIdentifier"],
            });
            expect(container.querySelector(".s-bucket-item")).not.toHaveClass("highlight");
        });

        it("should not add className if no bucket item is highlighted", () => {
            const { container } = renderComponent("m1", defaultBucketItemsProps);
            expect(container.querySelector(".s-bucket-item")).not.toHaveClass("highlight");
        });
    });

    describe("'about-to-be-removed' className", () => {
        it("should add className if bucket item is about to be removed", () => {
            const { container } = renderComponent("m1", defaultBucketItemsProps, {
                aboutToBeRemovedBucketAndFilterItems: ["m1"],
            });
            expect(container.querySelector(".s-bucket-item")).toHaveClass("about-to-be-removed");
        });

        it("should not add className if bucket item is not about to be removed", () => {
            const { container } = renderComponent("m1", defaultBucketItemsProps, {
                aboutToBeRemovedBucketAndFilterItems: ["someLocalIdentifier"],
            });
            expect(container.querySelector(".s-bucket-item")).not.toHaveClass("about-to-be-removed");
        });

        it("should not add className if no bucket item is about to be removed", () => {
            const { container } = renderComponent("m1", defaultBucketItemsProps);
            expect(container.querySelector(".s-bucket-item")).not.toHaveClass("about-to-be-removed");
        });
    });

    describe("getBucketItemIdClassName", () => {
        it("should return correct class for dateBucketItem", () => {
            const bucketItem = newDecoratedBucketItem({
                isDate: true,
                localIdentifier: "date",
            });
            const expected = "s-id-date";
            const result = getBucketItemIdClassName(bucketItem, [bucketItem], {
                date: 0,
            } as IBucketSequenceNumbers);
            expect(result).toEqual(expected);
        });
        it("should return correct class for arithmeticMeasure", () => {
            const bucketItem = newDecoratedBucketItem({
                isArithmeticMeasure: true,
                localIdentifier: "m1",
            });
            const expected = "s-id-arithmetic_0";
            const result = getBucketItemIdClassName(bucketItem, [bucketItem], { m1: 0 });
            expect(result).toEqual(expected);
        });
        it("should return correct class for attribute", () => {
            const bucketItem = newDecoratedBucketItem({
                attribute: {
                    identifier: "some-id",
                },
                localIdentifier: "a1",
            });
            const expected = "s-id-some_id";
            const result = getBucketItemIdClassName(bucketItem, [bucketItem], { a1: 0 });
            expect(result).toEqual(expected);
        });
        it("should return correct class for derived from arithmetic", () => {
            const masterBucketItem = newDecoratedBucketItem({
                isArithmeticMeasure: true,
                localIdentifier: "am1",
            });
            const derivedBucketItem = newDecoratedBucketItem({
                isDerived: true,
                localIdentifier: "dm1",
                masterLocalIdentifier: "am1",
            });
            const expected = "s-id-derived_arithmetic_0";
            const result = getBucketItemIdClassName(
                derivedBucketItem,
                [masterBucketItem, derivedBucketItem],
                { am1: 0, dm1: 1 },
            );
            expect(result).toEqual(expected);
        });
    });
});
