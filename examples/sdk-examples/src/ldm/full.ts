// (C) 2020 GoodData Corporation
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable header/header */
/* THIS FILE WAS AUTO-GENERATED USING CATALOG EXPORTER; YOU SHOULD NOT EDIT THIS FILE; GENERATE TIME: 2020-04-30T12:04:51.660Z; */
import { newAttribute, newMeasure, IAttribute, IMeasure, IMeasureDefinition } from "@gooddata/sdk-model";

export const City = {
    /**
     * Display Form Title: city
     * Display Form ID: label.uscities.city
     */
    Default: newAttribute("label.uscities.city"),
    /**
     * Display Form Title: location
     * Display Form ID: label.uscities.city.location
     */ Location: newAttribute("label.uscities.city.location"),
};
/**
 * Attribute Title: Cost Type
 * Display Form ID: attr.restaurantcostsfact.costtype
 */
export const CostType: IAttribute = newAttribute("label.restaurantcostsfact.costtype");
/**
 * Attribute Title: Employee Id
 * Display Form ID: attr.employee.employeeid
 */
export const EmployeeId: IAttribute = newAttribute("label.employee.employeeid");
export const EmployeeName = {
    /**
     * Display Form Title: Employee Name
     * Display Form ID: label.employee.employeename
     */
    Default: newAttribute("label.employee.employeename"),
    /**
     * Display Form Title: Employee URL
     * Display Form ID: label.employee.employeename.employeeurl
     */ EmployeeURL: newAttribute("label.employee.employeename.employeeurl"),
};
/**
 * Attribute Title: Is Kids Item?
 * Display Form ID: attr.menuitem.iskidsitem
 */
export const IsKidsItem: IAttribute = newAttribute("label.menuitem.iskidsitem");
/**
 * Attribute Title: Line Item Id
 * Display Form ID: attr.salesdetailfact.lineitemid
 */
export const LineItemId: IAttribute = newAttribute("label.salesdetailfact.lineitemid");
/**
 * Attribute Title: Location City
 * Display Form ID: attr.restaurantlocation.locationcity
 */
export const LocationCity: IAttribute = newAttribute("label.restaurantlocation.locationcity");
/**
 * Attribute Title: Location Country
 * Display Form ID: attr.restaurantlocation.locationcountry
 */
export const LocationCountry: IAttribute = newAttribute("label.restaurantlocation.locationcountry");
/**
 * Attribute Title: Location Id
 * Display Form ID: attr.restaurantlocation.locationid
 */
export const LocationId: IAttribute = newAttribute("label.restaurantlocation.locationid");
export const LocationName = {
    /**
     * Display Form Title: Location Name
     * Display Form ID: label.restaurantlocation.locationname
     */
    Default: newAttribute("label.restaurantlocation.locationname"),
    /**
     * Display Form Title: Location URL
     * Display Form ID: label.restaurantlocation.locationname.locationurl
     */ LocationURL: newAttribute("label.restaurantlocation.locationname.locationurl"),
};
/**
 * Attribute Title: Location Ownership
 * Display Form ID: attr.restaurantlocation.locationownership
 */
export const LocationOwnership: IAttribute = newAttribute("label.restaurantlocation.locationownership");
/**
 * Attribute Title: Location Resort
 * Display Form ID: attr.restaurantlocation.locationresort
 */
export const LocationResort: IAttribute = newAttribute("label.restaurantlocation.locationresort");
/**
 * Attribute Title: Location State
 * Display Form ID: attr.restaurantlocation.locationstate
 */
export const LocationState: IAttribute = newAttribute("label.restaurantlocation.locationstate");
/**
 * Attribute Title: Menu Category
 * Display Form ID: attr.menuitem.menucategory
 */
export const MenuCategory: IAttribute = newAttribute("label.menuitem.menucategory");
/**
 * Attribute Title: Menu Item Id
 * Display Form ID: attr.menuitem.menuitemid
 */
export const MenuItemId: IAttribute = newAttribute("label.menuitem.menuitemid");
/**
 * Attribute Title: Menu Item Name
 * Display Form ID: attr.menuitem.menuitemname
 */
export const MenuItemName: IAttribute = newAttribute("label.menuitem.menuitemname");
/**
 * Attribute Title: Restaurant Category
 * Display Form ID: attr.restaurantprofile.restaurantcategory
 */
export const RestaurantCategory: IAttribute = newAttribute("label.restaurantprofile.restaurantcategory");
/**
 * Attribute Title: State Name
 * Display Form ID: attr.uscities.state_name
 */
export const StateName: IAttribute = newAttribute("label.uscities.state_name");
/**
 * Attribute Title: Time Zone
 * Display Form ID: attr.uscities.timezone
 */
export const TimeZone: IAttribute = newAttribute("label.uscities.timezone");
/**
 * Attribute Title: Transaction Id
 * Display Form ID: attr.salesdetailfact.transactionid
 */
export const TransactionId: IAttribute = newAttribute("label.salesdetailfact.transactionid");
/**
 * Metric Title: _Filter Last 4 Quarter
 * Metric ID: aaIHiWZjfWNA
 * Metric Type: MAQL Metric
 */
export const FilterLast4Quarter: IMeasure<IMeasureDefinition> = newMeasure("aaIHiWZjfWNA");
/**
 * Metric Title: _Filter Quarter
 * Metric ID: aaiF4bffe4yn
 * Metric Type: MAQL Metric
 */
export const FilterQuarter: IMeasure<IMeasureDefinition> = newMeasure("aaiF4bffe4yn");
/**
 * Metric Title: _TIMELINE Q
 * Metric ID: aaJF1ktqc10F
 * Metric Type: MAQL Metric
 */
export const TIMELINEQ: IMeasure<IMeasureDefinition> = newMeasure("aaJF1ktqc10F");
/**
 * Metric Title: [AVG] Same Store Sales Growth MoM
 * Metric ID: aasApLbucFp0
 * Metric Type: MAQL Metric
 */
export const AVGSameStoreSalesGrowthMoM: IMeasure<IMeasureDefinition> = newMeasure("aasApLbucFp0");
/**
 * Metric Title: # Checks
 * Metric ID: aeOt50ngicOD
 * Metric Type: MAQL Metric
 */
export const NrChecks: IMeasure<IMeasureDefinition> = newMeasure("aeOt50ngicOD");
/**
 * Metric Title: # Employees
 * Metric ID: aaTJSTfSaRBg
 * Metric Type: MAQL Metric
 */
export const NrEmployees: IMeasure<IMeasureDefinition> = newMeasure("aaTJSTfSaRBg");
/**
 * Metric Title: # Franchise Locations
 * Metric ID: ackJFayteCFG
 * Metric Type: MAQL Metric
 */
export const NrFranchiseLocations: IMeasure<IMeasureDefinition> = newMeasure("ackJFayteCFG");
/**
 * Metric Title: # Items on Check
 * Metric ID: adFurWGrd2H8
 * Metric Type: MAQL Metric
 */
export const NrItemsOnCheck: IMeasure<IMeasureDefinition> = newMeasure("adFurWGrd2H8");
/**
 * Metric Title: # Location City
 * Metric ID: aafmUcxXd17M
 * Metric Type: MAQL Metric
 */
export const NrLocationCity: IMeasure<IMeasureDefinition> = newMeasure("aafmUcxXd17M");
/**
 * Metric Title: # Owned Locations
 * Metric ID: aaBJGIyWbxfO
 * Metric Type: MAQL Metric
 */
export const NrOwnedLocations: IMeasure<IMeasureDefinition> = newMeasure("aaBJGIyWbxfO");
/**
 * Metric Title: # Restaurants
 * Metric ID: aawAq8YqhM3o
 * Metric Type: MAQL Metric
 */
export const NrRestaurants: IMeasure<IMeasureDefinition> = newMeasure("aawAq8YqhM3o");
/**
 * Metric Title: % Change $ Avg Total Sales
 * Metric ID: afxBqOrPc5Zh
 * Metric Type: MAQL Metric
 */
export const PercentChange$AvgTotalSales: IMeasure<IMeasureDefinition> = newMeasure("afxBqOrPc5Zh");
/**
 * Metric Title: % Change $ Avg Total Sales by Server
 * Metric ID: acMCYQZbbwJg
 * Metric Type: MAQL Metric
 */
export const PercentChange$AvgTotalSalesByServer: IMeasure<IMeasureDefinition> = newMeasure("acMCYQZbbwJg");
/**
 * Metric Title: % of Entree on Total Check Size
 * Metric ID: aagurTlZd1Ul
 * Metric Type: MAQL Metric
 */
export const PercentOfEntreeOnTotalCheckSize: IMeasure<IMeasureDefinition> = newMeasure("aagurTlZd1Ul");
/**
 * Metric Title: $ Avg Check Size
 * Metric ID: agGujhRmcjQD
 * Metric Type: MAQL Metric
 */
export const $AvgCheckSize: IMeasure<IMeasureDefinition> = newMeasure("agGujhRmcjQD");
/**
 * Metric Title: $ Avg Daily Total Sales
 * Metric ID: aagJGHg1bxap
 * Metric Type: MAQL Metric
 */
