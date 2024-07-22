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
        selector: ".semantic-search input",
    },
};

storiesOf(`${GenAIStories}/SemanticSearch`)
    .add("full-featured", () => <SemanticSearchBase />, { screenshot: config })
    .add("short", () => <SemanticSearchBase width={100} />, { screenshot: config })
    .add("themed", () => wrapWithTheme(<SemanticSearchBase />), { screenshot: config });
