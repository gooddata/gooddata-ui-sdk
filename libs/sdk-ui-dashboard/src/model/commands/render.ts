// (C) 2021-2022 GoodData Corporation
import { IDashboardCommand } from "./base.js";

/**
 * Payload of the {@link RequestAsyncRender} command.
 * @public
 */
export interface RequestAsyncRenderPayload {
    /**
     * Async render identifier (eg stringified widget {@link @gooddata/sdk-model#ObjRef}).
     */
    readonly id: string;
}

/**
 * @public
 */
export interface RequestAsyncRender extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.RENDER.ASYNC.REQUEST";
    readonly payload: RequestAsyncRenderPayload;
}

/**
 * Notify the dashboard about asynchronous rendering (eg when the component needs to load some asynchronous data to be rendered) of the component.
 *
 * @remarks
 *  * Mechanism is following:
 * - You must request async rendering for at least 1 component within 2 seconds of the {@link DashboardInitialized} event.
 *   (If you do not register any asynchronous rendering, after 2 seconds the dashboard will announce that it is rendered by dispatching {@link DashboardRenderResolved} event.)
 * - You can request async rendering for any number of components. Requests are valid if the first rule is met
 *   and not all asynchronous renderings have been resolved and the maximum timeout (20min by default) has not elapsed.
 * - The component may again request asynchronous rendering within 2 seconds of resolution. Maximum 3x.
 *   (this is necessary to cover possible re-renders caused by data received from the components themselves, after they are rendered)
 * - Maximum rendering time of the dashboard is 20min - if some asynchronous renderings are not yet resolved at this time, {@link DashboardRenderResolved} event is dispatched anyway.
 *
 * - Each component on the dashboard that is rendered asynchronously should fire this command.
 * - Once the component is rendered, it should notify the dashboard by dispatching {@link resolveAsyncRender} command
 *   with the corresponding identifier.
 *
 * By registering and resolving asynchronous data retrieval of the each widget, the dashboard is able to recognize and notify that it is fully rendered.
 * This mechanism is necessary for dashboard exports to PDF to work properly.
 *
 * @public
 * @param id - async render identifier
 * @param correlationId - specify correlation id to use for this command.
 *                        this will be included in all events that will be emitted during the command processing
 * @returns
 */
export function requestAsyncRender(id: string, correlationId?: string): RequestAsyncRender {
    return {
        type: "GDC.DASH/CMD.RENDER.ASYNC.REQUEST",
        correlationId,
        payload: {
            id,
        },
    };
}

//
//
//

/**
 * Payload of the {@link ResolveAsyncRender} command.
 * @public
 */
export interface ResolveAsyncRenderPayload {
    /**
     * Async render identifier (eg stringified widget {@link @gooddata/sdk-model#ObjRef}).
     */
    readonly id: string;
}

/**
 * @public
 */
export interface ResolveAsyncRender extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.RENDER.ASYNC.RESOLVE";
    readonly payload: ResolveAsyncRenderPayload;
}

/**
 * Notify the dashboard about resolved asynchronous rendering of the component.
 *
 * @remarks
 * - Each component on the dashboard that is rendered asynchronously should fire this command.
 * - This command should only be dispatched if a {@link requestAsyncRender} command with the corresponding identifier
 *   has already been dispatched.
 *
 * @public
 * @param id - async render identifier
 * @param correlationId - specify correlation id to use for this command.
 *                        this will be included in all events that will be emitted during the command processing
 * @returns
 */
export function resolveAsyncRender(id: string, correlationId?: string): ResolveAsyncRender {
    return {
        type: "GDC.DASH/CMD.RENDER.ASYNC.RESOLVE",
        correlationId,
        payload: {
            id,
        },
    };
}
