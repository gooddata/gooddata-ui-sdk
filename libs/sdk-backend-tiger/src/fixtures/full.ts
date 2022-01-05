// (C) 2022 GoodData Corporation

/* eslint-disable */
/* THIS FILE WAS AUTO-GENERATED USING CATALOG EXPORTER; YOU SHOULD NOT EDIT THIS FILE; GENERATE TIME: 2022-01-05T11:17:43.842Z; */
// @ts-ignore ignore unused imports here if they happen (e.g. when there is no measure in the workspace)
import {
    newAttribute,
    newMeasure,
    IAttribute,
    IMeasure,
    IMeasureDefinition,
    idRef,
} from "@gooddata/sdk-model";

/**
 * Attribute Title: Account
 * Attribute ID: attr.f_account.account
 */
export const Account = {
    /**
     * Display Form Title: Account
     * Display Form ID: label.f_account.account.accountid
     */
    Default: newAttribute("label.f_account.account.accountid"),
    /**
     * Display Form Title: Name
     * Display Form ID: label.f_account.account
     */ Name: newAttribute("label.f_account.account"),
};
/**
 * Attribute Title: Account Id
 * Attribute ID: f_account.id
 */
export const AccountId: IAttribute = newAttribute("f_account.id");
/**
 * Attribute Title: Activity
 * Attribute ID: attr.f_activity.activity
 */
export const Activity = {
    /**
     * Display Form Title: Activity
     * Display Form ID: label.f_activity.activity
     */
    Default: newAttribute("label.f_activity.activity"),
    /**
     * Display Form Title: Subject
     * Display Form ID: label.f_activity.activity.name
     */ Subject: newAttribute("label.f_activity.activity.name"),
};
/**
 * Attribute Title: Activity Type
 * Attribute ID: f_activity.activitytype_id
 */
export const ActivityType: IAttribute = newAttribute("f_activity.activitytype_id");
/**
 * Attribute Title: Activity Id
 * Attribute ID: f_activity.id
 */
export const ActivityId: IAttribute = newAttribute("f_activity.id");
/**
 * Attribute Title: Is Closed?
 * Attribute ID: f_activity.isclosed_id
 */
export const IsClosed: IAttribute = newAttribute("f_activity.isclosed_id");
/**
 * Attribute Title: Is Task?
 * Attribute ID: f_activity.istask_id
 */
export const IsTask: IAttribute = newAttribute("f_activity.istask_id");
/**
 * Attribute Title: Priority
 * Attribute ID: f_activity.priority_id
 */
export const Priority: IAttribute = newAttribute("f_activity.priority_id");
/**
 * Attribute Title: Status
 * Attribute ID: f_activity.status_id
 */
export const Status: IAttribute = newAttribute("f_activity.status_id");
/**
 * Attribute Title: Opportunity
 * Attribute ID: attr.f_opportunity.opportunity
 */
export const Opportunity = {
    /**
     * Display Form Title: Opportunity Name
     * Display Form ID: label.f_opportunity.opportunity
     */
    Name: newAttribute("label.f_opportunity.opportunity"),
    /**
     * Display Form Title: Opportunity
     * Display Form ID: label.f_opportunity.opportunity.opportunity
     */ Default: newAttribute("label.f_opportunity.opportunity.opportunity"),
    /**
     * Display Form Title: SFDC URL
     * Display Form ID: label.f_opportunity.opportunity.sfdcurl
     */ SFDCURL: newAttribute("label.f_opportunity.opportunity.sfdcurl"),
};
/**
 * Attribute Title: Opportunity Id
 * Attribute ID: f_opportunity.id
 */
export const OpportunityId: IAttribute = newAttribute("f_opportunity.id");
/**
 * Attribute Title: Opp. Snapshot
 * Attribute ID: attr.f_opportunitysnapshot.oppsnapshot
 */
export const OppSnapshot: IAttribute = newAttribute("label.f_opportunitysnapshot.oppsnapshot");
/**
 * Attribute Title: Forecast Category
 * Attribute ID: f_opportunitysnapshot.forecastcategory_id
 */
export const ForecastCategory: IAttribute = newAttribute("f_opportunitysnapshot.forecastcategory_id");
/**
 * Attribute Title: Opp. Snapshot Id
 * Attribute ID: f_opportunitysnapshot.id
 */
export const OppSnapshotId: IAttribute = newAttribute("f_opportunitysnapshot.id");
/**
 * Attribute Title: Sales Rep
 * Attribute ID: attr.f_owner.salesrep
 */
export const SalesRep = {
    /**
     * Display Form Title: Owner Name
     * Display Form ID: label.f_owner.salesrep
     */
    OwnerName: newAttribute("label.f_owner.salesrep"),
    /**
     * Display Form Title: Owner
     * Display Form ID: label.f_owner.salesrep.owner
     */ Owner: newAttribute("label.f_owner.salesrep.owner"),
};
/**
 * Attribute Title: Department
 * Attribute ID: f_owner.department_id
 */
export const Department: IAttribute = newAttribute("f_owner.department_id");
/**
 * Attribute Title: Owner Id
 * Attribute ID: f_owner.id
 */
export const OwnerId: IAttribute = newAttribute("f_owner.id");
/**
 * Attribute Title: Region
 * Attribute ID: f_owner.region_id
 */
export const Region: IAttribute = newAttribute("f_owner.region_id");
/**
 * Attribute Title: Product
 * Attribute ID: attr.f_product.product
 */
export const Product = {
    /**
     * Display Form Title: Product Name
     * Display Form ID: label.f_product.product
     */
    Name: newAttribute("label.f_product.product"),
    /**
     * Display Form Title: Product
     * Display Form ID: label.f_product.product.productid
     */ Default: newAttribute("label.f_product.product.productid"),
};
/**
 * Attribute Title: Product Id
 * Attribute ID: f_product.id
 */
export const ProductId: IAttribute = newAttribute("f_product.id");
/**
 * Attribute Title: Stage Name
 * Attribute ID: attr.f_stage.stagename
 */
export const StageName = {
    /**
     * Display Form Title: Stage Name
     * Display Form ID: label.f_stage.stagename
     */
    Default: newAttribute("label.f_stage.stagename"),
    /**
     * Display Form Title: Order
     * Display Form ID: label.f_stage.stagename.order
     */ Order: newAttribute("label.f_stage.stagename.order"),
    /**
     * Display Form Title: Stage Name
     * Display Form ID: label.f_stage.stagename.stagename
     */ _1: newAttribute("label.f_stage.stagename.stagename"),
};
/**
 * Attribute Title: Stage Id
 * Attribute ID: f_stage.id
 */
export const StageId: IAttribute = newAttribute("f_stage.id");
/**
 * Attribute Title: Is Active?
 * Attribute ID: f_stage.isactive_id
 */
export const IsActive: IAttribute = newAttribute("f_stage.isactive_id");
/**
 * Attribute Title: Is Closed?
 * Attribute ID: f_stage.isclosed_id
 */
export const IsClosed_1: IAttribute = newAttribute("f_stage.isclosed_id");
/**
 * Attribute Title: Is Won?
 * Attribute ID: f_stage.iswon_id
 */
export const IsWon: IAttribute = newAttribute("f_stage.iswon_id");
/**
 * Attribute Title: Status
 * Attribute ID: f_stage.status_id
 */
export const Status_1: IAttribute = newAttribute("f_stage.status_id");
/**
 * Attribute Title: Stage History
 * Attribute ID: attr.f_stagehistory.stagehistory
 */
export const StageHistory: IAttribute = newAttribute("label.f_stagehistory.stagehistory");
/**
 * Attribute Title: Stage History Id
 * Attribute ID: f_stagehistory.id
 */
export const StageHistoryId: IAttribute = newAttribute("f_stagehistory.id");
/**
 * Attribute Title: Timeline
 * Attribute ID: f_timeline.id
 */
export const Timeline: IAttribute = newAttribute("f_timeline.id");
/**
 * Metric Title: Sample XIRR
 * Metric ID: 1327700d-6708-4fce-8615-bd737c0efffd
 * Metric Type: MAQL Metric
 */
export const SampleXIRR: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("1327700d-6708-4fce-8615-bd737c0efffd", "measure"),
);
/**
 * Metric Title: Won
 * Metric ID: 58b9cb35-f532-4da2-a895-fc012454f7e7
 * Metric Type: MAQL Metric
 */
export const Won: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("58b9cb35-f532-4da2-a895-fc012454f7e7", "measure"),
);
/**
 * Metric Title: _Timeline [EOP]
 * Metric ID: 6b1411d5-e253-418e-8fd3-137a9f56ea92
 * Metric Type: MAQL Metric
 */
export const TimelineEOP: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("6b1411d5-e253-418e-8fd3-137a9f56ea92", "measure"),
);
/**
 * Metric Title: # of Opportunities
 * Metric ID: 768414e1-4bbe-4f01-b125-0cdc6305dc76
 * Metric Type: MAQL Metric
 */
export const NrOfOpportunities: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("768414e1-4bbe-4f01-b125-0cdc6305dc76", "measure"),
);
/**
 * Metric Title: Amount
 * Metric ID: 87a053b0-3947-49f3-b0c5-de53fd01f050
 * Metric Type: MAQL Metric
 */
export const Amount: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("87a053b0-3947-49f3-b0c5-de53fd01f050", "measure"),
);
/**
 * Metric Title: # Of Opportunities Won
 * Metric ID: 8d33a0b1-cfdf-4074-a26a-4c4357774967
 * Metric Type: MAQL Metric
 */
export const NrOfOpportunitiesWon: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("8d33a0b1-cfdf-4074-a26a-4c4357774967", "measure"),
);
/**
 * Metric Title: Win Rate
 * Metric ID: 973a14c4-acb1-45fb-ba52-5d96fa02f7ba
 * Metric Type: MAQL Metric
 */
export const WinRate: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("973a14c4-acb1-45fb-ba52-5d96fa02f7ba", "measure"),
);
/**
 * Metric Title: Probability
 * Metric ID: b4e3e3c7-ead3-4d69-8be4-23bcfe5ff7aa
 * Metric Type: MAQL Metric
 */
export const Probability: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("b4e3e3c7-ead3-4d69-8be4-23bcfe5ff7aa", "measure"),
);
/**
 * Metric Title: _Snapshot [EOP]
 * Metric ID: c5ee7836-126c-41aa-bd69-1873d379a065
 * Metric Type: MAQL Metric
 */
