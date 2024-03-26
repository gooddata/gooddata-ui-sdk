// (C) 2007-2024 GoodData Corporation
import { ReferenceMd, ReferenceData, ReferenceMdExt } from "@gooddata/reference-workspace";
import { newAttributeSort, newMeasureSort, newPositiveAttributeFilter } from "@gooddata/sdk-model";
import { BarChart, IBarChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const BarChartWithSingleMeasureAndViewBy = {
    measures: [ReferenceMd.Amount],
    viewBy: [ReferenceMd.Product.Name],
};

export const BarChartWithSingleMeasureViewByAndStackBy = {
    measures: [ReferenceMd.Amount],
    viewBy: [ReferenceMd.Product.Name],
    stackBy: ReferenceMd.Region.Default,
};

export const BarChartWithTwoMeasuresAndViewBy = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won],
    viewBy: [ReferenceMd.Product.Name],
};

export const BarChartWithTwoMeasuresAndTwoViewBy = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won],
    viewBy: [ReferenceMd.Product.Name, ReferenceMd.Region.Default],
};

export const BarChartWithTwoMeasuresAndTwoViewByFiltered = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won],
    viewBy: [ReferenceMd.Product.Name, ReferenceMd.Region.Default],
    filters: [
        newPositiveAttributeFilter(ReferenceMd.Product.Name, ["WonderKid"]),
        newPositiveAttributeFilter(ReferenceMd.Region.Default, ["East Coast"]),
    ],
};

export const BarChartWithSingleMeasureAndViewByAndStackMultipleItems = {
    measures: [ReferenceMd.Amount],
    viewBy: [ReferenceMd.Region.Default],
    stackBy: ReferenceMd.Product.Name,
};

export const BarChartWithSingleMeasureAndTwoViewByAndStack = {
    measures: [ReferenceMd.Amount],
    viewBy: [ReferenceMd.Product.Name, ReferenceMd.Region.Default],
    stackBy: ReferenceMd.Department.Default,
};

/*
const arrayOfAccountValues = [
    "14 West",
    "1Source International",
    "1st Choice Staffing & Consulting",
    "1st in Video - Music World",
    "2 Wheel Bikes",
    "2HB Software Designs",
    "352 Media Group",
    "3Degrees",
    "3E",
    "3balls.com",
    "3dCart Shopping Cart Software",
    "49er Communications",
    "4Wall Entertainment",
    "4th Source",
    "5LINX Enterprises",
    "614 Media Group",
    "6K Systems",
    "7 Medical Systems",
    "7 Simple Machines",
    "7-Eleven",
    "720 Strategies",
    "90octane",
    "919 Marketing",
    "@properties",
    "A Main Hobbies",
    "A Place for Mom",
    "A Squared Group",
    "A White Orchid Wedding",
    "A&C Plastics",
    "A&P Consulting Transportation Engineers",
    "A&R Tarpaulins",
    "A+ Mortgage Services",
    "A+ Tutor U",
    "A-1 Textiles",
    "A-Life Medical",
    "A-T Solutions",
    "A. Pomerantz & Co.",
    "A.B. Data",
    "A.R.M. Solutions",
    "A1 Pool Parts",
    "A10 Clinical Solutions",
    "A10 Networks",
    "AAC Enterprises",
    "AArrow Advertising",
    "ABBTech Staffing Services",
    "ABC Security Service",
    "ABCOMRents.com",
    "AC Lens",
    "ACAI Associates",
    "ACFN Franchised",
    "ACTS",
    "ADC Integrated Systems",
    "ADEX Manufacturing Technologies",
    "ADG Creative",
    "AEEC",
    "AEgis Technologies Group",
    "AGM Container Controls",
    "AIMS Power",
    "AIRSIS",
    "AIReS",
    "AIT Laboratories",
    "AJ Riggins",
    "AK Environmental",
    "AKA Media",
    "AKASHA-US",
    "AKT Enterprises",
    "ALaS Consulting",
    "AMC Entertainment",
    "ANDA Networks",
    "AOD Software",
    "APCO Worldwide",
    "APEXteriors",
    "APG",
    "APT Research",
    "AQIWO",
    "ARES",
    "ARGI Financial Group",
    "ARHD",
    "ARK Solutions",
    "ARRC Technology",
    "ASAP",
];*/

