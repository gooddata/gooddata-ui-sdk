// (C) 2007-2020 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import { loginUserAndNavigate } from "./utils/helpers";

fixture("Sorting").beforeEach(loginUserAndNavigate(`${config.url}/sorting`));
test("should display sorted graphs", async (t) => {
    const measureSortingAxisLabels = Selector(".s-measure-sorting .highcharts-xaxis-labels");
    const attributeSortingAxisLabels = Selector(".s-attribute-sorting .highcharts-xaxis-labels");

    const dynamicSortingChartXAxisLabels = Selector(".s-dynamic-sorting-chart .highcharts-xaxis-labels");
    const dynamicSortingChartLegendLabels = Selector(".s-dynamic-sorting-chart .viz-legend");

    const dynamicSortingDefault = Selector(".s-dynamic-sorting .s-default");
    const dynamicSortingState = Selector(".s-dynamic-sorting .s-state");
    const dynamicSortingDate = Selector(".s-dynamic-sorting .s-date");
    const dynamicSortingSumOfColumn = Selector(".s-dynamic-sorting .s-sum-of-column");
    const dynamicSortingSumOfStacks = Selector(".s-dynamic-sorting .s-sum-of-stacks");
    const dynamicSortingStateElement = Selector(".s-dynamic-sorting .s-state-element");
    const dynamicSortingDateElement = Selector(".s-dynamic-sorting .s-date-element");
    const dynamicSortingMulti = Selector(".s-dynamic-sorting .s-multi");

    const dynamicSortingAscending = Selector(".s-dynamic-sorting .s-ascending");
    const dynamicSortingDescending = Selector(".s-dynamic-sorting .s-descending");

    await t
        // measure sorting
        .expect(measureSortingAxisLabels.textContent)
        .eql("JanAprJunJulSepFebNovOctMarMayAugDec")

        // attribute sorting
        .expect(attributeSortingAxisLabels.textContent)
        .eql(
            "Times SquareSan JoseNew YorkMontgomeryIrvingHighland VillageHaywardDeerfield BeachDaly CityDallasAventura",
        )

        // click to scroll to chart
        .click(dynamicSortingChartXAxisLabels)

        // dynamic default sorting is preselected
        .expect(dynamicSortingChartXAxisLabels.textContent)
        .eql("JanFebMarAprMayJunJulAugSepOctNovDec")
        .expect(dynamicSortingChartLegendLabels.textContent)
        .eql("AlabamaCaliforniaFloridaNew YorkTexas")

        // dynamic state sorting
        .click(dynamicSortingDescending)
        .click(dynamicSortingState)
        .expect(dynamicSortingChartLegendLabels.textContent)
        .eql("TexasNew YorkFloridaCaliforniaAlabama")

        // dynamic date sorting
        .click(dynamicSortingDate)
        .expect(dynamicSortingChartXAxisLabels.textContent)
        .eql("DecNovOctSepAugJulJunMayAprMarFebJan")

        // dynamic sum of column sorting
        .click(dynamicSortingSumOfColumn)
        .expect(dynamicSortingChartXAxisLabels.textContent)
        .eql("JanAprJunJulSepFebNovOctMarMayAugDec")

        // dynamic sum of stacks sorting
        .click(dynamicSortingSumOfStacks)
        .expect(dynamicSortingChartLegendLabels.textContent)
        .eql("CaliforniaAlabamaFloridaNew YorkTexas")

        // dynamic state element sorting
        .click(dynamicSortingStateElement)
        .expect(dynamicSortingChartXAxisLabels.textContent)
        .eql("JanAprJunJulSepFebNovOctMarMayAugDec")

        // dynamic date element sorting
        .click(dynamicSortingDateElement)
        .click(dynamicSortingAscending)
        .expect(dynamicSortingChartLegendLabels.textContent)
        .eql("TexasNew YorkFloridaAlabamaCalifornia")

        // dynamic multi sorting
        .click(dynamicSortingMulti)
        .expect(dynamicSortingChartXAxisLabels.textContent)
        .eql("DecAugMayMarOctNovFebSepJulJunAprJan")
        .expect(dynamicSortingChartLegendLabels.textContent)
        .eql("CaliforniaAlabamaFloridaNew YorkTexas")

        // dynamic default sorting
        .click(dynamicSortingDefault)
        .expect(dynamicSortingChartXAxisLabels.textContent)
        .eql("JanFebMarAprMayJunJulAugSepOctNovDec");
});