export const $AvgDailyTotalSales: IMeasure<IMeasureDefinition> = newMeasure("aagJGHg1bxap");
/**
 * Metric Title: $ Avg Daily Total Sales by Server
 * Metric ID: aaAwXH5UfVBx
 * Metric Type: MAQL Metric
 */
export const $AvgDailyTotalSalesByServer: IMeasure<IMeasureDefinition> = newMeasure("aaAwXH5UfVBx");
/**
 * Metric Title: $ Avg Daily Total Sales by Server - For Previous
 * Metric ID: aeiCXq43bzcl
 * Metric Type: MAQL Metric
 */
export const $AvgDailyTotalSalesByServerForPrevious: IMeasure<IMeasureDefinition> = newMeasure(
    "aeiCXq43bzcl",
);
/**
 * Metric Title: $ Avg Restaurant Daily Total Sales
 * Metric ID: acEvQdUMiEAd
 * Metric Type: MAQL Metric
 */
export const $AvgRestaurantDailyTotalSales: IMeasure<IMeasureDefinition> = newMeasure("acEvQdUMiEAd");
/**
 * Metric Title: $ Avg Restaurant Daily Total Sales - For Previous
 * Metric ID: agbBoXF6haIe
 * Metric Type: MAQL Metric
 */
export const $AvgRestaurantDailyTotalSalesForPrevious: IMeasure<IMeasureDefinition> = newMeasure(
    "agbBoXF6haIe",
);
/**
 * Metric Title: $ Avg Total Sales by Restaurant
 * Metric ID: aaAHkMhRgp7S
 * Metric Type: MAQL Metric
 */
export const $AvgTotalSalesByRestaurant: IMeasure<IMeasureDefinition> = newMeasure("aaAHkMhRgp7S");
/**
 * Metric Title: $ Entree of Total Check Size
 * Metric ID: aavuqQNNaDdc
 * Metric Type: MAQL Metric
 */
export const $EntreeOfTotalCheckSize: IMeasure<IMeasureDefinition> = newMeasure("aavuqQNNaDdc");
/**
 * Metric Title: $ Franchise Fees
 * Metric ID: aaEGaXAEgB7U
 * Metric Type: MAQL Metric
 */
export const $FranchiseFees: IMeasure<IMeasureDefinition> = newMeasure("aaEGaXAEgB7U");
/**
 * Metric Title: $ Franchise Fees (Ad Royalty)
 * Metric ID: aabHeqImaK0d
 * Metric Type: MAQL Metric
 */
export const $FranchiseFeesAdRoyalty: IMeasure<IMeasureDefinition> = newMeasure("aabHeqImaK0d");
/**
 * Metric Title: $ Franchise Fees (Initial Fee) Last Quarter Timeline
 * Metric ID: aayHf60BfkfS
 * Metric Type: MAQL Metric
 */
export const $FranchiseFeesInitialFeeLastQuarterTimeline: IMeasure<IMeasureDefinition> = newMeasure(
    "aayHf60BfkfS",
);
/**
 * Metric Title: $ Franchise Fees (Initial Franchise Fee)
 * Metric ID: aaDHcv6wevkl
 * Metric Type: MAQL Metric
 */
export const $FranchiseFeesInitialFranchiseFee: IMeasure<IMeasureDefinition> = newMeasure("aaDHcv6wevkl");
/**
 * Metric Title: $ Franchise Fees (Ongoing Royalty)
 * Metric ID: aaWGcgnsfxIg
 * Metric Type: MAQL Metric
 */
export const $FranchiseFeesOngoingRoyalty: IMeasure<IMeasureDefinition> = newMeasure("aaWGcgnsfxIg");
/**
 * Metric Title: $ Franchise Fees (Ongoing Royalty) Last Quarter Timeline
 * Metric ID: aaeHf3Mofjir
 * Metric Type: MAQL Metric
 */
export const $FranchiseFeesOngoingRoyaltyLastQuarterTimeline: IMeasure<IMeasureDefinition> = newMeasure(
    "aaeHf3Mofjir",
);
/**
 * Metric Title: $ Franchised Sales
 * Metric ID: aclF4oDIe5hP
 * Metric Type: MAQL Metric
 */
export const $FranchisedSales: IMeasure<IMeasureDefinition> = newMeasure("aclF4oDIe5hP");
/**
 * Metric Title: $ Gross Profit
 * Metric ID: aa5JBkFDa7sJ
 * Metric Type: MAQL Metric
 */
export const $GrossProfit: IMeasure<IMeasureDefinition> = newMeasure("aa5JBkFDa7sJ");
/**
 * Metric Title: $ Owned Sales
 * Metric ID: aaMF7AZGbALB
 * Metric Type: MAQL Metric
 */
export const $OwnedSales: IMeasure<IMeasureDefinition> = newMeasure("aaMF7AZGbALB");
/**
 * Metric Title: $ Owned Sales Last Quarter Timeline
 * Metric ID: abHF4LCfdNdt
 * Metric Type: MAQL Metric
 */
export const $OwnedSalesLastQuarterTimeline: IMeasure<IMeasureDefinition> = newMeasure("abHF4LCfdNdt");
/**
 * Metric Title: $ Scheduled Costs
 * Metric ID: aclJxvAlhCp0
 * Metric Type: MAQL Metric
 */
export const $ScheduledCosts: IMeasure<IMeasureDefinition> = newMeasure("aclJxvAlhCp0");
/**
 * Metric Title: $ Scheduled Labor Costs
 * Metric ID: aaGJzwrDdbfQ
 * Metric Type: MAQL Metric
 */
export const $ScheduledLaborCosts: IMeasure<IMeasureDefinition> = newMeasure("aaGJzwrDdbfQ");
/**
 * Metric Title: $ Total Check Value
 * Metric ID: aattxAMVg2YU
 * Metric Type: MAQL Metric
 */
export const $TotalCheckValue: IMeasure<IMeasureDefinition> = newMeasure("aattxAMVg2YU");
/**
 * Metric Title: $ Total Costs
 * Metric ID: aaQHncjzfrtR
 * Metric Type: MAQL Metric
 */
export const $TotalCosts: IMeasure<IMeasureDefinition> = newMeasure("aaQHncjzfrtR");
/**
 * Metric Title: $ Total Costs - COGs
 * Metric ID: aafHpxx0f3gL
 * Metric Type: MAQL Metric
 */
export const $TotalCostsCOGs: IMeasure<IMeasureDefinition> = newMeasure("aafHpxx0f3gL");
/**
 * Metric Title: $ Total Costs - Labor
 * Metric ID: aamHpELXdotY
 * Metric Type: MAQL Metric
 */
export const $TotalCostsLabor: IMeasure<IMeasureDefinition> = newMeasure("aamHpELXdotY");
/**
 * Metric Title: $ Total Costs - Occupany
 * Metric ID: aagHqrJ6iAhD
 * Metric Type: MAQL Metric
 */
export const $TotalCostsOccupany: IMeasure<IMeasureDefinition> = newMeasure("aagHqrJ6iAhD");
/**
 * Metric Title: $ Total Costs - Operating
 * Metric ID: aaeHqv2qhEE1
 * Metric Type: MAQL Metric
 */
export const $TotalCostsOperating: IMeasure<IMeasureDefinition> = newMeasure("aaeHqv2qhEE1");
/**
 * Metric Title: $ Total Sales
 * Metric ID: aa7ulGyKhIE5
 * Metric Type: MAQL Metric
 */
export const $TotalSales: IMeasure<IMeasureDefinition> = newMeasure("aa7ulGyKhIE5");
/**
 * Metric Title: $ Total Sales Last Quarter Timeline
 * Metric ID: aajFRfDPaJrB
 * Metric Type: MAQL Metric
 */
export const $TotalSalesLastQuarterTimeline: IMeasure<IMeasureDefinition> = newMeasure("aajFRfDPaJrB");
/**
 * Metric Title: Avg # Checks
 * Metric ID: aakujkP2g68f
 * Metric Type: MAQL Metric
 */
export const AvgNrChecks: IMeasure<IMeasureDefinition> = newMeasure("aakujkP2g68f");
/**
 * Metric Title: Avg # Employees - Franchised
 * Metric ID: aciJJMmDfGYG
 * Metric Type: MAQL Metric
 */
export const AvgNrEmployeesFranchised: IMeasure<IMeasureDefinition> = newMeasure("aciJJMmDfGYG");
/**
 * Metric Title: Avg # Employees - Owned
 * Metric ID: abQJKPrmcvPv
 * Metric Type: MAQL Metric
 */
export const AvgNrEmployeesOwned: IMeasure<IMeasureDefinition> = newMeasure("abQJKPrmcvPv");
/**
 * Metric Title: Avg # Items on Check
 * Metric ID: adFurSoPaUaF
 * Metric Type: MAQL Metric
 */
export const AvgNrItemsOnCheck: IMeasure<IMeasureDefinition> = newMeasure("adFurSoPaUaF");
/**
 * Metric Title: Avg # Items on Check By Server
 * Metric ID: aaKwQwBIg1WY
 * Metric Type: MAQL Metric
 */
