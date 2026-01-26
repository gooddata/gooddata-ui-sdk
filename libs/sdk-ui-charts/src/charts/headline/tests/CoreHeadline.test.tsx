// (C) 2007-2025 GoodData Corporation

import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { type ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";

import { recordedDataFacade } from "../../../../testUtils/recordings.js";
import { type ICoreChartProps } from "../../../interfaces/chartProps.js";
import { CoreHeadline, type ICoreHeadlineExtendedProps } from "../CoreHeadline.js";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../internal/transformations/LegacyHeadlineTransformation.js", () => ({
    __esModule: true,
    default: vi.fn(() => null),
}));

describe("CoreHeadline", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const afterRender = vi.fn();

    function createComponent(props: ICoreChartProps & ICoreHeadlineExtendedProps) {
        return render(<CoreHeadline {...props} afterRender={afterRender} drillableItems={[]} />);
    }

    const singleMeasureHeadline = recordedDataFacade(
        ReferenceRecordings.Scenarios.PivotTable.SingleMeasure as unknown as ScenarioRecording,
    );

    const singleMeasureExec = singleMeasureHeadline.result().transform();

    describe("render visual from headlineTransformation property", () => {
        const MockHeadlineTransformation = vi.fn();

        it("should render HeadlineTransformation from headlineTransformation property", async () => {
            const drillEventCallback = vi.fn();
            createComponent({
                headlineTransformation: MockHeadlineTransformation,
                execution: singleMeasureExec,
                onDrill: drillEventCallback,
            });

            await waitFor(() => {
                expect(MockHeadlineTransformation).toHaveBeenCalledWith(
                    expect.objectContaining({
                        dataView: expect.objectContaining({
                            definition: singleMeasureExec.definition,
                        }),
                        onAfterRender: afterRender,
                        drillableItems: [],
                    }),
                    undefined,
                );
            });
        });
    });
});
