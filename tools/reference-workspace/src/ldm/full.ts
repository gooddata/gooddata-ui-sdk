// (C) 2019-2020 GoodData Corporation
/* eslint-disable header/header */
/* THIS FILE WAS AUTO-GENERATED USING CATALOG EXPORTER; YOU SHOULD NOT EDIT THIS FILE; GENERATE TIME: 2019-12-10T13:37:20.314Z; */
import { newAttribute, newMeasure, IAttribute, IMeasure, IMeasureDefinition } from "@gooddata/sdk-model";

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
 * Display Form ID: attr.activity.activitytype
 */
export const ActivityType: IAttribute = newAttribute("label.activity.activitytype");
/**
 * Attribute Title: Department
 * Display Form ID: attr.owner.department
 */
export const Department: IAttribute = newAttribute("label.owner.department");
/**
 * Attribute Title: Forecast Category
 * Display Form ID: attr.opportunitysnapshot.forecastcategory
 */
export const ForecastCategory: IAttribute = newAttribute("label.opportunitysnapshot.forecastcategory");
/**
 * Attribute Title: Is Active?
 * Display Form ID: attr.stage.isactive
 */
export const IsActive: IAttribute = newAttribute("label.stage.isactive");
/**
 * Attribute Title: Is Closed?
 * Display Form ID: attr.activity.isclosed
 */
export const IsClosed: IAttribute = newAttribute("label.activity.isclosed");
/**
 * Attribute Title: Is Closed?
 * Display Form ID: attr.stage.isclosed
 */
export const IsClosed_1: IAttribute = newAttribute("label.stage.isclosed");
/**
 * Attribute Title: Is Task?
 * Display Form ID: attr.activity.istask
 */
export const IsTask: IAttribute = newAttribute("label.activity.istask");
/**
 * Attribute Title: Is Won?
 * Display Form ID: attr.stage.iswon
 */
export const IsWon: IAttribute = newAttribute("label.stage.iswon");
/**
 * Attribute Title: Opp. Snapshot
 * Display Form ID: attr.opportunitysnapshot.id
 */
export const OppSnapshot: IAttribute = newAttribute("label.opportunitysnapshot.id");
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
 * Display Form ID: attr.activity.priority
 */
export const Priority: IAttribute = newAttribute("label.activity.priority");
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
 * Display Form ID: attr.owner.region
 */
export const Region: IAttribute = newAttribute("label.owner.region");
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
 * Display Form ID: attr.stagehistory.id
 */
export const StageHistory: IAttribute = newAttribute("label.stagehistory.id");
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
 * Display Form ID: attr.activity.status
 */
export const Status: IAttribute = newAttribute("label.activity.status");
/**
 * Attribute Title: Status
 * Display Form ID: attr.stage.status
 */
export const Status_1: IAttribute = newAttribute("label.stage.status");
/**
 * Metric Title: _Snapshot [EOP]
 * Metric ID: abxgDICQav2J
 * Metric Type: MAQL Metric
 */
export const SnapshotEOP: IMeasure<IMeasureDefinition> = newMeasure("abxgDICQav2J");
/**
 * Metric Title: _Timeline [EOP]
 * Metric ID: abYgDBRagANw
 * Metric Type: MAQL Metric
 */
export const TimelineEOP: IMeasure<IMeasureDefinition> = newMeasure("abYgDBRagANw");
/**
 * Metric Title: # Of Opportunities
 * Metric ID: abQgDWx4gOUu
 * Metric Type: MAQL Metric
 */
export const NrOfOpportunities: IMeasure<IMeasureDefinition> = newMeasure("abQgDWx4gOUu");
/**
 * Metric Title: # Of Opportunities Won
 * Metric ID: aa4gLlQhcmLO
 * Metric Type: MAQL Metric
 */
export const NrOfOpportunitiesWon: IMeasure<IMeasureDefinition> = newMeasure("aa4gLlQhcmLO");
/**
 * Metric Title: Amount
 * Metric ID: aangOxLSeztu
 * Metric Type: MAQL Metric
 */
export const Amount: IMeasure<IMeasureDefinition> = newMeasure("aangOxLSeztu");
/**
 * Metric Title: Probability
 * Metric ID: abEgMnq5hyJQ
 * Metric Type: MAQL Metric
 */
