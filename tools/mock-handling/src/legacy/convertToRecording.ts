// (C) 2019 GoodData Corporation
import { GdcExecuteAFM, GdcExecution } from "@gooddata/gd-bear-model";
import {
    AttributeElements,
    defSetDimensions,
    defSetSorts,
    IAttribute,
    IDimension,
    IExecutionDefinition,
    IFilter,
    IMeasure,
    IMeasureDefinition,
    INegativeAttributeFilter,
    IPoPMeasureDefinition,
    IPositiveAttributeFilter,
    SortItem,
    newDefForItems,
    IMeasureFilter,
} from "@gooddata/sdk-model";
import * as fs from "fs";
import * as path from "path";
import rimraf from "rimraf";

type TestDataFiles = {
    request: IExecutionDefinition;
    response: GdcExecution.IExecutionResponse;
    result: GdcExecution.IExecutionResult;
};

function readRequestFile(prefix: string): GdcExecuteAFM.IExecution {
    const fullpath = prefix + "_request.json";
    const fileContent = fs.readFileSync(fullpath, { encoding: "utf-8" });

    return JSON.parse(fileContent) as GdcExecuteAFM.IExecution;
}

function readResponseFile(prefix: string): GdcExecution.IExecutionResponse {
    const fullpath = prefix + "_response.json";
    const fileContent = fs.readFileSync(fullpath, { encoding: "utf-8" });

    return JSON.parse(fileContent) as GdcExecution.IExecutionResponse;
}

function readResultFile(prefix: string): GdcExecution.IExecutionResult {
    const fullpath = prefix + "_result.json";
    const fileContent = fs.readFileSync(fullpath, { encoding: "utf-8" });

    return JSON.parse(fileContent) as GdcExecution.IExecutionResult;
}

function transformAttrs(attrs: GdcExecuteAFM.IAttribute[] = []): IAttribute[] {
    if (!attrs.length) {
        return [];
    }

    return attrs.map(a => {
        return {
            attribute: a,
        };
    });
}

function transformAttrElements(attrElem: GdcExecuteAFM.AttributeElements): AttributeElements {
    if (GdcExecuteAFM.isAttributeElementsArray(attrElem)) {
        return {
            values: attrElem,
        };
    }

    return attrElem;
}

function isExpressionFilter(obj: any): obj is GdcExecuteAFM.IExpressionFilter {
    return obj && (obj as GdcExecuteAFM.IExpressionFilter).value !== undefined;
}

function transformMeasureFilter(f: GdcExecuteAFM.FilterItem): IMeasureFilter {
    if (GdcExecuteAFM.isPositiveAttributeFilter(f)) {
        const newFilter: IPositiveAttributeFilter = {
            positiveAttributeFilter: {
                displayForm: f.positiveAttributeFilter.displayForm,
                in: transformAttrElements(f.positiveAttributeFilter.in),
            },
        };

        return newFilter;
    } else if (GdcExecuteAFM.isNegativeAttributeFilter(f)) {
        const newFilter: INegativeAttributeFilter = {
            negativeAttributeFilter: {
                displayForm: f.negativeAttributeFilter.displayForm,
                notIn: transformAttrElements(f.negativeAttributeFilter.notIn),
            },
        };

        return newFilter;
    }

    return f;
}

function transformFilters(filters: GdcExecuteAFM.CompatibilityFilter[] = []): IFilter[] {
    if (!filters.length) {
        return [];
    }

    return filters.map(f => {
        if (isExpressionFilter(f)) {
            throw new Error("get out of here ;)");
        }

        if (GdcExecuteAFM.isMeasureValueFilter(f)) {
            return f;
        }

        return transformMeasureFilter(f);
    });
}

function transformMeasureFilters(filters: GdcExecuteAFM.FilterItem[] = []): IMeasureFilter[] {
    if (!filters.length) {
        return [];
    }

    return filters.map(transformMeasureFilter);
}

