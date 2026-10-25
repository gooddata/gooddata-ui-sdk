// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IActiveCalendars, type ICatalogAttribute } from "@gooddata/sdk-model";

import { getActiveCalendars } from "../selectors/feature_flag_selector.js";
import {
    displayRecommendationBlockSelector,
    displayRecommendationComparisonSelector,
    displayRecommendationComparisonWithPeriodSelector,
    displayRecommendationContributionInPercentsSelector,
    displayRecommendationFilteringSelector,
    displayRecommendationsMetricWithPeriodSelector,
    displayRecommendationsTrendingSelector,
    isGeoSegmentConflictRecommendedSelector,
    isRecommendationDismissedForVisClass,
} from "../selectors/recommendations_selector.js";
import { getVisualizationClassTypeFromState } from "../services/visualization_class_service.js";
import { getAvailableAttributes } from "../store/catalog/catalog_selector.js";
import { withIntl } from "../utils/with_intl.js";
import { withRedux } from "../utils/with_redux.js";

import { Recommendations } from "./Recommendations.js";

vi.hoisted(() => {
    vi.resetModules();
});

const useSelectorMock = vi.hoisted(() => vi.fn());

vi.mock("react-redux", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-redux");
    return {
        ...actual,
        useSelector: (selector: unknown) => useSelectorMock(selector),
    };
});

interface ISelectorValues {
    displayRecommendationBlock?: boolean;
    displayComparisonWithPeriod?: boolean;
    displayContributionInPercents?: boolean;
    displayMetricWithPeriod?: boolean;
    displayTrending?: boolean;
    displayComparison?: boolean;
    displayFiltering?: boolean;
    isGeoSegmentConflictRecommended?: boolean;
    isRecommendationsDismissed?: boolean;
    availableAttributes?: ReadonlyArray<ICatalogAttribute>;
    visualization?: string;
    activeCalendars?: IActiveCalendars;
}

function setSelectorValues({
    displayRecommendationBlock = false,
    displayComparisonWithPeriod = false,
    displayContributionInPercents = false,
    displayMetricWithPeriod = false,
    displayTrending = false,
    displayComparison = false,
    displayFiltering = false,
    isGeoSegmentConflictRecommended = false,
    isRecommendationsDismissed = false,
    availableAttributes = [],
    visualization = "table",
    activeCalendars = { default: "STANDARD", standard: true, fiscal: false },
}: ISelectorValues = {}) {
    useSelectorMock.mockImplementation((selector: unknown) => {
        switch (selector) {
            case displayRecommendationBlockSelector:
                return displayRecommendationBlock;
            case displayRecommendationComparisonWithPeriodSelector:
                return displayComparisonWithPeriod;
            case displayRecommendationContributionInPercentsSelector:
                return displayContributionInPercents;
            case displayRecommendationsMetricWithPeriodSelector:
                return displayMetricWithPeriod;
            case displayRecommendationsTrendingSelector:
                return displayTrending;
            case displayRecommendationComparisonSelector:
                return displayComparison;
            case displayRecommendationFilteringSelector:
                return displayFiltering;
            case isGeoSegmentConflictRecommendedSelector:
                return isGeoSegmentConflictRecommended;
            case isRecommendationDismissedForVisClass:
                return isRecommendationsDismissed;
            case getAvailableAttributes:
                return availableAttributes;
            case getVisualizationClassTypeFromState:
                return visualization;
            case getActiveCalendars:
                return activeCalendars;
            default:
                return undefined;
        }
    });
}

