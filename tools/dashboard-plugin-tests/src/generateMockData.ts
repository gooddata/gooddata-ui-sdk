// (C) 2021-2022 GoodData Corporation
import { defFingerprint, areObjRefsEqual } from "@gooddata/sdk-model";
import { DashboardsEntryFile } from "@gooddata/mock-handling/dist/recordings/dashboards";
import { DisplayFormsEntryFile } from "@gooddata/mock-handling/dist/recordings/displayForms";
import fs from "fs/promises";
import merge from "lodash/merge";
import isEqual from "lodash/isEqual";
import values from "lodash/values";
import { CapturedData, emptyCapturedData } from "./capturing";
import omitBy from "lodash/omitBy";
import isEmpty from "lodash/isEmpty";

const dirname = "./generated/captured/";
const executionsDir = "./recordings/executions/";
const dashboardsDir = "./recordings/dashboards/";
const catalogDir = "./recordings/catalog/";
const displayFormsDir = "./recordings/displayForms/";

async function createMockHandlingDefinitions() {
    const allCapturedData = await getAllCapturedData();

    await Promise.all([
        createCatalogRecordingSpec(),
        createDashboardsRecordingSpec(allCapturedData),
        createExecutionRecordingSpecs(allCapturedData),
        createDisplayFormsRecordingSpec(allCapturedData),
    ]);
}

createMockHandlingDefinitions();

function omitEmpty<T extends object>(obj?: T) {
    return obj && omitBy(obj, isEmpty);
}
function replaceWorkspaceId<T extends object>(obj: T): T {
    return JSON.parse(
        JSON.stringify(obj).replace(
            new RegExp("l32xdyl4bjuzgf9kkqr2avl55gtuyjwf", "g"),
            "reference-workspace",
        ),
    );
}

async function getAllCapturedData() {
    const capturedDataFiles = await fs.readdir(dirname);
    const capturedData = await Promise.all(
        capturedDataFiles.map((filename) =>
            fs.readFile(dirname + filename, "utf-8").then((c) => JSON.parse(c) as CapturedData),
        ),
    );

    const allCapturedData = capturedData.reduce((acc: CapturedData, el) => {
        merge(acc, el);
        return acc;
    }, emptyCapturedData);

    return replaceWorkspaceId(allCapturedData);
}

async function createCatalogRecordingSpec() {
    await fs.mkdir(catalogDir, { recursive: true });
    await fs.writeFile(`${catalogDir}catalog.json`, JSON.stringify({}, null, 4), "utf8");
}

async function createDashboardsRecordingSpec(capturedData: CapturedData) {
    await fs.mkdir(dashboardsDir, { recursive: true });
    await fs.writeFile(
        `${dashboardsDir}dashboards.json`,
        JSON.stringify(
            capturedData.dashboards.reduce((acc: DashboardsEntryFile, el) => {
                acc[el] = {};
                return acc;
            }, {}),
            null,
            4,
        ),
        "utf8",
    );
}

async function createExecutionRecordingSpecs(capturedData: CapturedData) {
    const executions = values(capturedData.executions);

    await Promise.all(
        executions.map((execution) =>
            fs.mkdir(`${executionsDir}${defFingerprint(execution.definition)}`, { recursive: true }),
        ),
    );
    await Promise.all(
        executions.map((execution) =>
            Promise.all([
                fs.writeFile(
                    `${executionsDir}${defFingerprint(execution.definition)}/definition.json`,
                    JSON.stringify(execution.definition, null, 4),
                    "utf8",
                ),
                fs.writeFile(
                    `${executionsDir}${defFingerprint(execution.definition)}/requests.json`,
                    JSON.stringify({ windows: execution.windows, allData: execution.allData }, null, 4),
                    "utf8",
                ),
            ]),
        ),
    );
}

async function createDisplayFormsRecordingSpec(capturedData: CapturedData) {
    const displayFormsEntryFileContent = capturedData.elements.reduce((acc: DisplayFormsEntryFile, el) => {
        const displayForm = capturedData.displayForms.find((df) => areObjRefsEqual(df.ref, el.ref));
        if (!displayForm) {
            throw new Error("Display form not found!");
        }

        if (!acc[displayForm.id]) {
            acc[displayForm.id] = [];
        }

        const currentParams = {
            attributeFilters: el.attributeFilters,
            dateFilters: el.dateFilters,
            measures: el.measures,
            options: el.options,
        };

        const matchingSpecIndex = acc[displayForm.id].findIndex((spec) => {
            return isEqual(spec.params, omitEmpty(currentParams));
        });

        if (matchingSpecIndex !== -1) {
            acc[displayForm.id][matchingSpecIndex] = {
                params: omitEmpty(acc[displayForm.id][matchingSpecIndex].params),
                offset: Math.min(acc[displayForm.id][matchingSpecIndex].offset!, el.offset ?? 0),
                elementCount: Math.max(
                    acc[displayForm.id][matchingSpecIndex].elementCount!,
                    (el.offset ?? 0) + (el.limit ?? 550),
                ),
            };
        } else {
            acc[displayForm.id].push({
                params: omitEmpty(currentParams),
                offset: el.offset ?? 0,
                elementCount: el.limit ?? 550,
            });
        }

        return acc;
    }, {});

    await fs.mkdir(displayFormsDir, { recursive: true });
    await fs.writeFile(
        `${displayFormsDir}displayForms.json`,
        JSON.stringify(displayFormsEntryFileContent, null, 4),
        "utf8",
    );
}
