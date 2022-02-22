// (C) 2007-2019 GoodData Corporation
import { configure, getStorybook } from "@storybook/react";
import * as fs from "fs";
import flatMap from "lodash/flatMap";
const OutputFilename = "backstop/stories.json";

// see https://storybook.js.org/docs/react/faq#why-is-there-no-addons-channel
import { addons, mockChannel } from "@storybook/addons";
addons.setChannel(mockChannel());

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
 * Also see: https://www.npmjs.com/package/@storybook/addon-storyshots - the steps needed to make require.context()
 * working are taken from there.
 */

describe("story-extractor", () => {
    function getAvailableStories(onError) {
        const req = require.context("../stories/visual-regression", true, /\.tsx?$/);

        function loadStories() {
            req.keys().forEach((filename) => {
                try {
                    req(filename);
                } catch (e) {
                    onError(e);
                }
            });
        }

        configure(loadStories, module);

        return flatMap(getStorybook(), (group) =>
            group.stories.map((story) => {
                return {
                    name: story.name,
                    kind: group.kind,
                    // try to match storybook id-generating logic
                    id: `${group.kind.replace(/[ /]/g, "-").toLowerCase()}--${story.name
                        .replace(/^\W*/g, "") // remove non-word prefixes
                        .replace(/[^A-z0-9 \-/]/g, "") // remove useless characters
                        .replace(/ \W /g, " ") // replace non words with a space
                        .replace(/[ /]+/g, "-") // replace consecutive spaces or slashes by a dash
                        .toLowerCase()}`,
                    render: story.render,
                };
            }),
        );
    }

    it("dumps stories into a file", () => {
        const errors = [];
        const onStoryError = (err) => {
            // eslint-disable-next-line no-console
            console.error(err);
            errors.push(err);
        };

        const stories = getAvailableStories(onStoryError);

        expect(errors.length).toEqual(0);

        const storyDump = [];

        stories.forEach((rawStory) => {
            const storyElement = rawStory.render();
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
