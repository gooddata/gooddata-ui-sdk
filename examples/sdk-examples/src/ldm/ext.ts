// (C) 2020 GoodData Corporation
import {
    modifyMeasure,
    newArithmeticMeasure,
    newMeasure,
    modifySimpleMeasure,
    modifyAttribute,
} from "@gooddata/sdk-model";
import { workspace } from "../constants/fixtures";
import * as Ldm from "./full";

/*
 * This file contains our custom extensions on top of the reference LDM. Things such as arithmetic
 * measure definitions, PoP measure definitions and any custom yet reusable stuff that is useful
 * when testing.
 */

export const numberOfRestaurantsLocalId = "numberOfRestaurants";
export const averageRestaurantDailyCostsLocalId = "averageRestaurantDailyCosts";
export const averageStateDailyCostsLocalId = "averageStateDailyCosts";
export const totalCostsLocalId = "totalCosts";
export const totalSalesLocalId = "totalSales";
export const averageRestaurantSalesLocalId = "averageRestaurantSales";
export const franchiseFeesAdRoyaltyLocalId = "franchiseFeesAdRoyalty";
export const franchiseFeesOngoingRoyaltyLocalId = "franchiseFeesOngoingRoyalty";
export const franchiseFeesSumLocalId = "franchiseFeesSum";
export const franchiseFeesDifferenceLocalId = "franchiseFeesDifference";
export const franchiseFeesLocalId = "franchiseFees";
export const franchiseSalesLocalId = "franchiseSales";
export const franchiseSalesAsPercentageLocalId = "franchiseSalesFormattedAsPercentage";
export const franchiseFeesInitialFranchiseFeeLocalId = "franchiseFeesInitialFranchiseFee";
export const monthDateLocalId = "monthDate";
export const averageDailyTotalSalesLocalId = "averageDailyTotalSales";
export const EmployeeNameLocalId = "employeeName";
export const LocationNameLocalId = "locationName";
export const LocationResortLocalId = "a1";
export const MenuCategoryLocalId = "menu";
export const LocationStateLocalId = "locationState";
export const LocationCityLocalId = "locationCity";
export const quaterDateLocalId = "quarter";
export const franchiseSalesComputeRatioLocalId = "franchiseSalesComputeRatio";

// ===============================================================================================

export const averageRestaurantDailyCostsIdentifier = "aaQJzQzoeKwZ";
export const totalSalesIdentifier = "aa7ulGyKhIE5";
export const dateDatasetIdentifier = "date.dataset.dt";
export const franchiseFeesTag = "franchise_fees";
export const yearDateDataSetAttributeIdentifier = "date.year";
export const totalSalesLocalIdentifier = "c11c27a0b0314a83bfe5b64ab9de7b89";

// ===============================================================================================

export const numberOfChecks = modifyMeasure(Ldm.NrChecks, m =>
    m
        .localId("numOfChecks")
        .format("#,##0")
        .alias("# Checks")
        .title("Number of Checks"),
);
export const FranchiseFees = modifyMeasure(Ldm.$FranchiseFees, m =>
    m
        .format("#,##0")
        .localId(franchiseFeesLocalId)
        .title("Franchise Fees"),
);
export const franchiseFeesAsPercents = modifySimpleMeasure(FranchiseFees, m =>
    m.title("Franchise Fees shown in %").ratio(),
);
export const FranchisedSales = modifyMeasure(Ldm.$FranchisedSales, m =>
    m
        .format("#,##0")
        .title("Franchise Sales")
        .localId(franchiseSalesLocalId),
);
export const FranchisedSalesAsPercent = modifyMeasure(Ldm.$FranchisedSales, m =>
    m
        .format("#,##0%")
        .title("Franchise Sales")
        .localId(franchiseSalesAsPercentageLocalId),
);
export const FranchisedSalesWithRatio = modifySimpleMeasure(FranchisedSales, m =>
    m
        .format("#,##0.00%")
        .localId(franchiseSalesComputeRatioLocalId)
        .title("Franchise Sales shown in %")
        .ratio(),
);
export const FranchiseFeesAdRoyalty = modifyMeasure(Ldm.$FranchiseFeesAdRoyalty, m =>
    m.format("#,##0").localId(franchiseFeesAdRoyaltyLocalId),
);
export const FranchiseFeesInitialFranchiseFee = modifyMeasure(Ldm.$FranchiseFeesInitialFranchiseFee, m =>
    m.format("#,##0").localId(franchiseFeesInitialFranchiseFeeLocalId),
);
export const FranchiseFeesOngoingRoyalty = modifyMeasure(Ldm.$FranchiseFeesOngoingRoyalty, m =>
    m.format("#,##0").localId(franchiseFeesOngoingRoyaltyLocalId),
);
export const franchiseFeesMeasures = [
    Ldm.$FranchiseFees,
    Ldm.$FranchiseFeesAdRoyalty,
    Ldm.$FranchiseFeesInitialFranchiseFee,
    Ldm.$FranchiseFeesOngoingRoyalty,
].map(measure =>
    modifySimpleMeasure(measure, m => m.aggregation("sum").localId(measure.measure.localIdentifier)),
);

