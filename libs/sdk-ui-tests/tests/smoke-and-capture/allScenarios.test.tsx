// (C) 2007-2019 GoodData Corporation

import flatMap = require("lodash/flatMap");
import unionBy = require("lodash/unionBy");
import isArray = require("lodash/isArray");
import isObject = require("lodash/isObject");
import { defFingerprint } from "@gooddata/sdk-model";
import * as fs from "fs";
import * as path from "path";
import * as process from "process";
import allScenarios from "../../scenarios";
import { ScenarioTestInput, ScenarioTestMembers } from "../../src";
import { ChartInteractions, DataViewRequests } from "../_infra/backendWithCapturing";
import { createInsightDefinitionForChart } from "../_infra/insightFactory";
import { mountChartAndCapture } from "../_infra/render";
import { mountInsight } from "../_infra/renderPlugVis";

type AllScenariosType = [string, string, ScenarioTestInput<any>];
type AnyComponentTest = ScenarioTestInput<any>;

const StoreEnvVar = "GDC_STORE_DEFS";
const StoreLocation = initializeStore(process.env[StoreEnvVar]);
const DefinitionFileName = "definition.json";
const RequestsFileName = "requests.json";
const ScenariosFileName = "scenarios.json";

function toJsonString(obj: any): string {
    return JSON.stringify(obj, null, 4);
}

function writeAsJsonSync(file: string, obj: any) {
    return fs.writeFileSync(file, toJsonString(obj), { encoding: "utf-8" });
}

function readJsonSync(file: string): any {
    return JSON.parse(fs.readFileSync(file, { encoding: "utf-8" }));
}

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

function storeRequests(interactions: ChartInteractions, recordingDir: string): void {
    const requestsFile = path.join(recordingDir, RequestsFileName);
    const { dataViewRequests } = interactions;

    let requests: DataViewRequests = {
        allData: false,
        windows: [],
    };

    if (fs.existsSync(requestsFile)) {
        try {
            const existingRequests = readJsonSync(requestsFile);

            if (!isObject(existingRequests)) {
                // tslint:disable-next-line:no-console
                console.warn(
                    `The requests file ${requestsFile} seems invalid. It should contain object describing what data view requests should be captured for the recording.`,
                );
            } else {
                requests = existingRequests as DataViewRequests;
            }
        } catch (err) {
            // tslint:disable-next-line:no-console
            console.warn("Unable to read or parse exec requests file in ", requestsFile);
        }
    }

    if (dataViewRequests.allData) {
        requests.allData = true;
    }

    if (dataViewRequests.windows) {
        requests.windows = unionBy(dataViewRequests.windows, requests.windows, val => {
            return `${val.offset.join(",")}-${val.size.join(",")}`;
        });
    }

    writeAsJsonSync(requestsFile, requests);
}

function storeDefinition(interactions: ChartInteractions): string {
    const { triggeredExecution } = interactions;
    const fp = defFingerprint(triggeredExecution!);
    const recordingDir = path.join(StoreLocation!, fp);

    if (!fs.existsSync(recordingDir)) {
        fs.mkdirSync(recordingDir);
    }

    writeAsJsonSync(path.join(recordingDir, DefinitionFileName), triggeredExecution);

    storeRequests(interactions, recordingDir);

    return recordingDir;
}

function storeScenarioMetadata(recordingDir: string, vis: string, scenarioName: string) {
    const scenariosFile = path.join(recordingDir, ScenariosFileName);

    let scenarios = [];

    if (fs.existsSync(scenariosFile)) {
        try {
            const existingScenarios = readJsonSync(scenariosFile);

            if (!isArray(existingScenarios)) {
                // tslint:disable-next-line:no-console
                console.warn(
                    `The scenarios file ${scenariosFile} seems invalid. It should contain array of scenario metadata.`,
                );
            } else {
                scenarios = existingScenarios;
            }
        } catch (err) {
            // tslint:disable-next-line:no-console
            console.warn("Unable to read or parse exec definition scenario file in ", scenariosFile);
        }
    }

    if (scenarios.find(s => s.vis === vis && s.scenario === scenarioName)) {
        // scenario is already mentioned in the metadata; bail out there is nothing to do
        return;
    }

    scenarios.push({ vis, scenario: scenarioName });

    writeAsJsonSync(scenariosFile, scenarios);
}

/**
 * This will store execution definition for particular visualization scenario. The execution definition
 * will be stored in directory named after definition's fingerprint. The directory will contain 'definition.json'
 * file with the actual definition and 'scenarios.json' file that enumerates test scenarios where this definition
 * is used.
 *
 * @param vis - visualization for which the scenario is being stored
 * @param scenario - detail about test scenario
 * @param interactions - chart interactions with the backend
 * @param plugVizInteractions - plug viz interactions with the backend
 */
function storeScenarioDefinition(
    vis: string,
    scenario: ScenarioTestInput<any>,
    interactions: ChartInteractions,
    plugVizInteractions?: ChartInteractions,
) {
    if (!StoreLocation) {
        return;
    }

    const { triggeredExecution: componentExecution } = interactions;
    const { triggeredExecution: plugVizExecution } = plugVizInteractions ?? {};
    const recordingDir = storeDefinition(interactions);

    if (plugVizExecution && defFingerprint(componentExecution!) !== defFingerprint(plugVizExecution!)) {
        /*
         * As-is, we react components and plug viz for the same bucket MAY to different executions
         * due to plug viz automagically adding sorts (desired UX). different sorts in exec means different
         * fingerprint. if that happens, make sure the exec definition for the plug viz variant of the
         * scenario is also stored.
         */
        storeDefinition(plugVizInteractions!);
    }

    if (!scenario[ScenarioTestMembers.Tags].includes("mock-no-scenario-meta")) {
        storeScenarioMetadata(recordingDir, vis, scenario[ScenarioTestMembers.ScenarioName]);
    }
}

describe("all scenarios", () => {
    const Scenarios: AllScenariosType[] = flatMap(allScenarios, (s): AllScenariosType[] => {
        const testInputs: AnyComponentTest[] = s.asTestInput();

        return testInputs.map(t => {
            return [s.vis, t[0], t];
        });
    });

    it.each(Scenarios)("%s %s should lead to execution", async (vis, scenarioName, scenario) => {
        const interactions = await mountChartAndCapture(
            scenario[ScenarioTestMembers.Component],
            scenario[ScenarioTestMembers.PropsFactory],
        );

        expect(interactions.triggeredExecution).toBeDefined();

        if (
            interactions.dataViewRequests.windows === undefined &&
            interactions.dataViewRequests.allData === undefined
        ) {
            fail(
                `Mounting ${vis} for scenario ${scenarioName} did not lead to request of data from server. The smoke-and-capture suite now does not know what to store in the recording definition as it is unclear if the scenario needs all data or some particular window of data.`,
            );
            return;
        }

        const insight = createInsightDefinitionForChart(vis, scenarioName, interactions);

        if (vis !== "PivotTable") {
            /*
             * TODO: remove this restriction after mock-rendering plug pivot table works
             */
            const plugVizInteractions = await mountInsight(insight);

            storeScenarioDefinition(vis, scenario, interactions, plugVizInteractions);
        } else {
            storeScenarioDefinition(vis, scenario, interactions);
        }
    });
});
