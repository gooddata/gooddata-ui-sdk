// (C) 2022 GoodData Corporation
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import invariant from "ts-invariant";
import { IDashboard, idRef, ObjRef } from "@gooddata/sdk-model";
import {
    DashboardSelectorEvaluator,
    DashboardState,
    RenderMode,
    selectDashboardWorkingDefinition,
    selectRenderMode,
} from "@gooddata/sdk-ui-dashboard";
import { IDashboardLoadOptions } from "./types";
import { DashboardLoadStatus, useDashboardLoader } from "./useDashboardLoader";

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
export function useDashboardLoaderWithReload(options: IDashboardLoadOptions): {
    loaderStatus: DashboardLoadStatus;
    reloadPlugins: () => void;
} {
    const [dashboard, setDashboard] = useState(() => sanitizedDashboardRef(options.dashboard));
    const [renderMode, setRenderMode] = useState<RenderMode>(options.dashboard ? "view" : "edit");

    const augmentedConfig = useMemo(
        () => ({ ...options.config, initialRenderMode: renderMode }),
        [options.config, renderMode],
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
        config: augmentedConfig,
    });

    const dashboardSelect = useRef<DashboardSelectorEvaluator>();

    const onStateChange = useCallback((state: DashboardState) => {
        dashboardSelect.current = (select) => select(state);
    }, []);

    const reloadPlugins = useCallback(() => {
        invariant(dashboardSelect.current, "reloadPlugins used before initialization");
        const select = dashboardSelect.current;
        const dashboardObject = select(selectDashboardWorkingDefinition);
        const renderMode = select(selectRenderMode);
        setDashboard(dashboardObject as any);
        setRenderMode(renderMode);
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
                                  onStateChange(state);
                                  loaderStatus.result.props.onStateChange?.(state, dispatch);
                              },
                          },
                      },
                  }
                : loaderStatus,
        reloadPlugins,
    };
}