export const TotalSales1 = modifyMeasure(Ldm.$TotalSales, m => m.format("#,##0").alias("$ Total Sales"));
export const TotalSales2 = modifyMeasure(Ldm.$TotalSales, m =>
    m
        .format("#,##0")
        .alias("$ Total Sales")
        .title("Total Sales")
        .localId(totalSalesLocalId),
);
export const TotalSales3 = modifySimpleMeasure(Ldm.$TotalSales, m =>
    m.aggregation("sum").localId(totalSalesLocalId),
);
export const TotalCosts = modifyMeasure(Ldm.$TotalCosts, m =>
    m
        .format("#,##0")
        .alias("$ Total Costs")
        .localId(totalCostsLocalId),
);

export const EmployeeName = modifyAttribute(Ldm.EmployeeName.Default, a => a.localId(EmployeeNameLocalId));
export const LocationName = modifyAttribute(Ldm.LocationName.Default, a => a.localId(LocationNameLocalId));
export const LocationResort = modifyAttribute(Ldm.LocationResort, a => a.localId(LocationNameLocalId));
export const MenuCategory = modifyAttribute(Ldm.MenuCategory, a => a.localId(MenuCategoryLocalId));
export const LocationState = modifyAttribute(Ldm.LocationState, a => a.localId(LocationStateLocalId));
export const LocationCity = modifyAttribute(Ldm.LocationCity, a => a.localId(LocationCityLocalId));
export const monthDate = modifyAttribute(Ldm.DateMonth.Short, a =>
    a.alias("Month").localId(monthDateLocalId),
);
export const quaterDate = modifyAttribute(Ldm.DateQuarter, a => a.localId(quaterDateLocalId));
export const MenuItemName = modifyAttribute(Ldm.MenuItemName, a => a.alias("Menu Item name"));
export const AvgDailyTotalSales = modifyMeasure(Ldm.$AvgDailyTotalSales, m =>
    m
        .alias("$ Avg Daily Total Sales")
        .format("$#,##0")
        .localId(averageDailyTotalSalesLocalId),
);
export const AvgCheckSizeByServer = modifyMeasure(Ldm.AvgCheckSizeByServer, m =>
    m.alias("$ Avg Check Size By Server").format("$#,##0"),
);
export const NrRestaurants = modifyMeasure(Ldm.NrRestaurants, m =>
    m.format("#,##0").localId(numberOfRestaurantsLocalId),
);

export const arithmeticMeasure1 = newArithmeticMeasure(
    [totalSalesLocalId, numberOfRestaurantsLocalId],
    "ratio",
    m => m.format("#,##0").title("$ Avg Restaurant Sales"),
);
export const arithmeticMeasure2 = newArithmeticMeasure(
    [numberOfRestaurantsLocalId, averageRestaurantDailyCostsLocalId],
    "multiplication",
    m =>
        m
            .format("#,##0")
            .title("$ Avg State Daily Costs")
            .localId(averageStateDailyCostsLocalId),
);
export const arithmeticMeasure3 = newArithmeticMeasure(
    [numberOfRestaurantsLocalId, totalSalesLocalId],
    "ratio",
    m =>
        m
            .format("#,##0")
            .title("$ Avg State Daily Sales")
            .localId(averageRestaurantSalesLocalId),
);
export const arithmeticMeasure4 = newArithmeticMeasure(
    [franchiseFeesOngoingRoyaltyLocalId, franchiseFeesAdRoyaltyLocalId],
    "sum",
    m =>
        m
            .format("#,##0")
            .title("$ Ongoing / Ad Royalty Sum")
            .localId(franchiseFeesSumLocalId),
);
export const arithmeticMeasure5 = newArithmeticMeasure(
    [franchiseFeesOngoingRoyaltyLocalId, franchiseFeesAdRoyaltyLocalId],
    "difference",
    m =>
        m
            .format("#,##0")
            .title("$ Ongoing / Ad Royalty Difference")
            .localId(franchiseFeesDifferenceLocalId),
);
export const arithmeticMeasure6 = newArithmeticMeasure([FranchisedSales, FranchiseFees], "change", m =>
    m
        .localId("franchiseFeesFormattedAsPercentage")
        .title("Change formatted as %")
        .format("#,##0%"),
);
export const averageRestaurantDailyCosts = newMeasure(averageRestaurantDailyCostsIdentifier, m =>
    m.format("#,##0").localId(averageRestaurantDailyCostsLocalId),
);

// ===============================================================================================

export const locationStateAttributeUri = `/gdc/md/${workspace}/obj/2210`;
export const locationStateAttributeCaliforniaUri = `/gdc/md/${workspace}/obj/2210/elements?id=6340116`;
export const monthDateIdentifierJanuary = `/gdc/md/${workspace}/obj/2071/elements?id=1`;
export const dateDataSetUri = `/gdc/md/${workspace}/obj/2180`;
export const locationNameAttributeUri = `/gdc/md/${workspace}/obj/2204`;
export const locationResortUri = `/gdc/md/${workspace}/obj/2206`;
export const tableInsightViewUri = `/gdc/md/${workspace}/obj/8702`;

// ===============================================================================================

export const locationStateAttributeIdentifier = "attr.restaurantlocation.locationstate";
export const locationIdAttributeIdentifier = "attr.restaurantlocation.locationid";
export const locationCityAttributeIdentifier = "attr.restaurantlocation.locationcity";
