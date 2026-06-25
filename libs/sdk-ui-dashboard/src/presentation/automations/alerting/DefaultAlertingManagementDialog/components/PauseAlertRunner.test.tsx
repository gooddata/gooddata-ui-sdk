// (C) 2026 GoodData Corporation

import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { IAutomationMetadataObject } from "@gooddata/sdk-model";

const fixtures = vi.hoisted(() => {
    return {
        pauseAlert: vi.fn(),
        resumeAlert: vi.fn(),
    };
});

vi.mock("../../../contexts/AlertingManagementDialogContext.js", () => ({
    useAlertingManagementDialogContext: () => ({
        pauseAlert: fixtures.pauseAlert,
        resumeAlert: fixtures.resumeAlert,
    }),
}));

import { PauseAlertRunner } from "./PauseAlertRunner.js";

describe("PauseAlertRunner", () => {
    it("passes the updated paused alert returned by the context to onSuccess", async () => {
        const originalAlert = { id: "alert-1", alert: { trigger: { state: "ACTIVE" } } };
        const updatedAlert = { id: "alert-1", alert: { trigger: { state: "PAUSED" } } };
        fixtures.pauseAlert.mockResolvedValueOnce(updatedAlert);
        const onSuccess = vi.fn();

        render(
            <PauseAlertRunner
                alert={originalAlert as unknown as IAutomationMetadataObject}
                pause
                onSuccess={onSuccess}
            />,
        );

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalledWith(updatedAlert, true);
        });
    });

    it("passes the updated resumed alert returned by the context to onSuccess", async () => {
        const originalAlert = { id: "alert-1", alert: { trigger: { state: "PAUSED" } } };
        const updatedAlert = { id: "alert-1", alert: { trigger: { state: "ACTIVE" } } };
        fixtures.resumeAlert.mockResolvedValueOnce(updatedAlert);
        const onSuccess = vi.fn();

        render(
            <PauseAlertRunner
                alert={originalAlert as unknown as IAutomationMetadataObject}
                pause={false}
                onSuccess={onSuccess}
            />,
        );

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalledWith(updatedAlert, false);
        });
    });
});
