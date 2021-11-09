// (C) 2021 GoodData Corporation
import { parse } from "dotenv";
import { ActionOptions, InputValidationError, TargetBackendType } from "../_base/types";
import { getBackend, getHostname, getWorkspace } from "../_base/inputHandling/extractors";
import { convertToPluginIdentifier, readJsonSync } from "../_base/utils";
import {
    asyncValidOrDie,
    createHostnameValidator,
    createPluginUrlValidator,
    createWorkspaceValidator,
    validOrDie,
} from "../_base/inputHandling/validators";
import { readFileSync } from "fs";
import fse from "fs-extra";
import { logInfo } from "../_base/terminal/loggers";
import { createBackend } from "../_base/backend";
import ora from "ora";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { BackendCredentials, validateCredentialsAreComplete } from "../_base/credentials";

export type AddCmdActionConfig = {
    pluginUrl: string;
    pluginIdentifier: string;
    pluginName: string;
    pluginDescription: string | undefined;
    backend: TargetBackendType;
    hostname: string;
    workspace: string;
    credentials: BackendCredentials;
    dryRun: boolean;
    backendInstance: IAnalyticalBackend;
};

function readDotEnv(): Record<string, string> {
    logInfo("Reading .env and .env.secrets files.");

    const env = fse.existsSync(".env") ? parse(readFileSync(".env"), {}) : {};
    const secrets = fse.existsSync(".env.secrets") ? parse(readFileSync(".env.secrets"), {}) : {};

    return {
        ...env,
        ...secrets,
    };
}

/**
 * Load environment variables. This will read .env and .env.secrets files in the current directory. If GDC_USERNAME, GDC_PASSWORD
 * and TIGER_API_TOKEN are set as normal env variables, then they will be used.
 */
function loadEnv(backend: TargetBackendType): Record<string, string> {
    const dotEnvContent: Record<string, string> = readDotEnv();
    const { GDC_USERNAME, GDC_PASSWORD, TIGER_API_TOKEN } = process.env;

    if (backend === "bear" && GDC_USERNAME) {
        logInfo(
            "GDC_USERNAME env variable set for current session; going to use this for authentication and expecting GDC_PASSWORD is set for current session as well.",
        );

        dotEnvContent.GDC_USERNAME = GDC_USERNAME;
        dotEnvContent.GDC_PASSWORD = GDC_PASSWORD ?? "";
    }

    if (backend === "tiger" && TIGER_API_TOKEN) {
        dotEnvContent.TIGER_API_TOKEN = TIGER_API_TOKEN;
    }

    return dotEnvContent;
}

function discoverBackendType(packageJson: Record<string, any>): TargetBackendType {
    const { peerDependencies = {} } = packageJson;

    if (peerDependencies["@gooddata/sdk-backend-bear"] !== undefined) {
        logInfo("Plugin project depends on @gooddata/sdk-backend-bear. Assuming backend type 'bear'.");

        return "bear";
    } else if (peerDependencies["@gooddata/sdk-backend-tiger"] !== undefined) {
        logInfo("Plugin project depends on @gooddata/sdk-backend-tiger. Assuming backend type 'tiger'.");

        return "tiger";
    }

    throw new InputValidationError(
        "backend",
        "?",
        "Unable to discover target backend type. Please specify --backend option on the command line.",
    );
}

/**
 * Perform asynchronous validations:
 *
 * -  backend & authentication against it
 * -  workspace exists
 * -  plugin is valid and entry point exists at the provided location
 * @param config
 */
async function doAsyncValidations(config: AddCmdActionConfig) {
    const { backendInstance, workspace, pluginUrl, pluginIdentifier } = config;

    const asyncValidationProgress = ora({
        text: "Performing server-side validations.",
    });
    try {
        asyncValidationProgress.start();

        await backendInstance.authenticate(true);
        await asyncValidOrDie("workspace", workspace, createWorkspaceValidator(backendInstance));
        await asyncValidOrDie("pluginUrl", pluginUrl, createPluginUrlValidator(pluginIdentifier));
    } finally {
        asyncValidationProgress.stop();
    }
}

export async function getAddCmdActionConfig(
    pluginUrl: string,
    options: ActionOptions,
): Promise<AddCmdActionConfig> {
    const packageJson = readJsonSync("package.json");

    const pluginIdentifier = convertToPluginIdentifier(packageJson.name);
    const backendFromOptions = getBackend(options);
    const backend = backendFromOptions ?? discoverBackendType(packageJson);

    const env = loadEnv(backend);
    const hostnameFromOptions = getHostname(backendFromOptions, options);
    const workspaceFromOptions = getWorkspace(options);

    const hostname = hostnameFromOptions ?? env.BACKEND_URL;
    const workspace = workspaceFromOptions ?? env.WORKSPACE;
    const credentials: BackendCredentials = {
        username: env.GDC_USERNAME,
        password: env.GDC_PASSWORD,
        token: env.TIGER_API_TOKEN,
    };
    const backendInstance = createBackend({
        hostname,
        backend,
        credentials,
    });

    const config: AddCmdActionConfig = {
        pluginUrl,
        pluginIdentifier,
        pluginName: packageJson.name,
        pluginDescription: packageJson.description,
        backend,
        hostname,
        workspace,
        credentials,
        dryRun: options.commandOpts.dryRun ?? false,
        backendInstance,
    };

    validOrDie("hostname", hostname, createHostnameValidator(backend));
    validateCredentialsAreComplete(backend, credentials);
    await doAsyncValidations(config);

    return config;
}
