// (C) 2020 GoodData Corporation

/* eslint-disable header/header */
/* THIS FILE WAS AUTO-GENERATED USING CATALOG EXPORTER; YOU SHOULD NOT EDIT THIS FILE; GENERATE TIME: 2020-09-04T09:41:57.566Z; */
import {
    newAttribute,
    newMeasure,
    IAttribute,
    IMeasure,
    IMeasureDefinition,
    idRef,
} from "@gooddata/sdk-model";

/**
 * Attribute Title: ComputedAttrTLE
 * Display Form ID: attr.comp.LTHsvgO
 */
export const ComputedAttrTLE: IAttribute = newAttribute("label.comp.LTHsvgO");
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
 * Attribute Title: Transaction Id
 * Display Form ID: attr.salesdetailfact.transactionid
 */
export const TransactionId: IAttribute = newAttribute("label.salesdetailfact.transactionid");
/**
 * Metric Title: _Filter Last 4 Quarter
 * Metric ID: aaIHiWZjfWNA
 * Metric Type: MAQL Metric
 */
export const FilterLast4Quarter: IMeasure<IMeasureDefinition> = newMeasure(idRef("aaIHiWZjfWNA", "measure"));
/**
 * Metric Title: _Filter Quarter
 * Metric ID: aaiF4bffe4yn
 * Metric Type: MAQL Metric
 */
export const FilterQuarter: IMeasure<IMeasureDefinition> = newMeasure(idRef("aaiF4bffe4yn", "measure"));
/**
 * Metric Title: _TIMELINE Q
 * Metric ID: aaJF1ktqc10F
 * Metric Type: MAQL Metric
 */
export const TIMELINEQ: IMeasure<IMeasureDefinition> = newMeasure(idRef("aaJF1ktqc10F", "measure"));
/**
 * Metric Title: [AVG] Same Store Sales Growth MoM
 * Metric ID: aasApLbucFp0
 * Metric Type: MAQL Metric
 */
export const AVGSameStoreSalesGrowthMoM: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aasApLbucFp0", "measure"),
);
/**
 * Metric Title: # Checks
 * Metric ID: aeOt50ngicOD
 * Metric Type: MAQL Metric
 */
export const NrChecks: IMeasure<IMeasureDefinition> = newMeasure(idRef("aeOt50ngicOD", "measure"));
/**
 * Metric Title: # Employees
 * Metric ID: aaTJSTfSaRBg
 * Metric Type: MAQL Metric
 */
export const NrEmployees: IMeasure<IMeasureDefinition> = newMeasure(idRef("aaTJSTfSaRBg", "measure"));
/**
 * Metric Title: # Franchise Locations
 * Metric ID: ackJFayteCFG
 * Metric Type: MAQL Metric
 */
export const NrFranchiseLocations: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("ackJFayteCFG", "measure"),
);
/**
 * Metric Title: # Items on Check
 * Metric ID: adFurWGrd2H8
 * Metric Type: MAQL Metric
 */
export const NrItemsOnCheck: IMeasure<IMeasureDefinition> = newMeasure(idRef("adFurWGrd2H8", "measure"));
/**
 * Metric Title: # Owned Locations
 * Metric ID: aaBJGIyWbxfO
 * Metric Type: MAQL Metric
 */
export const NrOwnedLocations: IMeasure<IMeasureDefinition> = newMeasure(idRef("aaBJGIyWbxfO", "measure"));
/**
 * Metric Title: # Restaurants
 * Metric ID: aawAq8YqhM3o
 * Metric Type: MAQL Metric
 */
export const NrRestaurants: IMeasure<IMeasureDefinition> = newMeasure(idRef("aawAq8YqhM3o", "measure"));
/**
 * Metric Title: % Change $ Avg Total Sales
 * Metric ID: afxBqOrPc5Zh
 * Metric Type: MAQL Metric
 */
export const PercentChange$AvgTotalSales: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("afxBqOrPc5Zh", "measure"),
);
/**
 * Metric Title: % Change $ Avg Total Sales by Server
 * Metric ID: acMCYQZbbwJg
 * Metric Type: MAQL Metric
 */
export const PercentChange$AvgTotalSalesByServer: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("acMCYQZbbwJg", "measure"),
);
/**
 * Metric Title: % of Entree on Total Check Size
 * Metric ID: aagurTlZd1Ul
 * Metric Type: MAQL Metric
 */
export const PercentOfEntreeOnTotalCheckSize: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aagurTlZd1Ul", "measure"),
);
/**
 * Metric Title: $ Avg Check Size
 * Metric ID: agGujhRmcjQD
 * Metric Type: MAQL Metric
 */
export const $AvgCheckSize: IMeasure<IMeasureDefinition> = newMeasure(idRef("agGujhRmcjQD", "measure"));
/**
 * Metric Title: $ Avg Daily Total Sales
 * Metric ID: aagJGHg1bxap
 * Metric Type: MAQL Metric
 */
export const $AvgDailyTotalSales: IMeasure<IMeasureDefinition> = newMeasure(idRef("aagJGHg1bxap", "measure"));
/**
 * Metric Title: $ Avg Daily Total Sales by Server
 * Metric ID: aaAwXH5UfVBx
 * Metric Type: MAQL Metric
 */
export const $AvgDailyTotalSalesByServer: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aaAwXH5UfVBx", "measure"),
);
/**
 * Metric Title: $ Avg Daily Total Sales by Server - For Previous
 * Metric ID: aeiCXq43bzcl
 * Metric Type: MAQL Metric
 */
export const $AvgDailyTotalSalesByServerForPrevious: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aeiCXq43bzcl", "measure"),
);
/**
 * Metric Title: $ Avg Restaurant Daily Total Sales
 * Metric ID: acEvQdUMiEAd
 * Metric Type: MAQL Metric
 */
export const $AvgRestaurantDailyTotalSales: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("acEvQdUMiEAd", "measure"),
);
/**
 * Metric Title: $ Avg Restaurant Daily Total Sales - For Previous
 * Metric ID: agbBoXF6haIe
 * Metric Type: MAQL Metric
 */
export const $AvgRestaurantDailyTotalSalesForPrevious: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("agbBoXF6haIe", "measure"),
);
/**
 * Metric Title: $ Avg Total Sales by Restaurant
 * Metric ID: aaAHkMhRgp7S
 * Metric Type: MAQL Metric
 */
export const $AvgTotalSalesByRestaurant: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aaAHkMhRgp7S", "measure"),
);
/**
 * Metric Title: $ Entree of Total Check Size
 * Metric ID: aavuqQNNaDdc
 * Metric Type: MAQL Metric
 */
export const $EntreeOfTotalCheckSize: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aavuqQNNaDdc", "measure"),
);
/**
 * Metric Title: $ Franchise Fees
 * Metric ID: aaEGaXAEgB7U
 * Metric Type: MAQL Metric
 */
export const $FranchiseFees: IMeasure<IMeasureDefinition> = newMeasure(idRef("aaEGaXAEgB7U", "measure"));
/**
 * Metric Title: $ Franchise Fees (Ad Royalty)
 * Metric ID: aabHeqImaK0d
 * Metric Type: MAQL Metric
 */
export const $FranchiseFeesAdRoyalty: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aabHeqImaK0d", "measure"),
);
/**
 * Metric Title: $ Franchise Fees (Initial Fee) Last Quarter Timeline
 * Metric ID: aayHf60BfkfS
 * Metric Type: MAQL Metric
 */
export const $FranchiseFeesInitialFeeLastQuarterTimeline: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aayHf60BfkfS", "measure"),
);
/**
 * Metric Title: $ Franchise Fees (Initial Franchise Fee)
 * Metric ID: aaDHcv6wevkl
 * Metric Type: MAQL Metric
 */
export const $FranchiseFeesInitialFranchiseFee: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aaDHcv6wevkl", "measure"),
);
/**
 * Metric Title: $ Franchise Fees (Ongoing Royalty)
 * Metric ID: aaWGcgnsfxIg
 * Metric Type: MAQL Metric
 */
export const $FranchiseFeesOngoingRoyalty: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aaWGcgnsfxIg", "measure"),
);
/**
 * Metric Title: $ Franchise Fees (Ongoing Royalty) Last Quarter Timeline
 * Metric ID: aaeHf3Mofjir
 * Metric Type: MAQL Metric
 */
