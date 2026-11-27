// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IDashboardParameter,
    type IInsight,
    type IParameterMetadataObject,
    type IdentifierRef,
    idRef,
    objRefToString,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { type IDashboardParameterEntry } from "../../../../../model/store/tabs/parameters/parametersState.js";
import { DRILL_TARGET_TYPE, type IDrillConfigItem } from "../../../../drill/types.js";
import { IntlWrapper } from "../../../../localization/IntlWrapper.js";

const mockUseDashboardSelector = vi.fn();

vi.mock("../../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => mockUseDashboardSelector(selector),
}));

const { selectCatalogRequestedParameterRoots } =
    await import("../../../../../model/store/catalog/catalogSelectors.js");
const { selectWidgetParameterContext } =
    await import("../../../../../model/store/tabs/parameters/parametersSelectors.js");
const { useDrillParameterOptions } = await import("./useDrillParameterOptions.js");

const widgetRef = idRef("widget", "insight");
const sourceInsightRef = idRef("source", "insight");
const targetInsightRef = idRef("target", "insight");
const topNRef = idRef("topN", "parameter");
const regionRef = idRef("region", "parameter");
const sampleSizeRef = idRef("sampleSize", "parameter");

const TOOLTIP = "This parameter is always passed to the drill target.";
const NOT_ON_TARGET_TOOLTIP = "Cannot be enabled. Add this parameter to the target dashboard first.";

interface IGivenStore {
    entries?: IDashboardParameterEntry[];
    dependenciesByRoot?: Record<string, IdentifierRef[]>;
    filterRoots?: IdentifierRef[];
    requestedRoots?: Record<string, "pending" | "failed">;
}

function givenStore({
    entries = [],
    dependenciesByRoot = {},
    filterRoots = [],
    requestedRoots = {},
}: IGivenStore) {
    const context = {
        entries,
        dependenciesByRoot,
        filterRoots,
        workspaceParameterByRef: new Map([
            [objRefToString(topNRef), workspaceParameter(topNRef, "Top N")],
            [objRefToString(regionRef), workspaceParameter(regionRef, "Region")],
            [objRefToString(sampleSizeRef), workspaceParameter(sampleSizeRef, "Sample size")],
        ]),
        widgetInsightRef: undefined,
        isStringEnabled: true,
    };
    mockUseDashboardSelector.mockImplementation((selector: unknown) => {
        if (selector === selectWidgetParameterContext(widgetRef)) {
            return context;
        }
        if (selector === selectCatalogRequestedParameterRoots) {
            return requestedRoots;
        }
        throw new Error(
            `Unexpected selector: ${typeof selector === "function" ? selector.name : String(selector)}`,
        );
    });
}

function entry(
    ref: IdentifierRef,
    runtimeOverride: number | undefined,
    label?: string,
): IDashboardParameterEntry {
    return { parameter: { ref, parameterType: "NUMBER", mode: "active", label }, runtimeOverride };
}

function workspaceParameter(ref: IdentifierRef, title: string): IParameterMetadataObject {
    return {
        type: "parameter",
        id: ref.identifier,
        uri: `/${ref.identifier}`,
        ref,
        title,
        description: "",
        production: true,
        deprecated: false,
        unlisted: false,
        definition: { type: "NUMBER", defaultValue: 0 },
    };
}

function insight(ref: IdentifierRef): IInsight {
    return {
        insight: {
            ref,
            identifier: ref.identifier,
            uri: `/${ref.identifier}`,
            title: ref.identifier,
            visualizationUrl: "local:table",
            buckets: [],
            filters: [],
            sorts: [],
            properties: {},
        },
    };
}

function drillItem(drillTargetType: DRILL_TARGET_TYPE): IDrillConfigItem {
    return {
        type: "attribute",
        title: "Product",
        originLocalIdentifier: "product",
        localIdentifier: "drill-1",
        drillTargetType,
        complete: true,
        attributes: [],
        widgetRef,
    };
}

