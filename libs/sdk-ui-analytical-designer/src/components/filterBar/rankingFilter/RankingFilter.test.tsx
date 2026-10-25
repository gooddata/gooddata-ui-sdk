// (C) 2020-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { withIntl } from "../../../utils/with_intl.js";

import { type IRankingFilterProps, RankingFilter, getButtonModel } from "./RankingFilter.js";
import {
    attributeItems,
    measureItems,
    measureItemsWithSequence,
    rankingFilterWithAttributes,
    rankingFilterWithoutAttributes,
} from "./RankingFilter.test.helpers.js";

const defaultProps: IRankingFilterProps = {
    filter: rankingFilterWithoutAttributes,
    measureItems: measureItems,
    attributeItems: attributeItems,
    onApply: () => {},
    onCancel: () => {},
};

describe("RankingFilter", () => {
    it("should toggle ranking filter dropdown on button click", () => {
        const Wrapped = withIntl(RankingFilter);
        const { container } = render(<Wrapped {...defaultProps} />);

        const button = container.querySelector(".s-rf-dropdown-toggle-button");

        expect(document.querySelector(".s-rf-dropdown-body")).toBeFalsy();
        fireEvent.click(button);
        expect(document.querySelector(".s-rf-dropdown-body")).toBeTruthy();
    });

    describe("getButtonModel", () => {
        it("should return button values without attributeTitle", () => {
            const result = getButtonModel(rankingFilterWithoutAttributes, measureItems, attributeItems);

            expect(result).toEqual({
                operator: "TOP",
                value: 10,
                measureTitle: "Measure 1",
            });
        });

        it("should return button values with attributeTitle", () => {
            const result = getButtonModel(rankingFilterWithAttributes, measureItems, attributeItems);

            expect(result).toEqual({
                operator: "TOP",
                value: 10,
                measureTitle: "Measure 1",
                attributeTitle: "Attribute 1",
            });
        });

        it("should return button values with measureSequence", () => {
            const result = getButtonModel(
                rankingFilterWithoutAttributes,
                measureItemsWithSequence,
                attributeItems,
            );

            expect(result).toEqual({
                operator: "TOP",
                value: 10,
                measureTitle: "Measure 1",
                measureSequence: "M1",
            });
        });

        it("should not throw when the ranked measure is not in measureItems", () => {
            // Catalog-backed ranking filter whose measure is missing from measureItems
            // (e.g. enableImprovedRankingFilter off or the catalog still loading).
            const result = getButtonModel(rankingFilterWithoutAttributes, [], attributeItems);

            expect(result).toEqual({
                operator: "TOP",
                value: 10,
                measureTitle: "",
            });
        });
    });
});
