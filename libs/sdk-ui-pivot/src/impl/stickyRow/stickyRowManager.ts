// (C) 2007-2025 GoodData Corporation
import { invariant } from "ts-invariant";

import { ICorePivotTableProps } from "../../publicTypes.js";
import { ICorePivotTableState, InternalTableState } from "../../tableState.js";
import { IScrollPosition } from "../stickyRowHandler.js";

export interface IStickyRowManagerContext {
    internal: InternalTableState;
    props: ICorePivotTableProps;
    state: ICorePivotTableState;
    getGroupRows: () => boolean;
}

/**
 * Manages sticky row functionality for the pivot table.
 * @internal
 */
export class StickyRowManager {
    constructor(private context: IStickyRowManagerContext) {}

    /**
     * Checks if sticky row functionality is available.
     */
    public isStickyRowAvailable = (): boolean => {
        const { internal, getGroupRows } = this.context;
        invariant(internal.table);

        return Boolean(getGroupRows() && internal.table.stickyRowExists());
    };

    /**
     * Updates the sticky row content and position.
     */
    public updateStickyRow = (): void => {
        const { internal } = this.context;

        if (!internal.table) {
            return;
        }

        if (this.isStickyRowAvailable()) {
            const scrollPosition: IScrollPosition = { ...internal.lastScrollPosition };
            internal.lastScrollPosition = {
                top: 0,
                left: 0,
            };

            this.updateStickyRowContent(scrollPosition);
        }
    };

    /**
     * Updates the content of the sticky row based on scroll position.
     */
    public updateStickyRowContent = (scrollPosition: IScrollPosition): void => {
        const { internal } = this.context;
        invariant(internal.table);

        if (this.isStickyRowAvailable()) {
            // Position update was moved here because in some complicated cases with totals,
            // it was not behaving properly. This was mainly visible in storybook, but it may happen
            // in other environments as well.
            internal.table.updateStickyRowPosition();

            internal.table.updateStickyRowContent({
                scrollPosition,
                lastScrollPosition: internal.lastScrollPosition,
            });
        }

        internal.lastScrollPosition = { ...scrollPosition };
    };
}
