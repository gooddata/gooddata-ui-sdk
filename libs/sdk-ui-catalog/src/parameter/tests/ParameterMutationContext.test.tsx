// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { ParameterMutationProvider, useParameterMutation } from "../ParameterMutationContext.js";
import { createTestParameterMutationPort } from "./parameterMutationPort.test.utils.js";

const fakeBackend = {
    workspace: () => ({
        parameters: () => ({}),
    }),
} as unknown as IAnalyticalBackend;

function BackendAndWorkspace({ children }: PropsWithChildren) {
    return (
        <BackendProvider backend={fakeBackend}>
            <WorkspaceProvider workspace="ws-1">{children}</WorkspaceProvider>
        </BackendProvider>
    );
}

describe("ParameterMutationContext", () => {
    it("exposes the port via useParameterMutation when used inside the provider", () => {
        const port = createTestParameterMutationPort();

        const { result } = renderHook(() => useParameterMutation(), {
            wrapper: ({ children }) => (
                <ParameterMutationProvider port={port}>{children}</ParameterMutationProvider>
            ),
        });

        expect(result.current).toBe(port);
    });

    it("builds a default adapter from backend and workspace when no port is provided", () => {
        const { result } = renderHook(() => useParameterMutation(), {
            wrapper: ({ children }) => (
                <BackendAndWorkspace>
                    <ParameterMutationProvider>{children}</ParameterMutationProvider>
                </BackendAndWorkspace>
            ),
        });

        expect(typeof result.current.create).toBe("function");
        expect(typeof result.current.update).toBe("function");
        expect(typeof result.current.delete).toBe("function");
    });

    it("throws when used outside the provider", () => {
        expect(() => renderHook(() => useParameterMutation())).toThrow(/ParameterMutationProvider/);
    });
});
