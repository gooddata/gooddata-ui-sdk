/* eslint-disable */
/* THIS FILE WAS AUTO-GENERATED USING CATALOG EXPORTER; YOU SHOULD NOT EDIT THIS FILE; GENERATE TIME: 2023-06-02T16:36:47.040Z; */
// @ts-ignore ignore unused imports here if they happen (e.g. when there is no measure in the workspace)
import { newAttribute, newMeasure, IAttribute, IMeasure, IMeasureDefinition, idRef } from "@gooddata/sdk-model";

/**
 * Attribute Title: Account
 * Attribute ID: attr.account.id
 */
export const Account = {
  /**
   * Display Form Title: Name
   * Display Form ID: label.account.id.name
   */
  Name: newAttribute("label.account.id.name")
  /**
   * Display Form Title: Account
   * Display Form ID: label.account.id
   */,
  Default: newAttribute("label.account.id"),
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
  Subject: newAttribute("label.activity.id.subject")
  /**
   * Display Form Title: Activity
   * Display Form ID: label.activity.id
   */,
  Default: newAttribute("label.activity.id"),
};
/**
 * Attribute Title: Activity Type
 * Attribute ID: attr.activity.activitytype
 */
export const ActivityType: IAttribute = newAttribute("label.activity.activitytype");
/**
 * Attribute Title: Bezelementu
 * Attribute ID: attr.kancelarskepotreby.bezelementu
 */
export const Bezelementu: IAttribute = newAttribute("label.kancelarskepotreby.bezelementu");
/**
 * Attribute Title: Department-long name used to show tooltip
 * Attribute ID: attr.owner.department
 */
export const DepartmentLongNameUsedToShowTooltip: IAttribute = newAttribute("label.owner.department");
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
 * Attribute ID: attr.stage.isclosed
 */
export const IsClosed: IAttribute = newAttribute("label.stage.isclosed");
/**
 * Attribute Title: Is Closed?
 * Attribute ID: attr.activity.isclosed
 */
export const IsClosed_1: IAttribute = newAttribute("label.activity.isclosed");
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
  Name: newAttribute("label.opportunity.id.name")
  /**
   * Display Form Title: Opportunity
   * Display Form ID: label.opportunity.id
   */,
  Default: newAttribute("label.opportunity.id")
  /**
   * Display Form Title: SFDC URL
   * Display Form ID: label.opportunity.id.url
   */,
  SFDCURL: newAttribute("label.opportunity.id.url"),
};
/**
 * Attribute Title: Polozka
 * Attribute ID: attr.kancelarskepotreby.polozka
 */
export const Polozka: IAttribute = newAttribute("label.kancelarskepotreby.polozka");
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
  Name: newAttribute("label.product.id.name")
  /**
   * Display Form Title: Product
   * Display Form ID: label.product.id
   */,
  Default: newAttribute("label.product.id"),
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
  OwnerName: newAttribute("label.owner.id.name")
  /**
   * Display Form Title: Owner
   * Display Form ID: label.owner.id
   */,
  Owner: newAttribute("label.owner.id"),
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
  Default: newAttribute("label.stage.name.stagename")
  /**
   * Display Form Title: Stage Name
   * Display Form ID: label.stage.name
   */,
  _1: newAttribute("label.stage.name")
  /**
   * Display Form Title: Order
   * Display Form ID: label.stage.name.order
   */,
  Order: newAttribute("label.stage.name.order"),
};
/**
 * Attribute Title: Status
 * Attribute ID: attr.stage.status
 */
export const Status: IAttribute = newAttribute("label.stage.status");
/**
 * Attribute Title: Status
 * Attribute ID: attr.activity.status
 */
export const Status_1: IAttribute = newAttribute("label.activity.status");
/**
 * Attribute Title: Type
 * Attribute ID: attr.kancelarskepotreby.type
 */
export const Type: IAttribute = newAttribute("label.kancelarskepotreby.type");
/**
 * Attribute Title: Utvar
 * Attribute ID: attr.kancelarskepotreby.utvar
 */
export const Utvar: IAttribute = newAttribute("label.kancelarskepotreby.utvar");
/**
 * Metric Title: _Close [BOP]
 * Metric ID: aaeb7jTCfexV
 * Metric Type: MAQL Metric
 */
export const CloseBOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("aaeb7jTCfexV", "measure"));
/**
 * Metric Title: _Close [EOP]
 * Metric ID: aazb6kroa3iC
 * Metric Type: MAQL Metric
 */
export const CloseEOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("aazb6kroa3iC", "measure"));
/**
 * Metric Title: _Opp. First Snapshot
 * Metric ID: anwcdHC0aJK1
 * Metric Type: MAQL Metric
 */
export const OppFirstSnapshot: IMeasure<IMeasureDefinition> = newMeasure(idRef("anwcdHC0aJK1", "measure"));
/**
 * Metric Title: _Snapshot [BOP]
 * Metric ID: aazV2yX2gz2z
 * Metric Type: MAQL Metric
 */
export const SnapshotBOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("aazV2yX2gz2z", "measure"));
/**
 * Metric Title: _Snapshot [EOP-1]
 * Metric ID: aeTdhRNid95F
 * Metric Type: MAQL Metric
 */
export const SnapshotEOP1: IMeasure<IMeasureDefinition> = newMeasure(idRef("aeTdhRNid95F", "measure"));
/**
 * Metric Title: _Snapshot [EOP-2]
 * Metric ID: ab0bydLaaisS
 * Metric Type: MAQL Metric
 */
export const SnapshotEOP2: IMeasure<IMeasureDefinition> = newMeasure(idRef("ab0bydLaaisS", "measure"));
/**
 * Metric Title: _Snapshot [EOP]
 * Metric ID: aa5EuXigaJAx
 * Metric Type: MAQL Metric
 */
export const SnapshotEOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("aa5EuXigaJAx", "measure"));
/**
 * Metric Title: _Timeline [BOP]
 * Metric ID: aiTEuXhZaJw5
 * Metric Type: MAQL Metric
 */
export const TimelineBOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("aiTEuXhZaJw5", "measure"));
/**
 * Metric Title: _Timeline [EOP]
 * Metric ID: ahUEuUVTefyt
 * Metric Type: MAQL Metric
 */
export const TimelineEOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("ahUEuUVTefyt", "measure"));
/**
 * Metric Title: # of Act (B)
 * Metric ID: aacntkoNczEF
 * Metric Type: MAQL Metric
 */
export const NrOfActB: IMeasure<IMeasureDefinition> = newMeasure(idRef("aacntkoNczEF", "measure"));
/**
 * Metric Title: # of Activities
 * Metric ID: acKjadJIgZUN
 * Metric Type: MAQL Metric
 */
export const NrOfActivities: IMeasure<IMeasureDefinition> = newMeasure(idRef("acKjadJIgZUN", "measure"));
/**
 * Metric Title: # of Lost Opps.
 * Metric ID: adjh3LoXhPXZ
 * Metric Type: MAQL Metric
 */
export const NrOfLostOpps: IMeasure<IMeasureDefinition> = newMeasure(idRef("adjh3LoXhPXZ", "measure"));
/**
 * Metric Title: # of Open Opps.
 * Metric ID: aaYh6Voua2yj
 * Metric Type: MAQL Metric
 */
export const NrOfOpenOpps: IMeasure<IMeasureDefinition> = newMeasure(idRef("aaYh6Voua2yj", "measure"));
/**
 * Metric Title: # of Opportunities
 * Metric ID: afdV48ABh8CN
 * Metric Type: MAQL Metric
 */
export const NrOfOpportunities: IMeasure<IMeasureDefinition> = newMeasure(idRef("afdV48ABh8CN", "measure"));
/**
 * Metric Title: # of Opportunities [BOP]
 * Metric ID: aamV6GqBeqJE
 * Metric Type: MAQL Metric
 */
export const NrOfOpportunitiesBOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("aamV6GqBeqJE", "measure"));
/**
 * Metric Title: # of Won Opps.
 * Metric ID: abf0d42yaIkL
 * Metric Type: MAQL Metric
 */
export const NrOfWonOpps: IMeasure<IMeasureDefinition> = newMeasure(idRef("abf0d42yaIkL", "measure"));
/**
 * Metric Title: % of Goal
 * Metric ID: aau7DWc4aOY9
 * Metric Type: MAQL Metric
 */
export const PercentOfGoal: IMeasure<IMeasureDefinition> = newMeasure(idRef("aau7DWc4aOY9", "measure"));
/**
 * Metric Title: Amount
 * Metric ID: ah1EuQxwaCqs
 * Metric Type: MAQL Metric
 */
export const Amount: IMeasure<IMeasureDefinition> = newMeasure(idRef("ah1EuQxwaCqs", "measure"));
/**
 * Metric Title: Amount [BOP]
 * Metric ID: aagV61RmaPTt
 * Metric Type: MAQL Metric
 */
export const AmountBOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("aagV61RmaPTt", "measure"));
/**
 * Metric Title: AVG Castka
 * Metric ID: aabBh61o3eVi
 * Metric Type: MAQL Metric
 */
export const AVGCastka: IMeasure<IMeasureDefinition> = newMeasure(idRef("aabBh61o3eVi", "measure"));
/**
 * Metric Title: Avg. Amount
 * Metric ID: aoJqpe5Ib4mO
 * Metric Type: MAQL Metric
 */
export const AvgAmount: IMeasure<IMeasureDefinition> = newMeasure(idRef("aoJqpe5Ib4mO", "measure"));
/**
 * Metric Title: Avg. Won
 * Metric ID: agEEuYDOefRs
 * Metric Type: MAQL Metric
 */
export const AvgWon: IMeasure<IMeasureDefinition> = newMeasure(idRef("agEEuYDOefRs", "measure"));
/**
 * Metric Title: Best Case
 * Metric ID: ac3EwmqvbxcX
 * Metric Type: MAQL Metric
 */
export const BestCase: IMeasure<IMeasureDefinition> = newMeasure(idRef("ac3EwmqvbxcX", "measure"));
/**
 * Metric Title: Best Case [BOP]
 * Metric ID: agWV63OeeLzZ
 * Metric Type: MAQL Metric
 */
export const BestCaseBOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("agWV63OeeLzZ", "measure"));
/**
 * Metric Title: Best Case + Won
 * Metric ID: afrEHo1vdgPX
 * Metric Type: MAQL Metric
 */
export const BestCaseWon: IMeasure<IMeasureDefinition> = newMeasure(idRef("afrEHo1vdgPX", "measure"));
/**
 * Metric Title: Best Case + Won above Quota
 * Metric ID: aguEHnQddgJQ
 * Metric Type: MAQL Metric
 */
export const BestCaseWonAboveQuota: IMeasure<IMeasureDefinition> = newMeasure(idRef("aguEHnQddgJQ", "measure"));
/**
 * Metric Title: Days until Close
 * Metric ID: ab60fWAtbXDu
 * Metric Type: MAQL Metric
 */
export const DaysUntilClose: IMeasure<IMeasureDefinition> = newMeasure(idRef("ab60fWAtbXDu", "measure"));
/**
 * Metric Title: Expected
 * Metric ID: alUEwmBtbwSh
 * Metric Type: MAQL Metric
 */
export const Expected: IMeasure<IMeasureDefinition> = newMeasure(idRef("alUEwmBtbwSh", "measure"));
/**
 * Metric Title: Expected % of Goal
 * Metric ID: ahiKysS4g1xJ
 * Metric Type: MAQL Metric
 */
export const ExpectedPercentOfGoal: IMeasure<IMeasureDefinition> = newMeasure(idRef("ahiKysS4g1xJ", "measure"));
/**
 * Metric Title: Expected + Won
 * Metric ID: abpEF3QAhrxq
 * Metric Type: MAQL Metric
 */
export const ExpectedWon: IMeasure<IMeasureDefinition> = newMeasure(idRef("abpEF3QAhrxq", "measure"));
/**
 * Metric Title: Expected + Won vs. Quota
 * Metric ID: adIEF3jFhrus
 * Metric Type: MAQL Metric
 */
export const ExpectedWonVsQuota: IMeasure<IMeasureDefinition> = newMeasure(idRef("adIEF3jFhrus", "measure"));
/**
 * Metric Title: Lost
 * Metric ID: af2Ewj9Re2vK
 * Metric Type: MAQL Metric
 */
export const Lost: IMeasure<IMeasureDefinition> = newMeasure(idRef("af2Ewj9Re2vK", "measure"));
/**
 * Metric Title: metricAmountPercent
 * Metric ID: aaxSr1ERdme9
 * Metric Type: MAQL Metric
 */
export const MetricAmountPercent: IMeasure<IMeasureDefinition> = newMeasure(idRef("aaxSr1ERdme9", "measure"));
/**
 * Metric Title: Probability
 * Metric ID: acfWntEMcom0
 * Metric Type: MAQL Metric
 */
export const Probability: IMeasure<IMeasureDefinition> = newMeasure(idRef("acfWntEMcom0", "measure"));
/**
 * Metric Title: Probability [BOP]
 * Metric ID: apjWnFTTgjIi
 * Metric Type: MAQL Metric
 */
export const ProbabilityBOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("apjWnFTTgjIi", "measure"));
/**
 * Metric Title: Productive Reps
 * Metric ID: aah1rj5OeOqc
 * Metric Type: MAQL Metric
 */
export const ProductiveReps: IMeasure<IMeasureDefinition> = newMeasure(idRef("aah1rj5OeOqc", "measure"));
/**
 * Metric Title: Quota
 * Metric ID: abFKeoNocsN0
 * Metric Type: MAQL Metric
 */
export const Quota: IMeasure<IMeasureDefinition> = newMeasure(idRef("abFKeoNocsN0", "measure"));
/**
 * Metric Title: Remaining Quota
 * Metric ID: ab4EFOAmhjOx
 * Metric Type: MAQL Metric
 */
export const RemainingQuota: IMeasure<IMeasureDefinition> = newMeasure(idRef("ab4EFOAmhjOx", "measure"));
/**
 * Metric Title: Stage Duration
 * Metric ID: ae8zDprJiBLY
 * Metric Type: MAQL Metric
 */
export const StageDuration: IMeasure<IMeasureDefinition> = newMeasure(idRef("ae8zDprJiBLY", "measure"));
/**
 * Metric Title: Stage Velocity
 * Metric ID: amlzCOoUe2Q0
 * Metric Type: MAQL Metric
 */
export const StageVelocity: IMeasure<IMeasureDefinition> = newMeasure(idRef("amlzCOoUe2Q0", "measure"));
/**
 * Metric Title: Win Rate
 * Metric ID: aaX0PIUzg7nF
 * Metric Type: MAQL Metric
 */
export const WinRate: IMeasure<IMeasureDefinition> = newMeasure(idRef("aaX0PIUzg7nF", "measure"));
/**
 * Metric Title: Won
 * Metric ID: afSEwRwdbMeQ
 * Metric Type: MAQL Metric
 */
export const Won: IMeasure<IMeasureDefinition> = newMeasure(idRef("afSEwRwdbMeQ", "measure"));
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
  Sum: newMeasure(idRef("dt.activity.activity", "fact"), (m) => m.aggregation("sum"))
  /**
   * Fact Title: Activity (Date)
   * Fact ID: dt.activity.activity
   * Fact Aggregation: avg
   */,
  Avg: newMeasure(idRef("dt.activity.activity", "fact"), (m) => m.aggregation("avg"))
  /**
   * Fact Title: Activity (Date)
   * Fact ID: dt.activity.activity
   * Fact Aggregation: min
   */,
  Min: newMeasure(idRef("dt.activity.activity", "fact"), (m) => m.aggregation("min"))
  /**
   * Fact Title: Activity (Date)
   * Fact ID: dt.activity.activity
   * Fact Aggregation: max
   */,
  Max: newMeasure(idRef("dt.activity.activity", "fact"), (m) => m.aggregation("max"))
  /**
   * Fact Title: Activity (Date)
   * Fact ID: dt.activity.activity
   * Fact Aggregation: median
   */,
  Median: newMeasure(idRef("dt.activity.activity", "fact"), (m) => m.aggregation("median"))
  /**
   * Fact Title: Activity (Date)
   * Fact ID: dt.activity.activity
   * Fact Aggregation: runsum
   */,
  Runsum: newMeasure(idRef("dt.activity.activity", "fact"), (m) => m.aggregation("runsum")),
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
  Sum: newMeasure(idRef("fact.opportunitysnapshot.amount", "fact"), (m) => m.aggregation("sum"))
  /**
   * Fact Title: Amount
   * Fact ID: fact.opportunitysnapshot.amount
   * Fact Aggregation: avg
   */,
  Avg: newMeasure(idRef("fact.opportunitysnapshot.amount", "fact"), (m) => m.aggregation("avg"))
  /**
   * Fact Title: Amount
   * Fact ID: fact.opportunitysnapshot.amount
   * Fact Aggregation: min
   */,
  Min: newMeasure(idRef("fact.opportunitysnapshot.amount", "fact"), (m) => m.aggregation("min"))
  /**
   * Fact Title: Amount
   * Fact ID: fact.opportunitysnapshot.amount
   * Fact Aggregation: max
   */,
  Max: newMeasure(idRef("fact.opportunitysnapshot.amount", "fact"), (m) => m.aggregation("max"))
  /**
   * Fact Title: Amount
   * Fact ID: fact.opportunitysnapshot.amount
   * Fact Aggregation: median
   */,
  Median: newMeasure(idRef("fact.opportunitysnapshot.amount", "fact"), (m) => m.aggregation("median"))
  /**
   * Fact Title: Amount
   * Fact ID: fact.opportunitysnapshot.amount
   * Fact Aggregation: runsum
   */,
  Runsum: newMeasure(idRef("fact.opportunitysnapshot.amount", "fact"), (m) => m.aggregation("runsum")),
};
/**
 * Fact Title: Castka
 * Fact ID: fact.kancelarskepotreby.castka
 */
export const Castka = {
  /**
   * Fact Title: Castka
   * Fact ID: fact.kancelarskepotreby.castka
   * Fact Aggregation: sum
   */
  Sum: newMeasure(idRef("fact.kancelarskepotreby.castka", "fact"), (m) => m.aggregation("sum"))
  /**
   * Fact Title: Castka
   * Fact ID: fact.kancelarskepotreby.castka
   * Fact Aggregation: avg
   */,
  Avg: newMeasure(idRef("fact.kancelarskepotreby.castka", "fact"), (m) => m.aggregation("avg"))
  /**
   * Fact Title: Castka
   * Fact ID: fact.kancelarskepotreby.castka
   * Fact Aggregation: min
   */,
  Min: newMeasure(idRef("fact.kancelarskepotreby.castka", "fact"), (m) => m.aggregation("min"))
  /**
   * Fact Title: Castka
   * Fact ID: fact.kancelarskepotreby.castka
   * Fact Aggregation: max
   */,
  Max: newMeasure(idRef("fact.kancelarskepotreby.castka", "fact"), (m) => m.aggregation("max"))
  /**
   * Fact Title: Castka
   * Fact ID: fact.kancelarskepotreby.castka
   * Fact Aggregation: median
   */,
  Median: newMeasure(idRef("fact.kancelarskepotreby.castka", "fact"), (m) => m.aggregation("median"))
  /**
   * Fact Title: Castka
   * Fact ID: fact.kancelarskepotreby.castka
   * Fact Aggregation: runsum
   */,
  Runsum: newMeasure(idRef("fact.kancelarskepotreby.castka", "fact"), (m) => m.aggregation("runsum")),
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
  Sum: newMeasure(idRef("fact.opportunitysnapshot.daystoclose", "fact"), (m) => m.aggregation("sum"))
  /**
   * Fact Title: Days to Close
   * Fact ID: fact.opportunitysnapshot.daystoclose
   * Fact Aggregation: avg
   */,
  Avg: newMeasure(idRef("fact.opportunitysnapshot.daystoclose", "fact"), (m) => m.aggregation("avg"))
  /**
   * Fact Title: Days to Close
   * Fact ID: fact.opportunitysnapshot.daystoclose
   * Fact Aggregation: min
   */,
  Min: newMeasure(idRef("fact.opportunitysnapshot.daystoclose", "fact"), (m) => m.aggregation("min"))
  /**
   * Fact Title: Days to Close
   * Fact ID: fact.opportunitysnapshot.daystoclose
   * Fact Aggregation: max
   */,
  Max: newMeasure(idRef("fact.opportunitysnapshot.daystoclose", "fact"), (m) => m.aggregation("max"))
  /**
   * Fact Title: Days to Close
   * Fact ID: fact.opportunitysnapshot.daystoclose
   * Fact Aggregation: median
   */,
  Median: newMeasure(idRef("fact.opportunitysnapshot.daystoclose", "fact"), (m) => m.aggregation("median"))
  /**
   * Fact Title: Days to Close
   * Fact ID: fact.opportunitysnapshot.daystoclose
   * Fact Aggregation: runsum
   */,
  Runsum: newMeasure(idRef("fact.opportunitysnapshot.daystoclose", "fact"), (m) => m.aggregation("runsum")),
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
  Sum: newMeasure(idRef("fact.stagehistory.duration", "fact"), (m) => m.aggregation("sum"))
  /**
   * Fact Title: Duration
   * Fact ID: fact.stagehistory.duration
   * Fact Aggregation: avg
   */,
  Avg: newMeasure(idRef("fact.stagehistory.duration", "fact"), (m) => m.aggregation("avg"))
  /**
   * Fact Title: Duration
   * Fact ID: fact.stagehistory.duration
   * Fact Aggregation: min
   */,
  Min: newMeasure(idRef("fact.stagehistory.duration", "fact"), (m) => m.aggregation("min"))
  /**
   * Fact Title: Duration
   * Fact ID: fact.stagehistory.duration
   * Fact Aggregation: max
   */,
  Max: newMeasure(idRef("fact.stagehistory.duration", "fact"), (m) => m.aggregation("max"))
  /**
   * Fact Title: Duration
   * Fact ID: fact.stagehistory.duration
   * Fact Aggregation: median
   */,
  Median: newMeasure(idRef("fact.stagehistory.duration", "fact"), (m) => m.aggregation("median"))
  /**
   * Fact Title: Duration
   * Fact ID: fact.stagehistory.duration
   * Fact Aggregation: runsum
   */,
  Runsum: newMeasure(idRef("fact.stagehistory.duration", "fact"), (m) => m.aggregation("runsum")),
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
  Sum: newMeasure(idRef("dt.opportunitysnapshot.closedate", "fact"), (m) => m.aggregation("sum"))
  /**
   * Fact Title: Opp. Close (Date)
   * Fact ID: dt.opportunitysnapshot.closedate
   * Fact Aggregation: avg
   */,
  Avg: newMeasure(idRef("dt.opportunitysnapshot.closedate", "fact"), (m) => m.aggregation("avg"))
  /**
   * Fact Title: Opp. Close (Date)
   * Fact ID: dt.opportunitysnapshot.closedate
   * Fact Aggregation: min
   */,
  Min: newMeasure(idRef("dt.opportunitysnapshot.closedate", "fact"), (m) => m.aggregation("min"))
  /**
   * Fact Title: Opp. Close (Date)
   * Fact ID: dt.opportunitysnapshot.closedate
   * Fact Aggregation: max
   */,
  Max: newMeasure(idRef("dt.opportunitysnapshot.closedate", "fact"), (m) => m.aggregation("max"))
  /**
   * Fact Title: Opp. Close (Date)
   * Fact ID: dt.opportunitysnapshot.closedate
   * Fact Aggregation: median
   */,
  Median: newMeasure(idRef("dt.opportunitysnapshot.closedate", "fact"), (m) => m.aggregation("median"))
  /**
   * Fact Title: Opp. Close (Date)
   * Fact ID: dt.opportunitysnapshot.closedate
   * Fact Aggregation: runsum
   */,
  Runsum: newMeasure(idRef("dt.opportunitysnapshot.closedate", "fact"), (m) => m.aggregation("runsum")),
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
  Sum: newMeasure(idRef("dt.opportunity.oppcreated", "fact"), (m) => m.aggregation("sum"))
  /**
   * Fact Title: Opp. Created (Date)
   * Fact ID: dt.opportunity.oppcreated
   * Fact Aggregation: avg
   */,
  Avg: newMeasure(idRef("dt.opportunity.oppcreated", "fact"), (m) => m.aggregation("avg"))
  /**
   * Fact Title: Opp. Created (Date)
   * Fact ID: dt.opportunity.oppcreated
   * Fact Aggregation: min
   */,
  Min: newMeasure(idRef("dt.opportunity.oppcreated", "fact"), (m) => m.aggregation("min"))
  /**
   * Fact Title: Opp. Created (Date)
   * Fact ID: dt.opportunity.oppcreated
   * Fact Aggregation: max
   */,
  Max: newMeasure(idRef("dt.opportunity.oppcreated", "fact"), (m) => m.aggregation("max"))
  /**
   * Fact Title: Opp. Created (Date)
   * Fact ID: dt.opportunity.oppcreated
   * Fact Aggregation: median
   */,
  Median: newMeasure(idRef("dt.opportunity.oppcreated", "fact"), (m) => m.aggregation("median"))
  /**
   * Fact Title: Opp. Created (Date)
   * Fact ID: dt.opportunity.oppcreated
   * Fact Aggregation: runsum
   */,
  Runsum: newMeasure(idRef("dt.opportunity.oppcreated", "fact"), (m) => m.aggregation("runsum")),
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
  Sum: newMeasure(idRef("dt.opportunitysnapshot.snapshotdate", "fact"), (m) => m.aggregation("sum"))
  /**
   * Fact Title: Opp. Snapshot (Date)
   * Fact ID: dt.opportunitysnapshot.snapshotdate
   * Fact Aggregation: avg
   */,
  Avg: newMeasure(idRef("dt.opportunitysnapshot.snapshotdate", "fact"), (m) => m.aggregation("avg"))
  /**
   * Fact Title: Opp. Snapshot (Date)
   * Fact ID: dt.opportunitysnapshot.snapshotdate
   * Fact Aggregation: min
   */,
  Min: newMeasure(idRef("dt.opportunitysnapshot.snapshotdate", "fact"), (m) => m.aggregation("min"))
  /**
   * Fact Title: Opp. Snapshot (Date)
   * Fact ID: dt.opportunitysnapshot.snapshotdate
   * Fact Aggregation: max
   */,
  Max: newMeasure(idRef("dt.opportunitysnapshot.snapshotdate", "fact"), (m) => m.aggregation("max"))
  /**
   * Fact Title: Opp. Snapshot (Date)
   * Fact ID: dt.opportunitysnapshot.snapshotdate
   * Fact Aggregation: median
   */,
  Median: newMeasure(idRef("dt.opportunitysnapshot.snapshotdate", "fact"), (m) => m.aggregation("median"))
  /**
   * Fact Title: Opp. Snapshot (Date)
   * Fact ID: dt.opportunitysnapshot.snapshotdate
   * Fact Aggregation: runsum
   */,
  Runsum: newMeasure(idRef("dt.opportunitysnapshot.snapshotdate", "fact"), (m) => m.aggregation("runsum")),
};
/**
 * Fact Title: Pocet
 * Fact ID: fact.kancelarskepotreby.pocet
 */
