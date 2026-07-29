// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";

import type { ICatalogItemInsight } from "../../catalogItem/types.js";
import { InsightCodecProvider } from "../insightCodecContext.js";
import { visualizationDescriptor } from "../insightDescriptor.js";

function createCodecHostWrapper(isVisualizationTypeEditable?: (visualizationType: string) => boolean) {
    function Wrapper({ children }: PropsWithChildren) {
        return (
            <InsightCodecProvider
                requestLoad={vi.fn(async () => {})}
                isVisualizationTypeEditable={isVisualizationTypeEditable}
            >
                {children}
            </InsightCodecProvider>
        );
    }
    return Wrapper;
}

describe("visualizationDescriptor.useIsItemEditable", () => {
    const onlyBarEditable = (visualizationType: string) => visualizationType === "bar";
    const barItem = { visualizationType: "bar" } as ICatalogItemInsight;
    const pushpinItem = { visualizationType: "pushpin" } as ICatalogItemInsight;

    it("denies any visualization without a codec host", () => {
        const { result } = renderHook(() => visualizationDescriptor.useIsItemEditable!(barItem));
        expect(result.current).toBe(false);
    });

    it("allows a visualization under a host that injects no per-chart-type predicate", () => {
        const { result } = renderHook(() => visualizationDescriptor.useIsItemEditable!(barItem), {
            wrapper: createCodecHostWrapper(),
        });
        expect(result.current).toBe(true);
    });

    it("allows a chart type the host's predicate accepts", () => {
        const { result } = renderHook(() => visualizationDescriptor.useIsItemEditable!(barItem), {
            wrapper: createCodecHostWrapper(onlyBarEditable),
        });
        expect(result.current).toBe(true);
    });

    it("denies a chart type the host's predicate rejects", () => {
        const { result } = renderHook(() => visualizationDescriptor.useIsItemEditable!(pushpinItem), {
            wrapper: createCodecHostWrapper(onlyBarEditable),
        });
        expect(result.current).toBe(false);
    });
});
