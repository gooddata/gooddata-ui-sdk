// (C) 2019-2021 GoodData Corporation
import { uriRef } from "../../objRef/factory.js";
import {
    IDashboardAttributeFilter,
    IDashboardAttributeFilterReference,
    IDashboardDateFilter,
    IDashboardDateFilterReference,
    IFilterContext,
    IFilterContextDefinition,
    ITempFilterContext,
} from "../filterContext.js";

export const dashboardAttributeFilter: IDashboardAttributeFilter = {
    attributeFilter: {
        attributeElements: { uris: [] },
        displayForm: uriRef("/displayForm"),
        negativeSelection: false,
    },
};

export const dashboardDateFilter: IDashboardDateFilter = {
    dateFilter: {
        granularity: "GDC.time.date",
        type: "relative",
        from: -11,
        to: 1,
    },
};

export const dashboardAttributeFilterReference: IDashboardAttributeFilterReference = {
    displayForm: uriRef("/displayForm"),
    type: "attributeFilterReference",
};

export const dashboardDateFilterReference: IDashboardDateFilterReference = {
    dataSet: uriRef("/dataSet"),
    type: "dateFilterReference",
};

export const filterContextDefinition: IFilterContextDefinition = {
    title: "",
    description: "",
    filters: [],
};

export const filterContext: IFilterContext = {
    ...filterContextDefinition,
    ref: uriRef("/filterContext"),
    identifier: "",
    uri: "/filterContext",
};

export const tempFilterContext: ITempFilterContext = {
    created: "10-10-2020",
    filters: [],
    ref: uriRef("/filterContext"),
    uri: "/filterContext",
};