export const Pocet = {
  /**
   * Fact Title: Pocet
   * Fact ID: fact.kancelarskepotreby.pocet
   * Fact Aggregation: sum
   */
  Sum: newMeasure(idRef("fact.kancelarskepotreby.pocet", "fact"), (m) => m.aggregation("sum"))
  /**
   * Fact Title: Pocet
   * Fact ID: fact.kancelarskepotreby.pocet
   * Fact Aggregation: avg
   */,
  Avg: newMeasure(idRef("fact.kancelarskepotreby.pocet", "fact"), (m) => m.aggregation("avg"))
  /**
   * Fact Title: Pocet
   * Fact ID: fact.kancelarskepotreby.pocet
   * Fact Aggregation: min
   */,
  Min: newMeasure(idRef("fact.kancelarskepotreby.pocet", "fact"), (m) => m.aggregation("min"))
  /**
   * Fact Title: Pocet
   * Fact ID: fact.kancelarskepotreby.pocet
   * Fact Aggregation: max
   */,
  Max: newMeasure(idRef("fact.kancelarskepotreby.pocet", "fact"), (m) => m.aggregation("max"))
  /**
   * Fact Title: Pocet
   * Fact ID: fact.kancelarskepotreby.pocet
   * Fact Aggregation: median
   */,
  Median: newMeasure(idRef("fact.kancelarskepotreby.pocet", "fact"), (m) => m.aggregation("median"))
  /**
   * Fact Title: Pocet
   * Fact ID: fact.kancelarskepotreby.pocet
   * Fact Aggregation: runsum
   */,
  Runsum: newMeasure(idRef("fact.kancelarskepotreby.pocet", "fact"), (m) => m.aggregation("runsum")),
};
/**
 * Fact Title: Pocet Koupenych
 * Fact ID: fact.kancelarskepotreby.pocetkoupenych
 */
export const PocetKoupenych = {
  /**
   * Fact Title: Pocet Koupenych
   * Fact ID: fact.kancelarskepotreby.pocetkoupenych
   * Fact Aggregation: sum
   */
  Sum: newMeasure(idRef("fact.kancelarskepotreby.pocetkoupenych", "fact"), (m) => m.aggregation("sum"))
  /**
   * Fact Title: Pocet Koupenych
   * Fact ID: fact.kancelarskepotreby.pocetkoupenych
   * Fact Aggregation: avg
   */,
  Avg: newMeasure(idRef("fact.kancelarskepotreby.pocetkoupenych", "fact"), (m) => m.aggregation("avg"))
  /**
   * Fact Title: Pocet Koupenych
   * Fact ID: fact.kancelarskepotreby.pocetkoupenych
   * Fact Aggregation: min
   */,
  Min: newMeasure(idRef("fact.kancelarskepotreby.pocetkoupenych", "fact"), (m) => m.aggregation("min"))
  /**
   * Fact Title: Pocet Koupenych
   * Fact ID: fact.kancelarskepotreby.pocetkoupenych
   * Fact Aggregation: max
   */,
  Max: newMeasure(idRef("fact.kancelarskepotreby.pocetkoupenych", "fact"), (m) => m.aggregation("max"))
  /**
   * Fact Title: Pocet Koupenych
   * Fact ID: fact.kancelarskepotreby.pocetkoupenych
   * Fact Aggregation: median
   */,
  Median: newMeasure(idRef("fact.kancelarskepotreby.pocetkoupenych", "fact"), (m) => m.aggregation("median"))
  /**
   * Fact Title: Pocet Koupenych
   * Fact ID: fact.kancelarskepotreby.pocetkoupenych
   * Fact Aggregation: runsum
   */,
  Runsum: newMeasure(idRef("fact.kancelarskepotreby.pocetkoupenych", "fact"), (m) => m.aggregation("runsum")),
};
/**
 * Fact Title: Pocet Rozdanych
 * Fact ID: fact.kancelarskepotreby.pocetrozdanych
 */
