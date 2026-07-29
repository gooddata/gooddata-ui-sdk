// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";

import type { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import type { IWorkspacePermissions } from "@gooddata/sdk-model";

import { useCreatableObjectTypes } from "../../asCodeRegistry.js";
import { ObjectTypes } from "../../objectType/constants.js";
import {
    TestPermissionsProvider,
    defaultPermissionsResult,
} from "../../permission/TestPermissionsProvider.js";
import { InsightCodecProvider } from "../insightCodecContext.js";

// Flag on and manage permission granted, so the codec host is the only gate the tests vary.
const enabledResult = {
    ...defaultPermissionsResult,
    permissions: { canManageProject: true } as IWorkspacePermissions,
    settings: { enableAnalyticalCatalogVisualizationEditor: true } as IUserWorkspaceSettings,
};

function createWrapper(withCodecHost: boolean) {
    function Wrapper({ children }: PropsWithChildren) {
        return (
            <TestPermissionsProvider result={enabledResult}>
                {withCodecHost ? (
                    <InsightCodecProvider requestLoad={vi.fn(async () => {})}>
                        {children}
                    </InsightCodecProvider>
                ) : (
                    children
                )}
            </TestPermissionsProvider>
        );
    }
    return Wrapper;
}

describe("useCreatableObjectTypes (visualization create gate)", () => {
    it("offers visualization creation with the flag, the permission, and a codec host", () => {
        const { result } = renderHook(() => useCreatableObjectTypes(), {
            wrapper: createWrapper(true),
        });
        expect(result.current.has(ObjectTypes.VISUALIZATION)).toBe(true);
    });

    it("withholds visualization creation without a codec host, even with the flag and permission", () => {
        const { result } = renderHook(() => useCreatableObjectTypes(), {
            wrapper: createWrapper(false),
        });
        expect(result.current.has(ObjectTypes.VISUALIZATION)).toBe(false);
    });

    it("withholds a type whose editor flag is off", () => {
        const { result } = renderHook(() => useCreatableObjectTypes(), {
            wrapper: createWrapper(true),
        });
        expect(result.current.has(ObjectTypes.METRIC)).toBe(false);
    });

    it("withholds every type without the manage permission", () => {
        function Wrapper({ children }: PropsWithChildren) {
            return (
                <TestPermissionsProvider
                    result={{
                        ...enabledResult,
                        permissions: { canManageProject: false } as IWorkspacePermissions,
                    }}
                >
                    {children}
                </TestPermissionsProvider>
            );
        }
        const { result } = renderHook(() => useCreatableObjectTypes(), { wrapper: Wrapper });
        expect(result.current.size).toBe(0);
    });
});
