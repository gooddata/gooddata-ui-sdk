// (C) 2026 GoodData Corporation

import {
    type IInsightParameterValue,
    type IParameterMetadataObject,
    type ObjRef,
    areObjRefsEqual,
    isValidParameterValue,
    objRefToString,
    parameterValueMatchesType,
} from "@gooddata/sdk-model";

import { generateBucketItemIdentifier } from "../../models/bucket_item_identifier.js";

import { type IParameterFilter } from "./parameter_filter_types.js";

export interface IParameterWarning {
    kind: "reset" | "removed" | "incompatible";
    ref: ObjRef;
    name: string;
}

export interface IParameterRestoreResult {
    filters: IParameterFilter[];
    warnings: IParameterWarning[];
}

type ParameterRestore =
    | { kind: "ok" | "reset"; filter: IParameterFilter; name: string }
    | { kind: "removed" | "incompatible"; name: string };

export function restoreParameterFilters(
    values: ReadonlyArray<IInsightParameterValue>,
    parameterMetadata: ReadonlyArray<IParameterMetadataObject>,
): IParameterRestoreResult {
    const filters: IParameterFilter[] = [];
    const warnings: IParameterWarning[] = [];
    for (const value of values) {
        const restore = restoreParameter(value, parameterMetadata);
        if ("filter" in restore) {
            filters.push(restore.filter);
        }
        if (restore.kind !== "ok") {
            warnings.push({ kind: restore.kind, ref: value.ref, name: restore.name });
        }
    }
    return { filters, warnings };
}

export function parameterFilterFromMetadata(parameter: IParameterMetadataObject): IParameterFilter {
    const { definition } = parameter;
    return {
        type: "parameter",
        localIdentifier: generateBucketItemIdentifier(),
        parameterRef: parameter.ref,
        name: parameter.title,
        value: definition.defaultValue,
        definition,
    };
}

function restoreParameter(
    { ref, value }: IInsightParameterValue,
    parameterMetadata: ReadonlyArray<IParameterMetadataObject>,
): ParameterRestore {
    const metadata = parameterMetadata.find((param) => areObjRefsEqual(param.ref, ref));
    if (!metadata) {
        return { kind: "removed", name: objRefToString(ref) };
    }
    const { definition, title } = metadata;
    if (!parameterValueMatchesType(definition, value)) {
        return { kind: "incompatible", name: title };
    }
    const kind = isValidParameterValue(definition, value) ? "ok" : "reset";
    return { kind, filter: { ...parameterFilterFromMetadata(metadata), value }, name: title };
}