export const PocetRozdanych = {
  /**
   * Fact Title: Pocet Rozdanych
   * Fact ID: fact.kancelarskepotreby.pocetrozdanych
   * Fact Aggregation: sum
   */
  Sum: newMeasure(idRef("fact.kancelarskepotreby.pocetrozdanych", "fact"), (m) => m.aggregation("sum"))
  /**
   * Fact Title: Pocet Rozdanych
   * Fact ID: fact.kancelarskepotreby.pocetrozdanych
   * Fact Aggregation: avg
   */,
  Avg: newMeasure(idRef("fact.kancelarskepotreby.pocetrozdanych", "fact"), (m) => m.aggregation("avg"))
  /**
   * Fact Title: Pocet Rozdanych
   * Fact ID: fact.kancelarskepotreby.pocetrozdanych
   * Fact Aggregation: min
   */,
  Min: newMeasure(idRef("fact.kancelarskepotreby.pocetrozdanych", "fact"), (m) => m.aggregation("min"))
  /**
   * Fact Title: Pocet Rozdanych
   * Fact ID: fact.kancelarskepotreby.pocetrozdanych
   * Fact Aggregation: max
   */,
  Max: newMeasure(idRef("fact.kancelarskepotreby.pocetrozdanych", "fact"), (m) => m.aggregation("max"))
  /**
   * Fact Title: Pocet Rozdanych
   * Fact ID: fact.kancelarskepotreby.pocetrozdanych
   * Fact Aggregation: median
   */,
  Median: newMeasure(idRef("fact.kancelarskepotreby.pocetrozdanych", "fact"), (m) => m.aggregation("median"))
  /**
   * Fact Title: Pocet Rozdanych
   * Fact ID: fact.kancelarskepotreby.pocetrozdanych
   * Fact Aggregation: runsum
   */,
  Runsum: newMeasure(idRef("fact.kancelarskepotreby.pocetrozdanych", "fact"), (m) => m.aggregation("runsum")),
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
  Sum: newMeasure(idRef("fact.opportunitysnapshot.probability", "fact"), (m) => m.aggregation("sum"))
  /**
   * Fact Title: Probability
   * Fact ID: fact.opportunitysnapshot.probability
   * Fact Aggregation: avg
   */,
  Avg: newMeasure(idRef("fact.opportunitysnapshot.probability", "fact"), (m) => m.aggregation("avg"))
  /**
   * Fact Title: Probability
   * Fact ID: fact.opportunitysnapshot.probability
   * Fact Aggregation: min
   */,
  Min: newMeasure(idRef("fact.opportunitysnapshot.probability", "fact"), (m) => m.aggregation("min"))
  /**
   * Fact Title: Probability
   * Fact ID: fact.opportunitysnapshot.probability
   * Fact Aggregation: max
   */,
  Max: newMeasure(idRef("fact.opportunitysnapshot.probability", "fact"), (m) => m.aggregation("max"))
  /**
   * Fact Title: Probability
   * Fact ID: fact.opportunitysnapshot.probability
   * Fact Aggregation: median
   */,
  Median: newMeasure(idRef("fact.opportunitysnapshot.probability", "fact"), (m) => m.aggregation("median"))
  /**
   * Fact Title: Probability
   * Fact ID: fact.opportunitysnapshot.probability
   * Fact Aggregation: runsum
   */,
  Runsum: newMeasure(idRef("fact.opportunitysnapshot.probability", "fact"), (m) => m.aggregation("runsum")),
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
  Sum: newMeasure(idRef("dt.timeline.timeline", "fact"), (m) => m.aggregation("sum"))
  /**
   * Fact Title: Timeline (Date)
   * Fact ID: dt.timeline.timeline
   * Fact Aggregation: avg
   */,
  Avg: newMeasure(idRef("dt.timeline.timeline", "fact"), (m) => m.aggregation("avg"))
  /**
   * Fact Title: Timeline (Date)
   * Fact ID: dt.timeline.timeline
   * Fact Aggregation: min
   */,
  Min: newMeasure(idRef("dt.timeline.timeline", "fact"), (m) => m.aggregation("min"))
  /**
   * Fact Title: Timeline (Date)
   * Fact ID: dt.timeline.timeline
   * Fact Aggregation: max
   */,
  Max: newMeasure(idRef("dt.timeline.timeline", "fact"), (m) => m.aggregation("max"))
  /**
   * Fact Title: Timeline (Date)
   * Fact ID: dt.timeline.timeline
   * Fact Aggregation: median
   */,
  Median: newMeasure(idRef("dt.timeline.timeline", "fact"), (m) => m.aggregation("median"))
  /**
   * Fact Title: Timeline (Date)
   * Fact ID: dt.timeline.timeline
   * Fact Aggregation: runsum
   */,
  Runsum: newMeasure(idRef("dt.timeline.timeline", "fact"), (m) => m.aggregation("runsum")),
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
  Sum: newMeasure(idRef("fact.stagehistory.velocity", "fact"), (m) => m.aggregation("sum"))
  /**
   * Fact Title: Velocity
   * Fact ID: fact.stagehistory.velocity
   * Fact Aggregation: avg
   */,
  Avg: newMeasure(idRef("fact.stagehistory.velocity", "fact"), (m) => m.aggregation("avg"))
  /**
   * Fact Title: Velocity
   * Fact ID: fact.stagehistory.velocity
   * Fact Aggregation: min
   */,
  Min: newMeasure(idRef("fact.stagehistory.velocity", "fact"), (m) => m.aggregation("min"))
  /**
   * Fact Title: Velocity
   * Fact ID: fact.stagehistory.velocity
   * Fact Aggregation: max
   */,
  Max: newMeasure(idRef("fact.stagehistory.velocity", "fact"), (m) => m.aggregation("max"))
  /**
   * Fact Title: Velocity
   * Fact ID: fact.stagehistory.velocity
   * Fact Aggregation: median
   */,
  Median: newMeasure(idRef("fact.stagehistory.velocity", "fact"), (m) => m.aggregation("median"))
  /**
   * Fact Title: Velocity
   * Fact ID: fact.stagehistory.velocity
   * Fact Aggregation: runsum
   */,
  Runsum: newMeasure(idRef("fact.stagehistory.velocity", "fact"), (m) => m.aggregation("runsum")),
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
  MmDdYyyy: newAttribute("created.date.mmddyyyy")
  /**
   * Display Form Title: yyyy-mm-dd (Created)
   * Display Form ID: created.date.yyyymmdd
   */,
  YyyyMmDd: newAttribute("created.date.yyyymmdd")
  /**
   * Display Form Title: m/d/yy (no leading zeroes) (Created)
   * Display Form ID: created.date.mdyy
   */,
  MDYy: newAttribute("created.date.mdyy")
  /**
   * Display Form Title: Long (Mon, Jan 1, 2010) (Created)
   * Display Form ID: created.date.long
   */,
  Long: newAttribute("created.date.long")
  /**
   * Display Form Title: dd/mm/yyyy (Created)
   * Display Form ID: created.date.ddmmyyyy
   */,
  DdMmYyyy: newAttribute("created.date.ddmmyyyy")
  /**
   * Display Form Title: dd-mm-yyyy (Created)
   * Display Form ID: created.date.eddmmyyyy
   */,
  DdMmYyyy_1: newAttribute("created.date.eddmmyyyy"),
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
  Short: newAttribute("created.abU81lMifn6q")
  /**
   * Display Form Title: Long (Monday) (Created)
   * Display Form ID: created.abY81lMifn6q
   */,
  Long: newAttribute("created.abY81lMifn6q")
  /**
   * Display Form Title: Number (1=Monday) (Created)
   * Display Form ID: created.abW81lMifn6q
   */,
  Number: newAttribute("created.abW81lMifn6q"),
};
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
  Short: newAttribute("created.act81lMifn6q")
  /**
   * Display Form Title: Long (January 2010) (Created)
   * Display Form ID: created.acx81lMifn6q
   */,
  Long: newAttribute("created.acx81lMifn6q")
  /**
   * Display Form Title: Number (1/2010) (Created)
   * Display Form ID: created.acv81lMifn6q
   */,
  Number: newAttribute("created.acv81lMifn6q"),
};
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
  Short: newAttribute("created.abm81lMifn6q")
  /**
   * Display Form Title: Long (January) (Created)
   * Display Form ID: created.abs81lMifn6q
   */,
  Long: newAttribute("created.abs81lMifn6q")
  /**
   * Display Form Title: Number (M1) (Created)
   * Display Form ID: created.abq81lMifn6q
   */,
  Number: newAttribute("created.abq81lMifn6q")
  /**
   * Display Form Title: M/Q (M1/Q1) (Created)
   * Display Form ID: created.abo81lMifn6q
   */,
  MQ: newAttribute("created.abo81lMifn6q"),
};
/**
 * Attribute Title: Week (Mon-Sun) (Created)
 * Attribute ID: created.euweek.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedWeekMonSun: IAttribute = newAttribute("created.aba81lMifn6q");
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
  WeekNrYear: newAttribute("created.aa281lMifn6q")
  /**
   * Display Form Title: Week Starting (Created)
   * Display Form ID: created.aaY81lMifn6q
   */,
  WeekStarting: newAttribute("created.aaY81lMifn6q")
  /**
   * Display Form Title: From - To (Created)
   * Display Form ID: created.aaW81lMifn6q
   */,
  FromTo: newAttribute("created.aaW81lMifn6q")
  /**
   * Display Form Title: Week #/Year (Cont.) (Created)
   * Display Form ID: created.aa081lMifn6q
   */,
  WeekNrYear_1: newAttribute("created.aa081lMifn6q")
  /**
   * Display Form Title: Wk/Qtr/Year (Cont.) (Created)
   * Display Form ID: created.aa481lMifn6q
   */,
  WkQtrYear: newAttribute("created.aa481lMifn6q")
  /**
   * Display Form Title: Wk/Qtr/Year (Created)
   * Display Form ID: created.aaU81lMifn6q
   */,
  WkQtrYear_1: newAttribute("created.aaU81lMifn6q"),
};
/**
 * Attribute Title: Quarter/Year (Created)
 * Attribute ID: created.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedQuarterYear: IAttribute = newAttribute("created.aci81lMifn6q");
/**
 * Attribute Title: Day of Month (Created)
 * Attribute ID: created.day.in.month
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedDayOfMonth: IAttribute = newAttribute("created.aca81lMifn6q");
/**
 * Attribute Title: Week (Sun-Sat) of Qtr (Created)
 * Attribute ID: created.week.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedWeekSunSatOfQtr: IAttribute = newAttribute("created.aaO81lMifn6q");
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
  WeekNrYear: newAttribute("created.aaA81lMifn6q")
  /**
   * Display Form Title: Week Starting (Created)
   * Display Form ID: created.aaw81lMifn6q
   */,
  WeekStarting: newAttribute("created.aaw81lMifn6q")
  /**
   * Display Form Title: From - To (Created)
   * Display Form ID: created.aau81lMifn6q
   */,
  FromTo: newAttribute("created.aau81lMifn6q")
  /**
   * Display Form Title: Week #/Year (Cont.) (Created)
   * Display Form ID: created.aay81lMifn6q
   */,
  WeekNrYear_1: newAttribute("created.aay81lMifn6q")
  /**
   * Display Form Title: Wk/Qtr/Year (Cont.) (Created)
   * Display Form ID: created.aaC81lMifn6q
   */,
  WkQtrYear: newAttribute("created.aaC81lMifn6q")
  /**
   * Display Form Title: Wk/Qtr/Year (Created)
   * Display Form ID: created.aas81lMifn6q
   */,
  WkQtrYear_1: newAttribute("created.aas81lMifn6q"),
};
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
  Short: newAttribute("created.abK81lMifn6q")
  /**
   * Display Form Title: Long (Sunday) (Created)
   * Display Form ID: created.abO81lMifn6q
   */,
  Long: newAttribute("created.abO81lMifn6q")
  /**
   * Display Form Title: Number (1=Sunday) (Created)
   * Display Form ID: created.abM81lMifn6q
   */,
  Number: newAttribute("created.abM81lMifn6q"),
};
/**
 * Attribute Title: Week (Sun-Sat) (Created)
 * Attribute ID: created.week.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedWeekSunSat: IAttribute = newAttribute("created.aaI81lMifn6q");
/**
 * Attribute Title: Week (Mon-Sun) of Qtr (Created)
 * Attribute ID: created.euweek.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedWeekMonSunOfQtr: IAttribute = newAttribute("created.abg81lMifn6q");
/**
 * Attribute Title: Day of Quarter (Created)
 * Attribute ID: created.day.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedDayOfQuarter: IAttribute = newAttribute("created.ab481lMifn6q");
/**
 * Attribute Title: Year (Created)
 * Attribute ID: created.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedYear: IAttribute = newAttribute("created.aag81lMifn6q");
/**
 * Attribute Title: Month of Quarter (Created)
 * Attribute ID: created.month.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const CreatedMonthOfQuarter: IAttribute = newAttribute("created.aby81lMifn6q");
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
  MmDdYyyy: newAttribute("closed.date.mmddyyyy")
  /**
   * Display Form Title: yyyy-mm-dd (Closed)
   * Display Form ID: closed.date.yyyymmdd
   */,
  YyyyMmDd: newAttribute("closed.date.yyyymmdd")
  /**
   * Display Form Title: m/d/yy (no leading zeroes) (Closed)
   * Display Form ID: closed.date.mdyy
   */,
  MDYy: newAttribute("closed.date.mdyy")
  /**
   * Display Form Title: Long (Mon, Jan 1, 2010) (Closed)
   * Display Form ID: closed.date.long
   */,
  Long: newAttribute("closed.date.long")
  /**
   * Display Form Title: dd/mm/yyyy (Closed)
   * Display Form ID: closed.date.ddmmyyyy
   */,
  DdMmYyyy: newAttribute("closed.date.ddmmyyyy")
  /**
   * Display Form Title: dd-mm-yyyy (Closed)
   * Display Form ID: closed.date.eddmmyyyy
   */,
  DdMmYyyy_1: newAttribute("closed.date.eddmmyyyy"),
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
  Short: newAttribute("closed.abU81lMifn6q")
  /**
   * Display Form Title: Long (Monday) (Closed)
   * Display Form ID: closed.abY81lMifn6q
   */,
  Long: newAttribute("closed.abY81lMifn6q")
  /**
   * Display Form Title: Number (1=Monday) (Closed)
   * Display Form ID: closed.abW81lMifn6q
   */,
  Number: newAttribute("closed.abW81lMifn6q"),
};
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
  Short: newAttribute("closed.act81lMifn6q")
  /**
   * Display Form Title: Long (January 2010) (Closed)
   * Display Form ID: closed.acx81lMifn6q
   */,
  Long: newAttribute("closed.acx81lMifn6q")
  /**
   * Display Form Title: Number (1/2010) (Closed)
   * Display Form ID: closed.acv81lMifn6q
   */,
  Number: newAttribute("closed.acv81lMifn6q"),
};
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
  Short: newAttribute("closed.abm81lMifn6q")
  /**
   * Display Form Title: Long (January) (Closed)
   * Display Form ID: closed.abs81lMifn6q
   */,
  Long: newAttribute("closed.abs81lMifn6q")
  /**
   * Display Form Title: Number (M1) (Closed)
   * Display Form ID: closed.abq81lMifn6q
   */,
  Number: newAttribute("closed.abq81lMifn6q")
  /**
   * Display Form Title: M/Q (M1/Q1) (Closed)
   * Display Form ID: closed.abo81lMifn6q
   */,
  MQ: newAttribute("closed.abo81lMifn6q"),
};
/**
 * Attribute Title: Week (Mon-Sun) (Closed)
 * Attribute ID: closed.euweek.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedWeekMonSun: IAttribute = newAttribute("closed.aba81lMifn6q");
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
  WeekNrYear: newAttribute("closed.aa281lMifn6q")
  /**
   * Display Form Title: Week Starting (Closed)
   * Display Form ID: closed.aaY81lMifn6q
   */,
  WeekStarting: newAttribute("closed.aaY81lMifn6q")
  /**
   * Display Form Title: From - To (Closed)
   * Display Form ID: closed.aaW81lMifn6q
   */,
  FromTo: newAttribute("closed.aaW81lMifn6q")
  /**
   * Display Form Title: Week #/Year (Cont.) (Closed)
   * Display Form ID: closed.aa081lMifn6q
   */,
  WeekNrYear_1: newAttribute("closed.aa081lMifn6q")
  /**
   * Display Form Title: Wk/Qtr/Year (Cont.) (Closed)
   * Display Form ID: closed.aa481lMifn6q
   */,
  WkQtrYear: newAttribute("closed.aa481lMifn6q")
  /**
   * Display Form Title: Wk/Qtr/Year (Closed)
   * Display Form ID: closed.aaU81lMifn6q
   */,
  WkQtrYear_1: newAttribute("closed.aaU81lMifn6q"),
};
/**
 * Attribute Title: Quarter/Year (Closed)
 * Attribute ID: closed.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedQuarterYear: IAttribute = newAttribute("closed.aci81lMifn6q");
/**
 * Attribute Title: Day of Month (Closed)
 * Attribute ID: closed.day.in.month
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedDayOfMonth: IAttribute = newAttribute("closed.aca81lMifn6q");
/**
 * Attribute Title: Week (Sun-Sat) of Qtr (Closed)
 * Attribute ID: closed.week.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedWeekSunSatOfQtr: IAttribute = newAttribute("closed.aaO81lMifn6q");
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
  WeekNrYear: newAttribute("closed.aaA81lMifn6q")
  /**
   * Display Form Title: Week Starting (Closed)
   * Display Form ID: closed.aaw81lMifn6q
   */,
  WeekStarting: newAttribute("closed.aaw81lMifn6q")
  /**
   * Display Form Title: From - To (Closed)
   * Display Form ID: closed.aau81lMifn6q
   */,
  FromTo: newAttribute("closed.aau81lMifn6q")
  /**
   * Display Form Title: Week #/Year (Cont.) (Closed)
   * Display Form ID: closed.aay81lMifn6q
   */,
  WeekNrYear_1: newAttribute("closed.aay81lMifn6q")
  /**
   * Display Form Title: Wk/Qtr/Year (Cont.) (Closed)
   * Display Form ID: closed.aaC81lMifn6q
   */,
  WkQtrYear: newAttribute("closed.aaC81lMifn6q")
  /**
   * Display Form Title: Wk/Qtr/Year (Closed)
   * Display Form ID: closed.aas81lMifn6q
   */,
  WkQtrYear_1: newAttribute("closed.aas81lMifn6q"),
};
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
  Short: newAttribute("closed.abK81lMifn6q")
  /**
   * Display Form Title: Long (Sunday) (Closed)
   * Display Form ID: closed.abO81lMifn6q
   */,
  Long: newAttribute("closed.abO81lMifn6q")
  /**
   * Display Form Title: Number (1=Sunday) (Closed)
   * Display Form ID: closed.abM81lMifn6q
   */,
  Number: newAttribute("closed.abM81lMifn6q"),
};
/**
 * Attribute Title: Week (Sun-Sat) (Closed)
 * Attribute ID: closed.week.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedWeekSunSat: IAttribute = newAttribute("closed.aaI81lMifn6q");
/**
 * Attribute Title: Week (Mon-Sun) of Qtr (Closed)
 * Attribute ID: closed.euweek.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedWeekMonSunOfQtr: IAttribute = newAttribute("closed.abg81lMifn6q");
/**
 * Attribute Title: Day of Quarter (Closed)
 * Attribute ID: closed.day.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedDayOfQuarter: IAttribute = newAttribute("closed.ab481lMifn6q");
/**
 * Attribute Title: Year (Closed)
 * Attribute ID: closed.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedYear: IAttribute = newAttribute("closed.aag81lMifn6q");
/**
 * Attribute Title: Month of Quarter (Closed)
 * Attribute ID: closed.month.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ClosedMonthOfQuarter: IAttribute = newAttribute("closed.aby81lMifn6q");
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
  MmDdYyyy: newAttribute("snapshot.date.mmddyyyy")
  /**
   * Display Form Title: yyyy-mm-dd (Snapshot)
   * Display Form ID: snapshot.date.yyyymmdd
   */,
  YyyyMmDd: newAttribute("snapshot.date.yyyymmdd")
  /**
   * Display Form Title: m/d/yy (no leading zeroes) (Snapshot)
   * Display Form ID: snapshot.date.mdyy
   */,
  MDYy: newAttribute("snapshot.date.mdyy")
  /**
   * Display Form Title: Long (Mon, Jan 1, 2010) (Snapshot)
   * Display Form ID: snapshot.date.long
   */,
  Long: newAttribute("snapshot.date.long")
  /**
   * Display Form Title: dd/mm/yyyy (Snapshot)
   * Display Form ID: snapshot.date.ddmmyyyy
   */,
  DdMmYyyy: newAttribute("snapshot.date.ddmmyyyy")
  /**
   * Display Form Title: dd-mm-yyyy (Snapshot)
   * Display Form ID: snapshot.date.eddmmyyyy
   */,
  DdMmYyyy_1: newAttribute("snapshot.date.eddmmyyyy"),
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
  Short: newAttribute("snapshot.abU81lMifn6q")
  /**
   * Display Form Title: Long (Monday) (Snapshot)
   * Display Form ID: snapshot.abY81lMifn6q
   */,
  Long: newAttribute("snapshot.abY81lMifn6q")
  /**
   * Display Form Title: Number (1=Monday) (Snapshot)
   * Display Form ID: snapshot.abW81lMifn6q
   */,
  Number: newAttribute("snapshot.abW81lMifn6q"),
};
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
  Short: newAttribute("snapshot.act81lMifn6q")
  /**
   * Display Form Title: Long (January 2010) (Snapshot)
   * Display Form ID: snapshot.acx81lMifn6q
   */,
  Long: newAttribute("snapshot.acx81lMifn6q")
  /**
   * Display Form Title: Number (1/2010) (Snapshot)
   * Display Form ID: snapshot.acv81lMifn6q
   */,
  Number: newAttribute("snapshot.acv81lMifn6q"),
};
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
  Short: newAttribute("snapshot.abm81lMifn6q")
  /**
   * Display Form Title: Long (January) (Snapshot)
   * Display Form ID: snapshot.abs81lMifn6q
   */,
  Long: newAttribute("snapshot.abs81lMifn6q")
  /**
   * Display Form Title: Number (M1) (Snapshot)
   * Display Form ID: snapshot.abq81lMifn6q
   */,
  Number: newAttribute("snapshot.abq81lMifn6q")
  /**
   * Display Form Title: M/Q (M1/Q1) (Snapshot)
   * Display Form ID: snapshot.abo81lMifn6q
   */,
  MQ: newAttribute("snapshot.abo81lMifn6q"),
};
/**
 * Attribute Title: Week (Mon-Sun) (Snapshot)
 * Attribute ID: snapshot.euweek.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotWeekMonSun: IAttribute = newAttribute("snapshot.aba81lMifn6q");
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
  WeekNrYear: newAttribute("snapshot.aa281lMifn6q")
  /**
   * Display Form Title: Week Starting (Snapshot)
   * Display Form ID: snapshot.aaY81lMifn6q
   */,
  WeekStarting: newAttribute("snapshot.aaY81lMifn6q")
  /**
   * Display Form Title: From - To (Snapshot)
   * Display Form ID: snapshot.aaW81lMifn6q
   */,
  FromTo: newAttribute("snapshot.aaW81lMifn6q")
  /**
   * Display Form Title: Week #/Year (Cont.) (Snapshot)
   * Display Form ID: snapshot.aa081lMifn6q
   */,
  WeekNrYear_1: newAttribute("snapshot.aa081lMifn6q")
  /**
   * Display Form Title: Wk/Qtr/Year (Cont.) (Snapshot)
   * Display Form ID: snapshot.aa481lMifn6q
   */,
  WkQtrYear: newAttribute("snapshot.aa481lMifn6q")
  /**
   * Display Form Title: Wk/Qtr/Year (Snapshot)
   * Display Form ID: snapshot.aaU81lMifn6q
   */,
  WkQtrYear_1: newAttribute("snapshot.aaU81lMifn6q"),
};
/**
 * Attribute Title: Quarter/Year (Snapshot)
 * Attribute ID: snapshot.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotQuarterYear: IAttribute = newAttribute("snapshot.aci81lMifn6q");
/**
 * Attribute Title: Day of Month (Snapshot)
 * Attribute ID: snapshot.day.in.month
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotDayOfMonth: IAttribute = newAttribute("snapshot.aca81lMifn6q");
/**
 * Attribute Title: Week (Sun-Sat) of Qtr (Snapshot)
 * Attribute ID: snapshot.week.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotWeekSunSatOfQtr: IAttribute = newAttribute("snapshot.aaO81lMifn6q");
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
  WeekNrYear: newAttribute("snapshot.aaA81lMifn6q")
  /**
   * Display Form Title: Week Starting (Snapshot)
   * Display Form ID: snapshot.aaw81lMifn6q
   */,
  WeekStarting: newAttribute("snapshot.aaw81lMifn6q")
  /**
   * Display Form Title: From - To (Snapshot)
   * Display Form ID: snapshot.aau81lMifn6q
   */,
  FromTo: newAttribute("snapshot.aau81lMifn6q")
  /**
   * Display Form Title: Week #/Year (Cont.) (Snapshot)
   * Display Form ID: snapshot.aay81lMifn6q
   */,
  WeekNrYear_1: newAttribute("snapshot.aay81lMifn6q")
  /**
   * Display Form Title: Wk/Qtr/Year (Cont.) (Snapshot)
   * Display Form ID: snapshot.aaC81lMifn6q
   */,
  WkQtrYear: newAttribute("snapshot.aaC81lMifn6q")
  /**
   * Display Form Title: Wk/Qtr/Year (Snapshot)
   * Display Form ID: snapshot.aas81lMifn6q
   */,
  WkQtrYear_1: newAttribute("snapshot.aas81lMifn6q"),
};
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
  Short: newAttribute("snapshot.abK81lMifn6q")
  /**
   * Display Form Title: Long (Sunday) (Snapshot)
   * Display Form ID: snapshot.abO81lMifn6q
   */,
  Long: newAttribute("snapshot.abO81lMifn6q")
  /**
   * Display Form Title: Number (1=Sunday) (Snapshot)
   * Display Form ID: snapshot.abM81lMifn6q
   */,
  Number: newAttribute("snapshot.abM81lMifn6q"),
};
/**
 * Attribute Title: Week (Sun-Sat) (Snapshot)
 * Attribute ID: snapshot.week.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotWeekSunSat: IAttribute = newAttribute("snapshot.aaI81lMifn6q");
/**
 * Attribute Title: Week (Mon-Sun) of Qtr (Snapshot)
 * Attribute ID: snapshot.euweek.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotWeekMonSunOfQtr: IAttribute = newAttribute("snapshot.abg81lMifn6q");
/**
 * Attribute Title: Day of Quarter (Snapshot)
 * Attribute ID: snapshot.day.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotDayOfQuarter: IAttribute = newAttribute("snapshot.ab481lMifn6q");
/**
 * Attribute Title: Year (Snapshot)
 * Attribute ID: snapshot.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotYear: IAttribute = newAttribute("snapshot.aag81lMifn6q");
/**
 * Attribute Title: Month of Quarter (Snapshot)
 * Attribute ID: snapshot.month.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const SnapshotMonthOfQuarter: IAttribute = newAttribute("snapshot.aby81lMifn6q");
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
  MmDdYyyy: newAttribute("activity.date.mmddyyyy")
  /**
   * Display Form Title: yyyy-mm-dd (Activity)
   * Display Form ID: activity.date.yyyymmdd
   */,
  YyyyMmDd: newAttribute("activity.date.yyyymmdd")
  /**
   * Display Form Title: m/d/yy (no leading zeroes) (Activity)
   * Display Form ID: activity.date.mdyy
   */,
  MDYy: newAttribute("activity.date.mdyy")
  /**
   * Display Form Title: Long (Mon, Jan 1, 2010) (Activity)
   * Display Form ID: activity.date.long
   */,
  Long: newAttribute("activity.date.long")
  /**
   * Display Form Title: dd/mm/yyyy (Activity)
   * Display Form ID: activity.date.ddmmyyyy
   */,
  DdMmYyyy: newAttribute("activity.date.ddmmyyyy")
  /**
   * Display Form Title: dd-mm-yyyy (Activity)
   * Display Form ID: activity.date.eddmmyyyy
   */,
  DdMmYyyy_1: newAttribute("activity.date.eddmmyyyy"),
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
  Short: newAttribute("activity.abU81lMifn6q")
  /**
   * Display Form Title: Long (Monday) (Activity)
   * Display Form ID: activity.abY81lMifn6q
   */,
  Long: newAttribute("activity.abY81lMifn6q")
  /**
   * Display Form Title: Number (1=Monday) (Activity)
   * Display Form ID: activity.abW81lMifn6q
   */,
  Number: newAttribute("activity.abW81lMifn6q"),
};
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
  Short: newAttribute("activity.act81lMifn6q")
  /**
   * Display Form Title: Long (January 2010) (Activity)
   * Display Form ID: activity.acx81lMifn6q
   */,
  Long: newAttribute("activity.acx81lMifn6q")
  /**
   * Display Form Title: Number (1/2010) (Activity)
   * Display Form ID: activity.acv81lMifn6q
   */,
  Number: newAttribute("activity.acv81lMifn6q"),
};
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
  Short: newAttribute("activity.abm81lMifn6q")
  /**
   * Display Form Title: Long (January) (Activity)
   * Display Form ID: activity.abs81lMifn6q
   */,
  Long: newAttribute("activity.abs81lMifn6q")
  /**
   * Display Form Title: Number (M1) (Activity)
   * Display Form ID: activity.abq81lMifn6q
   */,
  Number: newAttribute("activity.abq81lMifn6q")
  /**
   * Display Form Title: M/Q (M1/Q1) (Activity)
   * Display Form ID: activity.abo81lMifn6q
   */,
  MQ: newAttribute("activity.abo81lMifn6q"),
};
/**
 * Attribute Title: Week (Mon-Sun) (Activity)
 * Attribute ID: activity.euweek.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityWeekMonSun: IAttribute = newAttribute("activity.aba81lMifn6q");
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
  WeekNrYear: newAttribute("activity.aa281lMifn6q")
  /**
   * Display Form Title: Week Starting (Activity)
   * Display Form ID: activity.aaY81lMifn6q
   */,
  WeekStarting: newAttribute("activity.aaY81lMifn6q")
  /**
   * Display Form Title: From - To (Activity)
   * Display Form ID: activity.aaW81lMifn6q
   */,
  FromTo: newAttribute("activity.aaW81lMifn6q")
  /**
   * Display Form Title: Week #/Year (Cont.) (Activity)
   * Display Form ID: activity.aa081lMifn6q
   */,
  WeekNrYear_1: newAttribute("activity.aa081lMifn6q")
  /**
   * Display Form Title: Wk/Qtr/Year (Cont.) (Activity)
   * Display Form ID: activity.aa481lMifn6q
   */,
  WkQtrYear: newAttribute("activity.aa481lMifn6q")
  /**
   * Display Form Title: Wk/Qtr/Year (Activity)
   * Display Form ID: activity.aaU81lMifn6q
   */,
  WkQtrYear_1: newAttribute("activity.aaU81lMifn6q"),
};
/**
 * Attribute Title: Quarter/Year (Activity)
 * Attribute ID: activity.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityQuarterYear: IAttribute = newAttribute("activity.aci81lMifn6q");
/**
 * Attribute Title: Day of Month (Activity)
 * Attribute ID: activity.day.in.month
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityDayOfMonth: IAttribute = newAttribute("activity.aca81lMifn6q");
/**
 * Attribute Title: Week (Sun-Sat) of Qtr (Activity)
 * Attribute ID: activity.week.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityWeekSunSatOfQtr: IAttribute = newAttribute("activity.aaO81lMifn6q");
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
  WeekNrYear: newAttribute("activity.aaA81lMifn6q")
  /**
   * Display Form Title: Week Starting (Activity)
   * Display Form ID: activity.aaw81lMifn6q
   */,
  WeekStarting: newAttribute("activity.aaw81lMifn6q")
  /**
   * Display Form Title: From - To (Activity)
   * Display Form ID: activity.aau81lMifn6q
   */,
  FromTo: newAttribute("activity.aau81lMifn6q")
  /**
   * Display Form Title: Week #/Year (Cont.) (Activity)
   * Display Form ID: activity.aay81lMifn6q
   */,
  WeekNrYear_1: newAttribute("activity.aay81lMifn6q")
  /**
   * Display Form Title: Wk/Qtr/Year (Cont.) (Activity)
   * Display Form ID: activity.aaC81lMifn6q
   */,
  WkQtrYear: newAttribute("activity.aaC81lMifn6q")
  /**
   * Display Form Title: Wk/Qtr/Year (Activity)
   * Display Form ID: activity.aas81lMifn6q
   */,
  WkQtrYear_1: newAttribute("activity.aas81lMifn6q"),
};
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
  Short: newAttribute("activity.abK81lMifn6q")
  /**
   * Display Form Title: Long (Sunday) (Activity)
   * Display Form ID: activity.abO81lMifn6q
   */,
  Long: newAttribute("activity.abO81lMifn6q")
  /**
   * Display Form Title: Number (1=Sunday) (Activity)
   * Display Form ID: activity.abM81lMifn6q
   */,
  Number: newAttribute("activity.abM81lMifn6q"),
};
/**
 * Attribute Title: Week (Sun-Sat) (Activity)
 * Attribute ID: activity.week.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityWeekSunSat: IAttribute = newAttribute("activity.aaI81lMifn6q");
/**
 * Attribute Title: Week (Mon-Sun) of Qtr (Activity)
 * Attribute ID: activity.euweek.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityWeekMonSunOfQtr: IAttribute = newAttribute("activity.abg81lMifn6q");
/**
 * Attribute Title: Day of Quarter (Activity)
 * Attribute ID: activity.day.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityDayOfQuarter: IAttribute = newAttribute("activity.ab481lMifn6q");
/**
 * Attribute Title: Year (Activity)
 * Attribute ID: activity.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityYear: IAttribute = newAttribute("activity.aag81lMifn6q");
/**
 * Attribute Title: Month of Quarter (Activity)
 * Attribute ID: activity.month.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const ActivityMonthOfQuarter: IAttribute = newAttribute("activity.aby81lMifn6q");
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
  MmDdYyyy: newAttribute("timeline.date.mmddyyyy")
  /**
   * Display Form Title: yyyy-mm-dd (Timeline)
   * Display Form ID: timeline.date.yyyymmdd
   */,
  YyyyMmDd: newAttribute("timeline.date.yyyymmdd")
  /**
   * Display Form Title: m/d/yy (no leading zeroes) (Timeline)
   * Display Form ID: timeline.date.mdyy
   */,
  MDYy: newAttribute("timeline.date.mdyy")
  /**
   * Display Form Title: Long (Mon, Jan 1, 2010) (Timeline)
   * Display Form ID: timeline.date.long
   */,
  Long: newAttribute("timeline.date.long")
  /**
   * Display Form Title: dd/mm/yyyy (Timeline)
   * Display Form ID: timeline.date.ddmmyyyy
   */,
  DdMmYyyy: newAttribute("timeline.date.ddmmyyyy")
  /**
   * Display Form Title: dd-mm-yyyy (Timeline)
   * Display Form ID: timeline.date.eddmmyyyy
   */,
  DdMmYyyy_1: newAttribute("timeline.date.eddmmyyyy"),
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
  Short: newAttribute("timeline.abU81lMifn6q")
  /**
   * Display Form Title: Long (Monday) (Timeline)
   * Display Form ID: timeline.abY81lMifn6q
   */,
  Long: newAttribute("timeline.abY81lMifn6q")
  /**
   * Display Form Title: Number (1=Monday) (Timeline)
   * Display Form ID: timeline.abW81lMifn6q
   */,
  Number: newAttribute("timeline.abW81lMifn6q"),
};
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
  Short: newAttribute("timeline.act81lMifn6q")
  /**
   * Display Form Title: Long (January 2010) (Timeline)
   * Display Form ID: timeline.acx81lMifn6q
   */,
  Long: newAttribute("timeline.acx81lMifn6q")
  /**
   * Display Form Title: Number (1/2010) (Timeline)
   * Display Form ID: timeline.acv81lMifn6q
   */,
  Number: newAttribute("timeline.acv81lMifn6q"),
};
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
  Short: newAttribute("timeline.abm81lMifn6q")
  /**
   * Display Form Title: Long (January) (Timeline)
   * Display Form ID: timeline.abs81lMifn6q
   */,
  Long: newAttribute("timeline.abs81lMifn6q")
  /**
   * Display Form Title: Number (M1) (Timeline)
   * Display Form ID: timeline.abq81lMifn6q
   */,
  Number: newAttribute("timeline.abq81lMifn6q")
  /**
   * Display Form Title: M/Q (M1/Q1) (Timeline)
   * Display Form ID: timeline.abo81lMifn6q
   */,
  MQ: newAttribute("timeline.abo81lMifn6q"),
};
/**
 * Attribute Title: Week (Mon-Sun) (Timeline)
 * Attribute ID: timeline.euweek.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineWeekMonSun: IAttribute = newAttribute("timeline.aba81lMifn6q");
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
  WeekNrYear: newAttribute("timeline.aa281lMifn6q")
  /**
   * Display Form Title: Week Starting (Timeline)
   * Display Form ID: timeline.aaY81lMifn6q
   */,
  WeekStarting: newAttribute("timeline.aaY81lMifn6q")
  /**
   * Display Form Title: From - To (Timeline)
   * Display Form ID: timeline.aaW81lMifn6q
   */,
  FromTo: newAttribute("timeline.aaW81lMifn6q")
  /**
   * Display Form Title: Week #/Year (Cont.) (Timeline)
   * Display Form ID: timeline.aa081lMifn6q
   */,
  WeekNrYear_1: newAttribute("timeline.aa081lMifn6q")
  /**
   * Display Form Title: Wk/Qtr/Year (Cont.) (Timeline)
   * Display Form ID: timeline.aa481lMifn6q
   */,
  WkQtrYear: newAttribute("timeline.aa481lMifn6q")
  /**
   * Display Form Title: Wk/Qtr/Year (Timeline)
   * Display Form ID: timeline.aaU81lMifn6q
   */,
  WkQtrYear_1: newAttribute("timeline.aaU81lMifn6q"),
};
/**
 * Attribute Title: Quarter/Year (Timeline)
 * Attribute ID: timeline.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineQuarterYear: IAttribute = newAttribute("timeline.aci81lMifn6q");
/**
 * Attribute Title: Day of Month (Timeline)
 * Attribute ID: timeline.day.in.month
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineDayOfMonth: IAttribute = newAttribute("timeline.aca81lMifn6q");
/**
 * Attribute Title: Week (Sun-Sat) of Qtr (Timeline)
 * Attribute ID: timeline.week.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineWeekSunSatOfQtr: IAttribute = newAttribute("timeline.aaO81lMifn6q");
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
  WeekNrYear: newAttribute("timeline.aaA81lMifn6q")
  /**
   * Display Form Title: Week Starting (Timeline)
   * Display Form ID: timeline.aaw81lMifn6q
   */,
  WeekStarting: newAttribute("timeline.aaw81lMifn6q")
  /**
   * Display Form Title: From - To (Timeline)
   * Display Form ID: timeline.aau81lMifn6q
   */,
  FromTo: newAttribute("timeline.aau81lMifn6q")
  /**
   * Display Form Title: Week #/Year (Cont.) (Timeline)
   * Display Form ID: timeline.aay81lMifn6q
   */,
  WeekNrYear_1: newAttribute("timeline.aay81lMifn6q")
  /**
   * Display Form Title: Wk/Qtr/Year (Cont.) (Timeline)
   * Display Form ID: timeline.aaC81lMifn6q
   */,
  WkQtrYear: newAttribute("timeline.aaC81lMifn6q")
  /**
   * Display Form Title: Wk/Qtr/Year (Timeline)
   * Display Form ID: timeline.aas81lMifn6q
   */,
  WkQtrYear_1: newAttribute("timeline.aas81lMifn6q"),
};
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
  Short: newAttribute("timeline.abK81lMifn6q")
  /**
   * Display Form Title: Long (Sunday) (Timeline)
   * Display Form ID: timeline.abO81lMifn6q
   */,
  Long: newAttribute("timeline.abO81lMifn6q")
  /**
   * Display Form Title: Number (1=Sunday) (Timeline)
   * Display Form ID: timeline.abM81lMifn6q
   */,
  Number: newAttribute("timeline.abM81lMifn6q"),
};
/**
 * Attribute Title: Week (Sun-Sat) (Timeline)
 * Attribute ID: timeline.week.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineWeekSunSat: IAttribute = newAttribute("timeline.aaI81lMifn6q");
/**
 * Attribute Title: Week (Mon-Sun) of Qtr (Timeline)
 * Attribute ID: timeline.euweek.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineWeekMonSunOfQtr: IAttribute = newAttribute("timeline.abg81lMifn6q");
/**
 * Attribute Title: Day of Quarter (Timeline)
 * Attribute ID: timeline.day.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineDayOfQuarter: IAttribute = newAttribute("timeline.ab481lMifn6q");
/**
 * Attribute Title: Year (Timeline)
 * Attribute ID: timeline.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineYear: IAttribute = newAttribute("timeline.aag81lMifn6q");
/**
 * Attribute Title: Month of Quarter (Timeline)
 * Attribute ID: timeline.month.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const TimelineMonthOfQuarter: IAttribute = newAttribute("timeline.aby81lMifn6q");
/**
 * Attribute Title: Year (Date 1)
 * Attribute ID: date_1.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const Date1Year: IAttribute = newAttribute("date_1.year.default");
/**
 * Attribute Title: Quarter (Date 1)
 * Attribute ID: date_1.quarter.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const Date1Quarter: IAttribute = newAttribute("date_1.quarter.in.year.default");
/**
 * Attribute Title: Week (Sun-Sat)/Year (Date 1)
 * Attribute ID: date_1.week
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const Date1WeekSunSatYear = {
  /**
   * Display Form Title: Week #/Year (W1/2010) (Date 1)
   * Display Form ID: date_1.week.wk_year
   */
  WeekNrYear: newAttribute("date_1.week.wk_year")
  /**
   * Display Form Title: Week Starting (Date 1)
   * Display Form ID: date_1.week.starting
   */,
  WeekStarting: newAttribute("date_1.week.starting")
  /**
   * Display Form Title: From - To (Date 1)
   * Display Form ID: date_1.week.from_to
   */,
  FromTo: newAttribute("date_1.week.from_to")
  /**
   * Display Form Title: Week #/Year (Cont.) (Date 1)
   * Display Form ID: date_1.week.wk_year_cont
   */,
  WeekNrYear_1: newAttribute("date_1.week.wk_year_cont")
  /**
   * Display Form Title: Wk/Qtr/Year (Cont.) (Date 1)
   * Display Form ID: date_1.week.wk_qtr_year_cont
   */,
  WkQtrYear: newAttribute("date_1.week.wk_qtr_year_cont")
  /**
   * Display Form Title: Wk/Qtr/Year (Date 1)
   * Display Form ID: date_1.week.wk_qtr_year
   */,
  WkQtrYear_1: newAttribute("date_1.week.wk_qtr_year"),
};
/**
 * Attribute Title: Week (Sun-Sat) (Date 1)
 * Attribute ID: date_1.week.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const Date1WeekSunSat: IAttribute = newAttribute("date_1.week.in.year.number_us");
/**
 * Attribute Title: Week (Sun-Sat) of Qtr (Date 1)
 * Attribute ID: date_1.week.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const Date1WeekSunSatOfQtr: IAttribute = newAttribute("date_1.week.in.quarter.number_us");
/**
 * Attribute Title: Week (Mon-Sun)/Year (Date 1)
 * Attribute ID: date_1.euweek
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const Date1WeekMonSunYear = {
  /**
   * Display Form Title: Week #/Year (W1/2010) (Date 1)
   * Display Form ID: date_1.euweek.wk_year
   */
  WeekNrYear: newAttribute("date_1.euweek.wk_year")
  /**
   * Display Form Title: Week Starting (Date 1)
   * Display Form ID: date_1.euweek.starting
   */,
  WeekStarting: newAttribute("date_1.euweek.starting")
  /**
   * Display Form Title: From - To (Date 1)
   * Display Form ID: date_1.euweek.from_to
   */,
  FromTo: newAttribute("date_1.euweek.from_to"),
};
/**
 * Attribute Title: Week (Mon-Sun) (Date 1)
 * Attribute ID: date_1.euweek.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const Date1WeekMonSun: IAttribute = newAttribute("date_1.euweek.in.year.number_eu");
/**
 * Attribute Title: Week (Mon-Sun) of Qtr (Date 1)
 * Attribute ID: date_1.euweek.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const Date1WeekMonSunOfQtr: IAttribute = newAttribute("date_1.euweek.in.quarter.number_eu");
/**
 * Attribute Title: Month (Date 1)
 * Attribute ID: date_1.month.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const Date1Month = {
  /**
   * Display Form Title: Short (Jan) (Date 1)
   * Display Form ID: date_1.month.in.year.short
   */
  Short: newAttribute("date_1.month.in.year.short")
  /**
   * Display Form Title: Long (January) (Date 1)
   * Display Form ID: date_1.month.in.year.long
   */,
  Long: newAttribute("date_1.month.in.year.long")
  /**
   * Display Form Title: Number (M1) (Date 1)
   * Display Form ID: date_1.month.in.year.number
   */,
  Number: newAttribute("date_1.month.in.year.number")
  /**
   * Display Form Title: M/Q (M1/Q1) (Date 1)
   * Display Form ID: date_1.month.in.year.m_q
   */,
  MQ: newAttribute("date_1.month.in.year.m_q"),
};
/**
 * Attribute Title: Month of Quarter (Date 1)
 * Attribute ID: date_1.month.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const Date1MonthOfQuarter: IAttribute = newAttribute("date_1.month.in.quarter.number");
/**
 * Attribute Title: Day of Year (Date 1)
 * Attribute ID: date_1.day.in.year
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const Date1DayOfYear: IAttribute = newAttribute("date_1.day.in.year.default");
/**
 * Attribute Title: Day of Week (Sun-Sat) (Date 1)
 * Attribute ID: date_1.day.in.week
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const Date1DayOfWeekSunSat = {
  /**
   * Display Form Title: Short (Sun) (Date 1)
   * Display Form ID: date_1.day.in.week.short
   */
  Short: newAttribute("date_1.day.in.week.short")
  /**
   * Display Form Title: Long (Sunday) (Date 1)
   * Display Form ID: date_1.day.in.week.long
   */,
  Long: newAttribute("date_1.day.in.week.long")
  /**
   * Display Form Title: Number (1=Sunday) (Date 1)
   * Display Form ID: date_1.day.in.week.number
   */,
  Number: newAttribute("date_1.day.in.week.number"),
};
/**
 * Attribute Title: Day of Week (Mon-Sun) (Date 1)
 * Attribute ID: date_1.day.in.euweek
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const Date1DayOfWeekMonSun = {
  /**
   * Display Form Title: Short (Mon) (Date 1)
   * Display Form ID: date_1.day.in.euweek.short
   */
  Short: newAttribute("date_1.day.in.euweek.short")
  /**
   * Display Form Title: Long (Monday) (Date 1)
   * Display Form ID: date_1.day.in.euweek.long
   */,
  Long: newAttribute("date_1.day.in.euweek.long")
  /**
   * Display Form Title: Number (1=Monday) (Date 1)
   * Display Form ID: date_1.day.in.euweek.number
   */,
  Number: newAttribute("date_1.day.in.euweek.number"),
};
/**
 * Attribute Title: Day of Quarter (Date 1)
 * Attribute ID: date_1.day.in.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const Date1DayOfQuarter: IAttribute = newAttribute("date_1.day.in.quarter.default");
/**
 * Attribute Title: Day of Month (Date 1)
 * Attribute ID: date_1.day.in.month
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const Date1DayOfMonth: IAttribute = newAttribute("date_1.day.in.month.default");
/**
 * Attribute Title: Quarter/Year (Date 1)
 * Attribute ID: date_1.quarter
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const Date1QuarterYear: IAttribute = newAttribute("date_1.quarter.short_us");
/**
 * Attribute Title: Month/Year (Date 1)
 * Attribute ID: date_1.month
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const Date1MonthYear = {
  /**
   * Display Form Title: Short (Jan 2010) (Date 1)
   * Display Form ID: date_1.month.short
   */
  Short: newAttribute("date_1.month.short")
  /**
   * Display Form Title: Long (January 2010) (Date 1)
   * Display Form ID: date_1.month.long
   */,
  Long: newAttribute("date_1.month.long")
  /**
   * Display Form Title: Number (1/2010) (Date 1)
   * Display Form ID: date_1.month.number
   */,
  Number: newAttribute("date_1.month.number"),
};
/**
 * Attribute Title: Date (Date 1)
 * Attribute ID: date_1.date
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const Date1Date = {
  /**
   * Display Form Title: mm/dd/yyyy (Date 1)
   * Display Form ID: date_1.date.day.us.mm_dd_yyyy
   */
  MmDdYyyy: newAttribute("date_1.date.day.us.mm_dd_yyyy")
  /**
   * Display Form Title: yyyy-mm-dd (Date 1)
   * Display Form ID: date_1.date.day.yyyy_mm_dd
   */,
  YyyyMmDd: newAttribute("date_1.date.day.yyyy_mm_dd")
  /**
   * Display Form Title: m/d/yy (no leading zeroes) (Date 1)
   * Display Form ID: date_1.date.day.us.m_d_yy
   */,
  MDYy: newAttribute("date_1.date.day.us.m_d_yy")
  /**
   * Display Form Title: Long (Mon, Jan 1, 2010) (Date 1)
   * Display Form ID: date_1.date.day.us.long
   */,
  Long: newAttribute("date_1.date.day.us.long")
  /**
   * Display Form Title: dd/mm/yyyy (Date 1)
   * Display Form ID: date_1.date.day.uk.dd_mm_yyyy
   */,
  DdMmYyyy: newAttribute("date_1.date.day.uk.dd_mm_yyyy")
  /**
   * Display Form Title: dd-mm-yyyy (Date 1)
   * Display Form ID: date_1.date.day.eu.dd_mm_yyyy
   */,
  DdMmYyyy_1: newAttribute("date_1.date.day.eu.dd_mm_yyyy"),
};
/**
 * Attribute Title: US Week Year (Date 1)
 * Attribute ID: date_1.year.for.week
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const Date1USWeekYear: IAttribute = newAttribute("date_1.year.for.week.number");
/**
 * Attribute Title: EU Week Year (Date 1)
 * Attribute ID: date_1.year.for.euweek
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const Date1EUWeekYear: IAttribute = newAttribute("date_1.year.for.euweek.number");
/**
 * Attribute Title: US Week Quarter (Date 1)
 * Attribute ID: date_1.quarter.for.week
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const Date1USWeekQuarter: IAttribute = newAttribute("date_1.quarter.for.week.number");
/**
 * Attribute Title: EU Week Quarter (Date 1)
 * Attribute ID: date_1.quarter.for.euweek
 * @deprecated constants generated for date attributes are deprecated in favor of DateDatasets mapping
 */