export const Probability: IMeasure<IMeasureDefinition> = newMeasure("abEgMnq5hyJQ");
/**
 * Metric Title: Sample XIRR
 * Metric ID: aadpHDMBecIy
 * Metric Type: MAQL Metric
 */
export const SampleXIRR: IMeasure<IMeasureDefinition> = newMeasure("aadpHDMBecIy");
/**
 * Metric Title: Win Rate
 * Metric ID: abZgFKGPaGYM
 * Metric Type: MAQL Metric
 */
export const WinRate: IMeasure<IMeasureDefinition> = newMeasure("abZgFKGPaGYM");
/**
 * Metric Title: Won
 * Metric ID: acugFHNJgsBy
 * Metric Type: MAQL Metric
 */
export const Won: IMeasure<IMeasureDefinition> = newMeasure("acugFHNJgsBy");
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
    Sum: newMeasure("dt.activity.activity", (m) => m.aggregation("sum")),
    /**
     * Fact Title: Activity (Date)
     * Fact ID: dt.activity.activity
     * Fact Aggregation: count
     */ Count: newMeasure("dt.activity.activity", (m) => m.aggregation("count")),
    /**
     * Fact Title: Activity (Date)
     * Fact ID: dt.activity.activity
     * Fact Aggregation: avg
     */ Avg: newMeasure("dt.activity.activity", (m) => m.aggregation("avg")),
    /**
     * Fact Title: Activity (Date)
     * Fact ID: dt.activity.activity
     * Fact Aggregation: min
     */ Min: newMeasure("dt.activity.activity", (m) => m.aggregation("min")),
    /**
     * Fact Title: Activity (Date)
     * Fact ID: dt.activity.activity
     * Fact Aggregation: max
     */ Max: newMeasure("dt.activity.activity", (m) => m.aggregation("max")),
    /**
     * Fact Title: Activity (Date)
     * Fact ID: dt.activity.activity
     * Fact Aggregation: median
     */ Median: newMeasure("dt.activity.activity", (m) => m.aggregation("median")),
    /**
     * Fact Title: Activity (Date)
     * Fact ID: dt.activity.activity
     * Fact Aggregation: runsum
     */ Runsum: newMeasure("dt.activity.activity", (m) => m.aggregation("runsum")),
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
    Sum: newMeasure("fact.opportunitysnapshot.amount", (m) => m.aggregation("sum")),
    /**
     * Fact Title: Amount
     * Fact ID: fact.opportunitysnapshot.amount
     * Fact Aggregation: count
     */ Count: newMeasure("fact.opportunitysnapshot.amount", (m) => m.aggregation("count")),
    /**
     * Fact Title: Amount
     * Fact ID: fact.opportunitysnapshot.amount
     * Fact Aggregation: avg
     */ Avg: newMeasure("fact.opportunitysnapshot.amount", (m) => m.aggregation("avg")),
    /**
     * Fact Title: Amount
     * Fact ID: fact.opportunitysnapshot.amount
     * Fact Aggregation: min
     */ Min: newMeasure("fact.opportunitysnapshot.amount", (m) => m.aggregation("min")),
    /**
     * Fact Title: Amount
     * Fact ID: fact.opportunitysnapshot.amount
     * Fact Aggregation: max
     */ Max: newMeasure("fact.opportunitysnapshot.amount", (m) => m.aggregation("max")),
    /**
     * Fact Title: Amount
     * Fact ID: fact.opportunitysnapshot.amount
     * Fact Aggregation: median
     */ Median: newMeasure("fact.opportunitysnapshot.amount", (m) => m.aggregation("median")),
    /**
     * Fact Title: Amount
     * Fact ID: fact.opportunitysnapshot.amount
     * Fact Aggregation: runsum
     */ Runsum: newMeasure("fact.opportunitysnapshot.amount", (m) => m.aggregation("runsum")),
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
    Sum: newMeasure("fact.opportunitysnapshot.daystoclose", (m) => m.aggregation("sum")),
    /**
     * Fact Title: Days to Close
     * Fact ID: fact.opportunitysnapshot.daystoclose
     * Fact Aggregation: count
     */ Count: newMeasure("fact.opportunitysnapshot.daystoclose", (m) => m.aggregation("count")),
    /**
     * Fact Title: Days to Close
     * Fact ID: fact.opportunitysnapshot.daystoclose
     * Fact Aggregation: avg
     */ Avg: newMeasure("fact.opportunitysnapshot.daystoclose", (m) => m.aggregation("avg")),
    /**
     * Fact Title: Days to Close
     * Fact ID: fact.opportunitysnapshot.daystoclose
     * Fact Aggregation: min
     */ Min: newMeasure("fact.opportunitysnapshot.daystoclose", (m) => m.aggregation("min")),
    /**
     * Fact Title: Days to Close
     * Fact ID: fact.opportunitysnapshot.daystoclose
     * Fact Aggregation: max
     */ Max: newMeasure("fact.opportunitysnapshot.daystoclose", (m) => m.aggregation("max")),
    /**
     * Fact Title: Days to Close
     * Fact ID: fact.opportunitysnapshot.daystoclose
     * Fact Aggregation: median
     */ Median: newMeasure("fact.opportunitysnapshot.daystoclose", (m) => m.aggregation("median")),
    /**
     * Fact Title: Days to Close
     * Fact ID: fact.opportunitysnapshot.daystoclose
     * Fact Aggregation: runsum
     */ Runsum: newMeasure("fact.opportunitysnapshot.daystoclose", (m) => m.aggregation("runsum")),
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
    Sum: newMeasure("fact.stagehistory.duration", (m) => m.aggregation("sum")),
    /**
     * Fact Title: Duration
     * Fact ID: fact.stagehistory.duration
     * Fact Aggregation: count
     */ Count: newMeasure("fact.stagehistory.duration", (m) => m.aggregation("count")),
    /**
     * Fact Title: Duration
     * Fact ID: fact.stagehistory.duration
     * Fact Aggregation: avg
     */ Avg: newMeasure("fact.stagehistory.duration", (m) => m.aggregation("avg")),
    /**
     * Fact Title: Duration
     * Fact ID: fact.stagehistory.duration
     * Fact Aggregation: min
     */ Min: newMeasure("fact.stagehistory.duration", (m) => m.aggregation("min")),
    /**
     * Fact Title: Duration
     * Fact ID: fact.stagehistory.duration
     * Fact Aggregation: max
     */ Max: newMeasure("fact.stagehistory.duration", (m) => m.aggregation("max")),
    /**
     * Fact Title: Duration
     * Fact ID: fact.stagehistory.duration
     * Fact Aggregation: median
     */ Median: newMeasure("fact.stagehistory.duration", (m) => m.aggregation("median")),
    /**
     * Fact Title: Duration
     * Fact ID: fact.stagehistory.duration
     * Fact Aggregation: runsum
     */ Runsum: newMeasure("fact.stagehistory.duration", (m) => m.aggregation("runsum")),
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
    Sum: newMeasure("dt.opportunitysnapshot.closedate", (m) => m.aggregation("sum")),
    /**
     * Fact Title: Opp. Close (Date)
     * Fact ID: dt.opportunitysnapshot.closedate
     * Fact Aggregation: count
     */ Count: newMeasure("dt.opportunitysnapshot.closedate", (m) => m.aggregation("count")),
    /**
     * Fact Title: Opp. Close (Date)
     * Fact ID: dt.opportunitysnapshot.closedate
     * Fact Aggregation: avg
     */ Avg: newMeasure("dt.opportunitysnapshot.closedate", (m) => m.aggregation("avg")),
    /**
     * Fact Title: Opp. Close (Date)
     * Fact ID: dt.opportunitysnapshot.closedate
     * Fact Aggregation: min
     */ Min: newMeasure("dt.opportunitysnapshot.closedate", (m) => m.aggregation("min")),
    /**
     * Fact Title: Opp. Close (Date)
     * Fact ID: dt.opportunitysnapshot.closedate
     * Fact Aggregation: max
     */ Max: newMeasure("dt.opportunitysnapshot.closedate", (m) => m.aggregation("max")),
    /**
     * Fact Title: Opp. Close (Date)
     * Fact ID: dt.opportunitysnapshot.closedate
     * Fact Aggregation: median
     */ Median: newMeasure("dt.opportunitysnapshot.closedate", (m) => m.aggregation("median")),
    /**
     * Fact Title: Opp. Close (Date)
     * Fact ID: dt.opportunitysnapshot.closedate
     * Fact Aggregation: runsum
     */ Runsum: newMeasure("dt.opportunitysnapshot.closedate", (m) => m.aggregation("runsum")),
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
    Sum: newMeasure("dt.opportunity.oppcreated", (m) => m.aggregation("sum")),
    /**
     * Fact Title: Opp. Created (Date)
     * Fact ID: dt.opportunity.oppcreated
     * Fact Aggregation: count
     */ Count: newMeasure("dt.opportunity.oppcreated", (m) => m.aggregation("count")),
    /**
     * Fact Title: Opp. Created (Date)
     * Fact ID: dt.opportunity.oppcreated
     * Fact Aggregation: avg
     */ Avg: newMeasure("dt.opportunity.oppcreated", (m) => m.aggregation("avg")),
    /**
     * Fact Title: Opp. Created (Date)
     * Fact ID: dt.opportunity.oppcreated
     * Fact Aggregation: min
     */ Min: newMeasure("dt.opportunity.oppcreated", (m) => m.aggregation("min")),
    /**
     * Fact Title: Opp. Created (Date)
     * Fact ID: dt.opportunity.oppcreated
     * Fact Aggregation: max
     */ Max: newMeasure("dt.opportunity.oppcreated", (m) => m.aggregation("max")),
    /**
     * Fact Title: Opp. Created (Date)
     * Fact ID: dt.opportunity.oppcreated
     * Fact Aggregation: median
     */ Median: newMeasure("dt.opportunity.oppcreated", (m) => m.aggregation("median")),
    /**
     * Fact Title: Opp. Created (Date)
     * Fact ID: dt.opportunity.oppcreated
     * Fact Aggregation: runsum
     */ Runsum: newMeasure("dt.opportunity.oppcreated", (m) => m.aggregation("runsum")),
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
    Sum: newMeasure("dt.opportunitysnapshot.snapshotdate", (m) => m.aggregation("sum")),
    /**
     * Fact Title: Opp. Snapshot (Date)
     * Fact ID: dt.opportunitysnapshot.snapshotdate
     * Fact Aggregation: count
     */ Count: newMeasure("dt.opportunitysnapshot.snapshotdate", (m) => m.aggregation("count")),
    /**
     * Fact Title: Opp. Snapshot (Date)
     * Fact ID: dt.opportunitysnapshot.snapshotdate
     * Fact Aggregation: avg
     */ Avg: newMeasure("dt.opportunitysnapshot.snapshotdate", (m) => m.aggregation("avg")),
    /**
     * Fact Title: Opp. Snapshot (Date)
     * Fact ID: dt.opportunitysnapshot.snapshotdate
     * Fact Aggregation: min
     */ Min: newMeasure("dt.opportunitysnapshot.snapshotdate", (m) => m.aggregation("min")),
    /**
     * Fact Title: Opp. Snapshot (Date)
     * Fact ID: dt.opportunitysnapshot.snapshotdate
     * Fact Aggregation: max
     */ Max: newMeasure("dt.opportunitysnapshot.snapshotdate", (m) => m.aggregation("max")),
    /**
     * Fact Title: Opp. Snapshot (Date)
     * Fact ID: dt.opportunitysnapshot.snapshotdate
     * Fact Aggregation: median
     */ Median: newMeasure("dt.opportunitysnapshot.snapshotdate", (m) => m.aggregation("median")),
    /**
     * Fact Title: Opp. Snapshot (Date)
     * Fact ID: dt.opportunitysnapshot.snapshotdate
     * Fact Aggregation: runsum
     */ Runsum: newMeasure("dt.opportunitysnapshot.snapshotdate", (m) => m.aggregation("runsum")),
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
    Sum: newMeasure("fact.opportunitysnapshot.probability", (m) => m.aggregation("sum")),
    /**
     * Fact Title: Probability
     * Fact ID: fact.opportunitysnapshot.probability
     * Fact Aggregation: count
     */ Count: newMeasure("fact.opportunitysnapshot.probability", (m) => m.aggregation("count")),
    /**
     * Fact Title: Probability
     * Fact ID: fact.opportunitysnapshot.probability
     * Fact Aggregation: avg
     */ Avg: newMeasure("fact.opportunitysnapshot.probability", (m) => m.aggregation("avg")),
    /**
     * Fact Title: Probability
     * Fact ID: fact.opportunitysnapshot.probability
     * Fact Aggregation: min
     */ Min: newMeasure("fact.opportunitysnapshot.probability", (m) => m.aggregation("min")),
    /**
     * Fact Title: Probability
     * Fact ID: fact.opportunitysnapshot.probability
     * Fact Aggregation: max
     */ Max: newMeasure("fact.opportunitysnapshot.probability", (m) => m.aggregation("max")),
    /**
     * Fact Title: Probability
     * Fact ID: fact.opportunitysnapshot.probability
     * Fact Aggregation: median
     */ Median: newMeasure("fact.opportunitysnapshot.probability", (m) => m.aggregation("median")),
    /**
     * Fact Title: Probability
     * Fact ID: fact.opportunitysnapshot.probability
     * Fact Aggregation: runsum
     */ Runsum: newMeasure("fact.opportunitysnapshot.probability", (m) => m.aggregation("runsum")),
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
    Sum: newMeasure("dt.timeline.timeline", (m) => m.aggregation("sum")),
    /**
     * Fact Title: Timeline (Date)
     * Fact ID: dt.timeline.timeline
     * Fact Aggregation: count
     */ Count: newMeasure("dt.timeline.timeline", (m) => m.aggregation("count")),
    /**
     * Fact Title: Timeline (Date)
     * Fact ID: dt.timeline.timeline
     * Fact Aggregation: avg
     */ Avg: newMeasure("dt.timeline.timeline", (m) => m.aggregation("avg")),
    /**
     * Fact Title: Timeline (Date)
     * Fact ID: dt.timeline.timeline
     * Fact Aggregation: min
     */ Min: newMeasure("dt.timeline.timeline", (m) => m.aggregation("min")),
    /**
     * Fact Title: Timeline (Date)
     * Fact ID: dt.timeline.timeline
     * Fact Aggregation: max
     */ Max: newMeasure("dt.timeline.timeline", (m) => m.aggregation("max")),
    /**
     * Fact Title: Timeline (Date)
     * Fact ID: dt.timeline.timeline
     * Fact Aggregation: median
     */ Median: newMeasure("dt.timeline.timeline", (m) => m.aggregation("median")),
    /**
     * Fact Title: Timeline (Date)
     * Fact ID: dt.timeline.timeline
     * Fact Aggregation: runsum
     */ Runsum: newMeasure("dt.timeline.timeline", (m) => m.aggregation("runsum")),
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
    Sum: newMeasure("fact.stagehistory.velocity", (m) => m.aggregation("sum")),
    /**
     * Fact Title: Velocity
     * Fact ID: fact.stagehistory.velocity
     * Fact Aggregation: count
     */ Count: newMeasure("fact.stagehistory.velocity", (m) => m.aggregation("count")),
    /**
     * Fact Title: Velocity
     * Fact ID: fact.stagehistory.velocity
     * Fact Aggregation: avg
     */ Avg: newMeasure("fact.stagehistory.velocity", (m) => m.aggregation("avg")),
    /**
     * Fact Title: Velocity
     * Fact ID: fact.stagehistory.velocity
     * Fact Aggregation: min
     */ Min: newMeasure("fact.stagehistory.velocity", (m) => m.aggregation("min")),
    /**
     * Fact Title: Velocity
     * Fact ID: fact.stagehistory.velocity
     * Fact Aggregation: max
     */ Max: newMeasure("fact.stagehistory.velocity", (m) => m.aggregation("max")),
    /**
     * Fact Title: Velocity
     * Fact ID: fact.stagehistory.velocity
     * Fact Aggregation: median
     */ Median: newMeasure("fact.stagehistory.velocity", (m) => m.aggregation("median")),
    /**
     * Fact Title: Velocity
     * Fact ID: fact.stagehistory.velocity
     * Fact Aggregation: runsum
     */ Runsum: newMeasure("fact.stagehistory.velocity", (m) => m.aggregation("runsum")),
};
/**
 * Attribute Title: Year (Created)
 * Display Form ID: created.year
 */
