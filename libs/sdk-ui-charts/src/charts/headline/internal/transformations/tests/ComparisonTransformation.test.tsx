// (C) 2023-2025 GoodData Corporation

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";
import { type ExplicitDrill, createIntlMock, withIntl } from "@gooddata/sdk-ui";

import { recordedDataFacade } from "../../../../../../__mocks__/recordings.js";
import { type IChartConfig, type IComparison } from "../../../../../interfaces/index.js";
import { type IHeadlineTransformationProps } from "../../../HeadlineProvider.js";
import * as BaseHeadline from "../../headlines/baseHeadline/BaseHeadline.js";
import { TEST_COMPARISON_TRANSFORMATIONS, TEST_DEFAULT_COMPARISON } from "../../tests/TestData.fixtures.js";
import { getComparisonBaseHeadlineData } from "../../utils/ComparisonTransformationUtils.js";
import { ComparisonTransformation } from "../ComparisonTransformation.js";
import * as useFireDrillEvent from "../useFiredDrillEvent.js";

describe("ComparisonTransformation", () => {
    const renderTransformation = (props: IHeadlineTransformationProps) => {
        const WrappedHeadlineTransformation = withIntl(ComparisonTransformation);
        return render(<WrappedHeadlineTransformation {...props} />);
    };

    afterEach(() => {
        vi.resetAllMocks();
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
            const mockIntl = createIntlMock();
            const MockBaseHeadline = vi.spyOn(BaseHeadline, "BaseHeadline");
            const mockHandleFiredDrillEvent = vi.fn();
            vi.spyOn(useFireDrillEvent, "useFireDrillEvent").mockReturnValue({
                handleFiredDrillEvent: mockHandleFiredDrillEvent,
            });

            const dataFacade = recordedDataFacade(recorded);
            const config: IChartConfig = {
                comparison,
            };
            const data = getComparisonBaseHeadlineData(
                dataFacade.dataView,
                drillableItems,
                config.comparison,
                mockIntl,
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
