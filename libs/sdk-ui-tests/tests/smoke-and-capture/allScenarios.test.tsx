// (C) 2007-2019 GoodData Corporation

import flatMap = require("lodash/flatMap");
import { PropsFactory } from "../../src";
import allScenarios from "../../scenarios";
import { mountChartAndCapture } from "../_infra/render";
import { defFingerprint, IExecutionDefinition } from "@gooddata/sdk-model";
import * as process from "process";
import * as fs from "fs";
import * as path from "path";

type AllScenariosType = [string, string, React.ComponentType<any>, PropsFactory<any>];

const StoreEnvVar = "GDC_STORE_DEFS";
const StoreLocation = initializeStore(process.env[StoreEnvVar]);
const DefinitionFileName = "definition.json";

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

function storeDefinition(def: IExecutionDefinition) {
    if (!StoreLocation) {
        return;
    }

    const fp = defFingerprint(def);
    const recordingDir = path.join(StoreLocation, fp);

    if (!fs.existsSync(recordingDir)) {
        fs.mkdirSync(recordingDir);
    }

    fs.writeFileSync(path.join(recordingDir, DefinitionFileName), JSON.stringify(def, null, 4));
}

describe("all scenarios", () => {
    const Scenarios: AllScenariosType[] = flatMap(allScenarios, (s): AllScenariosType[] => {
        const testInputs = s.asTestInput();

        return testInputs.map(t => {
            // spread won't work here
            return [s.vis, t[0], t[1], t[2]];
        });
    });

    it.each(Scenarios)("%s %s should lead to execution", (_vis, _scenario, Component, propsFactory) => {
        const interactions = mountChartAndCapture(Component, propsFactory);

        expect(interactions.triggeredExecution).toBeDefined();
        storeDefinition(interactions.triggeredExecution!);
    });
});
