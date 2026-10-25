// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

import { BUCKET_ITEM } from "../constants/drag_item_types.js";
import { dragItemFailed } from "../sagas/drag_and_drop/drag_and_drop_actions.js";
import { type IDraggedItem } from "../typings/drag_and_drop.js";

import { type CustomDragLayerProps, type ICustomDragLayerState, setCurrentState } from "./CustomDragLayer.js";

describe("CustomDragLayer", () => {
    describe("#setCurrentState", () => {
        let state: ICustomDragLayerState;
        const defaultProps: CustomDragLayerProps = {
            item: null,
            currentOffset: null,
            isDragging: false,
            initialOffset: null,
            itemType: BUCKET_ITEM,
        };

        beforeEach(() => {
            state = { item: null, initialOffset: null, currentOffset: null };
        });

        function setState(fn: (state: ICustomDragLayerState) => ICustomDragLayerState) {
            state = fn(state);
        }

        // a partial dragged-item probe is all setCurrentState reads
        const item = { dragged: "N/A", from: "N/A" } as IDraggedItem;
        const offset = { x: 0, y: 4 };

        it("should set item and initialOffset on startDrag", () => {
            const newProps: CustomDragLayerProps = {
                ...defaultProps,
                item,
                currentOffset: offset,
                isDragging: true,
            };

            setCurrentState(newProps, state, setState);

            expect(state.item).toEqual(newProps.item);
            expect(state.initialOffset).toEqual(newProps.currentOffset);
        });

        it("should set currentOffset on drag", () => {
            const newProps: CustomDragLayerProps = {
                ...defaultProps,
                item,
                currentOffset: offset,
                isDragging: true,
            };

            setCurrentState(newProps, state, setState);

            expect(state.currentOffset).toEqual(newProps.currentOffset);
        });

        it("should remove item and initialOffset on drop", () => {
            const newProps: CustomDragLayerProps = {
                ...defaultProps,
                item,
                currentOffset: null,
                isDragging: true,
            };

            setCurrentState(newProps, state, setState);

            expect(state.item).toEqual(null);
            expect(state.initialOffset).toEqual(null);
        });

        it("should reset item and initialOffset on drag end", () => {
            const newProps: CustomDragLayerProps = {
                ...defaultProps,
                item: null,
                currentOffset: null,
                isDragging: false,
            };

            state = { item, initialOffset: offset, currentOffset: offset };

            setCurrentState(newProps, state, setState);

            expect(state.item).toEqual(null);
            expect(state.initialOffset).toEqual(null);
        });

        it("should log mouse position on drag fail", () => {
            const newProps: CustomDragLayerProps = {
                ...defaultProps,
                item: null,
                currentOffset: null,
                isDragging: false,
            };
            const customDispatch = vi.fn();
            const expectedPayload = dragItemFailed(offset.x, offset.y, "N/A", "N/A");
            state = { item, initialOffset: offset, currentOffset: offset };

            setCurrentState(newProps, state, setState, customDispatch);
            expect(customDispatch).toHaveBeenCalledWith(expectedPayload);
        });
    });
});
