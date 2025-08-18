// (C) 2007-2025 GoodData Corporation
import React from "react";
import { render, waitFor } from "@testing-library/react";
import { ICoreChartProps } from "../../../interfaces/chartProps.js";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedDataFacade } from "../../../../__mocks__/recordings.js";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CoreHeadline, ICoreHeadlineExtendedProps } from "../CoreHeadline.js";
import { ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";

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
                    {},
                );
            });
        });
    });
});
