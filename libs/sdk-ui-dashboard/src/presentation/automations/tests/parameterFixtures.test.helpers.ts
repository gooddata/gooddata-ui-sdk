// (C) 2026 GoodData Corporation

import {
    type IDashboardParameter,
    type INumberParameterConstraints,
    type IScalarParameterDefinition,
    type IScalarParameterMetadataObject,
    type IStringParameterConstraints,
    idRef,
} from "@gooddata/sdk-model";

const workspaceParameterWithDefinition = (
    id: string,
    title: string,
    definition: IScalarParameterDefinition,
): IScalarParameterMetadataObject => ({
    type: "parameter",
    id,
    title,
    ref: idRef(id, "parameter"),
    uri: id,
    production: true,
    deprecated: false,
    unlisted: false,
    description: "",
    definition,
});

export const workspaceNumberParameter = (
    id: string,
    title: string,
    defaultValue: number,
    constraints?: INumberParameterConstraints,
): IScalarParameterMetadataObject =>
    workspaceParameterWithDefinition(id, title, { type: "NUMBER", defaultValue, constraints });

export const workspaceStringParameter = (
    id: string,
    title: string,
    defaultValue: string,
    constraints?: IStringParameterConstraints,
): IScalarParameterMetadataObject =>
    workspaceParameterWithDefinition(id, title, { type: "STRING", defaultValue, constraints });

export const dashboardParameter = (
    id: string,
    overrides: Partial<IDashboardParameter> = {},
): IDashboardParameter => ({
    ref: idRef(id, "parameter"),
    mode: "active",
    parameterType: "NUMBER",
    ...overrides,
});