export const $FranchiseFeesOngoingRoyaltyLastQuarterTimeline: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aaeHf3Mofjir", "measure"),
);
/**
 * Metric Title: $ Franchised Sales
 * Metric ID: aclF4oDIe5hP
 * Metric Type: MAQL Metric
 */
export const $FranchisedSales: IMeasure<IMeasureDefinition> = newMeasure(idRef("aclF4oDIe5hP", "measure"));
/**
 * Metric Title: $ Gross Profit
 * Metric ID: aa5JBkFDa7sJ
 * Metric Type: MAQL Metric
 */
export const $GrossProfit: IMeasure<IMeasureDefinition> = newMeasure(idRef("aa5JBkFDa7sJ", "measure"));
/**
 * Metric Title: $ Owned Sales
 * Metric ID: aaMF7AZGbALB
 * Metric Type: MAQL Metric
 */
export const $OwnedSales: IMeasure<IMeasureDefinition> = newMeasure(idRef("aaMF7AZGbALB", "measure"));
/**
 * Metric Title: $ Owned Sales Last Quarter Timeline
 * Metric ID: abHF4LCfdNdt
 * Metric Type: MAQL Metric
 */
export const $OwnedSalesLastQuarterTimeline: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("abHF4LCfdNdt", "measure"),
);
/**
 * Metric Title: $ Scheduled Costs
 * Metric ID: aclJxvAlhCp0
 * Metric Type: MAQL Metric
 */
export const $ScheduledCosts: IMeasure<IMeasureDefinition> = newMeasure(idRef("aclJxvAlhCp0", "measure"));
/**
 * Metric Title: $ Scheduled Labor Costs
 * Metric ID: aaGJzwrDdbfQ
 * Metric Type: MAQL Metric
 */
export const $ScheduledLaborCosts: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aaGJzwrDdbfQ", "measure"),
);
/**
 * Metric Title: $ Total Check Value
 * Metric ID: aattxAMVg2YU
 * Metric Type: MAQL Metric
 */
export const $TotalCheckValue: IMeasure<IMeasureDefinition> = newMeasure(idRef("aattxAMVg2YU", "measure"));
/**
 * Metric Title: $ Total Costs
 * Metric ID: aaQHncjzfrtR
 * Metric Type: MAQL Metric
 */
export const $TotalCosts: IMeasure<IMeasureDefinition> = newMeasure(idRef("aaQHncjzfrtR", "measure"));
/**
 * Metric Title: $ Total Costs - COGs
 * Metric ID: aafHpxx0f3gL
 * Metric Type: MAQL Metric
 */
export const $TotalCostsCOGs: IMeasure<IMeasureDefinition> = newMeasure(idRef("aafHpxx0f3gL", "measure"));
/**
 * Metric Title: $ Total Costs - Labor
 * Metric ID: aamHpELXdotY
 * Metric Type: MAQL Metric
 */
export const $TotalCostsLabor: IMeasure<IMeasureDefinition> = newMeasure(idRef("aamHpELXdotY", "measure"));
/**
 * Metric Title: $ Total Costs - Occupany
 * Metric ID: aagHqrJ6iAhD
 * Metric Type: MAQL Metric
 */
export const $TotalCostsOccupany: IMeasure<IMeasureDefinition> = newMeasure(idRef("aagHqrJ6iAhD", "measure"));
/**
 * Metric Title: $ Total Costs - Operating
 * Metric ID: aaeHqv2qhEE1
 * Metric Type: MAQL Metric
 */
export const $TotalCostsOperating: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aaeHqv2qhEE1", "measure"),
);
/**
 * Metric Title: $ Total Sales
 * Metric ID: aa7ulGyKhIE5
 * Metric Type: MAQL Metric
 */
export const $TotalSales: IMeasure<IMeasureDefinition> = newMeasure(idRef("aa7ulGyKhIE5", "measure"));
/**
 * Metric Title: $ Total Sales Last Quarter Timeline
 * Metric ID: aajFRfDPaJrB
 * Metric Type: MAQL Metric
 */
export const $TotalSalesLastQuarterTimeline: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aajFRfDPaJrB", "measure"),
);
/**
 * Metric Title: Avg # Checks
 * Metric ID: aakujkP2g68f
 * Metric Type: MAQL Metric
 */
export const AvgNrChecks: IMeasure<IMeasureDefinition> = newMeasure(idRef("aakujkP2g68f", "measure"));
/**
 * Metric Title: Avg # Employees - Franchised
 * Metric ID: aciJJMmDfGYG
 * Metric Type: MAQL Metric
 */
export const AvgNrEmployeesFranchised: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aciJJMmDfGYG", "measure"),
);
/**
 * Metric Title: Avg # Employees - Owned
 * Metric ID: abQJKPrmcvPv
 * Metric Type: MAQL Metric
 */
export const AvgNrEmployeesOwned: IMeasure<IMeasureDefinition> = newMeasure(idRef("abQJKPrmcvPv", "measure"));
/**
 * Metric Title: Avg # Items on Check
 * Metric ID: adFurSoPaUaF
 * Metric Type: MAQL Metric
 */
export const AvgNrItemsOnCheck: IMeasure<IMeasureDefinition> = newMeasure(idRef("adFurSoPaUaF", "measure"));
/**
 * Metric Title: Avg # Items on Check By Server
 * Metric ID: aaKwQwBIg1WY
 * Metric Type: MAQL Metric
 */
export const AvgNrItemsOnCheckByServer: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aaKwQwBIg1WY", "measure"),
);
/**
 * Metric Title: Avg % of Entree on Total Check size
 * Metric ID: adQvRqlFawrq
 * Metric Type: MAQL Metric
 */
export const AvgPercentOfEntreeOnTotalCheckSize: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("adQvRqlFawrq", "measure"),
);
/**
 * Metric Title: Avg Check Size by Restaurant
 * Metric ID: abmxly1WgN0A
 * Metric Type: MAQL Metric
 */
export const AvgCheckSizeByRestaurant: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("abmxly1WgN0A", "measure"),
);
/**
 * Metric Title: Avg Check Size by Server
 * Metric ID: afewRzGAersh
 * Metric Type: MAQL Metric
 */
export const AvgCheckSizeByServer: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("afewRzGAersh", "measure"),
);
/**
 * Metric Title: Avg Daily # Checks by Restaurant
 * Metric ID: aaKvTDSga0Qc
 * Metric Type: MAQL Metric
 */
export const AvgDailyNrChecksByRestaurant: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aaKvTDSga0Qc", "measure"),
);
/**
 * Metric Title: Avg Daily # of Check by Server
 * Metric ID: afgwRbw8ekwA
 * Metric Type: MAQL Metric
 */
export const AvgDailyNrOfCheckByServer: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("afgwRbw8ekwA", "measure"),
);
/**
 * Metric Title: Avg Entree % By Restaurant
 * Metric ID: afQHUg8AfYdl
 * Metric Type: MAQL Metric
 */
export const AvgEntreePercentByRestaurant: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("afQHUg8AfYdl", "measure"),
);
/**
 * Metric Title: Avg Entree % By Server
 * Metric ID: aexwEtn0eHwB
 * Metric Type: MAQL Metric
 */
export const AvgEntreePercentByServer: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aexwEtn0eHwB", "measure"),
);
/**
 * Metric Title: Franchise Fee (Initial Fee) % Change
 * Metric ID: aabHgIqabggQ
 * Metric Type: MAQL Metric
 */
export const FranchiseFeeInitialFeePercentChange: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aabHgIqabggQ", "measure"),
);
/**
 * Metric Title: Franchise Fee (Ongoing Royalty) % Change
 * Metric ID: aacHgvmIfZOX
 * Metric Type: MAQL Metric
 */
export const FranchiseFeeOngoingRoyaltyPercentChange: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aacHgvmIfZOX", "measure"),
);
/**
 * Metric Title: Gross Profit %
 * Metric ID: abBJBoqTe5IH
 * Metric Type: MAQL Metric
 */
export const GrossProfitPercent: IMeasure<IMeasureDefinition> = newMeasure(idRef("abBJBoqTe5IH", "measure"));
/**
 * Metric Title: Owned Sales % Change
 * Metric ID: aacF8F2Me67e
 * Metric Type: MAQL Metric
 */
