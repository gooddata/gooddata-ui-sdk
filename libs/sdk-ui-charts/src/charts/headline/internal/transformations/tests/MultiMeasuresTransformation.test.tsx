// (C) 2023-2025 GoodData Corporation

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";
import { type ExplicitDrill, withIntl } from "@gooddata/sdk-ui";

import { recordedDataFacade } from "../../../../../../testUtils/recordings.js";
import { type IHeadlineTransformationProps } from "../../../HeadlineProvider.js";
import * as BaseHeadline from "../../headlines/baseHeadline/BaseHeadline.js";
import { TEST_MULTI_MEASURE_TRANSFORMATION } from "../../tests/TestData.fixtures.js";
import { getBaseHeadlineData } from "../../utils/BaseHeadlineTransformationUtils.js";
import { MultiMeasuresTransformation } from "../MultiMeasuresTransformation.js";
import * as useFireDrillEvent from "../useFiredDrillEvent.js";

describe("MultiMeasuresTransformation", () => {
    const renderTransformation = (props: IHeadlineTransformationProps) => {
        const WrappedHeadlineTransformation = withIntl(MultiMeasuresTransformation);
        return render(<WrappedHeadlineTransformation {...props} />);
    };

    afterEach(() => {
        vi.resetAllMocks();
    });

    it.each<[string, ScenarioRecording, ExplicitDrill[]?]>(TEST_MULTI_MEASURE_TRANSFORMATION)(
        "Should render transformation based on base-headline '%s' correctly",
        (_test: string, recorded: ScenarioRecording, drillableItems: ExplicitDrill[] = []) => {
            const mockOnAfterRender = vi.fn();
            const MockBaseHeadline = vi.spyOn(BaseHeadline, "BaseHeadline");
            const mockHandleFiredDrillEvent = vi.fn();
            vi.spyOn(useFireDrillEvent, "useFireDrillEvent").mockReturnValue({
                handleFiredDrillEvent: mockHandleFiredDrillEvent,
            });

            const dataFacade = recordedDataFacade(recorded);
            const data = getBaseHeadlineData(dataFacade.dataView, drillableItems);
            const config = {};

            renderTransformation({
                dataView: dataFacade.dataView,
                drillableItems: drillableItems,
                onDrill: vi.fn(),
                onAfterRender: mockOnAfterRender,
                config,
            });

            expect(MockBaseHeadline).toHaveBeenCalledWith(
                expect.objectContaining({
                    data,
                    config,
                    onDrill: mockHandleFiredDrillEvent,
                    onAfterRender: mockOnAfterRender,
                }),
                undefined,
            );
        },
    );
});
