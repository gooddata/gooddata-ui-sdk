// (C) 2007-2020 GoodData Corporation
import { DistinctQuestion, prompt } from "inquirer";
import getBackend from "../backend.js";

export async function promptUsername(): Promise<string> {
    const usernameQuestion: DistinctQuestion = {
        type: "input",
        name: "username",
        message: "Enter your username:",
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
    const projects = await getBackend().workspaces().forCurrentUser().query();

    const projectChoices = [];

    for (const item of projects.items) {
        const descriptor = await item.getDescriptor();
        projectChoices.push({
            name: descriptor.title,
            value: descriptor.id,
        });
    }

    const projectQuestion: DistinctQuestion = {
        type: "list",
        name: "projectId",
        message: "Choose a project:",
        choices: projectChoices,
    };

    const projectResponse = await prompt(projectQuestion);
    return projectResponse.projectId;
}