export const OwnedSalesPercentChange: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aacF8F2Me67e", "measure"),
);
/**
 * Metric Title: Same Store Sales
 * Metric ID: aaXAnw7hcbFY
 * Metric Type: MAQL Metric
 */
export const SameStoreSales: IMeasure<IMeasureDefinition> = newMeasure(idRef("aaXAnw7hcbFY", "measure"));
/**
 * Metric Title: Same Store Sales MoM Growth
 * Metric ID: aciAmeQCfGmo
 * Metric Type: MAQL Metric
 */
export const SameStoreSalesMoMGrowth: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aciAmeQCfGmo", "measure"),
);
/**
 * Metric Title: Same Store Sales Previous Month
 * Metric ID: aagAoGqjcuCZ
 * Metric Type: MAQL Metric
 */
export const SameStoreSalesPreviousMonth: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aagAoGqjcuCZ", "measure"),
);
/**
 * Metric Title: Total # Franchised Employees
 * Metric ID: afrJGKajgogi
 * Metric Type: MAQL Metric
 */
export const TotalNrFranchisedEmployees: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("afrJGKajgogi", "measure"),
);
/**
 * Metric Title: Total # Owned Employees
 * Metric ID: aazJLFHCdCBh
 * Metric Type: MAQL Metric
 */
export const TotalNrOwnedEmployees: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aazJLFHCdCBh", "measure"),
);
/**
 * Metric Title: Total Sales % Change
 * Metric ID: abhFQRhibZKx
 * Metric Type: MAQL Metric
 */