export const SnapshotEOP: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("c5ee7836-126c-41aa-bd69-1873d379a065", "measure"),
);
/**
 * Metric Title: _Close [EOP]
 * Metric ID: 1179c888-3d63-452c-bd1a-0a2a0a5caa06
 * Metric Type: MAQL Metric
 */
export const CloseEOP: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("1179c888-3d63-452c-bd1a-0a2a0a5caa06", "measure"),
);
/**
 * Metric Title: metricAmountPercent
 * Metric ID: 325d8a8e-d6f2-4151-b49e-d6e6e81563d0
 * Metric Type: MAQL Metric
 */
export const MetricAmountPercent: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("325d8a8e-d6f2-4151-b49e-d6e6e81563d0", "measure"),
);
/**
 * Metric Title: metricCloseEOPPercent
 * Metric ID: 6d7de3ba-3747-11ec-8d3d-0242ac130003
 * Metric Type: MAQL Metric
 */
export const MetricCloseEOPPercent: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("6d7de3ba-3747-11ec-8d3d-0242ac130003", "measure"),
);
/**
 * Metric Title: # of Activities
 * Metric ID: bb512c36-4627-4dd8-8b92-3ef5d364e8f5
 * Metric Type: MAQL Metric
 */
export const NrOfActivities: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("bb512c36-4627-4dd8-8b92-3ef5d364e8f5", "measure"),
);
/**
 * Metric Title: # of Lost Opps.
 * Metric ID: number_of_lost_opps
 * Metric Type: MAQL Metric
 */
export const NrOfLostOpps: IMeasure<IMeasureDefinition> = newMeasure(idRef("number_of_lost_opps", "measure"));
/**
 * Metric Title: _Timeline [BOP]
 * Metric ID: timeline_bop
 * Metric Type: MAQL Metric
 */
export const TimelineBOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("timeline_bop", "measure"));
/**
 * Metric Title: _Snapshot [BOP]
 * Metric ID: snapshot_bop
 * Metric Type: MAQL Metric
 */
export const SnapshotBOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("snapshot_bop", "measure"));
/**
 * Metric Title: Amount [BOP]
 * Metric ID: amount_bop
 * Metric Type: MAQL Metric
 */
export const AmountBOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("amount_bop", "measure"));
/**
 * Metric Title: Best Case
 * Metric ID: best_case
 * Metric Type: MAQL Metric
 */
export const BestCase: IMeasure<IMeasureDefinition> = newMeasure(idRef("best_case", "measure"));
/**
 * Metric Title: _Opp. First Snapshot
 * Metric ID: opp._first_snapshot
 * Metric Type: MAQL Metric
 */
export const OppFirstSnapshot: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("opp._first_snapshot", "measure"),
);
/**
 * Metric Title: Avg. Amount
 * Metric ID: avg_amount
 * Metric Type: MAQL Metric
 */
export const AvgAmount: IMeasure<IMeasureDefinition> = newMeasure(idRef("avg_amount", "measure"));
/**
 * Metric Title: # of Won Opps.
 * Metric ID: of_won_opps
 * Metric Type: MAQL Metric
 */
export const NrOfWonOpps: IMeasure<IMeasureDefinition> = newMeasure(idRef("of_won_opps", "measure"));
/**
 * Fact Title: Activity (Date)
 * Fact ID: fact.f_activity.activitydate
 */
