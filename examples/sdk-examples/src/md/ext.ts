// (C) 2020 GoodData Corporation
import {
    modifyMeasure,
    newArithmeticMeasure,
    newMeasure,
    modifySimpleMeasure,
    modifyAttribute,
    newAttribute,
} from "@gooddata/sdk-model";
import { workspace } from "../constants/fixtures";
import * as Md from "./full";

/*
 * This file contains our custom extensions on top of the reference MD. Things such as arithmetic
 * measure definitions, PoP measure definitions and any custom yet reusable stuff that is useful
 * when testing.
 */

export const numberOfRestaurantsLocalId = "numberOfRestaurants";
export const averageRestaurantDailyCostsLocalId = "averageRestaurantDailyCosts";
export const totalCostsLocalId = "totalCosts";
export const totalSalesLocalId = "totalSales";
export const franchiseFeesAdRoyaltyLocalId = "franchiseFeesAdRoyalty";
export const franchiseFeesOngoingRoyaltyLocalId = "franchiseFeesOngoingRoyalty";
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
export const quarterDateLocalId = "quarter";
export const franchiseSalesComputeRatioLocalId = "franchiseSalesComputeRatio";
export const sumOfNumberLocalId = "a73e984d10e84156bcca68b5b70f0d2c";
export const nameAttributeLocalId = "e8e31d6083c44de9b9bcdd84def972f7";

// ===============================================================================================

export const averageRestaurantDailyCostsIdentifier = "aaQJzQzoeKwZ";
export const EmployeeNameIdentifier = "label.employee.employeename";
export const totalSalesIdentifier = "aa7ulGyKhIE5";
export const franchiseFeesTag = "franchise_fees";
export const yearDateDataSetAttributeIdentifier = "date.year";
export const totalSalesLocalIdentifier = "c11c27a0b0314a83bfe5b64ab9de7b89";
export const sumOfNumberIdentifier = "fact.csv_4dates.number";
export const nameAttributeIdentifier = "label.csv_4dates.name";

// ===============================================================================================

export const numberOfChecks = modifyMeasure(Md.NrChecks, (m) =>
    m.localId("numOfChecks").format("#,##0").alias("# Checks").title("Number of Checks"),
);
export const FranchiseFees = modifyMeasure(Md.$FranchiseFees, (m) =>
    m.format("#,##0").localId(franchiseFeesLocalId).title("Franchise Fees"),
);
export const franchiseFeesAsPercents = modifySimpleMeasure(FranchiseFees, (m) =>
    m.title("Franchise Fees shown in %").ratio(),
);
export const FranchisedSales = modifyMeasure(Md.$FranchisedSales, (m) =>
    m.format("#,##0").title("Franchise Sales").localId(franchiseSalesLocalId),
);
export const FranchisedSalesAsPercent = modifyMeasure(Md.$FranchisedSales, (m) =>
    m.format("#,##0%").title("Franchise Sales").localId(franchiseSalesAsPercentageLocalId),
);
export const FranchisedSalesWithRatio = modifySimpleMeasure(FranchisedSales, (m) =>
    m
        .format("#,##0.00%")
        .localId(franchiseSalesComputeRatioLocalId)
        .title("Franchise Sales shown in %")
        .ratio(),
);
export const FranchiseFeesAdRoyalty = modifyMeasure(Md.$FranchiseFeesAdRoyalty, (m) =>
    m.format("#,##0").localId(franchiseFeesAdRoyaltyLocalId),
);
export const FranchiseFeesInitialFranchiseFee = modifyMeasure(Md.$FranchiseFeesInitialFranchiseFee, (m) =>
    m.format("#,##0").localId(franchiseFeesInitialFranchiseFeeLocalId),
);
export const FranchiseFeesOngoingRoyalty = modifyMeasure(Md.$FranchiseFeesOngoingRoyalty, (m) =>
    m.format("#,##0").localId(franchiseFeesOngoingRoyaltyLocalId),
);
export const franchiseFeesMeasures = [
    Md.$FranchiseFees,
    Md.$FranchiseFeesAdRoyalty,
    Md.$FranchiseFeesInitialFranchiseFee,
    Md.$FranchiseFeesOngoingRoyalty,
].map((measure) =>
    modifySimpleMeasure(measure, (m) => m.aggregation("sum").localId(measure.measure.localIdentifier)),
);

