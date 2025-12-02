// (C) 2020-2025 GoodData Corporation

import { action } from "storybook/actions";

import { SemanticSearch } from "@gooddata/sdk-ui-semantic-search";
import { SearchOverlay } from "@gooddata/sdk-ui-semantic-search/internal";
import "@gooddata/sdk-ui-semantic-search/styles/css/main.css";

import { ReferenceWorkspaceId, StorybookBackend } from "../../_infra/backend.js";
import { INeobackstopScenarioConfig, IStoryParameters } from "../../_infra/backstopScenario.js";
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
    readySelector: "input",
    keyPressSelector: {
        keyPress: "test",
        selector: "input",
    },
    postInteractionWait: '[data-testid="semantic-search-results-item"]',
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
