// (C) 2020-2024 GoodData Corporation
import React from "react";
import { SemanticSearch } from "@gooddata/sdk-ui-semantic-search";
import { action } from "@storybook/addon-actions";
import { StorybookBackend, ReferenceWorkspaceId } from "../../_infra/backend.js";

import { storiesOf } from "../../_infra/storyRepository.js";
import { GenAIStories } from "../../_infra/storyGroups.js";
import { wrapWithTheme } from "../themeWrapper.js";

import "@gooddata/sdk-ui-semantic-search/styles/css/main.css";
import { IBackstopScenarioConfig } from "../../_infra/backstopScenario.js";
import { SearchOverlay } from "@gooddata/sdk-ui-semantic-search/internal";

const backend = StorybookBackend();

const SemanticSearchBase: React.FC<{ width?: number }> = ({ width = 200 }) => (
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
    keyPressSelector: {
        keyPress: "test",
        selector: "input",
    },
    postInteractionWait: ".gd-semantic-search__results-item",
};

storiesOf(`${GenAIStories}/SemanticSearch`)
    .add("full-featured", () => <SemanticSearchBase />, { screenshot: config })
    .add("short", () => <SemanticSearchBase width={100} />, { screenshot: config })
    .add("themed", () => wrapWithTheme(<SemanticSearchBase />), { screenshot: config })
    .add(
        "internal SearchOverlay",
        () => (
            <SearchOverlay onSelect={action("onSelect")} backend={backend} workspace={ReferenceWorkspaceId} />
        ),
        { screenshot: config },
    )
    .add(
        "internal SearchOverlay themed",
        () =>
            wrapWithTheme(
                <SearchOverlay
                    onSelect={action("onSelect")}
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                />,
            ),
        { screenshot: config },
    );
