// (C) 2025 GoodData Corporation

import path from "path";
import { fileURLToPath } from "url";

import fg from "fast-glob";

import { type INeobackstopScenarioConfig } from "./backstopScenario.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ISingleScreenshotConfig {
    screenshot?: INeobackstopScenarioConfig | true;
}

function isSingleScreenshotConfig(obj: unknown): obj is ISingleScreenshotConfig {
    return !!(obj as ISingleScreenshotConfig | undefined)?.screenshot;
}

interface IMultipleScreenshotConfig {
    screenshots?: Record<string, INeobackstopScenarioConfig>;
}

function isMultipleScreenshotConfig(obj: unknown): obj is IMultipleScreenshotConfig {
    return !!(obj as IMultipleScreenshotConfig | undefined)?.screenshots;
}

type IParameters = { kind: string } & (ISingleScreenshotConfig | IMultipleScreenshotConfig);

function sanitize(str: string) {
    return str.replace(/[^a-zA-Z0-9\s@_-]/g, "").replace(/@/g, "-");
}

function toKebabCase(str: string) {
    const sanitized = sanitize(str);

    return (
        sanitized
            // Insert hyphens: aB → a-B
            .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
            // Insert hyphens: ABc → A-Bc
            .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
            // Insert hyphens: a1 → a-1
            .replace(/([a-zA-Z])([0-9])/g, "$1-$2")
            // Insert hyphens: 1a → 1-a
            .replace(/([0-9])([a-zA-Z])/g, "$1-$2")
            // Replace spaces and underscores with dash
            .replace(/[\s_]+/g, "-")
            .toLowerCase()
    );
}

function customToId(title: string, exportName: string) {
    const kebabTitle = title
        .split("/")
        .map((part) => sanitize(part.trim()).replace(/\s+/g, "-").toLowerCase())
        .join("-");

    const kebabExport = toKebabCase(exportName);
    return `${kebabTitle}--${kebabExport}`;
}

export interface IStoryInfo {
    storyId: string;
    storyKind: string;
    storyName: string;
    scenarioName?: string;
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    scenarioConfig: INeobackstopScenarioConfig | {} | undefined;
}

async function processStoryFile(file: string): Promise<IStoryInfo[]> {
    const absPath = path.resolve(path.join("stories/_infra", file));

    try {
        const storiesFromFile: Record<string, { parameters: IParameters; name: string; title: string }> =
            await import(/* @vite-ignore */ absPath);

        const defaultStory = storiesFromFile["default"];
        if (!defaultStory) {
            // eslint-disable-next-line no-console
            console.log(`No default story, skipping file: ${file}`);
            return [];
        }

        return Object.entries(storiesFromFile)
            .filter(([exportName]) => exportName !== "default")
            .map(([exportName, story]) => {
                const { name, parameters } = story;

                if (parameters === undefined)
                    throw new Error(`Parameters undefined for: ${absPath}. ${name}`);
                if (parameters.kind === undefined) throw new Error(`Kind undefined for: ${absPath}. ${name}`);

                const base = {
                    storyId: customToId(defaultStory.title, exportName),
                    storyKind: defaultStory.title,
                    storyName: parameters.kind,
                };

                if (isSingleScreenshotConfig(parameters)) {
                    return [
                        {
                            ...base,
                            scenarioConfig: parameters.screenshot === true ? {} : parameters.screenshot,
                        },
                    ];
                }

                if (isMultipleScreenshotConfig(parameters)) {
                    return Object.entries(parameters.screenshots!).map(([scenarioName, scenarioConfig]) => {
                        return {
                            ...base,
                            scenarioName,
                            scenarioConfig,
                        };
                    });
                }

                return [];
            })
            .flat();
    } catch (error) {
        console.error(`Error processing story file ${file}:`, error);
        return [];
    }
}

export async function toBackstopJson(): Promise<IStoryInfo[]> {
    const storybookMain = (
        (await import("../../.storybook/main.js" as any)) as { default: { stories: string[] } }
    ).default;
    const storiesGlob = storybookMain.stories;

    // because we are in stories/_infra, instead of .storybook
    storiesGlob[0] = path.join("../", storiesGlob[0]);

    const files = await fg(storiesGlob, { cwd: path.resolve(path.join(__dirname)) });
    // eslint-disable-next-line no-console
    console.log(`Found ${files.length} story files...`);

    // Process files in parallel with controlled concurrency to avoid overwhelming the system
    const concurrency = 10; // Process 10 files at a time
    const stories: IStoryInfo[] = [];

    for (let i = 0; i < files.length; i += concurrency) {
        const batch = files.slice(i, i + concurrency);

        const batchPromises = batch.map((file) => processStoryFile(file));
        const batchResults = await Promise.all(batchPromises);

        for (const fileStories of batchResults) {
            stories.push(...fileStories);
        }
    }

    // eslint-disable-next-line no-console
    console.log(`Processed ${stories.length} stories total`);

    return stories.sort((x, y): number => {
        if (x.storyId < y.storyId) return -1;
        if (x.storyId > y.storyId) return 1;
        return 0;
    });
}
