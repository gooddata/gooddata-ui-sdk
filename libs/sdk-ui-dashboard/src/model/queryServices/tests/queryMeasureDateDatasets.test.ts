// (C) 2021 GoodData Corporation
import { DashboardTester } from "../../tests/DashboardTester";
import {
    EmptyDashboardIdentifier,
    MockAvailabilityWithDifferentRelevance,
    MockAvailabilityWithSameRelevance,
} from "../../tests/Dashboard.fixtures";
import { MeasureDateDatasets, queryDateDatasetsForMeasure } from "../../queries";
import { measureItem } from "@gooddata/sdk-model";
import { ICatalogDateDataset } from "@gooddata/sdk-backend-spi";
import { loadDashboard } from "../../commands";
import { ReferenceLdm } from "@gooddata/reference-workspace";

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

            await Tester.dispatchAndWaitFor(loadDashboard(), "GDC.DASH/EVT.LOADED");

            const result: MeasureDateDatasets = await Tester.query(
                queryDateDatasetsForMeasure(measureItem(ReferenceLdm.Won)),
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

            await Tester.dispatchAndWaitFor(loadDashboard(), "GDC.DASH/EVT.LOADED");

            const result: MeasureDateDatasets = await Tester.query(
                queryDateDatasetsForMeasure(measureItem(ReferenceLdm.Won)),
            );

            expect(datasetsDigest(result.dateDatasetsOrdered)).toMatchSnapshot();
            expect(result.dateDatasetDisplayNames).toMatchSnapshot();
        });
    });
});
