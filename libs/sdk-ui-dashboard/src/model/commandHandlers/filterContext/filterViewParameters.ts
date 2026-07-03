// (C) 2026 GoodData Corporation

import {
    type IDashboardParameter,
    type IParameterMetadataObject,
    type ObjRef,
    areObjRefsEqual,
    getNumberParameterDefaultValue,
} from "@gooddata/sdk-model";

interface IResolvedFilterViewParameter {
    ref: ObjRef;
    value: number | undefined;
}

export function resolveFilterViewParameterValues(
    parameters: ReadonlyArray<IDashboardParameter>,
    workspaceParameters: ReadonlyArray<IParameterMetadataObject>,
): IResolvedFilterViewParameter[] {
    return parameters.map((parameter) => {
        if (parameter.value !== undefined) {
            return { ref: parameter.ref, value: parameter.value };
        }
        const workspaceParameter = workspaceParameters.find((item) =>
            areObjRefsEqual(item.ref, parameter.ref),
        );
        return {
            ref: parameter.ref,
            value: getNumberParameterDefaultValue(workspaceParameter?.definition),
        };
    });
}
