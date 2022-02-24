// (C) 2022 GoodData Corporation
import fg from "fast-glob";
import path from "path";
import { writeFile } from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storiesGlob = "../stories/**/*.@(ts|tsx)";
const targetFile = path.resolve(__dirname, "generated.stories.js");

/**
 * Generate a barrel file with imports of all the story files.
 * This has to be done ahead of time, because the stuff in .storybook/main.js must be synchronous.
 */
async function main() {
    const files = await fg(storiesGlob, { cwd: path.resolve(__dirname) });

    const header = `// (C) ${new Date().getFullYear()} GoodData Corporation`;

    const requires = files.map((file) => `import "${file}";`).join("\n");

    const footer = `import { populateStorybook } from "./_infra/storyRepository";
populateStorybook();`;

    const fileContents = `${header}\n${requires}\n\n${footer}`;

    await writeFile(targetFile, fileContents, { encoding: "utf8" });
}

main();
