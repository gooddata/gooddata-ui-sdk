// (C) 2020-2026 GoodData Corporation

import { useIntl } from "react-intl";
import { action } from "storybook/actions";
import { expect, screen, userEvent, waitFor } from "storybook/test";

import { type ISemanticSearchRelationship, type ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { SemanticSearch } from "@gooddata/sdk-ui-semantic-search";
import {
    LeveledSearchTreeView,
    PermissionsProvider,
    SearchOverlay,
    SemanticSearchIntlProvider,
    buildSemanticSearchTreeViewItems,
} from "@gooddata/sdk-ui-semantic-search/internal";
import "@gooddata/sdk-ui-semantic-search/styles/css/main.css";

import { ReferenceWorkspaceId, StorybookBackend } from "../../_infra/backend.js";
import {
    type INeobackstopScenarioConfig,
    type IStoryParameters,
    State,
} from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

const backend = StorybookBackend();

function SemanticSearchBase({ width = 200 }: { width?: number }) {
    return (
        <div className="library-component screenshot-target">
            <div style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
                <div>
                    <h4>Semantic Search</h4>
                    <div style={{ width, height: 400, display: "flex" }}>
                        <SemanticSearch
                            className="semantic-search"
                            backend={backend}
                            workspace={ReferenceWorkspaceId}
                            onSelect={action("onSelect")}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

const config: INeobackstopScenarioConfig = {
    readySelector: { selector: "input", state: State.Attached },
    keyPressSelector: {
        keyPress: "test",
        selector: "input",
    },
    postInteractionWait: { selector: ".gd-semantic-search__results-item" },
    misMatchThreshold: 0.01,
};

export default {
    title: "14 GenAI/SemanticSearch",
};

export function FullFeatured() {
    return <SemanticSearchBase />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: config } satisfies IStoryParameters;

export function Short() {
    return <SemanticSearchBase width={100} />;
}
Short.parameters = { kind: "short", screenshot: config } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<SemanticSearchBase />);
Themed.parameters = { kind: "themed", screenshot: config } satisfies IStoryParameters;

export function InternalSearchoverlay() {
    return <SearchOverlay onSelect={action("onSelect")} backend={backend} workspace={ReferenceWorkspaceId} />;
}
InternalSearchoverlay.parameters = {
    kind: "internal SearchOverlay",
    screenshot: config,
} satisfies IStoryParameters;

export const InternalSearchoverlayThemed = () =>
    wrapWithTheme(
        <SearchOverlay onSelect={action("onSelect")} backend={backend} workspace={ReferenceWorkspaceId} />,
    );
InternalSearchoverlayThemed.parameters = {
    kind: "internal SearchOverlay themed",
    screenshot: config,
} satisfies IStoryParameters;

const policyResults: ISemanticSearchResultItem[] = [
    {
        id: "revenue",
        type: "metric",
        title: "Revenue (inactive)",
        description: "This metric has no destination in the embedding application.",
        workspaceId: ReferenceWorkspaceId,
        createdAt: "2026-01-15T12:00:00Z",
        score: 1,
    },
    {
        id: "overview",
        type: "dashboard",
        title: "Overview (enabled)",
        description: "Dashboard navigation remains available.",
        workspaceId: ReferenceWorkspaceId,
        createdAt: "2026-01-15T12:00:00Z",
        score: 0.9,
    },
    {
        id: "chart",
        type: "visualization",
        title: "Revenue chart (inactive)",
        workspaceId: ReferenceWorkspaceId,
        createdAt: "2026-01-15T12:00:00Z",
        score: 0.8,
    },
];

const policyRelationships: ISemanticSearchRelationship[] = [
    {
        sourceObjectId: "related-dashboard",
        sourceObjectType: "dashboard",
        sourceObjectTitle: "Related dashboard (enabled)",
        sourceWorkspaceId: ReferenceWorkspaceId,
        targetObjectId: "revenue",
        targetObjectType: "metric",
        targetObjectTitle: "Revenue (inactive)",
        targetWorkspaceId: ReferenceWorkspaceId,
    },
];

function LinkPolicyTree() {
    const intl = useIntl();
    const items = buildSemanticSearchTreeViewItems({
        intl,
        workspace: ReferenceWorkspaceId,
        searchResults: policyResults,
        relationships: policyRelationships,
        canEdit: true,
        isLinkEnabled: (type) => type === "dashboard",
    });
    return (
        <div className="library-component screenshot-target" style={{ width: 600 }}>
            <LeveledSearchTreeView
                id="link-policy-tree"
                items={items}
                tabIndex={0}
                isLinkEnabled={(type) => type === "dashboard"}
                onSelect={action("onSelect")}
            />
        </div>
    );
}

export function DashboardOnlyLinks() {
    return (
        <SemanticSearchIntlProvider locale="en-US">
            <PermissionsProvider backend={backend} workspace={ReferenceWorkspaceId}>
                <LinkPolicyTree />
            </PermissionsProvider>
        </SemanticSearchIntlProvider>
    );
}
DashboardOnlyLinks.parameters = { kind: "dashboard-only links" } satisfies IStoryParameters;
DashboardOnlyLinks.play = async () => {
    const tree = await screen.findByRole("tree");
    const metric = screen.getByRole("treeitem", { name: "Revenue (inactive), metric" });
    const row = metric.closest(".gd-semantic-search__results-item")!;

    expect(screen.getAllByRole("treeitem")).toHaveLength(3);
    expect(metric.tagName).toBe("DIV");
    expect(metric).not.toHaveAttribute("href");
    expect(getComputedStyle(row).cursor).toBe("default");
    expect(getComputedStyle(row).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(metric).textDecorationLine).toBe("none");
    await userEvent.hover(metric);
    expect(row.querySelector(".gd-semantic-search__results-item__details")).not.toBeNull();
    expect(row).toHaveClass("gd-semantic-search__results-item--active");
    await userEvent.click(screen.getByText("Revenue (inactive)"));
    await waitFor(() => expect(metric).toHaveAttribute("aria-expanded", "true"));
    expect(screen.getByRole("treeitem", { name: "Related dashboard (enabled), dashboard" }).tagName).toBe(
        "A",
    );
    expect(screen.queryByText("Open")).toBeNull();
    tree.focus();
    await userEvent.keyboard("{Enter}");
    expect(metric).toHaveAttribute("aria-expanded", "false");
    await userEvent.keyboard(" ");
    expect(metric).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{ArrowLeft}");
    expect(metric).toHaveAttribute("aria-expanded", "false");
};