export const AvgNrItemsOnCheckByServer: IMeasure<IMeasureDefinition> = newMeasure("aaKwQwBIg1WY");
/**
 * Metric Title: Avg % of Entree on Total Check size
 * Metric ID: adQvRqlFawrq
 * Metric Type: MAQL Metric
 */
export const AvgPercentOfEntreeOnTotalCheckSize: IMeasure<IMeasureDefinition> = newMeasure("adQvRqlFawrq");
/**
 * Metric Title: Avg Check Size by Restaurant
 * Metric ID: abmxly1WgN0A
 * Metric Type: MAQL Metric
 */
export const AvgCheckSizeByRestaurant: IMeasure<IMeasureDefinition> = newMeasure("abmxly1WgN0A");
/**
 * Metric Title: Avg Check Size by Server
 * Metric ID: afewRzGAersh
 * Metric Type: MAQL Metric
 */
export const AvgCheckSizeByServer: IMeasure<IMeasureDefinition> = newMeasure("afewRzGAersh");
/**
 * Metric Title: Avg Daily # Checks by Restaurant
 * Metric ID: aaKvTDSga0Qc
 * Metric Type: MAQL Metric
 */
export const AvgDailyNrChecksByRestaurant: IMeasure<IMeasureDefinition> = newMeasure("aaKvTDSga0Qc");
/**
 * Metric Title: Avg Daily # of Check by Server
 * Metric ID: afgwRbw8ekwA
 * Metric Type: MAQL Metric
 */
export const AvgDailyNrOfCheckByServer: IMeasure<IMeasureDefinition> = newMeasure("afgwRbw8ekwA");
/**
 * Metric Title: Avg Entree % By Restaurant
 * Metric ID: afQHUg8AfYdl
 * Metric Type: MAQL Metric
 */
export const AvgEntreePercentByRestaurant: IMeasure<IMeasureDefinition> = newMeasure("afQHUg8AfYdl");
/**
 * Metric Title: Avg Entree % By Server
 * Metric ID: aexwEtn0eHwB
 * Metric Type: MAQL Metric
 */
export const AvgEntreePercentByServer: IMeasure<IMeasureDefinition> = newMeasure("aexwEtn0eHwB");
/**
 * Metric Title: Franchise Fee (Initial Fee) % Change
 * Metric ID: aabHgIqabggQ
 * Metric Type: MAQL Metric
 */
export const FranchiseFeeInitialFeePercentChange: IMeasure<IMeasureDefinition> = newMeasure("aabHgIqabggQ");
/**
 * Metric Title: Franchise Fee (Ongoing Royalty) % Change
 * Metric ID: aacHgvmIfZOX
 * Metric Type: MAQL Metric
 */
export const FranchiseFeeOngoingRoyaltyPercentChange: IMeasure<IMeasureDefinition> = newMeasure(
    "aacHgvmIfZOX",
);
/**
 * Metric Title: Gross Profit %
 * Metric ID: abBJBoqTe5IH
 * Metric Type: MAQL Metric
 */
export const GrossProfitPercent: IMeasure<IMeasureDefinition> = newMeasure("abBJBoqTe5IH");
/**
 * Metric Title: Owned Sales % Change
 * Metric ID: aacF8F2Me67e
 * Metric Type: MAQL Metric
 */
export const OwnedSalesPercentChange: IMeasure<IMeasureDefinition> = newMeasure("aacF8F2Me67e");
/**
 * Metric Title: Same Store Sales
 * Metric ID: aaXAnw7hcbFY
 * Metric Type: MAQL Metric
 */
export const SameStoreSales: IMeasure<IMeasureDefinition> = newMeasure("aaXAnw7hcbFY");
/**
 * Metric Title: Same Store Sales MoM Growth
 * Metric ID: aciAmeQCfGmo
 * Metric Type: MAQL Metric
 */
export const SameStoreSalesMoMGrowth: IMeasure<IMeasureDefinition> = newMeasure("aciAmeQCfGmo");
/**
 * Metric Title: Same Store Sales Previous Month
 * Metric ID: aagAoGqjcuCZ
 * Metric Type: MAQL Metric
 */
export const SameStoreSalesPreviousMonth: IMeasure<IMeasureDefinition> = newMeasure("aagAoGqjcuCZ");
/**
 * Metric Title: Total # Franchised Employees
 * Metric ID: afrJGKajgogi
 * Metric Type: MAQL Metric
 */
export const TotalNrFranchisedEmployees: IMeasure<IMeasureDefinition> = newMeasure("afrJGKajgogi");
/**
 * Metric Title: Total # Owned Employees
 * Metric ID: aazJLFHCdCBh
 * Metric Type: MAQL Metric
 */
export const TotalNrOwnedEmployees: IMeasure<IMeasureDefinition> = newMeasure("aazJLFHCdCBh");
/**
 * Metric Title: Total Sales % Change
 * Metric ID: abhFQRhibZKx
 * Metric Type: MAQL Metric
 */
export const TotalSalesPercentChange: IMeasure<IMeasureDefinition> = newMeasure("abhFQRhibZKx");
/**
 * Fact Title: $ Menu Item Sales
 * Fact ID: fact.salesdetailfact.menuitemsales
 */
export const $MenuItemSales = {
    /**
     * Fact Title: $ Menu Item Sales
     * Fact ID: fact.salesdetailfact.menuitemsales
     * Fact Aggregation: sum
     */
    Sum: newMeasure("fact.salesdetailfact.menuitemsales", (m) => m.aggregation("sum")),
    /**
     * Fact Title: $ Menu Item Sales
     * Fact ID: fact.salesdetailfact.menuitemsales
     * Fact Aggregation: count
     */ Count: newMeasure("fact.salesdetailfact.menuitemsales", (m) => m.aggregation("count")),
    /**
     * Fact Title: $ Menu Item Sales
     * Fact ID: fact.salesdetailfact.menuitemsales
     * Fact Aggregation: avg
     */ Avg: newMeasure("fact.salesdetailfact.menuitemsales", (m) => m.aggregation("avg")),
    /**
     * Fact Title: $ Menu Item Sales
     * Fact ID: fact.salesdetailfact.menuitemsales
     * Fact Aggregation: min
     */ Min: newMeasure("fact.salesdetailfact.menuitemsales", (m) => m.aggregation("min")),
    /**
     * Fact Title: $ Menu Item Sales
     * Fact ID: fact.salesdetailfact.menuitemsales
     * Fact Aggregation: max
     */ Max: newMeasure("fact.salesdetailfact.menuitemsales", (m) => m.aggregation("max")),
    /**
     * Fact Title: $ Menu Item Sales
     * Fact ID: fact.salesdetailfact.menuitemsales
     * Fact Aggregation: median
     */ Median: newMeasure("fact.salesdetailfact.menuitemsales", (m) => m.aggregation("median")),
    /**
     * Fact Title: $ Menu Item Sales
     * Fact ID: fact.salesdetailfact.menuitemsales
     * Fact Aggregation: runsum
     */ Runsum: newMeasure("fact.salesdetailfact.menuitemsales", (m) => m.aggregation("runsum")),
};
/**
 * Fact Title: Cost
 * Fact ID: fact.restaurantcostsfact.cost
 */
export const Cost = {
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: sum
     */
    Sum: newMeasure("fact.restaurantcostsfact.cost", (m) => m.aggregation("sum")),
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: count
     */ Count: newMeasure("fact.restaurantcostsfact.cost", (m) => m.aggregation("count")),
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: avg
     */ Avg: newMeasure("fact.restaurantcostsfact.cost", (m) => m.aggregation("avg")),
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: min
     */ Min: newMeasure("fact.restaurantcostsfact.cost", (m) => m.aggregation("min")),
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: max
     */ Max: newMeasure("fact.restaurantcostsfact.cost", (m) => m.aggregation("max")),
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: median
     */ Median: newMeasure("fact.restaurantcostsfact.cost", (m) => m.aggregation("median")),
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: runsum
     */ Runsum: newMeasure("fact.restaurantcostsfact.cost", (m) => m.aggregation("runsum")),
};
/**
 * Fact Title: Density
 * Fact ID: fact.uscities.density
 */
export const Density = {
    /**
     * Fact Title: Density
     * Fact ID: fact.uscities.density
     * Fact Aggregation: sum
     */
    Sum: newMeasure("fact.uscities.density", (m) => m.aggregation("sum")),
    /**
     * Fact Title: Density
     * Fact ID: fact.uscities.density
     * Fact Aggregation: count
     */ Count: newMeasure("fact.uscities.density", (m) => m.aggregation("count")),
    /**
     * Fact Title: Density
     * Fact ID: fact.uscities.density
     * Fact Aggregation: avg
     */ Avg: newMeasure("fact.uscities.density", (m) => m.aggregation("avg")),
    /**
     * Fact Title: Density
     * Fact ID: fact.uscities.density
     * Fact Aggregation: min
     */ Min: newMeasure("fact.uscities.density", (m) => m.aggregation("min")),
    /**
     * Fact Title: Density
     * Fact ID: fact.uscities.density
     * Fact Aggregation: max
     */ Max: newMeasure("fact.uscities.density", (m) => m.aggregation("max")),
    /**
     * Fact Title: Density
     * Fact ID: fact.uscities.density
     * Fact Aggregation: median
     */ Median: newMeasure("fact.uscities.density", (m) => m.aggregation("median")),
    /**
     * Fact Title: Density
     * Fact ID: fact.uscities.density
     * Fact Aggregation: runsum
     */ Runsum: newMeasure("fact.uscities.density", (m) => m.aggregation("runsum")),
};
/**
 * Fact Title: Menu Item Quantity
 * Fact ID: fact.salesdetailfact.menuitemquantity
 */