function transformMeasures(measures: GdcExecuteAFM.IMeasure[] = []): IMeasure[] {
    if (!measures.length) {
        return [];
    }

    return measures.map(m => {
        const { alias, definition, format, localIdentifier } = m;

        if (GdcExecuteAFM.isSimpleMeasureDefinition(definition)) {
            const newMeasure: IMeasure<IMeasureDefinition> = {
                measure: {
                    localIdentifier,
                    alias,
                    format,
                    definition: {
                        measureDefinition: {
                            ...definition.measure,
                            filters: transformMeasureFilters(definition.measure.filters),
                        },
                    },
                },
            };

            return newMeasure;
        } else if (GdcExecuteAFM.isPopMeasureDefinition(definition)) {
            const newMeasure: IMeasure<IPoPMeasureDefinition> = {
                measure: {
                    localIdentifier,
                    alias,
                    format,
                    definition: {
                        popMeasureDefinition: {
                            ...definition.popMeasure,
                        },
                    },
                },
            };

            return newMeasure;
        }

        return {
            measure: {
                alias,
                format,
                localIdentifier,
                definition,
            },
        };
    });
}

function explodeResultSpec(
    rs: GdcExecuteAFM.IResultSpec = {},
): { sorts: SortItem[]; dimensions: IDimension[] } {
    const { sorts, dimensions } = rs;

    return {
        sorts: sorts ? sorts : [],
        dimensions: dimensions ? dimensions : [],
    };
}

function transformRequestToExecDef(req: GdcExecuteAFM.IExecution): IExecutionDefinition {
    const attrs = transformAttrs(req.execution.afm.attributes);
    const measures = transformMeasures(req.execution.afm.measures);
    const filters = transformFilters(req.execution.afm.filters);
    const { sorts, dimensions } = explodeResultSpec(req.execution.resultSpec);

    return defSetDimensions(
        defSetSorts(newDefForItems("testWorkspace", [...attrs, ...measures], filters), sorts),
        dimensions,
    );
}

function readFiles(prefix: string): TestDataFiles {
    return {
        request: transformRequestToExecDef(readRequestFile(prefix)),
        response: readResponseFile(prefix),
        result: readResultFile(prefix),
    };
}

export function main(sourceDir: string, targetDir: string, prefix: string) {
    const sourcePath = path.join(sourceDir, prefix);
    const targetPath = path.join(targetDir, prefix);

    console.log(`going to work with ${sourcePath}; reading all files now.`);

    const allFiles = readFiles(sourcePath);

    console.log(allFiles);
    console.log(`all necessary files were found and read successfully. preparing target dir ${targetPath}`);

    rimraf.sync(targetPath);
    fs.mkdirSync(targetPath, { recursive: true });

    fs.writeFileSync(path.join(targetPath, "definition.json"), JSON.stringify(allFiles.request, null, 4));
    fs.writeFileSync(path.join(targetPath, "response.json"), JSON.stringify(allFiles.response, null, 4));
    fs.writeFileSync(path.join(targetPath, "result.json"), JSON.stringify(allFiles.result, null, 4));
}

const SOURCE_DIR = "../../../libs/sdk-ui/stories/test_data";
const TARGET_DIR = "../../../libs/sdk-ui/__mocks__/recordings/";

/*
 * Start this program and give it a prefix of the test data set (e.g. the stuff before _request.json, _result.json etc)
 *
 * It will by default look into sdk-ui/stories/test_data for the input files. if read correctly, it will transform
 * the request .. build an agnostic GdcExecution definition. then it will store this, the request and the response
 * inside the target directory.
 *
 * From there on, the legacyRecordedBackend can work with the stuff. see the mockingbird for more information on how to
 * use these recorded GdcExecutions.
 */

main(SOURCE_DIR, TARGET_DIR, "pivot_table_with_2_metrics_4_attributes_subtotals");
