/* eslint-disable */
/* THIS FILE WAS AUTO-GENERATED USING CATALOG EXPORTER; YOU SHOULD NOT EDIT THIS FILE; GENERATE TIME: 2022-12-07T14:14:28.416Z; */
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
     * Display Form ID: attr.f_account.account
     */
    Default: newAttribute("attr.f_account.account"),
    /**
     * Display Form Title: Name
     * Display Form ID: label.f_account.account.name
     */ Name: newAttribute("label.f_account.account.name"),
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
     * Display Form Title: Subject
     * Display Form ID: label.f_activity.subject
     */
    Subject: newAttribute("label.f_activity.subject"),
    /**
     * Display Form Title: Activity
     * Display Form ID: attr.f_activity.activity
     */ Default: newAttribute("attr.f_activity.activity"),
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
     * Display Form Title: SFDC URL
     * Display Form ID: label.f_opportunity.opportunity.sfdcurl
     */
    SFDCURL: newAttribute("label.f_opportunity.opportunity.sfdcurl"),
    /**
     * Display Form Title: Opportunity
     * Display Form ID: attr.f_opportunity.opportunity
     */ Default: newAttribute("attr.f_opportunity.opportunity"),
    /**
     * Display Form Title: Opportunity Name
     * Display Form ID: label.f_opportunity.opportunity.name
     */ Name: newAttribute("label.f_opportunity.opportunity.name"),
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
export const OppSnapshot: IAttribute = newAttribute("attr.f_opportunitysnapshot.oppsnapshot");
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
     * Display Form Title: Sales Rep
     * Display Form ID: attr.f_owner.salesrep
     */
    Default: newAttribute("attr.f_owner.salesrep"),
    /**
     * Display Form Title: Owner Name
     * Display Form ID: label.f_owner.salesrep.ownername
     */ OwnerName: newAttribute("label.f_owner.salesrep.ownername"),
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
     * Display Form Title: Product
     * Display Form ID: attr.f_product.product
     */
    Default: newAttribute("attr.f_product.product"),
    /**
     * Display Form Title: Product Name
     * Display Form ID: label.f_product.product.name
     */ Name: newAttribute("label.f_product.product.name"),
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
     * Display Form ID: label.f_stage.stagename.stagename
     */
    Default: newAttribute("label.f_stage.stagename.stagename"),
    /**
     * Display Form Title: Order
     * Display Form ID: label.f_stage.stagename.order
     */ Order: newAttribute("label.f_stage.stagename.order"),
    /**
     * Display Form Title: Stage Name
     * Display Form ID: attr.f_stage.stagename
     */ _1: newAttribute("attr.f_stage.stagename"),
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
export const StageHistory: IAttribute = newAttribute("attr.f_stagehistory.stagehistory");
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
 * Metric Title: Metric has null value
 * Metric ID: metric_has_null_value
 * Metric Type: MAQL Metric
 */
export const MetricHasNullValue: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("metric_has_null_value", "measure"),
);
/**
 * Metric Title: Parent metric
 * Metric ID: e519fa2a-86c3-4e32-8313-0c03061626b1
 * Metric Type: MAQL Metric
 */
export const ParentMetric: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("e519fa2a-86c3-4e32-8313-0c03061626b1", "measure"),
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
 * Metric Title: # Of Opportunities
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
 * Metric Title: Won
 * Metric ID: e519fa2a-86c3-4e32-8313-0c03062348j3
 * Metric Type: MAQL Metric
 */
export const Won: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("e519fa2a-86c3-4e32-8313-0c03062348j3", "measure"),
);
/**
 * Metric Title: # of Lost Opps.
 * Metric ID: of_lost_opps.
 * Metric Type: MAQL Metric
 */
export const NrOfLostOpps: IMeasure<IMeasureDefinition> = newMeasure(idRef("of_lost_opps.", "measure"));
/**
 * Metric Title: # of Won Opps.
 * Metric ID: of_won_opps.
 * Metric Type: MAQL Metric
 */
export const NrOfWonOpps: IMeasure<IMeasureDefinition> = newMeasure(idRef("of_won_opps.", "measure"));
/**
 * Metric Title: _Snapshot [BOP]
 * Metric ID: snapshot_bop
 * Metric Type: MAQL Metric
 */
export const SnapshotBOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("snapshot_bop", "measure"));
/**
 * Metric Title: _Close [EOP]
 * Metric ID: close_eop
 * Metric Type: MAQL Metric
 */
