// (C) 2022 GoodData Corporation
import flatMap from "lodash/flatMap.js";
import { toId } from "@componentdriven/csf";

// This is the only place that should be calling the storybook version of the storiesOf function
// eslint-disable-next-line no-restricted-imports
import { storiesOf as storiesOfInternal } from "@storybook/react";

import { IBackstopScenarioConfig } from "./backstopScenario.js";
import { wrapForBackstop } from "./backstopWrapper.js";

interface ISingleScreenshotConfig {
    screenshot?: IBackstopScenarioConfig | true;
}

function isSingleScreenshotConfig(obj: unknown): obj is ISingleScreenshotConfig {
    return !!(obj as ISingleScreenshotConfig | undefined)?.screenshot;
}

interface IMultipleScreenshotConfig {
    screenshots?: Record<string, IBackstopScenarioConfig>;
}

function isMultipleScreenshotConfig(obj: unknown): obj is IMultipleScreenshotConfig {
    return !!(obj as IMultipleScreenshotConfig | undefined)?.screenshots;
}

type ScreenshotConfig = ISingleScreenshotConfig | IMultipleScreenshotConfig;

type IAdditionalStoryConfig = ScreenshotConfig;

interface IStoryDefinition {
    name: string;
    render: () => JSX.Element;
    config?: IAdditionalStoryConfig;
}

type Kind = string;

class StoryRepository {
    private stories: Record<Kind, IStoryDefinition[]> = {};

    public addStory(
        kind: Kind,
        name: string,
        render: () => JSX.Element,
        config?: IAdditionalStoryConfig,
    ): void {
        if (!this.stories[kind]) {
            this.stories[kind] = [];
        }
        this.stories[kind].push({
            name,
            render,
            config,
        });
        const renderFunction =
            isSingleScreenshotConfig(config) || isMultipleScreenshotConfig(config)
                ? wrapForBackstop(render)
                : render;

        storiesOfInternal(kind, module).add(name, renderFunction);
    }

    public toBackstopJson(): string {
        const flattened = flatMap(Object.entries(this.stories), ([kind, stories]) => {
            return flatMap(
                stories.filter(
                    (story) =>
                        isSingleScreenshotConfig(story.config) || isMultipleScreenshotConfig(story.config),
                ),
                (story) => {
                    const base = {
                        storyId: toId(kind, story.name),
                        storyKind: kind,
                        storyName: story.name,
                    };

                    if (isSingleScreenshotConfig(story.config)) {
                        return [
                            {
                                ...base,
                                scenarioConfig:
                                    story.config.screenshot === true ? {} : story.config.screenshot,
                            },
                        ];
                    }

                    if (isMultipleScreenshotConfig(story.config)) {
                        return Object.entries(story.config!.screenshots!).map(
                            ([scenarioName, scenarioConfig]) => {
                                return {
                                    ...base,
                                    scenarioName,
                                    scenarioConfig,
                                };
                            },
                        );
                    }

                    return [];
                },
            );
        });

        return JSON.stringify(flattened, null, 4);
    }
}

const singleton = new StoryRepository();

export function storiesOf(kind: Kind) {
    return {
        add(name: string, render: () => JSX.Element, config?: IAdditionalStoryConfig) {
            singleton.addStory(kind, name, render, config);
            return this;
        },
    };
}

export function toBackstopJson(): string {
    return singleton.toBackstopJson();
}
