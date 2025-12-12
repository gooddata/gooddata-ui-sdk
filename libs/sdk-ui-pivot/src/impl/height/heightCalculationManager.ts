// (C) 2007-2025 GoodData Corporation
import { type ICorePivotTableProps } from "../../publicTypes.js";
import { type ICorePivotTableState, type InternalTableState } from "../../tableState.js";
import { scrollBarExists } from "../base/agUtils.js";
import { getScrollbarWidth } from "../utils.js";

export interface IHeightCalculationManagerContext {
    internal: InternalTableState;
    props: ICorePivotTableProps;
    state: ICorePivotTableState;
    setState: (state: Partial<ICorePivotTableState>, callback?: () => void) => void;
    getContainerRef: () => HTMLDivElement | undefined;
}

/**
 * Manages height calculations for the pivot table including desired height
 * and scrollbar padding calculations.
 * @internal
 */
export class HeightCalculationManager {
    // Height change tolerance to prevent feedback loops
    private static readonly HEIGHT_CHANGE_TOLERANCE = 2;

    constructor(private context: IHeightCalculationManagerContext) {}

    /**
     * Calculates the padding needed for scrollbars.
     */
    public getScrollBarPadding = (): number => {
        const { internal, getContainerRef } = this.context;

        if (!internal.table?.isFullyInitialized()) {
            return 0;
        }

        const containerRef = getContainerRef();
        if (!containerRef) {
            return 0;
        }

        // check for scrollbar presence
        return scrollBarExists(containerRef) ? getScrollbarWidth() : 0;
    };

    /**
     * Calculates the desired height for the table based on content and configuration.
     */
    public calculateDesiredHeight = (): number | undefined => {
        const { internal, props } = this.context;
        const { maxHeight } = props.config!;

        if (!maxHeight) {
            return;
        }

        const bodyHeight = internal.table?.getTotalBodyHeight() ?? 0;
        const totalHeight = bodyHeight + this.getScrollBarPadding();

        return Math.min(totalHeight, maxHeight);
    };

    /**
     * Updates the desired height in the component state.
     *
     * This method includes logic to prevent feedback loops by ignoring changes
     * smaller than HEIGHT_CHANGE_TOLERANCE pixels.
     */
    public updateDesiredHeight = (): void => {
        const { internal, state, setState } = this.context;

        if (!internal.table) {
            return;
        }

        const desiredHeight = this.calculateDesiredHeight();

        /*
         * For some mysterious reasons, there sometimes is exactly 2px discrepancy between the current height
         * and the maxHeight coming from the config. This 2px seems to be unrelated to any CSS property (border,
         * padding, etc.) not even the leeway variable in getTotalBodyHeight.
         * In these cases there is a positive feedback loop between the maxHeight and the config:
         *
         * increase in desiredHeight -> increase in config.maxHeight -> increase in desiredHeight -> ...
         *
         * This causes the table to grow in height in 2px increments until it reaches its full size - then
         * the resizing stops as bodyHeight of the table gets smaller than the maxHeight and "wins"
         * in calculateDesiredHeight)...
         *
         * So we ignore changes smaller than those 2px to break the loop as it is quite unlikely that such a small
         * change would be legitimate (and if it is, a mismatch of 2px should not have practical consequences).
         *
         * Ideally, this maxHeight would not be needed at all (if I remove it altogether, the problem goes away),
         * however, it is necessary for ONE-4322 (there seems to be no native way of doing this in ag-grid itself).
         */
        if (
            state.desiredHeight === undefined ||
            (desiredHeight !== undefined &&
                Math.abs(state.desiredHeight - desiredHeight) >
                    HeightCalculationManager.HEIGHT_CHANGE_TOLERANCE)
        ) {
            setState({ desiredHeight });
        }
    };
}
