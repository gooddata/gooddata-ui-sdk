// (C) 2007-2025 GoodData Corporation

import fs from "fs";
import path from "path";
import process from "process";

import { type IScenario, type WorkspaceType } from "../../src/index.js";

export type SupportedDefinitionTypes = "executions" | "insights";

type DefinitionStores = {
    [E in SupportedDefinitionTypes]: {
        [E in WorkspaceType]: string;
    };
};

const StoreEnvVar = "GDC_STORE_DEFS";
const Stores: DefinitionStores | undefined = initializeStores();

function initializeStores(): DefinitionStores | undefined {
    const rootDir = process.env[StoreEnvVar];

    if (!rootDir) {
        const isTestRun = process.env["NODE_ENV"] === "test" || process.env["VITEST"] !== undefined;

        if (!isTestRun) {
            console.warn(
                `The smoke-and-capture suite is not configured with store root. The suite will run but will not store any recording definitions.`,
            );
        }

        return;
    }

    return {
        executions: {
            "reference-workspace": initializeStore(rootDir, "reference-workspace", "executions"),
        },
        insights: {
            "reference-workspace": initializeStore(rootDir, "reference-workspace", "insights"),
        },
    };
}

function initializeStore(
    rootDir: string,
    workspaceType: WorkspaceType,
    defType: SupportedDefinitionTypes,
): string {
    /*
     * construct full path to a store. the src/recordings/uiTestScenarios is standard path in the
     * different workspace projects
     */
    const dir = path.join(rootDir, workspaceType, "src", "recordings", "uiTestScenarios", defType);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });

        return dir;
    }

    if (!fs.statSync(dir).isDirectory()) {
        console.error(
            `Path ${dir} already exists but is not a directory. Not going to store any definitions.`,
        );

        throw new Error();
    }

    return dir;
}

/**
 * Locates target directory where the recording definition for the provided scenario should be stored. Returns
 * `undefined` if not possible to determine - for instance of the stores root location is not provided via the
 * env variable
 */
export function storeDirectoryFor(
    scenario: IScenario<any>,
    defType: SupportedDefinitionTypes,
): string | undefined {
    return Stores?.[defType][scenario.workspaceType];
}

/*
 * Initialize on import
 */
initializeStores();
