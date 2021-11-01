// (C) 2007-2021 GoodData Corporation
import { DistinctQuestion, prompt } from "inquirer";
import { TargetAppFlavor, TargetBackendType } from "../types";

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

export async function promptName(object: string = "dashboard plugin"): Promise<string> {
    const question: DistinctQuestion = {
        message: `What is your ${object} name?`,
        name: "name",
        type: "input",
    };

    const response = await prompt(question);
    return response.name;
}

export async function promptHostname(isBear: boolean): Promise<string> {
    if (isBear) {
        const question: DistinctQuestion = {
            message: "What is your hostname?",
            name: "hostname",
            type: "list",
            choices: [
                {
                    value: "https://secure.gooddata.com",
                },
                {
                    value: "https://developer.na.gooddata.com",
                },
                {
                    value: "https://salesengineering.na.gooddata.com",
                },
                {
                    name: "I have a custom hostname",
                    value: "WHITE_LABELLED",
                },
            ],
        };

        const response = await prompt(question);

        if (response.hostname !== "WHITE_LABELLED") {
            return response.hostname;
        }
    }

    const question: DistinctQuestion = {
        message: "Insert your hostname. Protocol defaults to https if none is provided.",
        name: "hostname",
        type: "input",
        validate: (input) => {
            return input.indexOf("http://") > -1 && isBear
                ? "Provide hostname with a secure https protocol or no protocol at all."
                : true;
        },
    };

    const response = await prompt(question);
    return response.hostname;
}

export async function promptBackend(): Promise<TargetBackendType> {
    const question: DistinctQuestion = {
        message: "What is your application desired platform (backend)?",
        name: "backend",
        type: "list",
        choices: [
            {
                name: "SaaS (codename 'Bear')",
                value: "bear",
            },
            {
                name: "Gooddata.CN (codename 'Tiger')",
                value: "tiger",
            },
        ],
    };

    const response = await prompt(question);
    return response.backend;
}

export async function promptFlavor(): Promise<TargetAppFlavor> {
    const question: DistinctQuestion = {
        message: "What is your application desired flavor?",
        name: "flavor",
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
    return response.flavor;
}
