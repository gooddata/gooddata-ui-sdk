// (C) 2022 GoodData Corporation
/* eslint-disable no-console */
import path from "path";
import { existsSync, writeFileSync } from "fs";

import { toBackstopJson } from "../stories/_infra/storyRepository";

import "./generated.stories";

const targetFile = path.resolve(__dirname, "stories.json");

describe("story-extractor", () => {
    it("dumps stories into a file", () => {
        const fileContents = toBackstopJson();

        writeFileSync(targetFile, fileContents, { encoding: "utf-8" });
        expect(existsSync(targetFile)).toBe(true);
    });
});