export const MenuItemQuantity = {
    /**
     * Fact Title: Menu Item Quantity
     * Fact ID: fact.salesdetailfact.menuitemquantity
     * Fact Aggregation: sum
     */
    Sum: newMeasure("fact.salesdetailfact.menuitemquantity", (m) => m.aggregation("sum")),
    /**
     * Fact Title: Menu Item Quantity
     * Fact ID: fact.salesdetailfact.menuitemquantity
     * Fact Aggregation: count
     */ Count: newMeasure("fact.salesdetailfact.menuitemquantity", (m) => m.aggregation("count")),
    /**
     * Fact Title: Menu Item Quantity
     * Fact ID: fact.salesdetailfact.menuitemquantity
     * Fact Aggregation: avg
     */ Avg: newMeasure("fact.salesdetailfact.menuitemquantity", (m) => m.aggregation("avg")),
    /**
     * Fact Title: Menu Item Quantity
     * Fact ID: fact.salesdetailfact.menuitemquantity
     * Fact Aggregation: min
     */ Min: newMeasure("fact.salesdetailfact.menuitemquantity", (m) => m.aggregation("min")),
    /**
     * Fact Title: Menu Item Quantity
     * Fact ID: fact.salesdetailfact.menuitemquantity
     * Fact Aggregation: max
     */ Max: newMeasure("fact.salesdetailfact.menuitemquantity", (m) => m.aggregation("max")),
    /**
     * Fact Title: Menu Item Quantity
     * Fact ID: fact.salesdetailfact.menuitemquantity
     * Fact Aggregation: median
     */ Median: newMeasure("fact.salesdetailfact.menuitemquantity", (m) => m.aggregation("median")),
    /**
     * Fact Title: Menu Item Quantity
     * Fact ID: fact.salesdetailfact.menuitemquantity
     * Fact Aggregation: runsum
     */ Runsum: newMeasure("fact.salesdetailfact.menuitemquantity", (m) => m.aggregation("runsum")),
};
/**
 * Fact Title: Population
 * Fact ID: fact.uscities.population
 */
export const Population = {
    /**
     * Fact Title: Population
     * Fact ID: fact.uscities.population
     * Fact Aggregation: sum
     */
    Sum: newMeasure("fact.uscities.population", (m) => m.aggregation("sum")),
    /**
     * Fact Title: Population
     * Fact ID: fact.uscities.population
     * Fact Aggregation: count
     */ Count: newMeasure("fact.uscities.population", (m) => m.aggregation("count")),
    /**
     * Fact Title: Population
     * Fact ID: fact.uscities.population
     * Fact Aggregation: avg
     */ Avg: newMeasure("fact.uscities.population", (m) => m.aggregation("avg")),
    /**
     * Fact Title: Population
     * Fact ID: fact.uscities.population
     * Fact Aggregation: min
     */ Min: newMeasure("fact.uscities.population", (m) => m.aggregation("min")),
    /**
     * Fact Title: Population
     * Fact ID: fact.uscities.population
     * Fact Aggregation: max
     */ Max: newMeasure("fact.uscities.population", (m) => m.aggregation("max")),
    /**
     * Fact Title: Population
     * Fact ID: fact.uscities.population
     * Fact Aggregation: median
     */ Median: newMeasure("fact.uscities.population", (m) => m.aggregation("median")),
    /**
     * Fact Title: Population
     * Fact ID: fact.uscities.population
     * Fact Aggregation: runsum
     */ Runsum: newMeasure("fact.uscities.population", (m) => m.aggregation("runsum")),
};
/**
 * Fact Title: Scheduled Cost
 * Fact ID: fact.restaurantcostsfact.scheduledcost
 */
export const ScheduledCost = {
    /**
     * Fact Title: Scheduled Cost
     * Fact ID: fact.restaurantcostsfact.scheduledcost
     * Fact Aggregation: sum
     */
    Sum: newMeasure("fact.restaurantcostsfact.scheduledcost", (m) => m.aggregation("sum")),
    /**
     * Fact Title: Scheduled Cost
     * Fact ID: fact.restaurantcostsfact.scheduledcost
     * Fact Aggregation: count
     */ Count: newMeasure("fact.restaurantcostsfact.scheduledcost", (m) => m.aggregation("count")),
    /**
     * Fact Title: Scheduled Cost
     * Fact ID: fact.restaurantcostsfact.scheduledcost
     * Fact Aggregation: avg
     */ Avg: newMeasure("fact.restaurantcostsfact.scheduledcost", (m) => m.aggregation("avg")),
    /**
     * Fact Title: Scheduled Cost
     * Fact ID: fact.restaurantcostsfact.scheduledcost
     * Fact Aggregation: min
     */ Min: newMeasure("fact.restaurantcostsfact.scheduledcost", (m) => m.aggregation("min")),
    /**
     * Fact Title: Scheduled Cost
     * Fact ID: fact.restaurantcostsfact.scheduledcost
     * Fact Aggregation: max
     */ Max: newMeasure("fact.restaurantcostsfact.scheduledcost", (m) => m.aggregation("max")),
    /**
     * Fact Title: Scheduled Cost
     * Fact ID: fact.restaurantcostsfact.scheduledcost
     * Fact Aggregation: median
     */ Median: newMeasure("fact.restaurantcostsfact.scheduledcost", (m) => m.aggregation("median")),
    /**
     * Fact Title: Scheduled Cost
     * Fact ID: fact.restaurantcostsfact.scheduledcost
     * Fact Aggregation: runsum
     */ Runsum: newMeasure("fact.restaurantcostsfact.scheduledcost", (m) => m.aggregation("runsum")),
};
/**
 * Attribute Title: Year (Date)
 * Display Form ID: date.year
 */
export const DateYear: IAttribute = newAttribute("date.aag81lMifn6q");
/**
 * Attribute Title: Quarter (Date)
 * Display Form ID: date.quarter.in.year
 */
export const DateQuarter: IAttribute = newAttribute("date.aam81lMifn6q");
export const DateWeekSunSatYear = {
    /**
     * Display Form Title: Week #/Year (W1/2010) (Date)
     * Display Form ID: date.aaA81lMifn6q
     */
    WeekNrYear: newAttribute("date.aaA81lMifn6q"),
    /**
     * Display Form Title: Week Starting (Date)
     * Display Form ID: date.aaw81lMifn6q
     */ WeekStarting: newAttribute("date.aaw81lMifn6q"),
    /**
     * Display Form Title: From - To (Date)
     * Display Form ID: date.aau81lMifn6q
     */ FromTo: newAttribute("date.aau81lMifn6q"),
    /**
     * Display Form Title: Week #/Year (Cont.) (Date)
     * Display Form ID: date.aay81lMifn6q
     */ WeekNrYear_1: newAttribute("date.aay81lMifn6q"),
    /**
     * Display Form Title: Wk/Qtr/Year (Cont.) (Date)
     * Display Form ID: date.aaC81lMifn6q
     */ WkQtrYear: newAttribute("date.aaC81lMifn6q"),
    /**
     * Display Form Title: Wk/Qtr/Year (Date)
     * Display Form ID: date.aas81lMifn6q
     */ WkQtrYear_1: newAttribute("date.aas81lMifn6q"),
};
/**
 * Attribute Title: Week (Sun-Sat) (Date)
 * Display Form ID: date.week.in.year
 */
export const DateWeekSunSat: IAttribute = newAttribute("date.aaI81lMifn6q");
/**
 * Attribute Title: Week (Sun-Sat) of Qtr (Date)
 * Display Form ID: date.week.in.quarter
 */
export const DateWeekSunSatOfQtr: IAttribute = newAttribute("date.aaO81lMifn6q");
export const DateWeekMonSunYear = {
    /**
     * Display Form Title: Week #/Year (W1/2010) (Date)
     * Display Form ID: date.aa281lMifn6q
     */
    WeekNrYear: newAttribute("date.aa281lMifn6q"),
    /**
     * Display Form Title: Week Starting (Date)
     * Display Form ID: date.aaY81lMifn6q
     */ WeekStarting: newAttribute("date.aaY81lMifn6q"),
    /**
     * Display Form Title: From - To (Date)
     * Display Form ID: date.aaW81lMifn6q
     */ FromTo: newAttribute("date.aaW81lMifn6q"),
};
/**
 * Attribute Title: Week (Mon-Sun) (Date)
 * Display Form ID: date.euweek.in.year
 */
export const DateWeekMonSun: IAttribute = newAttribute("date.aba81lMifn6q");
/**
 * Attribute Title: Week (Mon-Sun) of Qtr (Date)
 * Display Form ID: date.euweek.in.quarter
 */
