// (C) 2025 GoodData Corporation

// THIS FILE WAS AUTO-GENERATED USING CATALOG EXPORTER; YOU SHOULD NOT EDIT THIS FILE; GENERATE TIME: 2019-10-17T14:42:41.833Z;
import {
    newAttribute,
    newMeasure,
    IAttribute,
    IMeasure,
    IMeasureDefinition,
    modifySimpleMeasure,
    newNegativeAttributeFilter,
} from "../src/index.js";

/*
 * Contents of this file were taken from the tools/reference-workspace project; sdk-model cannot depend on that
 * project since that would form a circular dependency between projects (ref workspace depends on sdk-model to get
 * the type definitions and factories and so on)
 *
 * Thus a subset of the model in the reference project is copied here directly.
 *
 * NOTE: If you find yourself in need for additional attributes / measures to be included in this testing model,
 * then copy more stuff from reference workspace. We DO NOT want any 'custom', 'dummy', 'mock' measures here.
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
 * Metric Title: Win Rate
 * Metric ID: aaX0PIUzg7nF
 * Metric Type: MAQL Metric
 */
export const WinRate: IMeasure<IMeasureDefinition> = newMeasure("aaX0PIUzg7nF");
/**
 * Metric Title: Won
 * Metric ID: afSEwRwdbMeQ
 * Metric Type: MAQL Metric
 */
export const Won: IMeasure<IMeasureDefinition> = newMeasure("afSEwRwdbMeQ");

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
 * An adhoc measure with aggregation "sum"
 */
export const AggregateAdhoc = Duration.Sum;

/**
 * An adhoc measure with empty filters
 */
export const EmptyFiltersAdhoc = modifySimpleMeasure(Won, (m) => m.noFilters().defaultLocalId());

/**
 * An adhoc measure with non-empty filters
 */
export const NonEmptyFiltersAdhoc = modifySimpleMeasure(Won, (m) =>
    m.filters(newNegativeAttributeFilter(Account.Name, ["value"])).defaultLocalId(),
);

/**
 * An adhoc measure with a computeRatio of false
 */
export const FalseComputeRatioAdhoc = modifySimpleMeasure(Won, (m) => m.noRatio().defaultLocalId());

/**
 * An adhoc measure with a computeRatio of true
 */
export const TrueComputeRatioAdhoc = modifySimpleMeasure(Won, (m) => m.ratio().defaultLocalId());
