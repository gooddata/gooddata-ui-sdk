// (C) 2020-2025 GoodData Corporation
import React from "react";
import { SemanticSearch } from "@gooddata/sdk-ui-semantic-search";
import { action } from "storybook/actions";
import { StorybookBackend, ReferenceWorkspaceId } from "../../_infra/backend.js";

import { wrapWithTheme } from "../themeWrapper.js";

import "@gooddata/sdk-ui-semantic-search/styles/css/main.css";
import { IBackstopScenarioConfig } from "../../_infra/backstopScenario.js";
import { SearchOverlay } from "@gooddata/sdk-ui-semantic-search/internal";

const backend = StorybookBackend();

const SemanticSearchBase = ({ width = 200 }: { width?: number }) => (
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

const config: IBackstopScenarioConfig = {
    readySelector: "input",
    keyPressSelector: {
        keyPress: "test",
        selector: "input",
    },
    postInteractionWait: ".gd-semantic-search__results-item",
};

export default {
    title: "14 GenAI/SemanticSearch",
};

export const FullFeatured = () => <SemanticSearchBase />;
FullFeatured.parameters = { kind: "full-featured", screenshot: config };

export const Short = () => <SemanticSearchBase width={100} />;
Short.parameters = { kind: "short", screenshot: config };

export const Themed = () => wrapWithTheme(<SemanticSearchBase />);
Themed.parameters = { kind: "themed", screenshot: config };

export const InternalSearchoverlay = () => (
    <SearchOverlay onSelect={action("onSelect")} backend={backend} workspace={ReferenceWorkspaceId} />
);
InternalSearchoverlay.parameters = { kind: "internal SearchOverlay", screenshot: config };

export const InternalSearchoverlayThemed = () =>
    wrapWithTheme(
        <SearchOverlay onSelect={action("onSelect")} backend={backend} workspace={ReferenceWorkspaceId} />,
    );
InternalSearchoverlayThemed.parameters = { kind: "internal SearchOverlay themed", screenshot: config };
