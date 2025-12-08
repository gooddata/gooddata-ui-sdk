// (C) 2020-2025 GoodData Corporation

import { action } from "storybook/actions";

import { ChatEvent, GenAIAssistant } from "@gooddata/sdk-ui-gen-ai";
import "@gooddata/sdk-ui-gen-ai/styles/css/main.css";

import { ReferenceWorkspaceId, StorybookBackend } from "../../_infra/backend.js";
import { IStoryParameters } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

const backend = StorybookBackend();

function FlexAIBase({ width = 500 }: { width?: number }) {
    return (
        <div className="library-component screenshot-target">
            <div style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
                <div>
                    <h4>Flex AI</h4>
                    <div style={{ width, height: 600, display: "flex", border: "1px solid black" }}>
                        <GenAIAssistant
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
}

// eslint-disable-next-line no-restricted-exports
export default {
    title: "14 GenAI/Chat",
};

export function FullFeatured() {
    return <FlexAIBase />;
}
FullFeatured.parameters = { kind: "full-featured" } satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<FlexAIBase />);
Themed.parameters = { kind: "themed" } satisfies IStoryParameters;
