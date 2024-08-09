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
import { HeaderMobileSearch } from "@gooddata/sdk-ui-semantic-search/internal";
import { IntlProvider } from "react-intl";

const backend = StorybookBackend();

const messages = {
    "semantic-search.placeholder": "Search",
    "semantic-search.error.title": "Error title",
    "semantic-search.error.text": "Error text",
    "semantic-search.no-results": "No results found",
    "semantic-search.id": "ID",
    "semantic-search.tags": "TAGS",
};

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
        "mobile",
        () => (
            <IntlProvider locale="en-US" messages={messages}>
                <HeaderMobileSearch
                    onSelect={action("onSelect")}
                    backend={backend}
                    workspace={ReferenceWorkspaceId}
                />
            </IntlProvider>
        ),
        { screenshot: config },
    )
    .add(
        "mobile themed",
        () =>
            wrapWithTheme(
                <IntlProvider locale="en-US" messages={messages}>
                    <HeaderMobileSearch
                        onSelect={action("onSelect")}
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                    />
                </IntlProvider>,
            ),
        { screenshot: config },
    );
