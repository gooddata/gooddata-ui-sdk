// (C) 2021-2022 GoodData Corporation
import { DashboardTester } from "../../tests/DashboardTester";
import { EmptyDashboardIdentifier } from "../../tests/fixtures/Dashboard.fixtures";
import { MeasureDateDatasets, queryDateDatasetsForMeasure } from "../../queries";
import { measureItem, ICatalogDateDataset } from "@gooddata/sdk-model";
import { initializeDashboard } from "../../commands";
import { ReferenceMd } from "@gooddata/reference-workspace";
import {
    MockAvailabilityWithDifferentRelevance,
    MockAvailabilityWithSameRelevance,
} from "../../tests/fixtures/CatalogAvailability.fixtures";

function datasetsDigest(
    datasets: ReadonlyArray<ICatalogDateDataset | undefined>,
): ReadonlyArray<string | undefined> {
    return datasets.map((d) => d?.dataSet.title);
}

describe("query measure date datasets", () => {
    describe("for datasets obtained from catalog", () => {
        // given all available datasets, this availability mock will pick 2 by name and associate relevance so that second one has more relevance

        it("should order date datasets by relevance desc", async () => {
            const Tester = DashboardTester.forRecording(
                EmptyDashboardIdentifier,
                {},
                {
                    catalogAvailability: {
                        availableDateDatasets: MockAvailabilityWithDifferentRelevance,
                    },
                },
            );

            await Tester.dispatchAndWaitFor(initializeDashboard(), "GDC.DASH/EVT.INITIALIZED");

            const result: MeasureDateDatasets = await Tester.query(
                queryDateDatasetsForMeasure(measureItem(ReferenceMd.Won)),
            );

            expect(datasetsDigest(result.dateDatasetsOrdered)).toMatchSnapshot();
            expect(result.dateDatasetDisplayNames).toMatchSnapshot();
        });

        it("should order date datasets by relevance and title if tied", async () => {
            const Tester = DashboardTester.forRecording(
                EmptyDashboardIdentifier,
                {},
                {
                    catalogAvailability: {
                        availableDateDatasets: MockAvailabilityWithSameRelevance,
                    },
                },
            );

            await Tester.dispatchAndWaitFor(initializeDashboard(), "GDC.DASH/EVT.INITIALIZED");

            const result: MeasureDateDatasets = await Tester.query(
                queryDateDatasetsForMeasure(measureItem(ReferenceMd.Won)),
            );

            expect(datasetsDigest(result.dateDatasetsOrdered)).toMatchSnapshot();
            expect(result.dateDatasetDisplayNames).toMatchSnapshot();
        });
    });
});