export const TotalSales1 = modifyMeasure(Md.$TotalSales, (m) => m.format("#,##0").alias("$ Total Sales"));
export const TotalSales2 = modifyMeasure(Md.$TotalSales, (m) =>
    m.format("#,##0").alias("$ Total Sales").title("Total Sales").localId(totalSalesLocalId),
);
export const TotalSales3 = modifySimpleMeasure(Md.$TotalSales, (m) =>
    m.aggregation("sum").localId(totalSalesLocalId),
);
export const TotalCosts = modifyMeasure(Md.$TotalCosts, (m) =>
    m.format("#,##0").alias("$ Total Costs").localId(totalCostsLocalId),
);

export const EmployeeName = modifyAttribute(Md.EmployeeName.Default, (a) => a.localId(EmployeeNameLocalId));
export const LocationName = modifyAttribute(Md.LocationName.Default, (a) => a.localId(LocationNameLocalId));
export const LocationResort = modifyAttribute(Md.LocationResort, (a) => a.localId(LocationNameLocalId));
export const MenuCategory = modifyAttribute(Md.MenuCategory, (a) => a.localId(MenuCategoryLocalId));
export const LocationState = modifyAttribute(Md.LocationState, (a) => a.localId(LocationStateLocalId));
export const LocationCity = modifyAttribute(Md.LocationCity, (a) => a.localId(LocationCityLocalId));
export const monthDate = modifyAttribute(Md.DateDatasets.Date.Month.Short, (a) =>
    a.alias("Month").localId(monthDateLocalId),
);
export const quarterDate = modifyAttribute(Md.DateDatasets.Date.Quarter.Default, (a) =>
    a.localId(quarterDateLocalId),
);
export const MenuItemName = modifyAttribute(Md.MenuItemName, (a) => a.alias("Menu Item name"));
export const AvgDailyTotalSales = modifyMeasure(Md.$AvgDailyTotalSales, (m) =>
    m.alias("$ Avg Daily Total Sales").format("$#,##0").localId(averageDailyTotalSalesLocalId),
);
export const AvgCheckSizeByServer = modifyMeasure(Md.AvgCheckSizeByServer, (m) =>
    m.alias("$ Avg Check Size By Server").format("$#,##0"),
);
export const NrRestaurants = modifyMeasure(Md.NrRestaurants, (m) =>
    m.format("#,##0").localId(numberOfRestaurantsLocalId),
);

export const arithmeticMeasure = newArithmeticMeasure(
    [totalSalesLocalId, numberOfRestaurantsLocalId],
    "ratio",
    (m) => m.format("#,##0").title("$ Avg Restaurant Sales"),
);

export const averageRestaurantDailyCosts = newMeasure(averageRestaurantDailyCostsIdentifier, (m) =>
    m.format("#,##0").localId(averageRestaurantDailyCostsLocalId),
);

export const sumOfNumber = newMeasure(sumOfNumberIdentifier, (m) =>
    m.aggregation("sum").localId(sumOfNumberLocalId).alias("Sum of Number"),
);

export const nameAttribute = newAttribute(nameAttributeIdentifier, (a) => a.localId(nameAttributeLocalId));

// ===============================================================================================

export const locationStateAttributeUri = `/gdc/md/${workspace}/obj/2210`;
export const locationStateAttributeCaliforniaUri = `/gdc/md/${workspace}/obj/2210/elements?id=6340116`;
export const monthDateJanuaryUri = `/gdc/md/${workspace}/obj/2071/elements?id=1`;
export const dateDataSetUri = `/gdc/md/${workspace}/obj/2180`;
export const locationNameAttributeUri = `/gdc/md/${workspace}/obj/2204`;
export const locationResortUri = `/gdc/md/${workspace}/obj/2206`;
export const tableInsightViewUri = `/gdc/md/${workspace}/obj/8702`;
export const employeeNameDisplayFormUri = `/gdc/md/${workspace}/obj/2201`;

// ===============================================================================================

export const locationStateAttributeIdentifier = "attr.restaurantlocation.locationstate";
export const locationIdAttributeIdentifier = "attr.restaurantlocation.locationid";
export const locationCityAttributeIdentifier = "attr.restaurantlocation.locationcity";
