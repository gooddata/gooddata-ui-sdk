// (C) 2026 GoodData Corporation

import { act, render, screen } from "@testing-library/react";
import { expectSaga } from "redux-saga-test-plan";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IColorPalette, type IUser, type IWorkspacePermissions } from "@gooddata/sdk-model";

import { type IBootstrapData } from "../actions/app_context_actions.js";
import { type IAdHostBackend, adoptHostBackend, resetBackend, resetCatalogs } from "../backend.js";
import { manualCatalogRefresh } from "../sagas/catalog/catalog_saga.js";
import { requestCatalogRefresh } from "../sagas/catalog/catalog_ui_actions.js";

import { type AnalyticalDesignerInternal as AnalyticalDesignerInternalComponent } from "./AnalyticalDesigner.js";
import { type IAdEmbeddedHostContext } from "./AnalyticalDesignerEmbedded.js";

interface IDeferred<T> {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (reason: unknown) => void;
}

function deferred<T>(): IDeferred<T> {
    let resolve!: (value: T) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

const mocks = vi.hoisted(() => ({
    hosts: [] as IAdEmbeddedHostContext[],
    bootstrapBackends: [] as unknown[],
    bootstrapOptions: [] as unknown[],
    bootstrapData: null as Promise<IBootstrapData> | null,
    resolveRoute: (_insight: unknown): Promise<unknown> => Promise.resolve({}),
}));

vi.mock("./AnalyticalDesignerEmbedded.js", () => ({
    AnalyticalDesignerEmbedded: ({ host }: { host: IAdEmbeddedHostContext }) => {
        mocks.hosts.push(host);
        return <div data-testid="ad-runtime">{host.workspaceId}</div>;
    },
}));

vi.mock("../sagas/bootstrap/backendBootstrapData.js", () => ({
    loadSettings: () => Promise.resolve({}),
    backendBootstrapData: (backend: unknown, _workspace: string, _locale: unknown, options: unknown) => {
        mocks.bootstrapBackends.push(backend);
        mocks.bootstrapOptions.push(options);
        return mocks.bootstrapData ?? Promise.resolve({} as IBootstrapData);
    },
}));

vi.mock("./analyticalDesignerConfig.js", async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    applyConfigToBootstrapData: (data: IBootstrapData) => data,
    resolveTheme: (): undefined => undefined,
    resolveRouteIdentifiers: (_backend: unknown, _workspace: string, insight: unknown) =>
        mocks.resolveRoute(insight),
    toRouteConfig: () => ({}),
}));

const PERMISSIONS = {} as IWorkspacePermissions;

function backendStub(): IAnalyticalBackend {
    return {} as IAnalyticalBackend;
}

describe("AnalyticalDesignerInternal", () => {
    // The module under test is imported after resetModules, so it links to the mocks above even
    // when another test file of the shared module graph loaded the real modules first.
    let AnalyticalDesignerInternal: typeof AnalyticalDesignerInternalComponent;
    beforeAll(async () => {
        vi.resetModules();
        ({ AnalyticalDesignerInternal } = await import("./AnalyticalDesigner.js"));
    });

    afterEach(() => {
        mocks.hosts = [];
        mocks.bootstrapBackends = [];
        mocks.bootstrapOptions = [];
        mocks.bootstrapData = null;
        mocks.resolveRoute = () => Promise.resolve({});
    });

    it("keeps the runtime on the backend and workspace the host data loaded for", async () => {
        const bootstrap = deferred<IBootstrapData>();
        mocks.bootstrapData = bootstrap.promise;
        const backendA = backendStub();
        const backendB = backendStub();

        const { rerender } = render(
            <AnalyticalDesignerInternal
                backend={backendA}
                workspace="workspace-a"
                permissions={PERMISSIONS}
                config={{ settings: {} as never }}
            />,
        );
        rerender(
            <AnalyticalDesignerInternal
                backend={backendB}
                workspace="workspace-b"
                permissions={PERMISSIONS}
                config={{ settings: {} as never }}
            />,
        );
        await act(async () => bootstrap.resolve({} as IBootstrapData));

        expect(await screen.findByTestId("ad-runtime")).toHaveTextContent("workspace-a");
        expect(mocks.bootstrapBackends).toEqual([backendA]);
        expect(mocks.hosts.at(-1)?.hostBackend?.instance).toBe(backendA);
    });

    it("passes the values of the config to the bootstrap, so they are not loaded again", async () => {
        const user = { login: "jane" } as IUser;
        const colorPalette = [] as IColorPalette;

        render(
            <AnalyticalDesignerInternal
                backend={backendStub()}
                workspace="workspace"
                permissions={PERMISSIONS}
                config={{
                    settings: {} as never,
                    user,
                    colorPalette,
                    organization: { id: "org1", title: "Acme", entitlements: [], isAdmin: true },
                }}
            />,
        );

        expect(await screen.findByTestId("ad-runtime")).toBeInTheDocument();
        expect(mocks.bootstrapOptions).toEqual([
            expect.objectContaining({
                user,
                colorPalette,
                organization: { id: "org1", title: "Acme" },
                entitlements: [],
            }),
        ]);
    });

    it("recovers when a later route resolves after one failed", async () => {
        mocks.resolveRoute = (insight) =>
            insight === "missing" ? Promise.reject(new Error("Insight not found")) : Promise.resolve({});
        const onError = vi.fn();
        const slots = { Error: () => <div data-testid="ad-error" /> };

        const { rerender } = render(
            <AnalyticalDesignerInternal
                backend={backendStub()}
                workspace="workspace"
                insight="missing"
                permissions={PERMISSIONS}
                onError={onError}
                slots={slots}
            />,
        );
        expect(await screen.findByTestId("ad-error")).toBeInTheDocument();
        expect(onError).toHaveBeenCalledTimes(1);

        rerender(
            <AnalyticalDesignerInternal
                backend={backendStub()}
                workspace="workspace"
                insight="existing"
                permissions={PERMISSIONS}
                onError={onError}
                slots={slots}
            />,
        );

        expect(await screen.findByTestId("ad-runtime")).toBeInTheDocument();
    });

    it("resets the host caches through the latest cacheReset", async () => {
        const firstResetAll = vi.fn();
        const resetAll = vi.fn();
        const hostResetCatalogs = vi.fn();

        const { rerender } = render(
            <AnalyticalDesignerInternal
                backend={backendStub()}
                workspace="workspace"
                permissions={PERMISSIONS}
                cacheReset={{ resetAll: firstResetAll }}
            />,
        );
        await screen.findByTestId("ad-runtime");
        rerender(
            <AnalyticalDesignerInternal
                backend={backendStub()}
                workspace="workspace"
                permissions={PERMISSIONS}
                cacheReset={{ resetAll, resetCatalogs: hostResetCatalogs }}
            />,
        );

        // The runtime adopts the host backend the component passes; Refresh runs the real saga.
        try {
            adoptHostBackend(mocks.hosts[0].hostBackend as IAdHostBackend);
            await expectSaga(manualCatalogRefresh, requestCatalogRefresh(true))
                .provide({ select: () => [], call: () => undefined })
                .run();
            resetCatalogs();
        } finally {
            resetBackend();
        }

        expect(firstResetAll).not.toHaveBeenCalled();
        expect(resetAll).toHaveBeenCalledTimes(1);
        expect(hostResetCatalogs).toHaveBeenCalledTimes(1);
    });
});
