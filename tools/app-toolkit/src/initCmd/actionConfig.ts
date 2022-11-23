// (C) 2021-2022 GoodData Corporation
import { ActionOptions, AppTemplate, SupportedPackageManager, TargetAppLanguage } from "../_base/types";
import {
    applicationNameValidator,
    languageValidator,
    packageManagerValidator,
    templateValidator,
    validOrDie,
} from "../_base/inputHandling/validators";
import { promptLanguage, promptName, promptTemplate } from "../_base/terminal/prompts";

function getLanguageFromOptions(options: ActionOptions): TargetAppLanguage | undefined {
    const { language } = options.commandOpts;

    if (!language) {
        return undefined;
    }

    validOrDie("language", language, languageValidator);

    return language as TargetAppLanguage;
}

function getPackageManagerFromOptions(options: ActionOptions): SupportedPackageManager {
    const { packageManager } = options.commandOpts;

    if (!packageManager) {
        return "npm";
    }

    validOrDie("packageManager", packageManager, packageManagerValidator);

    return packageManager as SupportedPackageManager;
}

function getTemplateFromOptions(options: ActionOptions): AppTemplate | undefined {
    const { template } = options.commandOpts;

    if (!template) {
        return undefined;
    }

    validOrDie("template", template, templateValidator);

    return template as AppTemplate;
}

//
//
//

export type InitCmdActionConfig = {
    name: string;
    language: TargetAppLanguage;
    packageManager: SupportedPackageManager;
    targetDir: string | undefined;
    skipInstall: boolean;
    template: AppTemplate;
};

/**
 * This function will obtain configuration for the application init command. It will do so from the argument
 * and option values passed via CLI and in case vital input is missing by using interactive prompts.
 *
 * The function will first verify all the available options and only then start prompting the user - this
 * is intentional as the CLI should fail fast and not at some arbitrary point after user prompting.
 *
 * @param applicationName - application name (if any) as passed by the user, undefined means no application name on CLI
 * @param options - program & command level options provided by the user via CLI
 */
export async function getInitCmdActionConfig(
    applicationName: string | undefined,
    options: ActionOptions,
): Promise<InitCmdActionConfig> {
    if (applicationName) {
        validOrDie("app-name", applicationName, applicationNameValidator);
    }

    const languageFromOptions = getLanguageFromOptions(options);
    const packageManagerFromOptions = getPackageManagerFromOptions(options);
    const templateFromOptions = getTemplateFromOptions(options);

    const name = applicationName ?? (await promptName());
    const template = templateFromOptions ?? (await promptTemplate());
    const language = languageFromOptions ?? (await promptLanguage());

    return {
        name,
        language,
        packageManager: packageManagerFromOptions,
        targetDir: options.commandOpts.targetDir,
        skipInstall: options.commandOpts.skipInstall ?? false,
        template,
    };
}