export const CreatedYear: IAttribute = newAttribute("created.aag81lMifn6q");
/**
 * Attribute Title: Quarter (Created)
 * Display Form ID: created.quarter.in.year
 */
export const CreatedQuarter: IAttribute = newAttribute("created.aam81lMifn6q");
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
 * Display Form ID: created.week.in.year
 */
export const CreatedWeekSunSat: IAttribute = newAttribute("created.aaI81lMifn6q");
/**
 * Attribute Title: Week (Sun-Sat) of Qtr (Created)
 * Display Form ID: created.week.in.quarter
 */
export const CreatedWeekSunSatOfQtr: IAttribute = newAttribute("created.aaO81lMifn6q");
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
 * Display Form ID: created.euweek.in.year
 */
export const CreatedWeekMonSun: IAttribute = newAttribute("created.aba81lMifn6q");
/**
 * Attribute Title: Week (Mon-Sun) of Qtr (Created)
 * Display Form ID: created.euweek.in.quarter
 */
export const CreatedWeekMonSunOfQtr: IAttribute = newAttribute("created.abg81lMifn6q");
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
 * Display Form ID: created.month.in.quarter
 */
export const CreatedMonthOfQuarter: IAttribute = newAttribute("created.aby81lMifn6q");
/**
 * Attribute Title: Day of Year (Created)
 * Display Form ID: created.day.in.year
 */
