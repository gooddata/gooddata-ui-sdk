// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { actionChannel, call, getContext, take } from "redux-saga/effects";
import noop from "lodash/noop";

import { initializeDashboardHandler } from "./dashboard/initializeDashboardHandler";
import { DashboardContext } from "../types/commonTypes";
import { DashboardCommands, IDashboardCommand } from "../commands";
import { dispatchDashboardEvent } from "../state/_infra/eventDispatcher";
import {
    commandRejected,
    dashboardCommandStarted,
    internalErrorOccurred,
    isDashboardCommandFailed,
} from "../events/general";
import { saveAsDashboardHandler } from "./dashboard/saveAsDashboardHandler";
import { saveDashboardHandler } from "./dashboard/saveDashboardHandler";
import { changeDateFilterSelectionHandler } from "./filterContext/dateFilter/changeDateFilterSelectionHandler";
import { addAttributeFilterHandler } from "./filterContext/attributeFilter/addAttributeFilterHandler";
import { removeAttributeFiltersHandler } from "./filterContext/attributeFilter/removeAttributeFiltersHandler";
import { moveAttributeFilterHandler } from "./filterContext/attributeFilter/moveAttributeFilterHandler";
import { changeAttributeFilterSelectionHandler } from "./filterContext/attributeFilter/changeAttributeFilterSelectionHandler";
import { setAttributeFilterParentHandler } from "./filterContext/attributeFilter/setAttributeFilterParentHandler";
import { addLayoutSectionHandler } from "./layout/addLayoutSectionHandler";
import { moveLayoutSectionHandler } from "./layout/moveLayoutSectionHandler";
import { removeLayoutSectionHandler } from "./layout/removeLayoutSectionHandler";
import { changeLayoutSectionHeaderHandler } from "./layout/changeLayoutSectionHeaderHandler";
import { addSectionItemsHandler } from "./layout/addSectionItemsHandler";
import { moveSectionItemHandler } from "./layout/moveSectionItemHandler";
import { removeSectionItemHandler } from "./layout/removeSectionItemHandler";
import { undoLayoutChangesHandler } from "./layout/undoLayoutChangesHandler";
import { createAlertHandler } from "./alerts/createAlertHandler";
import { removeAlertsHandler } from "./alerts/removeAlertsHandler";
import { updateAlertHandler } from "./alerts/updateAlertHandler";
import { createScheduledEmailHandler } from "./scheduledEmail/createScheduledEmailHandler";
import { replaceSectionItemHandler } from "./layout/replaceSectionItemHandler";
import { isDashboardEvent } from "../events/base";
import { drillHandler } from "./drill/drillHandler";
import { drillDownHandler } from "./drill/drillDownHandler";
import { drillToInsightHandler } from "./drill/drillToInsightHandler";
import { drillToCustomUrlHandler } from "./drill/drillToCustomUrlHandler";
import { drillToAttributeUrlHandler } from "./drill/drillToAttributeUrlHandler";
import { drillToDashboardHandler } from "./drill/drillToDashboardHandler";
import { changeDrillableItemsHandler } from "./drill/changeDrillableItemsHandler";
import { drillToLegacyDashboardHandler } from "./drill/drillToLegacyDashboardHandler";
import { changeFilterContextSelectionHandler } from "./filterContext/changeFilterContextSelectionHandler";
import { addDrillTargetsHandler } from "./drillTargets/addDrillTargetsHandler";
import { requestAsyncRenderHandler } from "./render/requestAsyncRenderHandler";
import { resolveAsyncRenderHandler } from "./render/resolveAsyncRenderHandler";
import { changeInsightWidgetHeaderHandler } from "./widgets/changeInsightWidgetHeaderHandler";
import { modifyDrillsForInsightWidgetHandler } from "./widgets/modifyDrillsForInsightWidgetHandler";
import { removeDrillsForInsightWidgetHandler } from "./widgets/removeDrillsForInsightWidgetHandler";
import { changeInsightWidgetVisPropertiesHandler } from "./widgets/changeInsightWidgetVisPropertiesHandler";
import { changeInsightWidgetFilterSettingsHandler } from "./widgets/changeInsightWidgetFilterSettingsHandler";
import { changeKpiWidgetHeaderHandler } from "./widgets/changeKpiWidgetHeaderHandler";
import { changeKpiWidgetFilterSettingsHandler } from "./widgets/changeKpiWidgetFilterSettingsHandler";
import { triggerEventHandler } from "./events/triggerEventHandler";
import { changeKpiWidgetMeasureHandler } from "./widgets/changeKpiWidgetMeasureHandler";
import { changeKpiWidgetComparisonHandler } from "./widgets/changeKpiWidgetComparisonHandler";
import { exportDashboardToPdfHandler } from "./dashboard/exportDashboardToPdfHandler";
import { exportInsightWidgetHandler } from "./widgets/exportInsightWidgetHandler";
import { upsertExecutionResultHandler } from "./executionResults/upsertExecutionResultHandler";
import { renameDashboardHandler } from "./dashboard/renameDashboardHandler";
import { deleteDashboardHandler } from "./dashboard/deleteDashboardHandler";
import { resetDashboardHandler } from "./dashboard/resetDashboardHandler";