export const ActivityDate = {
    /**
     * Fact Title: Activity (Date)
     * Fact ID: fact.f_activity.activitydate
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("fact.f_activity.activitydate", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Activity (Date)
     * Fact ID: fact.f_activity.activitydate
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("fact.f_activity.activitydate", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Activity (Date)
     * Fact ID: fact.f_activity.activitydate
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("fact.f_activity.activitydate", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Activity (Date)
     * Fact ID: fact.f_activity.activitydate
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("fact.f_activity.activitydate", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Activity (Date)
     * Fact ID: fact.f_activity.activitydate
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("fact.f_activity.activitydate", "fact"), (m) => m.aggregation("median")),
    /**
     * Fact Title: Activity (Date)
     * Fact ID: fact.f_activity.activitydate
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("fact.f_activity.activitydate", "fact"), (m) => m.aggregation("runsum")),
};
/**
 * Fact Title: Opp. Created (Date)
 * Fact ID: fact.f_opportunity.oppcreateddate
 */
export const OppCreatedDate = {
    /**
     * Fact Title: Opp. Created (Date)
     * Fact ID: fact.f_opportunity.oppcreateddate
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("fact.f_opportunity.oppcreateddate", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Opp. Created (Date)
     * Fact ID: fact.f_opportunity.oppcreateddate
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("fact.f_opportunity.oppcreateddate", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Opp. Created (Date)
     * Fact ID: fact.f_opportunity.oppcreateddate
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("fact.f_opportunity.oppcreateddate", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Opp. Created (Date)
     * Fact ID: fact.f_opportunity.oppcreateddate
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("fact.f_opportunity.oppcreateddate", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Opp. Created (Date)
     * Fact ID: fact.f_opportunity.oppcreateddate
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("fact.f_opportunity.oppcreateddate", "fact"), (m) =>
        m.aggregation("median"),
    ),
    /**
     * Fact Title: Opp. Created (Date)
     * Fact ID: fact.f_opportunity.oppcreateddate
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("fact.f_opportunity.oppcreateddate", "fact"), (m) =>
        m.aggregation("runsum"),
    ),
};
/**
 * Fact Title: Amount
 * Fact ID: f_opportunitysnapshot.f_amount
 */
export const Amount_1 = {
    /**
     * Fact Title: Amount
     * Fact ID: f_opportunitysnapshot.f_amount
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("f_opportunitysnapshot.f_amount", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Amount
     * Fact ID: f_opportunitysnapshot.f_amount
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("f_opportunitysnapshot.f_amount", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Amount
     * Fact ID: f_opportunitysnapshot.f_amount
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("f_opportunitysnapshot.f_amount", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Amount
     * Fact ID: f_opportunitysnapshot.f_amount
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("f_opportunitysnapshot.f_amount", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Amount
     * Fact ID: f_opportunitysnapshot.f_amount
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("f_opportunitysnapshot.f_amount", "fact"), (m) => m.aggregation("median")),
    /**
     * Fact Title: Amount
     * Fact ID: f_opportunitysnapshot.f_amount
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("f_opportunitysnapshot.f_amount", "fact"), (m) => m.aggregation("runsum")),
};
/**
 * Fact Title: Days to Close
 * Fact ID: f_opportunitysnapshot.f_daystoclose
 */
export const DaysToClose = {
    /**
     * Fact Title: Days to Close
     * Fact ID: f_opportunitysnapshot.f_daystoclose
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("f_opportunitysnapshot.f_daystoclose", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Days to Close
     * Fact ID: f_opportunitysnapshot.f_daystoclose
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("f_opportunitysnapshot.f_daystoclose", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Days to Close
     * Fact ID: f_opportunitysnapshot.f_daystoclose
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("f_opportunitysnapshot.f_daystoclose", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Days to Close
     * Fact ID: f_opportunitysnapshot.f_daystoclose
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("f_opportunitysnapshot.f_daystoclose", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Days to Close
     * Fact ID: f_opportunitysnapshot.f_daystoclose
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("f_opportunitysnapshot.f_daystoclose", "fact"), (m) =>
        m.aggregation("median"),
    ),
    /**
     * Fact Title: Days to Close
     * Fact ID: f_opportunitysnapshot.f_daystoclose
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("f_opportunitysnapshot.f_daystoclose", "fact"), (m) =>
        m.aggregation("runsum"),
    ),
};
/**
 * Fact Title: Probability
 * Fact ID: f_opportunitysnapshot.f_probability
 */
export const Probability_1 = {
    /**
     * Fact Title: Probability
     * Fact ID: f_opportunitysnapshot.f_probability
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("f_opportunitysnapshot.f_probability", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Probability
     * Fact ID: f_opportunitysnapshot.f_probability
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("f_opportunitysnapshot.f_probability", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Probability
     * Fact ID: f_opportunitysnapshot.f_probability
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("f_opportunitysnapshot.f_probability", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Probability
     * Fact ID: f_opportunitysnapshot.f_probability
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("f_opportunitysnapshot.f_probability", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Probability
     * Fact ID: f_opportunitysnapshot.f_probability
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("f_opportunitysnapshot.f_probability", "fact"), (m) =>
        m.aggregation("median"),
    ),
    /**
     * Fact Title: Probability
     * Fact ID: f_opportunitysnapshot.f_probability
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("f_opportunitysnapshot.f_probability", "fact"), (m) =>
        m.aggregation("runsum"),
    ),
};
/**
 * Fact Title: Opp. Close (Date)
 * Fact ID: fact.f_opportunitysnapshot.oppclosedate
 */
export const OppCloseDate = {
    /**
     * Fact Title: Opp. Close (Date)
     * Fact ID: fact.f_opportunitysnapshot.oppclosedate
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("fact.f_opportunitysnapshot.oppclosedate", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Opp. Close (Date)
     * Fact ID: fact.f_opportunitysnapshot.oppclosedate
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("fact.f_opportunitysnapshot.oppclosedate", "fact"), (m) =>
        m.aggregation("avg"),
    ),
    /**
     * Fact Title: Opp. Close (Date)
     * Fact ID: fact.f_opportunitysnapshot.oppclosedate
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("fact.f_opportunitysnapshot.oppclosedate", "fact"), (m) =>
        m.aggregation("min"),
    ),
    /**
     * Fact Title: Opp. Close (Date)
     * Fact ID: fact.f_opportunitysnapshot.oppclosedate
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("fact.f_opportunitysnapshot.oppclosedate", "fact"), (m) =>
        m.aggregation("max"),
    ),
    /**
     * Fact Title: Opp. Close (Date)
     * Fact ID: fact.f_opportunitysnapshot.oppclosedate
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("fact.f_opportunitysnapshot.oppclosedate", "fact"), (m) =>
        m.aggregation("median"),
    ),
    /**
     * Fact Title: Opp. Close (Date)
     * Fact ID: fact.f_opportunitysnapshot.oppclosedate
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("fact.f_opportunitysnapshot.oppclosedate", "fact"), (m) =>
        m.aggregation("runsum"),
    ),
};
/**
 * Fact Title: Opp. Snapshot (Date)
 * Fact ID: fact.f_opportunitysnapshot.oppsnapshotdate
 */
export const OppSnapshotDate = {
    /**
     * Fact Title: Opp. Snapshot (Date)
     * Fact ID: fact.f_opportunitysnapshot.oppsnapshotdate
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("fact.f_opportunitysnapshot.oppsnapshotdate", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Opp. Snapshot (Date)
     * Fact ID: fact.f_opportunitysnapshot.oppsnapshotdate
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("fact.f_opportunitysnapshot.oppsnapshotdate", "fact"), (m) =>
        m.aggregation("avg"),
    ),
    /**
     * Fact Title: Opp. Snapshot (Date)
     * Fact ID: fact.f_opportunitysnapshot.oppsnapshotdate
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("fact.f_opportunitysnapshot.oppsnapshotdate", "fact"), (m) =>
        m.aggregation("min"),
    ),
    /**
     * Fact Title: Opp. Snapshot (Date)
     * Fact ID: fact.f_opportunitysnapshot.oppsnapshotdate
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("fact.f_opportunitysnapshot.oppsnapshotdate", "fact"), (m) =>
        m.aggregation("max"),
    ),
    /**
     * Fact Title: Opp. Snapshot (Date)
     * Fact ID: fact.f_opportunitysnapshot.oppsnapshotdate
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("fact.f_opportunitysnapshot.oppsnapshotdate", "fact"), (m) =>
        m.aggregation("median"),
    ),
    /**
     * Fact Title: Opp. Snapshot (Date)
     * Fact ID: fact.f_opportunitysnapshot.oppsnapshotdate
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("fact.f_opportunitysnapshot.oppsnapshotdate", "fact"), (m) =>
        m.aggregation("runsum"),
    ),
};
/**
 * Fact Title: Duration
 * Fact ID: f_stagehistory.f_duration
 */
export const Duration = {
    /**
     * Fact Title: Duration
     * Fact ID: f_stagehistory.f_duration
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("f_stagehistory.f_duration", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Duration
     * Fact ID: f_stagehistory.f_duration
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("f_stagehistory.f_duration", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Duration
     * Fact ID: f_stagehistory.f_duration
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("f_stagehistory.f_duration", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Duration
     * Fact ID: f_stagehistory.f_duration
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("f_stagehistory.f_duration", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Duration
     * Fact ID: f_stagehistory.f_duration
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("f_stagehistory.f_duration", "fact"), (m) => m.aggregation("median")),
    /**
     * Fact Title: Duration
     * Fact ID: f_stagehistory.f_duration
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("f_stagehistory.f_duration", "fact"), (m) => m.aggregation("runsum")),
};
/**
 * Fact Title: Velocity
 * Fact ID: f_stagehistory.f_velocity
 */
export const Velocity = {
    /**
     * Fact Title: Velocity
     * Fact ID: f_stagehistory.f_velocity
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("f_stagehistory.f_velocity", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Velocity
     * Fact ID: f_stagehistory.f_velocity
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("f_stagehistory.f_velocity", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Velocity
     * Fact ID: f_stagehistory.f_velocity
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("f_stagehistory.f_velocity", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Velocity
     * Fact ID: f_stagehistory.f_velocity
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("f_stagehistory.f_velocity", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Velocity
     * Fact ID: f_stagehistory.f_velocity
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("f_stagehistory.f_velocity", "fact"), (m) => m.aggregation("median")),
    /**
     * Fact Title: Velocity
     * Fact ID: f_stagehistory.f_velocity
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("f_stagehistory.f_velocity", "fact"), (m) => m.aggregation("runsum")),
};
/**
 * Fact Title: Timeline (Date)
 * Fact ID: fact.f_timeline.timelinedate
 */
export const TimelineDate = {
    /**
     * Fact Title: Timeline (Date)
     * Fact ID: fact.f_timeline.timelinedate
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("fact.f_timeline.timelinedate", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Timeline (Date)
     * Fact ID: fact.f_timeline.timelinedate
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("fact.f_timeline.timelinedate", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Timeline (Date)
     * Fact ID: fact.f_timeline.timelinedate
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("fact.f_timeline.timelinedate", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Timeline (Date)
     * Fact ID: fact.f_timeline.timelinedate
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("fact.f_timeline.timelinedate", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Timeline (Date)
     * Fact ID: fact.f_timeline.timelinedate
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("fact.f_timeline.timelinedate", "fact"), (m) => m.aggregation("median")),
    /**
     * Fact Title: Timeline (Date)
     * Fact ID: fact.f_timeline.timelinedate
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("fact.f_timeline.timelinedate", "fact"), (m) => m.aggregation("runsum")),
};
/**
 * Attribute Title: Activity - Minute
 * Attribute ID: dt_activity_timestamp.minute
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityMinute: IAttribute = newAttribute("dt_activity_timestamp.minute");
/**
 * Attribute Title: Activity - Hour
 * Attribute ID: dt_activity_timestamp.hour
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityHour: IAttribute = newAttribute("dt_activity_timestamp.hour");
/**
 * Attribute Title: Activity - Date
 * Attribute ID: dt_activity_timestamp.day
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityDate_1: IAttribute = newAttribute("dt_activity_timestamp.day");
/**
 * Attribute Title: Activity - Week/Year
 * Attribute ID: dt_activity_timestamp.week
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityWeekYear: IAttribute = newAttribute("dt_activity_timestamp.week");
/**
 * Attribute Title: Activity - Month/Year
 * Attribute ID: dt_activity_timestamp.month
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityMonthYear: IAttribute = newAttribute("dt_activity_timestamp.month");
/**
 * Attribute Title: Activity - Quarter/Year
 * Attribute ID: dt_activity_timestamp.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityQuarterYear: IAttribute = newAttribute("dt_activity_timestamp.quarter");
/**
 * Attribute Title: Activity - Year
 * Attribute ID: dt_activity_timestamp.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityYear: IAttribute = newAttribute("dt_activity_timestamp.year");
/**
 * Attribute Title: Activity - Minute of Hour
 * Attribute ID: dt_activity_timestamp.minuteOfHour
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityMinuteOfHour: IAttribute = newAttribute("dt_activity_timestamp.minuteOfHour");
/**
 * Attribute Title: Activity - Hour of Day
 * Attribute ID: dt_activity_timestamp.hourOfDay
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityHourOfDay: IAttribute = newAttribute("dt_activity_timestamp.hourOfDay");
/**
 * Attribute Title: Activity - Day of Week
 * Attribute ID: dt_activity_timestamp.dayOfWeek
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityDayOfWeek: IAttribute = newAttribute("dt_activity_timestamp.dayOfWeek");
/**
 * Attribute Title: Activity - Day of Month
 * Attribute ID: dt_activity_timestamp.dayOfMonth
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityDayOfMonth: IAttribute = newAttribute("dt_activity_timestamp.dayOfMonth");
/**
 * Attribute Title: Activity - Day of Year
 * Attribute ID: dt_activity_timestamp.dayOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityDayOfYear: IAttribute = newAttribute("dt_activity_timestamp.dayOfYear");
/**
 * Attribute Title: Activity - Week of Year
 * Attribute ID: dt_activity_timestamp.weekOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityWeekOfYear: IAttribute = newAttribute("dt_activity_timestamp.weekOfYear");
/**
 * Attribute Title: Activity - Month of Year
 * Attribute ID: dt_activity_timestamp.monthOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityMonthOfYear: IAttribute = newAttribute("dt_activity_timestamp.monthOfYear");
/**
 * Attribute Title: Activity - Quarter of Year
 * Attribute ID: dt_activity_timestamp.quarterOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityQuarterOfYear: IAttribute = newAttribute("dt_activity_timestamp.quarterOfYear");
/**
 * Attribute Title: Closed - Minute
 * Attribute ID: dt_closedate_timestamp.minute
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedMinute: IAttribute = newAttribute("dt_closedate_timestamp.minute");
/**
 * Attribute Title: Closed - Hour
 * Attribute ID: dt_closedate_timestamp.hour
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedHour: IAttribute = newAttribute("dt_closedate_timestamp.hour");
/**
 * Attribute Title: Closed - Date
 * Attribute ID: dt_closedate_timestamp.day
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedDate: IAttribute = newAttribute("dt_closedate_timestamp.day");
/**
 * Attribute Title: Closed - Week/Year
 * Attribute ID: dt_closedate_timestamp.week
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedWeekYear: IAttribute = newAttribute("dt_closedate_timestamp.week");
/**
 * Attribute Title: Closed - Month/Year
 * Attribute ID: dt_closedate_timestamp.month
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedMonthYear: IAttribute = newAttribute("dt_closedate_timestamp.month");
/**
 * Attribute Title: Closed - Quarter/Year
 * Attribute ID: dt_closedate_timestamp.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedQuarterYear: IAttribute = newAttribute("dt_closedate_timestamp.quarter");
/**
 * Attribute Title: Closed - Year
 * Attribute ID: dt_closedate_timestamp.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedYear: IAttribute = newAttribute("dt_closedate_timestamp.year");
/**
 * Attribute Title: Closed - Minute of Hour
 * Attribute ID: dt_closedate_timestamp.minuteOfHour
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedMinuteOfHour: IAttribute = newAttribute("dt_closedate_timestamp.minuteOfHour");
/**
 * Attribute Title: Closed - Hour of Day
 * Attribute ID: dt_closedate_timestamp.hourOfDay
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedHourOfDay: IAttribute = newAttribute("dt_closedate_timestamp.hourOfDay");
/**
 * Attribute Title: Closed - Day of Week
 * Attribute ID: dt_closedate_timestamp.dayOfWeek
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedDayOfWeek: IAttribute = newAttribute("dt_closedate_timestamp.dayOfWeek");
/**
 * Attribute Title: Closed - Day of Month
 * Attribute ID: dt_closedate_timestamp.dayOfMonth
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedDayOfMonth: IAttribute = newAttribute("dt_closedate_timestamp.dayOfMonth");
/**
 * Attribute Title: Closed - Day of Year
 * Attribute ID: dt_closedate_timestamp.dayOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedDayOfYear: IAttribute = newAttribute("dt_closedate_timestamp.dayOfYear");
/**
 * Attribute Title: Closed - Week of Year
 * Attribute ID: dt_closedate_timestamp.weekOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedWeekOfYear: IAttribute = newAttribute("dt_closedate_timestamp.weekOfYear");
/**
 * Attribute Title: Closed - Month of Year
 * Attribute ID: dt_closedate_timestamp.monthOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedMonthOfYear: IAttribute = newAttribute("dt_closedate_timestamp.monthOfYear");
/**
 * Attribute Title: Closed - Quarter of Year
 * Attribute ID: dt_closedate_timestamp.quarterOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedQuarterOfYear: IAttribute = newAttribute("dt_closedate_timestamp.quarterOfYear");
/**
 * Attribute Title: Created - Minute
 * Attribute ID: dt_oppcreated_timestamp.minute
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedMinute: IAttribute = newAttribute("dt_oppcreated_timestamp.minute");
/**
 * Attribute Title: Created - Hour
 * Attribute ID: dt_oppcreated_timestamp.hour
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedHour: IAttribute = newAttribute("dt_oppcreated_timestamp.hour");
/**
 * Attribute Title: Created - Date
 * Attribute ID: dt_oppcreated_timestamp.day
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedDate: IAttribute = newAttribute("dt_oppcreated_timestamp.day");
/**
 * Attribute Title: Created - Week/Year
 * Attribute ID: dt_oppcreated_timestamp.week
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedWeekYear: IAttribute = newAttribute("dt_oppcreated_timestamp.week");
/**
 * Attribute Title: Created - Month/Year
 * Attribute ID: dt_oppcreated_timestamp.month
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedMonthYear: IAttribute = newAttribute("dt_oppcreated_timestamp.month");
/**
 * Attribute Title: Created - Quarter/Year
 * Attribute ID: dt_oppcreated_timestamp.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedQuarterYear: IAttribute = newAttribute("dt_oppcreated_timestamp.quarter");
/**
 * Attribute Title: Created - Year
 * Attribute ID: dt_oppcreated_timestamp.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedYear: IAttribute = newAttribute("dt_oppcreated_timestamp.year");
/**
 * Attribute Title: Created - Minute of Hour
 * Attribute ID: dt_oppcreated_timestamp.minuteOfHour
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedMinuteOfHour: IAttribute = newAttribute("dt_oppcreated_timestamp.minuteOfHour");
/**
 * Attribute Title: Created - Hour of Day
 * Attribute ID: dt_oppcreated_timestamp.hourOfDay
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedHourOfDay: IAttribute = newAttribute("dt_oppcreated_timestamp.hourOfDay");
/**
 * Attribute Title: Created - Day of Week
 * Attribute ID: dt_oppcreated_timestamp.dayOfWeek
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedDayOfWeek: IAttribute = newAttribute("dt_oppcreated_timestamp.dayOfWeek");
/**
 * Attribute Title: Created - Day of Month
 * Attribute ID: dt_oppcreated_timestamp.dayOfMonth
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedDayOfMonth: IAttribute = newAttribute("dt_oppcreated_timestamp.dayOfMonth");
/**
 * Attribute Title: Created - Day of Year
 * Attribute ID: dt_oppcreated_timestamp.dayOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedDayOfYear: IAttribute = newAttribute("dt_oppcreated_timestamp.dayOfYear");
/**
 * Attribute Title: Created - Week of Year
 * Attribute ID: dt_oppcreated_timestamp.weekOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedWeekOfYear: IAttribute = newAttribute("dt_oppcreated_timestamp.weekOfYear");
/**
 * Attribute Title: Created - Month of Year
 * Attribute ID: dt_oppcreated_timestamp.monthOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedMonthOfYear: IAttribute = newAttribute("dt_oppcreated_timestamp.monthOfYear");
/**
 * Attribute Title: Created - Quarter of Year
 * Attribute ID: dt_oppcreated_timestamp.quarterOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedQuarterOfYear: IAttribute = newAttribute("dt_oppcreated_timestamp.quarterOfYear");
/**
 * Attribute Title: Snapshot - Minute
 * Attribute ID: dt_snapshotdate_timestamp.minute
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotMinute: IAttribute = newAttribute("dt_snapshotdate_timestamp.minute");
/**
 * Attribute Title: Snapshot - Hour
 * Attribute ID: dt_snapshotdate_timestamp.hour
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotHour: IAttribute = newAttribute("dt_snapshotdate_timestamp.hour");
/**
 * Attribute Title: Snapshot - Date
 * Attribute ID: dt_snapshotdate_timestamp.day
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotDate: IAttribute = newAttribute("dt_snapshotdate_timestamp.day");
/**
 * Attribute Title: Snapshot - Week/Year
 * Attribute ID: dt_snapshotdate_timestamp.week
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotWeekYear: IAttribute = newAttribute("dt_snapshotdate_timestamp.week");
/**
 * Attribute Title: Snapshot - Month/Year
 * Attribute ID: dt_snapshotdate_timestamp.month
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotMonthYear: IAttribute = newAttribute("dt_snapshotdate_timestamp.month");
/**
 * Attribute Title: Snapshot - Quarter/Year
 * Attribute ID: dt_snapshotdate_timestamp.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotQuarterYear: IAttribute = newAttribute("dt_snapshotdate_timestamp.quarter");
/**
 * Attribute Title: Snapshot - Year
 * Attribute ID: dt_snapshotdate_timestamp.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotYear: IAttribute = newAttribute("dt_snapshotdate_timestamp.year");
/**
 * Attribute Title: Snapshot - Minute of Hour
 * Attribute ID: dt_snapshotdate_timestamp.minuteOfHour
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotMinuteOfHour: IAttribute = newAttribute("dt_snapshotdate_timestamp.minuteOfHour");
/**
 * Attribute Title: Snapshot - Hour of Day
 * Attribute ID: dt_snapshotdate_timestamp.hourOfDay
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotHourOfDay: IAttribute = newAttribute("dt_snapshotdate_timestamp.hourOfDay");
/**
 * Attribute Title: Snapshot - Day of Week
 * Attribute ID: dt_snapshotdate_timestamp.dayOfWeek
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotDayOfWeek: IAttribute = newAttribute("dt_snapshotdate_timestamp.dayOfWeek");
/**
 * Attribute Title: Snapshot - Day of Month
 * Attribute ID: dt_snapshotdate_timestamp.dayOfMonth
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotDayOfMonth: IAttribute = newAttribute("dt_snapshotdate_timestamp.dayOfMonth");
/**
 * Attribute Title: Snapshot - Day of Year
 * Attribute ID: dt_snapshotdate_timestamp.dayOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotDayOfYear: IAttribute = newAttribute("dt_snapshotdate_timestamp.dayOfYear");
/**
 * Attribute Title: Snapshot - Week of Year
 * Attribute ID: dt_snapshotdate_timestamp.weekOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotWeekOfYear: IAttribute = newAttribute("dt_snapshotdate_timestamp.weekOfYear");
/**
 * Attribute Title: Snapshot - Month of Year
 * Attribute ID: dt_snapshotdate_timestamp.monthOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotMonthOfYear: IAttribute = newAttribute("dt_snapshotdate_timestamp.monthOfYear");
/**
 * Attribute Title: Snapshot - Quarter of Year
 * Attribute ID: dt_snapshotdate_timestamp.quarterOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotQuarterOfYear: IAttribute = newAttribute("dt_snapshotdate_timestamp.quarterOfYear");
/**
 * Attribute Title: Timeline - Minute
 * Attribute ID: dt_timeline_timestamp.minute
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineMinute: IAttribute = newAttribute("dt_timeline_timestamp.minute");
/**
 * Attribute Title: Timeline - Hour
 * Attribute ID: dt_timeline_timestamp.hour
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineHour: IAttribute = newAttribute("dt_timeline_timestamp.hour");
/**
 * Attribute Title: Timeline - Date
 * Attribute ID: dt_timeline_timestamp.day
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineDate_1: IAttribute = newAttribute("dt_timeline_timestamp.day");
/**
 * Attribute Title: Timeline - Week/Year
 * Attribute ID: dt_timeline_timestamp.week
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineWeekYear: IAttribute = newAttribute("dt_timeline_timestamp.week");
/**
 * Attribute Title: Timeline - Month/Year
 * Attribute ID: dt_timeline_timestamp.month
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineMonthYear: IAttribute = newAttribute("dt_timeline_timestamp.month");
/**
 * Attribute Title: Timeline - Quarter/Year
 * Attribute ID: dt_timeline_timestamp.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineQuarterYear: IAttribute = newAttribute("dt_timeline_timestamp.quarter");
/**
 * Attribute Title: Timeline - Year
 * Attribute ID: dt_timeline_timestamp.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineYear: IAttribute = newAttribute("dt_timeline_timestamp.year");
/**
 * Attribute Title: Timeline - Minute of Hour
 * Attribute ID: dt_timeline_timestamp.minuteOfHour
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineMinuteOfHour: IAttribute = newAttribute("dt_timeline_timestamp.minuteOfHour");
/**
 * Attribute Title: Timeline - Hour of Day
 * Attribute ID: dt_timeline_timestamp.hourOfDay
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineHourOfDay: IAttribute = newAttribute("dt_timeline_timestamp.hourOfDay");
/**
 * Attribute Title: Timeline - Day of Week
 * Attribute ID: dt_timeline_timestamp.dayOfWeek
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineDayOfWeek: IAttribute = newAttribute("dt_timeline_timestamp.dayOfWeek");
/**
 * Attribute Title: Timeline - Day of Month
 * Attribute ID: dt_timeline_timestamp.dayOfMonth
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineDayOfMonth: IAttribute = newAttribute("dt_timeline_timestamp.dayOfMonth");
/**
 * Attribute Title: Timeline - Day of Year
 * Attribute ID: dt_timeline_timestamp.dayOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineDayOfYear: IAttribute = newAttribute("dt_timeline_timestamp.dayOfYear");
/**
 * Attribute Title: Timeline - Week of Year
 * Attribute ID: dt_timeline_timestamp.weekOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineWeekOfYear: IAttribute = newAttribute("dt_timeline_timestamp.weekOfYear");
/**
 * Attribute Title: Timeline - Month of Year
 * Attribute ID: dt_timeline_timestamp.monthOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineMonthOfYear: IAttribute = newAttribute("dt_timeline_timestamp.monthOfYear");
/**
 * Attribute Title: Timeline - Quarter of Year
 * Attribute ID: dt_timeline_timestamp.quarterOfYear
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineQuarterOfYear: IAttribute = newAttribute("dt_timeline_timestamp.quarterOfYear");
/** Available Date Data Sets */
export const DateDatasets = {
    /**
     * Date Data Set Title: Activity
     * Date Data Set ID: dt_activity_timestamp
     */
    Activity: {
        ref: idRef("dt_activity_timestamp", "dataSet"),
        identifier: "dt_activity_timestamp",
        /**
         * Date Attribute: Activity - Minute
         * Date Attribute ID: dt_activity_timestamp.minute
         */ ActivityMinute: {
            ref: idRef("dt_activity_timestamp.minute", "attribute"),
            identifier: "dt_activity_timestamp.minute",
            /**
             * Display Form Title: Activity - Minute
             * Display Form ID: dt_activity_timestamp.minute
             */ Default: newAttribute("dt_activity_timestamp.minute"),
        },
        /**
         * Date Attribute: Activity - Hour
         * Date Attribute ID: dt_activity_timestamp.hour
         */ ActivityHour: {
            ref: idRef("dt_activity_timestamp.hour", "attribute"),
            identifier: "dt_activity_timestamp.hour",
            /**
             * Display Form Title: Activity - Hour
             * Display Form ID: dt_activity_timestamp.hour
             */ Default: newAttribute("dt_activity_timestamp.hour"),
        },
        /**
         * Date Attribute: Activity - Date
         * Date Attribute ID: dt_activity_timestamp.day
         */ ActivityDate: {
            ref: idRef("dt_activity_timestamp.day", "attribute"),
            identifier: "dt_activity_timestamp.day",
            /**
             * Display Form Title: Activity - Date
             * Display Form ID: dt_activity_timestamp.day
             */ Default: newAttribute("dt_activity_timestamp.day"),
        },
        /**
         * Date Attribute: Activity - Week/Year
         * Date Attribute ID: dt_activity_timestamp.week
         */ ActivityWeekYear: {
            ref: idRef("dt_activity_timestamp.week", "attribute"),
            identifier: "dt_activity_timestamp.week",
            /**
             * Display Form Title: Activity - Week/Year
             * Display Form ID: dt_activity_timestamp.week
             */ Default: newAttribute("dt_activity_timestamp.week"),
        },
        /**
         * Date Attribute: Activity - Month/Year
         * Date Attribute ID: dt_activity_timestamp.month
         */ ActivityMonthYear: {
            ref: idRef("dt_activity_timestamp.month", "attribute"),
            identifier: "dt_activity_timestamp.month",
            /**
             * Display Form Title: Activity - Month/Year
             * Display Form ID: dt_activity_timestamp.month
             */ Default: newAttribute("dt_activity_timestamp.month"),
        },
        /**
         * Date Attribute: Activity - Quarter/Year
         * Date Attribute ID: dt_activity_timestamp.quarter
         */ ActivityQuarterYear: {
            ref: idRef("dt_activity_timestamp.quarter", "attribute"),
            identifier: "dt_activity_timestamp.quarter",
            /**
             * Display Form Title: Activity - Quarter/Year
             * Display Form ID: dt_activity_timestamp.quarter
             */ Default: newAttribute("dt_activity_timestamp.quarter"),
        },
        /**
         * Date Attribute: Activity - Year
         * Date Attribute ID: dt_activity_timestamp.year
         */ ActivityYear: {
            ref: idRef("dt_activity_timestamp.year", "attribute"),
            identifier: "dt_activity_timestamp.year",
            /**
             * Display Form Title: Activity - Year
             * Display Form ID: dt_activity_timestamp.year
             */ Default: newAttribute("dt_activity_timestamp.year"),
        },
        /**
         * Date Attribute: Activity - Minute of Hour
         * Date Attribute ID: dt_activity_timestamp.minuteOfHour
         */ ActivityMinuteOfHour: {
            ref: idRef("dt_activity_timestamp.minuteOfHour", "attribute"),
            identifier: "dt_activity_timestamp.minuteOfHour",
            /**
             * Display Form Title: Activity - Minute of Hour
             * Display Form ID: dt_activity_timestamp.minuteOfHour
             */ Default: newAttribute("dt_activity_timestamp.minuteOfHour"),
        },
        /**
         * Date Attribute: Activity - Hour of Day
         * Date Attribute ID: dt_activity_timestamp.hourOfDay
         */ ActivityHourOfDay: {
            ref: idRef("dt_activity_timestamp.hourOfDay", "attribute"),
            identifier: "dt_activity_timestamp.hourOfDay",
            /**
             * Display Form Title: Activity - Hour of Day
             * Display Form ID: dt_activity_timestamp.hourOfDay
             */ Default: newAttribute("dt_activity_timestamp.hourOfDay"),
        },
        /**
         * Date Attribute: Activity - Day of Week
         * Date Attribute ID: dt_activity_timestamp.dayOfWeek
         */ ActivityDayOfWeek: {
            ref: idRef("dt_activity_timestamp.dayOfWeek", "attribute"),
            identifier: "dt_activity_timestamp.dayOfWeek",
            /**
             * Display Form Title: Activity - Day of Week
             * Display Form ID: dt_activity_timestamp.dayOfWeek
             */ Default: newAttribute("dt_activity_timestamp.dayOfWeek"),
        },
        /**
         * Date Attribute: Activity - Day of Month
         * Date Attribute ID: dt_activity_timestamp.dayOfMonth
         */ ActivityDayOfMonth: {
            ref: idRef("dt_activity_timestamp.dayOfMonth", "attribute"),
            identifier: "dt_activity_timestamp.dayOfMonth",
            /**
             * Display Form Title: Activity - Day of Month
             * Display Form ID: dt_activity_timestamp.dayOfMonth
             */ Default: newAttribute("dt_activity_timestamp.dayOfMonth"),
        },
        /**
         * Date Attribute: Activity - Day of Year
         * Date Attribute ID: dt_activity_timestamp.dayOfYear
         */ ActivityDayOfYear: {
            ref: idRef("dt_activity_timestamp.dayOfYear", "attribute"),
            identifier: "dt_activity_timestamp.dayOfYear",
            /**
             * Display Form Title: Activity - Day of Year
             * Display Form ID: dt_activity_timestamp.dayOfYear
             */ Default: newAttribute("dt_activity_timestamp.dayOfYear"),
        },
        /**
         * Date Attribute: Activity - Week of Year
         * Date Attribute ID: dt_activity_timestamp.weekOfYear
         */ ActivityWeekOfYear: {
            ref: idRef("dt_activity_timestamp.weekOfYear", "attribute"),
            identifier: "dt_activity_timestamp.weekOfYear",
            /**
             * Display Form Title: Activity - Week of Year
             * Display Form ID: dt_activity_timestamp.weekOfYear
             */ Default: newAttribute("dt_activity_timestamp.weekOfYear"),
        },
        /**
         * Date Attribute: Activity - Month of Year
         * Date Attribute ID: dt_activity_timestamp.monthOfYear
         */ ActivityMonthOfYear: {
            ref: idRef("dt_activity_timestamp.monthOfYear", "attribute"),
            identifier: "dt_activity_timestamp.monthOfYear",
            /**
             * Display Form Title: Activity - Month of Year
             * Display Form ID: dt_activity_timestamp.monthOfYear
             */ Default: newAttribute("dt_activity_timestamp.monthOfYear"),
        },
        /**
         * Date Attribute: Activity - Quarter of Year
         * Date Attribute ID: dt_activity_timestamp.quarterOfYear
         */ ActivityQuarterOfYear: {
            ref: idRef("dt_activity_timestamp.quarterOfYear", "attribute"),
            identifier: "dt_activity_timestamp.quarterOfYear",
            /**
             * Display Form Title: Activity - Quarter of Year
             * Display Form ID: dt_activity_timestamp.quarterOfYear
             */ Default: newAttribute("dt_activity_timestamp.quarterOfYear"),
        },
    },
    /**
     * Date Data Set Title: Closed
     * Date Data Set ID: dt_closedate_timestamp
     */ Closed: {
        ref: idRef("dt_closedate_timestamp", "dataSet"),
        identifier: "dt_closedate_timestamp",
        /**
         * Date Attribute: Closed - Minute
         * Date Attribute ID: dt_closedate_timestamp.minute
         */ ClosedMinute: {
            ref: idRef("dt_closedate_timestamp.minute", "attribute"),
            identifier: "dt_closedate_timestamp.minute",
            /**
             * Display Form Title: Closed - Minute
             * Display Form ID: dt_closedate_timestamp.minute
             */ Default: newAttribute("dt_closedate_timestamp.minute"),
        },
        /**
         * Date Attribute: Closed - Hour
         * Date Attribute ID: dt_closedate_timestamp.hour
         */ ClosedHour: {
            ref: idRef("dt_closedate_timestamp.hour", "attribute"),
            identifier: "dt_closedate_timestamp.hour",
            /**
             * Display Form Title: Closed - Hour
             * Display Form ID: dt_closedate_timestamp.hour
             */ Default: newAttribute("dt_closedate_timestamp.hour"),
        },
        /**
         * Date Attribute: Closed - Date
         * Date Attribute ID: dt_closedate_timestamp.day
         */ ClosedDate: {
            ref: idRef("dt_closedate_timestamp.day", "attribute"),
            identifier: "dt_closedate_timestamp.day",
            /**
             * Display Form Title: Closed - Date
             * Display Form ID: dt_closedate_timestamp.day
             */ Default: newAttribute("dt_closedate_timestamp.day"),
        },
        /**
         * Date Attribute: Closed - Week/Year
         * Date Attribute ID: dt_closedate_timestamp.week
         */ ClosedWeekYear: {
            ref: idRef("dt_closedate_timestamp.week", "attribute"),
            identifier: "dt_closedate_timestamp.week",
            /**
             * Display Form Title: Closed - Week/Year
             * Display Form ID: dt_closedate_timestamp.week
             */ Default: newAttribute("dt_closedate_timestamp.week"),
        },
        /**
         * Date Attribute: Closed - Month/Year
         * Date Attribute ID: dt_closedate_timestamp.month
         */ ClosedMonthYear: {
            ref: idRef("dt_closedate_timestamp.month", "attribute"),
            identifier: "dt_closedate_timestamp.month",
            /**
             * Display Form Title: Closed - Month/Year
             * Display Form ID: dt_closedate_timestamp.month
             */ Default: newAttribute("dt_closedate_timestamp.month"),
        },
        /**
         * Date Attribute: Closed - Quarter/Year
         * Date Attribute ID: dt_closedate_timestamp.quarter
         */ ClosedQuarterYear: {
            ref: idRef("dt_closedate_timestamp.quarter", "attribute"),
            identifier: "dt_closedate_timestamp.quarter",
            /**
             * Display Form Title: Closed - Quarter/Year
             * Display Form ID: dt_closedate_timestamp.quarter
             */ Default: newAttribute("dt_closedate_timestamp.quarter"),
        },
        /**
         * Date Attribute: Closed - Year
         * Date Attribute ID: dt_closedate_timestamp.year
         */ ClosedYear: {
            ref: idRef("dt_closedate_timestamp.year", "attribute"),
            identifier: "dt_closedate_timestamp.year",
            /**
             * Display Form Title: Closed - Year
             * Display Form ID: dt_closedate_timestamp.year
             */ Default: newAttribute("dt_closedate_timestamp.year"),
        },
        /**
         * Date Attribute: Closed - Minute of Hour
         * Date Attribute ID: dt_closedate_timestamp.minuteOfHour
         */ ClosedMinuteOfHour: {
            ref: idRef("dt_closedate_timestamp.minuteOfHour", "attribute"),
            identifier: "dt_closedate_timestamp.minuteOfHour",
            /**
             * Display Form Title: Closed - Minute of Hour
             * Display Form ID: dt_closedate_timestamp.minuteOfHour
             */ Default: newAttribute("dt_closedate_timestamp.minuteOfHour"),
        },
        /**
         * Date Attribute: Closed - Hour of Day
         * Date Attribute ID: dt_closedate_timestamp.hourOfDay
         */ ClosedHourOfDay: {
            ref: idRef("dt_closedate_timestamp.hourOfDay", "attribute"),
            identifier: "dt_closedate_timestamp.hourOfDay",
            /**
             * Display Form Title: Closed - Hour of Day
             * Display Form ID: dt_closedate_timestamp.hourOfDay
             */ Default: newAttribute("dt_closedate_timestamp.hourOfDay"),
        },
        /**
         * Date Attribute: Closed - Day of Week
         * Date Attribute ID: dt_closedate_timestamp.dayOfWeek
         */ ClosedDayOfWeek: {
            ref: idRef("dt_closedate_timestamp.dayOfWeek", "attribute"),
            identifier: "dt_closedate_timestamp.dayOfWeek",
            /**
             * Display Form Title: Closed - Day of Week
             * Display Form ID: dt_closedate_timestamp.dayOfWeek
             */ Default: newAttribute("dt_closedate_timestamp.dayOfWeek"),
        },
        /**
         * Date Attribute: Closed - Day of Month
         * Date Attribute ID: dt_closedate_timestamp.dayOfMonth
         */ ClosedDayOfMonth: {
            ref: idRef("dt_closedate_timestamp.dayOfMonth", "attribute"),
            identifier: "dt_closedate_timestamp.dayOfMonth",
            /**
             * Display Form Title: Closed - Day of Month
             * Display Form ID: dt_closedate_timestamp.dayOfMonth
             */ Default: newAttribute("dt_closedate_timestamp.dayOfMonth"),
        },
        /**
         * Date Attribute: Closed - Day of Year
         * Date Attribute ID: dt_closedate_timestamp.dayOfYear
         */ ClosedDayOfYear: {
            ref: idRef("dt_closedate_timestamp.dayOfYear", "attribute"),
            identifier: "dt_closedate_timestamp.dayOfYear",
            /**
             * Display Form Title: Closed - Day of Year
             * Display Form ID: dt_closedate_timestamp.dayOfYear
             */ Default: newAttribute("dt_closedate_timestamp.dayOfYear"),
        },
        /**
         * Date Attribute: Closed - Week of Year
         * Date Attribute ID: dt_closedate_timestamp.weekOfYear
         */ ClosedWeekOfYear: {
            ref: idRef("dt_closedate_timestamp.weekOfYear", "attribute"),
            identifier: "dt_closedate_timestamp.weekOfYear",
            /**
             * Display Form Title: Closed - Week of Year
             * Display Form ID: dt_closedate_timestamp.weekOfYear
             */ Default: newAttribute("dt_closedate_timestamp.weekOfYear"),
        },
        /**
         * Date Attribute: Closed - Month of Year
         * Date Attribute ID: dt_closedate_timestamp.monthOfYear
         */ ClosedMonthOfYear: {
            ref: idRef("dt_closedate_timestamp.monthOfYear", "attribute"),
            identifier: "dt_closedate_timestamp.monthOfYear",
            /**
             * Display Form Title: Closed - Month of Year
             * Display Form ID: dt_closedate_timestamp.monthOfYear
             */ Default: newAttribute("dt_closedate_timestamp.monthOfYear"),
        },
        /**
         * Date Attribute: Closed - Quarter of Year
         * Date Attribute ID: dt_closedate_timestamp.quarterOfYear
         */ ClosedQuarterOfYear: {
            ref: idRef("dt_closedate_timestamp.quarterOfYear", "attribute"),
            identifier: "dt_closedate_timestamp.quarterOfYear",
            /**
             * Display Form Title: Closed - Quarter of Year
             * Display Form ID: dt_closedate_timestamp.quarterOfYear
             */ Default: newAttribute("dt_closedate_timestamp.quarterOfYear"),
        },
    },
    /**
     * Date Data Set Title: Created
     * Date Data Set ID: dt_oppcreated_timestamp
     */ Created: {
        ref: idRef("dt_oppcreated_timestamp", "dataSet"),
        identifier: "dt_oppcreated_timestamp",
        /**
         * Date Attribute: Created - Minute
         * Date Attribute ID: dt_oppcreated_timestamp.minute
         */ CreatedMinute: {
            ref: idRef("dt_oppcreated_timestamp.minute", "attribute"),
            identifier: "dt_oppcreated_timestamp.minute",
            /**
             * Display Form Title: Created - Minute
             * Display Form ID: dt_oppcreated_timestamp.minute
             */ Default: newAttribute("dt_oppcreated_timestamp.minute"),
        },
        /**
         * Date Attribute: Created - Hour
         * Date Attribute ID: dt_oppcreated_timestamp.hour
         */ CreatedHour: {
            ref: idRef("dt_oppcreated_timestamp.hour", "attribute"),
            identifier: "dt_oppcreated_timestamp.hour",
            /**
             * Display Form Title: Created - Hour
             * Display Form ID: dt_oppcreated_timestamp.hour
             */ Default: newAttribute("dt_oppcreated_timestamp.hour"),
        },
        /**
         * Date Attribute: Created - Date
         * Date Attribute ID: dt_oppcreated_timestamp.day
         */ CreatedDate: {
            ref: idRef("dt_oppcreated_timestamp.day", "attribute"),
            identifier: "dt_oppcreated_timestamp.day",
            /**
             * Display Form Title: Created - Date
             * Display Form ID: dt_oppcreated_timestamp.day
             */ Default: newAttribute("dt_oppcreated_timestamp.day"),
        },
        /**
         * Date Attribute: Created - Week/Year
         * Date Attribute ID: dt_oppcreated_timestamp.week
         */ CreatedWeekYear: {
            ref: idRef("dt_oppcreated_timestamp.week", "attribute"),
            identifier: "dt_oppcreated_timestamp.week",
            /**
             * Display Form Title: Created - Week/Year
             * Display Form ID: dt_oppcreated_timestamp.week
             */ Default: newAttribute("dt_oppcreated_timestamp.week"),
        },
        /**
         * Date Attribute: Created - Month/Year
         * Date Attribute ID: dt_oppcreated_timestamp.month
         */ CreatedMonthYear: {
            ref: idRef("dt_oppcreated_timestamp.month", "attribute"),
            identifier: "dt_oppcreated_timestamp.month",
            /**
             * Display Form Title: Created - Month/Year
             * Display Form ID: dt_oppcreated_timestamp.month
             */ Default: newAttribute("dt_oppcreated_timestamp.month"),
        },
        /**
         * Date Attribute: Created - Quarter/Year
         * Date Attribute ID: dt_oppcreated_timestamp.quarter
         */ CreatedQuarterYear: {
            ref: idRef("dt_oppcreated_timestamp.quarter", "attribute"),
            identifier: "dt_oppcreated_timestamp.quarter",
            /**
             * Display Form Title: Created - Quarter/Year
             * Display Form ID: dt_oppcreated_timestamp.quarter
             */ Default: newAttribute("dt_oppcreated_timestamp.quarter"),
        },
        /**
         * Date Attribute: Created - Year
         * Date Attribute ID: dt_oppcreated_timestamp.year
         */ CreatedYear: {
            ref: idRef("dt_oppcreated_timestamp.year", "attribute"),
            identifier: "dt_oppcreated_timestamp.year",
            /**
             * Display Form Title: Created - Year
             * Display Form ID: dt_oppcreated_timestamp.year
             */ Default: newAttribute("dt_oppcreated_timestamp.year"),
        },
        /**
         * Date Attribute: Created - Minute of Hour
         * Date Attribute ID: dt_oppcreated_timestamp.minuteOfHour
         */ CreatedMinuteOfHour: {
            ref: idRef("dt_oppcreated_timestamp.minuteOfHour", "attribute"),
            identifier: "dt_oppcreated_timestamp.minuteOfHour",
            /**
             * Display Form Title: Created - Minute of Hour
             * Display Form ID: dt_oppcreated_timestamp.minuteOfHour
             */ Default: newAttribute("dt_oppcreated_timestamp.minuteOfHour"),
        },
        /**
         * Date Attribute: Created - Hour of Day
         * Date Attribute ID: dt_oppcreated_timestamp.hourOfDay
         */ CreatedHourOfDay: {
            ref: idRef("dt_oppcreated_timestamp.hourOfDay", "attribute"),
            identifier: "dt_oppcreated_timestamp.hourOfDay",
            /**
             * Display Form Title: Created - Hour of Day
             * Display Form ID: dt_oppcreated_timestamp.hourOfDay
             */ Default: newAttribute("dt_oppcreated_timestamp.hourOfDay"),
        },
        /**
         * Date Attribute: Created - Day of Week
         * Date Attribute ID: dt_oppcreated_timestamp.dayOfWeek
         */ CreatedDayOfWeek: {
            ref: idRef("dt_oppcreated_timestamp.dayOfWeek", "attribute"),
            identifier: "dt_oppcreated_timestamp.dayOfWeek",
            /**
             * Display Form Title: Created - Day of Week
             * Display Form ID: dt_oppcreated_timestamp.dayOfWeek
             */ Default: newAttribute("dt_oppcreated_timestamp.dayOfWeek"),
        },
        /**
         * Date Attribute: Created - Day of Month
         * Date Attribute ID: dt_oppcreated_timestamp.dayOfMonth
         */ CreatedDayOfMonth: {
            ref: idRef("dt_oppcreated_timestamp.dayOfMonth", "attribute"),
            identifier: "dt_oppcreated_timestamp.dayOfMonth",
            /**
             * Display Form Title: Created - Day of Month
             * Display Form ID: dt_oppcreated_timestamp.dayOfMonth
             */ Default: newAttribute("dt_oppcreated_timestamp.dayOfMonth"),
        },
        /**
         * Date Attribute: Created - Day of Year
         * Date Attribute ID: dt_oppcreated_timestamp.dayOfYear
         */ CreatedDayOfYear: {
            ref: idRef("dt_oppcreated_timestamp.dayOfYear", "attribute"),
            identifier: "dt_oppcreated_timestamp.dayOfYear",
            /**
             * Display Form Title: Created - Day of Year
             * Display Form ID: dt_oppcreated_timestamp.dayOfYear
             */ Default: newAttribute("dt_oppcreated_timestamp.dayOfYear"),
        },
        /**
         * Date Attribute: Created - Week of Year
         * Date Attribute ID: dt_oppcreated_timestamp.weekOfYear
         */ CreatedWeekOfYear: {
            ref: idRef("dt_oppcreated_timestamp.weekOfYear", "attribute"),
            identifier: "dt_oppcreated_timestamp.weekOfYear",
            /**
             * Display Form Title: Created - Week of Year
             * Display Form ID: dt_oppcreated_timestamp.weekOfYear
             */ Default: newAttribute("dt_oppcreated_timestamp.weekOfYear"),
        },
        /**
         * Date Attribute: Created - Month of Year
         * Date Attribute ID: dt_oppcreated_timestamp.monthOfYear
         */ CreatedMonthOfYear: {
            ref: idRef("dt_oppcreated_timestamp.monthOfYear", "attribute"),
            identifier: "dt_oppcreated_timestamp.monthOfYear",
            /**
             * Display Form Title: Created - Month of Year
             * Display Form ID: dt_oppcreated_timestamp.monthOfYear
             */ Default: newAttribute("dt_oppcreated_timestamp.monthOfYear"),
        },
        /**
         * Date Attribute: Created - Quarter of Year
         * Date Attribute ID: dt_oppcreated_timestamp.quarterOfYear
         */ CreatedQuarterOfYear: {
            ref: idRef("dt_oppcreated_timestamp.quarterOfYear", "attribute"),
            identifier: "dt_oppcreated_timestamp.quarterOfYear",
            /**
             * Display Form Title: Created - Quarter of Year
             * Display Form ID: dt_oppcreated_timestamp.quarterOfYear
             */ Default: newAttribute("dt_oppcreated_timestamp.quarterOfYear"),
        },
    },
    /**
     * Date Data Set Title: Snapshot
     * Date Data Set ID: dt_snapshotdate_timestamp
     */ Snapshot: {
        ref: idRef("dt_snapshotdate_timestamp", "dataSet"),
        identifier: "dt_snapshotdate_timestamp",
        /**
         * Date Attribute: Snapshot - Minute
         * Date Attribute ID: dt_snapshotdate_timestamp.minute
         */ SnapshotMinute: {
            ref: idRef("dt_snapshotdate_timestamp.minute", "attribute"),
            identifier: "dt_snapshotdate_timestamp.minute",
            /**
             * Display Form Title: Snapshot - Minute
             * Display Form ID: dt_snapshotdate_timestamp.minute
             */ Default: newAttribute("dt_snapshotdate_timestamp.minute"),
        },
        /**
         * Date Attribute: Snapshot - Hour
         * Date Attribute ID: dt_snapshotdate_timestamp.hour
         */ SnapshotHour: {
            ref: idRef("dt_snapshotdate_timestamp.hour", "attribute"),
            identifier: "dt_snapshotdate_timestamp.hour",
            /**
             * Display Form Title: Snapshot - Hour
             * Display Form ID: dt_snapshotdate_timestamp.hour
             */ Default: newAttribute("dt_snapshotdate_timestamp.hour"),
        },
        /**
         * Date Attribute: Snapshot - Date
         * Date Attribute ID: dt_snapshotdate_timestamp.day
         */ SnapshotDate: {
            ref: idRef("dt_snapshotdate_timestamp.day", "attribute"),
            identifier: "dt_snapshotdate_timestamp.day",
            /**
             * Display Form Title: Snapshot - Date
             * Display Form ID: dt_snapshotdate_timestamp.day
             */ Default: newAttribute("dt_snapshotdate_timestamp.day"),
        },
        /**
         * Date Attribute: Snapshot - Week/Year
         * Date Attribute ID: dt_snapshotdate_timestamp.week
         */ SnapshotWeekYear: {
            ref: idRef("dt_snapshotdate_timestamp.week", "attribute"),
            identifier: "dt_snapshotdate_timestamp.week",
            /**
             * Display Form Title: Snapshot - Week/Year
             * Display Form ID: dt_snapshotdate_timestamp.week
             */ Default: newAttribute("dt_snapshotdate_timestamp.week"),
        },
        /**
         * Date Attribute: Snapshot - Month/Year
         * Date Attribute ID: dt_snapshotdate_timestamp.month
         */ SnapshotMonthYear: {
            ref: idRef("dt_snapshotdate_timestamp.month", "attribute"),
            identifier: "dt_snapshotdate_timestamp.month",
            /**
             * Display Form Title: Snapshot - Month/Year
             * Display Form ID: dt_snapshotdate_timestamp.month
             */ Default: newAttribute("dt_snapshotdate_timestamp.month"),
        },
        /**
         * Date Attribute: Snapshot - Quarter/Year
         * Date Attribute ID: dt_snapshotdate_timestamp.quarter
         */ SnapshotQuarterYear: {
            ref: idRef("dt_snapshotdate_timestamp.quarter", "attribute"),
            identifier: "dt_snapshotdate_timestamp.quarter",
            /**
             * Display Form Title: Snapshot - Quarter/Year
             * Display Form ID: dt_snapshotdate_timestamp.quarter
             */ Default: newAttribute("dt_snapshotdate_timestamp.quarter"),
        },
        /**
         * Date Attribute: Snapshot - Year
         * Date Attribute ID: dt_snapshotdate_timestamp.year
         */ SnapshotYear: {
            ref: idRef("dt_snapshotdate_timestamp.year", "attribute"),
            identifier: "dt_snapshotdate_timestamp.year",
            /**
             * Display Form Title: Snapshot - Year
             * Display Form ID: dt_snapshotdate_timestamp.year
             */ Default: newAttribute("dt_snapshotdate_timestamp.year"),
        },
        /**
         * Date Attribute: Snapshot - Minute of Hour
         * Date Attribute ID: dt_snapshotdate_timestamp.minuteOfHour
         */ SnapshotMinuteOfHour: {
            ref: idRef("dt_snapshotdate_timestamp.minuteOfHour", "attribute"),
            identifier: "dt_snapshotdate_timestamp.minuteOfHour",
            /**
             * Display Form Title: Snapshot - Minute of Hour
             * Display Form ID: dt_snapshotdate_timestamp.minuteOfHour
             */ Default: newAttribute("dt_snapshotdate_timestamp.minuteOfHour"),
        },
        /**
         * Date Attribute: Snapshot - Hour of Day
         * Date Attribute ID: dt_snapshotdate_timestamp.hourOfDay
         */ SnapshotHourOfDay: {
            ref: idRef("dt_snapshotdate_timestamp.hourOfDay", "attribute"),
            identifier: "dt_snapshotdate_timestamp.hourOfDay",
            /**
             * Display Form Title: Snapshot - Hour of Day
             * Display Form ID: dt_snapshotdate_timestamp.hourOfDay
             */ Default: newAttribute("dt_snapshotdate_timestamp.hourOfDay"),
        },
        /**
         * Date Attribute: Snapshot - Day of Week
         * Date Attribute ID: dt_snapshotdate_timestamp.dayOfWeek
         */ SnapshotDayOfWeek: {
            ref: idRef("dt_snapshotdate_timestamp.dayOfWeek", "attribute"),
            identifier: "dt_snapshotdate_timestamp.dayOfWeek",
            /**
             * Display Form Title: Snapshot - Day of Week
             * Display Form ID: dt_snapshotdate_timestamp.dayOfWeek
             */ Default: newAttribute("dt_snapshotdate_timestamp.dayOfWeek"),
        },
        /**
         * Date Attribute: Snapshot - Day of Month
         * Date Attribute ID: dt_snapshotdate_timestamp.dayOfMonth
         */ SnapshotDayOfMonth: {
            ref: idRef("dt_snapshotdate_timestamp.dayOfMonth", "attribute"),
            identifier: "dt_snapshotdate_timestamp.dayOfMonth",
            /**
             * Display Form Title: Snapshot - Day of Month
             * Display Form ID: dt_snapshotdate_timestamp.dayOfMonth
             */ Default: newAttribute("dt_snapshotdate_timestamp.dayOfMonth"),
        },
        /**
         * Date Attribute: Snapshot - Day of Year
         * Date Attribute ID: dt_snapshotdate_timestamp.dayOfYear
         */ SnapshotDayOfYear: {
            ref: idRef("dt_snapshotdate_timestamp.dayOfYear", "attribute"),
            identifier: "dt_snapshotdate_timestamp.dayOfYear",
            /**
             * Display Form Title: Snapshot - Day of Year
             * Display Form ID: dt_snapshotdate_timestamp.dayOfYear
             */ Default: newAttribute("dt_snapshotdate_timestamp.dayOfYear"),
        },
        /**
         * Date Attribute: Snapshot - Week of Year
         * Date Attribute ID: dt_snapshotdate_timestamp.weekOfYear
         */ SnapshotWeekOfYear: {
            ref: idRef("dt_snapshotdate_timestamp.weekOfYear", "attribute"),
            identifier: "dt_snapshotdate_timestamp.weekOfYear",
            /**
             * Display Form Title: Snapshot - Week of Year
             * Display Form ID: dt_snapshotdate_timestamp.weekOfYear
             */ Default: newAttribute("dt_snapshotdate_timestamp.weekOfYear"),
        },
        /**
         * Date Attribute: Snapshot - Month of Year
         * Date Attribute ID: dt_snapshotdate_timestamp.monthOfYear
         */ SnapshotMonthOfYear: {
            ref: idRef("dt_snapshotdate_timestamp.monthOfYear", "attribute"),
            identifier: "dt_snapshotdate_timestamp.monthOfYear",
            /**
             * Display Form Title: Snapshot - Month of Year
             * Display Form ID: dt_snapshotdate_timestamp.monthOfYear
             */ Default: newAttribute("dt_snapshotdate_timestamp.monthOfYear"),
        },
        /**
         * Date Attribute: Snapshot - Quarter of Year
         * Date Attribute ID: dt_snapshotdate_timestamp.quarterOfYear
         */ SnapshotQuarterOfYear: {
            ref: idRef("dt_snapshotdate_timestamp.quarterOfYear", "attribute"),
            identifier: "dt_snapshotdate_timestamp.quarterOfYear",
            /**
             * Display Form Title: Snapshot - Quarter of Year
             * Display Form ID: dt_snapshotdate_timestamp.quarterOfYear
             */ Default: newAttribute("dt_snapshotdate_timestamp.quarterOfYear"),
        },
    },
    /**
     * Date Data Set Title: Timeline
     * Date Data Set ID: dt_timeline_timestamp
     */ Timeline: {
        ref: idRef("dt_timeline_timestamp", "dataSet"),
        identifier: "dt_timeline_timestamp",
        /**
         * Date Attribute: Timeline - Minute
         * Date Attribute ID: dt_timeline_timestamp.minute
         */ TimelineMinute: {
            ref: idRef("dt_timeline_timestamp.minute", "attribute"),
            identifier: "dt_timeline_timestamp.minute",
            /**
             * Display Form Title: Timeline - Minute
             * Display Form ID: dt_timeline_timestamp.minute
             */ Default: newAttribute("dt_timeline_timestamp.minute"),
        },
        /**
         * Date Attribute: Timeline - Hour
         * Date Attribute ID: dt_timeline_timestamp.hour
         */ TimelineHour: {
            ref: idRef("dt_timeline_timestamp.hour", "attribute"),
            identifier: "dt_timeline_timestamp.hour",
            /**
             * Display Form Title: Timeline - Hour
             * Display Form ID: dt_timeline_timestamp.hour
             */ Default: newAttribute("dt_timeline_timestamp.hour"),
        },
        /**
         * Date Attribute: Timeline - Date
         * Date Attribute ID: dt_timeline_timestamp.day
         */ TimelineDate: {
            ref: idRef("dt_timeline_timestamp.day", "attribute"),
            identifier: "dt_timeline_timestamp.day",
            /**
             * Display Form Title: Timeline - Date
             * Display Form ID: dt_timeline_timestamp.day
             */ Default: newAttribute("dt_timeline_timestamp.day"),
        },
        /**
         * Date Attribute: Timeline - Week/Year
         * Date Attribute ID: dt_timeline_timestamp.week
         */ TimelineWeekYear: {
            ref: idRef("dt_timeline_timestamp.week", "attribute"),
            identifier: "dt_timeline_timestamp.week",
            /**
             * Display Form Title: Timeline - Week/Year
             * Display Form ID: dt_timeline_timestamp.week
             */ Default: newAttribute("dt_timeline_timestamp.week"),
        },
        /**
         * Date Attribute: Timeline - Month/Year
         * Date Attribute ID: dt_timeline_timestamp.month
         */ TimelineMonthYear: {
            ref: idRef("dt_timeline_timestamp.month", "attribute"),
            identifier: "dt_timeline_timestamp.month",
            /**
             * Display Form Title: Timeline - Month/Year
             * Display Form ID: dt_timeline_timestamp.month
             */ Default: newAttribute("dt_timeline_timestamp.month"),
        },
        /**
         * Date Attribute: Timeline - Quarter/Year
         * Date Attribute ID: dt_timeline_timestamp.quarter
         */ TimelineQuarterYear: {
            ref: idRef("dt_timeline_timestamp.quarter", "attribute"),
            identifier: "dt_timeline_timestamp.quarter",
            /**
             * Display Form Title: Timeline - Quarter/Year
             * Display Form ID: dt_timeline_timestamp.quarter
             */ Default: newAttribute("dt_timeline_timestamp.quarter"),
        },
        /**
         * Date Attribute: Timeline - Year
         * Date Attribute ID: dt_timeline_timestamp.year
         */ TimelineYear: {
            ref: idRef("dt_timeline_timestamp.year", "attribute"),
            identifier: "dt_timeline_timestamp.year",
            /**
             * Display Form Title: Timeline - Year
             * Display Form ID: dt_timeline_timestamp.year
             */ Default: newAttribute("dt_timeline_timestamp.year"),
        },
        /**
         * Date Attribute: Timeline - Minute of Hour
         * Date Attribute ID: dt_timeline_timestamp.minuteOfHour
         */ TimelineMinuteOfHour: {
            ref: idRef("dt_timeline_timestamp.minuteOfHour", "attribute"),
            identifier: "dt_timeline_timestamp.minuteOfHour",
            /**
             * Display Form Title: Timeline - Minute of Hour
             * Display Form ID: dt_timeline_timestamp.minuteOfHour
             */ Default: newAttribute("dt_timeline_timestamp.minuteOfHour"),
        },
        /**
         * Date Attribute: Timeline - Hour of Day
         * Date Attribute ID: dt_timeline_timestamp.hourOfDay
         */ TimelineHourOfDay: {
            ref: idRef("dt_timeline_timestamp.hourOfDay", "attribute"),
            identifier: "dt_timeline_timestamp.hourOfDay",
            /**
             * Display Form Title: Timeline - Hour of Day
             * Display Form ID: dt_timeline_timestamp.hourOfDay
             */ Default: newAttribute("dt_timeline_timestamp.hourOfDay"),
        },
        /**
         * Date Attribute: Timeline - Day of Week
         * Date Attribute ID: dt_timeline_timestamp.dayOfWeek
         */ TimelineDayOfWeek: {
            ref: idRef("dt_timeline_timestamp.dayOfWeek", "attribute"),
            identifier: "dt_timeline_timestamp.dayOfWeek",
            /**
             * Display Form Title: Timeline - Day of Week
             * Display Form ID: dt_timeline_timestamp.dayOfWeek
             */ Default: newAttribute("dt_timeline_timestamp.dayOfWeek"),
        },
        /**
         * Date Attribute: Timeline - Day of Month
         * Date Attribute ID: dt_timeline_timestamp.dayOfMonth
         */ TimelineDayOfMonth: {
            ref: idRef("dt_timeline_timestamp.dayOfMonth", "attribute"),
            identifier: "dt_timeline_timestamp.dayOfMonth",
            /**
             * Display Form Title: Timeline - Day of Month
             * Display Form ID: dt_timeline_timestamp.dayOfMonth
             */ Default: newAttribute("dt_timeline_timestamp.dayOfMonth"),
        },
        /**
         * Date Attribute: Timeline - Day of Year
         * Date Attribute ID: dt_timeline_timestamp.dayOfYear
         */ TimelineDayOfYear: {
            ref: idRef("dt_timeline_timestamp.dayOfYear", "attribute"),
            identifier: "dt_timeline_timestamp.dayOfYear",
            /**
             * Display Form Title: Timeline - Day of Year
             * Display Form ID: dt_timeline_timestamp.dayOfYear
             */ Default: newAttribute("dt_timeline_timestamp.dayOfYear"),
        },
        /**
         * Date Attribute: Timeline - Week of Year
         * Date Attribute ID: dt_timeline_timestamp.weekOfYear
         */ TimelineWeekOfYear: {
            ref: idRef("dt_timeline_timestamp.weekOfYear", "attribute"),
            identifier: "dt_timeline_timestamp.weekOfYear",
            /**
             * Display Form Title: Timeline - Week of Year
             * Display Form ID: dt_timeline_timestamp.weekOfYear
             */ Default: newAttribute("dt_timeline_timestamp.weekOfYear"),
        },
        /**
         * Date Attribute: Timeline - Month of Year
         * Date Attribute ID: dt_timeline_timestamp.monthOfYear
         */ TimelineMonthOfYear: {
            ref: idRef("dt_timeline_timestamp.monthOfYear", "attribute"),
            identifier: "dt_timeline_timestamp.monthOfYear",
            /**
             * Display Form Title: Timeline - Month of Year
             * Display Form ID: dt_timeline_timestamp.monthOfYear
             */ Default: newAttribute("dt_timeline_timestamp.monthOfYear"),
        },
        /**
         * Date Attribute: Timeline - Quarter of Year
         * Date Attribute ID: dt_timeline_timestamp.quarterOfYear
         */ TimelineQuarterOfYear: {
            ref: idRef("dt_timeline_timestamp.quarterOfYear", "attribute"),
            identifier: "dt_timeline_timestamp.quarterOfYear",
            /**
             * Display Form Title: Timeline - Quarter of Year
             * Display Form ID: dt_timeline_timestamp.quarterOfYear
             */ Default: newAttribute("dt_timeline_timestamp.quarterOfYear"),
        },
    },
};
export const Insights = {
    /**
     * Insight Title: Insight Activities
     * Insight ID: 2ec4862e-4559-42d9-a628-fd4e80c16d59
     */
    InsightActivities: "2ec4862e-4559-42d9-a628-fd4e80c16d59",
};
export const Dashboards = {};
