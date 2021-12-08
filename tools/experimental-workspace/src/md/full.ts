/* eslint-disable */
/* THIS FILE WAS AUTO-GENERATED USING CATALOG EXPORTER; YOU SHOULD NOT EDIT THIS FILE; GENERATE TIME: 2021-06-21T15:35:37.369Z; */
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
 * Attribute ID: attr.account.id
 */
export const Account = {
    /**
     * Display Form Title: Name
     * Display Form ID: label.account.id.name
     */
    Name: newAttribute("label.account.id.name"),
    /**
     * Display Form Title: Account
     * Display Form ID: label.account.id
     */ Default: newAttribute("label.account.id"),
};
/**
 * Attribute Title: Activity
 * Attribute ID: attr.activity.id
 */
export const Activity = {
    /**
     * Display Form Title: Subject
     * Display Form ID: label.activity.id.subject
     */
    Subject: newAttribute("label.activity.id.subject"),
    /**
     * Display Form Title: Activity
     * Display Form ID: label.activity.id
     */ Default: newAttribute("label.activity.id"),
};
/**
 * Attribute Title: Activity Type
 * Attribute ID: attr.activity.activitytype
 */
export const ActivityType: IAttribute = newAttribute("label.activity.activitytype");
/**
 * Attribute Title: Department
 * Attribute ID: attr.owner.department
 */
export const Department: IAttribute = newAttribute("label.owner.department");
/**
 * Attribute Title: Forecast Category
 * Attribute ID: attr.opportunitysnapshot.forecastcategory
 */
export const ForecastCategory: IAttribute = newAttribute("label.opportunitysnapshot.forecastcategory");
/**
 * Attribute Title: Is Active?
 * Attribute ID: attr.stage.isactive
 */
export const IsActive: IAttribute = newAttribute("label.stage.isactive");
/**
 * Attribute Title: Is Closed?
 * Attribute ID: attr.activity.isclosed
 */
export const IsClosed: IAttribute = newAttribute("label.activity.isclosed");
/**
 * Attribute Title: Is Closed?
 * Attribute ID: attr.stage.isclosed
 */
export const IsClosed_1: IAttribute = newAttribute("label.stage.isclosed");
/**
 * Attribute Title: Is Task?
 * Attribute ID: attr.activity.istask
 */
export const IsTask: IAttribute = newAttribute("label.activity.istask");
/**
 * Attribute Title: Is Won?
 * Attribute ID: attr.stage.iswon
 */
export const IsWon: IAttribute = newAttribute("label.stage.iswon");
/**
 * Attribute Title: Opp. Snapshot
 * Attribute ID: attr.opportunitysnapshot.id
 */
export const OppSnapshot: IAttribute = newAttribute("label.opportunitysnapshot.id");
/**
 * Attribute Title: Opportunity
 * Attribute ID: attr.opportunity.id
 */
export const Opportunity = {
    /**
     * Display Form Title: Opportunity Name
     * Display Form ID: label.opportunity.id.name
     */
    Name: newAttribute("label.opportunity.id.name"),
    /**
     * Display Form Title: Opportunity
     * Display Form ID: label.opportunity.id
     */ Default: newAttribute("label.opportunity.id"),
    /**
     * Display Form Title: SFDC URL
     * Display Form ID: label.opportunity.id.url
     */ SFDCURL: newAttribute("label.opportunity.id.url"),
};
/**
 * Attribute Title: Priority
 * Attribute ID: attr.activity.priority
 */
export const Priority: IAttribute = newAttribute("label.activity.priority");
/**
 * Attribute Title: Product
 * Attribute ID: attr.product.id
 */
export const Product = {
    /**
     * Display Form Title: Product Name
     * Display Form ID: label.product.id.name
     */
    Name: newAttribute("label.product.id.name"),
    /**
     * Display Form Title: Product
     * Display Form ID: label.product.id
     */ Default: newAttribute("label.product.id"),
};
/**
 * Attribute Title: Region
 * Attribute ID: attr.owner.region
 */
export const Region: IAttribute = newAttribute("label.owner.region");
/**
 * Attribute Title: Sales Rep
 * Attribute ID: attr.owner.id
 */
export const SalesRep = {
    /**
     * Display Form Title: Owner Name
     * Display Form ID: label.owner.id.name
     */
    OwnerName: newAttribute("label.owner.id.name"),
    /**
     * Display Form Title: Owner
     * Display Form ID: label.owner.id
     */ Owner: newAttribute("label.owner.id"),
};
/**
 * Attribute Title: Stage History
 * Attribute ID: attr.stagehistory.id
 */
export const StageHistory: IAttribute = newAttribute("label.stagehistory.id");
/**
 * Attribute Title: Stage Name
 * Attribute ID: attr.stage.name
 */
export const StageName = {
    /**
     * Display Form Title: Stage Name
     * Display Form ID: label.stage.name.stagename
     */
    Default: newAttribute("label.stage.name.stagename"),
    /**
     * Display Form Title: Order
     * Display Form ID: label.stage.name.order
     */ Order: newAttribute("label.stage.name.order"),
};
/**
 * Attribute Title: Status
 * Attribute ID: attr.activity.status
 */
export const Status: IAttribute = newAttribute("label.activity.status");
/**
 * Attribute Title: Status
 * Attribute ID: attr.stage.status
 */
export const Status_1: IAttribute = newAttribute("label.stage.status");
/**
 * Metric Title: _Snapshot [EOP]
 * Metric ID: abxgDICQav2J
 * Metric Type: MAQL Metric
 */
export const SnapshotEOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("abxgDICQav2J", "measure"));
/**
 * Metric Title: _Timeline [EOP]
 * Metric ID: abYgDBRagANw
 * Metric Type: MAQL Metric
 */
export const TimelineEOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("abYgDBRagANw", "measure"));
/**
 * Metric Title: # Of Opportunities
 * Metric ID: abQgDWx4gOUu
 * Metric Type: MAQL Metric
 */
export const NrOfOpportunities: IMeasure<IMeasureDefinition> = newMeasure(idRef("abQgDWx4gOUu", "measure"));
/**
 * Metric Title: # Of Opportunities Won
 * Metric ID: aa4gLlQhcmLO
 * Metric Type: MAQL Metric
 */
export const NrOfOpportunitiesWon: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("aa4gLlQhcmLO", "measure"),
);
/**
 * Metric Title: Amount
 * Metric ID: aangOxLSeztu
 * Metric Type: MAQL Metric
 */
export const Amount: IMeasure<IMeasureDefinition> = newMeasure(idRef("aangOxLSeztu", "measure"));
/**
 * Metric Title: Probability
 * Metric ID: abEgMnq5hyJQ
 * Metric Type: MAQL Metric
 */
export const Probability: IMeasure<IMeasureDefinition> = newMeasure(idRef("abEgMnq5hyJQ", "measure"));
/**
 * Metric Title: Sample XIRR
 * Metric ID: aadpHDMBecIy
 * Metric Type: MAQL Metric
 */
export const SampleXIRR: IMeasure<IMeasureDefinition> = newMeasure(idRef("aadpHDMBecIy", "measure"));
/**
 * Metric Title: Win Rate
 * Metric ID: abZgFKGPaGYM
 * Metric Type: MAQL Metric
 */
export const WinRate: IMeasure<IMeasureDefinition> = newMeasure(idRef("abZgFKGPaGYM", "measure"));
/**
 * Metric Title: Won
 * Metric ID: acugFHNJgsBy
 * Metric Type: MAQL Metric
 */
export const Won: IMeasure<IMeasureDefinition> = newMeasure(idRef("acugFHNJgsBy", "measure"));
/**
 * Fact Title: Activity (Date)
 * Fact ID: dt.activity.activity
 */
