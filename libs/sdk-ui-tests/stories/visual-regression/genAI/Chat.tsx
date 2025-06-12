// (C) 2020-2024 GoodData Corporation
import React from "react";
import { ChatEvent, GenAIChat } from "@gooddata/sdk-ui-gen-ai";
import { StorybookBackend, ReferenceWorkspaceId } from "../../_infra/backend.js";

import { storiesOf } from "../../_infra/storyRepository.js";
import { GenAIStories } from "../../_infra/storyGroups.js";
import { wrapWithTheme } from "../themeWrapper.js";

import "@gooddata/sdk-ui-gen-ai/styles/css/main.css";
import { action } from "@storybook/addon-actions";

const backend = StorybookBackend();

const FlexAIBase: React.FC<{ width?: number }> = ({ width = 500 }) => (
    <div className="library-component screenshot-target">
        <div style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
            <div>
                <h4>Flex AI</h4>
                <div style={{ width, height: 600, display: "flex", border: "1px solid black" }}>
                    <GenAIChat
                        backend={backend}
                        workspace={ReferenceWorkspaceId}
                        eventHandlers={[
                            {
                                eval: (_event: ChatEvent): _event is ChatEvent => true,
                                handler: action("handle event"),
                            },
                        ]}
                    />
                </div>
            </div>
        </div>
    </div>
);

storiesOf(`${GenAIStories}/Chat`)
    .add("full-featured", () => <FlexAIBase />)
    .add("themed", () => wrapWithTheme(<FlexAIBase />));