export const CreatedDayOfYear: IAttribute = newAttribute("created.abE81lMifn6q");
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
 * Display Form ID: created.day.in.quarter
 */
export const CreatedDayOfQuarter: IAttribute = newAttribute("created.ab481lMifn6q");
/**
 * Attribute Title: Day of Month (Created)
 * Display Form ID: created.day.in.month
 */
export const CreatedDayOfMonth: IAttribute = newAttribute("created.aca81lMifn6q");
/**
 * Attribute Title: Quarter/Year (Created)
 * Display Form ID: created.quarter
 */
export const CreatedQuarterYear: IAttribute = newAttribute("created.aci81lMifn6q");
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
 * Display Form ID: closed.year
 */
export const ClosedYear: IAttribute = newAttribute("closed.aag81lMifn6q");
/**
 * Attribute Title: Quarter (Closed)
 * Display Form ID: closed.quarter.in.year
 */
export const ClosedQuarter: IAttribute = newAttribute("closed.aam81lMifn6q");
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
 * Display Form ID: closed.week.in.year
 */
export const ClosedWeekSunSat: IAttribute = newAttribute("closed.aaI81lMifn6q");
/**
 * Attribute Title: Week (Sun-Sat) of Qtr (Closed)
 * Display Form ID: closed.week.in.quarter
 */
