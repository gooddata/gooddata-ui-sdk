// (C) 2007-2026 GoodData Corporation

import * as fs from "fs";
import * as path from "path";

import { unionBy } from "lodash-es";
import { describe, expect, it } from "vitest";

import { type DataViewRequests, RecordingFiles, type ScenarioDescriptor } from "@gooddata/mock-handling";
import { type IInsight, type IInsightDefinition, defFingerprint, insightTitle } from "@gooddata/sdk-model";

import { storeDirectoryFor } from "./store.js";
import { readJsonSync, writeAsJsonSync } from "./utils.js";
import { type IScenario, allScenarios } from "../../src/index.js";
import { type ChartInteractions } from "../_infra/backendWithCapturing.js";
import { createInsightDefinitionForChart } from "../_infra/insightFactory.js";
import { mountChartAndCaptureNormalized } from "../_infra/render.js";
import { mountInsight } from "../_infra/renderPlugVis.js";

type AllScenariosType = [string, IScenario<any>];

function fail(message: string) {
    expect(0).eq(1, message);
}

async function scenarioSaveDataCaptureRequests(
    scenario: IScenario<any>,
    recordingDir: string,
    interactions: ChartInteractions,
): Promise<void> {
    const requestsFile = path.join(recordingDir, RecordingFiles.Execution.Requests);
    const { dataViewRequests } = interactions;
    const { customDataCapture } = scenario;

    let requests: DataViewRequests = {
        allData: false,
        windows: [],
    };

    if (fs.existsSync(requestsFile)) {
        try {
            const existingRequests = readJsonSync(requestsFile);

            if (existingRequests === null || typeof existingRequests !== "object") {
                console.warn(
                    `The requests file ${requestsFile} seems invalid. It should contain object describing what data view requests should be captured for the recording.`,
                );
            } else {
                requests = existingRequests as DataViewRequests;
            }
        } catch {
            console.warn("Unable to read or parse exec requests file in ", requestsFile);
        }
    }

    if (dataViewRequests.allData || customDataCapture.allData) {
        requests.allData = true;
    }

    if (dataViewRequests.windows) {
        requests.windows = unionBy(
            dataViewRequests.windows,
            requests.windows,
            customDataCapture.windows,
            (val) => {
                return `${val.offset.join(",")}-${val.size.join(",")}`;
            },
        );
    }

    await writeAsJsonSync(requestsFile, requests);
}

async function scenarioSaveDefinition(
    scenario: IScenario<any>,
    dir: string,
    execution: ChartInteractions["triggeredExecution"],
    interactions: ChartInteractions,
): Promise<string> {
    if (!execution) {
        throw new Error(`Missing execution while storing scenario ${scenario.vis} / ${scenario.name}.`);
    }

    let executionToStore = execution;
    const fp = defFingerprint(executionToStore);
    const recordingDir = path.join(dir, fp);

    if (!fs.existsSync(recordingDir)) {
        fs.mkdirSync(recordingDir);
    }

    if (executionToStore.postProcessing) {
        executionToStore = {
            ...executionToStore,
            postProcessing: undefined,
        };
    }

    await writeAsJsonSync(path.join(recordingDir, RecordingFiles.Execution.Definition), {
        ...executionToStore,
    });

    await scenarioSaveDataCaptureRequests(scenario, recordingDir, interactions);

    return recordingDir;
}