export const DateWeekMonSunOfQtr: IAttribute = newAttribute("date.abg81lMifn6q");
export const DateMonth = {
    /**
     * Display Form Title: Short (Jan) (Date)
     * Display Form ID: date.abm81lMifn6q
     */
    Short: newAttribute("date.abm81lMifn6q"),
    /**
     * Display Form Title: Long (January) (Date)
     * Display Form ID: date.abs81lMifn6q
     */ Long: newAttribute("date.abs81lMifn6q"),
    /**
     * Display Form Title: Number (M1) (Date)
     * Display Form ID: date.abq81lMifn6q
     */ Number: newAttribute("date.abq81lMifn6q"),
    /**
     * Display Form Title: M/Q (M1/Q1) (Date)
     * Display Form ID: date.abo81lMifn6q
     */ MQ: newAttribute("date.abo81lMifn6q"),
};
/**
 * Attribute Title: Month of Quarter (Date)
 * Display Form ID: date.month.in.quarter
 */
export const DateMonthOfQuarter: IAttribute = newAttribute("date.aby81lMifn6q");
/**
 * Attribute Title: Day of Year (Date)
 * Display Form ID: date.day.in.year
 */
export const DateDayOfYear: IAttribute = newAttribute("date.abE81lMifn6q");
export const DateDayOfWeekSunSat = {
    /**
     * Display Form Title: Short (Sun) (Date)
     * Display Form ID: date.abK81lMifn6q
     */
    Short: newAttribute("date.abK81lMifn6q"),
    /**
     * Display Form Title: Long (Sunday) (Date)
     * Display Form ID: date.abO81lMifn6q
     */ Long: newAttribute("date.abO81lMifn6q"),
    /**
     * Display Form Title: Number (1=Sunday) (Date)
     * Display Form ID: date.abM81lMifn6q
     */ Number: newAttribute("date.abM81lMifn6q"),
};
export const DateDayOfWeekMonSun = {
    /**
     * Display Form Title: Short (Mon) (Date)
     * Display Form ID: date.abU81lMifn6q
     */
    Short: newAttribute("date.abU81lMifn6q"),
    /**
     * Display Form Title: Long (Monday) (Date)
     * Display Form ID: date.abY81lMifn6q
     */ Long: newAttribute("date.abY81lMifn6q"),
    /**
     * Display Form Title: Number (1=Monday) (Date)
     * Display Form ID: date.abW81lMifn6q
     */ Number: newAttribute("date.abW81lMifn6q"),
};
/**
 * Attribute Title: Day of Quarter (Date)
 * Display Form ID: date.day.in.quarter
 */
export const DateDayOfQuarter: IAttribute = newAttribute("date.ab481lMifn6q");
/**
 * Attribute Title: Day of Month (Date)
 * Display Form ID: date.day.in.month
 */
export const DateDayOfMonth: IAttribute = newAttribute("date.aca81lMifn6q");
/**
 * Attribute Title: Quarter/Year (Date)
 * Display Form ID: date.quarter
 */
export const DateQuarterYear: IAttribute = newAttribute("date.aci81lMifn6q");
export const DateMonthYear = {
    /**
     * Display Form Title: Short (Jan 2010) (Date)
     * Display Form ID: date.act81lMifn6q
     */
    Short: newAttribute("date.act81lMifn6q"),
    /**
     * Display Form Title: Long (January 2010) (Date)
     * Display Form ID: date.acx81lMifn6q
     */ Long: newAttribute("date.acx81lMifn6q"),
    /**
     * Display Form Title: Number (1/2010) (Date)
     * Display Form ID: date.acv81lMifn6q
     */ Number: newAttribute("date.acv81lMifn6q"),
};
export const DateDate = {
    /**
     * Display Form Title: mm/dd/yyyy (Date)
     * Display Form ID: date.date.mmddyyyy
     */
    MmDdYyyy: newAttribute("date.date.mmddyyyy"),
    /**
     * Display Form Title: yyyy-mm-dd (Date)
     * Display Form ID: date.date.yyyymmdd
     */ YyyyMmDd: newAttribute("date.date.yyyymmdd"),
    /**
     * Display Form Title: m/d/yy (no leading zeroes) (Date)
     * Display Form ID: date.date.mdyy
     */ MDYy: newAttribute("date.date.mdyy"),
    /**
     * Display Form Title: Long (Mon, Jan 1, 2010) (Date)
     * Display Form ID: date.date.long
     */ Long: newAttribute("date.date.long"),
    /**
     * Display Form Title: dd/mm/yyyy (Date)
     * Display Form ID: date.date.ddmmyyyy
     */ DdMmYyyy: newAttribute("date.date.ddmmyyyy"),
    /**
     * Display Form Title: dd-mm-yyyy (Date)
     * Display Form ID: date.date.eddmmyyyy
     */ DdMmYyyy_1: newAttribute("date.date.eddmmyyyy"),
};
/**
 * Attribute Title: Year (Timeline)
 * Display Form ID: timeline.year
 */
export const TimelineYear: IAttribute = newAttribute("timeline.aag81lMifn6q");
/**
 * Attribute Title: Quarter (Timeline)
 * Display Form ID: timeline.quarter.in.year
 */
export const TimelineQuarter: IAttribute = newAttribute("timeline.aam81lMifn6q");
export const TimelineWeekSunSatYear = {
    /**
     * Display Form Title: Week #/Year (W1/2010) (Timeline)
     * Display Form ID: timeline.aaA81lMifn6q
     */
    WeekNrYear: newAttribute("timeline.aaA81lMifn6q"),
    /**
     * Display Form Title: Week Starting (Timeline)
     * Display Form ID: timeline.aaw81lMifn6q
     */ WeekStarting: newAttribute("timeline.aaw81lMifn6q"),
    /**
     * Display Form Title: From - To (Timeline)
     * Display Form ID: timeline.aau81lMifn6q
     */ FromTo: newAttribute("timeline.aau81lMifn6q"),
    /**
     * Display Form Title: Week #/Year (Cont.) (Timeline)
     * Display Form ID: timeline.aay81lMifn6q
     */ WeekNrYear_1: newAttribute("timeline.aay81lMifn6q"),
    /**
     * Display Form Title: Wk/Qtr/Year (Cont.) (Timeline)
     * Display Form ID: timeline.aaC81lMifn6q
     */ WkQtrYear: newAttribute("timeline.aaC81lMifn6q"),
    /**
     * Display Form Title: Wk/Qtr/Year (Timeline)
     * Display Form ID: timeline.aas81lMifn6q
     */ WkQtrYear_1: newAttribute("timeline.aas81lMifn6q"),
};
/**
 * Attribute Title: Week (Sun-Sat) (Timeline)
 * Display Form ID: timeline.week.in.year
 */
export const TimelineWeekSunSat: IAttribute = newAttribute("timeline.aaI81lMifn6q");
/**
 * Attribute Title: Week (Sun-Sat) of Qtr (Timeline)
 * Display Form ID: timeline.week.in.quarter
 */
export const TimelineWeekSunSatOfQtr: IAttribute = newAttribute("timeline.aaO81lMifn6q");
export const TimelineWeekMonSunYear = {
    /**
     * Display Form Title: Week #/Year (W1/2010) (Timeline)
     * Display Form ID: timeline.aa281lMifn6q
     */
    WeekNrYear: newAttribute("timeline.aa281lMifn6q"),
    /**
     * Display Form Title: Week Starting (Timeline)
     * Display Form ID: timeline.aaY81lMifn6q
     */ WeekStarting: newAttribute("timeline.aaY81lMifn6q"),
    /**
     * Display Form Title: From - To (Timeline)
     * Display Form ID: timeline.aaW81lMifn6q
     */ FromTo: newAttribute("timeline.aaW81lMifn6q"),
};
/**
 * Attribute Title: Week (Mon-Sun) (Timeline)
 * Display Form ID: timeline.euweek.in.year
 */
export const TimelineWeekMonSun: IAttribute = newAttribute("timeline.aba81lMifn6q");
/**
 * Attribute Title: Week (Mon-Sun) of Qtr (Timeline)
 * Display Form ID: timeline.euweek.in.quarter
 */
export const TimelineWeekMonSunOfQtr: IAttribute = newAttribute("timeline.abg81lMifn6q");
export const TimelineMonth = {
    /**
     * Display Form Title: Short (Jan) (Timeline)
     * Display Form ID: timeline.abm81lMifn6q
     */
    Short: newAttribute("timeline.abm81lMifn6q"),
    /**
     * Display Form Title: Long (January) (Timeline)
     * Display Form ID: timeline.abs81lMifn6q
     */ Long: newAttribute("timeline.abs81lMifn6q"),
    /**
     * Display Form Title: Number (M1) (Timeline)
     * Display Form ID: timeline.abq81lMifn6q
     */ Number: newAttribute("timeline.abq81lMifn6q"),
    /**
     * Display Form Title: M/Q (M1/Q1) (Timeline)
     * Display Form ID: timeline.abo81lMifn6q
     */ MQ: newAttribute("timeline.abo81lMifn6q"),
};
/**
 * Attribute Title: Month of Quarter (Timeline)
 * Display Form ID: timeline.month.in.quarter
 */
