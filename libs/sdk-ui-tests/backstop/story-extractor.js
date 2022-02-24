// (C) 2022 GoodData Corporation
/* eslint-disable no-console */
import fg from "fast-glob";
import path from "path";
import { writeFile } from "fs/promises";
import { existsSync } from "fs";

import { toBackstopJson } from "../stories/_infra/storyRepository";

const storiesGlob = path.resolve(__dirname, "../stories/**/*.@(ts|tsx)");
const targetFile = path.resolve(__dirname, "stories.json");

describe("story-extractor", () => {
    it("dumps stories into a file", async () => {
        try {
            console.log("Going to extract stories for backstop...");
            const files = await fg(storiesGlob, { cwd: path.resolve(__dirname) });

            await Promise.all(
                files.map((file) => {
                    console.log("Importing story file: ", file);
                    return import(file);
                }),
            );

            const fileContents = toBackstopJson();

            await writeFile(targetFile, fileContents, { encoding: "utf-8" });
            expect(existsSync(targetFile)).toBe(true);
        } catch (e) {
            console.error("Error extracting stories: ", e);
            throw e;
        }
    });
});
