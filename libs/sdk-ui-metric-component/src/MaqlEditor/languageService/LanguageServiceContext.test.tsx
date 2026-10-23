// (C) 2026 GoodData Corporation

import { useContext } from "react";

import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { MetricsReloadContextProvider } from "../../shared/metrics/MetricsReloadContext.js";

import { LanguageServiceContext, LanguageServiceProvider } from "./LanguageServiceContext.js";

const WORKSPACE_ID = "test-workspace";

/**
 * A hand-rolled backend covering exactly the surface the language service touches on mount. Every
 * entry point is a spy so the tests can assert the service runs on the context-provided instance.
 */
function createBackendStub() {
    const catalogLoad = vi.fn().mockResolvedValue({
        attributes: () => [],
        facts: () => [],
        measures: () => [],
        dateDatasets: () => [],
        computedAttributes: () => [],
    });
    const catalogForTypes = vi.fn().mockReturnValue({ load: catalogLoad });
    const datasetsQuery = vi.fn().mockResolvedValue({ all: () => Promise.resolve([]) });
    const datasetsQueryBuilder = {
        withOrigin: () => datasetsQueryBuilder,
        withFilter: () => datasetsQueryBuilder,
        withSize: () => datasetsQueryBuilder,
        query: datasetsQuery,
    };
    const workspace = vi.fn().mockReturnValue({
        catalog: () => ({ load: catalogLoad, forTypes: catalogForTypes }),
        parameters: () => ({
            getParametersQuery: () => ({
                withSize: () => ({ query: vi.fn().mockResolvedValue({ all: () => [] }) }),
            }),
        }),
        attributes: () => ({ elements: () => ({}) }),
        datasets: () => ({ getDatasetsQuery: () => datasetsQueryBuilder }),
    });
    // Deliberately partial: the provider must not touch anything beyond the stubbed surface.
    const backend = { workspace } as unknown as IAnalyticalBackend;
    return { backend, workspace, catalogForTypes, datasetsQuery };
}

function Probe({ onService }: { onService: (service: unknown) => void }) {
    onService(useContext(LanguageServiceContext));
    return null;
}

describe("LanguageServiceProvider", () => {
    it("builds the language service from the context backend and workspace", async () => {
        const { backend, workspace, datasetsQuery } = createBackendStub();
        const onService = vi.fn();

        render(
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace={WORKSPACE_ID}>
                    <MetricsReloadContextProvider>
                        <LanguageServiceProvider>
                            <Probe onService={onService} />
                        </LanguageServiceProvider>
                    </MetricsReloadContextProvider>
                </WorkspaceProvider>
            </BackendProvider>,
        );

        await waitFor(() => {
            // the catalog is loaded on the backend handed down through React context...
            expect(workspace).toHaveBeenCalledWith(WORKSPACE_ID);
            // ...and so are the normal and the auxiliary datasets
            expect(datasetsQuery).toHaveBeenCalledTimes(2);
            // the built service is published through the context
            expect(onService).toHaveBeenLastCalledWith(expect.anything());
        });
    });
});

describe("LanguageServiceProvider computed attributes gating", () => {
    function renderProvider(backend: IAnalyticalBackend, enableComputedAttributes: boolean | undefined) {
        return render(
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace={WORKSPACE_ID}>
                    <MetricsReloadContextProvider>
                        <LanguageServiceProvider enableComputedAttributes={enableComputedAttributes}>
                            <div />
                        </LanguageServiceProvider>
                    </MetricsReloadContextProvider>
                </WorkspaceProvider>
            </BackendProvider>,
        );
    }

    it("does not request computed attributes when the setting is off", async () => {
        const { backend, workspace, catalogForTypes } = createBackendStub();

        renderProvider(backend, false);

        await waitFor(() => {
            expect(workspace).toHaveBeenCalledWith(WORKSPACE_ID);
        });
        expect(catalogForTypes).not.toHaveBeenCalled();
    });

    it("requests computed attributes when the setting is on", async () => {
        const { backend, catalogForTypes } = createBackendStub();

        renderProvider(backend, true);

        await waitFor(() => {
            expect(catalogForTypes).toHaveBeenCalledWith(expect.arrayContaining(["computedAttribute"]));
        });
    });
});
