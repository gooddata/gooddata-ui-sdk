// (C) 2026 GoodData Corporation

import {
    type IParameterMetadataObject,
    type ISettings,
    isDateRangeParameterMetadataObject,
    isNumberParameterDefinition,
    isScalarParameterMetadataObject,
} from "@gooddata/sdk-model";

import { type ICatalogParametersState } from "../../../store/catalog/catalogState.js";
import { type DashboardContext } from "../../../types/commonTypes.js";

/**
 * Loads the workspace parameters into the shape of the catalog parameters slice: one request, two lists,
 * each with its own status. Never throws.
 *
 * Number and string parameters load only when the `enableParameters` setting is on, date range parameters
 * only when the `enableDateRangeParameters` setting is on. With neither on, no request is sent. A list whose
 * setting is off is empty and `gated-off`, whatever the request did. When the request fails, each list whose
 * setting is on is `failed` and the dashboard renders without parameters. String parameters are kept only
 * when `enableStringParameters` is on (the default). Each list keeps only the kinds it is typed for. A
 * backend that rejects a kind this SDK does not know fails the whole request.
 */
export async function loadDashboardParameters(
    ctx: DashboardContext,
    settings: ISettings | undefined,
): Promise<ICatalogParametersState> {
    const enableParameters = settings?.enableParameters ?? false;
    const enableDateRangeParameters = settings?.enableDateRangeParameters ?? false;

    if (!enableParameters && !enableDateRangeParameters) {
        return {
            status: "gated-off",
            parameters: [],
            dateRangeParametersStatus: "gated-off",
            dateRangeParameters: [],
        };
    }

    const { status, all } = await queryParameters(ctx);
    const enableStringParameters = settings?.enableStringParameters ?? true;

    return {
        status: enableParameters ? status : "gated-off",
        parameters: enableParameters
            ? all
                  .filter(isScalarParameterMetadataObject)
                  .filter(
                      (parameter) =>
                          enableStringParameters || isNumberParameterDefinition(parameter.definition),
                  )
            : [],
        dateRangeParametersStatus: enableDateRangeParameters ? status : "gated-off",
        dateRangeParameters: enableDateRangeParameters ? all.filter(isDateRangeParameterMetadataObject) : [],
    };
}

async function queryParameters({
    backend,
    workspace,
}: DashboardContext): Promise<{ status: "loaded" | "failed"; all: IParameterMetadataObject[] }> {
    try {
        const firstPage = await backend.workspace(workspace).parameters().getParametersQuery().query();
        return { status: "loaded", all: await firstPage.all() };
    } catch {
        return { status: "failed", all: [] };
    }
}
