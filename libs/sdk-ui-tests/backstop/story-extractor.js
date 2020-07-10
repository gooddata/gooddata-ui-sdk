// (C) 2007-2019 GoodData Corporation
import { configure, getStorybook, raw } from "@storybook/react";
import * as fs from "fs";
const OutputFilename = "backstop/stories.json";

/*
 * This is a quick-and-dirty way to dump JSON with information about stories that are available in storybook.
 *
 * To achieve this on server/workstation is somewhat tricky, because storybook configuration is normally
 * expected to be done in browser => extra setup is needed (JSDOM, static assets).
 *
 * This code takes shortcut to get all this extra setup for free - it misuses Jest to prepare the right
 * environment and then the test runs and it's side-effect is the dump. Definitely not nice thing to do but
 * fast and reliable and not maintained by us.
 *
 * Ideally this extractor would be a stand-alone command line tool using something like 'browser-env'...
 *
 * Also see: https://www.npmjs.com/package/@storybook/addon-storyshots - the steps neded to make require.context()
 * working are taken from there.
 */

describe("story-extractor", () => {
    function getAvailableStories() {
        const req = require.context("../stories/visual-regression", true, /\.tsx?$/);

        function loadStories() {
            req.keys().forEach((filename) => req(filename));
        }

        configure(loadStories, module);
        return raw();
    }

    it("dumps stories into a file", () => {
        const stories = getAvailableStories();
        const storyDump = [];

        stories.forEach((rawStory) => {
            const storyElement = rawStory.getOriginal()();
            let config = {};

            /*
             * See if story defined global configuration for backstop scenario(s) that will be derived from it.
             */
            if (storyElement.props !== undefined && storyElement.props.config !== undefined) {
                config = storyElement.props.config;
            }

            if (storyElement.props === undefined || storyElement.props.scenarios === undefined) {
                /*
                 * The story does not explicitly define any backstop scenarios... falling back to
                 * implicit scenarios-for-story
                 */
                storyDump.push({
                    storyId: rawStory.id,
                    storyKind: rawStory.kind,
                    storyName: rawStory.name,
                    scenarioConfig: config,
                });
            } else {
                /*
                 * The story explicitly tells what backstop scenarios there should be & specifies
                 * backstop config for them. Dump all listed scenarios.
                 */
                Object.entries(storyElement.props.scenarios).forEach(([name, scenarioConfig]) => {
                    storyDump.push({
                        storyId: rawStory.id,
                        storyKind: rawStory.kind,
                        storyName: rawStory.name,
                        scenarioName: name,
                        scenarioConfig: {
                            ...config,
                            ...scenarioConfig,
                        },
                    });
                });
            }
        });

        fs.writeFileSync(OutputFilename, JSON.stringify(storyDump, null, 4), { encoding: "utf-8" });
        expect(fs.existsSync(OutputFilename)).toBe(true);
    });
});