export const ActivityDate = {
    /**
     * Fact Title: Activity (Date)
     * Fact ID: dt.activity.activity
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("dt.activity.activity", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Activity (Date)
     * Fact ID: dt.activity.activity
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("dt.activity.activity", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Activity (Date)
     * Fact ID: dt.activity.activity
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("dt.activity.activity", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Activity (Date)
     * Fact ID: dt.activity.activity
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("dt.activity.activity", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Activity (Date)
     * Fact ID: dt.activity.activity
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("dt.activity.activity", "fact"), (m) => m.aggregation("median")),
    /**
     * Fact Title: Activity (Date)
     * Fact ID: dt.activity.activity
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("dt.activity.activity", "fact"), (m) => m.aggregation("runsum")),
};
/**
 * Fact Title: Amount
 * Fact ID: fact.opportunitysnapshot.amount
 */
export const Amount_1 = {
    /**
     * Fact Title: Amount
     * Fact ID: fact.opportunitysnapshot.amount
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("fact.opportunitysnapshot.amount", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Amount
     * Fact ID: fact.opportunitysnapshot.amount
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("fact.opportunitysnapshot.amount", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Amount
     * Fact ID: fact.opportunitysnapshot.amount
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("fact.opportunitysnapshot.amount", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Amount
     * Fact ID: fact.opportunitysnapshot.amount
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("fact.opportunitysnapshot.amount", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Amount
     * Fact ID: fact.opportunitysnapshot.amount
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("fact.opportunitysnapshot.amount", "fact"), (m) => m.aggregation("median")),
    /**
     * Fact Title: Amount
     * Fact ID: fact.opportunitysnapshot.amount
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("fact.opportunitysnapshot.amount", "fact"), (m) => m.aggregation("runsum")),
};
/**
 * Fact Title: Days to Close
 * Fact ID: fact.opportunitysnapshot.daystoclose
 */
export const DaysToClose = {
    /**
     * Fact Title: Days to Close
     * Fact ID: fact.opportunitysnapshot.daystoclose
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("fact.opportunitysnapshot.daystoclose", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Days to Close
     * Fact ID: fact.opportunitysnapshot.daystoclose
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("fact.opportunitysnapshot.daystoclose", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Days to Close
     * Fact ID: fact.opportunitysnapshot.daystoclose
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("fact.opportunitysnapshot.daystoclose", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Days to Close
     * Fact ID: fact.opportunitysnapshot.daystoclose
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("fact.opportunitysnapshot.daystoclose", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Days to Close
     * Fact ID: fact.opportunitysnapshot.daystoclose
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("fact.opportunitysnapshot.daystoclose", "fact"), (m) =>
        m.aggregation("median"),
    ),
    /**
     * Fact Title: Days to Close
     * Fact ID: fact.opportunitysnapshot.daystoclose
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("fact.opportunitysnapshot.daystoclose", "fact"), (m) =>
        m.aggregation("runsum"),
    ),
};
/**
 * Fact Title: Duration
 * Fact ID: fact.stagehistory.duration
 */
export const Duration = {
    /**
     * Fact Title: Duration
     * Fact ID: fact.stagehistory.duration
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("fact.stagehistory.duration", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Duration
     * Fact ID: fact.stagehistory.duration
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("fact.stagehistory.duration", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Duration
     * Fact ID: fact.stagehistory.duration
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("fact.stagehistory.duration", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Duration
     * Fact ID: fact.stagehistory.duration
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("fact.stagehistory.duration", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Duration
     * Fact ID: fact.stagehistory.duration
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("fact.stagehistory.duration", "fact"), (m) => m.aggregation("median")),
    /**
     * Fact Title: Duration
     * Fact ID: fact.stagehistory.duration
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("fact.stagehistory.duration", "fact"), (m) => m.aggregation("runsum")),
};
/**
 * Fact Title: Opp. Close (Date)
 * Fact ID: dt.opportunitysnapshot.closedate
 */
export const OppCloseDate = {
    /**
     * Fact Title: Opp. Close (Date)
     * Fact ID: dt.opportunitysnapshot.closedate
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("dt.opportunitysnapshot.closedate", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Opp. Close (Date)
     * Fact ID: dt.opportunitysnapshot.closedate
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("dt.opportunitysnapshot.closedate", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Opp. Close (Date)
     * Fact ID: dt.opportunitysnapshot.closedate
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("dt.opportunitysnapshot.closedate", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Opp. Close (Date)
     * Fact ID: dt.opportunitysnapshot.closedate
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("dt.opportunitysnapshot.closedate", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Opp. Close (Date)
     * Fact ID: dt.opportunitysnapshot.closedate
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("dt.opportunitysnapshot.closedate", "fact"), (m) => m.aggregation("median")),
    /**
     * Fact Title: Opp. Close (Date)
     * Fact ID: dt.opportunitysnapshot.closedate
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("dt.opportunitysnapshot.closedate", "fact"), (m) => m.aggregation("runsum")),
};
/**
 * Fact Title: Opp. Created (Date)
 * Fact ID: dt.opportunity.oppcreated
 */
export const OppCreatedDate = {
    /**
     * Fact Title: Opp. Created (Date)
     * Fact ID: dt.opportunity.oppcreated
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("dt.opportunity.oppcreated", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Opp. Created (Date)
     * Fact ID: dt.opportunity.oppcreated
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("dt.opportunity.oppcreated", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Opp. Created (Date)
     * Fact ID: dt.opportunity.oppcreated
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("dt.opportunity.oppcreated", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Opp. Created (Date)
     * Fact ID: dt.opportunity.oppcreated
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("dt.opportunity.oppcreated", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Opp. Created (Date)
     * Fact ID: dt.opportunity.oppcreated
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("dt.opportunity.oppcreated", "fact"), (m) => m.aggregation("median")),
    /**
     * Fact Title: Opp. Created (Date)
     * Fact ID: dt.opportunity.oppcreated
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("dt.opportunity.oppcreated", "fact"), (m) => m.aggregation("runsum")),
};
/**
 * Fact Title: Opp. Snapshot (Date)
 * Fact ID: dt.opportunitysnapshot.snapshotdate
 */
export const OppSnapshotDate = {
    /**
     * Fact Title: Opp. Snapshot (Date)
     * Fact ID: dt.opportunitysnapshot.snapshotdate
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("dt.opportunitysnapshot.snapshotdate", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Opp. Snapshot (Date)
     * Fact ID: dt.opportunitysnapshot.snapshotdate
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("dt.opportunitysnapshot.snapshotdate", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Opp. Snapshot (Date)
     * Fact ID: dt.opportunitysnapshot.snapshotdate
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("dt.opportunitysnapshot.snapshotdate", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Opp. Snapshot (Date)
     * Fact ID: dt.opportunitysnapshot.snapshotdate
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("dt.opportunitysnapshot.snapshotdate", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Opp. Snapshot (Date)
     * Fact ID: dt.opportunitysnapshot.snapshotdate
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("dt.opportunitysnapshot.snapshotdate", "fact"), (m) =>
        m.aggregation("median"),
    ),
    /**
     * Fact Title: Opp. Snapshot (Date)
     * Fact ID: dt.opportunitysnapshot.snapshotdate
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("dt.opportunitysnapshot.snapshotdate", "fact"), (m) =>
        m.aggregation("runsum"),
    ),
};
/**
 * Fact Title: Probability
 * Fact ID: fact.opportunitysnapshot.probability
 */
export const Probability_1 = {
    /**
     * Fact Title: Probability
     * Fact ID: fact.opportunitysnapshot.probability
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("fact.opportunitysnapshot.probability", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Probability
     * Fact ID: fact.opportunitysnapshot.probability
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("fact.opportunitysnapshot.probability", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Probability
     * Fact ID: fact.opportunitysnapshot.probability
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("fact.opportunitysnapshot.probability", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Probability
     * Fact ID: fact.opportunitysnapshot.probability
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("fact.opportunitysnapshot.probability", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Probability
     * Fact ID: fact.opportunitysnapshot.probability
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("fact.opportunitysnapshot.probability", "fact"), (m) =>
        m.aggregation("median"),
    ),
    /**
     * Fact Title: Probability
     * Fact ID: fact.opportunitysnapshot.probability
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("fact.opportunitysnapshot.probability", "fact"), (m) =>
        m.aggregation("runsum"),
    ),
};
/**
 * Fact Title: Timeline (Date)
 * Fact ID: dt.timeline.timeline
 */
export const TimelineDate = {
    /**
     * Fact Title: Timeline (Date)
     * Fact ID: dt.timeline.timeline
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("dt.timeline.timeline", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Timeline (Date)
     * Fact ID: dt.timeline.timeline
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("dt.timeline.timeline", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Timeline (Date)
     * Fact ID: dt.timeline.timeline
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("dt.timeline.timeline", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Timeline (Date)
     * Fact ID: dt.timeline.timeline
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("dt.timeline.timeline", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Timeline (Date)
     * Fact ID: dt.timeline.timeline
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("dt.timeline.timeline", "fact"), (m) => m.aggregation("median")),
    /**
     * Fact Title: Timeline (Date)
     * Fact ID: dt.timeline.timeline
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("dt.timeline.timeline", "fact"), (m) => m.aggregation("runsum")),
};
/**
 * Fact Title: Velocity
 * Fact ID: fact.stagehistory.velocity
 */
export const Velocity = {
    /**
     * Fact Title: Velocity
     * Fact ID: fact.stagehistory.velocity
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("fact.stagehistory.velocity", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Velocity
     * Fact ID: fact.stagehistory.velocity
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("fact.stagehistory.velocity", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Velocity
     * Fact ID: fact.stagehistory.velocity
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("fact.stagehistory.velocity", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Velocity
     * Fact ID: fact.stagehistory.velocity
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("fact.stagehistory.velocity", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Velocity
     * Fact ID: fact.stagehistory.velocity
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("fact.stagehistory.velocity", "fact"), (m) => m.aggregation("median")),
    /**
     * Fact Title: Velocity
     * Fact ID: fact.stagehistory.velocity
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("fact.stagehistory.velocity", "fact"), (m) => m.aggregation("runsum")),
};
/**
 * Attribute Title: Year (Created)
 * Attribute ID: created.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedYear: IAttribute = newAttribute("created.aag81lMifn6q");
/**
 * Attribute Title: Quarter (Created)
 * Attribute ID: created.quarter.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedQuarter: IAttribute = newAttribute("created.aam81lMifn6q");
/**
 * Attribute Title: Week (Sun-Sat)/Year (Created)
 * Attribute ID: created.week
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedWeekSunSatYear = {
    /**
     * Display Form Title: Week #/Year (W1/2010) (Created)
     * Display Form ID: created.aaA81lMifn6q
     */
    WeekNrYear: newAttribute("created.aaA81lMifn6q"),
    /**
     * Display Form Title: Week Starting (Created)
     * Display Form ID: created.aaw81lMifn6q
     */ WeekStarting: newAttribute("created.aaw81lMifn6q"),
    /**
     * Display Form Title: From - To (Created)
     * Display Form ID: created.aau81lMifn6q
     */ FromTo: newAttribute("created.aau81lMifn6q"),
    /**
     * Display Form Title: Week #/Year (Cont.) (Created)
     * Display Form ID: created.aay81lMifn6q
     */ WeekNrYear_1: newAttribute("created.aay81lMifn6q"),
    /**
     * Display Form Title: Wk/Qtr/Year (Cont.) (Created)
     * Display Form ID: created.aaC81lMifn6q
     */ WkQtrYear: newAttribute("created.aaC81lMifn6q"),
    /**
     * Display Form Title: Wk/Qtr/Year (Created)
     * Display Form ID: created.aas81lMifn6q
     */ WkQtrYear_1: newAttribute("created.aas81lMifn6q"),
};
/**
 * Attribute Title: Week (Sun-Sat) (Created)
 * Attribute ID: created.week.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedWeekSunSat: IAttribute = newAttribute("created.aaI81lMifn6q");
/**
 * Attribute Title: Week (Sun-Sat) of Qtr (Created)
 * Attribute ID: created.week.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedWeekSunSatOfQtr: IAttribute = newAttribute("created.aaO81lMifn6q");
/**
 * Attribute Title: Week (Mon-Sun)/Year (Created)
 * Attribute ID: created.euweek
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedWeekMonSunYear = {
    /**
     * Display Form Title: Week #/Year (W1/2010) (Created)
     * Display Form ID: created.aa281lMifn6q
     */
    WeekNrYear: newAttribute("created.aa281lMifn6q"),
    /**
     * Display Form Title: Week Starting (Created)
     * Display Form ID: created.aaY81lMifn6q
     */ WeekStarting: newAttribute("created.aaY81lMifn6q"),
    /**
     * Display Form Title: From - To (Created)
     * Display Form ID: created.aaW81lMifn6q
     */ FromTo: newAttribute("created.aaW81lMifn6q"),
};
/**
 * Attribute Title: Week (Mon-Sun) (Created)
 * Attribute ID: created.euweek.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedWeekMonSun: IAttribute = newAttribute("created.aba81lMifn6q");
/**
 * Attribute Title: Week (Mon-Sun) of Qtr (Created)
 * Attribute ID: created.euweek.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedWeekMonSunOfQtr: IAttribute = newAttribute("created.abg81lMifn6q");
/**
 * Attribute Title: Month (Created)
 * Attribute ID: created.month.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedMonth = {
    /**
     * Display Form Title: Short (Jan) (Created)
     * Display Form ID: created.abm81lMifn6q
     */
    Short: newAttribute("created.abm81lMifn6q"),
    /**
     * Display Form Title: Long (January) (Created)
     * Display Form ID: created.abs81lMifn6q
     */ Long: newAttribute("created.abs81lMifn6q"),
    /**
     * Display Form Title: Number (M1) (Created)
     * Display Form ID: created.abq81lMifn6q
     */ Number: newAttribute("created.abq81lMifn6q"),
    /**
     * Display Form Title: M/Q (M1/Q1) (Created)
     * Display Form ID: created.abo81lMifn6q
     */ MQ: newAttribute("created.abo81lMifn6q"),
};
/**
 * Attribute Title: Month of Quarter (Created)
 * Attribute ID: created.month.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedMonthOfQuarter: IAttribute = newAttribute("created.aby81lMifn6q");
/**
 * Attribute Title: Day of Year (Created)
 * Attribute ID: created.day.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedDayOfYear: IAttribute = newAttribute("created.abE81lMifn6q");
/**
 * Attribute Title: Day of Week (Sun-Sat) (Created)
 * Attribute ID: created.day.in.week
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedDayOfWeekSunSat = {
    /**
     * Display Form Title: Short (Sun) (Created)
     * Display Form ID: created.abK81lMifn6q
     */
    Short: newAttribute("created.abK81lMifn6q"),
    /**
     * Display Form Title: Long (Sunday) (Created)
     * Display Form ID: created.abO81lMifn6q
     */ Long: newAttribute("created.abO81lMifn6q"),
    /**
     * Display Form Title: Number (1=Sunday) (Created)
     * Display Form ID: created.abM81lMifn6q
     */ Number: newAttribute("created.abM81lMifn6q"),
};
/**
 * Attribute Title: Day of Week (Mon-Sun) (Created)
 * Attribute ID: created.day.in.euweek
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedDayOfWeekMonSun = {
    /**
     * Display Form Title: Short (Mon) (Created)
     * Display Form ID: created.abU81lMifn6q
     */
    Short: newAttribute("created.abU81lMifn6q"),
    /**
     * Display Form Title: Long (Monday) (Created)
     * Display Form ID: created.abY81lMifn6q
     */ Long: newAttribute("created.abY81lMifn6q"),
    /**
     * Display Form Title: Number (1=Monday) (Created)
     * Display Form ID: created.abW81lMifn6q
     */ Number: newAttribute("created.abW81lMifn6q"),
};
/**
 * Attribute Title: Day of Quarter (Created)
 * Attribute ID: created.day.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedDayOfQuarter: IAttribute = newAttribute("created.ab481lMifn6q");
/**
 * Attribute Title: Day of Month (Created)
 * Attribute ID: created.day.in.month
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedDayOfMonth: IAttribute = newAttribute("created.aca81lMifn6q");
/**
 * Attribute Title: Quarter/Year (Created)
 * Attribute ID: created.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedQuarterYear: IAttribute = newAttribute("created.aci81lMifn6q");
/**
 * Attribute Title: Month/Year (Created)
 * Attribute ID: created.month
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedMonthYear = {
    /**
     * Display Form Title: Short (Jan 2010) (Created)
     * Display Form ID: created.act81lMifn6q
     */
    Short: newAttribute("created.act81lMifn6q"),
    /**
     * Display Form Title: Long (January 2010) (Created)
     * Display Form ID: created.acx81lMifn6q
     */ Long: newAttribute("created.acx81lMifn6q"),
    /**
     * Display Form Title: Number (1/2010) (Created)
     * Display Form ID: created.acv81lMifn6q
     */ Number: newAttribute("created.acv81lMifn6q"),
};
/**
 * Attribute Title: Date (Created)
 * Attribute ID: created.date
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedDate = {
    /**
     * Display Form Title: mm/dd/yyyy (Created)
     * Display Form ID: created.date.mmddyyyy
     */
    MmDdYyyy: newAttribute("created.date.mmddyyyy"),
    /**
     * Display Form Title: yyyy-mm-dd (Created)
     * Display Form ID: created.date.yyyymmdd
     */ YyyyMmDd: newAttribute("created.date.yyyymmdd"),
    /**
     * Display Form Title: m/d/yy (no leading zeroes) (Created)
     * Display Form ID: created.date.mdyy
     */ MDYy: newAttribute("created.date.mdyy"),
    /**
     * Display Form Title: Long (Mon, Jan 1, 2010) (Created)
     * Display Form ID: created.date.long
     */ Long: newAttribute("created.date.long"),
    /**
     * Display Form Title: dd/mm/yyyy (Created)
     * Display Form ID: created.date.ddmmyyyy
     */ DdMmYyyy: newAttribute("created.date.ddmmyyyy"),
    /**
     * Display Form Title: dd-mm-yyyy (Created)
     * Display Form ID: created.date.eddmmyyyy
     */ DdMmYyyy_1: newAttribute("created.date.eddmmyyyy"),
};
/**
 * Attribute Title: Year (Closed)
 * Attribute ID: closed.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedYear: IAttribute = newAttribute("closed.aag81lMifn6q");
/**
 * Attribute Title: Quarter (Closed)
 * Attribute ID: closed.quarter.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedQuarter: IAttribute = newAttribute("closed.aam81lMifn6q");
/**
 * Attribute Title: Week (Sun-Sat)/Year (Closed)
 * Attribute ID: closed.week
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedWeekSunSatYear = {
    /**
     * Display Form Title: Week #/Year (W1/2010) (Closed)
     * Display Form ID: closed.aaA81lMifn6q
     */
    WeekNrYear: newAttribute("closed.aaA81lMifn6q"),
    /**
     * Display Form Title: Week Starting (Closed)
     * Display Form ID: closed.aaw81lMifn6q
     */ WeekStarting: newAttribute("closed.aaw81lMifn6q"),
    /**
     * Display Form Title: From - To (Closed)
     * Display Form ID: closed.aau81lMifn6q
     */ FromTo: newAttribute("closed.aau81lMifn6q"),
    /**
     * Display Form Title: Week #/Year (Cont.) (Closed)
     * Display Form ID: closed.aay81lMifn6q
     */ WeekNrYear_1: newAttribute("closed.aay81lMifn6q"),
    /**
     * Display Form Title: Wk/Qtr/Year (Cont.) (Closed)
     * Display Form ID: closed.aaC81lMifn6q
     */ WkQtrYear: newAttribute("closed.aaC81lMifn6q"),
    /**
     * Display Form Title: Wk/Qtr/Year (Closed)
     * Display Form ID: closed.aas81lMifn6q
     */ WkQtrYear_1: newAttribute("closed.aas81lMifn6q"),
};
/**
 * Attribute Title: Week (Sun-Sat) (Closed)
 * Attribute ID: closed.week.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedWeekSunSat: IAttribute = newAttribute("closed.aaI81lMifn6q");
/**
 * Attribute Title: Week (Sun-Sat) of Qtr (Closed)
 * Attribute ID: closed.week.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedWeekSunSatOfQtr: IAttribute = newAttribute("closed.aaO81lMifn6q");
/**
 * Attribute Title: Week (Mon-Sun)/Year (Closed)
 * Attribute ID: closed.euweek
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedWeekMonSunYear = {
    /**
     * Display Form Title: Week #/Year (W1/2010) (Closed)
     * Display Form ID: closed.aa281lMifn6q
     */
    WeekNrYear: newAttribute("closed.aa281lMifn6q"),
    /**
     * Display Form Title: Week Starting (Closed)
     * Display Form ID: closed.aaY81lMifn6q
     */ WeekStarting: newAttribute("closed.aaY81lMifn6q"),
    /**
     * Display Form Title: From - To (Closed)
     * Display Form ID: closed.aaW81lMifn6q
     */ FromTo: newAttribute("closed.aaW81lMifn6q"),
};
/**
 * Attribute Title: Week (Mon-Sun) (Closed)
 * Attribute ID: closed.euweek.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedWeekMonSun: IAttribute = newAttribute("closed.aba81lMifn6q");
/**
 * Attribute Title: Week (Mon-Sun) of Qtr (Closed)
 * Attribute ID: closed.euweek.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedWeekMonSunOfQtr: IAttribute = newAttribute("closed.abg81lMifn6q");
/**
 * Attribute Title: Month (Closed)
 * Attribute ID: closed.month.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedMonth = {
    /**
     * Display Form Title: Short (Jan) (Closed)
     * Display Form ID: closed.abm81lMifn6q
     */
    Short: newAttribute("closed.abm81lMifn6q"),
    /**
     * Display Form Title: Long (January) (Closed)
     * Display Form ID: closed.abs81lMifn6q
     */ Long: newAttribute("closed.abs81lMifn6q"),
    /**
     * Display Form Title: Number (M1) (Closed)
     * Display Form ID: closed.abq81lMifn6q
     */ Number: newAttribute("closed.abq81lMifn6q"),
    /**
     * Display Form Title: M/Q (M1/Q1) (Closed)
     * Display Form ID: closed.abo81lMifn6q
     */ MQ: newAttribute("closed.abo81lMifn6q"),
};
/**
 * Attribute Title: Month of Quarter (Closed)
 * Attribute ID: closed.month.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedMonthOfQuarter: IAttribute = newAttribute("closed.aby81lMifn6q");
/**
 * Attribute Title: Day of Year (Closed)
 * Attribute ID: closed.day.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedDayOfYear: IAttribute = newAttribute("closed.abE81lMifn6q");
/**
 * Attribute Title: Day of Week (Sun-Sat) (Closed)
 * Attribute ID: closed.day.in.week
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedDayOfWeekSunSat = {
    /**
     * Display Form Title: Short (Sun) (Closed)
     * Display Form ID: closed.abK81lMifn6q
     */
    Short: newAttribute("closed.abK81lMifn6q"),
    /**
     * Display Form Title: Long (Sunday) (Closed)
     * Display Form ID: closed.abO81lMifn6q
     */ Long: newAttribute("closed.abO81lMifn6q"),
    /**
     * Display Form Title: Number (1=Sunday) (Closed)
     * Display Form ID: closed.abM81lMifn6q
     */ Number: newAttribute("closed.abM81lMifn6q"),
};
/**
 * Attribute Title: Day of Week (Mon-Sun) (Closed)
 * Attribute ID: closed.day.in.euweek
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedDayOfWeekMonSun = {
    /**
     * Display Form Title: Short (Mon) (Closed)
     * Display Form ID: closed.abU81lMifn6q
     */
    Short: newAttribute("closed.abU81lMifn6q"),
    /**
     * Display Form Title: Long (Monday) (Closed)
     * Display Form ID: closed.abY81lMifn6q
     */ Long: newAttribute("closed.abY81lMifn6q"),
    /**
     * Display Form Title: Number (1=Monday) (Closed)
     * Display Form ID: closed.abW81lMifn6q
     */ Number: newAttribute("closed.abW81lMifn6q"),
};
/**
 * Attribute Title: Day of Quarter (Closed)
 * Attribute ID: closed.day.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedDayOfQuarter: IAttribute = newAttribute("closed.ab481lMifn6q");
/**
 * Attribute Title: Day of Month (Closed)
 * Attribute ID: closed.day.in.month
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedDayOfMonth: IAttribute = newAttribute("closed.aca81lMifn6q");
/**
 * Attribute Title: Quarter/Year (Closed)
 * Attribute ID: closed.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedQuarterYear: IAttribute = newAttribute("closed.aci81lMifn6q");
/**
 * Attribute Title: Month/Year (Closed)
 * Attribute ID: closed.month
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedMonthYear = {
    /**
     * Display Form Title: Short (Jan 2010) (Closed)
     * Display Form ID: closed.act81lMifn6q
     */
    Short: newAttribute("closed.act81lMifn6q"),
    /**
     * Display Form Title: Long (January 2010) (Closed)
     * Display Form ID: closed.acx81lMifn6q
     */ Long: newAttribute("closed.acx81lMifn6q"),
    /**
     * Display Form Title: Number (1/2010) (Closed)
     * Display Form ID: closed.acv81lMifn6q
     */ Number: newAttribute("closed.acv81lMifn6q"),
};
/**
 * Attribute Title: Date (Closed)
 * Attribute ID: closed.date
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedDate = {
    /**
     * Display Form Title: mm/dd/yyyy (Closed)
     * Display Form ID: closed.date.mmddyyyy
     */
    MmDdYyyy: newAttribute("closed.date.mmddyyyy"),
    /**
     * Display Form Title: yyyy-mm-dd (Closed)
     * Display Form ID: closed.date.yyyymmdd
     */ YyyyMmDd: newAttribute("closed.date.yyyymmdd"),
    /**
     * Display Form Title: m/d/yy (no leading zeroes) (Closed)
     * Display Form ID: closed.date.mdyy
     */ MDYy: newAttribute("closed.date.mdyy"),
    /**
     * Display Form Title: Long (Mon, Jan 1, 2010) (Closed)
     * Display Form ID: closed.date.long
     */ Long: newAttribute("closed.date.long"),
    /**
     * Display Form Title: dd/mm/yyyy (Closed)
     * Display Form ID: closed.date.ddmmyyyy
     */ DdMmYyyy: newAttribute("closed.date.ddmmyyyy"),
    /**
     * Display Form Title: dd-mm-yyyy (Closed)
     * Display Form ID: closed.date.eddmmyyyy
     */ DdMmYyyy_1: newAttribute("closed.date.eddmmyyyy"),
};
/**
 * Attribute Title: Year (Snapshot)
 * Attribute ID: snapshot.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotYear: IAttribute = newAttribute("snapshot.aag81lMifn6q");
/**
 * Attribute Title: Quarter (Snapshot)
 * Attribute ID: snapshot.quarter.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotQuarter: IAttribute = newAttribute("snapshot.aam81lMifn6q");
/**
 * Attribute Title: Week (Sun-Sat)/Year (Snapshot)
 * Attribute ID: snapshot.week
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotWeekSunSatYear = {
    /**
     * Display Form Title: Week #/Year (W1/2010) (Snapshot)
     * Display Form ID: snapshot.aaA81lMifn6q
     */
    WeekNrYear: newAttribute("snapshot.aaA81lMifn6q"),
    /**
     * Display Form Title: Week Starting (Snapshot)
     * Display Form ID: snapshot.aaw81lMifn6q
     */ WeekStarting: newAttribute("snapshot.aaw81lMifn6q"),
    /**
     * Display Form Title: From - To (Snapshot)
     * Display Form ID: snapshot.aau81lMifn6q
     */ FromTo: newAttribute("snapshot.aau81lMifn6q"),
    /**
     * Display Form Title: Week #/Year (Cont.) (Snapshot)
     * Display Form ID: snapshot.aay81lMifn6q
     */ WeekNrYear_1: newAttribute("snapshot.aay81lMifn6q"),
    /**
     * Display Form Title: Wk/Qtr/Year (Cont.) (Snapshot)
     * Display Form ID: snapshot.aaC81lMifn6q
     */ WkQtrYear: newAttribute("snapshot.aaC81lMifn6q"),
    /**
     * Display Form Title: Wk/Qtr/Year (Snapshot)
     * Display Form ID: snapshot.aas81lMifn6q
     */ WkQtrYear_1: newAttribute("snapshot.aas81lMifn6q"),
};
/**
 * Attribute Title: Week (Sun-Sat) (Snapshot)
 * Attribute ID: snapshot.week.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotWeekSunSat: IAttribute = newAttribute("snapshot.aaI81lMifn6q");
/**
 * Attribute Title: Week (Sun-Sat) of Qtr (Snapshot)
 * Attribute ID: snapshot.week.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotWeekSunSatOfQtr: IAttribute = newAttribute("snapshot.aaO81lMifn6q");
/**
 * Attribute Title: Week (Mon-Sun)/Year (Snapshot)
 * Attribute ID: snapshot.euweek
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotWeekMonSunYear = {
    /**
     * Display Form Title: Week #/Year (W1/2010) (Snapshot)
     * Display Form ID: snapshot.aa281lMifn6q
     */
    WeekNrYear: newAttribute("snapshot.aa281lMifn6q"),
    /**
     * Display Form Title: Week Starting (Snapshot)
     * Display Form ID: snapshot.aaY81lMifn6q
     */ WeekStarting: newAttribute("snapshot.aaY81lMifn6q"),
    /**
     * Display Form Title: From - To (Snapshot)
     * Display Form ID: snapshot.aaW81lMifn6q
     */ FromTo: newAttribute("snapshot.aaW81lMifn6q"),
};
/**
 * Attribute Title: Week (Mon-Sun) (Snapshot)
 * Attribute ID: snapshot.euweek.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotWeekMonSun: IAttribute = newAttribute("snapshot.aba81lMifn6q");
/**
 * Attribute Title: Week (Mon-Sun) of Qtr (Snapshot)
 * Attribute ID: snapshot.euweek.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotWeekMonSunOfQtr: IAttribute = newAttribute("snapshot.abg81lMifn6q");
/**
 * Attribute Title: Month (Snapshot)
 * Attribute ID: snapshot.month.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotMonth = {
    /**
     * Display Form Title: Short (Jan) (Snapshot)
     * Display Form ID: snapshot.abm81lMifn6q
     */
    Short: newAttribute("snapshot.abm81lMifn6q"),
    /**
     * Display Form Title: Long (January) (Snapshot)
     * Display Form ID: snapshot.abs81lMifn6q
     */ Long: newAttribute("snapshot.abs81lMifn6q"),
    /**
     * Display Form Title: Number (M1) (Snapshot)
     * Display Form ID: snapshot.abq81lMifn6q
     */ Number: newAttribute("snapshot.abq81lMifn6q"),
    /**
     * Display Form Title: M/Q (M1/Q1) (Snapshot)
     * Display Form ID: snapshot.abo81lMifn6q
     */ MQ: newAttribute("snapshot.abo81lMifn6q"),
};
/**
 * Attribute Title: Month of Quarter (Snapshot)
 * Attribute ID: snapshot.month.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotMonthOfQuarter: IAttribute = newAttribute("snapshot.aby81lMifn6q");
/**
 * Attribute Title: Day of Year (Snapshot)
 * Attribute ID: snapshot.day.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotDayOfYear: IAttribute = newAttribute("snapshot.abE81lMifn6q");
/**
 * Attribute Title: Day of Week (Sun-Sat) (Snapshot)
 * Attribute ID: snapshot.day.in.week
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotDayOfWeekSunSat = {
    /**
     * Display Form Title: Short (Sun) (Snapshot)
     * Display Form ID: snapshot.abK81lMifn6q
     */
    Short: newAttribute("snapshot.abK81lMifn6q"),
    /**
     * Display Form Title: Long (Sunday) (Snapshot)
     * Display Form ID: snapshot.abO81lMifn6q
     */ Long: newAttribute("snapshot.abO81lMifn6q"),
    /**
     * Display Form Title: Number (1=Sunday) (Snapshot)
     * Display Form ID: snapshot.abM81lMifn6q
     */ Number: newAttribute("snapshot.abM81lMifn6q"),
};
/**
 * Attribute Title: Day of Week (Mon-Sun) (Snapshot)
 * Attribute ID: snapshot.day.in.euweek
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotDayOfWeekMonSun = {
    /**
     * Display Form Title: Short (Mon) (Snapshot)
     * Display Form ID: snapshot.abU81lMifn6q
     */
    Short: newAttribute("snapshot.abU81lMifn6q"),
    /**
     * Display Form Title: Long (Monday) (Snapshot)
     * Display Form ID: snapshot.abY81lMifn6q
     */ Long: newAttribute("snapshot.abY81lMifn6q"),
    /**
     * Display Form Title: Number (1=Monday) (Snapshot)
     * Display Form ID: snapshot.abW81lMifn6q
     */ Number: newAttribute("snapshot.abW81lMifn6q"),
};
/**
 * Attribute Title: Day of Quarter (Snapshot)
 * Attribute ID: snapshot.day.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotDayOfQuarter: IAttribute = newAttribute("snapshot.ab481lMifn6q");
/**
 * Attribute Title: Day of Month (Snapshot)
 * Attribute ID: snapshot.day.in.month
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotDayOfMonth: IAttribute = newAttribute("snapshot.aca81lMifn6q");
/**
 * Attribute Title: Quarter/Year (Snapshot)
 * Attribute ID: snapshot.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotQuarterYear: IAttribute = newAttribute("snapshot.aci81lMifn6q");
/**
 * Attribute Title: Month/Year (Snapshot)
 * Attribute ID: snapshot.month
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotMonthYear = {
    /**
     * Display Form Title: Short (Jan 2010) (Snapshot)
     * Display Form ID: snapshot.act81lMifn6q
     */
    Short: newAttribute("snapshot.act81lMifn6q"),
    /**
     * Display Form Title: Long (January 2010) (Snapshot)
     * Display Form ID: snapshot.acx81lMifn6q
     */ Long: newAttribute("snapshot.acx81lMifn6q"),
    /**
     * Display Form Title: Number (1/2010) (Snapshot)
     * Display Form ID: snapshot.acv81lMifn6q
     */ Number: newAttribute("snapshot.acv81lMifn6q"),
};
/**
 * Attribute Title: Date (Snapshot)
 * Attribute ID: snapshot.date
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotDate = {
    /**
     * Display Form Title: mm/dd/yyyy (Snapshot)
     * Display Form ID: snapshot.date.mmddyyyy
     */
    MmDdYyyy: newAttribute("snapshot.date.mmddyyyy"),
    /**
     * Display Form Title: yyyy-mm-dd (Snapshot)
     * Display Form ID: snapshot.date.yyyymmdd
     */ YyyyMmDd: newAttribute("snapshot.date.yyyymmdd"),
    /**
     * Display Form Title: m/d/yy (no leading zeroes) (Snapshot)
     * Display Form ID: snapshot.date.mdyy
     */ MDYy: newAttribute("snapshot.date.mdyy"),
    /**
     * Display Form Title: Long (Mon, Jan 1, 2010) (Snapshot)
     * Display Form ID: snapshot.date.long
     */ Long: newAttribute("snapshot.date.long"),
    /**
     * Display Form Title: dd/mm/yyyy (Snapshot)
     * Display Form ID: snapshot.date.ddmmyyyy
     */ DdMmYyyy: newAttribute("snapshot.date.ddmmyyyy"),
    /**
     * Display Form Title: dd-mm-yyyy (Snapshot)
     * Display Form ID: snapshot.date.eddmmyyyy
     */ DdMmYyyy_1: newAttribute("snapshot.date.eddmmyyyy"),
};
/**
 * Attribute Title: Year (Activity)
 * Attribute ID: activity.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityYear: IAttribute = newAttribute("activity.aag81lMifn6q");
/**
 * Attribute Title: Quarter (Activity)
 * Attribute ID: activity.quarter.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityQuarter: IAttribute = newAttribute("activity.aam81lMifn6q");
/**
 * Attribute Title: Week (Sun-Sat)/Year (Activity)
 * Attribute ID: activity.week
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityWeekSunSatYear = {
    /**
     * Display Form Title: Week #/Year (W1/2010) (Activity)
     * Display Form ID: activity.aaA81lMifn6q
     */
    WeekNrYear: newAttribute("activity.aaA81lMifn6q"),
    /**
     * Display Form Title: Week Starting (Activity)
     * Display Form ID: activity.aaw81lMifn6q
     */ WeekStarting: newAttribute("activity.aaw81lMifn6q"),
    /**
     * Display Form Title: From - To (Activity)
     * Display Form ID: activity.aau81lMifn6q
     */ FromTo: newAttribute("activity.aau81lMifn6q"),
    /**
     * Display Form Title: Week #/Year (Cont.) (Activity)
     * Display Form ID: activity.aay81lMifn6q
     */ WeekNrYear_1: newAttribute("activity.aay81lMifn6q"),
    /**
     * Display Form Title: Wk/Qtr/Year (Cont.) (Activity)
     * Display Form ID: activity.aaC81lMifn6q
     */ WkQtrYear: newAttribute("activity.aaC81lMifn6q"),
    /**
     * Display Form Title: Wk/Qtr/Year (Activity)
     * Display Form ID: activity.aas81lMifn6q
     */ WkQtrYear_1: newAttribute("activity.aas81lMifn6q"),
};
/**
 * Attribute Title: Week (Sun-Sat) (Activity)
 * Attribute ID: activity.week.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityWeekSunSat: IAttribute = newAttribute("activity.aaI81lMifn6q");
/**
 * Attribute Title: Week (Sun-Sat) of Qtr (Activity)
 * Attribute ID: activity.week.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityWeekSunSatOfQtr: IAttribute = newAttribute("activity.aaO81lMifn6q");
/**
 * Attribute Title: Week (Mon-Sun)/Year (Activity)
 * Attribute ID: activity.euweek
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityWeekMonSunYear = {
    /**
     * Display Form Title: Week #/Year (W1/2010) (Activity)
     * Display Form ID: activity.aa281lMifn6q
     */
    WeekNrYear: newAttribute("activity.aa281lMifn6q"),
    /**
     * Display Form Title: Week Starting (Activity)
     * Display Form ID: activity.aaY81lMifn6q
     */ WeekStarting: newAttribute("activity.aaY81lMifn6q"),
    /**
     * Display Form Title: From - To (Activity)
     * Display Form ID: activity.aaW81lMifn6q
     */ FromTo: newAttribute("activity.aaW81lMifn6q"),
};
/**
 * Attribute Title: Week (Mon-Sun) (Activity)
 * Attribute ID: activity.euweek.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityWeekMonSun: IAttribute = newAttribute("activity.aba81lMifn6q");
/**
 * Attribute Title: Week (Mon-Sun) of Qtr (Activity)
 * Attribute ID: activity.euweek.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityWeekMonSunOfQtr: IAttribute = newAttribute("activity.abg81lMifn6q");
/**
 * Attribute Title: Month (Activity)
 * Attribute ID: activity.month.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityMonth = {
    /**
     * Display Form Title: Short (Jan) (Activity)
     * Display Form ID: activity.abm81lMifn6q
     */
    Short: newAttribute("activity.abm81lMifn6q"),
    /**
     * Display Form Title: Long (January) (Activity)
     * Display Form ID: activity.abs81lMifn6q
     */ Long: newAttribute("activity.abs81lMifn6q"),
    /**
     * Display Form Title: Number (M1) (Activity)
     * Display Form ID: activity.abq81lMifn6q
     */ Number: newAttribute("activity.abq81lMifn6q"),
    /**
     * Display Form Title: M/Q (M1/Q1) (Activity)
     * Display Form ID: activity.abo81lMifn6q
     */ MQ: newAttribute("activity.abo81lMifn6q"),
};
/**
 * Attribute Title: Month of Quarter (Activity)
 * Attribute ID: activity.month.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityMonthOfQuarter: IAttribute = newAttribute("activity.aby81lMifn6q");
/**
 * Attribute Title: Day of Year (Activity)
 * Attribute ID: activity.day.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityDayOfYear: IAttribute = newAttribute("activity.abE81lMifn6q");
/**
 * Attribute Title: Day of Week (Sun-Sat) (Activity)
 * Attribute ID: activity.day.in.week
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityDayOfWeekSunSat = {
    /**
     * Display Form Title: Short (Sun) (Activity)
     * Display Form ID: activity.abK81lMifn6q
     */
    Short: newAttribute("activity.abK81lMifn6q"),
    /**
     * Display Form Title: Long (Sunday) (Activity)
     * Display Form ID: activity.abO81lMifn6q
     */ Long: newAttribute("activity.abO81lMifn6q"),
    /**
     * Display Form Title: Number (1=Sunday) (Activity)
     * Display Form ID: activity.abM81lMifn6q
     */ Number: newAttribute("activity.abM81lMifn6q"),
};
/**
 * Attribute Title: Day of Week (Mon-Sun) (Activity)
 * Attribute ID: activity.day.in.euweek
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityDayOfWeekMonSun = {
    /**
     * Display Form Title: Short (Mon) (Activity)
     * Display Form ID: activity.abU81lMifn6q
     */
    Short: newAttribute("activity.abU81lMifn6q"),
    /**
     * Display Form Title: Long (Monday) (Activity)
     * Display Form ID: activity.abY81lMifn6q
     */ Long: newAttribute("activity.abY81lMifn6q"),
    /**
     * Display Form Title: Number (1=Monday) (Activity)
     * Display Form ID: activity.abW81lMifn6q
     */ Number: newAttribute("activity.abW81lMifn6q"),
};
/**
 * Attribute Title: Day of Quarter (Activity)
 * Attribute ID: activity.day.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityDayOfQuarter: IAttribute = newAttribute("activity.ab481lMifn6q");
/**
 * Attribute Title: Day of Month (Activity)
 * Attribute ID: activity.day.in.month
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityDayOfMonth: IAttribute = newAttribute("activity.aca81lMifn6q");
/**
 * Attribute Title: Quarter/Year (Activity)
 * Attribute ID: activity.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityQuarterYear: IAttribute = newAttribute("activity.aci81lMifn6q");
/**
 * Attribute Title: Month/Year (Activity)
 * Attribute ID: activity.month
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityMonthYear = {
    /**
     * Display Form Title: Short (Jan 2010) (Activity)
     * Display Form ID: activity.act81lMifn6q
     */
    Short: newAttribute("activity.act81lMifn6q"),
    /**
     * Display Form Title: Long (January 2010) (Activity)
     * Display Form ID: activity.acx81lMifn6q
     */ Long: newAttribute("activity.acx81lMifn6q"),
    /**
     * Display Form Title: Number (1/2010) (Activity)
     * Display Form ID: activity.acv81lMifn6q
     */ Number: newAttribute("activity.acv81lMifn6q"),
};
/**
 * Attribute Title: Date (Activity)
 * Attribute ID: activity.date
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityDate_1 = {
    /**
     * Display Form Title: mm/dd/yyyy (Activity)
     * Display Form ID: activity.date.mmddyyyy
     */
    MmDdYyyy: newAttribute("activity.date.mmddyyyy"),
    /**
     * Display Form Title: yyyy-mm-dd (Activity)
     * Display Form ID: activity.date.yyyymmdd
     */ YyyyMmDd: newAttribute("activity.date.yyyymmdd"),
    /**
     * Display Form Title: m/d/yy (no leading zeroes) (Activity)
     * Display Form ID: activity.date.mdyy
     */ MDYy: newAttribute("activity.date.mdyy"),
    /**
     * Display Form Title: Long (Mon, Jan 1, 2010) (Activity)
     * Display Form ID: activity.date.long
     */ Long: newAttribute("activity.date.long"),
    /**
     * Display Form Title: dd/mm/yyyy (Activity)
     * Display Form ID: activity.date.ddmmyyyy
     */ DdMmYyyy: newAttribute("activity.date.ddmmyyyy"),
    /**
     * Display Form Title: dd-mm-yyyy (Activity)
     * Display Form ID: activity.date.eddmmyyyy
     */ DdMmYyyy_1: newAttribute("activity.date.eddmmyyyy"),
};
/**
 * Attribute Title: Year (Timeline)
 * Attribute ID: timeline.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineYear: IAttribute = newAttribute("timeline.aag81lMifn6q");
/**
 * Attribute Title: Quarter (Timeline)
 * Attribute ID: timeline.quarter.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineQuarter: IAttribute = newAttribute("timeline.aam81lMifn6q");
/**
 * Attribute Title: Week (Sun-Sat)/Year (Timeline)
 * Attribute ID: timeline.week
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
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
 * Attribute ID: timeline.week.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineWeekSunSat: IAttribute = newAttribute("timeline.aaI81lMifn6q");
/**
 * Attribute Title: Week (Sun-Sat) of Qtr (Timeline)
 * Attribute ID: timeline.week.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineWeekSunSatOfQtr: IAttribute = newAttribute("timeline.aaO81lMifn6q");
/**
 * Attribute Title: Week (Mon-Sun)/Year (Timeline)
 * Attribute ID: timeline.euweek
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
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
 * Attribute ID: timeline.euweek.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineWeekMonSun: IAttribute = newAttribute("timeline.aba81lMifn6q");
/**
 * Attribute Title: Week (Mon-Sun) of Qtr (Timeline)
 * Attribute ID: timeline.euweek.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineWeekMonSunOfQtr: IAttribute = newAttribute("timeline.abg81lMifn6q");
/**
 * Attribute Title: Month (Timeline)
 * Attribute ID: timeline.month.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
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
 * Attribute ID: timeline.month.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineMonthOfQuarter: IAttribute = newAttribute("timeline.aby81lMifn6q");
/**
 * Attribute Title: Day of Year (Timeline)
 * Attribute ID: timeline.day.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineDayOfYear: IAttribute = newAttribute("timeline.abE81lMifn6q");
/**
 * Attribute Title: Day of Week (Sun-Sat) (Timeline)
 * Attribute ID: timeline.day.in.week
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
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
/**
 * Attribute Title: Day of Week (Mon-Sun) (Timeline)
 * Attribute ID: timeline.day.in.euweek
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
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
 * Attribute ID: timeline.day.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineDayOfQuarter: IAttribute = newAttribute("timeline.ab481lMifn6q");
/**
 * Attribute Title: Day of Month (Timeline)
 * Attribute ID: timeline.day.in.month
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineDayOfMonth: IAttribute = newAttribute("timeline.aca81lMifn6q");
/**
 * Attribute Title: Quarter/Year (Timeline)
 * Attribute ID: timeline.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineQuarterYear: IAttribute = newAttribute("timeline.aci81lMifn6q");
/**
 * Attribute Title: Month/Year (Timeline)
 * Attribute ID: timeline.month
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
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
/**
 * Attribute Title: Date (Timeline)
 * Attribute ID: timeline.date
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineDate_1 = {
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
/** Available Date Data Sets */
export const DateDatasets = {
    /**
     * Date Data Set Title: Date (Created)
     * Date Data Set ID: created.dataset.dt
     */
    Created: {
        ref: idRef("created.dataset.dt", "dataSet"),
        identifier: "created.dataset.dt",
        /**
         * Date Attribute: Year (Created)
         * Date Attribute ID: created.year
         */ Year: {
            ref: idRef("created.year", "attribute"),
            identifier: "created.year",
            /**
             * Display Form Title: Year (Created)
             * Display Form ID: created.aag81lMifn6q
             */ Default: newAttribute("created.aag81lMifn6q"),
        },
        /**
         * Date Attribute: Quarter (Created)
         * Date Attribute ID: created.quarter.in.year
         */ Quarter: {
            ref: idRef("created.quarter.in.year", "attribute"),
            identifier: "created.quarter.in.year",
            /**
             * Display Form Title: default (Created)
             * Display Form ID: created.aam81lMifn6q
             */ Default: newAttribute("created.aam81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Sun-Sat)/Year (Created)
         * Date Attribute ID: created.week
         */ WeekSunSatYear: {
            ref: idRef("created.week", "attribute"),
            identifier: "created.week",
            /**
             * Display Form Title: Week #/Year (W1/2010) (Created)
             * Display Form ID: created.aaA81lMifn6q
             */ WeekNrYear: newAttribute("created.aaA81lMifn6q"),
            /**
             * Display Form Title: Week Starting (Created)
             * Display Form ID: created.aaw81lMifn6q
             */ WeekStarting: newAttribute("created.aaw81lMifn6q"),
            /**
             * Display Form Title: From - To (Created)
             * Display Form ID: created.aau81lMifn6q
             */ FromTo: newAttribute("created.aau81lMifn6q"),
            /**
             * Display Form Title: Week #/Year (Cont.) (Created)
             * Display Form ID: created.aay81lMifn6q
             */ WeekNrYear_1: newAttribute("created.aay81lMifn6q"),
            /**
             * Display Form Title: Wk/Qtr/Year (Cont.) (Created)
             * Display Form ID: created.aaC81lMifn6q
             */ WkQtrYear: newAttribute("created.aaC81lMifn6q"),
            /**
             * Display Form Title: Wk/Qtr/Year (Created)
             * Display Form ID: created.aas81lMifn6q
             */ WkQtrYear_1: newAttribute("created.aas81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Sun-Sat) (Created)
         * Date Attribute ID: created.week.in.year
         */ WeekSunSat: {
            ref: idRef("created.week.in.year", "attribute"),
            identifier: "created.week.in.year",
            /**
             * Display Form Title: Number US (Created)
             * Display Form ID: created.aaI81lMifn6q
             */ NumberUS: newAttribute("created.aaI81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Sun-Sat) of Qtr (Created)
         * Date Attribute ID: created.week.in.quarter
         */ WeekSunSatOfQtr: {
            ref: idRef("created.week.in.quarter", "attribute"),
            identifier: "created.week.in.quarter",
            /**
             * Display Form Title: Number US (Created)
             * Display Form ID: created.aaO81lMifn6q
             */ NumberUS: newAttribute("created.aaO81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Mon-Sun)/Year (Created)
         * Date Attribute ID: created.euweek
         */ WeekMonSunYear: {
            ref: idRef("created.euweek", "attribute"),
            identifier: "created.euweek",
            /**
             * Display Form Title: Week #/Year (W1/2010) (Created)
             * Display Form ID: created.aa281lMifn6q
             */ WeekNrYear: newAttribute("created.aa281lMifn6q"),
            /**
             * Display Form Title: Week Starting (Created)
             * Display Form ID: created.aaY81lMifn6q
             */ WeekStarting: newAttribute("created.aaY81lMifn6q"),
            /**
             * Display Form Title: From - To (Created)
             * Display Form ID: created.aaW81lMifn6q
             */ FromTo: newAttribute("created.aaW81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Mon-Sun) (Created)
         * Date Attribute ID: created.euweek.in.year
         */ WeekMonSun: {
            ref: idRef("created.euweek.in.year", "attribute"),
            identifier: "created.euweek.in.year",
            /**
             * Display Form Title: Number EU (Created)
             * Display Form ID: created.aba81lMifn6q
             */ NumberEU: newAttribute("created.aba81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Mon-Sun) of Qtr (Created)
         * Date Attribute ID: created.euweek.in.quarter
         */ WeekMonSunOfQtr: {
            ref: idRef("created.euweek.in.quarter", "attribute"),
            identifier: "created.euweek.in.quarter",
            /**
             * Display Form Title: Number EU (Created)
             * Display Form ID: created.abg81lMifn6q
             */ NumberEU: newAttribute("created.abg81lMifn6q"),
        },
        /**
         * Date Attribute: Month (Created)
         * Date Attribute ID: created.month.in.year
         */ Month: {
            ref: idRef("created.month.in.year", "attribute"),
            identifier: "created.month.in.year",
            /**
             * Display Form Title: Short (Jan) (Created)
             * Display Form ID: created.abm81lMifn6q
             */ Short: newAttribute("created.abm81lMifn6q"),
            /**
             * Display Form Title: Long (January) (Created)
             * Display Form ID: created.abs81lMifn6q
             */ Long: newAttribute("created.abs81lMifn6q"),
            /**
             * Display Form Title: Number (M1) (Created)
             * Display Form ID: created.abq81lMifn6q
             */ Number: newAttribute("created.abq81lMifn6q"),
            /**
             * Display Form Title: M/Q (M1/Q1) (Created)
             * Display Form ID: created.abo81lMifn6q
             */ MQ: newAttribute("created.abo81lMifn6q"),
        },
        /**
         * Date Attribute: Month of Quarter (Created)
         * Date Attribute ID: created.month.in.quarter
         */ MonthOfQuarter: {
            ref: idRef("created.month.in.quarter", "attribute"),
            identifier: "created.month.in.quarter",
            /**
             * Display Form Title: Number (Created)
             * Display Form ID: created.aby81lMifn6q
             */ Number: newAttribute("created.aby81lMifn6q"),
        },
        /**
         * Date Attribute: Day of Year (Created)
         * Date Attribute ID: created.day.in.year
         */ DayOfYear: {
            ref: idRef("created.day.in.year", "attribute"),
            identifier: "created.day.in.year",
            /**
             * Display Form Title: default (Created)
             * Display Form ID: created.abE81lMifn6q
             */ Default: newAttribute("created.abE81lMifn6q"),
        },
        /**
         * Date Attribute: Day of Week (Sun-Sat) (Created)
         * Date Attribute ID: created.day.in.week
         */ DayOfWeekSunSat: {
            ref: idRef("created.day.in.week", "attribute"),
            identifier: "created.day.in.week",
            /**
             * Display Form Title: Short (Sun) (Created)
             * Display Form ID: created.abK81lMifn6q
             */ Short: newAttribute("created.abK81lMifn6q"),
            /**
             * Display Form Title: Long (Sunday) (Created)
             * Display Form ID: created.abO81lMifn6q
             */ Long: newAttribute("created.abO81lMifn6q"),
            /**
             * Display Form Title: Number (1=Sunday) (Created)
             * Display Form ID: created.abM81lMifn6q
             */ Number: newAttribute("created.abM81lMifn6q"),
        },
        /**
         * Date Attribute: Day of Week (Mon-Sun) (Created)
         * Date Attribute ID: created.day.in.euweek
         */ DayOfWeekMonSun: {
            ref: idRef("created.day.in.euweek", "attribute"),
            identifier: "created.day.in.euweek",
            /**
             * Display Form Title: Short (Mon) (Created)
             * Display Form ID: created.abU81lMifn6q
             */ Short: newAttribute("created.abU81lMifn6q"),
            /**
             * Display Form Title: Long (Monday) (Created)
             * Display Form ID: created.abY81lMifn6q
             */ Long: newAttribute("created.abY81lMifn6q"),
            /**
             * Display Form Title: Number (1=Monday) (Created)
             * Display Form ID: created.abW81lMifn6q
             */ Number: newAttribute("created.abW81lMifn6q"),
        },
        /**
         * Date Attribute: Day of Quarter (Created)
         * Date Attribute ID: created.day.in.quarter
         */ DayOfQuarter: {
            ref: idRef("created.day.in.quarter", "attribute"),
            identifier: "created.day.in.quarter",
            /**
             * Display Form Title: default (Created)
             * Display Form ID: created.ab481lMifn6q
             */ Default: newAttribute("created.ab481lMifn6q"),
        },
        /**
         * Date Attribute: Day of Month (Created)
         * Date Attribute ID: created.day.in.month
         */ DayOfMonth: {
            ref: idRef("created.day.in.month", "attribute"),
            identifier: "created.day.in.month",
            /**
             * Display Form Title: default (Created)
             * Display Form ID: created.aca81lMifn6q
             */ Default: newAttribute("created.aca81lMifn6q"),
        },
        /**
         * Date Attribute: Quarter/Year (Created)
         * Date Attribute ID: created.quarter
         */ QuarterYear: {
            ref: idRef("created.quarter", "attribute"),
            identifier: "created.quarter",
            /**
             * Display Form Title: US Short (Created)
             * Display Form ID: created.aci81lMifn6q
             */ USShort: newAttribute("created.aci81lMifn6q"),
        },
        /**
         * Date Attribute: Month/Year (Created)
         * Date Attribute ID: created.month
         */ MonthYear: {
            ref: idRef("created.month", "attribute"),
            identifier: "created.month",
            /**
             * Display Form Title: Short (Jan 2010) (Created)
             * Display Form ID: created.act81lMifn6q
             */ Short: newAttribute("created.act81lMifn6q"),
            /**
             * Display Form Title: Long (January 2010) (Created)
             * Display Form ID: created.acx81lMifn6q
             */ Long: newAttribute("created.acx81lMifn6q"),
            /**
             * Display Form Title: Number (1/2010) (Created)
             * Display Form ID: created.acv81lMifn6q
             */ Number: newAttribute("created.acv81lMifn6q"),
        },
        /**
         * Date Attribute: Date (Created)
         * Date Attribute ID: created.date
         */ Date: {
            ref: idRef("created.date", "attribute"),
            identifier: "created.date",
            /**
             * Display Form Title: mm/dd/yyyy (Created)
             * Display Form ID: created.date.mmddyyyy
             */ MmDdYyyy: newAttribute("created.date.mmddyyyy"),
            /**
             * Display Form Title: yyyy-mm-dd (Created)
             * Display Form ID: created.date.yyyymmdd
             */ YyyyMmDd: newAttribute("created.date.yyyymmdd"),
            /**
             * Display Form Title: m/d/yy (no leading zeroes) (Created)
             * Display Form ID: created.date.mdyy
             */ MDYy: newAttribute("created.date.mdyy"),
            /**
             * Display Form Title: Long (Mon, Jan 1, 2010) (Created)
             * Display Form ID: created.date.long
             */ Long: newAttribute("created.date.long"),
            /**
             * Display Form Title: dd/mm/yyyy (Created)
             * Display Form ID: created.date.ddmmyyyy
             */ DdMmYyyy: newAttribute("created.date.ddmmyyyy"),
            /**
             * Display Form Title: dd-mm-yyyy (Created)
             * Display Form ID: created.date.eddmmyyyy
             */ DdMmYyyy_1: newAttribute("created.date.eddmmyyyy"),
        },
    },
    /**
     * Date Data Set Title: Date (Closed)
     * Date Data Set ID: closed.dataset.dt
     */ Closed: {
        ref: idRef("closed.dataset.dt", "dataSet"),
        identifier: "closed.dataset.dt",
        /**
         * Date Attribute: Year (Closed)
         * Date Attribute ID: closed.year
         */ Year: {
            ref: idRef("closed.year", "attribute"),
            identifier: "closed.year",
            /**
             * Display Form Title: Year (Closed)
             * Display Form ID: closed.aag81lMifn6q
             */ Default: newAttribute("closed.aag81lMifn6q"),
        },
        /**
         * Date Attribute: Quarter (Closed)
         * Date Attribute ID: closed.quarter.in.year
         */ Quarter: {
            ref: idRef("closed.quarter.in.year", "attribute"),
            identifier: "closed.quarter.in.year",
            /**
             * Display Form Title: default (Closed)
             * Display Form ID: closed.aam81lMifn6q
             */ Default: newAttribute("closed.aam81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Sun-Sat)/Year (Closed)
         * Date Attribute ID: closed.week
         */ WeekSunSatYear: {
            ref: idRef("closed.week", "attribute"),
            identifier: "closed.week",
            /**
             * Display Form Title: Week #/Year (W1/2010) (Closed)
             * Display Form ID: closed.aaA81lMifn6q
             */ WeekNrYear: newAttribute("closed.aaA81lMifn6q"),
            /**
             * Display Form Title: Week Starting (Closed)
             * Display Form ID: closed.aaw81lMifn6q
             */ WeekStarting: newAttribute("closed.aaw81lMifn6q"),
            /**
             * Display Form Title: From - To (Closed)
             * Display Form ID: closed.aau81lMifn6q
             */ FromTo: newAttribute("closed.aau81lMifn6q"),
            /**
             * Display Form Title: Week #/Year (Cont.) (Closed)
             * Display Form ID: closed.aay81lMifn6q
             */ WeekNrYear_1: newAttribute("closed.aay81lMifn6q"),
            /**
             * Display Form Title: Wk/Qtr/Year (Cont.) (Closed)
             * Display Form ID: closed.aaC81lMifn6q
             */ WkQtrYear: newAttribute("closed.aaC81lMifn6q"),
            /**
             * Display Form Title: Wk/Qtr/Year (Closed)
             * Display Form ID: closed.aas81lMifn6q
             */ WkQtrYear_1: newAttribute("closed.aas81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Sun-Sat) (Closed)
         * Date Attribute ID: closed.week.in.year
         */ WeekSunSat: {
            ref: idRef("closed.week.in.year", "attribute"),
            identifier: "closed.week.in.year",
            /**
             * Display Form Title: Number US (Closed)
             * Display Form ID: closed.aaI81lMifn6q
             */ NumberUS: newAttribute("closed.aaI81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Sun-Sat) of Qtr (Closed)
         * Date Attribute ID: closed.week.in.quarter
         */ WeekSunSatOfQtr: {
            ref: idRef("closed.week.in.quarter", "attribute"),
            identifier: "closed.week.in.quarter",
            /**
             * Display Form Title: Number US (Closed)
             * Display Form ID: closed.aaO81lMifn6q
             */ NumberUS: newAttribute("closed.aaO81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Mon-Sun)/Year (Closed)
         * Date Attribute ID: closed.euweek
         */ WeekMonSunYear: {
            ref: idRef("closed.euweek", "attribute"),
            identifier: "closed.euweek",
            /**
             * Display Form Title: Week #/Year (W1/2010) (Closed)
             * Display Form ID: closed.aa281lMifn6q
             */ WeekNrYear: newAttribute("closed.aa281lMifn6q"),
            /**
             * Display Form Title: Week Starting (Closed)
             * Display Form ID: closed.aaY81lMifn6q
             */ WeekStarting: newAttribute("closed.aaY81lMifn6q"),
            /**
             * Display Form Title: From - To (Closed)
             * Display Form ID: closed.aaW81lMifn6q
             */ FromTo: newAttribute("closed.aaW81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Mon-Sun) (Closed)
         * Date Attribute ID: closed.euweek.in.year
         */ WeekMonSun: {
            ref: idRef("closed.euweek.in.year", "attribute"),
            identifier: "closed.euweek.in.year",
            /**
             * Display Form Title: Number EU (Closed)
             * Display Form ID: closed.aba81lMifn6q
             */ NumberEU: newAttribute("closed.aba81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Mon-Sun) of Qtr (Closed)
         * Date Attribute ID: closed.euweek.in.quarter
         */ WeekMonSunOfQtr: {
            ref: idRef("closed.euweek.in.quarter", "attribute"),
            identifier: "closed.euweek.in.quarter",
            /**
             * Display Form Title: Number EU (Closed)
             * Display Form ID: closed.abg81lMifn6q
             */ NumberEU: newAttribute("closed.abg81lMifn6q"),
        },
        /**
         * Date Attribute: Month (Closed)
         * Date Attribute ID: closed.month.in.year
         */ Month: {
            ref: idRef("closed.month.in.year", "attribute"),
            identifier: "closed.month.in.year",
            /**
             * Display Form Title: Short (Jan) (Closed)
             * Display Form ID: closed.abm81lMifn6q
             */ Short: newAttribute("closed.abm81lMifn6q"),
            /**
             * Display Form Title: Long (January) (Closed)
             * Display Form ID: closed.abs81lMifn6q
             */ Long: newAttribute("closed.abs81lMifn6q"),
            /**
             * Display Form Title: Number (M1) (Closed)
             * Display Form ID: closed.abq81lMifn6q
             */ Number: newAttribute("closed.abq81lMifn6q"),
            /**
             * Display Form Title: M/Q (M1/Q1) (Closed)
             * Display Form ID: closed.abo81lMifn6q
             */ MQ: newAttribute("closed.abo81lMifn6q"),
        },
        /**
         * Date Attribute: Month of Quarter (Closed)
         * Date Attribute ID: closed.month.in.quarter
         */ MonthOfQuarter: {
            ref: idRef("closed.month.in.quarter", "attribute"),
            identifier: "closed.month.in.quarter",
            /**
             * Display Form Title: Number (Closed)
             * Display Form ID: closed.aby81lMifn6q
             */ Number: newAttribute("closed.aby81lMifn6q"),
        },
        /**
         * Date Attribute: Day of Year (Closed)
         * Date Attribute ID: closed.day.in.year
         */ DayOfYear: {
            ref: idRef("closed.day.in.year", "attribute"),
            identifier: "closed.day.in.year",
            /**
             * Display Form Title: default (Closed)
             * Display Form ID: closed.abE81lMifn6q
             */ Default: newAttribute("closed.abE81lMifn6q"),
        },
        /**
         * Date Attribute: Day of Week (Sun-Sat) (Closed)
         * Date Attribute ID: closed.day.in.week
         */ DayOfWeekSunSat: {
            ref: idRef("closed.day.in.week", "attribute"),
            identifier: "closed.day.in.week",
            /**
             * Display Form Title: Short (Sun) (Closed)
             * Display Form ID: closed.abK81lMifn6q
             */ Short: newAttribute("closed.abK81lMifn6q"),
            /**
             * Display Form Title: Long (Sunday) (Closed)
             * Display Form ID: closed.abO81lMifn6q
             */ Long: newAttribute("closed.abO81lMifn6q"),
            /**
             * Display Form Title: Number (1=Sunday) (Closed)
             * Display Form ID: closed.abM81lMifn6q
             */ Number: newAttribute("closed.abM81lMifn6q"),
        },
        /**
         * Date Attribute: Day of Week (Mon-Sun) (Closed)
         * Date Attribute ID: closed.day.in.euweek
         */ DayOfWeekMonSun: {
            ref: idRef("closed.day.in.euweek", "attribute"),
            identifier: "closed.day.in.euweek",
            /**
             * Display Form Title: Short (Mon) (Closed)
             * Display Form ID: closed.abU81lMifn6q
             */ Short: newAttribute("closed.abU81lMifn6q"),
            /**
             * Display Form Title: Long (Monday) (Closed)
             * Display Form ID: closed.abY81lMifn6q
             */ Long: newAttribute("closed.abY81lMifn6q"),
            /**
             * Display Form Title: Number (1=Monday) (Closed)
             * Display Form ID: closed.abW81lMifn6q
             */ Number: newAttribute("closed.abW81lMifn6q"),
        },
        /**
         * Date Attribute: Day of Quarter (Closed)
         * Date Attribute ID: closed.day.in.quarter
         */ DayOfQuarter: {
            ref: idRef("closed.day.in.quarter", "attribute"),
            identifier: "closed.day.in.quarter",
            /**
             * Display Form Title: default (Closed)
             * Display Form ID: closed.ab481lMifn6q
             */ Default: newAttribute("closed.ab481lMifn6q"),
        },
        /**
         * Date Attribute: Day of Month (Closed)
         * Date Attribute ID: closed.day.in.month
         */ DayOfMonth: {
            ref: idRef("closed.day.in.month", "attribute"),
            identifier: "closed.day.in.month",
            /**
             * Display Form Title: default (Closed)
             * Display Form ID: closed.aca81lMifn6q
             */ Default: newAttribute("closed.aca81lMifn6q"),
        },
        /**
         * Date Attribute: Quarter/Year (Closed)
         * Date Attribute ID: closed.quarter
         */ QuarterYear: {
            ref: idRef("closed.quarter", "attribute"),
            identifier: "closed.quarter",
            /**
             * Display Form Title: US Short (Closed)
             * Display Form ID: closed.aci81lMifn6q
             */ USShort: newAttribute("closed.aci81lMifn6q"),
        },
        /**
         * Date Attribute: Month/Year (Closed)
         * Date Attribute ID: closed.month
         */ MonthYear: {
            ref: idRef("closed.month", "attribute"),
            identifier: "closed.month",
            /**
             * Display Form Title: Short (Jan 2010) (Closed)
             * Display Form ID: closed.act81lMifn6q
             */ Short: newAttribute("closed.act81lMifn6q"),
            /**
             * Display Form Title: Long (January 2010) (Closed)
             * Display Form ID: closed.acx81lMifn6q
             */ Long: newAttribute("closed.acx81lMifn6q"),
            /**
             * Display Form Title: Number (1/2010) (Closed)
             * Display Form ID: closed.acv81lMifn6q
             */ Number: newAttribute("closed.acv81lMifn6q"),
        },
        /**
         * Date Attribute: Date (Closed)
         * Date Attribute ID: closed.date
         */ Date: {
            ref: idRef("closed.date", "attribute"),
            identifier: "closed.date",
            /**
             * Display Form Title: mm/dd/yyyy (Closed)
             * Display Form ID: closed.date.mmddyyyy
             */ MmDdYyyy: newAttribute("closed.date.mmddyyyy"),
            /**
             * Display Form Title: yyyy-mm-dd (Closed)
             * Display Form ID: closed.date.yyyymmdd
             */ YyyyMmDd: newAttribute("closed.date.yyyymmdd"),
            /**
             * Display Form Title: m/d/yy (no leading zeroes) (Closed)
             * Display Form ID: closed.date.mdyy
             */ MDYy: newAttribute("closed.date.mdyy"),
            /**
             * Display Form Title: Long (Mon, Jan 1, 2010) (Closed)
             * Display Form ID: closed.date.long
             */ Long: newAttribute("closed.date.long"),
            /**
             * Display Form Title: dd/mm/yyyy (Closed)
             * Display Form ID: closed.date.ddmmyyyy
             */ DdMmYyyy: newAttribute("closed.date.ddmmyyyy"),
            /**
             * Display Form Title: dd-mm-yyyy (Closed)
             * Display Form ID: closed.date.eddmmyyyy
             */ DdMmYyyy_1: newAttribute("closed.date.eddmmyyyy"),
        },
    },
    /**
     * Date Data Set Title: Date (Snapshot)
     * Date Data Set ID: snapshot.dataset.dt
     */ Snapshot: {
        ref: idRef("snapshot.dataset.dt", "dataSet"),
        identifier: "snapshot.dataset.dt",
        /**
         * Date Attribute: Year (Snapshot)
         * Date Attribute ID: snapshot.year
         */ Year: {
            ref: idRef("snapshot.year", "attribute"),
            identifier: "snapshot.year",
            /**
             * Display Form Title: Year (Snapshot)
             * Display Form ID: snapshot.aag81lMifn6q
             */ Default: newAttribute("snapshot.aag81lMifn6q"),
        },
        /**
         * Date Attribute: Quarter (Snapshot)
         * Date Attribute ID: snapshot.quarter.in.year
         */ Quarter: {
            ref: idRef("snapshot.quarter.in.year", "attribute"),
            identifier: "snapshot.quarter.in.year",
            /**
             * Display Form Title: default (Snapshot)
             * Display Form ID: snapshot.aam81lMifn6q
             */ Default: newAttribute("snapshot.aam81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Sun-Sat)/Year (Snapshot)
         * Date Attribute ID: snapshot.week
         */ WeekSunSatYear: {
            ref: idRef("snapshot.week", "attribute"),
            identifier: "snapshot.week",
            /**
             * Display Form Title: Week #/Year (W1/2010) (Snapshot)
             * Display Form ID: snapshot.aaA81lMifn6q
             */ WeekNrYear: newAttribute("snapshot.aaA81lMifn6q"),
            /**
             * Display Form Title: Week Starting (Snapshot)
             * Display Form ID: snapshot.aaw81lMifn6q
             */ WeekStarting: newAttribute("snapshot.aaw81lMifn6q"),
            /**
             * Display Form Title: From - To (Snapshot)
             * Display Form ID: snapshot.aau81lMifn6q
             */ FromTo: newAttribute("snapshot.aau81lMifn6q"),
            /**
             * Display Form Title: Week #/Year (Cont.) (Snapshot)
             * Display Form ID: snapshot.aay81lMifn6q
             */ WeekNrYear_1: newAttribute("snapshot.aay81lMifn6q"),
            /**
             * Display Form Title: Wk/Qtr/Year (Cont.) (Snapshot)
             * Display Form ID: snapshot.aaC81lMifn6q
             */ WkQtrYear: newAttribute("snapshot.aaC81lMifn6q"),
            /**
             * Display Form Title: Wk/Qtr/Year (Snapshot)
             * Display Form ID: snapshot.aas81lMifn6q
             */ WkQtrYear_1: newAttribute("snapshot.aas81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Sun-Sat) (Snapshot)
         * Date Attribute ID: snapshot.week.in.year
         */ WeekSunSat: {
            ref: idRef("snapshot.week.in.year", "attribute"),
            identifier: "snapshot.week.in.year",
            /**
             * Display Form Title: Number US (Snapshot)
             * Display Form ID: snapshot.aaI81lMifn6q
             */ NumberUS: newAttribute("snapshot.aaI81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Sun-Sat) of Qtr (Snapshot)
         * Date Attribute ID: snapshot.week.in.quarter
         */ WeekSunSatOfQtr: {
            ref: idRef("snapshot.week.in.quarter", "attribute"),
            identifier: "snapshot.week.in.quarter",
            /**
             * Display Form Title: Number US (Snapshot)
             * Display Form ID: snapshot.aaO81lMifn6q
             */ NumberUS: newAttribute("snapshot.aaO81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Mon-Sun)/Year (Snapshot)
         * Date Attribute ID: snapshot.euweek
         */ WeekMonSunYear: {
            ref: idRef("snapshot.euweek", "attribute"),
            identifier: "snapshot.euweek",
            /**
             * Display Form Title: Week #/Year (W1/2010) (Snapshot)
             * Display Form ID: snapshot.aa281lMifn6q
             */ WeekNrYear: newAttribute("snapshot.aa281lMifn6q"),
            /**
             * Display Form Title: Week Starting (Snapshot)
             * Display Form ID: snapshot.aaY81lMifn6q
             */ WeekStarting: newAttribute("snapshot.aaY81lMifn6q"),
            /**
             * Display Form Title: From - To (Snapshot)
             * Display Form ID: snapshot.aaW81lMifn6q
             */ FromTo: newAttribute("snapshot.aaW81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Mon-Sun) (Snapshot)
         * Date Attribute ID: snapshot.euweek.in.year
         */ WeekMonSun: {
            ref: idRef("snapshot.euweek.in.year", "attribute"),
            identifier: "snapshot.euweek.in.year",
            /**
             * Display Form Title: Number EU (Snapshot)
             * Display Form ID: snapshot.aba81lMifn6q
             */ NumberEU: newAttribute("snapshot.aba81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Mon-Sun) of Qtr (Snapshot)
         * Date Attribute ID: snapshot.euweek.in.quarter
         */ WeekMonSunOfQtr: {
            ref: idRef("snapshot.euweek.in.quarter", "attribute"),
            identifier: "snapshot.euweek.in.quarter",
            /**
             * Display Form Title: Number EU (Snapshot)
             * Display Form ID: snapshot.abg81lMifn6q
             */ NumberEU: newAttribute("snapshot.abg81lMifn6q"),
        },
        /**
         * Date Attribute: Month (Snapshot)
         * Date Attribute ID: snapshot.month.in.year
         */ Month: {
            ref: idRef("snapshot.month.in.year", "attribute"),
            identifier: "snapshot.month.in.year",
            /**
             * Display Form Title: Short (Jan) (Snapshot)
             * Display Form ID: snapshot.abm81lMifn6q
             */ Short: newAttribute("snapshot.abm81lMifn6q"),
            /**
             * Display Form Title: Long (January) (Snapshot)
             * Display Form ID: snapshot.abs81lMifn6q
             */ Long: newAttribute("snapshot.abs81lMifn6q"),
            /**
             * Display Form Title: Number (M1) (Snapshot)
             * Display Form ID: snapshot.abq81lMifn6q
             */ Number: newAttribute("snapshot.abq81lMifn6q"),
            /**
             * Display Form Title: M/Q (M1/Q1) (Snapshot)
             * Display Form ID: snapshot.abo81lMifn6q
             */ MQ: newAttribute("snapshot.abo81lMifn6q"),
        },
        /**
         * Date Attribute: Month of Quarter (Snapshot)
         * Date Attribute ID: snapshot.month.in.quarter
         */ MonthOfQuarter: {
            ref: idRef("snapshot.month.in.quarter", "attribute"),
            identifier: "snapshot.month.in.quarter",
            /**
             * Display Form Title: Number (Snapshot)
             * Display Form ID: snapshot.aby81lMifn6q
             */ Number: newAttribute("snapshot.aby81lMifn6q"),
        },
        /**
         * Date Attribute: Day of Year (Snapshot)
         * Date Attribute ID: snapshot.day.in.year
         */ DayOfYear: {
            ref: idRef("snapshot.day.in.year", "attribute"),
            identifier: "snapshot.day.in.year",
            /**
             * Display Form Title: default (Snapshot)
             * Display Form ID: snapshot.abE81lMifn6q
             */ Default: newAttribute("snapshot.abE81lMifn6q"),
        },
        /**
         * Date Attribute: Day of Week (Sun-Sat) (Snapshot)
         * Date Attribute ID: snapshot.day.in.week
         */ DayOfWeekSunSat: {
            ref: idRef("snapshot.day.in.week", "attribute"),
            identifier: "snapshot.day.in.week",
            /**
             * Display Form Title: Short (Sun) (Snapshot)
             * Display Form ID: snapshot.abK81lMifn6q
             */ Short: newAttribute("snapshot.abK81lMifn6q"),
            /**
             * Display Form Title: Long (Sunday) (Snapshot)
             * Display Form ID: snapshot.abO81lMifn6q
             */ Long: newAttribute("snapshot.abO81lMifn6q"),
            /**
             * Display Form Title: Number (1=Sunday) (Snapshot)
             * Display Form ID: snapshot.abM81lMifn6q
             */ Number: newAttribute("snapshot.abM81lMifn6q"),
        },
        /**
         * Date Attribute: Day of Week (Mon-Sun) (Snapshot)
         * Date Attribute ID: snapshot.day.in.euweek
         */ DayOfWeekMonSun: {
            ref: idRef("snapshot.day.in.euweek", "attribute"),
            identifier: "snapshot.day.in.euweek",
            /**
             * Display Form Title: Short (Mon) (Snapshot)
             * Display Form ID: snapshot.abU81lMifn6q
             */ Short: newAttribute("snapshot.abU81lMifn6q"),
            /**
             * Display Form Title: Long (Monday) (Snapshot)
             * Display Form ID: snapshot.abY81lMifn6q
             */ Long: newAttribute("snapshot.abY81lMifn6q"),
            /**
             * Display Form Title: Number (1=Monday) (Snapshot)
             * Display Form ID: snapshot.abW81lMifn6q
             */ Number: newAttribute("snapshot.abW81lMifn6q"),
        },
        /**
         * Date Attribute: Day of Quarter (Snapshot)
         * Date Attribute ID: snapshot.day.in.quarter
         */ DayOfQuarter: {
            ref: idRef("snapshot.day.in.quarter", "attribute"),
            identifier: "snapshot.day.in.quarter",
            /**
             * Display Form Title: default (Snapshot)
             * Display Form ID: snapshot.ab481lMifn6q
             */ Default: newAttribute("snapshot.ab481lMifn6q"),
        },
        /**
         * Date Attribute: Day of Month (Snapshot)
         * Date Attribute ID: snapshot.day.in.month
         */ DayOfMonth: {
            ref: idRef("snapshot.day.in.month", "attribute"),
            identifier: "snapshot.day.in.month",
            /**
             * Display Form Title: default (Snapshot)
             * Display Form ID: snapshot.aca81lMifn6q
             */ Default: newAttribute("snapshot.aca81lMifn6q"),
        },
        /**
         * Date Attribute: Quarter/Year (Snapshot)
         * Date Attribute ID: snapshot.quarter
         */ QuarterYear: {
            ref: idRef("snapshot.quarter", "attribute"),
            identifier: "snapshot.quarter",
            /**
             * Display Form Title: US Short (Snapshot)
             * Display Form ID: snapshot.aci81lMifn6q
             */ USShort: newAttribute("snapshot.aci81lMifn6q"),
        },
        /**
         * Date Attribute: Month/Year (Snapshot)
         * Date Attribute ID: snapshot.month
         */ MonthYear: {
            ref: idRef("snapshot.month", "attribute"),
            identifier: "snapshot.month",
            /**
             * Display Form Title: Short (Jan 2010) (Snapshot)
             * Display Form ID: snapshot.act81lMifn6q
             */ Short: newAttribute("snapshot.act81lMifn6q"),
            /**
             * Display Form Title: Long (January 2010) (Snapshot)
             * Display Form ID: snapshot.acx81lMifn6q
             */ Long: newAttribute("snapshot.acx81lMifn6q"),
            /**
             * Display Form Title: Number (1/2010) (Snapshot)
             * Display Form ID: snapshot.acv81lMifn6q
             */ Number: newAttribute("snapshot.acv81lMifn6q"),
        },
        /**
         * Date Attribute: Date (Snapshot)
         * Date Attribute ID: snapshot.date
         */ Date: {
            ref: idRef("snapshot.date", "attribute"),
            identifier: "snapshot.date",
            /**
             * Display Form Title: mm/dd/yyyy (Snapshot)
             * Display Form ID: snapshot.date.mmddyyyy
             */ MmDdYyyy: newAttribute("snapshot.date.mmddyyyy"),
            /**
             * Display Form Title: yyyy-mm-dd (Snapshot)
             * Display Form ID: snapshot.date.yyyymmdd
             */ YyyyMmDd: newAttribute("snapshot.date.yyyymmdd"),
            /**
             * Display Form Title: m/d/yy (no leading zeroes) (Snapshot)
             * Display Form ID: snapshot.date.mdyy
             */ MDYy: newAttribute("snapshot.date.mdyy"),
            /**
             * Display Form Title: Long (Mon, Jan 1, 2010) (Snapshot)
             * Display Form ID: snapshot.date.long
             */ Long: newAttribute("snapshot.date.long"),
            /**
             * Display Form Title: dd/mm/yyyy (Snapshot)
             * Display Form ID: snapshot.date.ddmmyyyy
             */ DdMmYyyy: newAttribute("snapshot.date.ddmmyyyy"),
            /**
             * Display Form Title: dd-mm-yyyy (Snapshot)
             * Display Form ID: snapshot.date.eddmmyyyy
             */ DdMmYyyy_1: newAttribute("snapshot.date.eddmmyyyy"),
        },
    },
    /**
     * Date Data Set Title: Date (Activity)
     * Date Data Set ID: activity.dataset.dt
     */ Activity: {
        ref: idRef("activity.dataset.dt", "dataSet"),
        identifier: "activity.dataset.dt",
        /**
         * Date Attribute: Year (Activity)
         * Date Attribute ID: activity.year
         */ Year: {
            ref: idRef("activity.year", "attribute"),
            identifier: "activity.year",
            /**
             * Display Form Title: Year (Activity)
             * Display Form ID: activity.aag81lMifn6q
             */ Default: newAttribute("activity.aag81lMifn6q"),
        },
        /**
         * Date Attribute: Quarter (Activity)
         * Date Attribute ID: activity.quarter.in.year
         */ Quarter: {
            ref: idRef("activity.quarter.in.year", "attribute"),
            identifier: "activity.quarter.in.year",
            /**
             * Display Form Title: default (Activity)
             * Display Form ID: activity.aam81lMifn6q
             */ Default: newAttribute("activity.aam81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Sun-Sat)/Year (Activity)
         * Date Attribute ID: activity.week
         */ WeekSunSatYear: {
            ref: idRef("activity.week", "attribute"),
            identifier: "activity.week",
            /**
             * Display Form Title: Week #/Year (W1/2010) (Activity)
             * Display Form ID: activity.aaA81lMifn6q
             */ WeekNrYear: newAttribute("activity.aaA81lMifn6q"),
            /**
             * Display Form Title: Week Starting (Activity)
             * Display Form ID: activity.aaw81lMifn6q
             */ WeekStarting: newAttribute("activity.aaw81lMifn6q"),
            /**
             * Display Form Title: From - To (Activity)
             * Display Form ID: activity.aau81lMifn6q
             */ FromTo: newAttribute("activity.aau81lMifn6q"),
            /**
             * Display Form Title: Week #/Year (Cont.) (Activity)
             * Display Form ID: activity.aay81lMifn6q
             */ WeekNrYear_1: newAttribute("activity.aay81lMifn6q"),
            /**
             * Display Form Title: Wk/Qtr/Year (Cont.) (Activity)
             * Display Form ID: activity.aaC81lMifn6q
             */ WkQtrYear: newAttribute("activity.aaC81lMifn6q"),
            /**
             * Display Form Title: Wk/Qtr/Year (Activity)
             * Display Form ID: activity.aas81lMifn6q
             */ WkQtrYear_1: newAttribute("activity.aas81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Sun-Sat) (Activity)
         * Date Attribute ID: activity.week.in.year
         */ WeekSunSat: {
            ref: idRef("activity.week.in.year", "attribute"),
            identifier: "activity.week.in.year",
            /**
             * Display Form Title: Number US (Activity)
             * Display Form ID: activity.aaI81lMifn6q
             */ NumberUS: newAttribute("activity.aaI81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Sun-Sat) of Qtr (Activity)
         * Date Attribute ID: activity.week.in.quarter
         */ WeekSunSatOfQtr: {
            ref: idRef("activity.week.in.quarter", "attribute"),
            identifier: "activity.week.in.quarter",
            /**
             * Display Form Title: Number US (Activity)
             * Display Form ID: activity.aaO81lMifn6q
             */ NumberUS: newAttribute("activity.aaO81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Mon-Sun)/Year (Activity)
         * Date Attribute ID: activity.euweek
         */ WeekMonSunYear: {
            ref: idRef("activity.euweek", "attribute"),
            identifier: "activity.euweek",
            /**
             * Display Form Title: Week #/Year (W1/2010) (Activity)
             * Display Form ID: activity.aa281lMifn6q
             */ WeekNrYear: newAttribute("activity.aa281lMifn6q"),
            /**
             * Display Form Title: Week Starting (Activity)
             * Display Form ID: activity.aaY81lMifn6q
             */ WeekStarting: newAttribute("activity.aaY81lMifn6q"),
            /**
             * Display Form Title: From - To (Activity)
             * Display Form ID: activity.aaW81lMifn6q
             */ FromTo: newAttribute("activity.aaW81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Mon-Sun) (Activity)
         * Date Attribute ID: activity.euweek.in.year
         */ WeekMonSun: {
            ref: idRef("activity.euweek.in.year", "attribute"),
            identifier: "activity.euweek.in.year",
            /**
             * Display Form Title: Number EU (Activity)
             * Display Form ID: activity.aba81lMifn6q
             */ NumberEU: newAttribute("activity.aba81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Mon-Sun) of Qtr (Activity)
         * Date Attribute ID: activity.euweek.in.quarter
         */ WeekMonSunOfQtr: {
            ref: idRef("activity.euweek.in.quarter", "attribute"),
            identifier: "activity.euweek.in.quarter",
            /**
             * Display Form Title: Number EU (Activity)
             * Display Form ID: activity.abg81lMifn6q
             */ NumberEU: newAttribute("activity.abg81lMifn6q"),
        },
        /**
         * Date Attribute: Month (Activity)
         * Date Attribute ID: activity.month.in.year
         */ Month: {
            ref: idRef("activity.month.in.year", "attribute"),
            identifier: "activity.month.in.year",
            /**
             * Display Form Title: Short (Jan) (Activity)
             * Display Form ID: activity.abm81lMifn6q
             */ Short: newAttribute("activity.abm81lMifn6q"),
            /**
             * Display Form Title: Long (January) (Activity)
             * Display Form ID: activity.abs81lMifn6q
             */ Long: newAttribute("activity.abs81lMifn6q"),
            /**
             * Display Form Title: Number (M1) (Activity)
             * Display Form ID: activity.abq81lMifn6q
             */ Number: newAttribute("activity.abq81lMifn6q"),
            /**
             * Display Form Title: M/Q (M1/Q1) (Activity)
             * Display Form ID: activity.abo81lMifn6q
             */ MQ: newAttribute("activity.abo81lMifn6q"),
        },
        /**
         * Date Attribute: Month of Quarter (Activity)
         * Date Attribute ID: activity.month.in.quarter
         */ MonthOfQuarter: {
            ref: idRef("activity.month.in.quarter", "attribute"),
            identifier: "activity.month.in.quarter",
            /**
             * Display Form Title: Number (Activity)
             * Display Form ID: activity.aby81lMifn6q
             */ Number: newAttribute("activity.aby81lMifn6q"),
        },
        /**
         * Date Attribute: Day of Year (Activity)
         * Date Attribute ID: activity.day.in.year
         */ DayOfYear: {
            ref: idRef("activity.day.in.year", "attribute"),
            identifier: "activity.day.in.year",
            /**
             * Display Form Title: default (Activity)
             * Display Form ID: activity.abE81lMifn6q
             */ Default: newAttribute("activity.abE81lMifn6q"),
        },
        /**
         * Date Attribute: Day of Week (Sun-Sat) (Activity)
         * Date Attribute ID: activity.day.in.week
         */ DayOfWeekSunSat: {
            ref: idRef("activity.day.in.week", "attribute"),
            identifier: "activity.day.in.week",
            /**
             * Display Form Title: Short (Sun) (Activity)
             * Display Form ID: activity.abK81lMifn6q
             */ Short: newAttribute("activity.abK81lMifn6q"),
            /**
             * Display Form Title: Long (Sunday) (Activity)
             * Display Form ID: activity.abO81lMifn6q
             */ Long: newAttribute("activity.abO81lMifn6q"),
            /**
             * Display Form Title: Number (1=Sunday) (Activity)
             * Display Form ID: activity.abM81lMifn6q
             */ Number: newAttribute("activity.abM81lMifn6q"),
        },
        /**
         * Date Attribute: Day of Week (Mon-Sun) (Activity)
         * Date Attribute ID: activity.day.in.euweek
         */ DayOfWeekMonSun: {
            ref: idRef("activity.day.in.euweek", "attribute"),
            identifier: "activity.day.in.euweek",
            /**
             * Display Form Title: Short (Mon) (Activity)
             * Display Form ID: activity.abU81lMifn6q
             */ Short: newAttribute("activity.abU81lMifn6q"),
            /**
             * Display Form Title: Long (Monday) (Activity)
             * Display Form ID: activity.abY81lMifn6q
             */ Long: newAttribute("activity.abY81lMifn6q"),
            /**
             * Display Form Title: Number (1=Monday) (Activity)
             * Display Form ID: activity.abW81lMifn6q
             */ Number: newAttribute("activity.abW81lMifn6q"),
        },
        /**
         * Date Attribute: Day of Quarter (Activity)
         * Date Attribute ID: activity.day.in.quarter
         */ DayOfQuarter: {
            ref: idRef("activity.day.in.quarter", "attribute"),
            identifier: "activity.day.in.quarter",
            /**
             * Display Form Title: default (Activity)
             * Display Form ID: activity.ab481lMifn6q
             */ Default: newAttribute("activity.ab481lMifn6q"),
        },
        /**
         * Date Attribute: Day of Month (Activity)
         * Date Attribute ID: activity.day.in.month
         */ DayOfMonth: {
            ref: idRef("activity.day.in.month", "attribute"),
            identifier: "activity.day.in.month",
            /**
             * Display Form Title: default (Activity)
             * Display Form ID: activity.aca81lMifn6q
             */ Default: newAttribute("activity.aca81lMifn6q"),
        },
        /**
         * Date Attribute: Quarter/Year (Activity)
         * Date Attribute ID: activity.quarter
         */ QuarterYear: {
            ref: idRef("activity.quarter", "attribute"),
            identifier: "activity.quarter",
            /**
             * Display Form Title: US Short (Activity)
             * Display Form ID: activity.aci81lMifn6q
             */ USShort: newAttribute("activity.aci81lMifn6q"),
        },
        /**
         * Date Attribute: Month/Year (Activity)
         * Date Attribute ID: activity.month
         */ MonthYear: {
            ref: idRef("activity.month", "attribute"),
            identifier: "activity.month",
            /**
             * Display Form Title: Short (Jan 2010) (Activity)
             * Display Form ID: activity.act81lMifn6q
             */ Short: newAttribute("activity.act81lMifn6q"),
            /**
             * Display Form Title: Long (January 2010) (Activity)
             * Display Form ID: activity.acx81lMifn6q
             */ Long: newAttribute("activity.acx81lMifn6q"),
            /**
             * Display Form Title: Number (1/2010) (Activity)
             * Display Form ID: activity.acv81lMifn6q
             */ Number: newAttribute("activity.acv81lMifn6q"),
        },
        /**
         * Date Attribute: Date (Activity)
         * Date Attribute ID: activity.date
         */ Date: {
            ref: idRef("activity.date", "attribute"),
            identifier: "activity.date",
            /**
             * Display Form Title: mm/dd/yyyy (Activity)
             * Display Form ID: activity.date.mmddyyyy
             */ MmDdYyyy: newAttribute("activity.date.mmddyyyy"),
            /**
             * Display Form Title: yyyy-mm-dd (Activity)
             * Display Form ID: activity.date.yyyymmdd
             */ YyyyMmDd: newAttribute("activity.date.yyyymmdd"),
            /**
             * Display Form Title: m/d/yy (no leading zeroes) (Activity)
             * Display Form ID: activity.date.mdyy
             */ MDYy: newAttribute("activity.date.mdyy"),
            /**
             * Display Form Title: Long (Mon, Jan 1, 2010) (Activity)
             * Display Form ID: activity.date.long
             */ Long: newAttribute("activity.date.long"),
            /**
             * Display Form Title: dd/mm/yyyy (Activity)
             * Display Form ID: activity.date.ddmmyyyy
             */ DdMmYyyy: newAttribute("activity.date.ddmmyyyy"),
            /**
             * Display Form Title: dd-mm-yyyy (Activity)
             * Display Form ID: activity.date.eddmmyyyy
             */ DdMmYyyy_1: newAttribute("activity.date.eddmmyyyy"),
        },
    },
    /**
     * Date Data Set Title: Date (Timeline)
     * Date Data Set ID: timeline.dataset.dt
     */ Timeline: {
        ref: idRef("timeline.dataset.dt", "dataSet"),
        identifier: "timeline.dataset.dt",
        /**
         * Date Attribute: Year (Timeline)
         * Date Attribute ID: timeline.year
         */ Year: {
            ref: idRef("timeline.year", "attribute"),
            identifier: "timeline.year",
            /**
             * Display Form Title: Year (Timeline)
             * Display Form ID: timeline.aag81lMifn6q
             */ Default: newAttribute("timeline.aag81lMifn6q"),
        },
        /**
         * Date Attribute: Quarter (Timeline)
         * Date Attribute ID: timeline.quarter.in.year
         */ Quarter: {
            ref: idRef("timeline.quarter.in.year", "attribute"),
            identifier: "timeline.quarter.in.year",
            /**
             * Display Form Title: default (Timeline)
             * Display Form ID: timeline.aam81lMifn6q
             */ Default: newAttribute("timeline.aam81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Sun-Sat)/Year (Timeline)
         * Date Attribute ID: timeline.week
         */ WeekSunSatYear: {
            ref: idRef("timeline.week", "attribute"),
            identifier: "timeline.week",
            /**
             * Display Form Title: Week #/Year (W1/2010) (Timeline)
             * Display Form ID: timeline.aaA81lMifn6q
             */ WeekNrYear: newAttribute("timeline.aaA81lMifn6q"),
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
        },
        /**
         * Date Attribute: Week (Sun-Sat) (Timeline)
         * Date Attribute ID: timeline.week.in.year
         */ WeekSunSat: {
            ref: idRef("timeline.week.in.year", "attribute"),
            identifier: "timeline.week.in.year",
            /**
             * Display Form Title: Number US (Timeline)
             * Display Form ID: timeline.aaI81lMifn6q
             */ NumberUS: newAttribute("timeline.aaI81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Sun-Sat) of Qtr (Timeline)
         * Date Attribute ID: timeline.week.in.quarter
         */ WeekSunSatOfQtr: {
            ref: idRef("timeline.week.in.quarter", "attribute"),
            identifier: "timeline.week.in.quarter",
            /**
             * Display Form Title: Number US (Timeline)
             * Display Form ID: timeline.aaO81lMifn6q
             */ NumberUS: newAttribute("timeline.aaO81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Mon-Sun)/Year (Timeline)
         * Date Attribute ID: timeline.euweek
         */ WeekMonSunYear: {
            ref: idRef("timeline.euweek", "attribute"),
            identifier: "timeline.euweek",
            /**
             * Display Form Title: Week #/Year (W1/2010) (Timeline)
             * Display Form ID: timeline.aa281lMifn6q
             */ WeekNrYear: newAttribute("timeline.aa281lMifn6q"),
            /**
             * Display Form Title: Week Starting (Timeline)
             * Display Form ID: timeline.aaY81lMifn6q
             */ WeekStarting: newAttribute("timeline.aaY81lMifn6q"),
            /**
             * Display Form Title: From - To (Timeline)
             * Display Form ID: timeline.aaW81lMifn6q
             */ FromTo: newAttribute("timeline.aaW81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Mon-Sun) (Timeline)
         * Date Attribute ID: timeline.euweek.in.year
         */ WeekMonSun: {
            ref: idRef("timeline.euweek.in.year", "attribute"),
            identifier: "timeline.euweek.in.year",
            /**
             * Display Form Title: Number EU (Timeline)
             * Display Form ID: timeline.aba81lMifn6q
             */ NumberEU: newAttribute("timeline.aba81lMifn6q"),
        },
        /**
         * Date Attribute: Week (Mon-Sun) of Qtr (Timeline)
         * Date Attribute ID: timeline.euweek.in.quarter
         */ WeekMonSunOfQtr: {
            ref: idRef("timeline.euweek.in.quarter", "attribute"),
            identifier: "timeline.euweek.in.quarter",
            /**
             * Display Form Title: Number EU (Timeline)
             * Display Form ID: timeline.abg81lMifn6q
             */ NumberEU: newAttribute("timeline.abg81lMifn6q"),
        },
        /**
         * Date Attribute: Month (Timeline)
         * Date Attribute ID: timeline.month.in.year
         */ Month: {
            ref: idRef("timeline.month.in.year", "attribute"),
            identifier: "timeline.month.in.year",
            /**
             * Display Form Title: Short (Jan) (Timeline)
             * Display Form ID: timeline.abm81lMifn6q
             */ Short: newAttribute("timeline.abm81lMifn6q"),
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
        },
        /**
         * Date Attribute: Month of Quarter (Timeline)
         * Date Attribute ID: timeline.month.in.quarter
         */ MonthOfQuarter: {
            ref: idRef("timeline.month.in.quarter", "attribute"),
            identifier: "timeline.month.in.quarter",
            /**
             * Display Form Title: Number (Timeline)
             * Display Form ID: timeline.aby81lMifn6q
             */ Number: newAttribute("timeline.aby81lMifn6q"),
        },
        /**
         * Date Attribute: Day of Year (Timeline)
         * Date Attribute ID: timeline.day.in.year
         */ DayOfYear: {
            ref: idRef("timeline.day.in.year", "attribute"),
            identifier: "timeline.day.in.year",
            /**
             * Display Form Title: default (Timeline)
             * Display Form ID: timeline.abE81lMifn6q
             */ Default: newAttribute("timeline.abE81lMifn6q"),
        },
        /**
         * Date Attribute: Day of Week (Sun-Sat) (Timeline)
         * Date Attribute ID: timeline.day.in.week
         */ DayOfWeekSunSat: {
            ref: idRef("timeline.day.in.week", "attribute"),
            identifier: "timeline.day.in.week",
            /**
             * Display Form Title: Short (Sun) (Timeline)
             * Display Form ID: timeline.abK81lMifn6q
             */ Short: newAttribute("timeline.abK81lMifn6q"),
            /**
             * Display Form Title: Long (Sunday) (Timeline)
             * Display Form ID: timeline.abO81lMifn6q
             */ Long: newAttribute("timeline.abO81lMifn6q"),
            /**
             * Display Form Title: Number (1=Sunday) (Timeline)
             * Display Form ID: timeline.abM81lMifn6q
             */ Number: newAttribute("timeline.abM81lMifn6q"),
        },
        /**
         * Date Attribute: Day of Week (Mon-Sun) (Timeline)
         * Date Attribute ID: timeline.day.in.euweek
         */ DayOfWeekMonSun: {
            ref: idRef("timeline.day.in.euweek", "attribute"),
            identifier: "timeline.day.in.euweek",
            /**
             * Display Form Title: Short (Mon) (Timeline)
             * Display Form ID: timeline.abU81lMifn6q
             */ Short: newAttribute("timeline.abU81lMifn6q"),
            /**
             * Display Form Title: Long (Monday) (Timeline)
             * Display Form ID: timeline.abY81lMifn6q
             */ Long: newAttribute("timeline.abY81lMifn6q"),
            /**
             * Display Form Title: Number (1=Monday) (Timeline)
             * Display Form ID: timeline.abW81lMifn6q
             */ Number: newAttribute("timeline.abW81lMifn6q"),
        },
        /**
         * Date Attribute: Day of Quarter (Timeline)
         * Date Attribute ID: timeline.day.in.quarter
         */ DayOfQuarter: {
            ref: idRef("timeline.day.in.quarter", "attribute"),
            identifier: "timeline.day.in.quarter",
            /**
             * Display Form Title: default (Timeline)
             * Display Form ID: timeline.ab481lMifn6q
             */ Default: newAttribute("timeline.ab481lMifn6q"),
        },
        /**
         * Date Attribute: Day of Month (Timeline)
         * Date Attribute ID: timeline.day.in.month
         */ DayOfMonth: {
            ref: idRef("timeline.day.in.month", "attribute"),
            identifier: "timeline.day.in.month",
            /**
             * Display Form Title: default (Timeline)
             * Display Form ID: timeline.aca81lMifn6q
             */ Default: newAttribute("timeline.aca81lMifn6q"),
        },
        /**
         * Date Attribute: Quarter/Year (Timeline)
         * Date Attribute ID: timeline.quarter
         */ QuarterYear: {
            ref: idRef("timeline.quarter", "attribute"),
            identifier: "timeline.quarter",
            /**
             * Display Form Title: US Short (Timeline)
             * Display Form ID: timeline.aci81lMifn6q
             */ USShort: newAttribute("timeline.aci81lMifn6q"),
        },
        /**
         * Date Attribute: Month/Year (Timeline)
         * Date Attribute ID: timeline.month
         */ MonthYear: {
            ref: idRef("timeline.month", "attribute"),
            identifier: "timeline.month",
            /**
             * Display Form Title: Short (Jan 2010) (Timeline)
             * Display Form ID: timeline.act81lMifn6q
             */ Short: newAttribute("timeline.act81lMifn6q"),
            /**
             * Display Form Title: Long (January 2010) (Timeline)
             * Display Form ID: timeline.acx81lMifn6q
             */ Long: newAttribute("timeline.acx81lMifn6q"),
            /**
             * Display Form Title: Number (1/2010) (Timeline)
             * Display Form ID: timeline.acv81lMifn6q
             */ Number: newAttribute("timeline.acv81lMifn6q"),
        },
        /**
         * Date Attribute: Date (Timeline)
         * Date Attribute ID: timeline.date
         */ Date: {
            ref: idRef("timeline.date", "attribute"),
            identifier: "timeline.date",
            /**
             * Display Form Title: mm/dd/yyyy (Timeline)
             * Display Form ID: timeline.date.mmddyyyy
             */ MmDdYyyy: newAttribute("timeline.date.mmddyyyy"),
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
        },
    },
};
export const Insights = {
    /**
     * Insight Title: Pivot table with native totals
     * Insight ID: aac5Bt1DibxY
     */
    PivotTableWithNativeTotals: "aac5Bt1DibxY",
};
export const Dashboards = {};