export const TimelineMonthOfQuarter: IAttribute = newAttribute("timeline.aby81lMifn6q");
/**
 * Attribute Title: Day of Year (Timeline)
 * Display Form ID: timeline.day.in.year
 */
export const TimelineDayOfYear: IAttribute = newAttribute("timeline.abE81lMifn6q");
export const TimelineDayOfWeekSunSat = {
    /**
     * Display Form Title: Short (Sun) (Timeline)
     * Display Form ID: timeline.abK81lMifn6q
     */
    Short: newAttribute("timeline.abK81lMifn6q"),
    /**
     * Display Form Title: Long (Sunday) (Timeline)
     * Display Form ID: timeline.abO81lMifn6q
     */ Long: newAttribute("timeline.abO81lMifn6q"),
    /**
     * Display Form Title: Number (1=Sunday) (Timeline)
     * Display Form ID: timeline.abM81lMifn6q
     */ Number: newAttribute("timeline.abM81lMifn6q"),
};
export const TimelineDayOfWeekMonSun = {
    /**
     * Display Form Title: Short (Mon) (Timeline)
     * Display Form ID: timeline.abU81lMifn6q
     */
    Short: newAttribute("timeline.abU81lMifn6q"),
    /**
     * Display Form Title: Long (Monday) (Timeline)
     * Display Form ID: timeline.abY81lMifn6q
     */ Long: newAttribute("timeline.abY81lMifn6q"),
    /**
     * Display Form Title: Number (1=Monday) (Timeline)
     * Display Form ID: timeline.abW81lMifn6q
     */ Number: newAttribute("timeline.abW81lMifn6q"),
};
/**
 * Attribute Title: Day of Quarter (Timeline)
 * Display Form ID: timeline.day.in.quarter
 */
export const TimelineDayOfQuarter: IAttribute = newAttribute("timeline.ab481lMifn6q");
/**
 * Attribute Title: Day of Month (Timeline)
 * Display Form ID: timeline.day.in.month
 */
export const TimelineDayOfMonth: IAttribute = newAttribute("timeline.aca81lMifn6q");
/**
 * Attribute Title: Quarter/Year (Timeline)
 * Display Form ID: timeline.quarter
 */
export const TimelineQuarterYear: IAttribute = newAttribute("timeline.aci81lMifn6q");
export const TimelineMonthYear = {
    /**
     * Display Form Title: Short (Jan 2010) (Timeline)
     * Display Form ID: timeline.act81lMifn6q
     */
    Short: newAttribute("timeline.act81lMifn6q"),
    /**
     * Display Form Title: Long (January 2010) (Timeline)
     * Display Form ID: timeline.acx81lMifn6q
     */ Long: newAttribute("timeline.acx81lMifn6q"),
    /**
     * Display Form Title: Number (1/2010) (Timeline)
     * Display Form ID: timeline.acv81lMifn6q
     */ Number: newAttribute("timeline.acv81lMifn6q"),
};
export const TimelineDate = {
    /**
     * Display Form Title: mm/dd/yyyy (Timeline)
     * Display Form ID: timeline.date.mmddyyyy
     */
    MmDdYyyy: newAttribute("timeline.date.mmddyyyy"),
    /**
     * Display Form Title: yyyy-mm-dd (Timeline)
     * Display Form ID: timeline.date.yyyymmdd
     */ YyyyMmDd: newAttribute("timeline.date.yyyymmdd"),
    /**
     * Display Form Title: m/d/yy (no leading zeroes) (Timeline)
     * Display Form ID: timeline.date.mdyy
     */ MDYy: newAttribute("timeline.date.mdyy"),
    /**
     * Display Form Title: Long (Mon, Jan 1, 2010) (Timeline)
     * Display Form ID: timeline.date.long
     */ Long: newAttribute("timeline.date.long"),
    /**
     * Display Form Title: dd/mm/yyyy (Timeline)
     * Display Form ID: timeline.date.ddmmyyyy
     */ DdMmYyyy: newAttribute("timeline.date.ddmmyyyy"),
    /**
     * Display Form Title: dd-mm-yyyy (Timeline)
     * Display Form ID: timeline.date.eddmmyyyy
     */ DdMmYyyy_1: newAttribute("timeline.date.eddmmyyyy"),
};
/**
 * Attribute Title: Year (Fiscal Date)
 * Display Form ID: fiscaldate.fiscaljun1_year
 */
export const FiscalDateYear: IAttribute = newAttribute("fiscaldate.fiscaljun1_aag81lMifn6q");
/**
 * Attribute Title: Quarter (Fiscal Date)
 * Display Form ID: fiscaldate.fiscaljun1_quarter.in.year
 */
export const FiscalDateQuarter: IAttribute = newAttribute("fiscaldate.fiscaljun1_aam81lMifn6q");
export const FiscalDateWeekSunSatYear = {
    /**
     * Display Form Title: Week #/Year (W1/2010) (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_aaA81lMifn6q
     */
    WeekNrYear: newAttribute("fiscaldate.fiscaljun1_aaA81lMifn6q"),
    /**
     * Display Form Title: Week Starting (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_aaw81lMifn6q
     */ WeekStarting: newAttribute("fiscaldate.fiscaljun1_aaw81lMifn6q"),
    /**
     * Display Form Title: From - To (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_aau81lMifn6q
     */ FromTo: newAttribute("fiscaldate.fiscaljun1_aau81lMifn6q"),
    /**
     * Display Form Title: Week #/Year (Cont.) (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_aay81lMifn6q
     */ WeekNrYear_1: newAttribute("fiscaldate.fiscaljun1_aay81lMifn6q"),
    /**
     * Display Form Title: Wk/Qtr/Year (Cont.) (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_aaC81lMifn6q
     */ WkQtrYear: newAttribute("fiscaldate.fiscaljun1_aaC81lMifn6q"),
    /**
     * Display Form Title: Wk/Qtr/Year (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_aas81lMifn6q
     */ WkQtrYear_1: newAttribute("fiscaldate.fiscaljun1_aas81lMifn6q"),
};
/**
 * Attribute Title: Week (Sun-Sat) (Fiscal Date)
 * Display Form ID: fiscaldate.fiscaljun1_week.in.year
 */
export const FiscalDateWeekSunSat: IAttribute = newAttribute("fiscaldate.fiscaljun1_aaI81lMifn6q");
/**
 * Attribute Title: Week (Sun-Sat) of Qtr (Fiscal Date)
 * Display Form ID: fiscaldate.fiscaljun1_week.in.quarter
 */
export const FiscalDateWeekSunSatOfQtr: IAttribute = newAttribute("fiscaldate.fiscaljun1_aaO81lMifn6q");
export const FiscalDateWeekMonSunYear = {
    /**
     * Display Form Title: Week #/Year (W1/2010) (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_aa281lMifn6q
     */
    WeekNrYear: newAttribute("fiscaldate.fiscaljun1_aa281lMifn6q"),
    /**
     * Display Form Title: Week Starting (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_aaY81lMifn6q
     */ WeekStarting: newAttribute("fiscaldate.fiscaljun1_aaY81lMifn6q"),
    /**
     * Display Form Title: From - To (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_aaW81lMifn6q
     */ FromTo: newAttribute("fiscaldate.fiscaljun1_aaW81lMifn6q"),
};
/**
 * Attribute Title: Week (Mon-Sun) (Fiscal Date)
 * Display Form ID: fiscaldate.fiscaljun1_euweek.in.year
 */
export const FiscalDateWeekMonSun: IAttribute = newAttribute("fiscaldate.fiscaljun1_aba81lMifn6q");
/**
 * Attribute Title: Week (Mon-Sun) of Qtr (Fiscal Date)
 * Display Form ID: fiscaldate.fiscaljun1_euweek.in.quarter
 */
export const FiscalDateWeekMonSunOfQtr: IAttribute = newAttribute("fiscaldate.fiscaljun1_abg81lMifn6q");
export const FiscalDateMonth = {
    /**
     * Display Form Title: Short (Jan) (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_abm81lMifn6q
     */
    Short: newAttribute("fiscaldate.fiscaljun1_abm81lMifn6q"),
    /**
     * Display Form Title: Long (January) (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_abs81lMifn6q
     */ Long: newAttribute("fiscaldate.fiscaljun1_abs81lMifn6q"),
    /**
     * Display Form Title: Number (M1) (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_abq81lMifn6q
     */ Number: newAttribute("fiscaldate.fiscaljun1_abq81lMifn6q"),
    /**
     * Display Form Title: M/Q (M1/Q1) (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_abo81lMifn6q
     */ MQ: newAttribute("fiscaldate.fiscaljun1_abo81lMifn6q"),
};
/**
 * Attribute Title: Month of Quarter (Fiscal Date)
 * Display Form ID: fiscaldate.fiscaljun1_month.in.quarter
 */
export const FiscalDateMonthOfQuarter: IAttribute = newAttribute("fiscaldate.fiscaljun1_aby81lMifn6q");
/**
 * Attribute Title: Day of Year (Fiscal Date)
 * Display Form ID: fiscaldate.fiscaljun1_day.in.year
 */
