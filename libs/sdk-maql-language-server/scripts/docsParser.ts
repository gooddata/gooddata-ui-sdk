// (C) 2021-2026 GoodData Corporation

import * as fs from "fs";
import * as path from "path";

import colors from "colors";
import { glob } from "glob";
import { dedent } from "ts-dedent";

const MissingOutputDir = "MissingOutputDirectory";
const MissingInputDir = "MissingInputDirectory";

// linking to files on the local machine is troublesome, because relative paths do not work
// links in documentation will therefore point to the official website
const docsUrl = "https://www.gooddata.com/developers/cloud-native/doc/hosted";
const imageBaseUrl = "https://www.gooddata.com/developers/cloud-native/doc";
const defaultLocales = "en";
const searchedFiles = "**/maql/**/[!_]*.md";
const currentYear = new Date().getFullYear();

logger(colors.white.bold(`Maql documentation to monaco suggestion documentation parser started.`));
parseParams()
    .then(({ outputDir, inputDir }) => searchFiles(outputDir, inputDir))
    .catch((err: Error) => {
        logger(colors.red(`Error occurred: ${err.message}`));
        switch (err.name) {
            case MissingOutputDir:
                logger(
                    colors.red(
                        ` - The path in argument should point to an output directory where generated typescript files will be saved.`,
                    ),
                );
                break;
            case MissingInputDir:
                logger(
                    colors.red(
                        ` - The path in argument should point to a directory containing all language versions of the documentation. For example this parameter can navigate into "gooddata/gdc-tiger-docs/docs/content".`,
                    ),
                );
                break;
            default:
                logger(colors.red(`Generating of documentation ends with errors.`));
                break;
        }
    });

function searchFiles(outputDir: string, inputDir: string): Promise<void> {
    const enInputDir = path.join(inputDir, defaultLocales);
    const fromDir = path.join(enInputDir, searchedFiles);

    logger(colors.green(`Output directory is set to "${outputDir}"`));
    logger(colors.blue(`Searching for .md files in directory "${inputDir}" ...`));

    return glob(fromDir).then((files) => {
        logger(colors.white(` - Found ${files.length} files with documentation.`));

        return Promise.all(files.map((file: string) => parseFile(outputDir, inputDir, enInputDir, file)))
            .then((files) => createIndexFile(outputDir, files))
            .then(() => logger(colors.green(`Generating of documentation is done.`)));
    });
}

function parseFile(
    outputDir: string,
    inputDir: string,
    enInputDir: string,
    filePath: string,
): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            //process file
            const content = data.toString();
            const dirUrl = path.relative(path.join(enInputDir, "docs"), filePath.replace(".md", "")); // remove .md suffix
            const parsed = parseMarkdown(content.toString(), dirUrl);
            // get import file path when importing in src/docs/index.ts
            const importPath = path.relative(inputDir, filePath).replace(".md", ""); // remove .md suffix
            // get path to file from this script
            const newPath = path.join(outputDir, `${importPath}.ts`);
            const newContent = template(parsed);
            // store file in src/ folder
            fs.mkdirSync(path.dirname(newPath), { recursive: true });
            fs.writeFile(newPath, newContent, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(importPath);
                }
            });
        });
    });
}

function createIndexFile(outputDir: string, files: Array<string>): Promise<void> {
    return new Promise((resolve, reject) => {
        // create a directory in as specified in outputDir
        fs.mkdirSync(path.dirname(outputDir), { recursive: true });
        // create an index.ts file for all documentation in all languages
        createIndexContent(outputDir, files).then(resolve).catch(reject);
    });
}

//MARKDOWNS of documentation

interface IHeader {
    title: string | undefined;
}

/**
 * Parse markdown file and update its content
 */
