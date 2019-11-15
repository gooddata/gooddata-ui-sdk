// (C) 2007-2019 GoodData Corporation

import flatMap = require("lodash/flatMap");
import isArray = require("lodash/isArray");
import { defFingerprint, IExecutionDefinition } from "@gooddata/sdk-model";
import * as fs from "fs";
import * as path from "path";
import * as process from "process";
import allScenarios from "../../scenarios";
import { ScenarioTestInput } from "../../src";
import { mountChartAndCapture } from "../_infra/render";

type AllScenariosType = [string, string, ScenarioTestInput<any>];
type AnyComponentTest = ScenarioTestInput<any>;

const StoreEnvVar = "GDC_STORE_DEFS";
const StoreLocation = initializeStore(process.env[StoreEnvVar]);
const DefinitionFileName = "definition.json";
const ScenariosFileName = "scenarios.json";

function initializeStore(dir: string | undefined): string | undefined {
    if (!dir) {
        // no store dir => no problem, definitions will not be stored
        return;
    }

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });

        return dir;
    }

    if (!fs.statSync(dir).isDirectory()) {
        // tslint:disable-next-line:no-console
        console.error(
            `Path ${dir} already exists but is not a directory. Not going to store any definitions.`,
        );

        return;
    }

    return dir;
}

function storeDefinition(def: IExecutionDefinition): string {
    const fp = defFingerprint(def);
    const recordingDir = path.join(StoreLocation!, fp);

    if (!fs.existsSync(recordingDir)) {
        fs.mkdirSync(recordingDir);
    }

    fs.writeFileSync(path.join(recordingDir, DefinitionFileName), JSON.stringify(def, null, 4));

    return recordingDir;
}

function storeScenarioMetadata(recordingDir: string, vis: string, scenarioName: string) {
    const scenariosFile = path.join(recordingDir, ScenariosFileName);

    let scenarios = [];

    if (fs.existsSync(scenariosFile)) {
        try {
            scenarios = JSON.parse(fs.readFileSync(scenariosFile, { encoding: "utf-8" }));
        } catch (err) {
            // tslint:disable-next-line:no-console
            console.warn("Unable to read or parse exec definition scenario file in ", scenariosFile);
            scenarios = [];
        }

        if (!isArray(scenarios)) {
            scenarios = [];
        }
    }

    if (scenarios.find(s => s.vis === vis && s.scenario === scenarioName)) {
        // scenario is already mentioned in the metadata; bail out there is nothing to do
        return;
    }

    scenarios.push({ vis, scenario: scenarioName });
    fs.writeFileSync(scenariosFile, JSON.stringify(scenarios, null, 4), { encoding: "utf-8" });
}

/**
 * This will store execution definition for particular visualization scenario. The execution definition
 * will be stored in directory named after definition's fingerprint. The directory will contain 'definition.json'
 * file with the actual definition and 'scenarios.json' file that enumerates test scenarios where this definition
 * is used.
 *
 * @param vis - visualization for which the scenario is being stored
 * @param scenario - detail about test scenario
 * @param def - execution definition
 */
function storeScenarioDefinition(vis: string, scenario: ScenarioTestInput<any>, def: IExecutionDefinition) {
    if (!StoreLocation) {
        return;
    }

    const recordingDir = storeDefinition(def);

    if (!scenario[3].includes("mock-no-scenario-meta")) {
        storeScenarioMetadata(recordingDir, vis, scenario[0]);
    }
}

describe("all scenarios", () => {
    const Scenarios: AllScenariosType[] = flatMap(allScenarios, (s): AllScenariosType[] => {
        const testInputs: AnyComponentTest[] = s.asTestInput();

        return testInputs.map(t => {
            return [s.vis, t[0], t];
        });
    });

    it.each(Scenarios)("%s %s should lead to execution", (vis, _scenarioName, scenario) => {
        const interactions = mountChartAndCapture(scenario[1], scenario[2]);

        expect(interactions.triggeredExecution).toBeDefined();
        storeScenarioDefinition(vis, scenario, interactions.triggeredExecution!);
    });
});
