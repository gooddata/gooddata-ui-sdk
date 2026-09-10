// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it } from "vitest";

import type { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";

import { TestPermissionsProvider, defaultPermissionsResult } from "../permission/TestPermissionsProvider.js";

import { useIsLineageEnabled } from "./gate.js";

const enabledResult = {
    ...defaultPermissionsResult,
    settings: { enableCatalogLineage: true } as unknown as IUserWorkspaceSettings,
};

function Wrapper({ children }: PropsWithChildren) {
    return <TestPermissionsProvider result={enabledResult}>{children}</TestPermissionsProvider>;
}

describe("useIsLineageEnabled", () => {
    it.each([
        "analyticalDashboard",
        "insight",
        "measure",
        "attribute",
        "fact",
        "dataSet",
        "computedAttribute",
    ] as const)("allows %s when the feature flag is on", (objectType) => {
        const { result } = renderHook(() => useIsLineageEnabled(objectType), { wrapper: Wrapper });
        expect(result.current).toBe(true);
    });

    it("withholds a type outside the supported set even when the feature flag is on", () => {
        const { result } = renderHook(() => useIsLineageEnabled("parameter"), { wrapper: Wrapper });
        expect(result.current).toBe(false);
    });

    it("withholds every type when the feature flag is off", () => {
        function DisabledWrapper({ children }: PropsWithChildren) {
            return (
                <TestPermissionsProvider result={defaultPermissionsResult}>
                    {children}
                </TestPermissionsProvider>
            );
        }
        const { result } = renderHook(() => useIsLineageEnabled("computedAttribute"), {
            wrapper: DisabledWrapper,
        });
        expect(result.current).toBe(false);
    });

    it("withholds when no object type is provided", () => {
        const { result } = renderHook(() => useIsLineageEnabled(undefined), { wrapper: Wrapper });
        expect(result.current).toBe(false);
    });
});
