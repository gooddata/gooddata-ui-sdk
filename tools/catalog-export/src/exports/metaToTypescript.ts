// (C) 2007-2020 GoodData Corporation
import { transformToTypescript } from "../transform/toTypescript";
import { format } from "prettier";
import * as fs from "fs";
import { ProjectMetadata } from "../base/types";

/**
 * Exports project metadata into typescript file containing sdk-model entity definitions (attribute, measure, etc)
 *
 * @param projectMetadata - project metadata to export into typescript
 * @param outputFile - output typescript file - WILL be overwritten
 * @param tiger - indicates whether running against tiger, this influences naming strategy to use for date datasets as they are different from bear
 */
export async function exportMetadataToTypescript(
    projectMetadata: ProjectMetadata,
    outputFile: string,
    tiger: boolean = false,
): Promise<void> {
    const output = transformToTypescript(projectMetadata, outputFile, tiger);

    const generatedTypescript = output.sourceFile.getFullText();
    const formattedTypescript = format(generatedTypescript, { parser: "typescript", printWidth: 120 });

    fs.writeFileSync(outputFile, formattedTypescript, { encoding: "utf-8" });
}