export const ClosedWeekSunSatOfQtr: IAttribute = newAttribute("closed.aaO81lMifn6q");
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
 * Display Form ID: closed.euweek.in.year
 */
export const ClosedWeekMonSun: IAttribute = newAttribute("closed.aba81lMifn6q");
/**
 * Attribute Title: Week (Mon-Sun) of Qtr (Closed)
 * Display Form ID: closed.euweek.in.quarter
 */
export const ClosedWeekMonSunOfQtr: IAttribute = newAttribute("closed.abg81lMifn6q");
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
 * Display Form ID: closed.month.in.quarter
 */
export const ClosedMonthOfQuarter: IAttribute = newAttribute("closed.aby81lMifn6q");
/**
 * Attribute Title: Day of Year (Closed)
 * Display Form ID: closed.day.in.year
 */
export const ClosedDayOfYear: IAttribute = newAttribute("closed.abE81lMifn6q");
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
 * Display Form ID: closed.day.in.quarter
 */
export const ClosedDayOfQuarter: IAttribute = newAttribute("closed.ab481lMifn6q");
/**
 * Attribute Title: Day of Month (Closed)
 * Display Form ID: closed.day.in.month
 */
export const ClosedDayOfMonth: IAttribute = newAttribute("closed.aca81lMifn6q");
/**
 * Attribute Title: Quarter/Year (Closed)
 * Display Form ID: closed.quarter
 */