export const CloseEOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("close_eop", "measure"));
/**
 * Metric Title: _Opp. First Snapshot
 * Metric ID: opp._first_snapshot
 * Metric Type: MAQL Metric
 */
export const OppFirstSnapshot: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("opp._first_snapshot", "measure"),
);
/**
 * Metric Title: Amount [BOP]
 * Metric ID: amount_bop
 * Metric Type: MAQL Metric
 */
export const AmountBOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("amount_bop", "measure"));
/**
 * Metric Title: Avg. Amount
 * Metric ID: avg._amount
 * Metric Type: MAQL Metric
 */
export const AvgAmount: IMeasure<IMeasureDefinition> = newMeasure(idRef("avg._amount", "measure"));
/**
 * Metric Title: Best Case
 * Metric ID: best_case
 * Metric Type: MAQL Metric
 */
export const BestCase: IMeasure<IMeasureDefinition> = newMeasure(idRef("best_case", "measure"));
/**
 * Metric Title: _Timeline [BOP]
 * Metric ID: timeline_bop
 * Metric Type: MAQL Metric
 */
export const TimelineBOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("timeline_bop", "measure"));
/**
 * Metric Title: # of Activities
 * Metric ID: of_activities
 * Metric Type: MAQL Metric
 */
export const NrOfActivities: IMeasure<IMeasureDefinition> = newMeasure(idRef("of_activities", "measure"));
/**
 * Metric Title: _Close [BOP]
 * Metric ID: close_bop
 * Metric Type: MAQL Metric
 */
