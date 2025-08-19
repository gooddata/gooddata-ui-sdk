// (C) 2007-2025 GoodData Corporation

import fs from "fs";
import path from "path";

import pkg, { DistinctQuestion } from "inquirer";
const { prompt } = pkg;

import { DEFAULT_OUTPUT_FILE_NAME } from "../base/constants.js";

export type WorkspaceChoices = {
    name: string;
    value: string;
};

export async function promptWorkspaceId(
    choices: WorkspaceChoices[],
    wording: string = "workspace",
): Promise<string> {
    const question: DistinctQuestion = {
        type: "list",
        name: "id",
        message: `Choose a ${wording}:`,
        choices,
    };

    const response = await prompt(question);
    return response.id;
}

export async function confirmFileRewrite(fileName: string): Promise<boolean> {
    const shouldRewriteQuestion: DistinctQuestion = {
        type: "confirm",
        name: "shouldRewrite",
        message: `The file ${fileName} already exists. Would you like to overwrite it?`,
        default: true,
    };

    const shouldRewriteExisting = await prompt(shouldRewriteQuestion);

    return shouldRewriteExisting.shouldRewrite;
}

export async function promptFileName(defaultFileName = DEFAULT_OUTPUT_FILE_NAME): Promise<string> {
    const filenameQuestion: DistinctQuestion = {
        type: "input",
        name: "filename",
        message: "Enter filename:",
        default: defaultFileName,
    };
    const response = await prompt(filenameQuestion);

    return response.filename;
}

export async function requestFilePath(): Promise<string> {
    const fileName = await promptFileName();
    const filePath = path.resolve(fileName);

    if (fs.existsSync(filePath)) {
        const shouldRewriteFile = await confirmFileRewrite(fileName);

        if (shouldRewriteFile) {
            return filePath;
        }

        return requestFilePath();
    }

    return filePath;
}

export async function promptHostname(): Promise<string> {
    const hostnameQuestion: DistinctQuestion = {
        type: "input",
        name: "hostname",
        message: "Enter hostname:",
    };
    const response = await prompt(hostnameQuestion);

    return response.hostname;
}
