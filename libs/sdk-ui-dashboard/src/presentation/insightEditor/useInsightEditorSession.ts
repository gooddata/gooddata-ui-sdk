// (C) 2020-2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useRef } from "react";

import { defineMessages } from "react-intl";

import {
    type IInsight,
    type ObjRef,
    idRef,
    insightRef,
    insightTitle,
    insightVisualizationType,
    isInsightWidget,
} from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { INSIGHT_WIDGET_SIZE_INFO_DEFAULT } from "@gooddata/sdk-ui-ext";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { getSizeInfo } from "../../_staging/layout/sizing.js";
import { changeInsightWidgetInsight } from "../../model/commands/insight.js";
import {
    eagerRemoveNestedLayoutSectionItem,
    replaceNestedLayoutSectionItem,
} from "../../model/commands/layout.js";
import { insightEditorCancelled, insightEditorInsightSaved } from "../../model/events/insightEditor.js";
import { type IDashboardLayoutSectionItemReplaced } from "../../model/events/layout.js";
import { useDashboardDispatch, useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { useDashboardEventDispatch } from "../../model/react/useDashboardEventDispatch.js";
import { dispatchAndWaitFor } from "../../model/store/_infra/dispatchAndWaitFor.js";
import { selectSettings } from "../../model/store/config/configSelectors.js";
import { selectInsightByWidgetRef } from "../../model/store/insights/insightsSelectors.js";
import { selectIsInEditMode } from "../../model/store/renderMode/renderModeSelectors.js";
import {
    selectInsightWidgetPlaceholderPath,
    selectWidgetByRef,
} from "../../model/store/tabs/layout/layoutSelectors.js";
import { type DashboardDispatch } from "../../model/store/types.js";
import { uiActions } from "../../model/store/ui/index.js";
import { type InsightEditorTarget } from "../../model/types/insightEditorTypes.js";
import { type ILayoutItemPath } from "../../types.js";

const messages = defineMessages({
    placementFailed: { id: "insightEditor.save.placementFailed" },
});

interface ISessionState {
    isEditMode: boolean;
    placeholderPath: ILayoutItemPath | undefined;
    settings: ReturnType<typeof selectSettings>;
    widget: ReturnType<ReturnType<typeof selectWidgetByRef>>;
    widgetInsight: ReturnType<ReturnType<typeof selectInsightByWidgetRef>>;
}

export interface IInsightEditorSession {
    /**
     * Closes the editor without saving. It removes the placeholder of a new insight. It does nothing
     * after the session ended or while a save runs.
     */
    cancel: () => void;

    /**
     * Puts the insight that the user saved in Analytical Designer on the dashboard and closes the
     * editor.
     */
    save: (insightIdentifier: string) => Promise<void>;
}

/**
 * The actions that finish the editing session of the target. They need no Analytical Designer code,
 * so the editor can close while its chunk still loads.
 */
export function useInsightEditorSession(target: InsightEditorTarget): IInsightEditorSession {
    const dispatch = useDashboardDispatch();
    const eventDispatch = useDashboardEventDispatch();
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const { addError } = useToastMessage();

    const widgetRef = target.type === "widget" ? target.ref : undefined;
    const state: ISessionState = {
        isEditMode: useDashboardSelector(selectIsInEditMode),
        placeholderPath: useDashboardSelector(selectInsightWidgetPlaceholderPath),
        settings: useDashboardSelector(selectSettings),
        widget: useDashboardSelector(selectWidgetByRef(widgetRef)),
        widgetInsight: useDashboardSelector(selectInsightByWidgetRef(widgetRef)),
    };
    // The handlers run after AD events, so they read the state of that moment.
    const stateRef = useRef(state);
    useEffect(() => {
        stateRef.current = state;
    });

    // AD confirms a cancellation at once after a save. The first save or cancel ends the session, so a
    // cancellation during a running save cannot remove the placeholder that the save fills.
    const isSettledRef = useRef(false);

    const close = useCallback(() => {
        dispatch(uiActions.closeInsightEditor());
    }, [dispatch]);

    const removePlaceholder = useCallback(() => {
        const { placeholderPath } = stateRef.current;
        if (target.type === "placeholder" && placeholderPath) {
            dispatch(eagerRemoveNestedLayoutSectionItem(placeholderPath));
        }
    }, [target, dispatch]);

    const cancel = useCallback(() => {
        if (isSettledRef.current) {
            return;
        }
        isSettledRef.current = true;
        close();
        eventDispatch(insightEditorCancelled(target));
        removePlaceholder();
    }, [close, eventDispatch, target, removePlaceholder]);

    const save = useCallback(
        async (insightIdentifier: string) => {
            if (isSettledRef.current) {
                return;
            }
            isSettledRef.current = true;

            let insight: IInsight | undefined;
            try {
                insight = await backend
                    .workspace(workspace)
                    .insights()
                    .getInsight(idRef(insightIdentifier, "insight"));
                if (stateRef.current.isEditMode) {
                    await placeInsight(dispatch, target, insight, stateRef.current);
                }

                close();
                eventDispatch(insightEditorInsightSaved(target, insight));
            } catch (error) {
                console.error(
                    "The insight saved in Analytical Designer cannot be put on the dashboard.",
                    error,
                );
                close();
                removePlaceholder();
                addError(messages.placementFailed);
                // The insight exists in the backend, so listeners must learn about it when it loaded.
                eventDispatch(
                    insight ? insightEditorInsightSaved(target, insight) : insightEditorCancelled(target),
                );
            }
        },
        [backend, workspace, target, dispatch, close, removePlaceholder, addError, eventDispatch],
    );

    return useMemo(() => ({ cancel, save }), [cancel, save]);
}

async function placeInsight(
    dispatch: DashboardDispatch,
    target: InsightEditorTarget,
    insight: IInsight,
    { placeholderPath, settings, widget, widgetInsight }: ISessionState,
): Promise<void> {
    if (target.type === "placeholder") {
        if (placeholderPath) {
            await addInsightToPlaceholder(
                dispatch,
                insight,
                placeholderPath,
                getSizeInfo(settings, "insight", insight),
            );
        }
    } else if (target.type === "widget") {
        if (isInsightWidget(widget)) {
            const originalType = widgetInsight && insightVisualizationType(widgetInsight);
            const newType = insightVisualizationType(insight);
            // Table sizes reset always, as the buckets may have changed.
            const sizes = originalType === newType && newType !== "table" ? undefined : {};
            dispatch(changeInsightWidgetInsight(widget.ref, insightRef(insight), sizes));
        }
    } else {
        // The new insight is not on the dashboard yet, so the list of insights must show it.
        dispatch(uiActions.requestInsightListUpdate());
    }
}

async function addInsightToPlaceholder(
    dispatch: DashboardDispatch,
    insight: IInsight,
    placeholderPath: ILayoutItemPath,
    sizeInfo: ReturnType<typeof getSizeInfo>,
): Promise<void> {
    const itemReplaced = await dispatchAndWaitFor<
        ReturnType<typeof replaceNestedLayoutSectionItem>,
        IDashboardLayoutSectionItemReplaced
    >(
        dispatch,
        replaceNestedLayoutSectionItem(
            placeholderPath,
            {
                type: "IDashboardLayoutItem",
                size: {
                    xl: {
                        gridHeight:
                            sizeInfo.height.default || INSIGHT_WIDGET_SIZE_INFO_DEFAULT.height.default,
                        gridWidth: sizeInfo.width.default || INSIGHT_WIDGET_SIZE_INFO_DEFAULT.width.default,
                    },
                },
                widget: {
                    type: "insight",
                    insight: insightRef(insight),
                    ignoreDashboardFilters: [],
                    drills: [],
                    title: insightTitle(insight),
                    description: "",
                    configuration: { hideTitle: false },
                    properties: {},
                },
            },
            undefined,
            true, // auto select the default date dataset
        ),
    );

    const addedWidgetRef: ObjRef | undefined = itemReplaced.payload.items[0]?.widget?.ref;
    if (addedWidgetRef) {
        dispatch(uiActions.selectWidget(addedWidgetRef));
        dispatch(uiActions.setConfigurationPanelOpened(true));
    }
    dispatch(uiActions.requestInsightListUpdate());
}
