// (C) 2021-2025 GoodData Corporation

import { PayloadAction } from "@reduxjs/toolkit";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import {
    RecordedBackendConfig,
    defaultRecordedBackendCapabilities,
    objRefsToStringKey,
    recordedBackend,
} from "@gooddata/sdk-backend-mockingbird";
import { IBackendCapabilities } from "@gooddata/sdk-backend-spi";
import { Identifier, ObjRef, idRef, uriRef } from "@gooddata/sdk-model";

import { newRenderingWorker } from "../commandHandlers/render/renderingWorker.js";
import { RenderingWorkerConfiguration } from "../commandHandlers/render/types.js";
import { DashboardCommandType, InitializeDashboard, initializeDashboard } from "../commands/index.js";
import {
    DashboardEventType,
    DashboardEvents,
    isDashboardCommandStarted,
    isDashboardQueryCompleted,
    isDashboardQueryStarted,
} from "../events/index.js";
import { HeadlessDashboard, HeadlessDashboardConfig } from "../headlessDashboard/index.js";
import { IDashboardQueryService } from "../store/_infra/queryService.js";
import { DashboardState } from "../store/index.js";
import { DashboardContext, DashboardModelCustomizationFns } from "../types/commonTypes.js";

type DashboardTesterConfig = {
    queryServices?: IDashboardQueryService<any, any>[];
    renderingWorkerConfig?: RenderingWorkerConfiguration;
    customizationFns?: DashboardModelCustomizationFns;
};

/**
 * Default global setting for DashboardTester
 * @internal
 */
export const defaultConfig: RecordedBackendConfig = {
    globalSettings: {
        enableKPIDashboardDrillFromAttribute: true,
    },
};

export class DashboardTester extends HeadlessDashboard {
    protected constructor(ctx: DashboardContext, config?: DashboardTesterConfig) {
        const headlessDahboardConfig: HeadlessDashboardConfig = {
            queryServices: config?.queryServices,
            backgroundWorkers: [newRenderingWorker(config?.renderingWorkerConfig || {})],
            customizationFns: config?.customizationFns,
        };

        super(ctx, headlessDahboardConfig);
    }

    /**
     * Creates an instance of DashboardTester set up to run tests on top of a dashboard with the provided
     * identifier. The dashboard will be loaded from recorded backend, from its reference workspace.
     *
     * You may additionally influence how the different query services behave (typically to stub/mock the service)
     */
    public static forRecording(
        identifier: Identifier,
        testerConfig?: DashboardTesterConfig,
        backendConfig?: RecordedBackendConfig,
        customCapabilities?: Partial<IBackendCapabilities>,
    ): DashboardTester {
        const ctx: DashboardContext = {
            backend: recordedBackend(
                ReferenceRecordings.Recordings,
                {
                    ...defaultConfig,
                    ...backendConfig,
                    getCommonAttributesResponses: {
                        ...commonAttributeResponses,
                        ...(backendConfig?.getCommonAttributesResponses || {}),
                    },
                },
                {
                    ...defaultRecordedBackendCapabilities,
                    ...customCapabilities,
                },
            ),
            workspace: "reference-workspace",
            dashboardRef: idRef(identifier),
        };

        return new DashboardTester(ctx, testerConfig);
    }

    /**
     * Creates an instance of DashboardTester set up to run tests on top of an empty, freshly initialized dashboard.
     *
     * You may additionally influence how the different query services behave (typically to stub/mock the service)
     */
    public static forNewDashboard(
        testerConfig?: DashboardTesterConfig,
        backendConfig?: RecordedBackendConfig,
    ): DashboardTester {
        const ctx: DashboardContext = {
            backend: recordedBackend(ReferenceRecordings.Recordings, {
                ...backendConfig,
                getCommonAttributesResponses: {
                    ...commonAttributeResponses,
                    ...(backendConfig?.getCommonAttributesResponses || {}),
                },
            }),
            workspace: "reference-workspace",
        };

        return new DashboardTester(ctx, testerConfig);
    }

    /**
     * Wait the specified time.
     *
     * @param timeout - timeout after which the wait will be resolved
     * @returns promise
     */
    public wait(timeout: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, timeout);
        });
    }

    /**
     * Returns all actions that were dispatched since the tester was created or since it was last reset.
     */
    public dispatchedActions(): ReadonlyArray<PayloadAction<any>> {
        return this.capturedActions.slice();
    }

    /**
     * Wait for all of the listed actions to occur. The wait is bounded by a timeout that is 1s by default.
     *
     * This is useful when testing commands that emit multiple events and you need to verify that all of the
     * events happened. This function does not care about the order in which the events occurred.
     *
     * @param actionTypes - action types to wait for
     * @param timeout - timeout after which the wait fails
     */
    public waitForAll(
        actionTypes: ReadonlyArray<DashboardEventType | DashboardCommandType | string>,
        timeout: number = 1000,
    ): Promise<any> {
        return Promise.race([
            Promise.all(actionTypes.map((actionType) => this.getOrCreateMonitoredAction(actionType).promise)),
            new Promise((_, reject) => {
                setTimeout(() => {
                    reject(
                        new Error(
                            `Wait for all actions '${actionTypes.join(", ")}' timed out after ${timeout}ms`,
                        ),
                    );
                }, timeout);
            }),
        ]);
    }

    /**
     * Returns all events that were emitted during execution. Events are a sub-type of actions - they are
     * actions that are suitable for external consumption and describe what has happened in the dashboard.
     *
     * The events are accumulated during test run. You may reset them using `resetMonitors`
     */
    public emittedEvents(): ReadonlyArray<DashboardEvents> {
        return this.capturedEvents.slice();
    }

    /**
     * Resets internal state of the tester's monitors. The captured actions will be cleared up as part
     * of this.
     */
    public resetMonitors(): void {
        this.capturedActions = [];
        this.capturedEvents = [];
        this.monitoredActions = {};
    }

    /**
     * Returns dashboard state.
     */
    public override state(): DashboardState {
        return super.state();
    }

    /**
     * Returns digests of all events that were emitted during execution. Digest contains just the event
     * type and the correlation id of the event. The payload is discarded.
     *
     * This is useful for snapshotting event sequence.
     */
    public emittedEventsDigest(): ReadonlyArray<{ type: string; correlationId?: string }> {
        return this.emittedEvents().map((evt) => {
            if (isDashboardQueryStarted(evt) || isDashboardQueryCompleted(evt)) {
                return {
                    type: evt.type,
                    correlationId: evt.correlationId,
                    queryType: evt.payload.query.type,
                };
            }

            if (isDashboardCommandStarted(evt)) {
                return {
                    type: evt.type,
                    correlationId: evt.correlationId,
                    commandType: evt.payload.command.type,
                };
            }

            return {
                type: evt.type,
                correlationId: evt.correlationId,
            };
        });
    }
}

