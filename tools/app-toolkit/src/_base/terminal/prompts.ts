// (C) 2007-2022 GoodData Corporation
import { DistinctQuestion, prompt } from "inquirer";
import { applicationNameValidator } from "../inputHandling/validators";
import { TargetAppLanguage, AppTemplate } from "../types";

export type WorkspaceChoices = {
    name: string;
    value: string;
};

export async function promptName(object: string = "application"): Promise<string> {
    const question: DistinctQuestion = {
        message: `Enter ${object} name:`,
        name: "name",
        type: "input",
        validate: applicationNameValidator,
    };

    const response = await prompt(question);
    return response.name;
}

export async function promptLanguage(): Promise<TargetAppLanguage> {
    const question: DistinctQuestion = {
        message: "Select programming language that you want to use in your application:",
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

export async function promptTemplate(): Promise<AppTemplate> {
    const question: DistinctQuestion = {
        message: "Select template that you want to use for your project:",
        name: "template",
        type: "list",
        choices: [
            {
                name: "React Application",
                value: "react-app",
            },
        ],
    };

    const response = await prompt(question);
    return response.template;
}
