// (C) 2007-2021 GoodData Corporation
import range from "lodash/range.js";
import { IExecutionDefinition, IBucket } from "@gooddata/sdk-model";

/*
 * Interface between mock-handling tool and other tools is for now a set of file names that the other
 * tools populate to create definitions for mock-handling to process.
 */

/**
 * Significant file names.
 */
export const RecordingFiles = {
    Execution: {
        /**
         * File name for the execution definition.
         *
         * Store IExecutionDefinition in this file.
         */
        Definition: "definition.json",

        /**
         * File name for data capture requests. Store DataViewRequests in this file.
         */
        Requests: "requests.json",

        /**
         * File name for metadata about test scenarios that use the same execution definition. This is a list
         * of objects of {@link ScenarioDescriptor} type
         */
        Scenarios: "scenarios.json",
    },

    Insights: {
        /**
         * File name containing object mapping insight identifier to an object of {@link InsightRecordingSpec} type.
         */
        Index: "insights.json",

        /**
         * Insight object file name.
         */
        Object: "obj.json",
    },

    Dashboards: {
        Object: "obj.json",
        Alerts: "alerts.json",
    },
};

/**
 * Store this as json in execution definition file.
 */
export type DataViewRequests = {
    allData?: boolean;
    windows?: RequestedWindow[];
};

/**
 * Definition of data view window to obtain
 */
export type RequestedWindow = {
    offset: number[];
    size: number[];
};

/**
 * Provides details about test scenarios that use the captured execution & its data.
 */
export type ScenarioDescriptor = {
    /**
     * Name of visualization using the execution
     */
    vis: string;

    /**
     * Test scenario name.
     */
    scenario: string;
    /**
     * For normalized executions, store the original execution definition
     */
    originalExecution?: IExecutionDefinition;
    /**
     * For normalized executions, store mapping between normalized and original local ids
     */
    n2oMap?: { [from: string]: string };

    /**
     * For non-normalized executions, store buckets
     */
    buckets?: IBucket[];
};

/**
 * Store this object as value for insightId key in insight index
 */
export type InsightRecordingSpec = {
    visName?: string;
    scenarioName?: string;
    comment?: string;
};

/**
 * Utility function to create a number of consecutive RequestedWindows for N pages of data. Page = vertical scrolling. The
 * second-dim offset always stays the same.
 *
 * @param start - start offset
 * @param size - page size
 * @param pages - number of pages
 */
export function requestPages(
    start: [number, number],
    size: [number, number],
    pages: number,
): RequestedWindow[] {
    return range(0, pages).map((page) => {
        return {
            offset: [start[0] + size[0] * page, start[1]],
            size,
        };
    });
}