export const ClosedQuarterYear: IAttribute = newAttribute("closed.aci81lMifn6q");
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
 * Display Form ID: snapshot.year
 */
export const SnapshotYear: IAttribute = newAttribute("snapshot.aag81lMifn6q");
/**
 * Attribute Title: Quarter (Snapshot)
 * Display Form ID: snapshot.quarter.in.year
 */
export const SnapshotQuarter: IAttribute = newAttribute("snapshot.aam81lMifn6q");
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
 * Display Form ID: snapshot.week.in.year
 */
export const SnapshotWeekSunSat: IAttribute = newAttribute("snapshot.aaI81lMifn6q");
/**
 * Attribute Title: Week (Sun-Sat) of Qtr (Snapshot)
 * Display Form ID: snapshot.week.in.quarter
 */
export const SnapshotWeekSunSatOfQtr: IAttribute = newAttribute("snapshot.aaO81lMifn6q");
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
 * Display Form ID: snapshot.euweek.in.year
 */
export const SnapshotWeekMonSun: IAttribute = newAttribute("snapshot.aba81lMifn6q");
/**
 * Attribute Title: Week (Mon-Sun) of Qtr (Snapshot)
 * Display Form ID: snapshot.euweek.in.quarter
 */
export const SnapshotWeekMonSunOfQtr: IAttribute = newAttribute("snapshot.abg81lMifn6q");
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
 * Display Form ID: snapshot.month.in.quarter
 */
