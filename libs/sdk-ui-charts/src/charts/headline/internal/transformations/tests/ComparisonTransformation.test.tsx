// (C) 2023-2025 GoodData Corporation
import React from "react";
import { afterEach, describe, vi, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { createIntlMock, ExplicitDrill, withIntl } from "@gooddata/sdk-ui";
import { ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";

import { ComparisonTransformation } from "../ComparisonTransformation.js";
import * as BaseHeadline from "../../headlines/baseHeadline/BaseHeadline.js";
import * as useFireDrillEvent from "../useFiredDrillEvent.js";
import { IHeadlineTransformationProps } from "../../../HeadlineProvider.js";
import { recordedDataFacade } from "../../../../../../__mocks__/recordings.js";
import { TEST_COMPARISON_TRANSFORMATIONS, TEST_DEFAULT_COMPARISON } from "../../tests/TestData.fixtures.js";
import { IChartConfig, IComparison } from "../../../../../interfaces/index.js";
import { getComparisonBaseHeadlineData } from "../../utils/ComparisonTransformationUtils.js";

describe("ComparisonTransformation", () => {
    const renderTransformation = (props: IHeadlineTransformationProps) => {
        const WrappedHeadlineTransformation = withIntl(ComparisonTransformation);
        return render(<WrappedHeadlineTransformation {...props} />);
    };

    afterEach(() => {
        vi.resetAllMocks();
    });

    it.each(TEST_COMPARISON_TRANSFORMATIONS)(
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
                expect.anything(),
            );
        },
    );
});
