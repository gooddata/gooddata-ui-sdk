// (C) 2025 GoodData Corporation

import type { PropsWithChildren } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { MemoryMain } from "../MemoryMain.js";

function wrapper({ children }: PropsWithChildren) {
    return (
        <TestIntlProvider>
            <ToastsCenterContextProvider>{children}</ToastsCenterContextProvider>
        </TestIntlProvider>
    );
}

describe("MemoryMain", () => {
    it("renders empty state and allows opening create dialog", async () => {
        const mockMemoryService = {
            list: vi.fn().mockResolvedValue([]),
            create: vi
                .fn()
                .mockResolvedValue({ id: "test-id", instruction: "test", type: "INSTRUCTION", keywords: [] }),
            update: vi
                .fn()
                .mockResolvedValue({ id: "test-id", instruction: "test", type: "INSTRUCTION", keywords: [] }),
            remove: vi.fn().mockResolvedValue(undefined),
        };

        const backend = dummyBackend();
        // Mock the genAI functionality
        vi.spyOn(backend, "workspace").mockReturnValue({
            ...backend.workspace("ws"),
            genAI: () => ({
                getMemory: () => mockMemoryService,
            }),
        } as unknown as ReturnType<typeof backend.workspace>);

        render(<MemoryMain backend={backend} workspace="ws" />, { wrapper });

        // Wait for the component to load
        await waitFor(() => {
            expect(screen.getByText("Refresh")).toBeVisible();
        });

        expect(screen.getByText("New")).toBeVisible();

        fireEvent.click(screen.getByText("New"));
        // Dialog appears - look for the instruction field instead of title
        expect(await screen.findByPlaceholderText("Enter the instruction text...")).toBeInTheDocument();
    });
});