const DefaultCommandHandlers: {
    [cmd in DashboardCommands["type"]]?: (...args: any[]) => SagaIterator<any> | any;
} = {
    "GDC.DASH/CMD.INITIALIZE": initializeDashboardHandler,
    "GDC.DASH/CMD.SAVE": saveDashboardHandler,
    "GDC.DASH/CMD.SAVEAS": saveAsDashboardHandler,
    "GDC.DASH/CMD.RESET": resetDashboardHandler,
    "GDC.DASH/CMD.RENAME": renameDashboardHandler,
    "GDC.DASH/CMD.DELETE": deleteDashboardHandler,
    "GDC.DASH/CMD.EXPORT.PDF": exportDashboardToPdfHandler,
    "GDC.DASH/CMD.EVENT.TRIGGER": triggerEventHandler,
    "GDC.DASH/CMD.EXECUTION_RESULT.UPSERT": upsertExecutionResultHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION": changeFilterContextSelectionHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.DATE_FILTER.CHANGE_SELECTION": changeDateFilterSelectionHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.ADD": addAttributeFilterHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.REMOVE": removeAttributeFiltersHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.MOVE": moveAttributeFilterHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.CHANGE_SELECTION": changeAttributeFilterSelectionHandler,
    "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_PARENT": setAttributeFilterParentHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.ADD_SECTION": addLayoutSectionHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_SECTION": moveLayoutSectionHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.REMOVE_SECTION": removeLayoutSectionHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.CHANGE_SECTION_HEADER": changeLayoutSectionHeaderHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.ADD_ITEMS": addSectionItemsHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_ITEM": moveSectionItemHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.REMOVE_ITEM": removeSectionItemHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.REPLACE_ITEM": replaceSectionItemHandler,
    "GDC.DASH/CMD.FLUID_LAYOUT.UNDO": undoLayoutChangesHandler,
    "GDC.DASH/CMD.KPI_WIDGET.CHANGE_HEADER": changeKpiWidgetHeaderHandler,
    "GDC.DASH/CMD.KPI_WIDGET.CHANGE_MEASURE": changeKpiWidgetMeasureHandler,
    "GDC.DASH/CMD.KPI_WIDGET.CHANGE_FILTER_SETTINGS": changeKpiWidgetFilterSettingsHandler,
    "GDC.DASH/CMD.KPI_WIDGET.CHANGE_COMPARISON": changeKpiWidgetComparisonHandler,
    "GDC.DASH/CMD.KPI_WIDGET.REFRESH": unhandledCommand,
    "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_HEADER": changeInsightWidgetHeaderHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_FILTER_SETTINGS": changeInsightWidgetFilterSettingsHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_PROPERTIES": changeInsightWidgetVisPropertiesHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.CHANGE_INSIGHT": unhandledCommand,
    "GDC.DASH/CMD.INSIGHT_WIDGET.MODIFY_DRILLS": modifyDrillsForInsightWidgetHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.REMOVE_DRILLS": removeDrillsForInsightWidgetHandler,
    "GDC.DASH/CMD.INSIGHT_WIDGET.REFRESH": unhandledCommand,
    "GDC.DASH/CMD.INSIGHT_WIDGET.EXPORT": exportInsightWidgetHandler,
    "GDC.DASH/CMD.ALERT.CREATE": createAlertHandler,
    "GDC.DASH/CMD.ALERT.UPDATE": updateAlertHandler,
    "GDC.DASH/CMD.ALERTS.REMOVE": removeAlertsHandler,
    "GDC.DASH/CMD.SCHEDULED_EMAIL.CREATE": createScheduledEmailHandler,
    "GDC.DASH/CMD.DRILL": drillHandler,
    "GDC.DASH/CMD.DRILL.DRILL_DOWN": drillDownHandler,
    "GDC.DASH/CMD.DRILL.DRILL_TO_INSIGHT": drillToInsightHandler,
    "GDC.DASH/CMD.DRILL.DRILL_TO_DASHBOARD": drillToDashboardHandler,
    "GDC.DASH/CMD.DRILL.DRILL_TO_ATTRIBUTE_URL": drillToAttributeUrlHandler,
    "GDC.DASH/CMD.DRILL.DRILL_TO_CUSTOM_URL": drillToCustomUrlHandler,
    "GDC.DASH/CMD.DRILL.DRILL_TO_LEGACY_DASHBOARD": drillToLegacyDashboardHandler,
    "GDC.DASH/CMD.DRILL.DRILLABLE_ITEMS.CHANGE": changeDrillableItemsHandler,
    "GDC.DASH/CMD.DRILL_TARGETS.ADD": addDrillTargetsHandler,
    "GDC.DASH/CMD.RENDER.ASYNC.REQUEST": requestAsyncRenderHandler,
    "GDC.DASH/CMD.RENDER.ASYNC.RESOLVE": resolveAsyncRenderHandler,
};

