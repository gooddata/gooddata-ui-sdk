// (C) 2019-2022 GoodData Corporation
import { newTestAttributeFilterHandler } from "./fixtures.js";
import { describe, it, expect, vi } from "vitest";

const changedSelection = {
    isInverted: true,
    keys: ["/selectedElement"],
    irrelevantKeys: [] as string[],
};

const changedSelectionWithIrrelevantElements = {
    isInverted: true,
    keys: ["/selectedElement", "/irrelevantElement"],
    irrelevantKeys: ["/irrelevantElement"],
};

describe("MultiSelectAttributeFilterHandler", () => {
    it("should initialize selection for positive attribute filter", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        expect(attributeFilterHandler.getCommittedSelection()).toMatchSnapshot("committed selection");
        expect(attributeFilterHandler.getWorkingSelection()).toMatchSnapshot("working selection");
    });

    it("should initialize selection for negative attribute filter", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("negative");

        expect(attributeFilterHandler.getCommittedSelection()).toMatchSnapshot("committed selection");
        expect(attributeFilterHandler.getWorkingSelection()).toMatchSnapshot("working selection");
    });

    it("changeSelection() should trigger onSelectionChanged() callback", async () => {
        const onSelectionChanged = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.onSelectionChanged(onSelectionChanged);
        attributeFilterHandler.changeSelection(changedSelection);

        expect(onSelectionChanged).toHaveBeenCalledTimes(1);
        expect(onSelectionChanged.mock.calls[0]).toMatchSnapshot("parameters");
    });

    it("changeSelection() should change the selection", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.changeSelection(changedSelectionWithIrrelevantElements);

        expect(attributeFilterHandler.getWorkingSelection()).toEqual(changedSelectionWithIrrelevantElements);
    });

    it("revertSelection() should trigger onSelectionChanged() callback", async () => {
        const onSelectionChanged = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.changeSelection(changedSelection);

        attributeFilterHandler.onSelectionChanged(onSelectionChanged);
        attributeFilterHandler.revertSelection();

        expect(onSelectionChanged).toHaveBeenCalledTimes(1);
        expect(onSelectionChanged.mock.calls[0]).toMatchSnapshot("parameters");
    });

    it("revertSelection() should revert the selection", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        const selectionBeforeTheChange = attributeFilterHandler.getCommittedSelection();

        attributeFilterHandler.changeSelection(changedSelection);
        attributeFilterHandler.revertSelection();

        expect(attributeFilterHandler.getWorkingSelection()).toEqual(selectionBeforeTheChange);
    });

    it("invertSelection() should trigger onSelectionChanged() callback", async () => {
        const onSelectionChanged = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.onSelectionChanged(onSelectionChanged);
        attributeFilterHandler.invertSelection();

        expect(onSelectionChanged).toHaveBeenCalledTimes(1);
        expect(onSelectionChanged.mock.calls[0]).toMatchSnapshot("parameters");
    });

    it("invertSelection() should invert the selection", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        const selectionBeforeTheChange = attributeFilterHandler.getWorkingSelection();

        attributeFilterHandler.invertSelection();

        expect(attributeFilterHandler.getWorkingSelection().isInverted).toBe(
            !selectionBeforeTheChange.isInverted,
        );
    });

    it("commitSelection() should trigger onSelectionCommitted() callback", async () => {
        const onSelectionCommitted = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.onSelectionCommitted(onSelectionCommitted);
        attributeFilterHandler.changeSelection(changedSelection);
        attributeFilterHandler.commitSelection();

        expect(onSelectionCommitted).toHaveBeenCalledTimes(1);
        expect(onSelectionCommitted.mock.calls[0]).toMatchSnapshot("parameters");
    });

    it("commitSelection() should commit the selection", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.changeSelection(changedSelection);
        attributeFilterHandler.commitSelection();

        expect(attributeFilterHandler.getCommittedSelection()).toEqual(changedSelection);
    });

    it("clearSelection() should trigger onSelectionChanged() callback", async () => {
        const onSelectionChanged = vi.fn();
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.onSelectionChanged(onSelectionChanged);
        attributeFilterHandler.clearSelection();

        expect(onSelectionChanged).toHaveBeenCalledTimes(1);
        expect(onSelectionChanged.mock.calls[0]).toMatchSnapshot("parameters");
    });

    it("clearSelection() should clear the selection", async () => {
        const attributeFilterHandler = newTestAttributeFilterHandler("positive");

        attributeFilterHandler.changeSelection(changedSelection);
        attributeFilterHandler.clearSelection();

        expect(attributeFilterHandler.getWorkingSelection().keys).toEqual([]);
    });
});
