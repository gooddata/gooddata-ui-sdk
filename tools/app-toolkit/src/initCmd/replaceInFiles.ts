// (C) 2021-2026 GoodData Corporation

import path from "path";

import fse from "fs-extra";

type ReadFileFn = typeof fse.readFile;
type WriteFileFn = typeof fse.writeFile;

type FileReplacements = {
    file: string;
    replacements: RegexReplacement[];
};

type FileReplacementProcessor = (rep: FileReplacements) => Promise<void>;

function collectFileReplacements(currentPath: string, spec: FileReplacementSpec): FileReplacements[] {
    return Object.entries(spec).flatMap(([key, value]) => {
        const nextPath = path.join(currentPath, key);

        if (Array.isArray(value)) {
            return [{ file: nextPath, replacements: value }];
        }

        return collectFileReplacements(nextPath, value);
    });
}

function createFileProcessor(readFile: ReadFileFn, writeFile: WriteFileFn): FileReplacementProcessor {
    return async ({ file, replacements }) => {
        let contents;
        try {
            contents = await readFile(file, { encoding: "utf8", flag: "r" });
        } catch (e: any) {
            // ENOENT is fine, allow defining replacements for files that may not exist
            if (e.code === "ENOENT") return;

            throw e;
        }

        const replaced = replacements.reduce(
            (acc, { regex, value, apply }) => ((apply ?? true) ? acc.replace(regex, value) : acc),
            contents,
        );

        return writeFile(file, replaced, { encoding: "utf8", flag: "w" });
    };
}

//
//
//

export type RegexReplacement = {
    regex: RegExp;
    value: string;
    apply?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IFileReplacementSpec extends Record<string, RegexReplacement[] | IFileReplacementSpec> {}

export async function replaceInFiles(
    initialPath: string,
    spec: IFileReplacementSpec,
    readFile: ReadFileFn = fse.readFile,
    writeFile: WriteFileFn = fse.writeFile,
): Promise<void> {
    const fileReplacements: FileReplacements[] = collectFileReplacements(initialPath, spec);
    const processor: FileReplacementProcessor = createFileProcessor(readFile, writeFile);

    await Promise.all(fileReplacements.map(processor));
}