function* unhandledCommand(ctx: DashboardContext, cmd: IDashboardCommand) {
    yield dispatchDashboardEvent(commandRejected(ctx, cmd.correlationId));
}

/**
 * @internal
 */
export const CommandEnvelopeActionTypeName = "@@COMMAND.ENVELOPE";

type CommandEnvelopeEventHandlers<TCommand extends IDashboardCommand, TResult> = {
    onStart: (command: TCommand) => void;
    onSuccess: (result: TResult) => void;
    onError: (err: Error) => void;
};

type CommandEnvelope<TCommand extends IDashboardCommand, TResult> = Readonly<
    CommandEnvelopeEventHandlers<TCommand, TResult>
> & {
    readonly type: typeof CommandEnvelopeActionTypeName;
    readonly command: TCommand;
};

export function commandEnvelope<TCommand extends IDashboardCommand, TResult>(
    command: TCommand,
    eventHandlers?: Partial<CommandEnvelopeEventHandlers<TCommand, TResult>>,
): CommandEnvelope<TCommand, TResult> {
    return {
        type: CommandEnvelopeActionTypeName,
        command,
        onError: eventHandlers?.onError ?? noop,
        onStart: eventHandlers?.onStart ?? noop,
        onSuccess: eventHandlers?.onSuccess ?? noop,
    };
}

/**
 * @internal
 */
export function commandEnvelopeWithPromise<TCommand extends IDashboardCommand, TResult>(
    command: TCommand,
): {
    promise: Promise<TResult>;
    envelope: CommandEnvelope<TCommand, TResult>;
} {
    const commandEnvelopeEventHandlers: Partial<CommandEnvelopeEventHandlers<TCommand, TResult>> = {};

    const promise = new Promise<TResult>((resolve, reject) => {
        commandEnvelopeEventHandlers.onSuccess = resolve;
        commandEnvelopeEventHandlers.onError = reject;
    });

    const envelope = commandEnvelope(command, commandEnvelopeEventHandlers);

    return {
        promise,
        envelope,
    };
}

function isCommandEnvelope(obj: unknown): obj is CommandEnvelope<any, any> {
    return !!obj && (obj as CommandEnvelope<any, any>).type === CommandEnvelopeActionTypeName;
}

function ensureCommandWrappedInEnvelope(
    action: DashboardCommands | CommandEnvelope<DashboardCommands, any>,
): CommandEnvelope<DashboardCommands, any> {
    return isCommandEnvelope(action) ? action : commandEnvelope(action as DashboardCommands);
}

function* processCommand(
    ctx: DashboardContext,
    envelope: CommandEnvelope<DashboardCommands, any>,
): SagaIterator<void> {
    const {
        command,
        command: { type, correlationId },
    } = envelope;
    const correlationIdForLog = correlationId ?? "(no correlationId provided)";

    const commandHandler = DefaultCommandHandlers[envelope.command.type] ?? unhandledCommand;

    try {
        yield dispatchDashboardEvent(dashboardCommandStarted(ctx, envelope.command));
        try {
            envelope.onStart(command);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn(
                `An error has occurred while calling onStart function provided for ${type}@${correlationIdForLog} processing:`,
                e,
            );
        }

        const result = yield call(commandHandler, ctx, command);

        if (isDashboardEvent(result)) {
            yield dispatchDashboardEvent(result);
        }

        try {
            envelope.onSuccess(result);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn(
                `An error has occurred while calling onSuccess function provided for ${type}@${correlationIdForLog} processing`,
                e,
            );
        }
    } catch (e: any) {
        try {
            envelope.onError(e);
        } catch (ne) {
            // eslint-disable-next-line no-console
            console.warn(
                `An error has occurred while calling onError function provided for ${type}@${correlationIdForLog} processing:`,
                ne,
            );
        }

        if (isDashboardCommandFailed(e)) {
            yield dispatchDashboardEvent(e);
        } else {
            // Errors during command handling should be caught and addressed in the handler, possibly with a
            // more meaningful error message. If the error bubbles up to here then there are holes in error
            // handling or something is seriously messed up.
            yield dispatchDashboardEvent(
                internalErrorOccurred(ctx, command, `Internal error has occurred while handling ${type}`, e),
            );
        }
    }
}

/**
 * Root command handler is the central point through which all command processing is done. The handler registers
 * for all actions starting with `GDC.DASH/CMD` === all dashboard commands.
 *
 * The commands are intended for serial processing, without any forking. A buffering action channel is in place to
 * prevent loss of commands.
 */
export function* rootCommandHandler(): SagaIterator<void> {
    const commandChannel = yield actionChannel(
        (action: any) =>
            action.type === CommandEnvelopeActionTypeName || action.type.startsWith("GDC.DASH/CMD"),
    );

    while (true) {
        const command: DashboardCommands | CommandEnvelope<DashboardCommands, any> = yield take(
            commandChannel,
        );
        const envelope = ensureCommandWrappedInEnvelope(command);
        const ctx: DashboardContext = yield getContext("dashboardContext");

        yield call(processCommand, ctx, envelope);
    }
}
