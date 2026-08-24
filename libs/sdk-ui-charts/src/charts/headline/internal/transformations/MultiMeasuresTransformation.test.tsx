// (C) 2023-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";
import { type ExplicitDrill, withIntlForTest } from "@gooddata/sdk-ui";

import { recordedDataFacade } from "../../../../../testUtils/recordings.js";
import { type IHeadlineTransformationProps } from "../../HeadlineProvider.js";
import { TEST_MULTI_MEASURE_TRANSFORMATION } from "../TestData.fixtures.js";

vi.mock("../headlines/baseHeadline/BaseHeadline.js", async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...(original as object),
        BaseHeadline: vi.fn((original as { BaseHeadline: () => void }).BaseHeadline),
    };
});

vi.mock("./useFiredDrillEvent.js", async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...(original as object),
        useFireDrillEvent: vi.fn((original as { useFireDrillEvent: () => void }).useFireDrillEvent),
    };
});

// The transformation and its dependencies are imported by other test files as well, so with isolation off
// (see vitest.config.ts) an earlier file may have left them cached — wired to the *real* BaseHeadline and
// useFireDrillEvent rather than the mocks above. Dropping the cached graph re-imports them through the mocks.
//
// This runs while the file is still being imported, not from a hook: the static imports are already bound by
// the time any hook runs, so the reset has to be followed by re-importing the graph it dropped. The test's own
// `getBaseHeadlineData` has to come from that same fresh graph too — the data it builds carries a component
// reference that is compared by identity against the one the rendered transformation passed on.
vi.resetModules();
const { BaseHeadline } = await import("../headlines/baseHeadline/BaseHeadline.js");
const { getBaseHeadlineData } = await import("../utils/BaseHeadlineTransformationUtils.js");
const { MultiMeasuresTransformation } = await import("./MultiMeasuresTransformation.js");
const { useFireDrillEvent } = await import("./useFiredDrillEvent.js");

describe("MultiMeasuresTransformation", () => {
    const renderTransformation = (props: IHeadlineTransformationProps) => {
        const WrappedHeadlineTransformation = withIntlForTest(MultiMeasuresTransformation);
        return render(<WrappedHeadlineTransformation {...props} />);
    };

    afterEach(() => {
        vi.resetAllMocks();
    });

    it.each<[string, ScenarioRecording, ExplicitDrill[]?]>(TEST_MULTI_MEASURE_TRANSFORMATION)(
        "Should render transformation based on base-headline '%s' correctly",
        (_test: string, recorded: ScenarioRecording, drillableItems: ExplicitDrill[] = []) => {
            const mockOnAfterRender = vi.fn();
            const MockBaseHeadline = vi.mocked(BaseHeadline);
            const mockHandleFiredDrillEvent = vi.fn();
            vi.mocked(useFireDrillEvent).mockReturnValue({
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
