// (C) 2026 GoodData Corporation

import {
    type IDashboardParameter,
    type INumberParameterConstraints,
    type IParameterMetadataObject,
    idRef,
} from "@gooddata/sdk-model";

export const workspaceParameter = (
    id: string,
    title: string,
    defaultValue: number,
    constraints?: INumberParameterConstraints,
): IParameterMetadataObject => ({
    type: "parameter",
    id,
    title,
    ref: idRef(id, "parameter"),
    uri: id,
    production: true,
    deprecated: false,
    unlisted: false,
    description: "",
    definition: { type: "NUMBER", defaultValue, constraints },
});

export const dashboardParameter = (
    id: string,
    overrides: Partial<IDashboardParameter> = {},
): IDashboardParameter => ({
    ref: idRef(id, "parameter"),
    mode: "active",
    parameterType: "NUMBER",
    ...overrides,
});
