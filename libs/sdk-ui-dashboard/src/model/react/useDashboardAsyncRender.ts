// (C) 2020-2021 GoodData Corporation
import { useCallback } from "react";
import { requestAsyncRender, resolveAsyncRender } from "../commands";
import { useDispatchDashboardCommand } from "./useDispatchDashboardCommand";

/**
 * @internal
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
 * that is loaded asynchronously (eg Insight, Kpi, but in can be also any custom component).
 * In this way, the dashboard is able to recognize and notify that it is fully rendered.
 * (which is useful, for example, when exporting)
 *
 * Mechanism is following:
 * - You must request async rendering for at least 1 component within 2 seconds of the {@link DashboardInitialized} event.
 *   (If you do not register any asynchronous rendering, after 2 seconds the dashboard will announce that it is rendered.)
 * - You can request async rendering for any number of components. Requests are valid if the first rule is met
 *   and not all asynchronous renderings have been resolved and the maximum timeout (60s by default) has not elapsed.
 * - The component may again request asynchronous rendering within 2 seconds of resolution. Maximum 3x.
 *   (this is necessary to cover re-renders caused by data received from the component - eg pushData)
 *
 * Request async rendering of the component by calling onRequestAsyncRender() callback.
 * Resolve async rendering of the component by calling onResolveAsyncRender() callback.
 *
 * @internal
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