async function scenarioSaveDescriptors(
    scenario: IScenario<any>,
    recordingDir: string,
    interactions: ChartInteractions,
) {
    const scenariosFile = path.join(recordingDir, RecordingFiles.Execution.Scenarios);

    let scenarioDescriptors: ScenarioDescriptor[] = [];

    if (fs.existsSync(scenariosFile)) {
        try {
            const existingScenarios = readJsonSync(scenariosFile);

            if (Array.isArray(existingScenarios)) {
                scenarioDescriptors = existingScenarios;
            } else {
                console.warn(
                    `The scenarios file ${scenariosFile} seems invalid. It should contain array of scenario metadata.`,
                );
            }
        } catch {
            console.warn("Unable to read or parse exec definition scenario file in ", scenariosFile);
        }
    }

    const { vis, name: scenarioName } = scenario;

    if (scenarioDescriptors.find((s) => s.vis === vis && s.scenario === scenarioName)) {
        // scenario is already mentioned in the metadata; bail out there is nothing to do
        return;
    }

    const { normalizationState } = interactions;

    if (normalizationState) {
        /*
         * If execution normalization took place, the scenario definition must contain the original execution definition
         * and mapping between normalized localIds and original localIds. The normalized execution does not
         * have to be stored together with scenario: it's already stored as part of execution definition.
         *
         * This must be done so that directly accessing recordedDataView can perform denormalization as well.
         *
         * The recordedDataView() is an important piece of the test support and must work predictably and without
         * caveats.
         */
        scenarioDescriptors.push({
            vis,
            scenario: scenarioName,
            originalExecution: normalizationState.original,
            n2oMap: normalizationState.n2oMap,
        });
    } else {
        const definition = interactions.triggeredExecution;

        scenarioDescriptors.push({ vis, scenario: scenarioName, buckets: definition!.buckets });
    }

    await writeAsJsonSync(scenariosFile, scenarioDescriptors);
}

/**
 * This will store execution definition for particular visualization scenario. The execution definition
 * will be stored in directory named after definition's fingerprint. The directory will contain 'definition.json'
 * file with the actual definition and 'scenarios.json' file that enumerates test scenarios where this definition
 * is used.
 *
 * @param scenario - detail about test scenario
 * @param interactions - chart interactions with the backend
 * @param plugVizInteractions - plug viz interactions with the backend
 */
async function scenarioSave(
    scenario: IScenario<any>,
    interactions: ChartInteractions,
    plugVizInteractions?: ChartInteractions,
) {
    const storeDir = storeDirectoryFor(scenario, "executions");
    if (!storeDir) {
        return;
    }

    const { triggeredExecution: componentExecution } = interactions;
    const recordedFingerprints = new Set<string>();
    let recordingDir: string | undefined;
    const allRecordingDirs: Array<{ dir: string; execution: ChartInteractions["triggeredExecution"] }> = [];

    const saveExecution = async (
        execution: ChartInteractions["triggeredExecution"],
        sourceInteractions: ChartInteractions,
        markAsPrimary: boolean = false,
    ): Promise<void> => {
        if (!execution) {
            return;
        }

        const fp = defFingerprint(execution);
        if (recordedFingerprints.has(fp)) {
            return;
        }

        recordedFingerprints.add(fp);
        const savedDir = await scenarioSaveDefinition(scenario, storeDir, execution, sourceInteractions);
        allRecordingDirs.push({ dir: savedDir, execution });

        if (markAsPrimary) {
            recordingDir = savedDir;
        }
    };

    await saveExecution(componentExecution, interactions, true);
    for (const execution of interactions.triggeredExecutions) {
        await saveExecution(execution, interactions);
    }

    if (plugVizInteractions) {
        await saveExecution(plugVizInteractions.triggeredExecution, plugVizInteractions);
        for (const execution of plugVizInteractions.triggeredExecutions) {
            await saveExecution(execution, plugVizInteractions);
        }
    }

    if (!scenario.tags.includes("mock-no-scenario-meta")) {
        // Save scenario descriptors for ALL recording directories
        // For primary execution, use full normalizationState from interactions
        // For secondary executions, use just the buckets from the execution definition
        for (const { dir, execution } of allRecordingDirs) {
            const isPrimary = dir === recordingDir;
            await scenarioSaveDescriptors(
                scenario,
                dir,
                isPrimary
                    ? interactions
                    : { ...interactions, normalizationState: undefined, triggeredExecution: execution },
            );
        }
    }
}

