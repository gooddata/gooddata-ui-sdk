// (C) 2007-2025 GoodData Corporation

import pkg, { DistinctQuestion } from "inquirer";

const { prompt } = pkg;
import { getBackend } from "../backend.js";

export async function promptTigerToken(): Promise<string> {
    const tigerTokenQuestion: DistinctQuestion = {
        type: "input",
        name: "tigerToken",
        message: "Enter tiger token:",
    };
    const tigerTokenResponse = await prompt(tigerTokenQuestion);

    return tigerTokenResponse.tigerToken;
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
