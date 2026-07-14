// (C) 2026 GoodData Corporation

import {
    type IDashboardParameter,
    type IParameterMetadataObject,
    type ObjRef,
    type ParameterValue,
    areObjRefsEqual,
} from "@gooddata/sdk-model";

import { computeHydratedRuntimeOverride } from "../../store/tabs/parameters/parametersHelpers.js";

interface IResolvedFilterViewParameter {
    ref: ObjRef;
    value: ParameterValue | undefined;
}

export function resolveFilterViewParameterValues(
    parameters: ReadonlyArray<IDashboardParameter>,
    workspaceParameters: ReadonlyArray<IParameterMetadataObject>,
): IResolvedFilterViewParameter[] {
    return parameters.map((parameter) => ({
        ref: parameter.ref,
        value: computeHydratedRuntimeOverride(
            parameter,
            workspaceParameters.find((item) => areObjRefsEqual(item.ref, parameter.ref)),
        ),
    }));
}