async function scenarioStoreInsight(scenario: IScenario<any>, def: IInsightDefinition) {
    const storeDir = storeDirectoryFor(scenario, "insights");

    if (!storeDir) {
        return;
    }

    const id = scenario.insightId;
    /*
     * Note: while the generated insight uses ref as uriRef, the recordedBackend allows to override this at
     * runtime so then tests can say if they want id or uri
     */
    const persistentInsight: IInsight = scenario.insightConverter({
        insight: { identifier: id, uri: id, ...def.insight } as any,
    });
    const insightDir = path.join(storeDir, id);

    if (!fs.existsSync(insightDir)) {
        fs.mkdirSync(insightDir);
    }

    await writeAsJsonSync(path.join(insightDir, RecordingFiles.Insights.Object), persistentInsight);

    const insightIndexFile = path.join(storeDir, RecordingFiles.Insights.Index);
    const insightIndex = fs.existsSync(insightIndexFile) ? readJsonSync(insightIndexFile) : {};

    /*
     * Inclusion of scenario information in the insight recording definition makes the mock-handling tool
     * to include the insight in Insight index - meaning the insight can be accessed programatically such
     * as 'Insight.BarChart.TwoMeasures' etc.
     */
    const shouldIncludeScenario = !scenario.tags.includes("mock-no-scenario-meta");
    const scenarioInfo = shouldIncludeScenario ? { visName: scenario.vis, scenarioName: scenario.name } : {};

    insightIndex[id] = {
        ...scenarioInfo,
        comment: `Auto-generated insight for test scenario ${insightTitle(def)}.`,
    };

    await writeAsJsonSync(insightIndexFile, insightIndex);
}

/*
 * This is useful when developing new visualization. Typically, react component exists first, and then plug viz
 * implementation appears.
 *
 * Add the name of the React component here and the smoke-and-capture will skip doing the 'plug-viz-stuff' for
 * that visualization.
 */
const PlugVisUnsupported: string[] = [];

describe("all scenarios", () => {
    const Scenarios: AllScenariosType[] = allScenarios.flatMap((s): AllScenariosType[] => {
        const testInputs: Array<IScenario<any>> = s.asScenarioList();

        return testInputs.map((t) => {
            return [t.fullyQualifiedName, t];
        });
    });

    it.each(Scenarios)("%s should lead to execution", async (_scenarioFqn, scenario) => {
        const interactions = await mountChartAndCaptureNormalized(scenario);

        expect(interactions.triggeredExecution).toBeDefined();
        expect(interactions.normalizationState).toBeDefined();

        if (
            interactions.dataViewRequests.windows === undefined &&
            interactions.dataViewRequests.allData === undefined
        ) {
            fail(
                `Mounting ${scenario.vis} for scenario ${scenario.name} did not lead to request of data from server. The smoke-and-capture suite now does not know what to store in the recording definition as it is unclear if the scenario needs all data or some particular window of data.`,
            );
            return;
        }

        // this is intentional, the PlugVisUnsupported might get filled in the future
        // oxlint-disable-next-line sonarjs/no-empty-collection
        if (scenario.tags.includes("mock-no-insight") || PlugVisUnsupported.indexOf(scenario.vis) >= 0) {
            /*
             * Some visualizations may not support plug vis yet. For those, just store scenario
             * definition and halt.
             */
            await scenarioSave(scenario, interactions);
        } else {
            /*
             * For others, create insight object, try to mount pluggable visualization for
             * the respective visualization, capture execution definition and store everything.
             */
            const insight = createInsightDefinitionForChart(scenario.vis, scenario.name, interactions);

            /*
             * note: to allow PV executions and react component executions to hit the same fingerprints, this function
             * must also use the normalizing backend.
             */
            const plugVizInteractions = await mountInsight(scenario, insight, true);

            await scenarioSave(scenario, interactions, plugVizInteractions);
            await scenarioStoreInsight(scenario, insight);
        }
    });
});
