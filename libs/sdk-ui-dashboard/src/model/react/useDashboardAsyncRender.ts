// (C) 2020-2022 GoodData Corporation
import { useCallback } from "react";
import { requestAsyncRender, resolveAsyncRender } from "../commands/index.js";
import { useDispatchDashboardCommand } from "./useDispatchDashboardCommand.js";

/**
 * Callbacks returned from {@link useDashboardAsyncRender} hook.
 *
 * @public
 */
export interface UseDashboardAsyncRender {
    /**
     * Callback that requests async rendering of the component.
     */
    onRequestAsyncRender: () => void;

    /**
     * Callback that resolves async rendering of the component.
     */
    onResolveAsyncRender: () => void;
}

/**
 * A React hook that allows you to request and inform the dashboard about the rendering of a component
 * that loads asynchronous data (eg Insight, Kpi, but it can be also any custom widget).
 * By registering and resolving asynchronous data retrieval of the each widget, the dashboard is able to recognize and notify that it is fully rendered.
 * This mechanism is necessary for dashboard exports to PDF to work properly.
 *
 * Mechanism is following:
 * - You must request async rendering for at least 1 component within 2 seconds of the {@link DashboardInitialized} event.
 *   (If you do not register any asynchronous rendering, after 2 seconds the dashboard will announce that it is rendered by dispatching {@link DashboardRenderResolved} event.)
 * - You can request async rendering for any number of components. Requests are valid if the first rule is met
 *   and not all asynchronous renderings have been resolved and the maximum timeout (20min by default) has not elapsed.
 * - The component may again request asynchronous rendering within 2 seconds of resolution. Maximum 3x.
 *   (this is necessary to cover possible re-renders caused by data received from the components themselves, after they are rendered)
 * - Maximum rendering time of the dashboard is 20min - if some asynchronous renderings are not yet resolved at this time, {@link DashboardRenderResolved} event is dispatched anyway.
 *
 * Request async rendering of the component by calling onRequestAsyncRender() callback.
 * Resolve async rendering of the component by calling onResolveAsyncRender() callback.
 *
 * @public
 * @param id - unique identifier of the component
 * @returns callbacks
 */
export const useDashboardAsyncRender = (id: string): UseDashboardAsyncRender => {
    const requestDashboardAsyncRender = useDispatchDashboardCommand(requestAsyncRender);
    const resolveDashboardAsyncRender = useDispatchDashboardCommand(resolveAsyncRender);

    const onRequestAsyncRender = useCallback(() => {
        requestDashboardAsyncRender(id);
    }, [id]);

    const onResolveAsyncRender = useCallback(() => {
        resolveDashboardAsyncRender(id);
    }, [id]);

    return {
        onRequestAsyncRender,
        onResolveAsyncRender,
    };
};
