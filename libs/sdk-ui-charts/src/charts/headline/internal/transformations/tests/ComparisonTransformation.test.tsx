// (C) 2023-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { RawIntlProvider } from "react-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";
import { type ExplicitDrill, createIntlMock } from "@gooddata/sdk-ui";

import { recordedDataFacade } from "../../../../../../testUtils/recordings.js";
import { type IChartConfig } from "../../../../../interfaces/chartConfig.js";
import { type IComparison } from "../../../../../interfaces/comparison.js";
import { type IHeadlineTransformationProps } from "../../../HeadlineProvider.js";
import { BaseHeadline } from "../../headlines/baseHeadline/BaseHeadline.js";
import { TEST_COMPARISON_TRANSFORMATIONS, TEST_DEFAULT_COMPARISON } from "../../tests/TestData.fixtures.js";
import { getComparisonBaseHeadlineData } from "../../utils/ComparisonTransformationUtils.js";
import { ComparisonTransformation } from "../ComparisonTransformation.js";
import { useFireDrillEvent } from "../useFiredDrillEvent.js";

// The assertions below only check the props passed down to BaseHeadline, so it is stubbed out
// completely - rendering the real headline subtree here would only duplicate BaseHeadline's own tests.
vi.mock("../../headlines/baseHeadline/BaseHeadline.js", async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...(original as object),
        BaseHeadline: vi.fn(() => null),
    };
});

vi.mock("../useFiredDrillEvent.js", async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...(original as object),
        useFireDrillEvent: vi.fn((original as { useFireDrillEvent: () => void }).useFireDrillEvent),
    };
});

// Building the intl shape resolves the whole message map, so it is created once and shared by
// every test - both for the expected data and for the rendered component.
const intl = createIntlMock();

// Several scenarios reuse the same recording; converting it to a facade is not free, so cache it.
const dataFacadeCache = new Map<ScenarioRecording, ReturnType<typeof recordedDataFacade>>();
const cachedDataFacade = (recorded: ScenarioRecording) => {
    if (!dataFacadeCache.has(recorded)) {
        dataFacadeCache.set(recorded, recordedDataFacade(recorded));
    }
    return dataFacadeCache.get(recorded)!;
};

describe("ComparisonTransformation", () => {
    const renderTransformation = (props: IHeadlineTransformationProps) =>
        render(
            <RawIntlProvider value={intl}>
                <ComparisonTransformation {...props} />
            </RawIntlProvider>,
        );

    afterEach(() => {
        vi.clearAllMocks();
    });

    it.each<[string, ScenarioRecording, IComparison?, ExplicitDrill[]?]>(TEST_COMPARISON_TRANSFORMATIONS)(
        "Should render transformation based on base-headline '%s' correctly",
        (
            _test: string,
            recorded: ScenarioRecording,
            comparison: IComparison = TEST_DEFAULT_COMPARISON,
            drillableItems: ExplicitDrill[] = [],
        ) => {
            const mockOnAfterRender = vi.fn();
            const MockBaseHeadline = vi.mocked(BaseHeadline);
            const mockHandleFiredDrillEvent = vi.fn();
            vi.mocked(useFireDrillEvent).mockReturnValue({
                handleFiredDrillEvent: mockHandleFiredDrillEvent,
            });

            const dataFacade = cachedDataFacade(recorded);
            const config: IChartConfig = {
                comparison,
            };
            const data = getComparisonBaseHeadlineData(
                dataFacade.dataView,
                drillableItems,
                config.comparison!,
                intl,
            );

            renderTransformation({
                dataView: dataFacade.dataView,
                config: {
                    comparison: comparison || TEST_DEFAULT_COMPARISON,
                },
                drillableItems: drillableItems,
                onDrill: vi.fn(),
                onAfterRender: mockOnAfterRender,
            });

            expect(MockBaseHeadline).toHaveBeenCalledWith(
                expect.objectContaining({
                    data,
                    config: config,
                    onDrill: mockHandleFiredDrillEvent,
                    onAfterRender: mockOnAfterRender,
                }),
                undefined,
            );
        },
    );
});
