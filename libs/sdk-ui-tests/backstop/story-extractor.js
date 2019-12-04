// (C) 2007-2019 GoodData Corporation
import { configure, getStorybook } from "@storybook/react";
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
        const req = require.context("../stories", true, /\.tsx?$/);

        function loadStories() {
            req.keys().forEach(filename => req(filename));
        }

        configure(loadStories, module);
        return getStorybook();
    }

    it("dumps stories into a file", () => {
        const stories = getAvailableStories();
        const storyDump = [];

        stories.forEach(kind => {
            kind.stories.forEach(story => {
                storyDump.push({
                    kind: kind.kind,
                    name: story.name,
                });
            });
        });

        fs.writeFileSync(OutputFilename, JSON.stringify(storyDump, null, 4), { encoding: "utf-8" });
        expect(fs.existsSync(OutputFilename)).toBe(true);
    });
});
