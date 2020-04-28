// (C) 2007-2020 GoodData Corporation
import { loadProjectMetadata } from "../loaders/loadProjectMetadata";
import { transformToTypescript } from "../transform/toTypescript";
import { format } from "prettier";
import * as fs from "fs";

/**
 * Exports project metadata into javascript file containing sdk-model entity definitions (attribute, measure, etc)
 *
 * This is done by generating typescript code & then running it through babel plugin which strips away the
 * type annotations.
 *
 * @param projectId - id of project to export from
 * @param outputFile - output typescript file - WILL be overwritten
 */
export async function exportMetadataToJavascript(projectId: string, outputFile: string): Promise<void> {
    const projectMetadata = await loadProjectMetadata(projectId);
    const output = transformToTypescript(projectMetadata, outputFile);

    const generatedTypescript = output.sourceFile.getFullText();
    const formattedTypescript = format(generatedTypescript, { parser: "typescript", printWidth: 120 });

    const javascript = require("@babel/core").transform(formattedTypescript, {
        plugins: ["@babel/plugin-transform-typescript"],
    });

    fs.writeFileSync(outputFile, javascript.code, { encoding: "utf-8" });
}