export const TotalSalesPercentChange: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("abhFQRhibZKx", "measure"),
);
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
    Sum: newMeasure(idRef("fact.salesdetailfact.menuitemsales", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: $ Menu Item Sales
     * Fact ID: fact.salesdetailfact.menuitemsales
     * Fact Aggregation: count
     */ Count: newMeasure(idRef("fact.salesdetailfact.menuitemsales", "fact"), (m) => m.aggregation("count")),
    /**
     * Fact Title: $ Menu Item Sales
     * Fact ID: fact.salesdetailfact.menuitemsales
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("fact.salesdetailfact.menuitemsales", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: $ Menu Item Sales
     * Fact ID: fact.salesdetailfact.menuitemsales
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("fact.salesdetailfact.menuitemsales", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: $ Menu Item Sales
     * Fact ID: fact.salesdetailfact.menuitemsales
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("fact.salesdetailfact.menuitemsales", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: $ Menu Item Sales
     * Fact ID: fact.salesdetailfact.menuitemsales
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("fact.salesdetailfact.menuitemsales", "fact"), (m) =>
        m.aggregation("median"),
    ),
    /**
     * Fact Title: $ Menu Item Sales
     * Fact ID: fact.salesdetailfact.menuitemsales
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("fact.salesdetailfact.menuitemsales", "fact"), (m) =>
        m.aggregation("runsum"),
    ),
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
    Sum: newMeasure(idRef("fact.restaurantcostsfact.cost", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: count
     */ Count: newMeasure(idRef("fact.restaurantcostsfact.cost", "fact"), (m) => m.aggregation("count")),
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("fact.restaurantcostsfact.cost", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("fact.restaurantcostsfact.cost", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("fact.restaurantcostsfact.cost", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("fact.restaurantcostsfact.cost", "fact"), (m) => m.aggregation("median")),
    /**
     * Fact Title: Cost
     * Fact ID: fact.restaurantcostsfact.cost
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("fact.restaurantcostsfact.cost", "fact"), (m) => m.aggregation("runsum")),
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
    Sum: newMeasure(idRef("fact.salesdetailfact.menuitemquantity", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Menu Item Quantity
     * Fact ID: fact.salesdetailfact.menuitemquantity
     * Fact Aggregation: count
     */ Count: newMeasure(idRef("fact.salesdetailfact.menuitemquantity", "fact"), (m) =>
        m.aggregation("count"),
    ),
    /**
     * Fact Title: Menu Item Quantity
     * Fact ID: fact.salesdetailfact.menuitemquantity
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("fact.salesdetailfact.menuitemquantity", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Menu Item Quantity
     * Fact ID: fact.salesdetailfact.menuitemquantity
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("fact.salesdetailfact.menuitemquantity", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Menu Item Quantity
     * Fact ID: fact.salesdetailfact.menuitemquantity
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("fact.salesdetailfact.menuitemquantity", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Menu Item Quantity
     * Fact ID: fact.salesdetailfact.menuitemquantity
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("fact.salesdetailfact.menuitemquantity", "fact"), (m) =>
        m.aggregation("median"),
    ),
    /**
     * Fact Title: Menu Item Quantity
     * Fact ID: fact.salesdetailfact.menuitemquantity
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("fact.salesdetailfact.menuitemquantity", "fact"), (m) =>
        m.aggregation("runsum"),
    ),
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
    Sum: newMeasure(idRef("fact.restaurantcostsfact.scheduledcost", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Scheduled Cost
     * Fact ID: fact.restaurantcostsfact.scheduledcost
     * Fact Aggregation: count
     */ Count: newMeasure(idRef("fact.restaurantcostsfact.scheduledcost", "fact"), (m) =>
        m.aggregation("count"),
    ),
    /**
     * Fact Title: Scheduled Cost
     * Fact ID: fact.restaurantcostsfact.scheduledcost
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("fact.restaurantcostsfact.scheduledcost", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Scheduled Cost
     * Fact ID: fact.restaurantcostsfact.scheduledcost
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("fact.restaurantcostsfact.scheduledcost", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Scheduled Cost
     * Fact ID: fact.restaurantcostsfact.scheduledcost
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("fact.restaurantcostsfact.scheduledcost", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Scheduled Cost
     * Fact ID: fact.restaurantcostsfact.scheduledcost
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("fact.restaurantcostsfact.scheduledcost", "fact"), (m) =>
        m.aggregation("median"),
    ),
    /**
     * Fact Title: Scheduled Cost
     * Fact ID: fact.restaurantcostsfact.scheduledcost
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("fact.restaurantcostsfact.scheduledcost", "fact"), (m) =>
        m.aggregation("runsum"),
    ),
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
/**
 * Attribute Title: Year (Date Financial Operational Date)
 * Display Form ID: date_financial_operational_date.year
 */
export const DateFinancialOperationalDateYear: IAttribute = newAttribute(
    "date_financial_operational_date.aag81lMifn6q",
);
/**
 * Attribute Title: Quarter (Date Financial Operational Date)
 * Display Form ID: date_financial_operational_date.quarter.in.year
 */
export const DateFinancialOperationalDateQuarter: IAttribute = newAttribute(
    "date_financial_operational_date.aam81lMifn6q",
);
export const DateFinancialOperationalDateWeekSunSatYear = {
    /**
     * Display Form Title: Week #/Year (W1/2010) (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.aaA81lMifn6q
     */
    WeekNrYear: newAttribute("date_financial_operational_date.aaA81lMifn6q"),
    /**
     * Display Form Title: Week Starting (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.aaw81lMifn6q
     */ WeekStarting: newAttribute("date_financial_operational_date.aaw81lMifn6q"),
    /**
     * Display Form Title: From - To (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.aau81lMifn6q
     */ FromTo: newAttribute("date_financial_operational_date.aau81lMifn6q"),
    /**
     * Display Form Title: Week #/Year (Cont.) (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.aay81lMifn6q
     */ WeekNrYear_1: newAttribute("date_financial_operational_date.aay81lMifn6q"),
    /**
     * Display Form Title: Wk/Qtr/Year (Cont.) (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.aaC81lMifn6q
     */ WkQtrYear: newAttribute("date_financial_operational_date.aaC81lMifn6q"),
    /**
     * Display Form Title: Wk/Qtr/Year (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.aas81lMifn6q
     */ WkQtrYear_1: newAttribute("date_financial_operational_date.aas81lMifn6q"),
};
/**
 * Attribute Title: Week (Sun-Sat) (Date Financial Operational Date)
 * Display Form ID: date_financial_operational_date.week.in.year
 */
export const DateFinancialOperationalDateWeekSunSat: IAttribute = newAttribute(
    "date_financial_operational_date.aaI81lMifn6q",
);
/**
 * Attribute Title: Week (Sun-Sat) of Qtr (Date Financial Operational Date)
 * Display Form ID: date_financial_operational_date.week.in.quarter
 */
export const DateFinancialOperationalDateWeekSunSatOfQtr: IAttribute = newAttribute(
    "date_financial_operational_date.aaO81lMifn6q",
);
export const DateFinancialOperationalDateWeekMonSunYear = {
    /**
     * Display Form Title: Week #/Year (W1/2010) (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.aa281lMifn6q
     */
    WeekNrYear: newAttribute("date_financial_operational_date.aa281lMifn6q"),
    /**
     * Display Form Title: Week Starting (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.aaY81lMifn6q
     */ WeekStarting: newAttribute("date_financial_operational_date.aaY81lMifn6q"),
    /**
     * Display Form Title: From - To (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.aaW81lMifn6q
     */ FromTo: newAttribute("date_financial_operational_date.aaW81lMifn6q"),
};
/**
 * Attribute Title: Week (Mon-Sun) (Date Financial Operational Date)
 * Display Form ID: date_financial_operational_date.euweek.in.year
 */
export const DateFinancialOperationalDateWeekMonSun: IAttribute = newAttribute(
    "date_financial_operational_date.aba81lMifn6q",
);
/**
 * Attribute Title: Week (Mon-Sun) of Qtr (Date Financial Operational Date)
 * Display Form ID: date_financial_operational_date.euweek.in.quarter
 */
export const DateFinancialOperationalDateWeekMonSunOfQtr: IAttribute = newAttribute(
    "date_financial_operational_date.abg81lMifn6q",
);
export const DateFinancialOperationalDateMonth = {
    /**
     * Display Form Title: Short (Jan) (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.abm81lMifn6q
     */
    Short: newAttribute("date_financial_operational_date.abm81lMifn6q"),
    /**
     * Display Form Title: Long (January) (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.abs81lMifn6q
     */ Long: newAttribute("date_financial_operational_date.abs81lMifn6q"),
    /**
     * Display Form Title: Number (M1) (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.abq81lMifn6q
     */ Number: newAttribute("date_financial_operational_date.abq81lMifn6q"),
    /**
     * Display Form Title: M/Q (M1/Q1) (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.abo81lMifn6q
     */ MQ: newAttribute("date_financial_operational_date.abo81lMifn6q"),
};
/**
 * Attribute Title: Month of Quarter (Date Financial Operational Date)
 * Display Form ID: date_financial_operational_date.month.in.quarter
 */
export const DateFinancialOperationalDateMonthOfQuarter: IAttribute = newAttribute(
    "date_financial_operational_date.aby81lMifn6q",
);
/**
 * Attribute Title: Day of Year (Date Financial Operational Date)
 * Display Form ID: date_financial_operational_date.day.in.year
 */
export const DateFinancialOperationalDateDayOfYear: IAttribute = newAttribute(
    "date_financial_operational_date.abE81lMifn6q",
);
export const DateFinancialOperationalDateDayOfWeekSunSat = {
    /**
     * Display Form Title: Short (Sun) (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.abK81lMifn6q
     */
    Short: newAttribute("date_financial_operational_date.abK81lMifn6q"),
    /**
     * Display Form Title: Long (Sunday) (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.abO81lMifn6q
     */ Long: newAttribute("date_financial_operational_date.abO81lMifn6q"),
    /**
     * Display Form Title: Number (1=Sunday) (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.abM81lMifn6q
     */ Number: newAttribute("date_financial_operational_date.abM81lMifn6q"),
};
export const DateFinancialOperationalDateDayOfWeekMonSun = {
    /**
     * Display Form Title: Short (Mon) (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.abU81lMifn6q
     */
    Short: newAttribute("date_financial_operational_date.abU81lMifn6q"),
    /**
     * Display Form Title: Long (Monday) (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.abY81lMifn6q
     */ Long: newAttribute("date_financial_operational_date.abY81lMifn6q"),
    /**
     * Display Form Title: Number (1=Monday) (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.abW81lMifn6q
     */ Number: newAttribute("date_financial_operational_date.abW81lMifn6q"),
};
/**
 * Attribute Title: Day of Quarter (Date Financial Operational Date)
 * Display Form ID: date_financial_operational_date.day.in.quarter
 */
export const DateFinancialOperationalDateDayOfQuarter: IAttribute = newAttribute(
    "date_financial_operational_date.ab481lMifn6q",
);
/**
 * Attribute Title: Day of Month (Date Financial Operational Date)
 * Display Form ID: date_financial_operational_date.day.in.month
 */
export const DateFinancialOperationalDateDayOfMonth: IAttribute = newAttribute(
    "date_financial_operational_date.aca81lMifn6q",
);
/**
 * Attribute Title: Quarter/Year (Date Financial Operational Date)
 * Display Form ID: date_financial_operational_date.quarter
 */
export const DateFinancialOperationalDateQuarterYear: IAttribute = newAttribute(
    "date_financial_operational_date.aci81lMifn6q",
);
export const DateFinancialOperationalDateMonthYear = {
    /**
     * Display Form Title: Short (Jan 2010) (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.act81lMifn6q
     */
    Short: newAttribute("date_financial_operational_date.act81lMifn6q"),
    /**
     * Display Form Title: Long (January 2010) (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.acx81lMifn6q
     */ Long: newAttribute("date_financial_operational_date.acx81lMifn6q"),
    /**
     * Display Form Title: Number (1/2010) (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.acv81lMifn6q
     */ Number: newAttribute("date_financial_operational_date.acv81lMifn6q"),
};
export const DateFinancialOperationalDateDate = {
    /**
     * Display Form Title: mm/dd/yyyy (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.date.mmddyyyy
     */
    MmDdYyyy: newAttribute("date_financial_operational_date.date.mmddyyyy"),
    /**
     * Display Form Title: yyyy-mm-dd (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.date.yyyymmdd
     */ YyyyMmDd: newAttribute("date_financial_operational_date.date.yyyymmdd"),
    /**
     * Display Form Title: m/d/yy (no leading zeroes) (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.date.mdyy
     */ MDYy: newAttribute("date_financial_operational_date.date.mdyy"),
    /**
     * Display Form Title: Long (Mon, Jan 1, 2010) (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.date.long
     */ Long: newAttribute("date_financial_operational_date.date.long"),
    /**
     * Display Form Title: dd/mm/yyyy (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.date.ddmmyyyy
     */ DdMmYyyy: newAttribute("date_financial_operational_date.date.ddmmyyyy"),
    /**
     * Display Form Title: dd-mm-yyyy (Date Financial Operational Date)
     * Display Form ID: date_financial_operational_date.date.eddmmyyyy
     */ DdMmYyyy_1: newAttribute("date_financial_operational_date.date.eddmmyyyy"),
};
/**
 * Attribute Title: Year (Paydate)
 * Display Form ID: paydate.year
 */
export const PaydateYear: IAttribute = newAttribute("paydate.aag81lMifn6q");
/**
 * Attribute Title: Quarter (Paydate)
 * Display Form ID: paydate.quarter.in.year
 */
export const PaydateQuarter: IAttribute = newAttribute("paydate.aam81lMifn6q");
export const PaydateWeekSunSatYear = {
    /**
     * Display Form Title: Week #/Year (W1/2010) (Paydate)
     * Display Form ID: paydate.aaA81lMifn6q
     */
    WeekNrYear: newAttribute("paydate.aaA81lMifn6q"),
    /**
     * Display Form Title: Week Starting (Paydate)
     * Display Form ID: paydate.aaw81lMifn6q
     */ WeekStarting: newAttribute("paydate.aaw81lMifn6q"),
    /**
     * Display Form Title: From - To (Paydate)
     * Display Form ID: paydate.aau81lMifn6q
     */ FromTo: newAttribute("paydate.aau81lMifn6q"),
    /**
     * Display Form Title: Week #/Year (Cont.) (Paydate)
     * Display Form ID: paydate.aay81lMifn6q
     */ WeekNrYear_1: newAttribute("paydate.aay81lMifn6q"),
    /**
     * Display Form Title: Wk/Qtr/Year (Cont.) (Paydate)
     * Display Form ID: paydate.aaC81lMifn6q
     */ WkQtrYear: newAttribute("paydate.aaC81lMifn6q"),
    /**
     * Display Form Title: Wk/Qtr/Year (Paydate)
     * Display Form ID: paydate.aas81lMifn6q
     */ WkQtrYear_1: newAttribute("paydate.aas81lMifn6q"),
};
/**
 * Attribute Title: Week (Sun-Sat) (Paydate)
 * Display Form ID: paydate.week.in.year
 */
export const PaydateWeekSunSat: IAttribute = newAttribute("paydate.aaI81lMifn6q");
/**
 * Attribute Title: Week (Sun-Sat) of Qtr (Paydate)
 * Display Form ID: paydate.week.in.quarter
 */
export const PaydateWeekSunSatOfQtr: IAttribute = newAttribute("paydate.aaO81lMifn6q");
export const PaydateWeekMonSunYear = {
    /**
     * Display Form Title: Week #/Year (W1/2010) (Paydate)
     * Display Form ID: paydate.aa281lMifn6q
     */
    WeekNrYear: newAttribute("paydate.aa281lMifn6q"),
    /**
     * Display Form Title: Week Starting (Paydate)
     * Display Form ID: paydate.aaY81lMifn6q
     */ WeekStarting: newAttribute("paydate.aaY81lMifn6q"),
    /**
     * Display Form Title: From - To (Paydate)
     * Display Form ID: paydate.aaW81lMifn6q
     */ FromTo: newAttribute("paydate.aaW81lMifn6q"),
};
/**
 * Attribute Title: Week (Mon-Sun) (Paydate)
 * Display Form ID: paydate.euweek.in.year
 */
export const PaydateWeekMonSun: IAttribute = newAttribute("paydate.aba81lMifn6q");
/**
 * Attribute Title: Week (Mon-Sun) of Qtr (Paydate)
 * Display Form ID: paydate.euweek.in.quarter
 */
export const PaydateWeekMonSunOfQtr: IAttribute = newAttribute("paydate.abg81lMifn6q");
export const PaydateMonth = {
    /**
     * Display Form Title: Short (Jan) (Paydate)
     * Display Form ID: paydate.abm81lMifn6q
     */
    Short: newAttribute("paydate.abm81lMifn6q"),
    /**
     * Display Form Title: Long (January) (Paydate)
     * Display Form ID: paydate.abs81lMifn6q
     */ Long: newAttribute("paydate.abs81lMifn6q"),
    /**
     * Display Form Title: Number (M1) (Paydate)
     * Display Form ID: paydate.abq81lMifn6q
     */ Number: newAttribute("paydate.abq81lMifn6q"),
    /**
     * Display Form Title: M/Q (M1/Q1) (Paydate)
     * Display Form ID: paydate.abo81lMifn6q
     */ MQ: newAttribute("paydate.abo81lMifn6q"),
};
/**
 * Attribute Title: Month of Quarter (Paydate)
 * Display Form ID: paydate.month.in.quarter
 */
export const PaydateMonthOfQuarter: IAttribute = newAttribute("paydate.aby81lMifn6q");
/**
 * Attribute Title: Day of Year (Paydate)
 * Display Form ID: paydate.day.in.year
 */
export const PaydateDayOfYear: IAttribute = newAttribute("paydate.abE81lMifn6q");
export const PaydateDayOfWeekSunSat = {
    /**
     * Display Form Title: Short (Sun) (Paydate)
     * Display Form ID: paydate.abK81lMifn6q
     */
    Short: newAttribute("paydate.abK81lMifn6q"),
    /**
     * Display Form Title: Long (Sunday) (Paydate)
     * Display Form ID: paydate.abO81lMifn6q
     */ Long: newAttribute("paydate.abO81lMifn6q"),
    /**
     * Display Form Title: Number (1=Sunday) (Paydate)
     * Display Form ID: paydate.abM81lMifn6q
     */ Number: newAttribute("paydate.abM81lMifn6q"),
};
export const PaydateDayOfWeekMonSun = {
    /**
     * Display Form Title: Short (Mon) (Paydate)
     * Display Form ID: paydate.abU81lMifn6q
     */
    Short: newAttribute("paydate.abU81lMifn6q"),
    /**
     * Display Form Title: Long (Monday) (Paydate)
     * Display Form ID: paydate.abY81lMifn6q
     */ Long: newAttribute("paydate.abY81lMifn6q"),
    /**
     * Display Form Title: Number (1=Monday) (Paydate)
     * Display Form ID: paydate.abW81lMifn6q
     */ Number: newAttribute("paydate.abW81lMifn6q"),
};
/**
 * Attribute Title: Day of Quarter (Paydate)
 * Display Form ID: paydate.day.in.quarter
 */
export const PaydateDayOfQuarter: IAttribute = newAttribute("paydate.ab481lMifn6q");
/**
 * Attribute Title: Day of Month (Paydate)
 * Display Form ID: paydate.day.in.month
 */
export const PaydateDayOfMonth: IAttribute = newAttribute("paydate.aca81lMifn6q");
/**
 * Attribute Title: Quarter/Year (Paydate)
 * Display Form ID: paydate.quarter
 */
export const PaydateQuarterYear: IAttribute = newAttribute("paydate.aci81lMifn6q");
export const PaydateMonthYear = {
    /**
     * Display Form Title: Short (Jan 2010) (Paydate)
     * Display Form ID: paydate.act81lMifn6q
     */
    Short: newAttribute("paydate.act81lMifn6q"),
    /**
     * Display Form Title: Long (January 2010) (Paydate)
     * Display Form ID: paydate.acx81lMifn6q
     */ Long: newAttribute("paydate.acx81lMifn6q"),
    /**
     * Display Form Title: Number (1/2010) (Paydate)
     * Display Form ID: paydate.acv81lMifn6q
     */ Number: newAttribute("paydate.acv81lMifn6q"),
};
export const PaydateDate = {
    /**
     * Display Form Title: mm/dd/yyyy (Paydate)
     * Display Form ID: paydate.date.mmddyyyy
     */
    MmDdYyyy: newAttribute("paydate.date.mmddyyyy"),
    /**
     * Display Form Title: yyyy-mm-dd (Paydate)
     * Display Form ID: paydate.date.yyyymmdd
     */ YyyyMmDd: newAttribute("paydate.date.yyyymmdd"),
    /**
     * Display Form Title: m/d/yy (no leading zeroes) (Paydate)
     * Display Form ID: paydate.date.mdyy
     */ MDYy: newAttribute("paydate.date.mdyy"),
    /**
     * Display Form Title: Long (Mon, Jan 1, 2010) (Paydate)
     * Display Form ID: paydate.date.long
     */ Long: newAttribute("paydate.date.long"),
    /**
     * Display Form Title: dd/mm/yyyy (Paydate)
     * Display Form ID: paydate.date.ddmmyyyy
     */ DdMmYyyy: newAttribute("paydate.date.ddmmyyyy"),
    /**
     * Display Form Title: dd-mm-yyyy (Paydate)
     * Display Form ID: paydate.date.eddmmyyyy
     */ DdMmYyyy_1: newAttribute("paydate.date.eddmmyyyy"),
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
     * Insight Title: Jak se ukladaj totaly?
     * Insight ID: aag18QiFahiP
     */ JakSeUkladajTotaly: "aag18QiFahiP",
    /**
     * Insight Title: doc_bb
     * Insight ID: aandGpipapsE
     */ DocBb: "aandGpipapsE",
    /**
     * Insight Title: Owned by city
     * Insight ID: aabnb2Kae09O
     */ OwnedByCity: "aabnb2Kae09O",
    /**
     * Insight Title: location filter
     * Insight ID: aacoryj5fJDB
     */ LocationFilter: "aacoryj5fJDB",
    /**
     * Insight Title: pivot table test
     * Insight ID: aae1lFs8hjW8
     */ PivotTableTest: "aae1lFs8hjW8",
    /**
     * Insight Title: pivot test 2
     * Insight ID: aacFP4anfb59
     */ PivotTest2: "aacFP4anfb59",
    /**
     * Insight Title: bar chart test
     * Insight ID: aacLScsebpR2
     */ BarChartTest: "aacLScsebpR2",
    /**
     * Insight Title: pivot table test 3
     * Insight ID: aadfnfPBbOPT
     */ PivotTableTest3: "aadfnfPBbOPT",
    /**
     * Insight Title: Ondruv big pivot
     * Insight ID: aappR4vfcFbc
     */ OndruvBigPivot: "aappR4vfcFbc",
    /**
     * Insight Title: Gross Profit Date filter
     * Insight ID: aabH7H5KeQmC
     */ GrossProfitDateFilter: "aabH7H5KeQmC",
    /**
     * Insight Title: pivot saved sort test
     * Insight ID: aabKUfWbgIEF
     */ PivotSavedSortTest: "aabKUfWbgIEF",
    /**
     * Insight Title: test pivot table
     * Insight ID: aafSxnYyiFfJ
     */ TestPivotTable: "aafSxnYyiFfJ",
    /**
     * Insight Title: pivot_lho
     * Insight ID: aabkQXHpayg5
     */ PivotLho: "aabkQXHpayg5",
    /**
     * Insight Title: dual axes bar
     * Insight ID: aaelg6f2eVQw
     */ DualAxesBar: "aaelg6f2eVQw",
    /**
     * Insight Title: test pivot table 2
     * Insight ID: aabtW12gev8y
     */ TestPivotTable2: "aabtW12gev8y",
    /**
     * Insight Title: pivot 2
     * Insight ID: aac7e1q3dmP0
     */ Pivot2: "aac7e1q3dmP0",
    /**
     * Insight Title: test 2
     * Insight ID: aac249qvixcU
     */ Test2: "aac249qvixcU",
    /**
     * Insight Title: drill test
     * Insight ID: aafkGVOGeVqI
     */ DrillTest: "aafkGVOGeVqI",
    /**
     * Insight Title: Dual axes test
     * Insight ID: aaePJArweqWe
     */ DualAxesTest: "aaePJArweqWe",
    /**
     * Insight Title: DHO_test
     * Insight ID: aaxhtKfGfkEF
     */ DHOTest: "aaxhtKfGfkEF",
    /**
     * Insight Title: DHO_test2
     * Insight ID: aabiyT4CehGr
     */ DHOTest2: "aabiyT4CehGr",
    /**
     * Insight Title: small
     * Insight ID: aanzUEMWbq6z
     */ Small: "aanzUEMWbq6z",
    /**
     * Insight Title: more
     * Insight ID: aacAuwnXespp
     */ More: "aacAuwnXespp",
    /**
     * Insight Title: DHO_test3
     * Insight ID: aacWKocqgmEQ
     */ DHOTest3: "aacWKocqgmEQ",
    /**
     * Insight Title: one row
     * Insight ID: aacXsNbVguPs
     */ OneRow: "aacXsNbVguPs",
    /**
     * Insight Title: PivotTable sort over col attr TEST
     * Insight ID: aaoX68WrbizG
     */ PivotTableSortOverColAttrTEST: "aaoX68WrbizG",
    /**
     * Insight Title: PivotTable TEST delete
     * Insight ID: aak2sQdegGaU
     */ PivotTableTESTDelete: "aak2sQdegGaU",
    /**
     * Insight Title: DHO_test4
     * Insight ID: aah24doLdkfQ
     */ DHOTest4: "aah24doLdkfQ",
    /**
     * Insight Title: DHO_test6
     * Insight ID: aab9BbnTeARE
     */ DHOTest6: "aab9BbnTeARE",
    /**
     * Insight Title: DHO_test7
     * Insight ID: aab9CyaOeudX
     */ DHOTest7: "aab9CyaOeudX",
    /**
     * Insight Title: DHO_test10
     * Insight ID: aaeCF1BQggYI
     */ DHOTest10: "aaeCF1BQggYI",
    /**
     * Insight Title: PivotTable rollup TEST
     * Insight ID: aahCVIXgcxDB
     */ PivotTableRollupTEST: "aahCVIXgcxDB",
    /**
     * Insight Title: DHO_RAIL-1285
     * Insight ID: aafM5QCbgVtb
     */ DHORAIL1285: "aafM5QCbgVtb",
    /**
     * Insight Title: EmptyTable
     * Insight ID: aabZT8uRflyw
     */ EmptyTable: "aabZT8uRflyw",
    /**
     * Insight Title: EmptyBarChart
     * Insight ID: aabZUbXsfroQ
     */ EmptyBarChart: "aabZUbXsfroQ",
    /**
     * Insight Title: Total Rollup check
     * Insight ID: aamgg7RnfKl4
     */ TotalRollupCheck: "aamgg7RnfKl4",
    /**
     * Insight Title: verify-1275
     * Insight ID: aadl8yxHdO4m
     */ Verify1275: "aadl8yxHdO4m",
    /**
     * Insight Title: hurtak - 1327
     * Insight ID: aabki5dXh9wQ
     */ Hurtak1327: "aabki5dXh9wQ",
    /**
     * Insight Title: xxx
     * Insight ID: aadA4E0gatW2
     */ Xxx: "aadA4E0gatW2",
    /**
     * Insight Title: Pivot Demo
     * Insight ID: aanRWCnEbsqd
     */ PivotDemo: "aanRWCnEbsqd",
    /**
     * Insight Title: Barchart
     * Insight ID: aacFqqnPbD5h
     */ Barchart: "aacFqqnPbD5h",
    /**
     * Insight Title: Employes vs Employes year ago
     * Insight ID: aabQVJmMb9Yi
     */ EmployesVsEmployesYearAgo: "aabQVJmMb9Yi",
    /**
     * Insight Title: hurtak - 1120
     * Insight ID: aabW0DCNgVFQ
     */ Hurtak1120: "aabW0DCNgVFQ",
    /**
     * Insight Title: hurtak - 1120
     * Insight ID: aabW0PfagVK5
     */ Hurtak1120_1: "aabW0PfagVK5",
    /**
     * Insight Title: Profit | Diff | Cost
     * Insight ID: aawHVi7edrIE
     */ ProfitDiffCost: "aawHVi7edrIE",
    /**
     * Insight Title: DHO-NULL tests
     * Insight ID: aafVrHQjc3Y7
     */ DHONULLTests: "aafVrHQjc3Y7",
    /**
     * Insight Title: Last Week test
     * Insight ID: aabloDIWfzpZ
     */ LastWeekTest: "aabloDIWfzpZ",
    /**
     * Insight Title: DHO-xss
     * Insight ID: aadzwzF3hwew
     */ DHOXss: "aadzwzF3hwew",
    /**
     * Insight Title: new objects
     * Insight ID: aavscLHNfUnf
     */ NewObjects: "aavscLHNfUnf",
    /**
     * Insight Title: new1
     * Insight ID: aacskwBmbLYU
     */ New1: "aacskwBmbLYU",
    /**
     * Insight Title: new2
     * Insight ID: aafskf75g9AZ
     */ New2: "aafskf75g9AZ",
    /**
     * Insight Title: FbV
     * Insight ID: aad3fOY6gQuv
     */ FbV: "aad3fOY6gQuv",
    /**
     * Insight Title: DHO - date
     * Insight ID: aah3H53ihyH3
     */ DHODate: "aah3H53ihyH3",
    /**
     * Insight Title: sdk
     * Insight ID: aadeiqevdQpv
     */ Sdk: "aadeiqevdQpv",
    /**
     * Insight Title: DHO-custom vis
     * Insight ID: aab5P6j1cZbN
     */ DHOCustomVis: "aab5P6j1cZbN",
    /**
     * Insight Title: test
     * Insight ID: aab9s44acQ7g
     */ Test: "aab9s44acQ7g",
    /**
     * Insight Title: Visualization Pivot Table
     * Insight ID: aabcceq8iEbv
     */ VisualizationPivotTable: "aabcceq8iEbv",
    /**
     * Insight Title: DHO-xirr
     * Insight ID: aabdCkB8e1oZ
     */ DHOXirr: "aabdCkB8e1oZ",
    /**
     * Insight Title: DHO-XIRR
     * Insight ID: aadpeXEQike1
     */ DHOXIRR: "aadpeXEQike1",
    /**
     * Insight Title: DHO-XIRR-CSV
     * Insight ID: aafphgJBh2iJ
     */ DHOXIRRCSV: "aafphgJBh2iJ",
    /**
     * Insight Title: RAIL-1931 reproducer
     * Insight ID: aacbTUuodpzc
     */ RAIL1931Reproducer: "aacbTUuodpzc",
    /**
     * Insight Title: BB-color-label-position
     * Insight ID: aar0rA7xbel3
     */ BBColorLabelPosition: "aar0rA7xbel3",
    /**
     * Insight Title: DHO-simple XIRR
     * Insight ID: aabkms7dhIU3
     */ DHOSimpleXIRR: "aabkms7dhIU3",
    /**
     * Insight Title: DHO-RAIL-1852 test
     * Insight ID: aabAHy9lgyRQ
     */ DHORAIL1852Test: "aabAHy9lgyRQ",
    /**
     * Insight Title: Daily Sales - AVG
     * Insight ID: aacBwcF7bmeG
     */ DailySalesAVG: "aacBwcF7bmeG",
    /**
     * Insight Title: Labour costs
     * Insight ID: aagHTUzUgsvk
     */ LabourCosts: "aagHTUzUgsvk",
    /**
     * Insight Title: DHO-simple bar
     * Insight ID: aabomcbWdD82
     */ DHOSimpleBar: "aabomcbWdD82",
    /**
     * Insight Title: Cost over time
     * Insight ID: aagVRzfMe1Vp
     */ CostOverTime: "aagVRzfMe1Vp",
    /**
     * Insight Title: DHO-subtotal test
     * Insight ID: aageim5Mdh5b
     */ DHOSubtotalTest: "aageim5Mdh5b",
    /**
     * Insight Title: DHO-sort
     * Insight ID: aabjGzXEgGEL
     */ DHOSort: "aabjGzXEgGEL",
    /**
     * Insight Title: Test remove 2
     * Insight ID: aaeNAfCcakII
     */ TestRemove2: "aaeNAfCcakII",
    /**
     * Insight Title: DHO-simple bar to destroy
     * Insight ID: aabZkU84dO23
     */ DHOSimpleBarToDestroy: "aabZkU84dO23",
    /**
     * Insight Title: DHO-truckin
     * Insight ID: aacD2DUPbjet
     */ DHOTruckin: "aacD2DUPbjet",
    /**
     * Insight Title: Cost: scheduled vs. real
     * Insight ID: aatip773hVAr
     */ CostScheduledVsReal: "aatip773hVAr",
    /**
     * Insight Title: Locations overview
     * Insight ID: aahiHahqhDe9
     */ LocationsOverview: "aahiHahqhDe9",
    /**
     * Insight Title: Revenue
     * Insight ID: aadGbYD0dCRM
     */ Revenue: "aadGbYD0dCRM",
    /**
     * Insight Title: DHO-export
     * Insight ID: abpLrwRldpec
     */ DHOExport: "abpLrwRldpec",
    /**
     * Insight Title: TLE-AreaDrill
     * Insight ID: aaNqtUDsgIQo
     */ TLEAreaDrill: "aaNqtUDsgIQo",
    /**
     * Insight Title: DHO-exports
     * Insight ID: aaDwMzsDdMAn
     */ DHOExports: "aaDwMzsDdMAn",
    /**
     * Insight Title: BlaBla
     * Insight ID: aalxj6nXhlrc
     */ BlaBla: "aalxj6nXhlrc",
    /**
     * Insight Title: TLE-table
     * Insight ID: aaWSOzrCgFNA
     */ TLETable: "aaWSOzrCgFNA",
    /**
     * Insight Title: TLE-table
     * Insight ID: aaxTDODOhYMn
     */ TLETable_1: "aaxTDODOhYMn",
    /**
     * Insight Title: INE - columns autoresizing
     * Insight ID: aaH0BrqVeYkq
     */ INEColumnsAutoresizing: "aaH0BrqVeYkq",
    /**
     * Insight Title: DHO-measure filters
     * Insight ID: aadJ3PERfMhZ
     */ DHOMeasureFilters: "aadJ3PERfMhZ",
    /**
     * Insight Title: RN FbV
     * Insight ID: acrjTxT5hBQc
     */ RNFbV: "acrjTxT5hBQc",
    /**
     * Insight Title: bbbbb
     * Insight ID: aacxtav9cot0
     */ Bbbbb: "aacxtav9cot0",
    /**
     * Insight Title: ccccc
     * Insight ID: aabxuByfcuDr
     */ Ccccc: "aabxuByfcuDr",
    /**
     * Insight Title: Test nè Tú
     * Insight ID: aaJBRiNCeQAq
     */ TestNT: "aaJBRiNCeQAq",
    /**
     * Insight Title: DHO-test2171
     * Insight ID: aaAohUzTfQob
     */ DHOTest2171: "aaAohUzTfQob",
    /**
     * Insight Title: TLE-testing
     * Insight ID: aabpxdtHikCN
     */ TLETesting: "aabpxdtHikCN",
    /**
     * Insight Title: FbV null zero
     * Insight ID: aamy7pqncmMm
     */ FbVNullZero: "aamy7pqncmMm",
    /**
     * Insight Title: TLE-Headline
     * Insight ID: aaSzX55FikEL
     */ TLEHeadline: "aaSzX55FikEL",
    /**
     * Insight Title: TTT
     * Insight ID: aaCNZF24gn7w
     */ TTT: "aaCNZF24gn7w",
    /**
     * Insight Title: TEST
     * Insight ID: aaPV8p6yfIfZ
     */ TEST: "aaPV8p6yfIfZ",
    /**
     * Insight Title: TLETLE
     * Insight ID: aamfjIdmiBlr
     */ TLETLE: "aamfjIdmiBlr",
    /**
     * Insight Title: DHO-FET-466 test
     * Insight ID: aawvz6Hqig5u
     */ DHOFET466Test: "aawvz6Hqig5u",
    /**
     * Insight Title: DHO-RAIL-2273
     * Insight ID: aa0NnhzsdEo9
     */ DHORAIL2273: "aa0NnhzsdEo9",
    /**
     * Insight Title: DHO-RAIL-2273_2
     * Insight ID: aa2NnhzsdEo9
     */ DHORAIL22732: "aa2NnhzsdEo9",
    /**
     * Insight Title: DHO-mixed datasets
     * Insight ID: aaicZgnXcuih
     */ DHOMixedDatasets: "aaicZgnXcuih",
    /**
     * Insight Title: DHO-mixed non prod
     * Insight ID: aawdFsnEfAlA
     */ DHOMixedNonProd: "aawdFsnEfAlA",
    /**
     * Insight Title: INE complex table
     * Insight ID: aapmZLyPcU6a
     */ INEComplexTable: "aapmZLyPcU6a",
    /**
     * Insight Title: headlineExampleForBoilerplate
     * Insight ID: aacn1PNyfOfx
     */ HeadlineExampleForBoilerplate: "aacn1PNyfOfx",
    /**
     * Insight Title: DHO-super long measure
     * Insight ID: aawVxqD3aUTF
     */ DHOSuperLongMeasure: "aawVxqD3aUTF",
    /**
     * Insight Title: DHO-date test
     * Insight ID: aaeK7SaNiw6B
     */ DHODateTest: "aaeK7SaNiw6B",
    /**
     * Insight Title: DHO-non prod attrs
     * Insight ID: aaM8inITbqI3
     */ DHONonProdAttrs: "aaM8inITbqI3",
    /**
     * Insight Title: DHO-measure attr filter
     * Insight ID: aafd4pfja6Z2
     */ DHOMeasureAttrFilter: "aafd4pfja6Z2",
    /**
     * Insight Title: DHO-noop filters
     * Insight ID: aakvH9GqfN82
     */ DHONoopFilters: "aakvH9GqfN82",
    /**
     * Insight Title: DHO-RAIL-2440
     * Insight ID: aamSREy8gAwe
     */ DHORAIL2440: "aamSREy8gAwe",
    /**
     * Insight Title: DHO-RAIL-2340 repro
     * Insight ID: aaEZoMiVeYV7
     */ DHORAIL2340Repro: "aaEZoMiVeYV7",
    /**
     * Insight Title: _insight_test_date_datasets_
     * Insight ID: aaqxMGg4ipQk
     */ InsightTestDateDatasets: "aaqxMGg4ipQk",
    /**
     * Insight Title: Tle-headline
     * Insight ID: aarQoP4iccWq
     */ TleHeadline: "aarQoP4iccWq",
    /**
     * Insight Title: TLE-edited
     * Insight ID: aapQV4ZWfvt8
     */ TLEEdited: "aapQV4ZWfvt8",
    /**
     * Insight Title: DHO-colors dialog
     * Insight ID: aamc1QjzdQl0
     */ DHOColorsDialog: "aamc1QjzdQl0",
    /**
     * Insight Title: DHO-stacking
     * Insight ID: aavjGyNjehdd
     */ DHOStacking: "aavjGyNjehdd",
    /**
     * Insight Title: DHO-long table
     * Insight ID: aaejV7s9aoj5
     */ DHOLongTable: "aaejV7s9aoj5",
    /**
     * Insight Title: DHO-fire
     * Insight ID: aasj0jG4bSn2
     */ DHOFire: "aasj0jG4bSn2",
    /**
     * Insight Title: DHO-grouping
     * Insight ID: aapj0kmQeCk1
     */ DHOGrouping: "aapj0kmQeCk1",
    /**
     * Insight Title: DHO-loading-test
     * Insight ID: aaqpi3WXdubz
     */ DHOLoadingTest: "aaqpi3WXdubz",
    /**
     * Insight Title: DHO-table test switcharoo
     * Insight ID: aabpO91vgEmr
     */ DHOTableTestSwitcharoo: "aabpO91vgEmr",
    /**
     * Insight Title: TLE-bar
     * Insight ID: aacpW3KreLFD
     */ TLEBar: "aacpW3KreLFD",
    /**
     * Insight Title: TLE-Black
     * Insight ID: aaIpQ3PghdUn
     */ TLEBlack: "aaIpQ3PghdUn",
    /**
     * Insight Title: del
     * Insight ID: aajpWvSDeL29
     */ Del: "aajpWvSDeL29",
    /**
     * Insight Title: Tle-combo
     * Insight ID: aaDqjIjJhBWZ
     */ TleCombo: "aaDqjIjJhBWZ",
    /**
     * Insight Title: DHO-RAIL-2474
     * Insight ID: aacvi8geftXf
     */ DHORAIL2474: "aacvi8geftXf",
    /**
     * Insight Title: DHO-RAIL-2474-v2
     * Insight ID: aanviPIBdXgk
     */ DHORAIL2474V2: "aanviPIBdXgk",
    /**
     * Insight Title: DHO-RAIL-2474-v3
     * Insight ID: aatvagrMbKxN
     */ DHORAIL2474V3: "aatvagrMbKxN",
    /**
     * Insight Title: TLE-DoesItSave
     * Insight ID: aaBM8y0ZdWzX
     */ TLEDoesItSave: "aaBM8y0ZdWzX",
    /**
     * Insight Title: DHO-empty
     * Insight ID: aaxSuK6Bbf3X
     */ DHOEmpty: "aaxSuK6Bbf3X",
    /**
     * Insight Title: DHO-RAIL-2510
     * Insight ID: aaGSTeYuaQ7p
     */ DHORAIL2510: "aaGSTeYuaQ7p",
    /**
     * Insight Title: DHO-heatmap
     * Insight ID: aaz3l6CYbKlt
     */ DHOHeatmap: "aaz3l6CYbKlt",
    /**
     * Insight Title: DHO-bullet
     * Insight ID: aag3rWgYa9qX
     */ DHOBullet: "aag3rWgYa9qX",
    /**
     * Insight Title: DHO-date filter
     * Insight ID: aagsaIRac06F
     */ DHODateFilter: "aagsaIRac06F",
    /**
     * Insight Title: DHO-totals-starter
     * Insight ID: aaFwNtBCbPFL
     */ DHOTotalsStarter: "aaFwNtBCbPFL",
    /**
     * Insight Title: DHO-totals-starter-rep
     * Insight ID: aaYwHyhHc3Gx
     */ DHOTotalsStarterRep: "aaYwHyhHc3Gx",
    /**
     * Insight Title: DHO-totals-starter-repro2
     * Insight ID: aa2wHyhHc3Gx
     */ DHOTotalsStarterRepro2: "aa2wHyhHc3Gx",
    /**
     * Insight Title: Drill to URL
     * Insight ID: aawH3bjwf4hm
     */ DrillToURL: "aawH3bjwf4hm",
    /**
     * Insight Title: Drill to URL no hyperlink
     * Insight ID: aadIgv2dexIK
     */ DrillToURLNoHyperlink: "aadIgv2dexIK",
    /**
     * Insight Title: DHO-totals-starter-new-fix
     * Insight ID: aac6Oad7fEO6
     */ DHOTotalsStarterNewFix: "aac6Oad7fEO6",
    /**
     * Insight Title: DHO-RAIL-2522
     * Insight ID: aalhpqJOcTCQ
     */ DHORAIL2522: "aalhpqJOcTCQ",
    /**
     * Insight Title: TLE-areachart
     * Insight ID: aaBMcCXCbUlA
     */ TLEAreachart: "aaBMcCXCbUlA",
    /**
     * Insight Title: RAIL-2494-starter
     * Insight ID: aaE2fTjzel6r
     */ RAIL2494Starter: "aaE2fTjzel6r",
    /**
     * Insight Title: TLE-filternodata
     * Insight ID: aae70VqsaAGl
     */ TLEFilternodata: "aae70VqsaAGl",
    /**
     * Insight Title: Table resize
     * Insight ID: aag85MAGbsqf
     */ TableResize: "aag85MAGbsqf",
    /**
     * Insight Title: DHO-RAIL-2601
     * Insight ID: aad5CjeIcKhK
     */ DHORAIL2601: "aad5CjeIcKhK",
    /**
     * Insight Title: DHO-bar-stack
     * Insight ID: aacr99KLhNhJ
     */ DHOBarStack: "aacr99KLhNhJ",
    /**
     * Insight Title: DHO-bar-stack-2
     * Insight ID: aanr8TI9hDzg
     */ DHOBarStack2: "aanr8TI9hDzg",
    /**
     * Insight Title: RAIL-2107-pivot-group
     * Insight ID: aactitz4bZGW
     */ RAIL2107PivotGroup: "aactitz4bZGW",
    /**
     * Insight Title: Employees
     * Insight ID: aahJJEoogljY
     */ Employees: "aahJJEoogljY",
    /**
     * Insight Title: Employees 2
     * Insight ID: aapJMxhkh2MJ
     */ Employees2: "aapJMxhkh2MJ",
    /**
     * Insight Title: DHO-weird stack2
     * Insight ID: aaOKKijka98j
     */ DHOWeirdStack2: "aaOKKijka98j",
    /**
     * Insight Title: Employees 3
     * Insight ID: aadUyVQ1df6K
     */ Employees3: "aadUyVQ1df6K",
    /**
     * Insight Title: DHO-locked2
     * Insight ID: aacuz3tficLa
     */ DHOLocked2: "aacuz3tficLa",
    /**
     * Insight Title: DHO-RAIL-2635
     * Insight ID: aayvbDQYbE0E
     */ DHORAIL2635: "aayvbDQYbE0E",
    /**
     * Insight Title: DHO-stack
     * Insight ID: aacF3nNlddyZ
     */ DHOStack: "aacF3nNlddyZ",
    /**
     * Insight Title: DHO-stack2
     * Insight ID: aakF7rqxbkox
     */ DHOStack2: "aakF7rqxbkox",
    /**
     * Insight Title: DHO-RAIL-2607
     * Insight ID: aabG3t4df6Fo
     */ DHORAIL2607: "aabG3t4df6Fo",
    /**
     * Insight Title: DHO-RAIL-2641
     * Insight ID: aacHg27FcbNr
     */ DHORAIL2641: "aacHg27FcbNr",
    /**
     * Insight Title: DHO-RAIL-2642
     * Insight ID: aabLJs6ke2T8
     */ DHORAIL2642: "aabLJs6ke2T8",
    /**
     * Insight Title: DHO-RAIL-2642-edit
     * Insight ID: aagLDmQ3gkGb
     */ DHORAIL2642Edit: "aagLDmQ3gkGb",
};
