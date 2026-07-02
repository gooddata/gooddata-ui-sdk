// (C) 2026 GoodData Corporation

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IAutomationMetadataObject,
    type ICatalogAttribute,
    type ICatalogDateDataset,
    type IInsight,
    type IWidget,
} from "@gooddata/sdk-model";

import { IntlWrapper } from "../../../../../localization/IntlWrapper.js";

// ---------------------------------------------------------------------------
// Mocks — vi.mock calls are hoisted, so factories must not reference top-level
// let/const declared after them. We use vi.fn() inline and retrieve spies via
// vi.mocked() after the import statements.
// ---------------------------------------------------------------------------

vi.mock("@gooddata/sdk-ui", async (importOriginal: () => Promise<Record<string, unknown>>) => {
    const original = await importOriginal();
    return {
        ...original,
        fillMissingTitles: vi.fn(),
    };
});

vi.mock("../../utils/items.js", () => ({
    getSupportedInsightMeasuresByInsight: vi.fn().mockReturnValue([]),
    getSupportedInsightAttributesByInsight: vi.fn().mockReturnValue([]),
}));

vi.mock("../../utils/getters.js", async (importOriginal: () => Promise<Record<string, unknown>>) => {
    const original = await importOriginal();
    return {
        ...original,
        getMeasureFormatsFromExecution: vi.fn().mockReturnValue({}),
    };
});

// Context mocks — the hooks read these via useAutomationsContext /
// useAlertingDialogContext. We inject the mock values through module mocking.

const executionResultByRefMock = vi.fn();

vi.mock("../../../../contexts/AutomationsContext.js", () => ({
    useAutomationsContext: () => ({
        locale: "en-US",
        catalogDateDatasets: [] as ICatalogDateDataset[],
        catalogAttributes: [] as ICatalogAttribute[],
    }),
}));

vi.mock("../../../../contexts/AlertingDialogContext.js", () => ({
    useAlertingDialogContext: () => ({
        executionResultByRef: executionResultByRefMock,
    }),
}));

// ---------------------------------------------------------------------------
// Imports placed AFTER vi.mock() calls to pick up mocked versions
// ---------------------------------------------------------------------------

import * as sdkUi from "@gooddata/sdk-ui";

import * as gettersModule from "../../utils/getters.js";
import * as itemsModule from "../../utils/items.js";
import {
    useAlertSupportedMetrics,
    type IUseAlertSupportedMetricsProps,
} from "../useAlertSupportedMetrics.js";

// ---------------------------------------------------------------------------
// Typed spy references (resolved after import)
// ---------------------------------------------------------------------------

const fillMissingTitlesSpy = vi.mocked(sdkUi.fillMissingTitles);
const getSupportedInsightMeasuresByInsightSpy = vi.mocked(itemsModule.getSupportedInsightMeasuresByInsight);
const getSupportedInsightAttributesByInsightSpy = vi.mocked(
    itemsModule.getSupportedInsightAttributesByInsight,
);
const getMeasureFormatsFromExecutionSpy = vi.mocked(gettersModule.getMeasureFormatsFromExecution);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const sentinelHydratedInsight: IInsight = {
    insight: { identifier: "hydrated-insight", title: "Hydrated" },
} as unknown as IInsight;

const rawInsight: IInsight = {
    insight: { identifier: "raw-insight", title: "Raw" },
} as unknown as IInsight;

const mockWidget: IWidget = {
    ref: { identifier: "widget-1" },
    localIdentifier: "widget-local-1",
} as unknown as IWidget;

const alertToEdit: IAutomationMetadataObject = {
    type: "automation",
    id: "alert-1",
    title: "Existing Alert",
    ref: { identifier: "alert-1" },
    uri: "/alert-1",
    identifier: "alert-1",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
} as unknown as IAutomationMetadataObject;

// ---------------------------------------------------------------------------
// Reset mocks between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
    vi.clearAllMocks();
    fillMissingTitlesSpy.mockResolvedValue(sentinelHydratedInsight);
    getSupportedInsightMeasuresByInsightSpy.mockReturnValue([]);
    getSupportedInsightAttributesByInsightSpy.mockReturnValue([]);
    getMeasureFormatsFromExecutionSpy.mockReturnValue({});
    executionResultByRefMock.mockReturnValue(undefined);
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderSupportedMetricsHook(props: Partial<IUseAlertSupportedMetricsProps> = {}) {
    const mergedProps: IUseAlertSupportedMetricsProps = {
        insight: rawInsight,
        widget: mockWidget,
        alertToEdit: undefined,
        ...props,
    };
    return renderHook(() => useAlertSupportedMetrics(mergedProps), { wrapper: IntlWrapper });
}

// ---------------------------------------------------------------------------
// Tests — Case 1: measures use hydrated insight, attributes use raw insight
// ---------------------------------------------------------------------------

