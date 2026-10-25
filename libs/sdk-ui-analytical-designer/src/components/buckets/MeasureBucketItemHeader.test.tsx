// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { RawIntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { METRIC } from "../../constants/bucket.js";
import { buildBucketItem } from "../../models/bucket_item.js";
import { createDecoratedBucketMock } from "../../tests/decorated_bucket.test.helpers.js";
import { mockIntlProp } from "../../utils/with_intl.js";

import {
    type IMeasureBucketItemHeaderProps,
    MeasureBucketItemHeaderBase,
} from "./MeasureBucketItemHeader.js";

describe("MeasureBucketItemHeader", () => {
    const defaultProps: IMeasureBucketItemHeaderProps = {
        onToggleCollapse: () => {},
        onBucketItemRename: () => {},
        renamingBucketItemStarted: () => {},
        renamingBucketItemEnded: () => {},
        measureSequenceNumbers: {},
        isRenamingBucketItem: false,
        isCollapsed: false,
        bucketItem: null,
        filters: null,
    };

    function renderComponent(props: Partial<IMeasureBucketItemHeaderProps> = {}) {
        return render(
            <RawIntlProvider value={mockIntlProp()}>
                <MeasureBucketItemHeaderBase {...defaultProps} {...props} />
            </RawIntlProvider>,
        );
    }

    function getBucketItem(bucketItemConfig = {}) {
        const item = buildBucketItem({
            attribute: "fact.spend_analysis.cart_additions",
            ...bucketItemConfig,
            aggregation: "sum",
            type: METRIC,
        });

        const bucket = { localIdentifier: "measures", items: [item] };
        const buckets = [bucket];

        return createDecoratedBucketMock(buckets).items[0];
    }

    describe("title", () => {
        it("should render given title when no alias", () => {
            const { container } = renderComponent({ bucketItem: getBucketItem() });
            const bucketItemTitle = container.querySelector(".gd-editable-label");

            expect(bucketItemTitle.textContent).toEqual("Sum of Cart Additions");
        });

        it("should render given title when alias empty string", () => {
            const { container } = renderComponent({ bucketItem: getBucketItem({ alias: "" }) });
            const bucketItemTitle = container.querySelector(".gd-editable-label");

            expect(bucketItemTitle.textContent).toEqual("Sum of Cart Additions");
        });

        it("should render alias when not empty string", () => {
            const alias = "My Alias";
            const { container } = renderComponent({ bucketItem: getBucketItem({ alias }) });
            const bucketItemTitle = container.querySelector(".gd-editable-label");

            expect(bucketItemTitle.textContent).toEqual(alias);
        });

        it("should limit title to 50 characters", () => {
            const alias = "x".repeat(100);
            const { container } = renderComponent({ bucketItem: getBucketItem({ alias }) });
            const bucketItemTitle = container.querySelector(".gd-editable-label");

            expect(bucketItemTitle.textContent.length).toBe(50);
        });
    });

    describe("renaming", () => {
        it('should NOT have "renaming" class when bucket item is in default state', () => {
            const { container } = renderComponent({ bucketItem: getBucketItem() });

            expect(container.querySelector(".s-bucket-item-header")).not.toHaveClass("renaming");
        });

        it('should NOT have "renaming" class when bucket item is NOT being renamed', () => {
            const { container } = renderComponent({
                bucketItem: getBucketItem(),
                isRenamingBucketItem: false,
            });

            expect(container.querySelector(".s-bucket-item-header")).not.toHaveClass("renaming");
        });

        it('should have "renaming" class when bucket item is being renamed', () => {
            const { container } = renderComponent({
                bucketItem: getBucketItem(),
                isRenamingBucketItem: true,
            });

            expect(container.querySelector(".s-bucket-item-header")).toHaveClass("renaming");
        });
    });

    describe("onToggleCollapse", () => {
        it("should be called on bucket item header click", () => {
            const onToggleCollapse = vi.fn();
            const { container } = renderComponent({
                bucketItem: getBucketItem(),
                onToggleCollapse,
            });

            fireEvent.click(container.querySelector(".s-bucket-item-header"));

            expect(onToggleCollapse).toHaveBeenCalledTimes(1);
        });
    });

    describe("measure sequence numbers", () => {
        const measureSequenceNumbers = {
            m1: 1,
            m1_derived: 2,
            m2: 3,
        };

        function getMasterMeasureBucketItem() {
            return getBucketItem({
                localIdentifier: "m1",
            });
        }

        function getDerivedMeasureBucketItem(additionalProperties = {}) {
            return getBucketItem({
                localIdentifier: "m1_derived",
                masterLocalIdentifier: "m1",
                overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                ...additionalProperties,
            });
        }

        it("should render measure sequence number", () => {
            const { container } = renderComponent({
                bucketItem: getMasterMeasureBucketItem(),
                measureSequenceNumbers,
            });
            const sequenceNumberElement = container.querySelector(".s-bucket-item-sequence-number");
            const subtitleElement = container.querySelector(".s-bucket-item-sub-header");

            expect(sequenceNumberElement).toBeInTheDocument();
            expect(sequenceNumberElement.textContent).toEqual("M1");
            expect(subtitleElement).not.toBeInTheDocument();
        });

        it("should not render measure sequence number when it is not avalable", () => {
            const { container } = renderComponent({
                bucketItem: getMasterMeasureBucketItem(),
                measureSequenceNumbers: {},
            });
            const sequenceNumberElement = container.querySelector(".s-bucket-item-sequence-number");
            const subtitleElement = container.querySelector(".s-bucket-item-sub-header");

            expect(sequenceNumberElement).not.toBeInTheDocument();
            expect(subtitleElement).not.toBeInTheDocument();
        });

        it("should render sequence number of master in the subtitle for derived measure", () => {
            const { container } = renderComponent({
                bucketItem: getDerivedMeasureBucketItem(),
                measureSequenceNumbers,
            });
            const subtitleElement = container.querySelector(".s-bucket-item-sub-header");

            expect(subtitleElement.textContent).toEqual("from M1; ");
        });

        it("should render original title and sequence number of master for renamed derived measure", () => {
            // measureTitle is a decoration computed from measuresDescriptions, so set it
            // directly on the decorated item
            const { container } = renderComponent({
                bucketItem: {
                    ...getDerivedMeasureBucketItem({ alias: "Measure alias" }),
                    measureTitle: "Derived measure title",
                },
                measureSequenceNumbers,
            });
            const subtitleElement = container.querySelector(".s-bucket-item-sub-header");

            expect(subtitleElement.textContent).toEqual("from M1; Derived measure title");
        });

        it("should not render sequence number of master for derived measure when the master sequence number is not available", () => {
            const { container } = renderComponent({
                bucketItem: getDerivedMeasureBucketItem(),
                measureSequenceNumbers: {
                    m1_derived: 2,
                },
            });
            const subtitleElement = container.querySelectorAll(".s-bucket-item-sub-header");

            expect(subtitleElement.length).toEqual(0);
        });

        it("should render sequence numbers of operands in the subtitle for arithmetic measure", () => {
            const { container } = renderComponent({
                bucketItem: getBucketItem({
                    localIdentifier: "am1",
                    operator: "sum",
                    operandLocalIdentifiers: ["m1", "m2"],
                }),
                measureSequenceNumbers,
            });

            const subtitleElement = container.querySelector(".s-bucket-item-sub-header");
            expect(subtitleElement.textContent).toEqual("from M1, M3; ");
        });

        it("should render sequence numbers of operands in the subtitle together with original title for renamed arithmetic measure", () => {
            // measureTitle is a decoration computed from measuresDescriptions, so set it
            // directly on the decorated item
            const bucketItem = {
                ...getBucketItem({
                    localIdentifier: "am1",
                    alias: "Arithmetic measure alias",
                    operator: "sum",
                    operandLocalIdentifiers: ["m1", "m2"],
                }),
                measureTitle: "Arithmetic measure title",
            };

            const { container } = renderComponent({
                bucketItem,
                measureSequenceNumbers,
            });

            const subtitleElement = container.querySelector(".s-bucket-item-sub-header");
            expect(subtitleElement.textContent).toEqual("from M1, M3; Arithmetic measure title");
        });

        it("should render sequence number of operand in the subtitle for incomplete arithmetic measure", () => {
            const { container } = renderComponent({
                bucketItem: getBucketItem({
                    localIdentifier: "am1",
                    operator: "sum",
                    operandLocalIdentifiers: [null, "m2"],
                }),
                measureSequenceNumbers,
            });

            const subtitleElement = container.querySelector(".s-bucket-item-sub-header");
            expect(subtitleElement.textContent).toEqual("from M3; ");
        });

        it("should not render sequence number of operand in the subtitle for empty arithmetic measure", () => {
            const { container } = renderComponent({
                bucketItem: getBucketItem({
                    localIdentifier: "am1",
                    operator: "sum",
                    operandLocalIdentifiers: [null, null],
                }),
                measureSequenceNumbers,
            });

            const subtitleElement = container.querySelectorAll(".s-bucket-item-sub-header");
            expect(subtitleElement.length).toEqual(0);
        });
    });

    describe("expand / collapse action", () => {
        it("should disable expand / collapse action for derived measures", () => {
            const onToggleCollapseMock = vi.fn();

            const { container } = renderComponent({
                bucketItem: getBucketItem({
                    masterLocalIdentifier: "localIdentifier",
                    overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                }),
                onToggleCollapse: onToggleCollapseMock,
            });

            expect(container.querySelectorAll(".expanded").length > 0).toEqual(false);
            expect(container.querySelectorAll(".collapsed").length > 0).toEqual(false);

            fireEvent.click(container.querySelector(".s-bucket-item-header"));

            expect(onToggleCollapseMock).toHaveBeenCalledTimes(0);
        });

        it("should enable expand / collapse action for master measures", () => {
            const onToggleCollapseMock = vi.fn();

            const { container } = renderComponent({
                bucketItem: getBucketItem(),
                onToggleCollapse: onToggleCollapseMock,
            });

            expect(container.querySelectorAll(".expanded").length > 0).toEqual(false);
            expect(container.querySelectorAll(".collapsed").length > 0).toEqual(true);

            fireEvent.click(container.querySelector(".s-bucket-item-header"));

            expect(onToggleCollapseMock).toHaveBeenCalledTimes(1);
        });
    });
});
