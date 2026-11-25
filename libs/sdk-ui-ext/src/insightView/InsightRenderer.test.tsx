// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { type IFilter, newInsightDefinition, newPositiveAttributeFilter } from "@gooddata/sdk-model";
import { NotFoundSdkError } from "@gooddata/sdk-ui";

import { FullVisualizationCatalog } from "../internal/components/VisualizationCatalog.js";
import { type IVisConstruct, type IVisualization } from "../internal/interfaces/Visualization.js";
import { type IVisualizationDescriptor } from "../internal/interfaces/VisualizationDescriptor.js";

import { InsightRenderer } from "./InsightRenderer.js";

const backend = dummyBackendEmptyData();
const insight = newInsightDefinition("local:table");
const firstFilters: IFilter[] = [newPositiveAttributeFilter("label.region", ["East"])];
const secondFilters: IFilter[] = [newPositiveAttributeFilter("label.region", ["West"])];

/**
 * Replaces the visualization with a fake that records the callbacks of each setup, so that a test can report
 * an error from a visualization that was replaced in the meantime.
 */
function mockVisualizations(): IVisConstruct[] {
    const constructs: IVisConstruct[] = [];
    const visualization = { update: vi.fn(), unmount: vi.fn() } as Partial<IVisualization> as IVisualization;
    const descriptor = {
        getFactory: () => (construct: IVisConstruct) => {
            constructs.push(construct);
            return visualization;
        },
    } as Partial<IVisualizationDescriptor> as IVisualizationDescriptor;

    vi.spyOn(FullVisualizationCatalog, "forInsight").mockReturnValue(descriptor);

    return constructs;
}

function renderInsight(filters: IFilter[], onError: () => void) {
    return (
        <InsightRenderer
            backend={backend}
            workspace="workspace"
            insight={insight}
            filters={filters}
            locale="en-US"
            settings={undefined}
            colorPalette={undefined}
            onError={onError}
        />
    );
}

describe("InsightRenderer", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("ignores the error of a visualization that was replaced by a new setup", () => {
        const constructs = mockVisualizations();
        const onError = vi.fn();
        const { rerender } = render(renderInsight(firstFilters, onError));

        rerender(renderInsight(secondFilters, onError));
        expect(constructs).toHaveLength(2);

        constructs[0].callbacks.onError?.(new NotFoundSdkError());
        expect(onError).not.toHaveBeenCalled();

        const currentError = new NotFoundSdkError();
        constructs[1].callbacks.onError?.(currentError);
        expect(onError).toHaveBeenCalledExactlyOnceWith(currentError);
    });

    it("ignores the error of a visualization that was unmounted", () => {
        const constructs = mockVisualizations();
        const onError = vi.fn();
        const { unmount } = render(renderInsight(firstFilters, onError));

        unmount();
        constructs[0].callbacks.onError?.(new NotFoundSdkError());

        expect(onError).not.toHaveBeenCalled();
    });
});
