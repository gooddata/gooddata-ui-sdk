// (C) 2019-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { afterAll, describe, expect, it, vi } from "vitest";

import { bucketItemBase } from "../../../models/bucket_item.js";
import { rootReducer } from "../../../reducers/root_reducer.js";
import { type IRawBucketItems } from "../../../typings/buckets.js";
import { withIntl } from "../../../utils/with_intl.js";
import { withRedux } from "../../../utils/with_redux.js";

import { FilterBarDropdown } from "./FilterBarDropdown.js";

/**
 * The bucket contents and the ranking capability are driven through their selectors instead of
 * assembling a whole root state. The dropdown open state stays store driven, so clicking the filter
 * bar button goes through the real reducer.
 */
let isRankingFilterSupported: boolean;
let bucketMeasures: IRawBucketItems;
let bucketAttributes: IRawBucketItems;

vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../selectors/backend_capabilities_selector.js", async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    isRankingFilterSupported: () => isRankingFilterSupported,
}));

vi.mock("../../../services/buckets_service.js", async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    getMeasures: () => bucketMeasures,
    getAttributes: () => bucketAttributes,
}));

afterAll(() => {
    // Drop this file's mocked modules from the shared (isolate:false) registry so they do not leak into
    // sibling files that import the real ones.
    vi.resetModules();
});

const measureItems: IRawBucketItems = [
    {
        ...bucketItemBase,
        localIdentifier: "m1",
        bucketItemLocalIdentifiers: ["m5", "a1", "a2"],
        title: "Measure 1",
        id: "m1",
    },
];
const attributeItems: IRawBucketItems = [
    {
        ...bucketItemBase,
        localIdentifier: "a1",
        bucketItemLocalIdentifiers: ["a2"],
        title: "Attribute 1",
        id: "a1",
    },
];

interface ISelectorValues {
    isRankingFilterSupported?: boolean;
    bucketMeasures?: IRawBucketItems;
    bucketAttributes?: IRawBucketItems;
}

function renderComponent(selectorValues: ISelectorValues = {}) {
    isRankingFilterSupported = selectorValues.isRankingFilterSupported ?? false;
    bucketMeasures = selectorValues.bucketMeasures ?? measureItems;
    bucketAttributes = selectorValues.bucketAttributes ?? attributeItems;

    const Component = withIntl(withRedux(FilterBarDropdown, rootReducer));
    return render(<Component />);
}

describe("FilterBarDropdown", () => {
    it("should render filter bar button", () => {
        renderComponent();
        expect(document.querySelector(".s-filter-bar-button")).toBeInTheDocument();
    });

    it("should not render overlay when dropdown is closed", () => {
        renderComponent();
        expect(document.querySelector(".s-add-filter-dropdown")).not.toBeInTheDocument();
    });

    it("should render overlay when dropdown is opened", () => {
        renderComponent();
        fireEvent.click(document.querySelector(".s-filter-bar-button button"));
        expect(document.querySelector(".s-add-filter-dropdown")).toBeInTheDocument();
    });

    describe("ranking option visibility", () => {
        it("shows ranking menu item when supported and buckets are present", () => {
            renderComponent({
                isRankingFilterSupported: true,
            });
            fireEvent.click(document.querySelector(".s-filter-bar-button button"));
            expect(document.querySelector(".s-add-filter-menu-item-ranking")).toBeInTheDocument();
        });

        it("keeps ranking menu item when buckets are missing", () => {
            renderComponent({
                isRankingFilterSupported: true,
                bucketAttributes: [],
            });
            fireEvent.click(document.querySelector(".s-filter-bar-button button"));
            expect(document.querySelector(".s-add-filter-menu-item-ranking")).toBeInTheDocument();
        });
    });
});