const arrayOfAccountUris = [
    ReferenceData.Name.AddVentures.uri,
    ReferenceData.Name.Blank.uri,
    ReferenceData.Name.MtMediaTemple.uri,
    ReferenceData.Name.Decimal.uri,
    ReferenceData.Name.$1SourceConsulting.uri,
    ReferenceData.Name.$1800Postcards.uri,
    ReferenceData.Name.$1800WeAnswer.uri,
    ReferenceData.Name.$1888OhioComp.uri,
    ReferenceData.Name.$1000BulbsCom.uri,
    ReferenceData.Name.$101Financial.uri,
    ReferenceData.Name.$123Exteriors.uri,
    ReferenceData.Name.$14West.uri,
    ReferenceData.Name.$1SourceInternational.uri,
    ReferenceData.Name.$1stChoiceStaffingAndConsulting.uri,
    ReferenceData.Name.$1stInVideoMusicWorld.uri,
    ReferenceData.Name.$2WheelBikes.uri,
    ReferenceData.Name.$2HBSoftwareDesigns.uri,
    ReferenceData.Name.$352MediaGroup.uri,
    ReferenceData.Name.$3Degrees.uri,
    ReferenceData.Name.$3E.uri,
    ReferenceData.Name.$3ballsCom.uri,
    ReferenceData.Name.$3dCartShoppingCartSoftware.uri,
    ReferenceData.Name.$49erCommunications.uri,
    ReferenceData.Name.$4WallEntertainment.uri,
    ReferenceData.Name.$4thSource.uri,
    ReferenceData.Name.$5LINXEnterprises.uri,
    ReferenceData.Name.$614MediaGroup.uri,
    ReferenceData.Name.$6KSystems.uri,
    ReferenceData.Name.$7MedicalSystems.uri,
    ReferenceData.Name.$7SimpleMachines.uri,
    ReferenceData.Name.$7Eleven.uri,
    ReferenceData.Name.$720Strategies.uri,
    ReferenceData.Name.$90octane.uri,
    ReferenceData.Name.$919Marketing.uri,
    ReferenceData.Name.Properties.uri,
    ReferenceData.Name.AMainHobbies.uri,
    ReferenceData.Name.APlaceForMom.uri,
    ReferenceData.Name.ASquaredGroup.uri,
    ReferenceData.Name.AWhiteOrchidWedding.uri,
    ReferenceData.Name.AAndCPlastics.uri,
    ReferenceData.Name.AAndPConsultingTransportationEngineers.uri,
    ReferenceData.Name.AAndRTarpaulins.uri,
    ReferenceData.Name.AMortgageServices.uri,
    ReferenceData.Name.ATutorU.uri,
    ReferenceData.Name.A1Textiles.uri,
    ReferenceData.Name.ALifeMedical.uri,
    ReferenceData.Name.ATSolutions.uri,
    ReferenceData.Name.APomerantzAndCo.uri,
    ReferenceData.Name.ABData.uri,
    ReferenceData.Name.ARMSolutions.uri,
];

export const BarChartWithLargeLegend = {
    measures: [ReferenceMd.Amount],
    stackBy: ReferenceMd.Account.Name,
    filters: [newPositiveAttributeFilter(ReferenceMd.Account.Name, { uris: arrayOfAccountUris })],
};

export const BarChartWithArithmeticMeasuresAndViewBy = {
    measures: [
        ReferenceMd.Amount,
        ReferenceMd.Won,
        ReferenceMdExt.CalculatedLost,
        ReferenceMdExt.CalculatedWonLostRatio,
    ],
    viewBy: [ReferenceMd.Product.Name],
};

export const BarChartViewByDateAndPop = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won, ReferenceMdExt.WonPopClosedYear],
    viewBy: [ReferenceMd.DateDatasets.Closed.ClosedYear.Default],
};

export const BarChartViewByTwoDates = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won, ReferenceMdExt.WonPopClosedYear],
    viewBy: [ReferenceMd.DateDatasets.Closed.ClosedYear.Default, ReferenceMdExt.ModifiedClosedYear],
};

export const BarChartStackByDate = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won, ReferenceMdExt.WonPopClosedYear],
    stackBy: ReferenceMd.DateDatasets.Closed.ClosedYear.Default,
};

export default scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .addScenario("single measure", {
        measures: [ReferenceMd.Amount],
    })
    .addScenario("single measure with viewBy", BarChartWithSingleMeasureAndViewBy)
    .addScenario("single measure with viewBy and stackBy", BarChartWithSingleMeasureViewByAndStackBy)
    .addScenario("single measure with two viewBy and stack", BarChartWithSingleMeasureAndTwoViewByAndStack)
    .addScenario("two measures with viewBy", BarChartWithTwoMeasuresAndViewBy)
    .addScenario("two measures with two viewBy", BarChartWithTwoMeasuresAndTwoViewBy)
    .addScenario(
        "two measures with two viewBy, filtered to single value",
        BarChartWithTwoMeasuresAndTwoViewByFiltered,
    )
    .addScenario("two measures with viewBy sorted by attribute", {
        measures: [ReferenceMd.Amount, ReferenceMd.Won],
        viewBy: [ReferenceMd.Product.Name],
        sortBy: [newAttributeSort(ReferenceMd.Product.Name, "desc")],
    })
    .addScenario("two measures with viewBy sorted by measure", {
        measures: [ReferenceMd.Amount, ReferenceMd.Won],
        viewBy: [ReferenceMd.Product.Name],
        sortBy: [newMeasureSort(ReferenceMd.Won, "asc")],
    })
    .addScenario("viewBy date and PoP measure", BarChartViewByDateAndPop)
    .addScenario("arithmetic measures", BarChartWithArithmeticMeasuresAndViewBy)
    .addScenario("four measures and PoP", {
        measures: [
            ReferenceMd.Amount,
            ReferenceMd.Won,
            ReferenceMdExt.WonPopClosedYear,
            ReferenceMdExt.CalculatedLost,
            ReferenceMdExt.CalculatedWonLostRatio,
        ],
        viewBy: [ReferenceMd.DateDatasets.Closed.ClosedYear.Default],
    })
    .addScenario("viewBy with two dates", BarChartViewByTwoDates)
    .addScenario("stackBy with one date", BarChartStackByDate);
