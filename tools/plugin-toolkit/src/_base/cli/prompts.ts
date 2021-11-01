// (C) 2007-2021 GoodData Corporation
import { DistinctQuestion, prompt } from "inquirer";

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

export async function promptWorkspaceId(
    choices: WorkspaceChoices[],
    wording: string = "project",
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
