// (C) 2007-2019 GoodData Corporation

import flatMap = require("lodash/flatMap");
import { PropsFactory } from "../../src";
import allScenarios from "../../scenarios";
import { mountChartAndCapture } from "../_infra/render";
import { defFingerprint, IExecutionDefinition } from "@gooddata/sdk-model";
import * as process from "process";
import * as fs from "fs";
import * as path from "path";
import isArray = require("lodash/isArray");

type AllScenariosType = [string, string, React.ComponentType<any>, PropsFactory<any>];

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

function storeScenarioMetadata(recordingDir: string, vis: string, scenario: string) {
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

    if (scenarios.find(s => s.vis === vis && s.scenario === scenario)) {
        // scenario is already mentioned in the metadata; bail out there is nothing to do
        return;
    }

    scenarios.push({ vis, scenario });
    fs.writeFileSync(scenariosFile, JSON.stringify(scenarios, null, 4), { encoding: "utf-8" });
}

/**
 * This will store execution definition for particular visualization scenario. The execution definition
 * will be stored in directory named after definition's fingerprint. The directory will contain 'definition.json'
 * file with the actual definition and 'scenarios.json' file that enumerates test scenarios where this definition
 * is used.
 *
 * @param vis - visualization for which the scenario is being stored
 * @param scenario - test scenario name
 * @param def - execution definition
 */
function storeScenarioDefinition(vis: string, scenario: string, def: IExecutionDefinition) {
    if (!StoreLocation) {
        return;
    }

    const recordingDir = storeDefinition(def);

    storeScenarioMetadata(recordingDir, vis, scenario);
}

describe("all scenarios", () => {
    const Scenarios: AllScenariosType[] = flatMap(allScenarios, (s): AllScenariosType[] => {
        const testInputs = s.asTestInput();

        return testInputs.map(t => {
            // spread won't work here
            return [s.vis, t[0], t[1], t[2]];
        });
    });

    it.each(Scenarios)("%s %s should lead to execution", (vis, scenario, Component, propsFactory) => {
        const interactions = mountChartAndCapture(Component, propsFactory);

        expect(interactions.triggeredExecution).toBeDefined();
        storeScenarioDefinition(vis, scenario, interactions.triggeredExecution!);
    });
});
