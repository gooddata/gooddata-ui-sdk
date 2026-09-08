// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it } from "vitest";

import type { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";

import { TestPermissionsProvider, defaultPermissionsResult } from "../permission/TestPermissionsProvider.js";

import { useIsCertificationAllowed } from "./gate.js";

const enabledResult = {
    ...defaultPermissionsResult,
    settings: { enableCertification: true } as IUserWorkspaceSettings,
};

function Wrapper({ children }: PropsWithChildren) {
    return <TestPermissionsProvider result={enabledResult}>{children}</TestPermissionsProvider>;
}

describe("useIsCertificationAllowed", () => {
    it.each(["analyticalDashboard", "insight", "measure", "computedAttribute"] as const)(
        "allows %s when the feature flag is on",
        (objectType) => {
            const { result } = renderHook(() => useIsCertificationAllowed(objectType), { wrapper: Wrapper });
            expect(result.current).toBe(true);
        },
    );

    it.each(["attribute", "fact", "dataSet", "parameter"] as const)(
        "withholds %s even when the feature flag is on",
        (objectType) => {
            const { result } = renderHook(() => useIsCertificationAllowed(objectType), { wrapper: Wrapper });
            expect(result.current).toBe(false);
        },
    );

    it("withholds every type when the feature flag is off", () => {
        function DisabledWrapper({ children }: PropsWithChildren) {
            return (
                <TestPermissionsProvider result={defaultPermissionsResult}>
                    {children}
                </TestPermissionsProvider>
            );
        }
        const { result } = renderHook(() => useIsCertificationAllowed("computedAttribute"), {
            wrapper: DisabledWrapper,
        });
        expect(result.current).toBe(false);
    });

    it("withholds when no object type is provided", () => {
        const { result } = renderHook(() => useIsCertificationAllowed(undefined), { wrapper: Wrapper });
        expect(result.current).toBe(false);
    });
});
