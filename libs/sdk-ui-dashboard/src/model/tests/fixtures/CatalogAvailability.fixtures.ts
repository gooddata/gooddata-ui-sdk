// (C) 2021-2022 GoodData Corporation
import { ICatalogDateDataset, uriRef } from "@gooddata/sdk-model";
import includes from "lodash/includes.js";
import { invariant } from "ts-invariant";

/*
 * The catalog availability mocks for date dataset queries.
 *
 * Normally the recorded backend from mockingbird returns all data sets available in the catalog as available. Mockingbird
 * allows to customize filtering functions to 'simulate' the availability.
 *
 * Here are a couple of functions that you can use.
 *
 * To set up DashboardTester you can do something like:
 *
 *             const Tester = DashboardTester.forRecording(
 *              ComplexDashboardIdentifier,
 *              {},
 *              {
 *                  catalogAvailability: {
 *                      availableDateDatasets: MockAvailabilityWithDifferentRelevance,
 *                  },
 *              },
 *          );
 */

/**
 * given all available datasets, this availability mock will pick 2 by name and associate relevance so that second one has more relevance
 *
 * Timeline date has greater relevance; see TimelineDateDatasetRef
 * Activity date has lower relevance; see ActivityDateDatasetRef
 */
export const MockAvailabilityWithDifferentRelevance = (
    datasets: ICatalogDateDataset[],
): ICatalogDateDataset[] => {
    const available = datasets
        .filter((d) => includes(["Date (Activity)", "Date (Timeline)"], d.dataSet.title))
        .map((d) => {
            return {
                ...d,
                relevance: d.dataSet.title === "Date (Timeline)" ? 1 : 0,
            };
        });

    invariant(available.length === 2, "unexpected mock");
    return available;
};

/**
 * given all available datasets, this mock will pick 2 by name and ensure they have same relevance
 */
export const MockAvailabilityWithSameRelevance = (datasets: ICatalogDateDataset[]): ICatalogDateDataset[] => {
    const available = datasets
        .filter((d) => includes(["Date (Activity)", "Date (Timeline)"], d.dataSet.title))
        .map((d) => {
            return {
                ...d,
                relevance: 1,
            };
        });

    invariant(available.length === 2, "unexpected mock");
    return available;
};

export const TimelineDateDatasetRef = uriRef("/gdc/md/referenceworkspace/obj/1052");
export const ActivityDateDatasetRef = uriRef("/gdc/md/referenceworkspace/obj/887");
