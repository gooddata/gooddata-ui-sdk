// (C) 2023 GoodData Corporation
import React from "react";
import { afterEach, describe, vi, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { ExplicitDrill, withIntl } from "@gooddata/sdk-ui";
import { ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";

import MultiMeasuresTransformation from "../MultiMeasuresTransformation.js";
import * as BaseHeadline from "../../headlines/baseHeadline/BaseHeadline.js";
import * as useFireDrillEvent from "../useFiredDrillEvent.js";
import { getBaseHeadlineData } from "../../utils/BaseHeadlineTransformationUtils.js";
import { IHeadlineTransformationProps } from "../../../HeadlineProvider.js";
import { recordedDataFacade } from "../../../../../../__mocks__/recordings.js";
import { TEST_MULTI_MEASURE_TRANSFORMATION } from "../../tests/TestData.fixtures.js";

describe("MultiMeasuresTransformation", () => {
    const renderTransformation = (props: IHeadlineTransformationProps) => {
        const WrappedHeadlineTransformation = withIntl(MultiMeasuresTransformation);
        return render(<WrappedHeadlineTransformation {...props} />);
    };

    afterEach(() => {
        vi.resetAllMocks();
    });

    it.each(TEST_MULTI_MEASURE_TRANSFORMATION)(
        "Should render transformation based on base-headline '%s' correctly",
        (_test: string, recorded: ScenarioRecording, drillableItems: ExplicitDrill[] = []) => {
            const mockOnAfterRender = vi.fn();
            const MockBaseHeadline = vi.spyOn(BaseHeadline, "default");
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
                expect.anything(),
            );
        },
    );
});
