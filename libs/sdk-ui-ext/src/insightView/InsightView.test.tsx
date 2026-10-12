// (C) 2026 GoodData Corporation

import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { insightRef } from "@gooddata/sdk-model";

import { InsightView } from "./InsightView.js";

vi.mock("./InsightRenderer.js", () => ({
    InsightRenderer: ({ afterRender }: { afterRender?: () => void }) => {
        afterRender?.();
        return null;
    },
}));

describe("InsightView", () => {
    it("passes afterRender on to the visualization it renders", async () => {
        const backend = recordedBackend(ReferenceRecordings.Recordings);
        const workspace = "reference-workspace";
        const [insight] = (await backend.workspace(workspace).insights().getInsights({ limit: 1 })).items;
        const afterRender = vi.fn();

        render(
            <InsightView
                backend={backend}
                workspace={workspace}
                insight={insightRef(insight)}
                afterRender={afterRender}
            />,
        );

        await waitFor(() => expect(afterRender).toHaveBeenCalled());
    });
});
