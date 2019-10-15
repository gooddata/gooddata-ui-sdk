// (C) 2007-2019 GoodData Corporation
import { loadProjectMetadata } from "../loaders/loadProjectMetadata";
import { transformToTypescript } from "../transform/toTypescript";
import { format } from "prettier";
import * as fs from "fs";

/**
 * Exports project metadata into typescript file containing sdk-model entity definitions (attribute, measure, etc)
 *
 * @param projectId - id of project to export from
 * @param outputFile - output typescript file - WILL be overwritten
 */
export async function exportMetadataToTypescript(projectId: string, outputFile: string): Promise<void> {
    const projectMetadata = await loadProjectMetadata(projectId);
    const output = await transformToTypescript(projectMetadata, outputFile);

    output.project.saveSync();

    const generatedTypescript = fs.readFileSync(outputFile, { encoding: "utf-8" });
    const formattedTypescript = format(generatedTypescript, { parser: "typescript", printWidth: 120 });

    fs.writeFileSync(outputFile, formattedTypescript, { encoding: "utf-8" });
}
