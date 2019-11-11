// (C) 2007-2019 GoodData Corporation
import { DistinctQuestion, prompt } from "inquirer";
import gooddata from "@gooddata/gd-bear-client";

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
