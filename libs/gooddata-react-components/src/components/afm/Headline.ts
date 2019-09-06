// (C) 2007-2019 GoodData Corporation
import { AFM } from "@gooddata/typings";
import * as React from "react";

import { dataSourceProvider, IDataSourceProviderProps } from "./DataSourceProvider";

export { IDataSourceProviderProps };

import { CoreHeadline } from "../../charts/headline/CoreHeadline";

function generateDefaultDimensions(): AFM.IDimension[] {
    return [{ itemIdentifiers: ["measureGroup"] }];
}

/**
 * AFM Headline
 * is an internal component that accepts afm, resultSpec
 * @internal
 */
export const Headline: React.ComponentClass<IDataSourceProviderProps> = dataSourceProvider(
    CoreHeadline,
    generateDefaultDimensions,
    "CoreHeadline",
    "Headline",
);