export const FiscalDateDayOfYear: IAttribute = newAttribute("fiscaldate.fiscaljun1_abE81lMifn6q");
export const FiscalDateDayOfWeekSunSat = {
    /**
     * Display Form Title: Short (Sun) (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_abK81lMifn6q
     */
    Short: newAttribute("fiscaldate.fiscaljun1_abK81lMifn6q"),
    /**
     * Display Form Title: Long (Sunday) (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_abO81lMifn6q
     */ Long: newAttribute("fiscaldate.fiscaljun1_abO81lMifn6q"),
    /**
     * Display Form Title: Number (1=Sunday) (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_abM81lMifn6q
     */ Number: newAttribute("fiscaldate.fiscaljun1_abM81lMifn6q"),
};
export const FiscalDateDayOfWeekMonSun = {
    /**
     * Display Form Title: Short (Mon) (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_abU81lMifn6q
     */
    Short: newAttribute("fiscaldate.fiscaljun1_abU81lMifn6q"),
    /**
     * Display Form Title: Long (Monday) (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_abY81lMifn6q
     */ Long: newAttribute("fiscaldate.fiscaljun1_abY81lMifn6q"),
    /**
     * Display Form Title: Number (1=Monday) (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_abW81lMifn6q
     */ Number: newAttribute("fiscaldate.fiscaljun1_abW81lMifn6q"),
};
/**
 * Attribute Title: Day of Quarter (Fiscal Date)
 * Display Form ID: fiscaldate.fiscaljun1_day.in.quarter
 */
export const FiscalDateDayOfQuarter: IAttribute = newAttribute("fiscaldate.fiscaljun1_ab481lMifn6q");
/**
 * Attribute Title: Day of Month (Fiscal Date)
 * Display Form ID: fiscaldate.fiscaljun1_day.in.month
 */
export const FiscalDateDayOfMonth: IAttribute = newAttribute("fiscaldate.fiscaljun1_aca81lMifn6q");
/**
 * Attribute Title: Quarter/Year (Fiscal Date)
 * Display Form ID: fiscaldate.fiscaljun1_quarter
 */
