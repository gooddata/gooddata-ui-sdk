// (C) 2026 GoodData Corporation

import { act, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IMeasureMetadataObject, idRef, uriRef } from "@gooddata/sdk-model";

import { mountWithIntlComponent } from "../../../../tests/render.test.utils.js";
import { FeaturesAndSettingsContextProvider } from "../../../FeaturesAndSettings/index.js";
import { emptyMetric } from "../../../metric/emptyMetric.js";
import { type IMeasureDef } from "../../../metric/metricHelpers.js";

import { MetricShare } from "./MetricShare.js";

const captured: { target?: unknown; draft?: boolean; initialDraftGeneralAccess?: string } = {};
vi.mock("@gooddata/sdk-ui-ext", () => ({
    ObjectShareDialog: (props: { target?: unknown; draft?: boolean; initialDraftGeneralAccess?: string }) => {
        captured.target = props.target;
        captured.draft = props.draft;
        captured.initialDraftGeneralAccess = props.initialDraftGeneralAccess;
        return <span>dialog</span>;
    },
    useObjectAccessLevel: () => ({
        summary: undefined,
        level: "PRIVATE",
        isLoading: false,
        onSummaryChange: vi.fn(),
    }),
}));

const PREFIXED = {
    ...emptyMetric,
    id: "revenue",
    prefix: "acme.",
    title: "Revenue",
    uri: "/uri",
    ref: uriRef("/uri/acme.revenue"),
} as unknown as IMeasureMetadataObject;

function render(metric: IMeasureDef, onDraftAccessChange?: () => void, canShare = true) {
    return mountWithIntlComponent(
        <MetricShare
            metric={metric}
            canShare={canShare}
            draftAccess={undefined}
            onDraftAccessChange={onDraftAccessChange}
        />,
    );
}

describe("MetricShare", () => {
    it("targets the metric by its own ref, not one rebuilt from the id", () => {
        render(PREFIXED, () => {});
        act(() => screen.getByTestId("s-metric-share-button").click());

        expect(captured.target).toEqual({ kind: "measure", ref: uriRef("/uri/acme.revenue") });
        expect(captured.target).not.toEqual({ kind: "measure", ref: idRef("revenue", "measure") });
        expect(captured.draft).toBe(false);
    });

    it("drafts a new metric with the access the workspace creates it with", () => {
        mountWithIntlComponent(
            <FeaturesAndSettingsContextProvider defaultMetricVisibility="WORKSPACE">
                <MetricShare
                    metric={{ ...emptyMetric, title: "Draft" } as IMeasureDef}
                    canShare
                    draftAccess={undefined}
                    onDraftAccessChange={() => {}}
                />
            </FeaturesAndSettingsContextProvider>,
        );
        act(() => screen.getByTestId("s-metric-share-button").click());

        expect(captured.draft).toBe(true);
        expect(captured.initialDraftGeneralAccess).toBe("WORKSPACE");
    });

    it("offers sharing for a saved metric even with no draft plumbing", () => {
        render(PREFIXED);
        expect(screen.getByTestId("s-metric-share-button")).toBeInTheDocument();
    });

    it("stays away from an unsaved metric that has nowhere to keep a draft", () => {
        render({ ...emptyMetric, title: "Draft" });
        expect(screen.queryByTestId("s-metric-share-button")).toBeNull();
    });

    it("stays away when the user may not share this metric", () => {
        render(PREFIXED, () => {}, false);
        expect(screen.queryByTestId("s-metric-share-button")).toBeNull();
    });
});
