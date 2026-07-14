// (C) 2026 GoodData Corporation

import {
    type IParameterMetadataObject,
    isNumberParameterDefinition,
    isStringParameterDefinition,
} from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../types/commonTypes.js";

export async function loadDashboardParameters(
    { backend, workspace }: DashboardContext,
    enableStringParameters: boolean,
): Promise<IParameterMetadataObject[]> {
    const firstPage = await backend.workspace(workspace).parameters().getParametersQuery().query();
    const all = await firstPage.all();

    return all.filter(
        (parameter) =>
            isNumberParameterDefinition(parameter.definition) ||
            (enableStringParameters && isStringParameterDefinition(parameter.definition)),
    );
}