describe("Recommendations", () => {
    const WrappedRecommendations = withIntl(withRedux(Recommendations));

    function renderComponent(values?: ISelectorValues) {
        setSelectorValues(values);

        return render(<WrappedRecommendations />);
    }

    beforeEach(() => {
        useSelectorMock.mockReset();
    });

    it("should be in blank state by default", () => {
        const { container } = renderComponent();
        expect(container.querySelectorAll(".adi-recommendations-container")).toHaveLength(0);
    });

    it("should show empty container", () => {
        const { container } = renderComponent({
            displayRecommendationBlock: true,
        });
        expect(container.querySelectorAll(".adi-recommendations-container")).toHaveLength(1);
        expect(container.querySelectorAll(".adi-recommendations-title")).toHaveLength(1);
    });

    it("should show comparsion with period recommendation", () => {
        const { container } = renderComponent({
            displayRecommendationBlock: true,
            displayComparisonWithPeriod: true,
        });
        expect(container.querySelectorAll(".adi-recommendations-container")).toHaveLength(1);
        expect(container.querySelectorAll(".adi-recommendation-comparison-with-period")).toHaveLength(1);
    });

    it("should show contribution in percents recommendation", () => {
        const { container } = renderComponent({
            displayRecommendationBlock: true,
            displayContributionInPercents: true,
        });
        expect(container.querySelectorAll(".adi-recommendations-container")).toHaveLength(1);
        expect(container.querySelectorAll(".adi-recommendation-contribution")).toHaveLength(1);
    });

    it("should show metric with period recommendation", () => {
        const { container } = renderComponent({
            displayRecommendationBlock: true,
            displayMetricWithPeriod: true,
        });
        expect(container.querySelectorAll(".adi-recommendations-container")).toHaveLength(1);
        expect(container.querySelectorAll(".adi-recommendation-metric-with-period")).toHaveLength(1);
    });

    it("should show trending recommendation", () => {
        const { container } = renderComponent({
            displayRecommendationBlock: true,
            displayTrending: true,
        });
        expect(container.querySelectorAll(".adi-recommendations-container")).toHaveLength(1);
        expect(container.querySelectorAll(".adi-recommendation-trending")).toHaveLength(1);
    });

    it("should show comparison recommendation", () => {
        const { container } = renderComponent({
            displayRecommendationBlock: true,
            displayComparison: true,
        });
        expect(container.querySelectorAll(".adi-recommendations-container")).toHaveLength(1);
        expect(container.querySelectorAll(".adi-recommendation-comparison")).toHaveLength(1);
    });

    it("should show filtering recommendation", () => {
        const { container } = renderComponent({
            displayRecommendationBlock: true,
            displayFiltering: true,
            isRecommendationsDismissed: false,
        });
        expect(container.querySelectorAll(".adi-recommendations-container")).toHaveLength(1);
        expect(container.querySelectorAll(".adi-recommendation-filtering")).toHaveLength(1);
    });

    it("should not show filtering recommendation when recommendations are dismissed", () => {
        const { container } = renderComponent({
            displayRecommendationBlock: true,
            displayFiltering: true,
            isRecommendationsDismissed: true,
        });
        expect(container.querySelectorAll(".adi-recommendations-container")).toHaveLength(1);
        expect(container.querySelectorAll(".adi-recommendation-filtering")).toHaveLength(0);
    });

    it("should show all recommendations", () => {
        const { container } = renderComponent({
            displayRecommendationBlock: true,
            displayComparisonWithPeriod: true,
            displayContributionInPercents: true,
            displayMetricWithPeriod: true,
            displayTrending: true,
            displayFiltering: true,
            isRecommendationsDismissed: false,
        });
        expect(container.querySelectorAll(".adi-recommendations-container")).toHaveLength(1);
        expect(container.querySelectorAll(".adi-recommendation-comparison-with-period")).toHaveLength(1);
        expect(container.querySelectorAll(".adi-recommendation-contribution")).toHaveLength(1);
        expect(container.querySelectorAll(".adi-recommendation-metric-with-period")).toHaveLength(1);
        expect(container.querySelectorAll(".adi-recommendation-trending")).toHaveLength(1);
        expect(container.querySelectorAll(".adi-recommendation-filtering")).toHaveLength(1);
    });
});
