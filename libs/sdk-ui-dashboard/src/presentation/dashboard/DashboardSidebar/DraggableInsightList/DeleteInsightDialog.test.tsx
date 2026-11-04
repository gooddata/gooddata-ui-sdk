// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IInsightReferencing } from "@gooddata/sdk-backend-spi";
import { type IInsight, type IMetadataObject, type ObjectType, idRef } from "@gooddata/sdk-model";
import type * as SdkUi from "@gooddata/sdk-ui";

import { newMapForObjectWithIdentity } from "../../../../_staging/metadata/objRefMap.js";
import { selectAccessibleDashboardsMap } from "../../../../model/store/accessibleDashboards/accessibleDashboardsSelectors.js";
import { selectDashboardId } from "../../../../model/store/meta/metaSelectors.js";
import { IntlWrapper } from "../../../localization/IntlWrapper.js";

import { DeleteInsightDialog } from "./DeleteInsightDialog.js";

const USED_ON_THIS_DASHBOARD = "usedOnThisDashboard";
const mockReferencing = vi.fn<() => Promise<IInsightReferencing>>();
const mockSelectorState = vi.hoisted(() => ({ usedOnThisDashboard: false }));

// vitest runs with isolate: false; reset the module registry so the mocks below apply.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => {
        if (selector === selectAccessibleDashboardsMap) {
            return newMapForObjectWithIdentity([]);
        }
        if (selector === selectDashboardId) {
            return "current";
        }
        if (selector === USED_ON_THIS_DASHBOARD) {
            return mockSelectorState.usedOnThisDashboard;
        }
        throw new Error("Unexpected selector");
    },
}));

vi.mock("../../../../model/store/insights/insightUsageSelectors.js", () => ({
    selectIsInsightUsedByDashboard: () => USED_ON_THIS_DASHBOARD,
}));

vi.mock("../../../../model/react/useDashboardCommandProcessing.js", () => ({
    useDashboardCommandProcessing: () => ({ run: vi.fn<() => void>(), status: undefined }),
}));

vi.mock("@gooddata/sdk-ui", async (importOriginal) => {
    const actual = await importOriginal<typeof SdkUi>();
    const backend = {
        workspace: () => ({ insights: () => ({ getInsightReferencingObjects: () => mockReferencing() }) }),
    };
    return { ...actual, useBackendStrict: () => backend, useWorkspaceStrict: () => "workspace" };
});

vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
        ...actual,
        useToastMessage: () => ({ addSuccess: vi.fn<() => void>(), addError: vi.fn<() => void>() }),
    };
});

const insight: IInsight = {
    insight: {
        identifier: "chart",
        uri: "/chart",
        ref: idRef("chart", "insight"),
        title: "Revenue",
        visualizationUrl: "local:bar",
        buckets: [],
        filters: [],
        sorts: [],
        properties: {},
    },
};

function metadataObject(id: string, type: ObjectType): IMetadataObject {
    return {
        id,
        ref: idRef(id, type),
        type,
        title: `${id} title`,
        uri: "",
        description: "",
        production: false,
        unlisted: false,
        deprecated: false,
    };
}

function renderDialog(referencing: IInsightReferencing) {
    mockReferencing.mockResolvedValue(referencing);
    render(
        <IntlWrapper>
            <DeleteInsightDialog
                insight={insight}
                onClose={vi.fn<() => void>()}
                onDeleted={vi.fn<() => void>()}
            />
        </IntlWrapper>,
    );
}

function isDeleteDisabled() {
    const submit = document.querySelector(".s-dialog-submit-button");
    if (!submit) {
        throw new Error("The dialog has no submit button");
    }
    return submit.hasAttribute("disabled") || submit.classList.contains("disabled");
}

describe("DeleteInsightDialog", () => {
    beforeEach(() => {
        mockReferencing.mockReset();
        mockSelectorState.usedOnThisDashboard = false;
    });

    it("blocks the delete and names the document when only a document uses the visualization", async () => {
        renderDialog({ analyticalDashboards: [], documents: [metadataObject("board-pack", "document")] });

        expect(
            await screen.findByText(/cannot be deleted because it is used in some documents\. To delete/),
        ).toBeTruthy();
        expect(isDeleteDisabled()).toBe(true);
        fireEvent.click(screen.getByText("Show more"));
        expect(screen.getByText("board-pack title")).toBeTruthy();
        expect(screen.queryByText(/not shared with you/)).toBeNull();
    });

    it("names both the documents and the edited dashboard when both use the visualization", async () => {
        mockSelectorState.usedOnThisDashboard = true;
        renderDialog({ analyticalDashboards: [], documents: [metadataObject("board-pack", "document")] });

        expect(
            await screen.findByText(/used in some documents and on the dashboard you are currently editing/),
        ).toBeTruthy();
        expect(isDeleteDisabled()).toBe(true);
    });

    it("reports both the dashboards and the documents that use the visualization", async () => {
        renderDialog({
            analyticalDashboards: [metadataObject("sales", "analyticalDashboard")],
            documents: [metadataObject("board-pack", "document")],
        });

        expect(
            await screen.findByText(/cannot be deleted because it is used in some documents or dashboards/),
        ).toBeTruthy();
        expect(screen.getByText(/1 dashboard/)).toBeTruthy();
        expect(screen.getByText(/1 document/)).toBeTruthy();
    });

    it("allows the delete when nothing uses the visualization", async () => {
        renderDialog({ analyticalDashboards: [], documents: [] });

        expect(
            await screen.findByText("The visualization is not used on any dashboard or in any document."),
        ).toBeTruthy();
        expect(isDeleteDisabled()).toBe(false);
    });
});
