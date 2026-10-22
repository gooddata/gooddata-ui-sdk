// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type IDataView, type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    type IAttributeDescriptor,
    type IMeasureGroupDescriptor,
    type IResultAttributeHeader,
    idRef,
} from "@gooddata/sdk-model";
import { DataViewFacade } from "@gooddata/sdk-ui";

import { type IGeoAdapterContext } from "../../layers/registry/adapterTypes.js";
import { type ILayerExecutionRecord } from "../../types/props/geoChart/internal.js";

import { prepareSingleLayer } from "./useLayersPrepare.js";

const prepareLayer = vi.fn(async () => ({ prepared: true }));

vi.mock("../../layers/registry/adapterRegistry.js", () => ({
    getLayerAdapter: () => ({ prepareLayer }),
}));

const segmentDescriptor: IAttributeDescriptor = {
    attributeHeader: {
        uri: "",
        identifier: "amount",
        localIdentifier: "segment",
        ref: idRef("amount", "computedAttribute"),
        name: "Amount",
        formOf: { uri: "", identifier: "amount", name: "Amount", ref: idRef("amount", "computedAttribute") },
        primaryLabel: idRef("amount", "computedAttribute"),
        numberFormat: "#,##0.0",
    },
};

const measureGroup: IMeasureGroupDescriptor = {
    measureGroupHeader: {
        items: [{ measureHeaderItem: { localIdentifier: "m1", name: "M1", format: "#,##0" } }],
    },
};

const header = (name: string): IResultAttributeHeader => ({ attributeHeaderItem: { uri: name, name } });

const rawDataView = {
    offset: [0, 0],
    count: [2, 1],
    totalCount: [2, 1],
    headerItems: [[[header("1234.5"), header("Gold")]], [[{ measureHeaderItem: { name: "M1", order: 0 } }]]],
    data: [[1], [2]],
    definition: {},
    result: { dimensions: [{ headers: [segmentDescriptor] }, { headers: [measureGroup] }] },
    metadata: {},
} as unknown as IDataView;

const layerExecution = {
    layerId: "layer-1",
    layer: { type: "pushpin" },
    execution: {} as IPreparedExecution,
} as unknown as ILayerExecutionRecord;

const context = {
    config: { separators: { thousand: " ", decimal: "," } },
} as unknown as IGeoAdapterContext;

const segmentHeaders = (dataView: DataViewFacade) =>
    dataView.dataView.headerItems[0][0] as IResultAttributeHeader[];

describe("prepareSingleLayer", () => {
    it("hands the adapter, and every later step, the data view with number-formatted element values", async () => {
        const raw = DataViewFacade.for(rawDataView);

        const prepared = await prepareSingleLayer(layerExecution, new Map([["layer-1", raw]]), context);

        // the adapter (geo data, color strategy, legend) and the stored view (pushed colors, map sync,
        // click handling) are the same formatted view, so segments are keyed consistently everywhere
        const [, adapterDataView] = prepareLayer.mock.calls[0] as unknown as [unknown, DataViewFacade];
        expect(adapterDataView).toBe(prepared.dataView);
        expect(segmentHeaders(prepared.dataView).map((h) => h.attributeHeaderItem)).toEqual([
            { uri: "1234.5", name: "1234.5", formattedName: "1 234,5" },
            // not a number: left as it is
            { uri: "Gold", name: "Gold" },
        ]);
        expect(prepared.output).toEqual({ prepared: true });
    });
});
