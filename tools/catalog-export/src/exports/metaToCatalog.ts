// (C) 2007-2019 GoodData Corporation
import { loadProjectMetadata } from "../loaders/loadProjectMetadata";
import { transformToCatalog } from "../transform/toCatalog";
import * as fs from "fs";

/**
 * Exports project metadata into catalog JSON file. If the output file already exists, its contents
 * will be merged with the catalog built from current state of the project metadata.
 *
 * @param projectId - project to make catalog for
 * @param outputFile - output file where the catalog should be saved
 */
export async function exportMetadataToCatalog(projectId: string, outputFile: string): Promise<void> {
    let existingCatalog: any | undefined;

    if (fs.existsSync(outputFile)) {
        existingCatalog = JSON.parse(fs.readFileSync(outputFile, { encoding: "utf-8" }));
        fs.renameSync(outputFile, `${outputFile}.bak`);
    }

    const projectMetadata = await loadProjectMetadata(projectId);
    const catalog = transformToCatalog(projectMetadata, existingCatalog);

    fs.writeFileSync(outputFile, JSON.stringify(catalog, null, "  "));
}