export const Date1EUWeekQuarter: IAttribute = newAttribute("date_1.quarter.for.euweek.number");
/** Available Date Data Sets */
export const DateDatasets = {
  /**
   * Date Data Set Title: Date (Created)
   * Date Data Set ID: created.dataset.dt
   */
  Created: {
    ref: idRef("created.dataset.dt", "dataSet"),
    identifier: "created.dataset.dt"
    /**
     * Date Attribute: Date (Created)
     * Date Attribute ID: created.date
     */,
    Date: {
      ref: idRef("created.date", "attribute"),
      identifier: "created.date"
      /**
       * Display Form Title: mm/dd/yyyy (Created)
       * Display Form ID: created.date.mmddyyyy
       */,
      MmDdYyyy: newAttribute("created.date.mmddyyyy")
      /**
       * Display Form Title: yyyy-mm-dd (Created)
       * Display Form ID: created.date.yyyymmdd
       */,
      YyyyMmDd: newAttribute("created.date.yyyymmdd")
      /**
       * Display Form Title: m/d/yy (no leading zeroes) (Created)
       * Display Form ID: created.date.mdyy
       */,
      MDYy: newAttribute("created.date.mdyy")
      /**
       * Display Form Title: Long (Mon, Jan 1, 2010) (Created)
       * Display Form ID: created.date.long
       */,
      Long: newAttribute("created.date.long")
      /**
       * Display Form Title: dd/mm/yyyy (Created)
       * Display Form ID: created.date.ddmmyyyy
       */,
      DdMmYyyy: newAttribute("created.date.ddmmyyyy")
      /**
       * Display Form Title: dd-mm-yyyy (Created)
       * Display Form ID: created.date.eddmmyyyy
       */,
      DdMmYyyy_1: newAttribute("created.date.eddmmyyyy"),
    }
    /**
     * Date Attribute: Day of Week (Mon-Sun) (Created)
     * Date Attribute ID: created.day.in.euweek
     */,
    DayOfWeekMonSun: {
      ref: idRef("created.day.in.euweek", "attribute"),
      identifier: "created.day.in.euweek"
      /**
       * Display Form Title: Short (Mon) (Created)
       * Display Form ID: created.abU81lMifn6q
       */,
      Short: newAttribute("created.abU81lMifn6q")
      /**
       * Display Form Title: Long (Monday) (Created)
       * Display Form ID: created.abY81lMifn6q
       */,
      Long: newAttribute("created.abY81lMifn6q")
      /**
       * Display Form Title: Number (1=Monday) (Created)
       * Display Form ID: created.abW81lMifn6q
       */,
      Number: newAttribute("created.abW81lMifn6q"),
    }
    /**
     * Date Attribute: Month/Year (Created)
     * Date Attribute ID: created.month
     */,
    MonthYear: {
      ref: idRef("created.month", "attribute"),
      identifier: "created.month"
      /**
       * Display Form Title: Short (Jan 2010) (Created)
       * Display Form ID: created.act81lMifn6q
       */,
      Short: newAttribute("created.act81lMifn6q")
      /**
       * Display Form Title: Long (January 2010) (Created)
       * Display Form ID: created.acx81lMifn6q
       */,
      Long: newAttribute("created.acx81lMifn6q")
      /**
       * Display Form Title: Number (1/2010) (Created)
       * Display Form ID: created.acv81lMifn6q
       */,
      Number: newAttribute("created.acv81lMifn6q"),
    }
    /**
     * Date Attribute: Month (Created)
     * Date Attribute ID: created.month.in.year
     */,
    Month: {
      ref: idRef("created.month.in.year", "attribute"),
      identifier: "created.month.in.year"
      /**
       * Display Form Title: Short (Jan) (Created)
       * Display Form ID: created.abm81lMifn6q
       */,
      Short: newAttribute("created.abm81lMifn6q")
      /**
       * Display Form Title: Long (January) (Created)
       * Display Form ID: created.abs81lMifn6q
       */,
      Long: newAttribute("created.abs81lMifn6q")
      /**
       * Display Form Title: Number (M1) (Created)
       * Display Form ID: created.abq81lMifn6q
       */,
      Number: newAttribute("created.abq81lMifn6q")
      /**
       * Display Form Title: M/Q (M1/Q1) (Created)
       * Display Form ID: created.abo81lMifn6q
       */,
      MQ: newAttribute("created.abo81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Mon-Sun) (Created)
     * Date Attribute ID: created.euweek.in.year
     */,
    WeekMonSun: {
      ref: idRef("created.euweek.in.year", "attribute"),
      identifier: "created.euweek.in.year"
      /**
       * Display Form Title: Number EU (Created)
       * Display Form ID: created.aba81lMifn6q
       */,
      NumberEU: newAttribute("created.aba81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Mon-Sun)/Year (Created)
     * Date Attribute ID: created.euweek
     */,
    WeekMonSunYear: {
      ref: idRef("created.euweek", "attribute"),
      identifier: "created.euweek"
      /**
       * Display Form Title: Week #/Year (W1/2010) (Created)
       * Display Form ID: created.aa281lMifn6q
       */,
      WeekNrYear: newAttribute("created.aa281lMifn6q")
      /**
       * Display Form Title: Week Starting (Created)
       * Display Form ID: created.aaY81lMifn6q
       */,
      WeekStarting: newAttribute("created.aaY81lMifn6q")
      /**
       * Display Form Title: From - To (Created)
       * Display Form ID: created.aaW81lMifn6q
       */,
      FromTo: newAttribute("created.aaW81lMifn6q")
      /**
       * Display Form Title: Week #/Year (Cont.) (Created)
       * Display Form ID: created.aa081lMifn6q
       */,
      WeekNrYear_1: newAttribute("created.aa081lMifn6q")
      /**
       * Display Form Title: Wk/Qtr/Year (Cont.) (Created)
       * Display Form ID: created.aa481lMifn6q
       */,
      WkQtrYear: newAttribute("created.aa481lMifn6q")
      /**
       * Display Form Title: Wk/Qtr/Year (Created)
       * Display Form ID: created.aaU81lMifn6q
       */,
      WkQtrYear_1: newAttribute("created.aaU81lMifn6q"),
    }
    /**
     * Date Attribute: Quarter/Year (Created)
     * Date Attribute ID: created.quarter
     */,
    QuarterYear: {
      ref: idRef("created.quarter", "attribute"),
      identifier: "created.quarter"
      /**
       * Display Form Title: US Short (Created)
       * Display Form ID: created.aci81lMifn6q
       */,
      USShort: newAttribute("created.aci81lMifn6q"),
    }
    /**
     * Date Attribute: Day of Month (Created)
     * Date Attribute ID: created.day.in.month
     */,
    DayOfMonth: {
      ref: idRef("created.day.in.month", "attribute"),
      identifier: "created.day.in.month"
      /**
       * Display Form Title: default (Created)
       * Display Form ID: created.aca81lMifn6q
       */,
      Default: newAttribute("created.aca81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Sun-Sat) of Qtr (Created)
     * Date Attribute ID: created.week.in.quarter
     */,
    WeekSunSatOfQtr: {
      ref: idRef("created.week.in.quarter", "attribute"),
      identifier: "created.week.in.quarter"
      /**
       * Display Form Title: Number US (Created)
       * Display Form ID: created.aaO81lMifn6q
       */,
      NumberUS: newAttribute("created.aaO81lMifn6q"),
    }
    /**
     * Date Attribute: Quarter (Created)
     * Date Attribute ID: created.quarter.in.year
     */,
    Quarter: {
      ref: idRef("created.quarter.in.year", "attribute"),
      identifier: "created.quarter.in.year"
      /**
       * Display Form Title: default (Created)
       * Display Form ID: created.aam81lMifn6q
       */,
      Default: newAttribute("created.aam81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Sun-Sat)/Year (Created)
     * Date Attribute ID: created.week
     */,
    WeekSunSatYear: {
      ref: idRef("created.week", "attribute"),
      identifier: "created.week"
      /**
       * Display Form Title: Week #/Year (W1/2010) (Created)
       * Display Form ID: created.aaA81lMifn6q
       */,
      WeekNrYear: newAttribute("created.aaA81lMifn6q")
      /**
       * Display Form Title: Week Starting (Created)
       * Display Form ID: created.aaw81lMifn6q
       */,
      WeekStarting: newAttribute("created.aaw81lMifn6q")
      /**
       * Display Form Title: From - To (Created)
       * Display Form ID: created.aau81lMifn6q
       */,
      FromTo: newAttribute("created.aau81lMifn6q")
      /**
       * Display Form Title: Week #/Year (Cont.) (Created)
       * Display Form ID: created.aay81lMifn6q
       */,
      WeekNrYear_1: newAttribute("created.aay81lMifn6q")
      /**
       * Display Form Title: Wk/Qtr/Year (Cont.) (Created)
       * Display Form ID: created.aaC81lMifn6q
       */,
      WkQtrYear: newAttribute("created.aaC81lMifn6q")
      /**
       * Display Form Title: Wk/Qtr/Year (Created)
       * Display Form ID: created.aas81lMifn6q
       */,
      WkQtrYear_1: newAttribute("created.aas81lMifn6q"),
    }
    /**
     * Date Attribute: Day of Year (Created)
     * Date Attribute ID: created.day.in.year
     */,
    DayOfYear: {
      ref: idRef("created.day.in.year", "attribute"),
      identifier: "created.day.in.year"
      /**
       * Display Form Title: default (Created)
       * Display Form ID: created.abE81lMifn6q
       */,
      Default: newAttribute("created.abE81lMifn6q"),
    }
    /**
     * Date Attribute: Day of Week (Sun-Sat) (Created)
     * Date Attribute ID: created.day.in.week
     */,
    DayOfWeekSunSat: {
      ref: idRef("created.day.in.week", "attribute"),
      identifier: "created.day.in.week"
      /**
       * Display Form Title: Short (Sun) (Created)
       * Display Form ID: created.abK81lMifn6q
       */,
      Short: newAttribute("created.abK81lMifn6q")
      /**
       * Display Form Title: Long (Sunday) (Created)
       * Display Form ID: created.abO81lMifn6q
       */,
      Long: newAttribute("created.abO81lMifn6q")
      /**
       * Display Form Title: Number (1=Sunday) (Created)
       * Display Form ID: created.abM81lMifn6q
       */,
      Number: newAttribute("created.abM81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Sun-Sat) (Created)
     * Date Attribute ID: created.week.in.year
     */,
    WeekSunSat: {
      ref: idRef("created.week.in.year", "attribute"),
      identifier: "created.week.in.year"
      /**
       * Display Form Title: Number US (Created)
       * Display Form ID: created.aaI81lMifn6q
       */,
      NumberUS: newAttribute("created.aaI81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Mon-Sun) of Qtr (Created)
     * Date Attribute ID: created.euweek.in.quarter
     */,
    WeekMonSunOfQtr: {
      ref: idRef("created.euweek.in.quarter", "attribute"),
      identifier: "created.euweek.in.quarter"
      /**
       * Display Form Title: Number EU (Created)
       * Display Form ID: created.abg81lMifn6q
       */,
      NumberEU: newAttribute("created.abg81lMifn6q"),
    }
    /**
     * Date Attribute: Day of Quarter (Created)
     * Date Attribute ID: created.day.in.quarter
     */,
    DayOfQuarter: {
      ref: idRef("created.day.in.quarter", "attribute"),
      identifier: "created.day.in.quarter"
      /**
       * Display Form Title: default (Created)
       * Display Form ID: created.ab481lMifn6q
       */,
      Default: newAttribute("created.ab481lMifn6q"),
    }
    /**
     * Date Attribute: Year (Created)
     * Date Attribute ID: created.year
     */,
    Year: {
      ref: idRef("created.year", "attribute"),
      identifier: "created.year"
      /**
       * Display Form Title: Year (Created)
       * Display Form ID: created.aag81lMifn6q
       */,
      Default: newAttribute("created.aag81lMifn6q"),
    }
    /**
     * Date Attribute: Month of Quarter (Created)
     * Date Attribute ID: created.month.in.quarter
     */,
    MonthOfQuarter: {
      ref: idRef("created.month.in.quarter", "attribute"),
      identifier: "created.month.in.quarter"
      /**
       * Display Form Title: Number (Created)
       * Display Form ID: created.aby81lMifn6q
       */,
      Number: newAttribute("created.aby81lMifn6q"),
    },
  }
  /**
   * Date Data Set Title: Date (Closed)
   * Date Data Set ID: closed.dataset.dt
   */,
  Closed: {
    ref: idRef("closed.dataset.dt", "dataSet"),
    identifier: "closed.dataset.dt"
    /**
     * Date Attribute: Date (Closed)
     * Date Attribute ID: closed.date
     */,
    Date: {
      ref: idRef("closed.date", "attribute"),
      identifier: "closed.date"
      /**
       * Display Form Title: mm/dd/yyyy (Closed)
       * Display Form ID: closed.date.mmddyyyy
       */,
      MmDdYyyy: newAttribute("closed.date.mmddyyyy")
      /**
       * Display Form Title: yyyy-mm-dd (Closed)
       * Display Form ID: closed.date.yyyymmdd
       */,
      YyyyMmDd: newAttribute("closed.date.yyyymmdd")
      /**
       * Display Form Title: m/d/yy (no leading zeroes) (Closed)
       * Display Form ID: closed.date.mdyy
       */,
      MDYy: newAttribute("closed.date.mdyy")
      /**
       * Display Form Title: Long (Mon, Jan 1, 2010) (Closed)
       * Display Form ID: closed.date.long
       */,
      Long: newAttribute("closed.date.long")
      /**
       * Display Form Title: dd/mm/yyyy (Closed)
       * Display Form ID: closed.date.ddmmyyyy
       */,
      DdMmYyyy: newAttribute("closed.date.ddmmyyyy")
      /**
       * Display Form Title: dd-mm-yyyy (Closed)
       * Display Form ID: closed.date.eddmmyyyy
       */,
      DdMmYyyy_1: newAttribute("closed.date.eddmmyyyy"),
    }
    /**
     * Date Attribute: Day of Week (Mon-Sun) (Closed)
     * Date Attribute ID: closed.day.in.euweek
     */,
    DayOfWeekMonSun: {
      ref: idRef("closed.day.in.euweek", "attribute"),
      identifier: "closed.day.in.euweek"
      /**
       * Display Form Title: Short (Mon) (Closed)
       * Display Form ID: closed.abU81lMifn6q
       */,
      Short: newAttribute("closed.abU81lMifn6q")
      /**
       * Display Form Title: Long (Monday) (Closed)
       * Display Form ID: closed.abY81lMifn6q
       */,
      Long: newAttribute("closed.abY81lMifn6q")
      /**
       * Display Form Title: Number (1=Monday) (Closed)
       * Display Form ID: closed.abW81lMifn6q
       */,
      Number: newAttribute("closed.abW81lMifn6q"),
    }
    /**
     * Date Attribute: Month/Year (Closed)
     * Date Attribute ID: closed.month
     */,
    MonthYear: {
      ref: idRef("closed.month", "attribute"),
      identifier: "closed.month"
      /**
       * Display Form Title: Short (Jan 2010) (Closed)
       * Display Form ID: closed.act81lMifn6q
       */,
      Short: newAttribute("closed.act81lMifn6q")
      /**
       * Display Form Title: Long (January 2010) (Closed)
       * Display Form ID: closed.acx81lMifn6q
       */,
      Long: newAttribute("closed.acx81lMifn6q")
      /**
       * Display Form Title: Number (1/2010) (Closed)
       * Display Form ID: closed.acv81lMifn6q
       */,
      Number: newAttribute("closed.acv81lMifn6q"),
    }
    /**
     * Date Attribute: Month (Closed)
     * Date Attribute ID: closed.month.in.year
     */,
    Month: {
      ref: idRef("closed.month.in.year", "attribute"),
      identifier: "closed.month.in.year"
      /**
       * Display Form Title: Short (Jan) (Closed)
       * Display Form ID: closed.abm81lMifn6q
       */,
      Short: newAttribute("closed.abm81lMifn6q")
      /**
       * Display Form Title: Long (January) (Closed)
       * Display Form ID: closed.abs81lMifn6q
       */,
      Long: newAttribute("closed.abs81lMifn6q")
      /**
       * Display Form Title: Number (M1) (Closed)
       * Display Form ID: closed.abq81lMifn6q
       */,
      Number: newAttribute("closed.abq81lMifn6q")
      /**
       * Display Form Title: M/Q (M1/Q1) (Closed)
       * Display Form ID: closed.abo81lMifn6q
       */,
      MQ: newAttribute("closed.abo81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Mon-Sun) (Closed)
     * Date Attribute ID: closed.euweek.in.year
     */,
    WeekMonSun: {
      ref: idRef("closed.euweek.in.year", "attribute"),
      identifier: "closed.euweek.in.year"
      /**
       * Display Form Title: Number EU (Closed)
       * Display Form ID: closed.aba81lMifn6q
       */,
      NumberEU: newAttribute("closed.aba81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Mon-Sun)/Year (Closed)
     * Date Attribute ID: closed.euweek
     */,
    WeekMonSunYear: {
      ref: idRef("closed.euweek", "attribute"),
      identifier: "closed.euweek"
      /**
       * Display Form Title: Week #/Year (W1/2010) (Closed)
       * Display Form ID: closed.aa281lMifn6q
       */,
      WeekNrYear: newAttribute("closed.aa281lMifn6q")
      /**
       * Display Form Title: Week Starting (Closed)
       * Display Form ID: closed.aaY81lMifn6q
       */,
      WeekStarting: newAttribute("closed.aaY81lMifn6q")
      /**
       * Display Form Title: From - To (Closed)
       * Display Form ID: closed.aaW81lMifn6q
       */,
      FromTo: newAttribute("closed.aaW81lMifn6q")
      /**
       * Display Form Title: Week #/Year (Cont.) (Closed)
       * Display Form ID: closed.aa081lMifn6q
       */,
      WeekNrYear_1: newAttribute("closed.aa081lMifn6q")
      /**
       * Display Form Title: Wk/Qtr/Year (Cont.) (Closed)
       * Display Form ID: closed.aa481lMifn6q
       */,
      WkQtrYear: newAttribute("closed.aa481lMifn6q")
      /**
       * Display Form Title: Wk/Qtr/Year (Closed)
       * Display Form ID: closed.aaU81lMifn6q
       */,
      WkQtrYear_1: newAttribute("closed.aaU81lMifn6q"),
    }
    /**
     * Date Attribute: Quarter/Year (Closed)
     * Date Attribute ID: closed.quarter
     */,
    QuarterYear: {
      ref: idRef("closed.quarter", "attribute"),
      identifier: "closed.quarter"
      /**
       * Display Form Title: US Short (Closed)
       * Display Form ID: closed.aci81lMifn6q
       */,
      USShort: newAttribute("closed.aci81lMifn6q"),
    }
    /**
     * Date Attribute: Day of Month (Closed)
     * Date Attribute ID: closed.day.in.month
     */,
    DayOfMonth: {
      ref: idRef("closed.day.in.month", "attribute"),
      identifier: "closed.day.in.month"
      /**
       * Display Form Title: default (Closed)
       * Display Form ID: closed.aca81lMifn6q
       */,
      Default: newAttribute("closed.aca81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Sun-Sat) of Qtr (Closed)
     * Date Attribute ID: closed.week.in.quarter
     */,
    WeekSunSatOfQtr: {
      ref: idRef("closed.week.in.quarter", "attribute"),
      identifier: "closed.week.in.quarter"
      /**
       * Display Form Title: Number US (Closed)
       * Display Form ID: closed.aaO81lMifn6q
       */,
      NumberUS: newAttribute("closed.aaO81lMifn6q"),
    }
    /**
     * Date Attribute: Quarter (Closed)
     * Date Attribute ID: closed.quarter.in.year
     */,
    Quarter: {
      ref: idRef("closed.quarter.in.year", "attribute"),
      identifier: "closed.quarter.in.year"
      /**
       * Display Form Title: default (Closed)
       * Display Form ID: closed.aam81lMifn6q
       */,
      Default: newAttribute("closed.aam81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Sun-Sat)/Year (Closed)
     * Date Attribute ID: closed.week
     */,
    WeekSunSatYear: {
      ref: idRef("closed.week", "attribute"),
      identifier: "closed.week"
      /**
       * Display Form Title: Week #/Year (W1/2010) (Closed)
       * Display Form ID: closed.aaA81lMifn6q
       */,
      WeekNrYear: newAttribute("closed.aaA81lMifn6q")
      /**
       * Display Form Title: Week Starting (Closed)
       * Display Form ID: closed.aaw81lMifn6q
       */,
      WeekStarting: newAttribute("closed.aaw81lMifn6q")
      /**
       * Display Form Title: From - To (Closed)
       * Display Form ID: closed.aau81lMifn6q
       */,
      FromTo: newAttribute("closed.aau81lMifn6q")
      /**
       * Display Form Title: Week #/Year (Cont.) (Closed)
       * Display Form ID: closed.aay81lMifn6q
       */,
      WeekNrYear_1: newAttribute("closed.aay81lMifn6q")
      /**
       * Display Form Title: Wk/Qtr/Year (Cont.) (Closed)
       * Display Form ID: closed.aaC81lMifn6q
       */,
      WkQtrYear: newAttribute("closed.aaC81lMifn6q")
      /**
       * Display Form Title: Wk/Qtr/Year (Closed)
       * Display Form ID: closed.aas81lMifn6q
       */,
      WkQtrYear_1: newAttribute("closed.aas81lMifn6q"),
    }
    /**
     * Date Attribute: Day of Year (Closed)
     * Date Attribute ID: closed.day.in.year
     */,
    DayOfYear: {
      ref: idRef("closed.day.in.year", "attribute"),
      identifier: "closed.day.in.year"
      /**
       * Display Form Title: default (Closed)
       * Display Form ID: closed.abE81lMifn6q
       */,
      Default: newAttribute("closed.abE81lMifn6q"),
    }
    /**
     * Date Attribute: Day of Week (Sun-Sat) (Closed)
     * Date Attribute ID: closed.day.in.week
     */,
    DayOfWeekSunSat: {
      ref: idRef("closed.day.in.week", "attribute"),
      identifier: "closed.day.in.week"
      /**
       * Display Form Title: Short (Sun) (Closed)
       * Display Form ID: closed.abK81lMifn6q
       */,
      Short: newAttribute("closed.abK81lMifn6q")
      /**
       * Display Form Title: Long (Sunday) (Closed)
       * Display Form ID: closed.abO81lMifn6q
       */,
      Long: newAttribute("closed.abO81lMifn6q")
      /**
       * Display Form Title: Number (1=Sunday) (Closed)
       * Display Form ID: closed.abM81lMifn6q
       */,
      Number: newAttribute("closed.abM81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Sun-Sat) (Closed)
     * Date Attribute ID: closed.week.in.year
     */,
    WeekSunSat: {
      ref: idRef("closed.week.in.year", "attribute"),
      identifier: "closed.week.in.year"
      /**
       * Display Form Title: Number US (Closed)
       * Display Form ID: closed.aaI81lMifn6q
       */,
      NumberUS: newAttribute("closed.aaI81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Mon-Sun) of Qtr (Closed)
     * Date Attribute ID: closed.euweek.in.quarter
     */,
    WeekMonSunOfQtr: {
      ref: idRef("closed.euweek.in.quarter", "attribute"),
      identifier: "closed.euweek.in.quarter"
      /**
       * Display Form Title: Number EU (Closed)
       * Display Form ID: closed.abg81lMifn6q
       */,
      NumberEU: newAttribute("closed.abg81lMifn6q"),
    }
    /**
     * Date Attribute: Day of Quarter (Closed)
     * Date Attribute ID: closed.day.in.quarter
     */,
    DayOfQuarter: {
      ref: idRef("closed.day.in.quarter", "attribute"),
      identifier: "closed.day.in.quarter"
      /**
       * Display Form Title: default (Closed)
       * Display Form ID: closed.ab481lMifn6q
       */,
      Default: newAttribute("closed.ab481lMifn6q"),
    }
    /**
     * Date Attribute: Year (Closed)
     * Date Attribute ID: closed.year
     */,
    Year: {
      ref: idRef("closed.year", "attribute"),
      identifier: "closed.year"
      /**
       * Display Form Title: Year (Closed)
       * Display Form ID: closed.aag81lMifn6q
       */,
      Default: newAttribute("closed.aag81lMifn6q"),
    }
    /**
     * Date Attribute: Month of Quarter (Closed)
     * Date Attribute ID: closed.month.in.quarter
     */,
    MonthOfQuarter: {
      ref: idRef("closed.month.in.quarter", "attribute"),
      identifier: "closed.month.in.quarter"
      /**
       * Display Form Title: Number (Closed)
       * Display Form ID: closed.aby81lMifn6q
       */,
      Number: newAttribute("closed.aby81lMifn6q"),
    },
  }
  /**
   * Date Data Set Title: Date (Snapshot)
   * Date Data Set ID: snapshot.dataset.dt
   */,
  Snapshot: {
    ref: idRef("snapshot.dataset.dt", "dataSet"),
    identifier: "snapshot.dataset.dt"
    /**
     * Date Attribute: Date (Snapshot)
     * Date Attribute ID: snapshot.date
     */,
    Date: {
      ref: idRef("snapshot.date", "attribute"),
      identifier: "snapshot.date"
      /**
       * Display Form Title: mm/dd/yyyy (Snapshot)
       * Display Form ID: snapshot.date.mmddyyyy
       */,
      MmDdYyyy: newAttribute("snapshot.date.mmddyyyy")
      /**
       * Display Form Title: yyyy-mm-dd (Snapshot)
       * Display Form ID: snapshot.date.yyyymmdd
       */,
      YyyyMmDd: newAttribute("snapshot.date.yyyymmdd")
      /**
       * Display Form Title: m/d/yy (no leading zeroes) (Snapshot)
       * Display Form ID: snapshot.date.mdyy
       */,
      MDYy: newAttribute("snapshot.date.mdyy")
      /**
       * Display Form Title: Long (Mon, Jan 1, 2010) (Snapshot)
       * Display Form ID: snapshot.date.long
       */,
      Long: newAttribute("snapshot.date.long")
      /**
       * Display Form Title: dd/mm/yyyy (Snapshot)
       * Display Form ID: snapshot.date.ddmmyyyy
       */,
      DdMmYyyy: newAttribute("snapshot.date.ddmmyyyy")
      /**
       * Display Form Title: dd-mm-yyyy (Snapshot)
       * Display Form ID: snapshot.date.eddmmyyyy
       */,
      DdMmYyyy_1: newAttribute("snapshot.date.eddmmyyyy"),
    }
    /**
     * Date Attribute: Day of Week (Mon-Sun) (Snapshot)
     * Date Attribute ID: snapshot.day.in.euweek
     */,
    DayOfWeekMonSun: {
      ref: idRef("snapshot.day.in.euweek", "attribute"),
      identifier: "snapshot.day.in.euweek"
      /**
       * Display Form Title: Short (Mon) (Snapshot)
       * Display Form ID: snapshot.abU81lMifn6q
       */,
      Short: newAttribute("snapshot.abU81lMifn6q")
      /**
       * Display Form Title: Long (Monday) (Snapshot)
       * Display Form ID: snapshot.abY81lMifn6q
       */,
      Long: newAttribute("snapshot.abY81lMifn6q")
      /**
       * Display Form Title: Number (1=Monday) (Snapshot)
       * Display Form ID: snapshot.abW81lMifn6q
       */,
      Number: newAttribute("snapshot.abW81lMifn6q"),
    }
    /**
     * Date Attribute: Month/Year (Snapshot)
     * Date Attribute ID: snapshot.month
     */,
    MonthYear: {
      ref: idRef("snapshot.month", "attribute"),
      identifier: "snapshot.month"
      /**
       * Display Form Title: Short (Jan 2010) (Snapshot)
       * Display Form ID: snapshot.act81lMifn6q
       */,
      Short: newAttribute("snapshot.act81lMifn6q")
      /**
       * Display Form Title: Long (January 2010) (Snapshot)
       * Display Form ID: snapshot.acx81lMifn6q
       */,
      Long: newAttribute("snapshot.acx81lMifn6q")
      /**
       * Display Form Title: Number (1/2010) (Snapshot)
       * Display Form ID: snapshot.acv81lMifn6q
       */,
      Number: newAttribute("snapshot.acv81lMifn6q"),
    }
    /**
     * Date Attribute: Month (Snapshot)
     * Date Attribute ID: snapshot.month.in.year
     */,
    Month: {
      ref: idRef("snapshot.month.in.year", "attribute"),
      identifier: "snapshot.month.in.year"
      /**
       * Display Form Title: Short (Jan) (Snapshot)
       * Display Form ID: snapshot.abm81lMifn6q
       */,
      Short: newAttribute("snapshot.abm81lMifn6q")
      /**
       * Display Form Title: Long (January) (Snapshot)
       * Display Form ID: snapshot.abs81lMifn6q
       */,
      Long: newAttribute("snapshot.abs81lMifn6q")
      /**
       * Display Form Title: Number (M1) (Snapshot)
       * Display Form ID: snapshot.abq81lMifn6q
       */,
      Number: newAttribute("snapshot.abq81lMifn6q")
      /**
       * Display Form Title: M/Q (M1/Q1) (Snapshot)
       * Display Form ID: snapshot.abo81lMifn6q
       */,
      MQ: newAttribute("snapshot.abo81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Mon-Sun) (Snapshot)
     * Date Attribute ID: snapshot.euweek.in.year
     */,
    WeekMonSun: {
      ref: idRef("snapshot.euweek.in.year", "attribute"),
      identifier: "snapshot.euweek.in.year"
      /**
       * Display Form Title: Number EU (Snapshot)
       * Display Form ID: snapshot.aba81lMifn6q
       */,
      NumberEU: newAttribute("snapshot.aba81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Mon-Sun)/Year (Snapshot)
     * Date Attribute ID: snapshot.euweek
     */,
    WeekMonSunYear: {
      ref: idRef("snapshot.euweek", "attribute"),
      identifier: "snapshot.euweek"
      /**
       * Display Form Title: Week #/Year (W1/2010) (Snapshot)
       * Display Form ID: snapshot.aa281lMifn6q
       */,
      WeekNrYear: newAttribute("snapshot.aa281lMifn6q")
      /**
       * Display Form Title: Week Starting (Snapshot)
       * Display Form ID: snapshot.aaY81lMifn6q
       */,
      WeekStarting: newAttribute("snapshot.aaY81lMifn6q")
      /**
       * Display Form Title: From - To (Snapshot)
       * Display Form ID: snapshot.aaW81lMifn6q
       */,
      FromTo: newAttribute("snapshot.aaW81lMifn6q")
      /**
       * Display Form Title: Week #/Year (Cont.) (Snapshot)
       * Display Form ID: snapshot.aa081lMifn6q
       */,
      WeekNrYear_1: newAttribute("snapshot.aa081lMifn6q")
      /**
       * Display Form Title: Wk/Qtr/Year (Cont.) (Snapshot)
       * Display Form ID: snapshot.aa481lMifn6q
       */,
      WkQtrYear: newAttribute("snapshot.aa481lMifn6q")
      /**
       * Display Form Title: Wk/Qtr/Year (Snapshot)
       * Display Form ID: snapshot.aaU81lMifn6q
       */,
      WkQtrYear_1: newAttribute("snapshot.aaU81lMifn6q"),
    }
    /**
     * Date Attribute: Quarter/Year (Snapshot)
     * Date Attribute ID: snapshot.quarter
     */,
    QuarterYear: {
      ref: idRef("snapshot.quarter", "attribute"),
      identifier: "snapshot.quarter"
      /**
       * Display Form Title: US Short (Snapshot)
       * Display Form ID: snapshot.aci81lMifn6q
       */,
      USShort: newAttribute("snapshot.aci81lMifn6q"),
    }
    /**
     * Date Attribute: Day of Month (Snapshot)
     * Date Attribute ID: snapshot.day.in.month
     */,
    DayOfMonth: {
      ref: idRef("snapshot.day.in.month", "attribute"),
      identifier: "snapshot.day.in.month"
      /**
       * Display Form Title: default (Snapshot)
       * Display Form ID: snapshot.aca81lMifn6q
       */,
      Default: newAttribute("snapshot.aca81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Sun-Sat) of Qtr (Snapshot)
     * Date Attribute ID: snapshot.week.in.quarter
     */,
    WeekSunSatOfQtr: {
      ref: idRef("snapshot.week.in.quarter", "attribute"),
      identifier: "snapshot.week.in.quarter"
      /**
       * Display Form Title: Number US (Snapshot)
       * Display Form ID: snapshot.aaO81lMifn6q
       */,
      NumberUS: newAttribute("snapshot.aaO81lMifn6q"),
    }
    /**
     * Date Attribute: Quarter (Snapshot)
     * Date Attribute ID: snapshot.quarter.in.year
     */,
    Quarter: {
      ref: idRef("snapshot.quarter.in.year", "attribute"),
      identifier: "snapshot.quarter.in.year"
      /**
       * Display Form Title: default (Snapshot)
       * Display Form ID: snapshot.aam81lMifn6q
       */,
      Default: newAttribute("snapshot.aam81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Sun-Sat)/Year (Snapshot)
     * Date Attribute ID: snapshot.week
     */,
    WeekSunSatYear: {
      ref: idRef("snapshot.week", "attribute"),
      identifier: "snapshot.week"
      /**
       * Display Form Title: Week #/Year (W1/2010) (Snapshot)
       * Display Form ID: snapshot.aaA81lMifn6q
       */,
      WeekNrYear: newAttribute("snapshot.aaA81lMifn6q")
      /**
       * Display Form Title: Week Starting (Snapshot)
       * Display Form ID: snapshot.aaw81lMifn6q
       */,
      WeekStarting: newAttribute("snapshot.aaw81lMifn6q")
      /**
       * Display Form Title: From - To (Snapshot)
       * Display Form ID: snapshot.aau81lMifn6q
       */,
      FromTo: newAttribute("snapshot.aau81lMifn6q")
      /**
       * Display Form Title: Week #/Year (Cont.) (Snapshot)
       * Display Form ID: snapshot.aay81lMifn6q
       */,
      WeekNrYear_1: newAttribute("snapshot.aay81lMifn6q")
      /**
       * Display Form Title: Wk/Qtr/Year (Cont.) (Snapshot)
       * Display Form ID: snapshot.aaC81lMifn6q
       */,
      WkQtrYear: newAttribute("snapshot.aaC81lMifn6q")
      /**
       * Display Form Title: Wk/Qtr/Year (Snapshot)
       * Display Form ID: snapshot.aas81lMifn6q
       */,
      WkQtrYear_1: newAttribute("snapshot.aas81lMifn6q"),
    }
    /**
     * Date Attribute: Day of Year (Snapshot)
     * Date Attribute ID: snapshot.day.in.year
     */,
    DayOfYear: {
      ref: idRef("snapshot.day.in.year", "attribute"),
      identifier: "snapshot.day.in.year"
      /**
       * Display Form Title: default (Snapshot)
       * Display Form ID: snapshot.abE81lMifn6q
       */,
      Default: newAttribute("snapshot.abE81lMifn6q"),
    }
    /**
     * Date Attribute: Day of Week (Sun-Sat) (Snapshot)
     * Date Attribute ID: snapshot.day.in.week
     */,
    DayOfWeekSunSat: {
      ref: idRef("snapshot.day.in.week", "attribute"),
      identifier: "snapshot.day.in.week"
      /**
       * Display Form Title: Short (Sun) (Snapshot)
       * Display Form ID: snapshot.abK81lMifn6q
       */,
      Short: newAttribute("snapshot.abK81lMifn6q")
      /**
       * Display Form Title: Long (Sunday) (Snapshot)
       * Display Form ID: snapshot.abO81lMifn6q
       */,
      Long: newAttribute("snapshot.abO81lMifn6q")
      /**
       * Display Form Title: Number (1=Sunday) (Snapshot)
       * Display Form ID: snapshot.abM81lMifn6q
       */,
      Number: newAttribute("snapshot.abM81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Sun-Sat) (Snapshot)
     * Date Attribute ID: snapshot.week.in.year
     */,
    WeekSunSat: {
      ref: idRef("snapshot.week.in.year", "attribute"),
      identifier: "snapshot.week.in.year"
      /**
       * Display Form Title: Number US (Snapshot)
       * Display Form ID: snapshot.aaI81lMifn6q
       */,
      NumberUS: newAttribute("snapshot.aaI81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Mon-Sun) of Qtr (Snapshot)
     * Date Attribute ID: snapshot.euweek.in.quarter
     */,
    WeekMonSunOfQtr: {
      ref: idRef("snapshot.euweek.in.quarter", "attribute"),
      identifier: "snapshot.euweek.in.quarter"
      /**
       * Display Form Title: Number EU (Snapshot)
       * Display Form ID: snapshot.abg81lMifn6q
       */,
      NumberEU: newAttribute("snapshot.abg81lMifn6q"),
    }
    /**
     * Date Attribute: Day of Quarter (Snapshot)
     * Date Attribute ID: snapshot.day.in.quarter
     */,
    DayOfQuarter: {
      ref: idRef("snapshot.day.in.quarter", "attribute"),
      identifier: "snapshot.day.in.quarter"
      /**
       * Display Form Title: default (Snapshot)
       * Display Form ID: snapshot.ab481lMifn6q
       */,
      Default: newAttribute("snapshot.ab481lMifn6q"),
    }
    /**
     * Date Attribute: Year (Snapshot)
     * Date Attribute ID: snapshot.year
     */,
    Year: {
      ref: idRef("snapshot.year", "attribute"),
      identifier: "snapshot.year"
      /**
       * Display Form Title: Year (Snapshot)
       * Display Form ID: snapshot.aag81lMifn6q
       */,
      Default: newAttribute("snapshot.aag81lMifn6q"),
    }
    /**
     * Date Attribute: Month of Quarter (Snapshot)
     * Date Attribute ID: snapshot.month.in.quarter
     */,
    MonthOfQuarter: {
      ref: idRef("snapshot.month.in.quarter", "attribute"),
      identifier: "snapshot.month.in.quarter"
      /**
       * Display Form Title: Number (Snapshot)
       * Display Form ID: snapshot.aby81lMifn6q
       */,
      Number: newAttribute("snapshot.aby81lMifn6q"),
    },
  }
  /**
   * Date Data Set Title: Date (Activity)
   * Date Data Set ID: activity.dataset.dt
   */,
  Activity: {
    ref: idRef("activity.dataset.dt", "dataSet"),
    identifier: "activity.dataset.dt"
    /**
     * Date Attribute: Date (Activity)
     * Date Attribute ID: activity.date
     */,
    Date: {
      ref: idRef("activity.date", "attribute"),
      identifier: "activity.date"
      /**
       * Display Form Title: mm/dd/yyyy (Activity)
       * Display Form ID: activity.date.mmddyyyy
       */,
      MmDdYyyy: newAttribute("activity.date.mmddyyyy")
      /**
       * Display Form Title: yyyy-mm-dd (Activity)
       * Display Form ID: activity.date.yyyymmdd
       */,
      YyyyMmDd: newAttribute("activity.date.yyyymmdd")
      /**
       * Display Form Title: m/d/yy (no leading zeroes) (Activity)
       * Display Form ID: activity.date.mdyy
       */,
      MDYy: newAttribute("activity.date.mdyy")
      /**
       * Display Form Title: Long (Mon, Jan 1, 2010) (Activity)
       * Display Form ID: activity.date.long
       */,
      Long: newAttribute("activity.date.long")
      /**
       * Display Form Title: dd/mm/yyyy (Activity)
       * Display Form ID: activity.date.ddmmyyyy
       */,
      DdMmYyyy: newAttribute("activity.date.ddmmyyyy")
      /**
       * Display Form Title: dd-mm-yyyy (Activity)
       * Display Form ID: activity.date.eddmmyyyy
       */,
      DdMmYyyy_1: newAttribute("activity.date.eddmmyyyy"),
    }
    /**
     * Date Attribute: Day of Week (Mon-Sun) (Activity)
     * Date Attribute ID: activity.day.in.euweek
     */,
    DayOfWeekMonSun: {
      ref: idRef("activity.day.in.euweek", "attribute"),
      identifier: "activity.day.in.euweek"
      /**
       * Display Form Title: Short (Mon) (Activity)
       * Display Form ID: activity.abU81lMifn6q
       */,
      Short: newAttribute("activity.abU81lMifn6q")
      /**
       * Display Form Title: Long (Monday) (Activity)
       * Display Form ID: activity.abY81lMifn6q
       */,
      Long: newAttribute("activity.abY81lMifn6q")
      /**
       * Display Form Title: Number (1=Monday) (Activity)
       * Display Form ID: activity.abW81lMifn6q
       */,
      Number: newAttribute("activity.abW81lMifn6q"),
    }
    /**
     * Date Attribute: Month/Year (Activity)
     * Date Attribute ID: activity.month
     */,
    MonthYear: {
      ref: idRef("activity.month", "attribute"),
      identifier: "activity.month"
      /**
       * Display Form Title: Short (Jan 2010) (Activity)
       * Display Form ID: activity.act81lMifn6q
       */,
      Short: newAttribute("activity.act81lMifn6q")
      /**
       * Display Form Title: Long (January 2010) (Activity)
       * Display Form ID: activity.acx81lMifn6q
       */,
      Long: newAttribute("activity.acx81lMifn6q")
      /**
       * Display Form Title: Number (1/2010) (Activity)
       * Display Form ID: activity.acv81lMifn6q
       */,
      Number: newAttribute("activity.acv81lMifn6q"),
    }
    /**
     * Date Attribute: Month (Activity)
     * Date Attribute ID: activity.month.in.year
     */,
    Month: {
      ref: idRef("activity.month.in.year", "attribute"),
      identifier: "activity.month.in.year"
      /**
       * Display Form Title: Short (Jan) (Activity)
       * Display Form ID: activity.abm81lMifn6q
       */,
      Short: newAttribute("activity.abm81lMifn6q")
      /**
       * Display Form Title: Long (January) (Activity)
       * Display Form ID: activity.abs81lMifn6q
       */,
      Long: newAttribute("activity.abs81lMifn6q")
      /**
       * Display Form Title: Number (M1) (Activity)
       * Display Form ID: activity.abq81lMifn6q
       */,
      Number: newAttribute("activity.abq81lMifn6q")
      /**
       * Display Form Title: M/Q (M1/Q1) (Activity)
       * Display Form ID: activity.abo81lMifn6q
       */,
      MQ: newAttribute("activity.abo81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Mon-Sun) (Activity)
     * Date Attribute ID: activity.euweek.in.year
     */,
    WeekMonSun: {
      ref: idRef("activity.euweek.in.year", "attribute"),
      identifier: "activity.euweek.in.year"
      /**
       * Display Form Title: Number EU (Activity)
       * Display Form ID: activity.aba81lMifn6q
       */,
      NumberEU: newAttribute("activity.aba81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Mon-Sun)/Year (Activity)
     * Date Attribute ID: activity.euweek
     */,
    WeekMonSunYear: {
      ref: idRef("activity.euweek", "attribute"),
      identifier: "activity.euweek"
      /**
       * Display Form Title: Week #/Year (W1/2010) (Activity)
       * Display Form ID: activity.aa281lMifn6q
       */,
      WeekNrYear: newAttribute("activity.aa281lMifn6q")
      /**
       * Display Form Title: Week Starting (Activity)
       * Display Form ID: activity.aaY81lMifn6q
       */,
      WeekStarting: newAttribute("activity.aaY81lMifn6q")
      /**
       * Display Form Title: From - To (Activity)
       * Display Form ID: activity.aaW81lMifn6q
       */,
      FromTo: newAttribute("activity.aaW81lMifn6q")
      /**
       * Display Form Title: Week #/Year (Cont.) (Activity)
       * Display Form ID: activity.aa081lMifn6q
       */,
      WeekNrYear_1: newAttribute("activity.aa081lMifn6q")
      /**
       * Display Form Title: Wk/Qtr/Year (Cont.) (Activity)
       * Display Form ID: activity.aa481lMifn6q
       */,
      WkQtrYear: newAttribute("activity.aa481lMifn6q")
      /**
       * Display Form Title: Wk/Qtr/Year (Activity)
       * Display Form ID: activity.aaU81lMifn6q
       */,
      WkQtrYear_1: newAttribute("activity.aaU81lMifn6q"),
    }
    /**
     * Date Attribute: Quarter/Year (Activity)
     * Date Attribute ID: activity.quarter
     */,
    QuarterYear: {
      ref: idRef("activity.quarter", "attribute"),
      identifier: "activity.quarter"
      /**
       * Display Form Title: US Short (Activity)
       * Display Form ID: activity.aci81lMifn6q
       */,
      USShort: newAttribute("activity.aci81lMifn6q"),
    }
    /**
     * Date Attribute: Day of Month (Activity)
     * Date Attribute ID: activity.day.in.month
     */,
    DayOfMonth: {
      ref: idRef("activity.day.in.month", "attribute"),
      identifier: "activity.day.in.month"
      /**
       * Display Form Title: default (Activity)
       * Display Form ID: activity.aca81lMifn6q
       */,
      Default: newAttribute("activity.aca81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Sun-Sat) of Qtr (Activity)
     * Date Attribute ID: activity.week.in.quarter
     */,
    WeekSunSatOfQtr: {
      ref: idRef("activity.week.in.quarter", "attribute"),
      identifier: "activity.week.in.quarter"
      /**
       * Display Form Title: Number US (Activity)
       * Display Form ID: activity.aaO81lMifn6q
       */,
      NumberUS: newAttribute("activity.aaO81lMifn6q"),
    }
    /**
     * Date Attribute: Quarter (Activity)
     * Date Attribute ID: activity.quarter.in.year
     */,
    Quarter: {
      ref: idRef("activity.quarter.in.year", "attribute"),
      identifier: "activity.quarter.in.year"
      /**
       * Display Form Title: default (Activity)
       * Display Form ID: activity.aam81lMifn6q
       */,
      Default: newAttribute("activity.aam81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Sun-Sat)/Year (Activity)
     * Date Attribute ID: activity.week
     */,
    WeekSunSatYear: {
      ref: idRef("activity.week", "attribute"),
      identifier: "activity.week"
      /**
       * Display Form Title: Week #/Year (W1/2010) (Activity)
       * Display Form ID: activity.aaA81lMifn6q
       */,
      WeekNrYear: newAttribute("activity.aaA81lMifn6q")
      /**
       * Display Form Title: Week Starting (Activity)
       * Display Form ID: activity.aaw81lMifn6q
       */,
      WeekStarting: newAttribute("activity.aaw81lMifn6q")
      /**
       * Display Form Title: From - To (Activity)
       * Display Form ID: activity.aau81lMifn6q
       */,
      FromTo: newAttribute("activity.aau81lMifn6q")
      /**
       * Display Form Title: Week #/Year (Cont.) (Activity)
       * Display Form ID: activity.aay81lMifn6q
       */,
      WeekNrYear_1: newAttribute("activity.aay81lMifn6q")
      /**
       * Display Form Title: Wk/Qtr/Year (Cont.) (Activity)
       * Display Form ID: activity.aaC81lMifn6q
       */,
      WkQtrYear: newAttribute("activity.aaC81lMifn6q")
      /**
       * Display Form Title: Wk/Qtr/Year (Activity)
       * Display Form ID: activity.aas81lMifn6q
       */,
      WkQtrYear_1: newAttribute("activity.aas81lMifn6q"),
    }
    /**
     * Date Attribute: Day of Year (Activity)
     * Date Attribute ID: activity.day.in.year
     */,
    DayOfYear: {
      ref: idRef("activity.day.in.year", "attribute"),
      identifier: "activity.day.in.year"
      /**
       * Display Form Title: default (Activity)
       * Display Form ID: activity.abE81lMifn6q
       */,
      Default: newAttribute("activity.abE81lMifn6q"),
    }
    /**
     * Date Attribute: Day of Week (Sun-Sat) (Activity)
     * Date Attribute ID: activity.day.in.week
     */,
    DayOfWeekSunSat: {
      ref: idRef("activity.day.in.week", "attribute"),
      identifier: "activity.day.in.week"
      /**
       * Display Form Title: Short (Sun) (Activity)
       * Display Form ID: activity.abK81lMifn6q
       */,
      Short: newAttribute("activity.abK81lMifn6q")
      /**
       * Display Form Title: Long (Sunday) (Activity)
       * Display Form ID: activity.abO81lMifn6q
       */,
      Long: newAttribute("activity.abO81lMifn6q")
      /**
       * Display Form Title: Number (1=Sunday) (Activity)
       * Display Form ID: activity.abM81lMifn6q
       */,
      Number: newAttribute("activity.abM81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Sun-Sat) (Activity)
     * Date Attribute ID: activity.week.in.year
     */,
    WeekSunSat: {
      ref: idRef("activity.week.in.year", "attribute"),
      identifier: "activity.week.in.year"
      /**
       * Display Form Title: Number US (Activity)
       * Display Form ID: activity.aaI81lMifn6q
       */,
      NumberUS: newAttribute("activity.aaI81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Mon-Sun) of Qtr (Activity)
     * Date Attribute ID: activity.euweek.in.quarter
     */,
    WeekMonSunOfQtr: {
      ref: idRef("activity.euweek.in.quarter", "attribute"),
      identifier: "activity.euweek.in.quarter"
      /**
       * Display Form Title: Number EU (Activity)
       * Display Form ID: activity.abg81lMifn6q
       */,
      NumberEU: newAttribute("activity.abg81lMifn6q"),
    }
    /**
     * Date Attribute: Day of Quarter (Activity)
     * Date Attribute ID: activity.day.in.quarter
     */,
    DayOfQuarter: {
      ref: idRef("activity.day.in.quarter", "attribute"),
      identifier: "activity.day.in.quarter"
      /**
       * Display Form Title: default (Activity)
       * Display Form ID: activity.ab481lMifn6q
       */,
      Default: newAttribute("activity.ab481lMifn6q"),
    }
    /**
     * Date Attribute: Year (Activity)
     * Date Attribute ID: activity.year
     */,
    Year: {
      ref: idRef("activity.year", "attribute"),
      identifier: "activity.year"
      /**
       * Display Form Title: Year (Activity)
       * Display Form ID: activity.aag81lMifn6q
       */,
      Default: newAttribute("activity.aag81lMifn6q"),
    }
    /**
     * Date Attribute: Month of Quarter (Activity)
     * Date Attribute ID: activity.month.in.quarter
     */,
    MonthOfQuarter: {
      ref: idRef("activity.month.in.quarter", "attribute"),
      identifier: "activity.month.in.quarter"
      /**
       * Display Form Title: Number (Activity)
       * Display Form ID: activity.aby81lMifn6q
       */,
      Number: newAttribute("activity.aby81lMifn6q"),
    },
  }
  /**
   * Date Data Set Title: Date (Timeline)
   * Date Data Set ID: timeline.dataset.dt
   */,
  Timeline: {
    ref: idRef("timeline.dataset.dt", "dataSet"),
    identifier: "timeline.dataset.dt"
    /**
     * Date Attribute: Date (Timeline)
     * Date Attribute ID: timeline.date
     */,
    Date: {
      ref: idRef("timeline.date", "attribute"),
      identifier: "timeline.date"
      /**
       * Display Form Title: mm/dd/yyyy (Timeline)
       * Display Form ID: timeline.date.mmddyyyy
       */,
      MmDdYyyy: newAttribute("timeline.date.mmddyyyy")
      /**
       * Display Form Title: yyyy-mm-dd (Timeline)
       * Display Form ID: timeline.date.yyyymmdd
       */,
      YyyyMmDd: newAttribute("timeline.date.yyyymmdd")
      /**
       * Display Form Title: m/d/yy (no leading zeroes) (Timeline)
       * Display Form ID: timeline.date.mdyy
       */,
      MDYy: newAttribute("timeline.date.mdyy")
      /**
       * Display Form Title: Long (Mon, Jan 1, 2010) (Timeline)
       * Display Form ID: timeline.date.long
       */,
      Long: newAttribute("timeline.date.long")
      /**
       * Display Form Title: dd/mm/yyyy (Timeline)
       * Display Form ID: timeline.date.ddmmyyyy
       */,
      DdMmYyyy: newAttribute("timeline.date.ddmmyyyy")
      /**
       * Display Form Title: dd-mm-yyyy (Timeline)
       * Display Form ID: timeline.date.eddmmyyyy
       */,
      DdMmYyyy_1: newAttribute("timeline.date.eddmmyyyy"),
    }
    /**
     * Date Attribute: Day of Week (Mon-Sun) (Timeline)
     * Date Attribute ID: timeline.day.in.euweek
     */,
    DayOfWeekMonSun: {
      ref: idRef("timeline.day.in.euweek", "attribute"),
      identifier: "timeline.day.in.euweek"
      /**
       * Display Form Title: Short (Mon) (Timeline)
       * Display Form ID: timeline.abU81lMifn6q
       */,
      Short: newAttribute("timeline.abU81lMifn6q")
      /**
       * Display Form Title: Long (Monday) (Timeline)
       * Display Form ID: timeline.abY81lMifn6q
       */,
      Long: newAttribute("timeline.abY81lMifn6q")
      /**
       * Display Form Title: Number (1=Monday) (Timeline)
       * Display Form ID: timeline.abW81lMifn6q
       */,
      Number: newAttribute("timeline.abW81lMifn6q"),
    }
    /**
     * Date Attribute: Month/Year (Timeline)
     * Date Attribute ID: timeline.month
     */,
    MonthYear: {
      ref: idRef("timeline.month", "attribute"),
      identifier: "timeline.month"
      /**
       * Display Form Title: Short (Jan 2010) (Timeline)
       * Display Form ID: timeline.act81lMifn6q
       */,
      Short: newAttribute("timeline.act81lMifn6q")
      /**
       * Display Form Title: Long (January 2010) (Timeline)
       * Display Form ID: timeline.acx81lMifn6q
       */,
      Long: newAttribute("timeline.acx81lMifn6q")
      /**
       * Display Form Title: Number (1/2010) (Timeline)
       * Display Form ID: timeline.acv81lMifn6q
       */,
      Number: newAttribute("timeline.acv81lMifn6q"),
    }
    /**
     * Date Attribute: Month (Timeline)
     * Date Attribute ID: timeline.month.in.year
     */,
    Month: {
      ref: idRef("timeline.month.in.year", "attribute"),
      identifier: "timeline.month.in.year"
      /**
       * Display Form Title: Short (Jan) (Timeline)
       * Display Form ID: timeline.abm81lMifn6q
       */,
      Short: newAttribute("timeline.abm81lMifn6q")
      /**
       * Display Form Title: Long (January) (Timeline)
       * Display Form ID: timeline.abs81lMifn6q
       */,
      Long: newAttribute("timeline.abs81lMifn6q")
      /**
       * Display Form Title: Number (M1) (Timeline)
       * Display Form ID: timeline.abq81lMifn6q
       */,
      Number: newAttribute("timeline.abq81lMifn6q")
      /**
       * Display Form Title: M/Q (M1/Q1) (Timeline)
       * Display Form ID: timeline.abo81lMifn6q
       */,
      MQ: newAttribute("timeline.abo81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Mon-Sun) (Timeline)
     * Date Attribute ID: timeline.euweek.in.year
     */,
    WeekMonSun: {
      ref: idRef("timeline.euweek.in.year", "attribute"),
      identifier: "timeline.euweek.in.year"
      /**
       * Display Form Title: Number EU (Timeline)
       * Display Form ID: timeline.aba81lMifn6q
       */,
      NumberEU: newAttribute("timeline.aba81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Mon-Sun)/Year (Timeline)
     * Date Attribute ID: timeline.euweek
     */,
    WeekMonSunYear: {
      ref: idRef("timeline.euweek", "attribute"),
      identifier: "timeline.euweek"
      /**
       * Display Form Title: Week #/Year (W1/2010) (Timeline)
       * Display Form ID: timeline.aa281lMifn6q
       */,
      WeekNrYear: newAttribute("timeline.aa281lMifn6q")
      /**
       * Display Form Title: Week Starting (Timeline)
       * Display Form ID: timeline.aaY81lMifn6q
       */,
      WeekStarting: newAttribute("timeline.aaY81lMifn6q")
      /**
       * Display Form Title: From - To (Timeline)
       * Display Form ID: timeline.aaW81lMifn6q
       */,
      FromTo: newAttribute("timeline.aaW81lMifn6q")
      /**
       * Display Form Title: Week #/Year (Cont.) (Timeline)
       * Display Form ID: timeline.aa081lMifn6q
       */,
      WeekNrYear_1: newAttribute("timeline.aa081lMifn6q")
      /**
       * Display Form Title: Wk/Qtr/Year (Cont.) (Timeline)
       * Display Form ID: timeline.aa481lMifn6q
       */,
      WkQtrYear: newAttribute("timeline.aa481lMifn6q")
      /**
       * Display Form Title: Wk/Qtr/Year (Timeline)
       * Display Form ID: timeline.aaU81lMifn6q
       */,
      WkQtrYear_1: newAttribute("timeline.aaU81lMifn6q"),
    }
    /**
     * Date Attribute: Quarter/Year (Timeline)
     * Date Attribute ID: timeline.quarter
     */,
    QuarterYear: {
      ref: idRef("timeline.quarter", "attribute"),
      identifier: "timeline.quarter"
      /**
       * Display Form Title: US Short (Timeline)
       * Display Form ID: timeline.aci81lMifn6q
       */,
      USShort: newAttribute("timeline.aci81lMifn6q"),
    }
    /**
     * Date Attribute: Day of Month (Timeline)
     * Date Attribute ID: timeline.day.in.month
     */,
    DayOfMonth: {
      ref: idRef("timeline.day.in.month", "attribute"),
      identifier: "timeline.day.in.month"
      /**
       * Display Form Title: default (Timeline)
       * Display Form ID: timeline.aca81lMifn6q
       */,
      Default: newAttribute("timeline.aca81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Sun-Sat) of Qtr (Timeline)
     * Date Attribute ID: timeline.week.in.quarter
     */,
    WeekSunSatOfQtr: {
      ref: idRef("timeline.week.in.quarter", "attribute"),
      identifier: "timeline.week.in.quarter"
      /**
       * Display Form Title: Number US (Timeline)
       * Display Form ID: timeline.aaO81lMifn6q
       */,
      NumberUS: newAttribute("timeline.aaO81lMifn6q"),
    }
    /**
     * Date Attribute: Quarter (Timeline)
     * Date Attribute ID: timeline.quarter.in.year
     */,
    Quarter: {
      ref: idRef("timeline.quarter.in.year", "attribute"),
      identifier: "timeline.quarter.in.year"
      /**
       * Display Form Title: default (Timeline)
       * Display Form ID: timeline.aam81lMifn6q
       */,
      Default: newAttribute("timeline.aam81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Sun-Sat)/Year (Timeline)
     * Date Attribute ID: timeline.week
     */,
    WeekSunSatYear: {
      ref: idRef("timeline.week", "attribute"),
      identifier: "timeline.week"
      /**
       * Display Form Title: Week #/Year (W1/2010) (Timeline)
       * Display Form ID: timeline.aaA81lMifn6q
       */,
      WeekNrYear: newAttribute("timeline.aaA81lMifn6q")
      /**
       * Display Form Title: Week Starting (Timeline)
       * Display Form ID: timeline.aaw81lMifn6q
       */,
      WeekStarting: newAttribute("timeline.aaw81lMifn6q")
      /**
       * Display Form Title: From - To (Timeline)
       * Display Form ID: timeline.aau81lMifn6q
       */,
      FromTo: newAttribute("timeline.aau81lMifn6q")
      /**
       * Display Form Title: Week #/Year (Cont.) (Timeline)
       * Display Form ID: timeline.aay81lMifn6q
       */,
      WeekNrYear_1: newAttribute("timeline.aay81lMifn6q")
      /**
       * Display Form Title: Wk/Qtr/Year (Cont.) (Timeline)
       * Display Form ID: timeline.aaC81lMifn6q
       */,
      WkQtrYear: newAttribute("timeline.aaC81lMifn6q")
      /**
       * Display Form Title: Wk/Qtr/Year (Timeline)
       * Display Form ID: timeline.aas81lMifn6q
       */,
      WkQtrYear_1: newAttribute("timeline.aas81lMifn6q"),
    }
    /**
     * Date Attribute: Day of Year (Timeline)
     * Date Attribute ID: timeline.day.in.year
     */,
    DayOfYear: {
      ref: idRef("timeline.day.in.year", "attribute"),
      identifier: "timeline.day.in.year"
      /**
       * Display Form Title: default (Timeline)
       * Display Form ID: timeline.abE81lMifn6q
       */,
      Default: newAttribute("timeline.abE81lMifn6q"),
    }
    /**
     * Date Attribute: Day of Week (Sun-Sat) (Timeline)
     * Date Attribute ID: timeline.day.in.week
     */,
    DayOfWeekSunSat: {
      ref: idRef("timeline.day.in.week", "attribute"),
      identifier: "timeline.day.in.week"
      /**
       * Display Form Title: Short (Sun) (Timeline)
       * Display Form ID: timeline.abK81lMifn6q
       */,
      Short: newAttribute("timeline.abK81lMifn6q")
      /**
       * Display Form Title: Long (Sunday) (Timeline)
       * Display Form ID: timeline.abO81lMifn6q
       */,
      Long: newAttribute("timeline.abO81lMifn6q")
      /**
       * Display Form Title: Number (1=Sunday) (Timeline)
       * Display Form ID: timeline.abM81lMifn6q
       */,
      Number: newAttribute("timeline.abM81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Sun-Sat) (Timeline)
     * Date Attribute ID: timeline.week.in.year
     */,
    WeekSunSat: {
      ref: idRef("timeline.week.in.year", "attribute"),
      identifier: "timeline.week.in.year"
      /**
       * Display Form Title: Number US (Timeline)
       * Display Form ID: timeline.aaI81lMifn6q
       */,
      NumberUS: newAttribute("timeline.aaI81lMifn6q"),
    }
    /**
     * Date Attribute: Week (Mon-Sun) of Qtr (Timeline)
     * Date Attribute ID: timeline.euweek.in.quarter
     */,
    WeekMonSunOfQtr: {
      ref: idRef("timeline.euweek.in.quarter", "attribute"),
      identifier: "timeline.euweek.in.quarter"
      /**
       * Display Form Title: Number EU (Timeline)
       * Display Form ID: timeline.abg81lMifn6q
       */,
      NumberEU: newAttribute("timeline.abg81lMifn6q"),
    }
    /**
     * Date Attribute: Day of Quarter (Timeline)
     * Date Attribute ID: timeline.day.in.quarter
     */,
    DayOfQuarter: {
      ref: idRef("timeline.day.in.quarter", "attribute"),
      identifier: "timeline.day.in.quarter"
      /**
       * Display Form Title: default (Timeline)
       * Display Form ID: timeline.ab481lMifn6q
       */,
      Default: newAttribute("timeline.ab481lMifn6q"),
    }
    /**
     * Date Attribute: Year (Timeline)
     * Date Attribute ID: timeline.year
     */,
    Year: {
      ref: idRef("timeline.year", "attribute"),
      identifier: "timeline.year"
      /**
       * Display Form Title: Year (Timeline)
       * Display Form ID: timeline.aag81lMifn6q
       */,
      Default: newAttribute("timeline.aag81lMifn6q"),
    }
    /**
     * Date Attribute: Month of Quarter (Timeline)
     * Date Attribute ID: timeline.month.in.quarter
     */,
    MonthOfQuarter: {
      ref: idRef("timeline.month.in.quarter", "attribute"),
      identifier: "timeline.month.in.quarter"
      /**
       * Display Form Title: Number (Timeline)
       * Display Form ID: timeline.aby81lMifn6q
       */,
      Number: newAttribute("timeline.aby81lMifn6q"),
    },
  }
  /**
   * Date Data Set Title: Date (Date 1)
   * Date Data Set ID: date_1.dataset.dt
   */,
  Date1: {
    ref: idRef("date_1.dataset.dt", "dataSet"),
    identifier: "date_1.dataset.dt"
    /**
     * Date Attribute: Year (Date 1)
     * Date Attribute ID: date_1.year
     */,
    Year: {
      ref: idRef("date_1.year", "attribute"),
      identifier: "date_1.year"
      /**
       * Display Form Title: Year (Date 1)
       * Display Form ID: date_1.year.default
       */,
      Default: newAttribute("date_1.year.default"),
    }
    /**
     * Date Attribute: Quarter (Date 1)
     * Date Attribute ID: date_1.quarter.in.year
     */,
    Quarter: {
      ref: idRef("date_1.quarter.in.year", "attribute"),
      identifier: "date_1.quarter.in.year"
      /**
       * Display Form Title: default (Date 1)
       * Display Form ID: date_1.quarter.in.year.default
       */,
      Default: newAttribute("date_1.quarter.in.year.default"),
    }
    /**
     * Date Attribute: Week (Sun-Sat)/Year (Date 1)
     * Date Attribute ID: date_1.week
     */,
    WeekSunSatYear: {
      ref: idRef("date_1.week", "attribute"),
      identifier: "date_1.week"
      /**
       * Display Form Title: Week #/Year (W1/2010) (Date 1)
       * Display Form ID: date_1.week.wk_year
       */,
      WeekNrYear: newAttribute("date_1.week.wk_year")
      /**
       * Display Form Title: Week Starting (Date 1)
       * Display Form ID: date_1.week.starting
       */,
      WeekStarting: newAttribute("date_1.week.starting")
      /**
       * Display Form Title: From - To (Date 1)
       * Display Form ID: date_1.week.from_to
       */,
      FromTo: newAttribute("date_1.week.from_to")
      /**
       * Display Form Title: Week #/Year (Cont.) (Date 1)
       * Display Form ID: date_1.week.wk_year_cont
       */,
      WeekNrYear_1: newAttribute("date_1.week.wk_year_cont")
      /**
       * Display Form Title: Wk/Qtr/Year (Cont.) (Date 1)
       * Display Form ID: date_1.week.wk_qtr_year_cont
       */,
      WkQtrYear: newAttribute("date_1.week.wk_qtr_year_cont")
      /**
       * Display Form Title: Wk/Qtr/Year (Date 1)
       * Display Form ID: date_1.week.wk_qtr_year
       */,
      WkQtrYear_1: newAttribute("date_1.week.wk_qtr_year"),
    }
    /**
     * Date Attribute: Week (Sun-Sat) (Date 1)
     * Date Attribute ID: date_1.week.in.year
     */,
    WeekSunSat: {
      ref: idRef("date_1.week.in.year", "attribute"),
      identifier: "date_1.week.in.year"
      /**
       * Display Form Title: Number US (Date 1)
       * Display Form ID: date_1.week.in.year.number_us
       */,
      NumberUS: newAttribute("date_1.week.in.year.number_us"),
    }
    /**
     * Date Attribute: Week (Sun-Sat) of Qtr (Date 1)
     * Date Attribute ID: date_1.week.in.quarter
     */,
    WeekSunSatOfQtr: {
      ref: idRef("date_1.week.in.quarter", "attribute"),
      identifier: "date_1.week.in.quarter"
      /**
       * Display Form Title: Number US (Date 1)
       * Display Form ID: date_1.week.in.quarter.number_us
       */,
      NumberUS: newAttribute("date_1.week.in.quarter.number_us"),
    }
    /**
     * Date Attribute: Week (Mon-Sun)/Year (Date 1)
     * Date Attribute ID: date_1.euweek
     */,
    WeekMonSunYear: {
      ref: idRef("date_1.euweek", "attribute"),
      identifier: "date_1.euweek"
      /**
       * Display Form Title: Week #/Year (W1/2010) (Date 1)
       * Display Form ID: date_1.euweek.wk_year
       */,
      WeekNrYear: newAttribute("date_1.euweek.wk_year")
      /**
       * Display Form Title: Week Starting (Date 1)
       * Display Form ID: date_1.euweek.starting
       */,
      WeekStarting: newAttribute("date_1.euweek.starting")
      /**
       * Display Form Title: From - To (Date 1)
       * Display Form ID: date_1.euweek.from_to
       */,
      FromTo: newAttribute("date_1.euweek.from_to"),
    }
    /**
     * Date Attribute: Week (Mon-Sun) (Date 1)
     * Date Attribute ID: date_1.euweek.in.year
     */,
    WeekMonSun: {
      ref: idRef("date_1.euweek.in.year", "attribute"),
      identifier: "date_1.euweek.in.year"
      /**
       * Display Form Title: Number EU (Date 1)
       * Display Form ID: date_1.euweek.in.year.number_eu
       */,
      NumberEU: newAttribute("date_1.euweek.in.year.number_eu"),
    }
    /**
     * Date Attribute: Week (Mon-Sun) of Qtr (Date 1)
     * Date Attribute ID: date_1.euweek.in.quarter
     */,
    WeekMonSunOfQtr: {
      ref: idRef("date_1.euweek.in.quarter", "attribute"),
      identifier: "date_1.euweek.in.quarter"
      /**
       * Display Form Title: Number EU (Date 1)
       * Display Form ID: date_1.euweek.in.quarter.number_eu
       */,
      NumberEU: newAttribute("date_1.euweek.in.quarter.number_eu"),
    }
    /**
     * Date Attribute: Month (Date 1)
     * Date Attribute ID: date_1.month.in.year
     */,
    Month: {
      ref: idRef("date_1.month.in.year", "attribute"),
      identifier: "date_1.month.in.year"
      /**
       * Display Form Title: Short (Jan) (Date 1)
       * Display Form ID: date_1.month.in.year.short
       */,
      Short: newAttribute("date_1.month.in.year.short")
      /**
       * Display Form Title: Long (January) (Date 1)
       * Display Form ID: date_1.month.in.year.long
       */,
      Long: newAttribute("date_1.month.in.year.long")
      /**
       * Display Form Title: Number (M1) (Date 1)
       * Display Form ID: date_1.month.in.year.number
       */,
      Number: newAttribute("date_1.month.in.year.number")
      /**
       * Display Form Title: M/Q (M1/Q1) (Date 1)
       * Display Form ID: date_1.month.in.year.m_q
       */,
      MQ: newAttribute("date_1.month.in.year.m_q"),
    }
    /**
     * Date Attribute: Month of Quarter (Date 1)
     * Date Attribute ID: date_1.month.in.quarter
     */,
    MonthOfQuarter: {
      ref: idRef("date_1.month.in.quarter", "attribute"),
      identifier: "date_1.month.in.quarter"
      /**
       * Display Form Title: Number (Date 1)
       * Display Form ID: date_1.month.in.quarter.number
       */,
      Number: newAttribute("date_1.month.in.quarter.number"),
    }
    /**
     * Date Attribute: Day of Year (Date 1)
     * Date Attribute ID: date_1.day.in.year
     */,
    DayOfYear: {
      ref: idRef("date_1.day.in.year", "attribute"),
      identifier: "date_1.day.in.year"
      /**
       * Display Form Title: default (Date 1)
       * Display Form ID: date_1.day.in.year.default
       */,
      Default: newAttribute("date_1.day.in.year.default"),
    }
    /**
     * Date Attribute: Day of Week (Sun-Sat) (Date 1)
     * Date Attribute ID: date_1.day.in.week
     */,
    DayOfWeekSunSat: {
      ref: idRef("date_1.day.in.week", "attribute"),
      identifier: "date_1.day.in.week"
      /**
       * Display Form Title: Short (Sun) (Date 1)
       * Display Form ID: date_1.day.in.week.short
       */,
      Short: newAttribute("date_1.day.in.week.short")
      /**
       * Display Form Title: Long (Sunday) (Date 1)
       * Display Form ID: date_1.day.in.week.long
       */,
      Long: newAttribute("date_1.day.in.week.long")
      /**
       * Display Form Title: Number (1=Sunday) (Date 1)
       * Display Form ID: date_1.day.in.week.number
       */,
      Number: newAttribute("date_1.day.in.week.number"),
    }
    /**
     * Date Attribute: Day of Week (Mon-Sun) (Date 1)
     * Date Attribute ID: date_1.day.in.euweek
     */,
    DayOfWeekMonSun: {
      ref: idRef("date_1.day.in.euweek", "attribute"),
      identifier: "date_1.day.in.euweek"
      /**
       * Display Form Title: Short (Mon) (Date 1)
       * Display Form ID: date_1.day.in.euweek.short
       */,
      Short: newAttribute("date_1.day.in.euweek.short")
      /**
       * Display Form Title: Long (Monday) (Date 1)
       * Display Form ID: date_1.day.in.euweek.long
       */,
      Long: newAttribute("date_1.day.in.euweek.long")
      /**
       * Display Form Title: Number (1=Monday) (Date 1)
       * Display Form ID: date_1.day.in.euweek.number
       */,
      Number: newAttribute("date_1.day.in.euweek.number"),
    }
    /**
     * Date Attribute: Day of Quarter (Date 1)
     * Date Attribute ID: date_1.day.in.quarter
     */,
    DayOfQuarter: {
      ref: idRef("date_1.day.in.quarter", "attribute"),
      identifier: "date_1.day.in.quarter"
      /**
       * Display Form Title: default (Date 1)
       * Display Form ID: date_1.day.in.quarter.default
       */,
      Default: newAttribute("date_1.day.in.quarter.default"),
    }
    /**
     * Date Attribute: Day of Month (Date 1)
     * Date Attribute ID: date_1.day.in.month
     */,
    DayOfMonth: {
      ref: idRef("date_1.day.in.month", "attribute"),
      identifier: "date_1.day.in.month"
      /**
       * Display Form Title: default (Date 1)
       * Display Form ID: date_1.day.in.month.default
       */,
      Default: newAttribute("date_1.day.in.month.default"),
    }
    /**
     * Date Attribute: Quarter/Year (Date 1)
     * Date Attribute ID: date_1.quarter
     */,
    QuarterYear: {
      ref: idRef("date_1.quarter", "attribute"),
      identifier: "date_1.quarter"
      /**
       * Display Form Title: US Short (Date 1)
       * Display Form ID: date_1.quarter.short_us
       */,
      USShort: newAttribute("date_1.quarter.short_us"),
    }
    /**
     * Date Attribute: Month/Year (Date 1)
     * Date Attribute ID: date_1.month
     */,
    MonthYear: {
      ref: idRef("date_1.month", "attribute"),
      identifier: "date_1.month"
      /**
       * Display Form Title: Short (Jan 2010) (Date 1)
       * Display Form ID: date_1.month.short
       */,
      Short: newAttribute("date_1.month.short")
      /**
       * Display Form Title: Long (January 2010) (Date 1)
       * Display Form ID: date_1.month.long
       */,
      Long: newAttribute("date_1.month.long")
      /**
       * Display Form Title: Number (1/2010) (Date 1)
       * Display Form ID: date_1.month.number
       */,
      Number: newAttribute("date_1.month.number"),
    }
    /**
     * Date Attribute: Date (Date 1)
     * Date Attribute ID: date_1.date
     */,
    Date: {
      ref: idRef("date_1.date", "attribute"),
      identifier: "date_1.date"
      /**
       * Display Form Title: mm/dd/yyyy (Date 1)
       * Display Form ID: date_1.date.day.us.mm_dd_yyyy
       */,
      MmDdYyyy: newAttribute("date_1.date.day.us.mm_dd_yyyy")
      /**
       * Display Form Title: yyyy-mm-dd (Date 1)
       * Display Form ID: date_1.date.day.yyyy_mm_dd
       */,
      YyyyMmDd: newAttribute("date_1.date.day.yyyy_mm_dd")
      /**
       * Display Form Title: m/d/yy (no leading zeroes) (Date 1)
       * Display Form ID: date_1.date.day.us.m_d_yy
       */,
      MDYy: newAttribute("date_1.date.day.us.m_d_yy")
      /**
       * Display Form Title: Long (Mon, Jan 1, 2010) (Date 1)
       * Display Form ID: date_1.date.day.us.long
       */,
      Long: newAttribute("date_1.date.day.us.long")
      /**
       * Display Form Title: dd/mm/yyyy (Date 1)
       * Display Form ID: date_1.date.day.uk.dd_mm_yyyy
       */,
      DdMmYyyy: newAttribute("date_1.date.day.uk.dd_mm_yyyy")
      /**
       * Display Form Title: dd-mm-yyyy (Date 1)
       * Display Form ID: date_1.date.day.eu.dd_mm_yyyy
       */,
      DdMmYyyy_1: newAttribute("date_1.date.day.eu.dd_mm_yyyy"),
    }
    /**
     * Date Attribute: US Week Year (Date 1)
     * Date Attribute ID: date_1.year.for.week
     */,
    USWeekYear: {
      ref: idRef("date_1.year.for.week", "attribute"),
      identifier: "date_1.year.for.week"
      /**
       * Display Form Title: Week Year (Date 1)
       * Display Form ID: date_1.year.for.week.number
       */,
      WeekYear: newAttribute("date_1.year.for.week.number"),
    }
    /**
     * Date Attribute: EU Week Year (Date 1)
     * Date Attribute ID: date_1.year.for.euweek
     */,
    EUWeekYear: {
      ref: idRef("date_1.year.for.euweek", "attribute"),
      identifier: "date_1.year.for.euweek"
      /**
       * Display Form Title: Week Year (Date 1)
       * Display Form ID: date_1.year.for.euweek.number
       */,
      WeekYear: newAttribute("date_1.year.for.euweek.number"),
    }
    /**
     * Date Attribute: US Week Quarter (Date 1)
     * Date Attribute ID: date_1.quarter.for.week
     */,
    USWeekQuarter: {
      ref: idRef("date_1.quarter.for.week", "attribute"),
      identifier: "date_1.quarter.for.week"
      /**
       * Display Form Title: Week Quarter (Date 1)
       * Display Form ID: date_1.quarter.for.week.number
       */,
      WeekQuarter: newAttribute("date_1.quarter.for.week.number"),
    }
    /**
     * Date Attribute: EU Week Quarter (Date 1)
     * Date Attribute ID: date_1.quarter.for.euweek
     */,
    EUWeekQuarter: {
      ref: idRef("date_1.quarter.for.euweek", "attribute"),
      identifier: "date_1.quarter.for.euweek"
      /**
       * Display Form Title: Week Quarter (Date 1)
       * Display Form ID: date_1.quarter.for.euweek.number
       */,
      WeekQuarter: newAttribute("date_1.quarter.for.euweek.number"),
    },
  },
};
export const Insights = {
  /**
   * Insight Title: not headline anymore
   * Insight ID: aacckbdIbrzc
   */
  NotHeadlineAnymore: "aacckbdIbrzc"
  /**
   * Insight Title: column
   * Insight ID: aabckTkHbxoy
   */,
  Column: "aabckTkHbxoy"
  /**
   * Insight Title: Pivot attr only
   * Insight ID: aafcj2Qvbq2Z
   */,
  PivotAttrOnly: "aafcj2Qvbq2Z"
  /**
   * Insight Title: no data
   * Insight ID: aahcj2Qvbq2Z
   */,
  NoData: "aahcj2Qvbq2Z"
  /**
   * Insight Title: pivot table
   * Insight ID: aaccliGpbrnz
   */,
  PivotTable: "aaccliGpbrnz"
  /**
   * Insight Title: Too many 413
   * Insight ID: aabW5AxBco9z
   */,
  TooMany413: "aabW5AxBco9z"
  /**
   * Insight Title: bar
   * Insight ID: aacrqYgscSik
   */,
  Bar: "aacrqYgscSik"
  /**
   * Insight Title: headline lkasdkljj adlkjaf lkasdlkfj asldklkja sdflkasdlkf asdlkfj adflkajkdf laksdjflkadjlkasdfjkalkjasdlkfj aldkflkajs dflkjasd flkasdf aslkdfj alksdflk asdlkf asdlfkasdflkj asdflk asdflkj asdflkj adslfkj alskdjf
   * Insight ID: aah5cAnWfP0G
   */,
  HeadlineLkasdkljjAdlkjafLkasdlkfjAsldklkjaSdflkasdlkfAsdlkfjAdflkajkdfLaksdjflkadjlkasdfjkalkjasdlkfjAldkflkajsDflkjasdFlkasdfAslkdfjAlksdflkAsdlkfAsdlfkasdflkjAsdflkAsdflkjAsdflkjAdslfkjAlskdjf:
    "aah5cAnWfP0G"
  /**
   * Insight Title: some measures
   * Insight ID: aaeKc3hzeKLD
   */,
  SomeMeasures: "aaeKc3hzeKLD"
  /**
   * Insight Title: table
   * Insight ID: aahKmQ6fgeDH
   */,
  Table: "aahKmQ6fgeDH"
  /**
   * Insight Title: long legend
   * Insight ID: aadWUo8ZdkMp
   */,
  LongLegend: "aadWUo8ZdkMp"
  /**
   * Insight Title: wide table
   * Insight ID: aad9HQcggfkN
   */,
  WideTable: "aad9HQcggfkN"
  /**
   * Insight Title: sorted table
   * Insight ID: aapkaGU1gjDC
   */,
  SortedTable: "aapkaGU1gjDC"
  /**
   * Insight Title: Broken execution
   * Insight ID: aaokXpbQfdA8
   */,
  BrokenExecution: "aaokXpbQfdA8"
  /**
   * Insight Title: too many 413
   * Insight ID: aagk4wOcgnYD
   */,
  TooMany413_1: "aagk4wOcgnYD"
  /**
   * Insight Title: referencies
   * Insight ID: aadS2nN2e0gN
   */,
  Referencies: "aadS2nN2e0gN"
  /**
   * Insight Title: drilling table
   * Insight ID: aabsJBsgejTp
   */,
  DrillingTable: "aabsJBsgejTp"
  /**
   * Insight Title: Activity
   * Insight ID: aaksIWdXf3Tr
   */,
  Activity_1: "aaksIWdXf3Tr"
  /**
   * Insight Title: drill pie
   * Insight ID: aaisINotf2ao
   */,
  DrillPie: "aaisINotf2ao"
  /**
   * Insight Title: ONE-4129 01
   * Insight ID: aab031R0c9q8
   */,
  ONE412901: "aab031R0c9q8"
  /**
   * Insight Title: ONE-4129 02
   * Insight ID: aac0368Leas1
   */,
  ONE412902: "aac0368Leas1"
  /**
   * Insight Title: totals
   * Insight ID: aafk2DMShigJ
   */,
  Totals: "aafk2DMShigJ"
  /**
   * Insight Title: faster table
   * Insight ID: aabVI0o2ddbJ
   */,
  FasterTable: "aabVI0o2ddbJ"
  /**
   * Insight Title: source
   * Insight ID: abybN6Thap1X
   */,
  Source: "abybN6Thap1X"
  /**
   * Insight Title: test
   * Insight ID: aabRHb9Ocq9V
   */,
  Test: "aabRHb9Ocq9V"
  /**
   * Insight Title: Activities by Date
   * Insight ID: aapdaK4Hgw4q
   */,
  ActivitiesByDate: "aapdaK4Hgw4q"
  /**
   * Insight Title: sorted table
   * Insight ID: aazdRDkOauo9
   */,
  SortedTable_1: "aazdRDkOauo9"
  /**
   * Insight Title: save references
   * Insight ID: aaJfewyYcYMV
   */,
  SaveReferences: "aaJfewyYcYMV"
  /**
   * Insight Title: references broken
   * Insight ID: aayfeQOubt6u
   */,
  ReferencesBroken: "aayfeQOubt6u"
  /**
   * Insight Title: simple columns
   * Insight ID: aacv13szhhlH
   */,
  SimpleColumns: "aacv13szhhlH"
  /**
   * Insight Title: simple rows
   * Insight ID: aagv21NLbQEr
   */,
  SimpleRows: "aagv21NLbQEr"
  /**
   * Insight Title: Complex both
   * Insight ID: aafv6mHhgKmn
   */,
  ComplexBoth: "aafv6mHhgKmn"
  /**
   * Insight Title: test table
   * Insight ID: aaLATymabiss
   */,
  TestTable: "aaLATymabiss"
  /**
   * Insight Title: multi measures
   * Insight ID: aaqTyvd8b8bh
   */,
  MultiMeasures: "aaqTyvd8b8bh"
  /**
   * Insight Title: Test
   * Insight ID: aacx6tfzcoZo
   */,
  Test_1: "aacx6tfzcoZo"
  /**
   * Insight Title: view by date
   * Insight ID: aal334HihLk1
   */,
  ViewByDate: "aal334HihLk1"
  /**
   * Insight Title: Combo
   * Insight ID: aajd0sQYfGK0
   */,
  Combo: "aajd0sQYfGK0"
  /**
   * Insight Title: simple table colId
   * Insight ID: aayHtxQ7f13j
   */,
  SimpleTableColId: "aayHtxQ7f13j"
  /**
   * Insight Title: loading forever
   * Insight ID: aaqxlTG4iEEm
   */,
  LoadingForever: "aaqxlTG4iEEm"
  /**
   * Insight Title: Manual resize
   * Insight ID: aai0qtgKivoS
   */,
  ManualResize: "aai0qtgKivoS"
  /**
   * Insight Title: MR table
   * Insight ID: aad5uFsNdT3j
   */,
  MRTable: "aad5uFsNdT3j"
  /**
   * Insight Title: sorting
   * Insight ID: aay5o0bAcDpI
   */,
  Sorting: "aay5o0bAcDpI"
  /**
   * Insight Title: MRT
   * Insight ID: aae5EPl3bJXl
   */,
  MRT: "aae5EPl3bJXl"
  /**
   * Insight Title: mrt2
   * Insight ID: aad5PMHOhvlf
   */,
  Mrt2: "aad5PMHOhvlf"
  /**
   * Insight Title: stress test
   * Insight ID: aab605NsggsM
   */,
  StressTest: "aab605NsggsM"
  /**
   * Insight Title: Attribute header reset
   * Insight ID: aacyTvsBfmwp
   */,
  AttributeHeaderReset: "aacyTvsBfmwp"
  /**
   * Insight Title: sorted according hidden column
   * Insight ID: aaczfN7Dd8A2
   */,
  SortedAccordingHiddenColumn: "aaczfN7Dd8A2"
  /**
   * Insight Title: can be saved
   * Insight ID: aaeAure9eQHc
   */,
  CanBeSaved: "aaeAure9eQHc"
  /**
   * Insight Title: only columns
   * Insight ID: aasGhOGacLs1
   */,
  OnlyColumns: "aasGhOGacLs1"
  /**
   * Insight Title: bar with sorting
   * Insight ID: aaEJ28LWaYcY
   */,
  BarWithSorting: "aaEJ28LWaYcY"
  /**
   * Insight Title: Sales reps
   * Insight ID: aahDSuhzfVqo
   */,
  SalesReps: "aahDSuhzfVqo"
  /**
   * Insight Title: MD test
   * Insight ID: aagEubiYiBq9
   */,
  MDTest: "aagEubiYiBq9"
  /**
   * Insight Title: sorting
   * Insight ID: aafETwFFersP
   */,
  Sorting_1: "aafETwFFersP"
  /**
   * Insight Title: all
   * Insight ID: aabdPiKzhR9P
   */,
  All: "aabdPiKzhR9P"
  /**
   * Insight Title: filtered
   * Insight ID: aaNdsUT4dVvf
   */,
  Filtered: "aaNdsUT4dVvf"
  /**
   * Insight Title: pokus
   * Insight ID: aaLjH6XZglJf
   */,
  Pokus: "aaLjH6XZglJf"
  /**
   * Insight Title: column with props
   * Insight ID: abboKqWeeura
   */,
  ColumnWithProps: "abboKqWeeura"
  /**
   * Insight Title: test
   * Insight ID: aagpWGYAaqe5
   */,
  Test_2: "aagpWGYAaqe5"
  /**
   * Insight Title: no props1
   * Insight ID: aaiuUg1kcsgM
   */,
  NoProps1: "aaiuUg1kcsgM"
  /**
   * Insight Title: with 1 width
   * Insight ID: aadrmk3ch5mK
   */,
  With1Width: "aadrmk3ch5mK"
  /**
   * Insight Title: no width
   * Insight ID: aagrk7fNdQLg
   */,
  NoWidth: "aagrk7fNdQLg"
  /**
   * Insight Title: no w 2
   * Insight ID: aaHrmqfmeeSK
   */,
  NoW2: "aaHrmqfmeeSK"
  /**
   * Insight Title: no w 3
   * Insight ID: aadrsATVcxCB
   */,
  NoW3: "aadrsATVcxCB"
  /**
   * Insight Title: empty w
   * Insight ID: aaArmNCweeZS
   */,
  EmptyW: "aaArmNCweeZS"
  /**
   * Insight Title: small table
   * Insight ID: aafrSiTucra5
   */,
  SmallTable: "aafrSiTucra5"
  /**
   * Insight Title: many columns
   * Insight ID: aaDxNJQ6fbNe
   */,
  ManyColumns: "aaDxNJQ6fbNe"
  /**
   * Insight Title: No resizing
   * Insight ID: aabmY2pxdHp8
   */,
  NoResizing: "aabmY2pxdHp8"
  /**
   * Insight Title: bars
   * Insight ID: aabnuAkKcXXd
   */,
  Bars: "aabnuAkKcXXd"
  /**
   * Insight Title: big table
   * Insight ID: aaiopN4WgAby
   */,
  BigTable: "aaiopN4WgAby"
  /**
   * Insight Title: broken
   * Insight ID: aae5VfgJcs5X
   */,
  Broken: "aae5VfgJcs5X"
  /**
   * Insight Title: Line density
   * Insight ID: aac8ESwgeDE1
   */,
  LineDensity: "aac8ESwgeDE1"
  /**
   * Insight Title: table with size
   * Insight ID: aasNKwNxePj8
   */,
  TableWithSize: "aasNKwNxePj8"
  /**
   * Insight Title: bubble
   * Insight ID: aaoN8gt9bHjy
   */,
  Bubble: "aaoN8gt9bHjy"
  /**
   * Insight Title: donut
   * Insight ID: aalN9OZwccI1
   */,
  Donut: "aalN9OZwccI1"
  /**
   * Insight Title: resized
   * Insight ID: aawlL4AXdsgp
   */,
  Resized: "aawlL4AXdsgp"
  /**
   * Insight Title: testik
   * Insight ID: aaFmQqaNaWzh
   */,
  Testik: "aaFmQqaNaWzh"
  /**
   * Insight Title: POP Headline
   * Insight ID: aacc1SQKbJLf
   */,
  POPHeadline: "aacc1SQKbJLf"
  /**
   * Insight Title: base bar
   * Insight ID: aadq8r4oaCJ7
   */,
  BaseBar: "aadq8r4oaCJ7"
  /**
   * Insight Title: no manual1
   * Insight ID: aalbW644dctf
   */,
  NoManual1: "aalbW644dctf"
  /**
   * Insight Title: manual
   * Insight ID: aacb0t2tehGK
   */,
  Manual: "aacb0t2tehGK"
  /**
   * Insight Title: def sort
   * Insight ID: aahm9n6edHhR
   */,
  DefSort: "aahm9n6edHhR"
  /**
   * Insight Title: with date
   * Insight ID: aacD4oAqeJpx
   */,
  WithDate: "aacD4oAqeJpx"
  /**
   * Insight Title: fixed sorting
   * Insight ID: aacE5nB9gzqd
   */,
  FixedSorting: "aacE5nB9gzqd"
  /**
   * Insight Title: Multi D table
   * Insight ID: aadjhk9KdeUX
   */,
  MultiDTable: "aadjhk9KdeUX"
  /**
   * Insight Title: Multi D column
   * Insight ID: aabtmwtcfRsO
   */,
  MultiDColumn: "aabtmwtcfRsO"
  /**
   * Insight Title: mD
   * Insight ID: aabZpfhshyfA
   */,
  MD: "aabZpfhshyfA"
  /**
   * Insight Title: Pop measure
   * Insight ID: aac8fF6vd9vL
   */,
  PopMeasure: "aac8fF6vd9vL"
  /**
   * Insight Title: Complex bar chart
   * Insight ID: aadSZFK9cAGh
   */,
  ComplexBarChart: "aadSZFK9cAGh"
  /**
   * Insight Title: test 1
   * Insight ID: aadT73BGhMSh
   */,
  Test1: "aadT73BGhMSh"
  /**
   * Insight Title: test 2
   * Insight ID: aabUanxSfyvt
   */,
  Test2: "aabUanxSfyvt"
  /**
   * Insight Title: test3
   * Insight ID: aabUb6F6iF71
   */,
  Test3: "aabUb6F6iF71"
  /**
   * Insight Title: column with date in V and F
   * Insight ID: aaCUlJVIhJdj
   */,
  ColumnWithDateInVAndF: "aaCUlJVIhJdj"
  /**
   * Insight Title: Ctrl
   * Insight ID: aagicuUaeVxU
   */,
  Ctrl: "aagicuUaeVxU"
  /**
   * Insight Title: new
   * Insight ID: aabAhUAUc8AR
   */,
  New: "aabAhUAUc8AR"
  /**
   * Insight Title: Headline
   * Insight ID: aagLhVN4iDrU
   */,
  Headline: "aagLhVN4iDrU"
  /**
   * Insight Title: Small line
   * Insight ID: aaju3zCpb0Gl
   */,
  SmallLine: "aaju3zCpb0Gl"
  /**
   * Insight Title: down legend
   * Insight ID: aaovlohdf4SY
   */,
  DownLegend: "aaovlohdf4SY"
  /**
   * Insight Title: Close bop Headline
   * Insight ID: aac8QN74ey1S
   */,
  CloseBopHeadline: "aac8QN74ey1S"
  /**
   * Insight Title: stacked by measure
   * Insight ID: aabIEcwmbnEE
   */,
  StackedByMeasure: "aabIEcwmbnEE"
  /**
   * Insight Title: too many to display
   * Insight ID: aacirIm7bC40
   */,
  TooManyToDisplay: "aacirIm7bC40"
  /**
   * Insight Title: kokot 2
   * Insight ID: aacdUsvmdX7D
   */,
  Kokot2: "aacdUsvmdX7D"
  /**
   * Insight Title: Copy of POP Headline as table
   * Insight ID: aaHdJw6VbFvz
   */,
  CopyOfPOPHeadlineAsTable: "aaHdJw6VbFvz"
  /**
   * Insight Title: Copy of POP Headline as table
   * Insight ID: aaieUAegewKc
   */,
  CopyOfPOPHeadlineAsTable_1: "aaieUAegewKc"
  /**
   * Insight Title: adhoc
   * Insight ID: aafvBGGegtXB
   */,
  Adhoc: "aafvBGGegtXB"
  /**
   * Insight Title: test
   * Insight ID: aabvF29Phet9
   */,
  Test_3: "aabvF29Phet9"
  /**
   * Insight Title: Copy of POP Headline
   * Insight ID: aakwUmYbdN2d
   */,
  CopyOfPOPHeadline: "aakwUmYbdN2d"
  /**
   * Insight Title: Copy of Close bop Headline
   * Insight ID: aabSnHyDcG1b
   */,
  CopyOfCloseBopHeadline: "aabSnHyDcG1b"
  /**
   * Insight Title: Copy of Close bop Headline
   * Insight ID: aabSpWYoc4mJ
   */,
  CopyOfCloseBopHeadline_1: "aabSpWYoc4mJ"
  /**
   * Insight Title: bar 2VB
   * Insight ID: aadbzjNPaoaL
   */,
  Bar2VB: "aadbzjNPaoaL"
  /**
   * Insight Title: dual axes
   * Insight ID: aaehhPlSfm9f
   */,
  DualAxes: "aaehhPlSfm9f"
  /**
   * Insight Title: Bar 2V 1S
   * Insight ID: aablvFzdfhwa
   */,
  Bar2V1S: "aablvFzdfhwa"
  /**
   * Insight Title: dual bar
   * Insight ID: aaMmWQ4GcpKx
   */,
  DualBar: "aaMmWQ4GcpKx"
  /**
   * Insight Title: col 2V
   * Insight ID: aajrvZbQfYM3
   */,
  Col2V: "aajrvZbQfYM3"
  /**
   * Insight Title: crash
   * Insight ID: aabulejzfqBJ
   */,
  Crash: "aabulejzfqBJ"
  /**
   * Insight Title: 2VB long
   * Insight ID: aacPRrKHhbxM
   */,
  _2VBLong: "aacPRrKHhbxM"
  /**
   * Insight Title: bar 1VB
   * Insight ID: aaC1aKX0cyVx
   */,
  Bar1VB: "aaC1aKX0cyVx"
  /**
   * Insight Title: Col 1VB
   * Insight ID: aab57LazfFDw
   */,
  Col1VB: "aab57LazfFDw"
  /**
   * Insight Title: act types
   * Insight ID: aakzs5avcuht
   */,
  ActTypes: "aakzs5avcuht"
  /**
   * Insight Title: Col by AT
   * Insight ID: aaeTr7g3cMJK
   */,
  ColByAT: "aaeTr7g3cMJK"
  /**
   * Insight Title: table
   * Insight ID: aaHaY8gjimJL
   */,
  Table_1: "aaHaY8gjimJL"
  /**
   * Insight Title: complex table drilling
   * Insight ID: aaeq7EtFhqC7
   */,
  ComplexTableDrilling: "aaeq7EtFhqC7"
  /**
   * Insight Title: just rows
   * Insight ID: aacq6vsXaOUu
   */,
  JustRows: "aacq6vsXaOUu"
  /**
   * Insight Title: Bar 2Vb1Sb
   * Insight ID: aabu9Qc7b3EY
   */,
  Bar2Vb1Sb: "aabu9Qc7b3EY"
  /**
   * Insight Title: by date
   * Insight ID: aabYlee6IShA
   */,
  ByDate: "aabYlee6IShA"
  /**
   * Insight Title: Act types 2
   * Insight ID: aac9xpapamu6
   */,
  ActTypes2: "aac9xpapamu6"
  /**
   * Insight Title: DD table
   * Insight ID: aaf9QrS7fgum
   */,
  DDTable: "aaf9QrS7fgum"
  /**
   * Insight Title: multiple same attrs
   * Insight ID: aabcTPgGJchR
   */,
  MultipleSameAttrs: "aabcTPgGJchR"
  /**
   * Insight Title: insight to delete
   * Insight ID: aan4qStLZ4lX
   */,
  InsightToDelete: "aan4qStLZ4lX"
  /**
   * Insight Title: Explore
   * Insight ID: aadJO2QQc0Ji
   */,
  Explore: "aadJO2QQc0Ji"
  /**
   * Insight Title: date insight
   * Insight ID: aacq1c1UdYWX
   */,
  DateInsight: "aacq1c1UdYWX"
  /**
   * Insight Title: Drill down insight
   * Insight ID: aabaY7YPhHVG
   */,
  DrillDownInsight: "aabaY7YPhHVG"
  /**
   * Insight Title: to filter
   * Insight ID: aabIeFd5QZsY
   */,
  ToFilter: "aabIeFd5QZsY"
  /**
   * Insight Title: w1
   * Insight ID: aajMXqIVhpN9
   */,
  W1: "aajMXqIVhpN9"
  /**
   * Insight Title: too l to c
   * Insight ID: aabTWUfj8IRM
   */,
  TooLToC: "aabTWUfj8IRM"
  /**
   * Insight Title: Headline
   * Insight ID: aadp8NB3jHEK
   */,
  Headline_1: "aadp8NB3jHEK"
  /**
   * Insight Title: Editors headline
   * Insight ID: aabGPzwF4AIZ
   */,
  EditorsHeadline: "aabGPzwF4AIZ"
  /**
   * Insight Title: rep by name
   * Insight ID: aaU5Q0gaBBmr
   */,
  RepByName: "aaU5Q0gaBBmr"
  /**
   * Insight Title: by different DF
   * Insight ID: aac5SyOldVal
   */,
  ByDifferentDF: "aac5SyOldVal"
  /**
   * Insight Title: Editors chart
   * Insight ID: aacMMvKhNeRN
   */,
  EditorsChart: "aacMMvKhNeRN"
  /**
   * Insight Title: table with change measure
   * Insight ID: aabBSFHC77O6
   */,
  TableWithChangeMeasure: "aabBSFHC77O6"
  /**
   * Insight Title: Headline with change
   * Insight ID: aacC7pwXGBye
   */,
  HeadlineWithChange: "aacC7pwXGBye"
  /**
   * Insight Title: sorting
   * Insight ID: aacWPNqsNllV
   */,
  Sorting_2: "aacWPNqsNllV"
  /**
   * Insight Title: date
   * Insight ID: aagWW21KVGIT
   */,
  Date: "aagWW21KVGIT"
  /**
   * Insight Title: Sorted table
   * Insight ID: aamDWJlEewBU
   */,
  SortedTable_2: "aamDWJlEewBU"
  /**
   * Insight Title: bar sorted
   * Insight ID: aaddPHQiyq8M
   */,
  BarSorted: "aaddPHQiyq8M"
  /**
   * Insight Title: small
   * Insight ID: aabd7NRKRhGt
   */,
  Small: "aabd7NRKRhGt"
  /**
   * Insight Title: Stage name
   * Insight ID: aahGoUrIsWry
   */,
  StageName_1: "aahGoUrIsWry"
  /**
   * Insight Title: date format
   * Insight ID: aafeFED2wtk5
   */,
  DateFormat: "aafeFED2wtk5"
  /**
   * Insight Title: test
   * Insight ID: aabXK0DgyFMs
   */,
  Test_4: "aabXK0DgyFMs"
  /**
   * Insight Title: test def sortu
   * Insight ID: aahfLZMtjYbm
   */,
  TestDefSortu: "aahfLZMtjYbm"
  /**
   * Insight Title: sorted table2
   * Insight ID: aadTQIuaEqW1
   */,
  SortedTable2: "aadTQIuaEqW1"
  /**
   * Insight Title: table
   * Insight ID: aacUJsFGXCOB
   */,
  Table_2: "aacUJsFGXCOB"
  /**
   * Insight Title: with default
   * Insight ID: aab4SIgPeRBd
   */,
  WithDefault: "aab4SIgPeRBd"
  /**
   * Insight Title: with expl sort
   * Insight ID: aac4QszsjIKr
   */,
  WithExplSort: "aac4QszsjIKr"
  /**
   * Insight Title: stacked
   * Insight ID: aaed4IjA6Ow7
   */,
  Stacked: "aaed4IjA6Ow7"
  /**
   * Insight Title: bar with table sort
   * Insight ID: aaffvMHTBFkY
   */,
  BarWithTableSort: "aaffvMHTBFkY"
  /**
   * Insight Title: bar with table 2
   * Insight ID: aaifs2Y7x9jA
   */,
  BarWithTable2: "aaifs2Y7x9jA"
  /**
   * Insight Title: Bar from table 3
   * Insight ID: aarfs22gx7xs
   */,
  BarFromTable3: "aarfs22gx7xs"
  /**
   * Insight Title: 2m 1vb
   * Insight ID: aadjywxJHoNy
   */,
  _2m1vb: "aadjywxJHoNy"
  /**
   * Insight Title: pie
   * Insight ID: aakjJNvHH1PW
   */,
  Pie: "aakjJNvHH1PW"
  /**
   * Insight Title: Col 1m 1v
   * Insight ID: aadSLlbcfuTp
   */,
  Col1m1v: "aadSLlbcfuTp"
  /**
   * Insight Title: col 1 2 1
   * Insight ID: aacS8uC0aA1b
   */,
  Col121: "aacS8uC0aA1b"
  /**
   * Insight Title: aaa
   * Insight ID: aac96JvwxHGY
   */,
  Aaa: "aac96JvwxHGY"
  /**
   * Insight Title: def sort
   * Insight ID: aadadn1NylF6
   */,
  DefSort_1: "aadadn1NylF6"
  /**
   * Insight Title: filtered
   * Insight ID: aagU5Hcioozm
   */,
  Filtered_1: "aagU5Hcioozm"
  /**
   * Insight Title: By order
   * Insight ID: aadjcLYLUMRG
   */,
  ByOrder: "aadjcLYLUMRG"
  /**
   * Insight Title: Non unique
   * Insight ID: aabjlHTsXyqV
   */,
  NonUnique: "aabjlHTsXyqV"
  /**
   * Insight Title: sorted bar
   * Insight ID: aaol8o6pyXJW
   */,
  SortedBar: "aaol8o6pyXJW"
  /**
   * Insight Title: Table Stage name
   * Insight ID: aai71kYYCrrU
   */,
  TableStageName: "aai71kYYCrrU"
  /**
   * Insight Title: Filtered stage name stg3
   * Insight ID: aabkJvsz8ckU
   */,
  FilteredStageNameStg3: "aabkJvsz8ckU"
  /**
   * Insight Title: date filtered metric table with very long name to be truncated in insight list
   * Insight ID: aaddGIUfwoLX
   */,
  DateFilteredMetricTableWithVeryLongNameToBeTruncatedInInsightList: "aaddGIUfwoLX"
  /**
   * Insight Title: Too many
   * Insight ID: aadfW2gPBBSb
   */,
  TooMany: "aadfW2gPBBSb"
  /**
   * Insight Title: Quota
   * Insight ID: aabf2aIvJ9GI
   */,
  Quota_1: "aabf2aIvJ9GI"
  /**
   * Insight Title: Multi line desc
   * Insight ID: aaeO7C60F9qG
   */,
  MultiLineDesc: "aaeO7C60F9qG"
  /**
   * Insight Title: New chart
   * Insight ID: aabFNUmGdFau
   */,
  NewChart: "aabFNUmGdFau"
  /**
   * Insight Title: Combo
   * Insight ID: aah2BzefDVsX
   */,
  Combo_1: "aah2BzefDVsX"
  /**
   * Insight Title: asdfasd
   * Insight ID: aab2GubNG29e
   */,
  Asdfasd: "aab2GubNG29e"
  /**
   * Insight Title: Statistiky polozek
   * Insight ID: aaeBb40YTtfN
   */,
  StatistikyPolozek: "aaeBb40YTtfN"
  /**
   * Insight Title: aaa
   * Insight ID: aadBgqTj6nyX
   */,
  Aaa_1: "aadBgqTj6nyX",
};
export const Dashboards = {
  /**
   * Dashboard Title: multi2
   * Dashboard ID: aaiG09bedzcR
   */
  Multi2: "aaiG09bedzcR"
  /**
   * Dashboard Title: empty
   * Dashboard ID: aabM1oQod0uW
   */,
  Empty: "aabM1oQod0uW"
  /**
   * Dashboard Title: too many on dashboard with long dashboard name
   * Dashboard ID: aacW4T0eaHCx
   */,
  TooManyOnDashboardWithLongDashboardName: "aacW4T0eaHCx"
  /**
   * Dashboard Title: Kpi drills
   * Dashboard ID: aaektB4xhAaj
   */,
  KpiDrills: "aaektB4xhAaj"
  /**
   * Dashboard Title: internal drilling
   * Dashboard ID: aadvUG9QagbR
   */,
  InternalDrilling: "aadvUG9QagbR"
  /**
   * Dashboard Title: new widget
   * Dashboard ID: aahaPQm8aF8L
   */,
  NewWidget: "aahaPQm8aF8L"
  /**
   * Dashboard Title: Drilling
   * Dashboard ID: aaf9Z1Cthy5W
   */,
  Drilling: "aaf9Z1Cthy5W"
  /**
   * Dashboard Title: 6Cols5test1
   * Dashboard ID: aamfITbRfFaY
   */,
  _6Cols5test1: "aamfITbRfFaY"
  /**
   * Dashboard Title: ONE-4224 table reexecution
   * Dashboard ID: aabf2DzriFTZ
   */,
  ONE4224TableReexecution: "aabf2DzriFTZ"
  /**
   * Dashboard Title: Interaction cleanup
   * Dashboard ID: aabf5Q1IbRuc
   */,
  InteractionCleanup: "aabf5Q1IbRuc"
  /**
   * Dashboard Title: long widget title and also pretty long dashboard name to truncate it in the list
   * Dashboard ID: aagCsVZ7ezEk
   */,
  LongWidgetTitleAndAlsoPrettyLongDashboardNameToTruncateItInTheList: "aagCsVZ7ezEk"
  /**
   * Dashboard Title: dashboard with table
   * Dashboard ID: aacnLebQinwi
   */,
  DashboardWithTable: "aacnLebQinwi"
  /**
   * Dashboard Title: wide table
   * Dashboard ID: aadznAeua3dZ
   */,
  WideTable_1: "aadznAeua3dZ"
  /**
   * Dashboard Title: ONE-4129test
   * Dashboard ID: aai04pnGeaHg
   */,
  ONE4129test: "aai04pnGeaHg"
  /**
   * Dashboard Title: totals table
   * Dashboard ID: aagk7Y1Eh6VB
   */,
  TotalsTable: "aagk7Y1Eh6VB"
  /**
   * Dashboard Title: newly created dashboard wit very long name to display it on the left
   * Dashboard ID: aabEx81shgBd
   */,
  NewlyCreatedDashboardWitVeryLongNameToDisplayItOnTheLeft: "aabEx81shgBd"
  /**
   * Dashboard Title: filter context
   * Dashboard ID: aaeVxORzbqnn
   */,
  FilterContext: "aaeVxORzbqnn"
  /**
   * Dashboard Title: target measure deleted
   * Dashboard ID: aaKzL3ruboht
   */,
  TargetMeasureDeleted: "aaKzL3ruboht"
  /**
   * Dashboard Title: drilling by date
   * Dashboard ID: aapdcoZrhrzT
   */,
  DrillingByDate: "aapdcoZrhrzT"
  /**
   * Dashboard Title: exttremly long name of dashboard which should be in tooltip on oposite side of dashboards list
   * Dashboard ID: adFH0PwxamlU
   */,
  ExttremlyLongNameOfDashboardWhichShouldBeInTooltipOnOpositeSideOfDashboardsList: "adFH0PwxamlU"
  /**
   * Dashboard Title: size reset
   * Dashboard ID: aaAIQvxWasGt
   */,
  SizeReset: "aaAIQvxWasGt"
  /**
   * Dashboard Title: target dashboard
   * Dashboard ID: aaTmx5V0gJMu
   */,
  TargetDashboard: "aaTmx5V0gJMu"
  /**
   * Dashboard Title: Source dashboard
   * Dashboard ID: aaKmxUCyazaC
   */,
  SourceDashboard: "aaKmxUCyazaC"
  /**
   * Dashboard Title: Source old date
   * Dashboard ID: aabBJ6DKb77B
   */,
  SourceOldDate: "aabBJ6DKb77B"
  /**
   * Dashboard Title: widget properties
   * Dashboard ID: aarDYsTZh5yb
   */,
  WidgetProperties: "aarDYsTZh5yb"
  /**
   * Dashboard Title: Ctrl width
   * Dashboard ID: aadLm5HRa5NY
   */,
  CtrlWidth: "aadLm5HRa5NY"
  /**
   * Dashboard Title: table with widths2
   * Dashboard ID: aakunCjBhE1Q
   */,
  TableWithWidths2: "aakunCjBhE1Q"
  /**
   * Dashboard Title: reseted
   * Dashboard ID: aaLxON3Uglg1
   */,
  Reseted: "aaLxON3Uglg1"
  /**
   * Dashboard Title: test logu
   * Dashboard ID: aatcLuCZgu7F
   */,
  TestLogu: "aatcLuCZgu7F"
  /**
   * Dashboard Title: test
   * Dashboard ID: aakcR9U8af27
   */,
  Test_5: "aakcR9U8af27"
  /**
   * Dashboard Title: test
   * Dashboard ID: aafc42ZfaTNP
   */,
  Test_6: "aafc42ZfaTNP"
  /**
   * Dashboard Title: Resized table
   * Dashboard ID: aaom5ddSfzUx
   */,
  ResizedTable: "aaom5ddSfzUx"
  /**
   * Dashboard Title: sections
   * Dashboard ID: aadfUrkNcBj8
   */,
  Sections: "aadfUrkNcBj8"
  /**
   * Dashboard Title: tooltip cut off
   * Dashboard ID: aaoN9UkFaFLB
   */,
  TooltipCutOff: "aaoN9UkFaFLB"
  /**
   * Dashboard Title: ashoj
   * Dashboard ID: aabUKDMzcbnL
   */,
  Ashoj: "aabUKDMzcbnL"
  /**
   * Dashboard Title: resized
   * Dashboard ID: aallODX5fz93
   */,
  Resized_1: "aallODX5fz93"
  /**
   * Dashboard Title: Parent filter
   * Dashboard ID: aabyK5NJe85e
   */,
  ParentFilter: "aabyK5NJe85e"
  /**
   * Dashboard Title: Untitled
   * Dashboard ID: aac1iek1csn9
   */,
  Untitled: "aac1iek1csn9"
  /**
   * Dashboard Title: Untitled
   * Dashboard ID: aad1KxzGeI1K
   */,
  Untitled_1: "aad1KxzGeI1K"
  /**
   * Dashboard Title: empty
   * Dashboard ID: aaexSpYLe4kO
   */,
  Empty_1: "aaexSpYLe4kO"
  /**
   * Dashboard Title: kpi+headline
   * Dashboard ID: aaj0trtRbDRv
   */,
  KpiHeadline: "aaj0trtRbDRv"
  /**
   * Dashboard Title: manual resizing
   * Dashboard ID: aafb0ScycsyU
   */,
  ManualResizing: "aafb0ScycsyU"
  /**
   * Dashboard Title: manual-no resizing
   * Dashboard ID: aalmdRgZfzf9
   */,
  ManualNoResizing: "aalmdRgZfzf9"
  /**
   * Dashboard Title: Untitled
   * Dashboard ID: aaijGUGXhPDz
   */,
  Untitled_2: "aaijGUGXhPDz"
  /**
   * Dashboard Title: Untitled
   * Dashboard ID: aadsRmpngpnT
   */,
  Untitled_3: "aadsRmpngpnT"
  /**
   * Dashboard Title: Simple
   * Dashboard ID: aalSEdPshQGJ
   */,
  Simple: "aalSEdPshQGJ"
  /**
   * Dashboard Title: Untitled
   * Dashboard ID: aakfUwTram6H
   */,
  Untitled_4: "aakfUwTram6H"
  /**
   * Dashboard Title: KPI def
   * Dashboard ID: aafD7Z0McS9j
   */,
  KPIDef: "aafD7Z0McS9j"
  /**
   * Dashboard Title: Untitled
   * Dashboard ID: aaeOXRofcKu9
   */,
  Untitled_5: "aaeOXRofcKu9"
  /**
   * Dashboard Title: empty space
   * Dashboard ID: aadk5oeqaG7u
   */,
  EmptySpace: "aadk5oeqaG7u"
  /**
   * Dashboard Title: Untitled
   * Dashboard ID: aaDtVuligJTN
   */,
  Untitled_6: "aaDtVuligJTN"
  /**
   * Dashboard Title: Untitled
   * Dashboard ID: aajuF0pXeMhg
   */,
  Untitled_7: "aajuF0pXeMhg"
  /**
   * Dashboard Title: POP headline
   * Dashboard ID: aafYipvkdluy
   */,
  POPHeadline_1: "aafYipvkdluy"
  /**
   * Dashboard Title: pdf
   * Dashboard ID: aab4b1H1f2yz
   */,
  Pdf: "aab4b1H1f2yz"
  /**
   * Dashboard Title: DD points
   * Dashboard ID: aae4ALwreNPZ
   */,
  DDPoints: "aae4ALwreNPZ"
  /**
   * Dashboard Title: filled DZ
   * Dashboard ID: aah5py1lh8Ic
   */,
  FilledDZ: "aah5py1lh8Ic"
  /**
   * Dashboard Title: two
   * Dashboard ID: aad5IkaAf6rt
   */,
  Two: "aad5IkaAf6rt"
  /**
   * Dashboard Title: Untitled
   * Dashboard ID: aauwzKaqbBEB
   */,
  Untitled_8: "aauwzKaqbBEB"
  /**
   * Dashboard Title: sections
   * Dashboard ID: aadxyjhSamLC
   */,
  Sections_1: "aadxyjhSamLC"
  /**
   * Dashboard Title: 1 H
   * Dashboard ID: aajJmoMfhANE
   */,
  _1H: "aajJmoMfhANE"
  /**
   * Dashboard Title: KPI/Headline responsiveness
   * Dashboard ID: aanpdhE7c5OC
   */,
  KPIHeadlineResponsiveness: "aanpdhE7c5OC"
  /**
   * Dashboard Title: truncated KPI
   * Dashboard ID: aaptoJAPh6uZ
   */,
  TruncatedKPI: "aaptoJAPh6uZ"
  /**
   * Dashboard Title: bar chart 2
   * Dashboard ID: aa3abEUsasdY
   */,
  BarChart2: "aa3abEUsasdY"
  /**
   * Dashboard Title: dual
   * Dashboard ID: aadhhPlSfm9f
   */,
  Dual: "aadhhPlSfm9f"
  /**
   * Dashboard Title: bar chart 2
   * Dashboard ID: aaklGCfkex4b
   */,
  BarChart2_1: "aaklGCfkex4b"
  /**
   * Dashboard Title: col chart
   * Dashboard ID: aabs7YszdJpS
   */,
  ColChart: "aabs7YszdJpS"
  /**
   * Dashboard Title: Untitled
   * Dashboard ID: aaeztQT1c1BC
   */,
  Untitled_9: "aaeztQT1c1BC"
  /**
   * Dashboard Title: table mixing MR and AR
   * Dashboard ID: aaCaYIhXcRGS
   */,
  TableMixingMRAndAR: "aaCaYIhXcRGS"
  /**
   * Dashboard Title: table with drilling
   * Dashboard ID: aadtvJ7mhCha
   */,
  TableWithDrilling: "aadtvJ7mhCha"
  /**
   * Dashboard Title: Chart with drilling
   * Dashboard ID: aaczaZltcP55
   */,
  ChartWithDrilling: "aaczaZltcP55"
  /**
   * Dashboard Title: drill from attribute
   * Dashboard ID: aabu9YkWBLa1
   */,
  DrillFromAttribute: "aabu9YkWBLa1"
  /**
   * Dashboard Title: Untitled
   * Dashboard ID: aauvBiisfvuI
   */,
  Untitled_10: "aauvBiisfvuI"
  /**
   * Dashboard Title: aaa
   * Dashboard ID: aabX2qGWDf1p
   */,
  Aaa_2: "aabX2qGWDf1p"
  /**
   * Dashboard Title: Delete insight
   * Dashboard ID: aaf4to9X0nr0
   */,
  DeleteInsight: "aaf4to9X0nr0"
  /**
   * Dashboard Title: Delete insight 2
   * Dashboard ID: aac4A40DcF7g
   */,
  DeleteInsight2: "aac4A40DcF7g"
  /**
   * Dashboard Title: filtered dashboard
   * Dashboard ID: aabwRHlMipBE
   */,
  FilteredDashboard: "aabwRHlMipBE"
  /**
   * Dashboard Title: Untitled
   * Dashboard ID: aabnt8Ki6gQT
   */,
  Untitled_11: "aabnt8Ki6gQT"
  /**
   * Dashboard Title: parent filters
   * Dashboard ID: aacWqgncin0p
   */,
  ParentFilters: "aacWqgncin0p"
  /**
   * Dashboard Title: drill filters
   * Dashboard ID: aabVPl9Ihrgk
   */,
  DrillFilters: "aabVPl9Ihrgk"
  /**
   * Dashboard Title: Drill down
   * Dashboard ID: aacaYAJAhyIS
   */,
  DrillDown: "aacaYAJAhyIS"
  /**
   * Dashboard Title: caching
   * Dashboard ID: aafqSH6dibwR
   */,
  Caching: "aafqSH6dibwR"
  /**
   * Dashboard Title: One KPI
   * Dashboard ID: aanqXEm1bGce
   */,
  OneKPI: "aanqXEm1bGce"
  /**
   * Dashboard Title: filter to AD transfer
   * Dashboard ID: aacIbSXJbqnf
   */,
  FilterToADTransfer: "aacIbSXJbqnf"
  /**
   * Dashboard Title: Bad caching
   * Dashboard ID: aakMXqIVhpN9
   */,
  BadCaching: "aakMXqIVhpN9"
  /**
   * Dashboard Title: restricted
   * Dashboard ID: aab7lz8S8zw1
   */,
  Restricted: "aab7lz8S8zw1"
  /**
   * Dashboard Title: Copy of multi
   * Dashboard ID: aai8SBrdB4ds
   */,
  CopyOfMulti: "aai8SBrdB4ds"
  /**
   * Dashboard Title: Copy of Copy of multi
   * Dashboard ID: aae8USPzaGrq
   */,
  CopyOfCopyOfMulti: "aae8USPzaGrq"
  /**
   * Dashboard Title: just KPI
   * Dashboard ID: aavoK0jTKGkH
   */,
  JustKPI: "aavoK0jTKGkH"
  /**
   * Dashboard Title: Editor's dashboard
   * Dashboard ID: aacGMuWxhr0z
   */,
  EditorSDashboard: "aacGMuWxhr0z"
  /**
   * Dashboard Title: new stg3
   * Dashboard ID: aacrVuChbXXt
   */,
  NewStg3: "aacrVuChbXXt"
  /**
   * Dashboard Title: new local
   * Dashboard ID: aabr21pIerMJ
   */,
  NewLocal: "aabr21pIerMJ"
  /**
   * Dashboard Title: new stg3 Local Copy
   * Dashboard ID: aadr2Titfrmm
   */,
  NewStg3LocalCopy: "aadr2Titfrmm"
  /**
   * Dashboard Title: Drill to the same attribute with different DF
   * Dashboard ID: aab5SN5nd6Hd
   */,
  DrillToTheSameAttributeWithDifferentDF: "aab5SN5nd6Hd"
  /**
   * Dashboard Title: viewer2's dashboard
   * Dashboard ID: aad6YazSA5WL
   */,
  Viewer2SDashboard: "aad6YazSA5WL"
  /**
   * Dashboard Title: Private from creation
   * Dashboard ID: aae7oIRqHUGU
   */,
  PrivateFromCreation: "aae7oIRqHUGU"
  /**
   * Dashboard Title: Untitled
   * Dashboard ID: aafcKzP6Wjqa
   */,
  Untitled_12: "aafcKzP6Wjqa"
  /**
   * Dashboard Title: locked by admin
   * Dashboard ID: aabnKAXW0YYQ
   */,
  LockedByAdmin: "aabnKAXW0YYQ"
  /**
   * Dashboard Title: Admins private resaved
   * Dashboard ID: aacMyDLNKPPx
   */,
  AdminsPrivateResaved: "aacMyDLNKPPx"
  /**
   * Dashboard Title: Admins private 2
   * Dashboard ID: aafMJqYXRh1f
   */,
  AdminsPrivate2: "aafMJqYXRh1f"
  /**
   * Dashboard Title: Editors private
   * Dashboard ID: aacMMHXeSdJm
   */,
  EditorsPrivate: "aacMMHXeSdJm"
  /**
   * Dashboard Title: Admins private without strict
   * Dashboard ID: aacMOGLjNrZd
   */,
  AdminsPrivateWithoutStrict: "aacMOGLjNrZd"
  /**
   * Dashboard Title: Limited drill target
   * Dashboard ID: aazHFZlQ9USx
   */,
  LimitedDrillTarget: "aazHFZlQ9USx"
  /**
   * Dashboard Title: Drill source
   * Dashboard ID: abLHGTcW9UTA
   */,
  DrillSource: "abLHGTcW9UTA"
  /**
   * Dashboard Title: new
   * Dashboard ID: aaeKI01uCRMA
   */,
  New_1: "aaeKI01uCRMA"
  /**
   * Dashboard Title: with table
   * Dashboard ID: aaegK5FY3ZSr
   */,
  WithTable: "aaegK5FY3ZSr"
  /**
   * Dashboard Title: Filtered
   * Dashboard ID: aabVaRatpVit
   */,
  Filtered_2: "aabVaRatpVit"
  /**
   * Dashboard Title: d2d source
   * Dashboard ID: aae73o7NCHpR
   */,
  D2dSource: "aae73o7NCHpR"
  /**
   * Dashboard Title: d2d target
   * Dashboard ID: aab759SNcPoK
   */,
  D2dTarget: "aab759SNcPoK"
  /**
   * Dashboard Title: test
   * Dashboard ID: aaj8ZCv9u4GY
   */,
  Test_7: "aaj8ZCv9u4GY"
  /**
   * Dashboard Title: target
   * Dashboard ID: aal86Q0Jv0Ex
   */,
  Target: "aal86Q0Jv0Ex"
  /**
   * Dashboard Title: Widget description
   * Dashboard ID: aac1LhMd6YDb
   */,
  WidgetDescription: "aac1LhMd6YDb"
  /**
   * Dashboard Title: Descriptions
   * Dashboard ID: aaflKfx5bq6Z
   */,
  Descriptions: "aaflKfx5bq6Z"
  /**
   * Dashboard Title: Untitled
   * Dashboard ID: aah3lJMrVDQh
   */,
  Untitled_13: "aah3lJMrVDQh"
  /**
   * Dashboard Title: Ivan test
   * Dashboard ID: aab6QyI2pT3Y
   */,
  IvanTest: "aab6QyI2pT3Y"
  /**
   * Dashboard Title: MUF Filtered
   * Dashboard ID: aagQn7Pgaeof
   */,
  MUFFiltered: "aagQn7Pgaeof"
  /**
   * Dashboard Title: None filter
   * Dashboard ID: aabuVLB4DcVk
   */,
  NoneFilter: "aabuVLB4DcVk"
  /**
   * Dashboard Title: Alert
   * Dashboard ID: aacBhduy3fok
   */,
  Alert: "aacBhduy3fok"
  /**
   * Dashboard Title: SSF
   * Dashboard ID: aab9VHuK918G
   */,
  SSF: "aab9VHuK918G",
};
