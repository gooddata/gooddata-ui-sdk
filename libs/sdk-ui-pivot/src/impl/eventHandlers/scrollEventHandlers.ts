// (C) 2007-2025 GoodData Corporation
import { type BodyScrollEvent } from "ag-grid-community";

import { type InternalTableState } from "../../tableState.js";
import { type IScrollPosition } from "../stickyRowHandler.js";

export interface IScrollEventHandlerContext {
    internal: InternalTableState;
    updateStickyRowContent: (scrollPosition: IScrollPosition) => void;
}

export class ScrollEventHandlers {
    constructor(private context: IScrollEventHandlerContext) {}

    public onBodyScroll = (event: BodyScrollEvent): void => {
        const scrollPosition: IScrollPosition = {
            top: Math.max(event.top, 0),
            left: event.left,
        };

        this.context.updateStickyRowContent(scrollPosition);
    };

    public onContainerMouseDown = (event: MouseEvent): void => {
        const { internal } = this.context;
        internal.isMetaOrCtrlKeyPressed = event.metaKey || event.ctrlKey;
        internal.isAltKeyPressed = event.altKey;
    };
}
