// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { asCodeDescriptors } from "../../asCodeRegistry.js";
import { createTestMetricMutationPort } from "../../metric/tests/metricMutationPort.test.utils.js";
import { ObjectTypes } from "../../objectType/constants.js";
import { createTestParameterMutationPort } from "../../parameter/tests/parameterMutationPort.test.utils.js";
import { AsCodeMutationProvider, useAsCodePort } from "../AsCodeMutationContext.js";

// Adapters don't touch the backend at construction, so a bare stub satisfies the provider.
const stubBackend = {} as unknown as IAnalyticalBackend;

function BackendAndWorkspace({ children }: PropsWithChildren) {
    return (
        <BackendProvider backend={stubBackend}>
            <WorkspaceProvider workspace="ws-1">{children}</WorkspaceProvider>
        </BackendProvider>
    );
}

describe("AsCodeMutationContext", () => {
    it("exposes each type's injected port via useAsCodePort", () => {
        const metricPort = createTestMetricMutationPort();
        const parameterPort = createTestParameterMutationPort();

        const { result } = renderHook(
            () => ({
                metric: useAsCodePort(ObjectTypes.METRIC),
                parameter: useAsCodePort(ObjectTypes.PARAMETER),
            }),
            {
                wrapper: ({ children }) => (
                    <BackendAndWorkspace>
                        <AsCodeMutationProvider
                            ports={{
                                [ObjectTypes.METRIC]: metricPort,
                                [ObjectTypes.PARAMETER]: parameterPort,
                            }}
                        >
                            {children}
                        </AsCodeMutationProvider>
                    </BackendAndWorkspace>
                ),
            },
        );

        expect(result.current.metric).toBe(metricPort);
        expect(result.current.parameter).toBe(parameterPort);
    });

    it("builds a default adapter for each type from backend and workspace when no port is provided", () => {
        const { result } = renderHook(
            () => ({
                metric: useAsCodePort(ObjectTypes.METRIC),
                parameter: useAsCodePort(ObjectTypes.PARAMETER),
            }),
            {
                wrapper: ({ children }) => (
                    <BackendAndWorkspace>
                        <AsCodeMutationProvider descriptors={asCodeDescriptors}>
                            {children}
                        </AsCodeMutationProvider>
                    </BackendAndWorkspace>
                ),
            },
        );

        for (const port of [result.current.metric, result.current.parameter]) {
            expect(typeof port.create).toBe("function");
            expect(typeof port.update).toBe("function");
            expect(typeof port.delete).toBe("function");
        }
    });

    it("throws when used outside the provider", () => {
        expect(() => renderHook(() => useAsCodePort(ObjectTypes.METRIC))).toThrow(/AsCodeMutationProvider/);
    });
});
