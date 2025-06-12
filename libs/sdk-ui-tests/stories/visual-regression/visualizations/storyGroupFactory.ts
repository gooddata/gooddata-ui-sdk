// (C) 2007-2018 GoodData Corporation
import { IScenarioGroup } from "../../../src/index.js";
import { storiesOf } from "../../_infra/storyRepository.js";

type GroupedStories = {
    [visAndGroup: string]: ReturnType<typeof storiesOf>;
};

const stories: GroupedStories = {};

/**
 * Given a story category (used for high-level menu item) & scenario group, this function returns the StoryApi
 * that can be used to add stories.
 *
 * @param category - story category
 * @param scenarioGroup - group of scenarios which will be added using the StoryApi
 */
export function storyGroupFor(
    category: string,
    scenarioGroup: IScenarioGroup<any>,
): ReturnType<typeof storiesOf> {
    const name = [category, scenarioGroup.vis, ...scenarioGroup.groupNames].join("/");
    let storyApi = stories[name];

    if (!storyApi) {
        storyApi = storiesOf(name);
        stories[name] = storyApi;
    }

    return storyApi;
}
