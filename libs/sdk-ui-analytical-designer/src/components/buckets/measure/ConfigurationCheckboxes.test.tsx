// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ATTRIBUTE } from "../../../constants/bucket.js";
import { newDecoratedBucketItem } from "../../../models/decorated_bucket_item.js";
import { withIntl } from "../../../utils/with_intl.js";

import {
    ConfigurationCheckboxesBase,
    type IConfigurationCheckboxesProps,
} from "./ConfigurationCheckboxes.js";

describe("ConfigurationCheckboxes", () => {
    const itemLocalIdentifier = "localIdentifier";
    const item = { localIdentifier: itemLocalIdentifier };
    const localIdentifier = "id";

    const bucketItem = newDecoratedBucketItem({
        original: item,
        showInPercent: false,
        localIdentifier,
    });

    function renderComponent(customProps = {}) {
        const props: IConfigurationCheckboxesProps = {
            bucketItem,
            bucketLocalIdentifier: "localIdentifier",
            isShowInPercentDisabled: true,
            isShowInPercentVisible: true,
            isShowInPercentChecked: false,
            isShowOnSecondaryAxisVisible: true,
            isShowOnSecondaryAxisChecked: false,
            isTotalMeasureChecked: false,
            isTotalMeasureEnabled: false,
            isTotalMeasureVisible: false,
            secondaryAxisCheckboxLabel: "dashboard.bucket_item.show_on_right_axis",
            setBucketItemShowInPercent: () => {},
            setBucketItemShowOnSecondaryAxis: () => {},
            onSetAttributeAggregation: () => {},
            setBucketItemIsTotalMeasure: () => {},
            isThresholdMeasureChecked: false,
            isThresholdMeasureDisabled: false,
            isThresholdMeasureVisible: false,
            setBucketItemIsThresholdMeasure: () => {},
            measuresCount: 2,
            isApproxCountEnabled: false,
            ...customProps,
        };
        const Wrapped = withIntl(ConfigurationCheckboxesBase);

        return render(<Wrapped {...props} />);
    }

    describe("actions", () => {
        it("should trigger setBucketItemShowOnSecondaryAxis when user clicks checkbox", () => {
            const setBucketItemShowOnSecondaryAxis = vi.fn();
            renderComponent({ setBucketItemShowOnSecondaryAxis });
            const checkbox = document.querySelector(".s-show-on-secondary-axis");

            fireEvent.click(checkbox);
            expect(setBucketItemShowOnSecondaryAxis).toHaveBeenCalledWith(localIdentifier, true);
        });

        it("should keep legacy approximate count checkbox behavior for attribute-backed measures", () => {
            const onSetAttributeAggregation = vi.fn();
            const attributeBucketItem = { ...bucketItem, attribute: { type: ATTRIBUTE } };

            renderComponent({
                bucketItem: attributeBucketItem,
                isApproxCountEnabled: true,
                onSetAttributeAggregation,
            });

            const checkbox = document.querySelector(".s-approximate-count");

            fireEvent.click(checkbox);
            expect(onSetAttributeAggregation).toHaveBeenCalledWith(item, "approximate_count");
        });
    });

    describe("disabling checkboxes", () => {
        it("should disable in percent", () => {
            renderComponent({ isShowInPercentDisabled: true });

            const checkbox = document.querySelector(".s-show-in-percent");
            expect(checkbox).toBeDisabled();
        });
    });

    describe("hiding checkboxes", () => {
        it("should hide show in percent checkbox", () => {
            renderComponent({ isShowInPercentVisible: false });
            const checkbox = document.querySelectorAll(".s-show-in-percent");

            expect(checkbox.length).toBe(0);
        });
    });

    describe("checkbox checked", () => {
        describe("show in percent", () => {
            it("checked state", () => {
                renderComponent({ isShowInPercentChecked: true });

                const checkbox = document.querySelector(".s-show-in-percent");
                expect(checkbox).toBeChecked();
            });
        });
    });
});
