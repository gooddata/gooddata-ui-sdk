// (C) 2022 GoodData Corporation
const fg = require("fast-glob");
const path = require("path");
const { writeFile } = require("fs/promises");
const storybookMain = require("../.storybook/main");

const targetFile = path.resolve(__dirname, "generated.stories.js");
const storiesGlob = storybookMain.stories;

/**
 * Generate a barrel file with imports of all the story files.
 * This has to be done ahead of time to help jest avoiding need for async imports that cause problems on CI.
 */
async function main() {
    const files = await fg(storiesGlob, { cwd: path.resolve(__dirname) });

    const header = `// (C) ${new Date().getFullYear()} GoodData Corporation`;

    const requires = files.map((file) => `import "${file}";`).join("\n");

    const fileContents = `${header}\n${requires}\n`;

    await writeFile(targetFile, fileContents, { encoding: "utf8" });
}

main();
