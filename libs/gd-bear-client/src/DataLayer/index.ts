// (C) 2007-2018 GoodData Corporation
import * as Header from "./interfaces/Header";
import * as DataSourceUtils from "./dataSources/utils";
import * as DataSource from "./dataSources/DataSource";
import * as Filters from "./helpers/filters";
import * as Uri from "./helpers/uri";
import { createSubject, ISubject } from "./utils/async";
import { toAfmResultSpec } from "./converters/toAfmResultSpec";
import * as ResultSpecUtils from "./utils/ResultSpecUtils";
import * as AfmUtils from "./utils/AfmUtils";
import { DataTable } from "./DataTable";
import { DummyAdapter } from "./utils/DummyAdapter";
import { ExecuteAfmAdapter } from "./adapters/ExecuteAfmAdapter";
import { UriAdapter } from "./adapters/UriAdapter";
import { IAdapter } from "./interfaces/Adapter";

/**
 * Data layer
 *
 * @module DataLayer
 * @class DataLayer
 */
export {
    Header,
    AfmUtils,
    ExecuteAfmAdapter,
    DataSourceUtils,
    toAfmResultSpec,
    createSubject,
    ISubject,
    IAdapter,
    DataSource,
    DataTable,
    DummyAdapter,
    Filters,
    ResultSpecUtils,
    Uri,
    UriAdapter,
};
