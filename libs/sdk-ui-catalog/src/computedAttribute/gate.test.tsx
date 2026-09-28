// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it } from "vitest";

import type { IWorkspacePermissions } from "@gooddata/sdk-model";

import { TestPermissionsProvider, defaultPermissionsResult } from "../permission/TestPermissionsProvider.js";

import { useCanCreateComputedAttribute } from "./gate.js";

const wrapperWith =
    (permissions: Partial<IWorkspacePermissions>) =>
    ({ children }: PropsWithChildren) => (
        <TestPermissionsProvider
            result={{
                ...defaultPermissionsResult,
                permissions: permissions as IWorkspacePermissions,
            }}
        >
            {children}
        </TestPermissionsProvider>
    );

describe("useCanCreateComputedAttribute", () => {
    it("allows the create when the workspace grants CREATE_COMPUTED_ATTRIBUTE", () => {
        const { result } = renderHook(() => useCanCreateComputedAttribute(), {
            wrapper: wrapperWith({ canCreateComputedAttribute: true }),
        });

        expect(result.current).toBe(true);
    });

    it("withholds the create without the grant, even for an analyst", () => {
        const { result } = renderHook(() => useCanCreateComputedAttribute(), {
            wrapper: wrapperWith({
                canAnalyzeWorkspace: true,
                canCreateComputedAttribute: false,
            }),
        });

        expect(result.current).toBe(false);
    });
});