describe("useAlertSupportedMetrics — insight hydration routing", () => {
    it("calls getSupportedInsightMeasuresByInsight with the fillMissingTitles-hydrated insight once the effect settles", async () => {
        const { result } = renderSupportedMetricsHook({ insight: rawInsight });

        await waitFor(() => {
            expect(fillMissingTitlesSpy).toHaveBeenCalledWith(rawInsight, "en-US", 9999);
        });

        await waitFor(() => {
            expect(getSupportedInsightMeasuresByInsightSpy).toHaveBeenCalledWith(
                sentinelHydratedInsight,
                [],
                undefined,
            );
        });

        expect(result.current.supportedMeasures).toEqual([]);
    });

    it("calls getSupportedInsightAttributesByInsight with the RAW insight (not the hydrated one)", async () => {
        const { result } = renderSupportedMetricsHook({ insight: rawInsight });

        await waitFor(() => {
            expect(getSupportedInsightAttributesByInsightSpy).toHaveBeenCalledWith(
                rawInsight,
                [],
                [],
                undefined,
            );
        });

        expect(result.current.supportedAttributes).toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// Tests — Case 2: alertToEdit threaded to measures
// ---------------------------------------------------------------------------

describe("useAlertSupportedMetrics — alertToEdit threading", () => {
    it("passes alertToEdit as the 4th argument to getSupportedInsightMeasuresByInsight", async () => {
        renderSupportedMetricsHook({ insight: rawInsight, alertToEdit });

        await waitFor(() => {
            expect(getSupportedInsightMeasuresByInsightSpy).toHaveBeenCalledWith(
                expect.anything(),
                [],
                alertToEdit,
            );
        });
    });

    it("passes alertToEdit as the 4th argument to getSupportedInsightAttributesByInsight", async () => {
        renderSupportedMetricsHook({ insight: rawInsight, alertToEdit });

        await waitFor(() => {
            expect(getSupportedInsightAttributesByInsightSpy).toHaveBeenCalledWith(
                rawInsight,
                [],
                [],
                alertToEdit,
            );
        });
    });
});

// ---------------------------------------------------------------------------
// Tests — Case 3: measureFormatMap derives from the exec result
// ---------------------------------------------------------------------------

describe("useAlertSupportedMetrics — measureFormatMap from exec result", () => {
    it("calls getMeasureFormatsFromExecution with executionResultByRef(widget.ref)?.executionResult", () => {
        // Provide a minimal executionResult with readAll so useAttributeValuesFromExecResults
        // doesn't throw when it tries to call readAll().
        const mockExecutionResult = {
            dimensions: [],
            readAll: vi
                .fn()
                .mockResolvedValue({ data: [], headerItems: [], count: [], offset: [], totalCount: [] }),
        } as unknown;
        const mockExecResult = { executionResult: mockExecutionResult };
        executionResultByRefMock.mockReturnValue(mockExecResult);

        const sentinelFormatMap = { "measure-1": "#,##0.00" };
        getMeasureFormatsFromExecutionSpy.mockReturnValue(sentinelFormatMap);

        const { result } = renderSupportedMetricsHook({ widget: mockWidget });

        expect(executionResultByRefMock).toHaveBeenCalledWith(mockWidget.ref);
        expect(getMeasureFormatsFromExecutionSpy).toHaveBeenCalledWith(mockExecutionResult);
        expect(result.current.measureFormatMap).toEqual(sentinelFormatMap);
    });
});

// ---------------------------------------------------------------------------
// Tests — Case 4: exec-result getters passed through
// ---------------------------------------------------------------------------

describe("useAlertSupportedMetrics — exec-result getters passthrough", () => {
    it("returns isResultLoading=true when no execResult envelope is available", () => {
        executionResultByRefMock.mockReturnValue(undefined);

        const { result } = renderSupportedMetricsHook({ widget: mockWidget });

        // No exec result envelope → isResultLoading is true
        expect(result.current.isResultLoading).toBe(true);
    });

    it("isResultLoading derives from the envelope's isLoading flag when executionResult is absent", () => {
        executionResultByRefMock.mockReturnValue({ isLoading: false });

        const { result } = renderSupportedMetricsHook({ widget: mockWidget });

        expect(result.current.isResultLoading).toBe(false);
    });

    it("getAttributeValues and getMetricValue are functions", () => {
        const { result } = renderSupportedMetricsHook({ widget: mockWidget });

        expect(typeof result.current.getAttributeValues).toBe("function");
        expect(typeof result.current.getMetricValue).toBe("function");
    });
});

// ---------------------------------------------------------------------------
// Tests — Case 5: no widget → undefined execResult, no throw
// ---------------------------------------------------------------------------

describe("useAlertSupportedMetrics — no widget", () => {
    it("calls executionResultByRef(undefined) when widget is absent and does not throw", () => {
        executionResultByRefMock.mockReturnValue(undefined);

        const { result } = renderSupportedMetricsHook({ widget: undefined, insight: rawInsight });

        expect(executionResultByRefMock).toHaveBeenCalledWith(undefined);
        expect(result.current.supportedMeasures).toEqual([]);
        expect(result.current.supportedAttributes).toEqual([]);
        expect(result.current.measureFormatMap).toEqual({});
        expect(typeof result.current.getAttributeValues).toBe("function");
        expect(typeof result.current.getMetricValue).toBe("function");
    });
});
