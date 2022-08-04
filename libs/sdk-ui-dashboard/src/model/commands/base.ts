// (C) 2021-2022 GoodData Corporation
/**
 * All available command types.
 *
 * @remarks
 * Note: while this type is marked as public most of the command types are currently an alpha-level API that
 * we reserve to change in the following releases.
 *
 * At this moment, we only consider the GDC.DASH/CMD.SAVEAS as stable
 *
 * @public
 */
export type DashboardCommandType =
    | "GDC.DASH/CMD.INITIALIZE"
    | "GDC.DASH/CMD.SAVE"
    | "GDC.DASH/CMD.SAVEAS"
    | "GDC.DASH/CMD.RESET"
    | "GDC.DASH/CMD.RENAME"
    | "GDC.DASH/CMD.DELETE"
    | "GDC.DASH/CMD.CHANGE_RENDER_MODE"
    | "GDC.DASH/CMD.SHARING.CHANGE"
    | "GDC.DASH/CMD.EXPORT.PDF"
    | "GDC.DASH/CMD.EVENT.TRIGGER"
    | "GDC.DASH/CMD.EXECUTION_RESULT.UPSERT"
    | "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION"
    | "GDC.DASH/CMD.FILTER_CONTEXT.DATE_FILTER.CHANGE_SELECTION"
    | "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.ADD"
    | "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.REMOVE"
    | "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.MOVE"
    | "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.CHANGE_SELECTION"
    | "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_PARENTS"
    | "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_DISPLAY_FORM"
    | "GDC.DASH/CMD.FLUID_LAYOUT.ADD_SECTION"
    | "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_SECTION"
    | "GDC.DASH/CMD.FLUID_LAYOUT.REMOVE_SECTION"
    | "GDC.DASH/CMD.FLUID_LAYOUT.CHANGE_SECTION_HEADER"
    | "GDC.DASH/CMD.FLUID_LAYOUT.ADD_ITEMS"
    | "GDC.DASH/CMD.FLUID_LAYOUT.REPLACE_ITEM"
    | "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_ITEM"
    | "GDC.DASH/CMD.FLUID_LAYOUT.REMOVE_ITEM"
    | "GDC.DASH/CMD.FLUID_LAYOUT.UNDO"
    | "GDC.DASH/CMD.FLUID_LAYOUT.RESIZE_HEIGHT"
    | "GDC.DASH/CMD.FLUID_LAYOUT.RESIZE_WIDTH"
    | "GDC.DASH/CMD.KPI_WIDGET.CHANGE_HEADER"
    | "GDC.DASH/CMD.KPI_WIDGET.CHANGE_MEASURE"
    | "GDC.DASH/CMD.KPI_WIDGET.CHANGE_FILTER_SETTINGS"
    | "GDC.DASH/CMD.KPI_WIDGET.CHANGE_COMPARISON"
    | "GDC.DASH/CMD.KPI_WIDGET.REFRESH"
    | "GDC.DASH/CMD.KPI_WIDGET.SET_DRILL"
    | "GDC.DASH/CMD.KPI_WIDGET.REMOVE_DRILL"
    | "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_HEADER"
    | "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_FILTER_SETTINGS"
    | "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_PROPERTIES"
    | "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_INSIGHT"
    | "GDC.DASH/CMD.INSIGHT_WIDGET.EXPORT"
    | "GDC.DASH/CMD.INSIGHT_WIDGET.MODIFY_DRILLS"
    | "GDC.DASH/CMD.INSIGHT_WIDGET.REMOVE_DRILLS"
    | "GDC.DASH/CMD.INSIGHT_WIDGET.REFRESH"
    | "GDC.DASH/CMD.ALERT.CREATE"
    | "GDC.DASH/CMD.ALERT.UPDATE"
    | "GDC.DASH/CMD.ALERTS.REMOVE"
    | "GDC.DASH/CMD.SCHEDULED_EMAIL.CREATE"
    | "GDC.DASH/CMD.SCHEDULED_EMAIL.SAVE"
    | "GDC.DASH/CMD.DRILL"
    | "GDC.DASH/CMD.DRILL.DRILL_DOWN"
    | "GDC.DASH/CMD.DRILL.DRILL_TO_INSIGHT"
    | "GDC.DASH/CMD.DRILL.DRILL_TO_DASHBOARD"
    | "GDC.DASH/CMD.DRILL.DRILL_TO_ATTRIBUTE_URL"
    | "GDC.DASH/CMD.DRILL.DRILL_TO_CUSTOM_URL"
    | "GDC.DASH/CMD.DRILL.DRILL_TO_LEGACY_DASHBOARD"
    | "GDC.DASH/CMD.DRILL.DRILLABLE_ITEMS.CHANGE"
    | "GDC.DASH/CMD.DRILL_TARGETS.ADD"
    | "GDC.DASH/CMD.RENDER.ASYNC.REQUEST"
    | "GDC.DASH/CMD.RENDER.ASYNC.RESOLVE";

/**
 * @public
 */
export interface CommandProcessingMeta {
    /**
     * Unique identifier assigned at the time command was submitted for processing.
     */
    readonly uuid: string;
}

/**
 * Base type for all commands.
 *
 * @remarks
 * Commands are dispatched using dispatcher obtained by useDashboardDispatcher(). All the dispatchers are 'contextual' -
 * they target backend, workspace and dashboard in depending on the Dashboard component tree from which the dispatch
 * is done.
 *
 * @public
 */
export interface IDashboardCommand {
    /**
     * Command type. Always starts with "GDC.DASH/CMD"
     */
    readonly type: DashboardCommandType;

    /**
     * Correlation ID can be provided when creating a command.
     *
     * @remarks
     * All events emitted during the command processing will contain the same correlation ID.
     *
     * If the correlation ID is not specified, a random string will be assigned.
     */
    readonly correlationId?: string;

    /**
     * Metadata related to processing of the command by the dashboard component.
     *
     * @remarks
     * Note: this metadata is added by the dashboard component. It will be added dynamically to command
     * right after its dispatch.
     */
    readonly meta?: CommandProcessingMeta;
}
