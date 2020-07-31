// (C) 2007-2020 GoodData Corporation
import { transformToTypescript } from "../transform/toTypescript";
import { format } from "prettier";
import * as fs from "fs";
import { ProjectMetadata } from "../base/types";

/**
 * Exports project metadata into javascript file containing sdk-model entity definitions (attribute, measure, etc)
 *
 * This is done by generating typescript code & then running it through babel plugin which strips away the
 * type annotations.
 *
 * @param projectMetadata - project metadata to export into javascript
 * @param outputFile - output typescript file - WILL be overwritten
 */
export async function exportMetadataToJavascript(
    projectMetadata: ProjectMetadata,
    outputFile: string,
    tiger = false,
): Promise<void> {
    const output = transformToTypescript(projectMetadata, outputFile, tiger);

    const generatedTypescript = output.sourceFile.getFullText();
    const formattedTypescript = format(generatedTypescript, { parser: "typescript", printWidth: 120 });

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const javascript = require("@babel/core").transform(formattedTypescript, {
        plugins: ["@babel/plugin-transform-typescript"],
    });

    fs.writeFileSync(outputFile, javascript.code, { encoding: "utf-8" });
}