export const SnapshotMonthOfQuarter: IAttribute = newAttribute("snapshot.aby81lMifn6q");
/**
 * Attribute Title: Day of Year (Snapshot)
 * Display Form ID: snapshot.day.in.year
 */
export const SnapshotDayOfYear: IAttribute = newAttribute("snapshot.abE81lMifn6q");
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
 * Display Form ID: snapshot.day.in.quarter
 */
export const SnapshotDayOfQuarter: IAttribute = newAttribute("snapshot.ab481lMifn6q");
/**
 * Attribute Title: Day of Month (Snapshot)
 * Display Form ID: snapshot.day.in.month
 */
export const SnapshotDayOfMonth: IAttribute = newAttribute("snapshot.aca81lMifn6q");
/**
 * Attribute Title: Quarter/Year (Snapshot)
 * Display Form ID: snapshot.quarter
 */
export const SnapshotQuarterYear: IAttribute = newAttribute("snapshot.aci81lMifn6q");
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
 * Display Form ID: activity.year
 */
export const ActivityYear: IAttribute = newAttribute("activity.aag81lMifn6q");
/**
 * Attribute Title: Quarter (Activity)
 * Display Form ID: activity.quarter.in.year
 */
export const ActivityQuarter: IAttribute = newAttribute("activity.aam81lMifn6q");
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
 * Display Form ID: activity.week.in.year
 */
export const ActivityWeekSunSat: IAttribute = newAttribute("activity.aaI81lMifn6q");
/**
 * Attribute Title: Week (Sun-Sat) of Qtr (Activity)
 * Display Form ID: activity.week.in.quarter
 */
export const ActivityWeekSunSatOfQtr: IAttribute = newAttribute("activity.aaO81lMifn6q");
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
 * Display Form ID: activity.euweek.in.year
 */
export const ActivityWeekMonSun: IAttribute = newAttribute("activity.aba81lMifn6q");
/**
 * Attribute Title: Week (Mon-Sun) of Qtr (Activity)
 * Display Form ID: activity.euweek.in.quarter
 */
export const ActivityWeekMonSunOfQtr: IAttribute = newAttribute("activity.abg81lMifn6q");
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
 * Display Form ID: activity.month.in.quarter
 */
export const ActivityMonthOfQuarter: IAttribute = newAttribute("activity.aby81lMifn6q");
/**
 * Attribute Title: Day of Year (Activity)
 * Display Form ID: activity.day.in.year
 */
export const ActivityDayOfYear: IAttribute = newAttribute("activity.abE81lMifn6q");
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
 * Display Form ID: activity.day.in.quarter
 */
export const ActivityDayOfQuarter: IAttribute = newAttribute("activity.ab481lMifn6q");
/**
 * Attribute Title: Day of Month (Activity)
 * Display Form ID: activity.day.in.month
 */
export const ActivityDayOfMonth: IAttribute = newAttribute("activity.aca81lMifn6q");
/**
 * Attribute Title: Quarter/Year (Activity)
 * Display Form ID: activity.quarter
 */
export const ActivityQuarterYear: IAttribute = newAttribute("activity.aci81lMifn6q");
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
export const Insights = {};