function parseMarkdown(content: string, dirUrl: string): string {
    // split into header and body
    const sections = content.match(/^---([\s\S]*?)---([\s\S]*)/m);
    if (!sections) {
        throw new Error(`Unable to parse as markdown content:\n${content}`);
    }
    const header = parseHeader(sections[1]);
    const title = header.title;
    const body = sections[2]
        .trim()
        // links to images
        .replace(/(!\[.*\]\()(.*)(\))/g, `$1${imageBaseUrl}$2$3`)
        // links to other files
        .replace(/([^!]\[[^\]]+\]\()((?:\..\/)*)([^)]{2,})\)/g, (...args) => {
            const root = path.join(docsUrl.replace("https://www.gooddata.com/", ""), dirUrl, "/");
            const relative = path.join(root, args[2]);
            return `${args[1]}https://www.gooddata.com/${relative}${args[3]})`;
        })
        // custom Hugo image macros
        .replace(/\{\{<[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>\}\}/g, `![$1](${imageBaseUrl}$2)`)
        // remove other Hugo macros
        .replace(/\{\{%.*?%\}\}\n/g, "");
    if (title) {
        return `# ${title}\n${body}`;
    } else {
        return body;
    }
}

/**
 * Parse header from Markdown
 */
function parseHeader(header: string): IHeader {
    return {
        title: header.match(/title: "(.*)"/)?.[1],
    };
}

/**
 * Generate code to have one exported constant "content"
 */
function template(text: string): string {
    return dedent`
    // (C) 2021-${currentYear} GoodData Corporation

    export const content = \`${text
        .replace(/\\`/g, "`")
        .replace(/`/g, "\\`")
        .replace(/\$\{([^}]*)\}/g, "\\${$1}")}\`;

    `;
}

//CREATING INDEX FILE

function createIndexContent(outputDir: string, files: Array<string>): Promise<void> {
    return new Promise((resolve, reject) => {
        // create an index.ts file for all documentation in all languages
        const imports: string[] = [];
        const langPageMap = new Map<string, string[]>();
        files.forEach((file) => {
            let baseName = path.basename(file);
            if (baseName === "index") {
                baseName = file.split(path.sep).slice(-2).join("/");
            }
            const alias = `cont__${baseName.replace(/\W/g, "_")}`;
            imports.push(`import { content as ${alias} } from "./${file}";`);
            let lang = file.split(path.sep)[0].toLowerCase();
            if (lang === "en") {
                lang = "en-us";
            }
            const key = `"${baseName}"`;
            const pages = langPageMap.get(lang) ?? [];
            if (pages.length === 0) {
                langPageMap.set(lang, pages);
            }
            pages.push(`${key}: ${alias},`);
        });
        // index.ts imports all docs files and stores the contents in an object, accessed by docsIndex['lang']['file']
        const languages = Array.from(langPageMap.keys());
        const objectContent = Array.from(langPageMap).map(([lang, pages]) => {
            return dedent`
                "${lang}": {
                    ${pages.join("\n")}
                },
                `;
        });
        const indexContent = dedent`
            // (C) 2021-${currentYear} GoodData Corporation

            ${imports.join("\n")}


            /**
             * IETF BCP 47 language tags for supported locales in documentation
             */
            export const locales = [${languages.map((lang) => `"${lang}"`).join(", ")}] as const;
            export type Locale = typeof locales[number];

            export const docsIndex = {
                ${objectContent.join("\n")}
            } as const;

            export type ResolveTag = ${languages
                .map((lang) => `keyof typeof docsIndex["${lang}"]`)
                .join(" | ")};

            `;
        fs.writeFile(path.join(outputDir, "index.ts"), indexContent, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });

        logger(colors.white(` - Created index file "${path.join(outputDir, "index.ts")}".`));
    });
}

//PARAMS

function parseParams(): Promise<{ outputDir: string; inputDir: string }> {
    return new Promise((resolve, reject) => {
        const [, , outputDir, inputDir] = process.argv;

        if (!outputDir) {
            const err = new Error("Missing first argument 'path to output directory'.");
            err.name = MissingOutputDir;
            reject(err);
            return;
        }
        if (!inputDir) {
            const err = new Error("Missing second argument 'path to docs directory'.");
            err.name = MissingInputDir;
            reject(err);
            return;
        }
        //ok
        resolve({ outputDir, inputDir });
    });
}

//CONSOLE

function logger(...msg: string[]) {
    // oxlint-disable-next-line eslint-js/no-console
    console.log(...msg);
}
