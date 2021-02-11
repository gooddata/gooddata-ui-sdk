// (C) 2007-2021 GoodData Corporation
import { DistinctQuestion, prompt } from "inquirer";
import gooddata from "@gooddata/api-client-bear";
import { DEFAULT_OUTPUT_FILE_NAME } from "../base/constants";
import * as path from "path";
import * as fs from "fs";

export async function promptUsername(wording: string = "username"): Promise<string> {
    const usernameQuestion: DistinctQuestion = {
        type: "input",
        name: "username",
        message: `Enter your ${wording}:`,
    };
    const usernameResponse = await prompt(usernameQuestion);

    return usernameResponse.username;
}

export async function promptPassword(): Promise<string> {
    const passwordQuestion: DistinctQuestion = {
        type: "password",
        name: "password",
        message: "Enter your password:",
    };
    const passwordResponse = await prompt(passwordQuestion);

    return passwordResponse.password;
}

export async function promptProjectId(): Promise<string> {
    const metadataResponse = await gooddata.xhr.get("/gdc/md");
    const metadata = metadataResponse.getData();
    const projectChoices = metadata.about.links.map((link: any) => {
        return {
            name: link.title,
            value: link.identifier,
        };
    });

    const projectQuestion: DistinctQuestion = {
        type: "list",
        name: "projectId",
        message: "Choose a project:",
        choices: projectChoices,
    };

    const projectResponse = await prompt(projectQuestion);
    return projectResponse.projectId;
}

export async function confirmFileRewrite(fileName: string): Promise<boolean> {
    const shouldRewriteQuestion: DistinctQuestion = {
        type: "confirm",
        name: "shouldRewrite",
        message: `The file ${fileName} already exists. Would you like to merge the new data with the file? (It will keep your possibly renamed "keys")`,
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