export const CloseBOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("close_bop", "measure"));
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
};
export const Insights = {
    /**
     * Insight Title: AD has null value
     * Insight ID: b3b665b7-bca2-0322-82f1-b86ky73k90f8afe
     */
    ADHasNullValue: "b3b665b7-bca2-0322-82f1-b86ky73k90f8afe",
    /**
     * Insight Title: Parent Insight
     * Insight ID: b3b665b7-bca2-4462-82f1-b0e01dff8afe
     */ ParentInsight: "b3b665b7-bca2-4462-82f1-b0e01dff8afe",
    /**
     * Insight Title: Combo chart
     * Insight ID: 3c05e649-7897-4a95-9c75-c043f0c39e14
     */ ComboChart: "3c05e649-7897-4a95-9c75-c043f0c39e14",
    /**
     * Insight Title: Table Sales rep, Forecast category
     * Insight ID: 63a1281d-2ad1-42b2-9577-d653cbe7562c
     */ TableSalesRepForecastCategory: "63a1281d-2ad1-42b2-9577-d653cbe7562c",
    /**
     * Insight Title: Amount
     * Insight ID: 87e5c951-0ae6-4a71-a38d-843457bdfc0b
     */ Amount_2: "87e5c951-0ae6-4a71-a38d-843457bdfc0b",
    /**
     * Insight Title: Column chart
     * Insight ID: a40866ab-5272-4f2c-9b5a-dd255b1e5d42
     */ ColumnChart: "a40866ab-5272-4f2c-9b5a-dd255b1e5d42",
    /**
     * Insight Title: Scatter plot
     * Insight ID: c44d07fb-e48d-445d-87ff-5c07d8749863
     */ ScatterPlot: "c44d07fb-e48d-445d-87ff-5c07d8749863",
    /**
     * Insight Title: Table with order
     * Insight ID: c796d21d-a705-439d-a727-23b144591617
     */ TableWithOrder: "c796d21d-a705-439d-a727-23b144591617",
    /**
     * Insight Title: Win Rate
     * Insight ID: cc722659-8411-4813-be8f-4d7fed0fe6a6
     */ WinRate_1: "cc722659-8411-4813-be8f-4d7fed0fe6a6",
    /**
     * Insight Title: Bar chart with date attribute
     * Insight ID: cf5486ba-7d55-4b4b-a77f-6aae6ad9e6eb
     */ BarChartWithDateAttribute: "cf5486ba-7d55-4b4b-a77f-6aae6ad9e6eb",
    /**
     * Insight Title: Column with two measures by date
     * Insight ID: d44ccdf0-01b4-4faf-a4e1-2a7c5fc05ad1
     */ ColumnWithTwoMeasuresByDate: "d44ccdf0-01b4-4faf-a4e1-2a7c5fc05ad1",
    /**
     * Insight Title: With own description
     * Insight ID: d9ea05ec-5036-43a0-969f-a3ddecb1ca40
     */ WithOwnDescription: "d9ea05ec-5036-43a0-969f-a3ddecb1ca40",
    /**
     * Insight Title: Pie chart multiple measures
     * Insight ID: de6092cf-d243-4987-918b-8aac3ecd26cc
     */ PieChartMultipleMeasures: "de6092cf-d243-4987-918b-8aac3ecd26cc",
    /**
     * Insight Title: Table with stage name
     * Insight ID: ed91a9b6-8ee1-4a70-a2cf-a1454817e538
     */ TableWithStageName: "ed91a9b6-8ee1-4a70-a2cf-a1454817e538",
    /**
     * Insight Title: Table with hyperlink attribute
     * Insight ID: f51896d7-1a46-416b-8039-67d8af1d7651
     */ TableWithHyperlinkAttribute: "f51896d7-1a46-416b-8039-67d8af1d7651",
    /**
     * Insight Title: Table with stage name and atribute filter
     * Insight ID: fbcca86f-c473-446b-b316-eb4f4e5de909
     */ TableWithStageNameAndAtributeFilter: "fbcca86f-c473-446b-b316-eb4f4e5de909",
};
export const Dashboards = {
    /**
     * Dashboard Title: Target KD has null value
     * Dashboard ID: a87209e0-c53f-4a6f-abf3-17c7d8d4079e
     */
    TargetKDHasNullValue: "a87209e0-c53f-4a6f-abf3-17c7d8d4079e",
    /**
     * Dashboard Title: KD has null value
     * Dashboard ID: 5a224af3-902c-4acd-ac75-bfa88d80e044
     */ KDHasNullValue: "5a224af3-902c-4acd-ac75-bfa88d80e044",
    /**
     * Dashboard Title: Parent Dashboard
     * Dashboard ID: d1965687-f7bd-41ba-9fa2-f63793d62a62
     */ ParentDashboard: "d1965687-f7bd-41ba-9fa2-f63793d62a62",
    /**
     * Dashboard Title: KD with stage name
     * Dashboard ID: 0e0cb428-c0db-45dc-946e-65b47287a94f
     */ KDWithStageName: "0e0cb428-c0db-45dc-946e-65b47287a94f",
    /**
     * Dashboard Title: Drill to insight
     * Dashboard ID: 04a8f9c7-cce9-4511-be2b-ea52ea80773f
     */ DrillToInsight: "04a8f9c7-cce9-4511-be2b-ea52ea80773f",
    /**
     * Dashboard Title: KPIs
     * Dashboard ID: 601c81ae-0582-42f0-9f35-a4ec2a6a8497
     */ KPIs: "601c81ae-0582-42f0-9f35-a4ec2a6a8497",
    /**
     * Dashboard Title: Widget tooltips
     * Dashboard ID: 7a02b8e8-8a46-4b3c-b9b8-69792793eb15
     */ WidgetTooltips: "7a02b8e8-8a46-4b3c-b9b8-69792793eb15",
    /**
     * Dashboard Title: Drill to dashboard
     * Dashboard ID: 97aca5e1-ab29-4ad9-a173-72085daf4dbf
     */ DrillToDashboard: "97aca5e1-ab29-4ad9-a173-72085daf4dbf",
    /**
     * Dashboard Title: Dashboard stage name
     * Dashboard ID: c900b178-b150-4dac-b4e5-20ad5ddfe23b
     */ DashboardStageName: "c900b178-b150-4dac-b4e5-20ad5ddfe23b",
    /**
     * Dashboard Title: Drill to attribute url
     * Dashboard ID: d9c82618-36d5-4819-909b-5801888ec1ae
     */ DrillToAttributeUrl: "d9c82618-36d5-4819-909b-5801888ec1ae",
    /**
     * Dashboard Title: Drill to custom url
     * Dashboard ID: ddb30edd-6149-473a-846d-3c7fed83106f
     */ DrillToCustomUrl: "ddb30edd-6149-473a-846d-3c7fed83106f",
    /**
     * Dashboard Title: Dashboard order
     * Dashboard ID: ed0a80c8-4266-4cb6-88c7-48eafbe47c1d
     */ DashboardOrder: "ed0a80c8-4266-4cb6-88c7-48eafbe47c1d",
};
