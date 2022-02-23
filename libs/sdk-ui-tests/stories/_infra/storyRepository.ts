// (C) 2022 GoodData Corporation
import flatMap from "lodash/flatMap";
import { toId } from "@componentdriven/csf";
import { storiesOf as storiesOfInternal } from "@storybook/react";

import { IBackstopScenarioConfig } from "./backstopScenario";
import { wrapForBackstop } from "./backstopWrapper";

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

    public populateStorybook(): void {
        Object.entries(this.stories).forEach(([kind, stories]) => {
            stories.forEach((story) => {
                const renderFunction =
                    isSingleScreenshotConfig(story.config) || isMultipleScreenshotConfig(story.config)
                        ? wrapForBackstop(story.render)
                        : story.render;

                storiesOfInternal(kind, module).add(story.name, renderFunction);
            });
        });
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

export function populateStorybook(): void {
    return singleton.populateStorybook();
}
