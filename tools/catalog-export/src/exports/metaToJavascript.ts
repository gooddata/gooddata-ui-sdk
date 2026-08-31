// (C) 2007-2026 GoodData Corporation

import * as fs from "fs";

import { transform } from "oxc-transform";
import { format } from "oxfmt";

import { type WorkspaceMetadata } from "../base/types.js";
import { transformToTypescript } from "../transform/toTypescript.js";

/**
 * Exports project metadata into javascript file containing sdk-model entity definitions (attribute, measure, etc)
 *
 * This is done by generating typescript code & then running it through oxc-transform which strips away the
 * type annotations.
 *
 * @param projectMetadata - project metadata to export into javascript
 * @param outputFile - output typescript file - WILL be overwritten
 */
export async function exportMetadataToJavascript(
    projectMetadata: WorkspaceMetadata,
    outputFile: string,
): Promise<void> {
    const output = transformToTypescript(projectMetadata, outputFile);

    const generatedTypescript = output.sourceFile.getFullText();
    const formattedTypescript = await format(outputFile, generatedTypescript, {
        parser: "typescript",
        printWidth: 120,
    });

    // oxc-transform infers the source language from the file name, so pass a .ts name to ensure
    // the TypeScript type annotations are stripped (the emitted file itself is the .js outputFile).
    const { code: javascript } = await transform(
        outputFile.replace(/\.[^./\\]+$/, ".ts"),
        formattedTypescript.code,
    );

    const formattedJavascript = await format(outputFile, javascript, {
        printWidth: 120,
    });

    fs.writeFileSync(outputFile, formattedJavascript.code, { encoding: "utf-8" });
}
