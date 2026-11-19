// (C) 2026 GoodData Corporation

import {
    type IScalarParameterMetadataObject,
    isNumberParameterDefinition,
    isScalarParameterMetadataObject,
} from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../types/commonTypes.js";

export async function loadDashboardParameters(
    { backend, workspace }: DashboardContext,
    enableStringParameters: boolean,
): Promise<IScalarParameterMetadataObject[]> {
    const firstPage = await backend.workspace(workspace).parameters().getParametersQuery().query();
    const all = await firstPage.all();

    return all
        .filter(isScalarParameterMetadataObject)
        .filter((parameter) => enableStringParameters || isNumberParameterDefinition(parameter.definition));
}
