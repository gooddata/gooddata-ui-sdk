// (C) 2022-2023 GoodData Corporation
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { invariant } from "ts-invariant";
import compact from "lodash/compact.js";
import isArray from "lodash/isArray.js";
import { IDashboard, idRef, ObjRef } from "@gooddata/sdk-model";
import {
    DashboardConfig,
    DashboardSelectorEvaluator,
    DashboardState,
    DashboardDispatch,
    RenderMode,
    selectRenderMode,
    selectDashboardWorkingDefinition,
    selectWidgetsOverlay,
    uiActions,
} from "@gooddata/sdk-ui-dashboard";
import { DashboardLoadingMode, IDashboardLoadOptions, IEmbeddedPlugin } from "./types.js";
import { DashboardLoadStatus, useDashboardLoader } from "./useDashboardLoader.js";

function sanitizedDashboardRef(
    dashboard: IDashboardLoadOptions["dashboard"],
): IDashboard | ObjRef | undefined {
    return typeof dashboard === "string" ? idRef(dashboard, "analyticalDashboard") : dashboard;
}

/**
 * Wrapper around {@link useDashboardLoader} that adds the option to reload while keeping the current state of the dashboard intact.
 *
 * @param options - load options
 * @internal
 */
export function useDashboardLoaderWithPluginManipulation(options: IDashboardLoadOptions): {
    loaderStatus: DashboardLoadStatus;
    reloadPlugins: () => void;
    hidePluginOverlays: () => void;
    changeLoadingMode: (loadingMode: DashboardLoadingMode) => void;
    loadingMode: DashboardLoadingMode;
    setExtraPlugins: (plugins: IEmbeddedPlugin | IEmbeddedPlugin[]) => void;
    extraPlugins: IEmbeddedPlugin[] | undefined;
} {
    const [dashboard, setDashboard] = useState(() => sanitizedDashboardRef(options.dashboard));
    const [renderMode, setRenderMode] = useState<RenderMode>(options.dashboard ? "view" : "edit");
    const [widgetsOverlay, setWidgetsOverlay] = useState(options.config?.widgetsOverlay);
    const [loadingMode, setLoadingMode] = useState<DashboardLoadingMode>(options.loadingMode ?? "adaptive");
    const [currentExtraPlugins, setCurrentExtraPlugins] = useState<IEmbeddedPlugin[]>(() =>
        isArray(options.extraPlugins) ? options.extraPlugins : compact([options.extraPlugins]),
    );

    const augmentedConfig = useMemo<DashboardConfig>(
        () => ({ ...options.config, initialRenderMode: renderMode, widgetsOverlay }),
        [options.config, renderMode, widgetsOverlay],
    );

    useEffect(() => {
        setDashboard(sanitizedDashboardRef(options.dashboard));
        // for new dashboards we need to always go to edit mode
        if (!options.dashboard) {
            setRenderMode("edit");
        }
    }, [options.dashboard]);

    const loaderStatus = useDashboardLoader({
        ...options,
        dashboard,
        loadingMode,
        extraPlugins: currentExtraPlugins,
        config: augmentedConfig,
    });

    const dashboardSelect = useRef<DashboardSelectorEvaluator>();
    const dashboardDispatch = useRef<DashboardDispatch>();

    const onStateChange = useCallback((state: DashboardState, dispatch: DashboardDispatch) => {
        dashboardSelect.current = (select) => select(state);
        dashboardDispatch.current = dispatch;
    }, []);

    const reloadPlugins = useCallback(() => {
        invariant(dashboardSelect.current, "reloadPlugins used before initialization");
        const select = dashboardSelect.current;
        const dashboardObject = select(selectDashboardWorkingDefinition);
        const renderMode = select(selectRenderMode);
        const widgetsOverlay = select(selectWidgetsOverlay);
        // force new reference in case the current dashboard object is the same as the one with which the last reload occurred
        // this makes sure the dashboard is fully reloaded each time
        setDashboard({ ...dashboardObject } as any);
        setRenderMode(renderMode);
        setWidgetsOverlay(widgetsOverlay);
    }, []);

    const hidePluginOverlays = useCallback(() => {
        invariant(dashboardDispatch.current, "hidePluginOverlays used before initialization");
        dashboardDispatch.current(uiActions.hideAllWidgetsOverlay());
    }, []);

    const changeLoadingMode = useCallback((newLoadingMode: DashboardLoadingMode) => {
        invariant(dashboardSelect.current, "changeLoadingMode used before initialization");
        const select = dashboardSelect.current;
        const dashboardObject = select(selectDashboardWorkingDefinition);
        const renderMode = select(selectRenderMode);
        // force new reference in case the current dashboard object is the same as the one with which the last loading mode change occurred
        // this makes sure the dashboard is fully reloaded each time
        setDashboard({ ...dashboardObject } as any);
        setRenderMode(renderMode);
        setLoadingMode(newLoadingMode);
        // force reset overlays to not keep between modes
        setWidgetsOverlay({});
    }, []);

    const setExtraPlugins = useCallback((extraPlugins: IEmbeddedPlugin | IEmbeddedPlugin[]) => {
        invariant(dashboardSelect.current, "setExtraPlugins used before initialization");
        const select = dashboardSelect.current;
        const dashboardObject = select(selectDashboardWorkingDefinition);
        const renderMode = select(selectRenderMode);
        const widgetsOverlay = select(selectWidgetsOverlay);
        // force new reference in case the current dashboard object is the same as the one with which the last setting of extra plugins occurred
        // this makes sure the dashboard is fully reloaded each time
        setDashboard({ ...dashboardObject } as any);
        setRenderMode(renderMode);
        setWidgetsOverlay(widgetsOverlay);
        setCurrentExtraPlugins(isArray(extraPlugins) ? extraPlugins : [extraPlugins]);
    }, []);

    return {
        loaderStatus:
            loaderStatus.status === "success"
                ? {
                      ...loaderStatus,
                      result: {
                          ...loaderStatus.result,
                          props: {
                              ...loaderStatus.result.props,
                              onStateChange: (state, dispatch) => {
                                  // tap into the resulting props so that the usage is transparent to the user
                                  onStateChange(state, dispatch);
                                  loaderStatus.result.props.onStateChange?.(state, dispatch);
                              },
                          },
                      },
                  }
                : loaderStatus,
        reloadPlugins,
        hidePluginOverlays,
        changeLoadingMode,
        loadingMode,
        setExtraPlugins,
        extraPlugins: currentExtraPlugins,
    };
}