export const FiscalDateQuarterYear: IAttribute = newAttribute("fiscaldate.fiscaljun1_aci81lMifn6q");
export const FiscalDateMonthYear = {
    /**
     * Display Form Title: Short (Jan 2010) (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_act81lMifn6q
     */
    Short: newAttribute("fiscaldate.fiscaljun1_act81lMifn6q"),
    /**
     * Display Form Title: Long (January 2010) (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_acx81lMifn6q
     */ Long: newAttribute("fiscaldate.fiscaljun1_acx81lMifn6q"),
    /**
     * Display Form Title: Number (1/2010) (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_acv81lMifn6q
     */ Number: newAttribute("fiscaldate.fiscaljun1_acv81lMifn6q"),
};
export const FiscalDateDate = {
    /**
     * Display Form Title: mm/dd/yyyy (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_date.mmddyyyy
     */
    MmDdYyyy: newAttribute("fiscaldate.fiscaljun1_date.mmddyyyy"),
    /**
     * Display Form Title: yyyy-mm-dd (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_date.yyyymmdd
     */ YyyyMmDd: newAttribute("fiscaldate.fiscaljun1_date.yyyymmdd"),
    /**
     * Display Form Title: m/d/yy (no leading zeroes) (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_date.mdyy
     */ MDYy: newAttribute("fiscaldate.fiscaljun1_date.mdyy"),
    /**
     * Display Form Title: Long (Mon, Jan 1, 2010) (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_date.long
     */ Long: newAttribute("fiscaldate.fiscaljun1_date.long"),
    /**
     * Display Form Title: dd/mm/yyyy (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_date.ddmmyyyy
     */ DdMmYyyy: newAttribute("fiscaldate.fiscaljun1_date.ddmmyyyy"),
    /**
     * Display Form Title: dd-mm-yyyy (Fiscal Date)
     * Display Form ID: fiscaldate.fiscaljun1_date.eddmmyyyy
     */ DdMmYyyy_1: newAttribute("fiscaldate.fiscaljun1_date.eddmmyyyy"),
};
export const Insights = {
    /**
     * Insight Title: Avg Entree %
     * Insight ID: abHVSjwFgk4i
     */
    AvgEntreePercent: "abHVSjwFgk4i",
    /**
     * Insight Title: Total Sales by City
     * Insight ID: acPWDTL2bJeX
     */ TotalSalesByCity: "acPWDTL2bJeX",
    /**
     * Insight Title: Total Sales by Location Last Quarter
     * Insight ID: abmeiDsUhTNW
     */ TotalSalesByLocationLastQuarter: "abmeiDsUhTNW",
    /**
     * Insight Title: Total Sales by Week
     * Insight ID: aeSCEMsTfoj8
     */ TotalSalesByWeek: "aeSCEMsTfoj8",
    /**
     * Insight Title: $ Check Value by Trx
     * Insight ID: aa7N3HExdhKw
     */ $CheckValueByTrx: "aa7N3HExdhKw",
    /**
     * Insight Title: $ Total Sales by Location
     * Insight ID: aaBN5UG3dXu4
     */ $TotalSalesByLocation: "aaBN5UG3dXu4",
    /**
     * Insight Title: Sales over Time
     * Insight ID: acFJltTsifSQ
     */ SalesOverTime: "acFJltTsifSQ",
    /**
     * Insight Title: Costs over Time
     * Insight ID: abHJmzD1fZrW
     */ CostsOverTime: "abHJmzD1fZrW",
    /**
     * Insight Title: Labor Costs vs Scheduled Costs
     * Insight ID: abhJpedgcfU2
     */ LaborCostsVsScheduledCosts: "abhJpedgcfU2",
    /**
     * Insight Title: Gross profit % (date filters)
     * Insight ID: acOfuc2QiDZK
     */ GrossProfitPercentDateFilters: "acOfuc2QiDZK",
    /**
     * Insight Title: Table report Labor Costs Vs Scheduled Costs
     * Insight ID: aatFRvXBdilm
     */ TableReportLaborCostsVsScheduledCosts: "aatFRvXBdilm",
    /**
     * Insight Title: Franchise Fees
     * Insight ID: aahnVeLugyFj
     */ FranchiseFees: "aahnVeLugyFj",
    /**
     * Insight Title: Franchise Fees 2017
     * Insight ID: aaZWa46oh9cJ
     */ FranchiseFees2017: "aaZWa46oh9cJ",
    /**
     * Insight Title: Too many datapoints
     * Insight ID: afgeutl8hfOe
     */ TooManyDatapoints: "afgeutl8hfOe",
    /**
     * Insight Title: Test
     * Insight ID: ab6KtJ2LfmCV
     */ Test: "ab6KtJ2LfmCV",
    /**
     * Insight Title: 123
     * Insight ID: ab3KtvTggKY5
     */ _123: "ab3KtvTggKY5",
    /**
     * Insight Title: asdf
     * Insight ID: aepRx0i8haM7
     */ Asdf: "aepRx0i8haM7",
    /**
     * Insight Title: too many data points
     * Insight ID: adzkfjmWiajP
     */ TooManyDataPoints: "adzkfjmWiajP",
    /**
     * Insight Title: test-pzb
     * Insight ID: aa0wmZDugnUX
     */ TestPzb: "aa0wmZDugnUX",
    /**
     * Insight Title: # Checks viewed by City stacked by Location
     * Insight ID: aby6oS6DbpFX
     */ NrChecksViewedByCityStackedByLocation: "aby6oS6DbpFX",
    /**
     * Insight Title: Kyle's Insight
     * Insight ID: aazlme4wcy3O
     */ KyleSInsight: "aazlme4wcy3O",
    /**
     * Insight Title: Gross Profit by location
     * Insight ID: ad4lhli5dn5v
     */ GrossProfitByLocation: "ad4lhli5dn5v",
    /**
     * Insight Title: ui-example-1
     * Insight ID: aasloSSGgcAs
     */ UiExample1: "aasloSSGgcAs",
    /**
     * Insight Title: DanielsFirstKPI
     * Insight ID: aaHloqmuf0Ea
     */ DanielsFirstKPI: "aaHloqmuf0Ea",
    /**
     * Insight Title: states
     * Insight ID: aayloZPWhziV
     */ States: "aayloZPWhziV",
    /**
     * Insight Title: Jakub's visualisation
     * Insight ID: abNloeB7iy4S
     */ JakubSVisualisation: "abNloeB7iy4S",
    /**
     * Insight Title: sdf_restrant_per_city
     * Insight ID: aamlpUW9d6gc
     */ SdfRestrantPerCity: "aamlpUW9d6gc",
    /**
     * Insight Title: fargo
     * Insight ID: acyllEgrhybI
     */ Fargo: "acyllEgrhybI",
    /**
     * Insight Title: new_test
     * Insight ID: aeHmbn7Ciok6
     */ NewTest: "aeHmbn7Ciok6",
    /**
     * Insight Title: Zajícův insight 2
     * Insight ID: abgprmHgf3uq
     */ ZajCVInsight2: "abgprmHgf3uq",
    /**
     * Insight Title: previousPeriod
     * Insight ID: aaMNtrdagrFW
     */ PreviousPeriod: "aaMNtrdagrFW",
    /**
     * Insight Title: Table to Pivot
     * Insight ID: aaYPSrp3bqyQ
     */ TableToPivot: "aaYPSrp3bqyQ",
    /**
     * Insight Title: Table to Pivot #2
     * Insight ID: aaRUKANgdCex
     */ TableToPivotNr2: "aaRUKANgdCex",
    /**
     * Insight Title: Table to Pivot #3
     * Insight ID: abdUSeYRfG4P
     */ TableToPivotNr3: "abdUSeYRfG4P",
    /**
     * Insight Title: Bubble Chart
     * Insight ID: aa6D2HhshWHB
     */ BubbleChart: "aa6D2HhshWHB",
    /**
     * Insight Title: hackathon
     * Insight ID: abxJEfZhfOk9
     */ Hackathon: "abxJEfZhfOk9",
    /**
     * Insight Title: pie2
     * Insight ID: abcJGKsFhpp5
     */ Pie2: "abcJGKsFhpp5",
    /**
     * Insight Title: Column Chart
     * Insight ID: acKLst3Faran
     */ ColumnChart: "acKLst3Faran",
    /**
     * Insight Title: Dummy chart
     * Insight ID: abw8Uco2cT1B
     */ DummyChart: "abw8Uco2cT1B",
    /**
     * Insight Title: test insight 1
     * Insight ID: ab68UlSRcNcP
     */ TestInsight1: "ab68UlSRcNcP",
    /**
     * Insight Title: Pivot test
     * Insight ID: abIFNtySe2mv
     */ PivotTest: "abIFNtySe2mv",
    /**
     * Insight Title: Table Without Measure
     * Insight ID: act2Khypdnz6
     */ TableWithoutMeasure: "act2Khypdnz6",
    /**
     * Insight Title: asdfasdf
     * Insight ID: ab7CymgRcuDx
     */ Asdfasdf: "ab7CymgRcuDx",
    /**
     * Insight Title: PivotTable sort over column attribute TEST
     * Insight ID: ackXHPqtheSt
     */ PivotTableSortOverColumnAttributeTEST: "ackXHPqtheSt",
    /**
     * Insight Title: Table Totals test
     * Insight ID: abS3P51kcXLN
     */ TableTotalsTest: "abS3P51kcXLN",
    /**
     * Insight Title: scatter example x
     * Insight ID: aaIfYMhViEjv
     */ ScatterExampleX: "aaIfYMhViEjv",
    /**
     * Insight Title: xxx
     * Insight ID: abtwQrxcfOvC
     */ Xxx: "abtwQrxcfOvC",
    /**
     * Insight Title: Line Chart
     * Insight ID: aaAaDFt4c1yC
     */ LineChart: "aaAaDFt4c1yC",
    /**
     * Insight Title: Scatter Chart
     * Insight ID: ab4aHg6lej5e
     */ ScatterChart: "ab4aHg6lej5e",
    /**
     * Insight Title: Area Chart
     * Insight ID: acCaGDIrc1iU
     */ AreaChart: "acCaGDIrc1iU",
    /**
     * Insight Title: Headline Chart
     * Insight ID: aaiaOcMqbyMj
     */ HeadlineChart: "aaiaOcMqbyMj",
    /**
     * Insight Title: Bubble Chart
     * Insight ID: abNaJG2Aed2M
     */ BubbleChart_1: "abNaJG2Aed2M",
    /**
     * Insight Title: Pie Chart
     * Insight ID: aaraOcrmdjZd
     */ PieChart: "aaraOcrmdjZd",
    /**
     * Insight Title: Donut Chart
     * Insight ID: absaJEALgcdO
     */ DonutChart: "absaJEALgcdO",
    /**
     * Insight Title: Treemap Chart
     * Insight ID: aajaObFleXdD
     */ TreemapChart: "aajaObFleXdD",
    /**
     * Insight Title: Heatmap Chart
     * Insight ID: abkaJfMYiiCU
     */ HeatmapChart: "abkaJfMYiiCU",
    /**
     * Insight Title: Bar Chart
     * Insight ID: aaKaMZUJeyGo
     */ BarChart: "aaKaMZUJeyGo",
    /**
     * Insight Title: yxcv
     * Insight ID: acGEkojJhJdr
     */ Yxcv: "acGEkojJhJdr",
    /**
     * Insight Title: ColumnsChart
     * Insight ID: aabOspdLbbvs
     */ ColumnsChart: "aabOspdLbbvs",
    /**
     * Insight Title: # Checks by Quarter, State
     * Insight ID: aaW7hwvlfq8Q
     */ NrChecksByQuarterState: "aaW7hwvlfq8Q",
    /**
     * Insight Title: e
     * Insight ID: ab3sK1TAhDEl
     */ E: "ab3sK1TAhDEl",
    /**
     * Insight Title: TOTVS Table
     * Insight ID: aesum6Klg3Pg
     */ TOTVSTable: "aesum6Klg3Pg",
    /**
     * Insight Title: tesst date year
     * Insight ID: aa37yWEJaZgJ
     */ TesstDateYear: "aa37yWEJaZgJ",
    /**
     * Insight Title: pivotka
     * Insight ID: abOGucCbbjYU
     */ Pivotka: "abOGucCbbjYU",
    /**
     * Insight Title: PivotTable with no filters
     * Insight ID: abEGARwMcKcp
     */ PivotTableWithNoFilters: "abEGARwMcKcp",
    /**
     * Insight Title: TOTVS Table #2
     * Insight ID: aattqR1TePqz
     */ TOTVSTableNr2: "aattqR1TePqz",
    /**
     * Insight Title: tetsssss1
     * Insight ID: abr6SUUDg4J3
     */ Tetsssss1: "abr6SUUDg4J3",
    /**
     * Insight Title: coreui-react
     * Insight ID: aaSMTErxgsQZ
     */ CoreuiReact: "aaSMTErxgsQZ",
    /**
     * Insight Title: JZA Treemap
     * Insight ID: aaGJHukYh43y
     */ JZATreemap: "aaGJHukYh43y",
    /**
     * Insight Title: JZA Combo
     * Insight ID: aaTJJW6adsaj
     */ JZACombo: "aaTJJW6adsaj",
    /**
     * Insight Title: JZA Pivot Example
     * Insight ID: aaVk0eDhiiyr
     */ JZAPivotExample: "aaVk0eDhiiyr",
    /**
     * Insight Title: Dual Axis Bar Chart
     * Insight ID: acSoPx4Mc7Rr
     */ DualAxisBarChart: "acSoPx4Mc7Rr",
    /**
     * Insight Title: Checks by year
     * Insight ID: accyE4bMhKhb
     */ ChecksByYear: "accyE4bMhKhb",
    /**
     * Insight Title: Checks by State
     * Insight ID: ad0CPFd0eIAV
     */ ChecksByState: "ad0CPFd0eIAV",
    /**
     * Insight Title: DEL
     * Insight ID: aaXC6TWlfQTa
     */ DEL: "aaXC6TWlfQTa",
    /**
     * Insight Title: DEL
     * Insight ID: aagDshJTagXX
     */ DEL_1: "aagDshJTagXX",
    /**
     * Insight Title: Long Table
     * Insight ID: aaDKNE91d2wl
     */ LongTable: "aaDKNE91d2wl",
    /**
     * Insight Title: test
     * Insight ID: abg7q7o6dYNx
     */ Test_1: "abg7q7o6dYNx",
    /**
     * Insight Title: DHO-test
     * Insight ID: abtZxLkZfrFD
     */ DHOTest: "abtZxLkZfrFD",
    /**
     * Insight Title: KPI
     * Insight ID: aa5gPlRleK93
     */ KPI: "aa5gPlRleK93",
    /**
     * Insight Title: PVA
     * Insight ID: abCiWPjZbXVS
     */ PVA: "abCiWPjZbXVS",
    /**
     * Insight Title: PVA 2
     * Insight ID: aaCi3GfNaV6Y
     */ PVA2: "aaCi3GfNaV6Y",
    /**
     * Insight Title: Table
     * Insight ID: aaimzjiVfWkM
     */ Table: "aaimzjiVfWkM",
    /**
     * Insight Title: Test Chart #1
     * Insight ID: aa4ESTLYiu6X
     */ TestChartNr1: "aa4ESTLYiu6X",
    /**
     * Insight Title: Table
     * Insight ID: acN7DuCPiDoh
     */ Table_1: "acN7DuCPiDoh",
    /**
     * Insight Title: Chart #1
     * Insight ID: admoLzGrddbk
     */ ChartNr1: "admoLzGrddbk",
    /**
     * Insight Title: geoPushpinChart
     * Insight ID: acebcI3fhaRI
     */ GeoPushpinChart: "acebcI3fhaRI",
    /**
     * Insight Title: Bullet Chart
     * Insight ID: aaQxY4PLbBsQ
     */ BulletChart: "aaQxY4PLbBsQ",
    /**
     * Insight Title: Test
     * Insight ID: aagQ0cgwbOSi
     */ Test_2: "aagQ0cgwbOSi",
};
