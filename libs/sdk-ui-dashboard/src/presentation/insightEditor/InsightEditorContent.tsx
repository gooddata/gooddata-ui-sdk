// (C) 2026 GoodData Corporation

import { type MutableRefObject, useEffect, useMemo, useRef, useState } from "react";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { insightIsLocked, insightRef } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import {
    AnalyticalDesigner,
    type IAnalyticalDesignerApi,
    type IAnalyticalDesignerCacheReset,
    type IAnalyticalDesignerConfig,
} from "@gooddata/sdk-ui-analytical-designer";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { attributeHierarchyModified } from "../../model/commands/insight.js";
import { insightEditorCacheResetRequested } from "../../model/events/insightEditor.js";
import { useDashboardDispatch, useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { useDashboardEventDispatch } from "../../model/react/useDashboardEventDispatch.js";
import {
    selectAgGridToken,
    selectColorPalette,
    selectIsEmbedded,
    selectIsWhiteLabeled,
    selectLocale,
    selectMapboxToken,
    selectObjectAvailabilityConfig,
    selectSeparators,
    selectSettings,
} from "../../model/store/config/configSelectors.js";
import { selectEntitlements } from "../../model/store/entitlements/entitlementsSelectors.js";
import { selectInsightByWidgetRef } from "../../model/store/insights/insightsSelectors.js";
import { selectDashboardId } from "../../model/store/meta/metaSelectors.js";
import {
    selectCanCreateVisualization,
    selectCanManageWorkspace,
    selectPermissions,
} from "../../model/store/permissions/permissionsSelectors.js";
import { selectIsInEditMode } from "../../model/store/renderMode/renderModeSelectors.js";
import { selectExecutionTimestamp } from "../../model/store/ui/uiSelectors.js";
import { selectCurrentUser } from "../../model/store/user/userSelectors.js";
import { type InsightEditorTarget } from "../../model/types/insightEditorTypes.js";

import { getInsightEditorRoute } from "./insightEditorRoute.js";
import { type IInsightEditorCloseHandle } from "./types.js";
import { useExploreFilterTransfer } from "./useExploreFilterTransfer.js";
import { type IInsightEditorSession } from "./useInsightEditorSession.js";
// The stylesheets Analytical Designer needs load with its lazy chunk, the SDK ones first, so the
// rules of Analytical Designer win.
// oxlint-disable-next-line import/no-unassigned-import
import "@gooddata/sdk-ui-kit/styles/css/main.css";
// oxlint-disable-next-line import/no-unassigned-import
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
// oxlint-disable-next-line import/no-unassigned-import
import "@gooddata/sdk-ui-geo/styles/css/main.css";
// oxlint-disable-next-line import/no-unassigned-import
import "@gooddata/sdk-ui-charts/styles/css/main.css";
// oxlint-disable-next-line import/no-unassigned-import
import "@gooddata/sdk-ui-filters/styles/css/measureValueFilter.css";
// oxlint-disable-next-line import/no-unassigned-import
import "@gooddata/sdk-ui-filters/styles/css/dateFilter.css";
// oxlint-disable-next-line import/no-unassigned-import
import "@gooddata/sdk-ui-filters/styles/css/rankingFilter.css";
// oxlint-disable-next-line import/no-unassigned-import
import "@gooddata/sdk-ui-filters/styles/css/attributeFilterNext.css";
// oxlint-disable-next-line import/no-unassigned-import
import "@gooddata/sdk-ui-ext/styles/css/main.css";
// oxlint-disable-next-line import/no-unassigned-import
import "@gooddata/sdk-ui-semantic-search/styles/css/internal.css";
// oxlint-disable-next-line import/no-unassigned-import
import "@gooddata/sdk-ui-analytical-designer/styles/css/main.css";

export interface IInsightEditorContentProps {
    target: InsightEditorTarget;
    session: IInsightEditorSession;
    closeHandleRef: MutableRefObject<IInsightEditorCloseHandle | null>;
}

/**
 * Analytical Designer in the insight editor overlay. It lives in a lazily loaded chunk together with
 * the whole Analytical Designer.
 */
export function InsightEditorContent({ target, session, closeHandleRef }: IInsightEditorContentProps) {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const dispatch = useDashboardDispatch();
    const eventDispatch = useDashboardEventDispatch();
    const hostConfig = useHostConfig();
    const theme = useTheme();
    const permissions = useDashboardSelector(selectPermissions);
    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const route = useRoute(target, isEditMode);

    const apiRef = useRef<IAnalyticalDesignerApi | null>(null);
    const [isFailed, setIsFailed] = useState(false);

    useEffect(() => {
        closeHandleRef.current = isFailed
            ? null
            : { requestClose: () => apiRef.current?.requestCancellation() };
        return () => {
            closeHandleRef.current = null;
        };
    }, [closeHandleRef, isFailed]);

    const isExplore = !isEditMode && (target.type === "widget" || target.type === "insight");
    const filterTransfer = useExploreFilterTransfer(target, isExplore, apiRef);

    const cacheReset = useMemo<IAnalyticalDesignerCacheReset>(
        () => ({
            resetAll: () => eventDispatch(insightEditorCacheResetRequested("all")),
            resetCatalogs: () => eventDispatch(insightEditorCacheResetRequested("catalogs")),
        }),
        [eventDispatch],
    );

    const config = useMemo<IAnalyticalDesignerConfig>(
        () => ({ ...hostConfig, ...route.config }),
        [hostConfig, route.config],
    );

    return (
        <AnalyticalDesigner
            backend={backend}
            workspace={workspace}
            insight={route.insight}
            config={config}
            permissions={permissions}
            theme={theme}
            // The dashboard already resolved the theme of the workspace.
            disableThemeLoading
            cacheReset={cacheReset}
            onEvent={(event) => {
                switch (event.type) {
                    case "visualizationSaved":
                        void session.save(event.data.insight.identifier);
                        break;
                    case "insightEditingCancelled":
                        session.cancel();
                        break;
                    case "insightOpened":
                        filterTransfer.onInsightOpened();
                        break;
                    case "insightRendered":
                        filterTransfer.onInsightRendered();
                        break;
                    case "appCommandFailed":
                        filterTransfer.onCommandFailed(event.data, event.contextId);
                        break;
                    case "attributeHierarchyModified":
                        eventDispatch(insightEditorCacheResetRequested("catalogs"));
                        dispatch(attributeHierarchyModified());
                        break;
                    default:
                        break;
                }
            }}
            // A failed Analytical Designer never answers a command, so the overlay closes directly.
            onError={() => setIsFailed(true)}
            apiRef={apiRef}
        />
    );
}

/**
 * The values that Analytical Designer would otherwise load when it starts. The dashboard has them
 * already.
 */
function useHostConfig(): IAnalyticalDesignerConfig {
    const locale = useDashboardSelector(selectLocale);
    const separators = useDashboardSelector(selectSeparators);
    const settings = useDashboardSelector(selectSettings);
    const mapboxToken = useDashboardSelector(selectMapboxToken);
    const agGridToken = useDashboardSelector(selectAgGridToken);
    const colorPalette = useDashboardSelector(selectColorPalette);
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);
    const user = useDashboardSelector(selectCurrentUser);
    const entitlements = useDashboardSelector(selectEntitlements);
    const objectAvailability = useDashboardSelector(selectObjectAvailabilityConfig);
    const asOfDate = useDashboardSelector(selectExecutionTimestamp);

    return useMemo(
        () => ({
            locale,
            separators,
            // The dashboard keeps the settings of the user in the workspace.
            settings: settings as IUserWorkspaceSettings,
            mapboxToken,
            agGridToken,
            colorPalette,
            whiteLabeling: { isBranded: isWhiteLabeled },
            user,
            organization: { entitlements },
            asOfDate,
            includeObjectsWithTags: objectAvailability?.includeObjectsWithTags,
            excludeObjectsWithTags: objectAvailability?.excludeObjectsWithTags,
        }),
        [
            locale,
            separators,
            settings,
            mapboxToken,
            agGridToken,
            colorPalette,
            isWhiteLabeled,
            user,
            entitlements,
            objectAvailability,
            asOfDate,
        ],
    );
}

