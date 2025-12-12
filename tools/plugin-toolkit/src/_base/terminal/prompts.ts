// (C) 2007-2025 GoodData Corporation
import pkg, { type DistinctQuestion } from "inquirer";
const { prompt } = pkg;

import { sanitizeHostname } from "../inputHandling/sanitizers.js";
import { createHostnameValidator, pluginNameValidator } from "../inputHandling/validators.js";
import { type TargetAppLanguage } from "../types.js";

export async function promptApiToken(): Promise<string> {
    const tokenQuestion: DistinctQuestion = {
        type: "input",
        name: "token",
        message: "Enter your API token:",
    };
    const tokenResponse = await prompt(tokenQuestion);

    return tokenResponse.token;
}

export type WorkspaceChoices = {
    name: string;
    value: string;
};

export async function promptWorkspaceId(choices: WorkspaceChoices[]): Promise<string> {
    const question: DistinctQuestion = {
        type: "list",
        name: "id",
        message: `Choose a workspace:`,
        choices,
    };

    const response = await prompt(question);
    return response.id;
}

export async function promptWorkspaceIdWithoutChoice(): Promise<string> {
    const question: DistinctQuestion = {
        type: "input",
        name: "id",
        message: `Enter identifier of a workspace to use during plugin development:`,
    };

    const response = await prompt(question);
    return response.id;
}

export async function promptDashboardIdWithoutChoice(wording: string): Promise<string> {
    const question: DistinctQuestion = {
        type: "input",
        name: "id",
        message: wording,
    };

    const response = await prompt(question);
    return response.id;
}

export async function promptName(object: string = "dashboard plugin"): Promise<string> {
    const question: DistinctQuestion = {
        message: `Enter ${object} name:`,
        name: "name",
        type: "input",
        validate: pluginNameValidator,
    };

    const response = await prompt(question);
    return response.name;
}

export async function promptHostname(): Promise<string> {
    const displayName = "GoodData Cloud or Gooddata.CN";
    const question: DistinctQuestion = {
        message: `Enter ${displayName} hostname:`,
        name: "hostname",
        type: "input",
        validate: createHostnameValidator(),
    };

    const response = await prompt(question);

    return sanitizeHostname(response.hostname);
}

export async function promptLanguage(): Promise<TargetAppLanguage> {
    const question: DistinctQuestion = {
        message: "Select programming language that you want to use in your plugin:",
        name: "language",
        type: "list",
        choices: [
            {
                name: "TypeScript",
                value: "ts",
            },
            {
                name: "JavaScript",
                value: "js",
            },
        ],
    };

    const response = await prompt(question);
    return response.language;
}

export async function promptPluginParameters(originalParameters?: string): Promise<string> {
    const question: DistinctQuestion = {
        message:
            "A text editor specified will now open and let you enter parameters for the plugin." +
            "This is how you can configure how your plugin behaves on the workspace. Save and exit editor when done.",
        name: "parameters",
        type: "editor",
        default: originalParameters,
    };

    const response = await prompt(question);
    return response.parameters;
}
