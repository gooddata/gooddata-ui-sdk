// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import {
    GdcAdEventType,
    GdcEventType,
    GdcProductName,
    type IAdAvailableCommands,
} from "@gooddata/sdk-embedding";

import { type IAdEmbeddedCallbacks, deliverEventToCallbacks } from "./embeddedCallbacks.js";

const data: IAdAvailableCommands = { availableCommands: [] };

describe("deliverEventToCallbacks", () => {
    it.each<[string, keyof IAdEmbeddedCallbacks, unknown[]]>([
        [GdcAdEventType.InsightSaved, "onInsightSaved", [data, "context-1"]],
        [GdcAdEventType.InsightEditingCancelled, "onInsightEditingCancelled", []],
        [GdcAdEventType.InsightOpened, "onInsightOpened", [data]],
        [GdcAdEventType.InsightRendered, "onInsightRendered", [data]],
        [GdcAdEventType.InsightChanged, "onInsightChanged", [data]],
        [GdcAdEventType.ClearFinished, "onClearFinished", [data, "context-1"]],
        [GdcAdEventType.ClearInsightFinished, "onClearInsightFinished", [data, "context-1"]],
        [GdcAdEventType.UndoFinished, "onUndoFinished", [data, "context-1"]],
        [GdcAdEventType.RedoFinished, "onRedoFinished", [data, "context-1"]],
        [GdcAdEventType.ExportFinished, "onExportFinished", [data, "context-1"]],
        [GdcAdEventType.FilterContextChanged, "onFilterContextChanged", [data]],
        [GdcAdEventType.SetFilterContextFinished, "onSetFilterContextFinished", [data, "context-1"]],
        [GdcAdEventType.RemoveFilterContextFinished, "onRemoveFilterContextFinished", [data, "context-1"]],
        [GdcEventType.AppCommandFailed, "onAppCommandFailed", [data, "context-1"]],
        [GdcAdEventType.AttributeHierarchyModified, "onAttributeHierarchyModified", []],
    ])("delivers %s to %s", (name, callbackName, expectedArgs) => {
        const callback = vi.fn();
        const onEvent = vi.fn();
        const event = { product: GdcProductName.ANALYTICAL_DESIGNER, name, data, contextId: "context-1" };

        deliverEventToCallbacks(event, { onEvent, [callbackName]: callback });

        expect(onEvent).toHaveBeenCalledWith(event);
        expect(callback).toHaveBeenCalledWith(...expectedArgs);
    });
});
