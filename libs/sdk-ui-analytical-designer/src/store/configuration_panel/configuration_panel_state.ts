// (C) 2026 GoodData Corporation

/**
 * `data.configurationPanel` — whether the insight configuration panel is collapsed, and whether it
 * was collapsed by a drag gesture (which makes it pop back open once the drop lands).
 *
 * The slice owns the two STORE_CONFIGURATION_PANEL_* actions. Two more writers touch the subtree on
 * actions the slice does not handle: the buckets add operation clears `collapsedByDragging` when a
 * dragged item is dropped into a bucket, and the open-report case plus the application-reset matcher
 * re-collapse the panel when the insight content is replaced.
 *
 * `collapsedByDragging` is deliberately unseeded: both readers coerce with `|| false`.
 */
export interface IConfigurationPanelState {
    collapsed: boolean;
    collapsedByDragging?: boolean;
}

export const configurationPanelInitialState: IConfigurationPanelState = {
    collapsed: true,
};
