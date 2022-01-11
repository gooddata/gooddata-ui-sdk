// (C) 2021 GoodData Corporation

import { getBackend } from "./getBackend";
import {
    createDashboardStore,
    initializeDashboard,
    queryWidgetFilters,
    queryEnvelopeWithPromise,
    selectAnalyticalWidgetByRef,
    selectInsightByRef,
    isDashboardCommandFailed,
} from "@gooddata/sdk-ui-dashboard";
import { Middleware, PayloadAction } from "@reduxjs/toolkit";
import { DashboardEvents } from "@gooddata/sdk-ui-dashboard";
import { IFilter, insightSetFilters, ObjRef } from "@gooddata/sdk-model";
import { isInsightWidget } from "@gooddata/sdk-backend-spi";
import { getExecution } from "./commonInsightExecution";

export async function getWidgetExecution(
    token: string,
    workspace: string,
    dashboardRef: ObjRef,
    widgetRef: ObjRef,
    filterContextRef: ObjRef,
) {
    const backend = getBackend(token);

    const capturedActions: Array<PayloadAction<any>> = [];
    const captureActionsMiddleware: Middleware = () => (next) => (action) => {
        if (!action.type.startsWith("@@redux/")) {
            console.log(action);
            capturedActions.push(action);
        }
        return next(action);
    };
    async function waitForCapturedAction(actionType: string, timeout: number = 60 * 1000) {
        const MAX_ATTEMPTS = 600;
        const TRY_INTERVAL = timeout / MAX_ATTEMPTS;

        console.log(`Waiting for ${actionType}`);
        let foundAction;
        let attempts = 0;
        while (!foundAction && attempts < MAX_ATTEMPTS) {
            console.log(attempts);
            foundAction = capturedActions.find((action) => {
                return action.type === actionType;
            });
            if (foundAction) {
                return foundAction;
            }
            if (capturedActions.find(isDashboardCommandFailed)) {
                return Promise.reject("Dashboard processing failed");
            }

            attempts++;
            await new Promise((resolve) => setTimeout(resolve, TRY_INTERVAL));
        }
        return Promise.reject("Failed to initialise dashboard in time");
    }

    const capturedEvents: Array<DashboardEvents> = [];
    const eventHandler = (evt: DashboardEvents): void => {
        capturedEvents.push(evt);
    };

    try {
        const reduxedStore = createDashboardStore({
            dashboardContext: { backend, workspace, dashboardRef, filterContextRef },
            additionalMiddleware: captureActionsMiddleware,
            eventing: {
                initialEventHandlers: [
                    {
                        eval: () => true,
                        handler: eventHandler,
                    },
                ],
            },
            backgroundWorkers: [],
        });

        const initDashCommand = initializeDashboard(undefined, undefined, "corela");
        reduxedStore.store.dispatch(initDashCommand);
        await waitForCapturedAction("GDC.DASH/EVT.INITIALIZED");

        const widget = selectAnalyticalWidgetByRef(widgetRef)(reduxedStore.store.getState());

        if (!isInsightWidget(widget)) {
            throw "Widget is not an Insight widget or not found";
        }

        const insight = selectInsightByRef(widget.insight)(reduxedStore.store.getState());

        const filtersQuery = queryWidgetFilters(widgetRef);
        const { envelope: filtersQueryEnvelope, promise: filtersQueryPromise } =
            queryEnvelopeWithPromise(filtersQuery);
        reduxedStore.store.dispatch(filtersQueryEnvelope);

        const widgetFilters = await filtersQueryPromise;

        if (!insight) {
            throw "Widget insight not found";
        }

        const widgetInsight = insightSetFilters(insight, widgetFilters as IFilter[]);

        await getExecution(token, workspace, widgetInsight);
    } catch (e) {
        console.log(`ERROR: ${e.toString()}`);
    }
}
