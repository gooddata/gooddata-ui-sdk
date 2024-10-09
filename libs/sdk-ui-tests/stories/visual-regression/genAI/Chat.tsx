// (C) 2020-2024 GoodData Corporation
import React from "react";
import { GenAIChat, Message } from "@gooddata/sdk-ui-gen-ai";
import { StorybookBackend, ReferenceWorkspaceId } from "../../_infra/backend.js";

import { storiesOf } from "../../_infra/storyRepository.js";
import { GenAIStories } from "../../_infra/storyGroups.js";
import { wrapWithTheme } from "../themeWrapper.js";

import "@gooddata/sdk-ui-gen-ai/styles/css/main.css";

const backend = StorybookBackend();

const history: Message[] = [
    {
        localId: "1",
        created: Date.now(),
        role: "user",
        cancelled: false,
        complete: true,
        content: [
            {
                type: "text",
                text: "Hello World from the Username!",
            },
        ],
    },
    {
        localId: "2",
        created: Date.now() + 1000,
        role: "assistant",
        cancelled: false,
        complete: true,
        content: [
            {
                type: "text",
                text: "Hello World from the Assistant!",
            },
        ],
    },
    {
        localId: "3",
        created: Date.now() + 2000,
        role: "user",
        cancelled: false,
        complete: true,
        content: [
            {
                type: "text",
                text: "A longer message. ".repeat(30),
            },
        ],
    },
    {
        localId: "4",
        created: Date.now() + 3000,
        role: "assistant",
        cancelled: false,
        complete: true,
        content: [
            {
                type: "text",
                text: "A longer reply. ".repeat(10),
            },
        ],
    },
];

const FlexAIBase: React.FC<{ width?: number }> = ({ width = 500 }) => (
    <div className="library-component screenshot-target">
        <div style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
            <div>
                <h4>Flex AI</h4>
                <div style={{ width, height: 600, display: "flex", border: "1px solid black" }}>
                    <GenAIChat backend={backend} workspace={ReferenceWorkspaceId} history={history} />
                </div>
            </div>
        </div>
    </div>
);

storiesOf(`${GenAIStories}/Chat`)
    .add("full-featured", () => <FlexAIBase />)
    .add("themed", () => wrapWithTheme(<FlexAIBase />));
