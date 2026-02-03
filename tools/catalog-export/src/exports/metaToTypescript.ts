// (C) 2007-2026 GoodData Corporation

import fs from "fs";

import { format } from "oxfmt";

import { type WorkspaceMetadata } from "../base/types.js";
import { transformToTypescript } from "../transform/toTypescript.js";

/**
 * Exports project metadata into typescript file containing sdk-model entity definitions (attribute, measure, etc)
 *
 * @param projectMetadata - project metadata to export into typescript
 * @param outputFile - output typescript file - WILL be overwritten
 */
export async function exportMetadataToTypescript(
    projectMetadata: WorkspaceMetadata,
    outputFile: string,
): Promise<void> {
    const output = transformToTypescript(projectMetadata, outputFile);

    const generatedTypescript = output.sourceFile.getFullText();
    const formattedTypescript = await format(outputFile, generatedTypescript, {
        parser: "typescript",
        printWidth: 120,
    });

    fs.writeFileSync(outputFile, formattedTypescript.code, { encoding: "utf-8" });
}
