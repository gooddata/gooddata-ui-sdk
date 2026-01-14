// (C) 2007-2026 GoodData Corporation

import { writeFileSync } from "fs";
import { join } from "path";

import { groupBy } from "lodash-es";

import { generateConstantsForCatalog } from "./catalog.js";
import { generateConstantsForDashboards } from "./dashboard.js";
import { generateDataSampleConst, generateImportsForDataSamples } from "./dataSample.js";
import { generateConstantsForDisplayForms } from "./displayForm.js";
import { generateConstantsForExecutions } from "./execution.js";
import { generateConstantsForInsights } from "./insight.js";
import { generateConstantsForVisClasses } from "./visClasses.js";
import { type CatalogRecording } from "../recordings/catalog.js";
import { type IRecording, RecordingType } from "../recordings/common.js";
import { type DashboardRecording } from "../recordings/dashboards.js";
import { type DisplayFormRecording } from "../recordings/displayForms.js";
import { type ExecutionRecording } from "../recordings/execution.js";
import { type InsightRecording } from "../recordings/insights.js";
import { type VisClassesRecording } from "../recordings/visClasses.js";

const FILE_HEADER = `/* eslint-disable import/order */\n/* THIS FILE WAS AUTO-GENERATED USING MOCK HANDLING TOOL; YOU SHOULD NOT EDIT THIS FILE; GENERATE TIME: ${new Date().toISOString()}; */`;

const MainIndexConstName = "Recordings";

function recNameList(recs: IRecording[]): string {
    return recs.map((r) => r.getRecordingName()).join(",");
}

function generateIndexConst(input: IndexGeneratorInput): string {
    const executionsInit = `executions: {${input
        .executions()
        .map((e) => e.getRecordingName())
        .filter((value, index, array) => array.indexOf(value) === index)
        .join(",")}}`;

    const metadataInit = `
        metadata: {
            ${input.catalog() === null ? "" : "catalog,"}
            ${input.visClasses() === null ? "" : "visClasses,"}
            displayForms: { ${recNameList(input.displayForms())} },
            insights: { ${recNameList(input.insights())} },
            dashboards: { ${recNameList(input.dashboards())} }
        }
    `;

    return `export const ${MainIndexConstName}: RecordingIndex = { ${executionsInit}, ${metadataInit} } as unknown as RecordingIndex;`;
}

function transformToTypescript(input: IndexGeneratorInput, targetDir: string, fileName: string) {
    const fileContents = [`// (C) ${new Date().getFullYear()} GoodData Corporation`, "", FILE_HEADER, ""];

    if (fileName === "dataSample.ts") {
        const displayForms = input.displayForms();
        generateImportsForDataSamples(displayForms, targetDir).forEach((l) => fileContents.push(l));
        fileContents.push("");
        fileContents.push(generateDataSampleConst(displayForms));
    } else {
        generateConstantsForExecutions(input.executions(), targetDir).forEach((l) => fileContents.push(l));
        fileContents.push("");
        generateConstantsForDisplayForms(input.displayForms(), targetDir).forEach((l) =>
            fileContents.push(l),
        );
        fileContents.push("");
        generateConstantsForInsights(input.insights(), targetDir).forEach((l) => fileContents.push(l));
        fileContents.push("");

        const catalog = input.catalog();
        if (catalog) {
            generateConstantsForCatalog(catalog, targetDir).forEach((l) => fileContents.push(l));
            fileContents.push("");
        }

        const visClasses = input.visClasses();
        if (visClasses) {
            generateConstantsForVisClasses(visClasses, targetDir).forEach((l) => fileContents.push(l));
            fileContents.push("");
        }

        generateConstantsForDashboards(input.dashboards(), targetDir).forEach((l) => fileContents.push(l));
        fileContents.push("");

        fileContents.push(`import {
    IExecutionDefinition,
    CatalogItem,
    ICatalogGroup,
    IVisualizationClass,
    IAttributeDisplayFormMetadataObject,
    IAttributeElement,
    IInsight,
    IDashboard,
    IDashboardPlugin,
    IDataSetMetadataObject,
} from "@gooddata/sdk-model";

type ExecutionRecording = {
    scenarios?: any[];
    definition: IExecutionDefinition;
    executionResult: any;
    [dataViews: string]: any;
};

type CatalogRecording = {
    items: CatalogItem[];
    groups: ICatalogGroup[];
};

type DisplayFormRecording = {
    obj: IAttributeDisplayFormMetadataObject;
    elements: IAttributeElement[];
};

type InsightRecording = {
    obj: IInsight;
};

type VisClassesRecording = {
    items: IVisualizationClass[];
};

interface IDashboardReferences {
    insights: IInsight[];
    plugins: IDashboardPlugin[];
    dataSets?: IDataSetMetadataObject[];
}

interface IDashboardWithReferences {
    dashboard: IDashboard;
    references: IDashboardReferences;
}

type DashboardRecording = {
    obj: IDashboardWithReferences;
};

type RecordingIndex = {
    executions?: {
        [fp: string]: ExecutionRecording;
    };
    metadata?: {
        catalog?: CatalogRecording;
        displayForms?: Record<string, DisplayFormRecording>;
        insights?: Record<string, InsightRecording>;
        visClasses?: VisClassesRecording;
        dashboards?: Record<string, DashboardRecording>;
    };
};`);

        fileContents.push("");
        fileContents.push(generateIndexConst(input));
    }

    writeFileSync(join(targetDir, fileName), fileContents.join("\n"), { encoding: "utf-8" });
}

/**
 * Input to TS codegen that creates index with pointers to all recordings.
 */
type IndexGeneratorInput = {
    executions: () => ExecutionRecording[];
    displayForms: () => DisplayFormRecording[];
    insights: () => InsightRecording[];
    catalog: () => CatalogRecording | null;
    visClasses: () => VisClassesRecording | null;
    dashboards: () => DashboardRecording[];
};

function createGeneratorInput(recordings: IRecording[]): IndexGeneratorInput {
    const categorized = groupBy(recordings, (rec) => rec.getRecordingType());

    return {
        executions: () => {
            return (categorized[RecordingType.Execution] as unknown as ExecutionRecording[]) || [];
        },
        displayForms: () => {
            return (categorized[RecordingType.DisplayForms] as unknown as DisplayFormRecording[]) || [];
        },
        insights: () => {
            return (categorized[RecordingType.Insights] as unknown as InsightRecording[]) || [];
        },
        catalog: () =>
            (categorized[RecordingType.Catalog] &&
                (categorized[RecordingType.Catalog][0] as unknown as CatalogRecording)) ||
            null,
        visClasses: () =>
            (categorized[RecordingType.VisClasses] &&
                (categorized[RecordingType.VisClasses][0] as VisClassesRecording)) ||
            null,
        dashboards: () => {
            return (categorized[RecordingType.Dashboards] as unknown as DashboardRecording[]) || [];
        },
    };
}

/**
 * Given various types of recordings, this function will generate and write `dataSample.ts` and `index.ts` file in the root of
 * the recordings directory.
 *
 * The index will use import to reference the JSON files. It is assumed that all paths on input to this function
 * are absolute, the code will relativize paths as needed.
 *
 * @param recordings - recordings to include in the index
 * @param targetDir - absolute path to directory where the index should be created
 */

export function generateAllFiles(recordings: IRecording[], targetDir: string): void {
    const input = createGeneratorInput(recordings);

    transformToTypescript(input, targetDir, "index.ts");
    transformToTypescript(input, targetDir, "dataSample.ts");
}
