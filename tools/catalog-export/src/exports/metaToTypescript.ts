// (C) 2007-2025 GoodData Corporation
import { transformToTypescript } from "../transform/toTypescript.js";
import pkg from "prettier";
const { format } = pkg;
import * as fs from "fs";
import { WorkspaceMetadata } from "../base/types.js";

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
    const formattedTypescript = await format(generatedTypescript, { parser: "typescript", printWidth: 120 });

    fs.writeFileSync(outputFile, formattedTypescript, { encoding: "utf-8" });
}
