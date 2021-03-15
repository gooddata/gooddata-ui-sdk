// (C) 2007-2021 GoodData Corporation
import { transformToCatalog } from "../transform/toCatalog";
import * as fs from "fs";
import { WorkspaceMetadata } from "../base/types";

/**
 * Exports project metadata into catalog JSON file. If the output file already exists, its contents
 * will be merged with the catalog built from current state of the project metadata.
 *
 * @param projectMetadata - project metadata to export into JSON
 * @param outputFile - output file where the catalog should be saved
 */
export async function exportMetadataToCatalog(
    projectMetadata: WorkspaceMetadata,
    outputFile: string,
): Promise<void> {
    let existingCatalog: any | undefined;

    if (fs.existsSync(outputFile)) {
        existingCatalog = JSON.parse(fs.readFileSync(outputFile, { encoding: "utf-8" }));
        fs.renameSync(outputFile, `${outputFile}.bak`);
    }

    const catalog = transformToCatalog(projectMetadata, existingCatalog);

    fs.writeFileSync(outputFile, JSON.stringify(catalog, null, "  "));
}