function renderOptions(
    item: IDrillConfigItem,
    executedInsight: IInsight | undefined,
    targetDashboardParameters: IDashboardParameter[],
) {
    return renderHook(() => useDrillParameterOptions(item, executedInsight, targetDashboardParameters), {
        wrapper: IntlWrapper,
    }).result.current;
}

beforeEach(() => {
    mockUseDashboardSelector.mockReset();
});

describe("useDrillParameterOptions", () => {
    it("lists a disabled checked row for each dashboard parameter the target visualization depends on", () => {
        givenStore({
            entries: [entry(topNRef, 5, "Top products"), entry(sampleSizeRef, 50)],
            dependenciesByRoot: { [serializeObjRef(targetInsightRef)]: [topNRef, sampleSizeRef] },
        });

        expect(
            renderOptions(drillItem(DRILL_TARGET_TYPE.DRILL_TO_INSIGHT), insight(targetInsightRef), []),
        ).toEqual({
            options: [
                {
                    id: "parameter:topN",
                    title: "Top products",
                    disabled: { message: TOOLTIP, selected: true },
                },
                {
                    id: "parameter:sampleSize",
                    title: "Sample size",
                    disabled: { message: TOOLTIP, selected: true },
                },
            ],
            isLoading: false,
        });
    });

    it("lists a parameter that the source visualization of a drill-down depends on", () => {
        givenStore({
            entries: [entry(topNRef, 5), entry(regionRef, 3)],
            dependenciesByRoot: {
                [serializeObjRef(sourceInsightRef)]: [topNRef],
                [serializeObjRef(targetInsightRef)]: [regionRef],
            },
        });

        expect(
            renderOptions(drillItem(DRILL_TARGET_TYPE.DRILL_DOWN), insight(sourceInsightRef), []).options.map(
                (option) => option.title,
            ),
        ).toEqual(["Top N"]);
    });

    it("lists a row for each applied parameter the drill passes to the target dashboard", () => {
        givenStore({
            entries: [entry(topNRef, 5), entry(regionRef, 3), entry(sampleSizeRef, undefined)],
        });

        expect(
            renderOptions(drillItem(DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD), undefined, [
                entry(topNRef, undefined).parameter,
                entry(regionRef, undefined).parameter,
            ]),
        ).toEqual({
            options: [
                { id: "parameter:topN", title: "Top N", disabled: { message: TOOLTIP, selected: true } },
                { id: "parameter:region", title: "Region", disabled: { message: TOOLTIP, selected: true } },
            ],
            isLoading: false,
        });
    });

    it("lists a disabled unchecked row for a parameter that the target dashboard does not define", () => {
        givenStore({ entries: [entry(topNRef, 5), entry(regionRef, 3)] });

        expect(
            renderOptions(drillItem(DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD), undefined, [
                entry(regionRef, undefined).parameter,
            ]).options,
        ).toEqual([
            {
                id: "parameter:topN",
                title: "Top N",
                disabled: { message: NOT_ON_TARGET_TOOLTIP, selected: false },
            },
            { id: "parameter:region", title: "Region", disabled: { message: TOOLTIP, selected: true } },
        ]);
    });

    it("is loading while the target visualization's parameter dependencies are pending", () => {
        givenStore({ requestedRoots: { [serializeObjRef(targetInsightRef)]: "pending" } });

        expect(
            renderOptions(drillItem(DRILL_TARGET_TYPE.DRILL_TO_INSIGHT), insight(targetInsightRef), [])
                .isLoading,
        ).toBe(true);
    });

    it("is loading while the parameter dependencies of a source dashboard filter are pending", () => {
        const regionAttributeRef = idRef("regionAttribute", "attribute");
        givenStore({
            filterRoots: [regionAttributeRef],
            requestedRoots: { [serializeObjRef(regionAttributeRef)]: "pending" },
        });

        expect(
            renderOptions(drillItem(DRILL_TARGET_TYPE.DRILL_TO_INSIGHT), insight(targetInsightRef), [])
                .isLoading,
        ).toBe(true);
    });
});