export interface PreloadedTesterOptions {
    /**
     * Customize the load command.
     *
     * Default is plain command created by `initializeDashboard()`.
     */
    initCommand?: InitializeDashboard;

    /**
     * Customize recorded backend configuration.
     *
     * Default is no customization.
     */
    backendConfig?: RecordedBackendConfig;

    /**
     * Customize recorded backend capabilities
     *
     * Default is no customization
     */
    customCapabilities?: Partial<IBackendCapabilities>;

    /**
     * Customize implementations of query services to use for the component.
     *
     * Default is no customization, meaning default implementations will be used. Note that with default
     * implementations you may encounter runtime errors as they want to use SPI methods that are not implemented
     * on the recorded analytical backend.
     */
    queryServices?: IDashboardQueryService<any, any>[];
}

/**
 * This factory will return a function that can be integrated into vitest's `beforeAll` or `beforeEach` statements. That returned
 * function will drive initialization of the dashboard tester and will tell vitest it's `done` or it will `fail`.
 *
 * When successfully loaded, the returned function will call the `onLoaded` callback
 *
 * An example usage:
 *
 * ```
 *    let Tester: DashboardTester;
 *
 *       beforeEach(async ()=> {
 *           await preloadedTesterFactory2((tester) => {
 *               Tester = tester;
 *           }, SimpleDashboardIdentifier);
 *       });
 *
 *    it("should do xyz", () => {
 *
 *    })
 * ```
 *
 * Obvious warning: beforeAll creates one instance for all tests and is therefore not safe when some tests do modifications of
 * the dashboard. Use beforeEach in that case.
 *
 * Note: before sending the instance of dashboard tester, the function will ensure all the event monitors are reset so
 * that the captured events related to load do not interfere with the test itself.
 *
 * @param onLoaded - function to call when the dashboard is successfully loaded
 * @param identifier - identifier of the dashboard to load
 * @param options - options influencing how the tester is created
 */
export async function preloadedTesterFactory(
    onLoaded: (tester: DashboardTester) => void | Promise<void>,
    identifier?: Identifier,
    options: PreloadedTesterOptions = {},
) {
    const { initCommand = initializeDashboard(), queryServices, backendConfig, customCapabilities } = options;

    const tester = identifier
        ? DashboardTester.forRecording(
              identifier,
              { queryServices },
              {
                  ...backendConfig,
              },
              {
                  ...customCapabilities,
              },
          )
        : DashboardTester.forNewDashboard(
              { queryServices },
              {
                  ...backendConfig,
              },
          );

    tester.dispatch(initCommand);

    await tester
        .waitFor("GDC.DASH/EVT.INITIALIZED")
        .then(() => Promise.resolve(onLoaded(tester)).then(() => tester.resetMonitors()))
        .catch((err) => {
            throw `DashboardTester failed to load dashboard: ${err.message}`;
        });
}

const commonAttributeResponses: Record<string, ObjRef[]> = {
    [objRefsToStringKey([
        uriRef("/gdc/md/referenceworkspace/obj/1054"),
        uriRef("/gdc/md/referenceworkspace/obj/1086"),
    ])]: [uriRef("/gdc/md/referenceworkspace/obj/1057")],
    [objRefsToStringKey([
        uriRef("/gdc/md/referenceworkspace/obj/1054"),
        uriRef("/gdc/md/referenceworkspace/obj/1088"),
    ])]: [uriRef("/gdc/md/referenceworkspace/obj/1057")],
    [objRefsToStringKey([
        uriRef("/gdc/md/referenceworkspace/obj/1054"),
        uriRef("/gdc/md/referenceworkspace/obj/1070"),
    ])]: [uriRef("/gdc/md/referenceworkspace/obj/1057")],
    [objRefsToStringKey([
        uriRef("/gdc/md/referenceworkspace/obj/1070"),
        uriRef("/gdc/md/referenceworkspace/obj/1088"),
    ])]: [uriRef("/gdc/md/referenceworkspace/obj/1057")],
    [objRefsToStringKey([
        uriRef("/gdc/md/referenceworkspace/obj/1086"),
        uriRef("/gdc/md/referenceworkspace/obj/1088"),
    ])]: [uriRef("/gdc/md/referenceworkspace/obj/1057")],
    [objRefsToStringKey([
        uriRef("/gdc/md/referenceworkspace/obj/1070"),
        uriRef("/gdc/md/referenceworkspace/obj/1086"),
    ])]: [uriRef("/gdc/md/referenceworkspace/obj/1057")],
};