function useRoute(target: InsightEditorTarget, isEditMode: boolean) {
    const widgetRef = target.type === "widget" ? target.ref : undefined;
    const widgetInsight = useDashboardSelector(selectInsightByWidgetRef(widgetRef));
    const dashboardId = useDashboardSelector(selectDashboardId);
    const isEmbedded = useDashboardSelector(selectIsEmbedded);
    const canManageWorkspace = useDashboardSelector(selectCanManageWorkspace);
    const canCreateVisualization = useDashboardSelector(selectCanCreateVisualization);

    const widgetInsightRef = useMemo(
        () => (widgetInsight ? insightRef(widgetInsight) : undefined),
        [widgetInsight],
    );
    const isWidgetInsightLocked = widgetInsight ? insightIsLocked(widgetInsight) : false;

    return useMemo(
        () =>
            getInsightEditorRoute({
                target,
                widgetInsightRef,
                isWidgetInsightLocked,
                dashboardId,
                isEditMode,
                isEmbedded,
                canManageWorkspace,
                canCreateVisualization,
            }),
        [
            target,
            widgetInsightRef,
            isWidgetInsightLocked,
            dashboardId,
            isEditMode,
            isEmbedded,
            canManageWorkspace,
            canCreateVisualization,
        ],
    );
}
