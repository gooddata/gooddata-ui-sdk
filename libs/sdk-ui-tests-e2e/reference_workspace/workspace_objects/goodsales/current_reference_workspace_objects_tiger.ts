// (C) 2024 GoodData Corporation

/* eslint-disable */
/* THIS FILE WAS AUTO-GENERATED USING CATALOG EXPORTER; YOU SHOULD NOT EDIT THIS FILE; GENERATE TIME: 2024-05-27T11:40:05.266Z; */
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
     * Display Form Title: Name
     * Display Form ID: label.f_account.account.name
     */
    Name: newAttribute("label.f_account.account.name"),
    /**
     * Display Form Title: Account
     * Display Form ID: attr.f_account.account
     */ Default: newAttribute("attr.f_account.account"),
};
/**
 * Attribute Title: Activity
 * Attribute ID: attr.f_activity.activity
 */
export const Activity = {
    /**
     * Display Form Title: Activity
     * Display Form ID: attr.f_activity.activity
     */
    Default: newAttribute("attr.f_activity.activity"),
    /**
     * Display Form Title: Subject
     * Display Form ID: label.f_activity.subject
     */ Subject: newAttribute("label.f_activity.subject"),
};
/**
 * Attribute Title: Opportunity
 * Attribute ID: attr.f_opportunity.opportunity
 */
export const Opportunity = {
    /**
     * Display Form Title: Opportunity
     * Display Form ID: attr.f_opportunity.opportunity
     */
    Default: newAttribute("attr.f_opportunity.opportunity"),
    /**
     * Display Form Title: SFDC URL
     * Display Form ID: label.f_opportunity.opportunity.sfdcurl
     */ SFDCURL: newAttribute("label.f_opportunity.opportunity.sfdcurl"),
    /**
     * Display Form Title: Opportunity Name
     * Display Form ID: label.f_opportunity.opportunity.name
     */ Name: newAttribute("label.f_opportunity.opportunity.name"),
};
/**
 * Attribute Title: Opp. Snapshot
 * Attribute ID: attr.f_opportunitysnapshot.oppsnapshot
 */
export const OppSnapshot: IAttribute = newAttribute("attr.f_opportunitysnapshot.oppsnapshot");
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
 * Attribute Title: Product
 * Attribute ID: attr.f_product.product
 */
export const Product = {
    /**
     * Display Form Title: Product Name
     * Display Form ID: label.f_product.product.name
     */
    Name: newAttribute("label.f_product.product.name"),
    /**
     * Display Form Title: Product
     * Display Form ID: attr.f_product.product
     */ Default: newAttribute("attr.f_product.product"),
    /**
     * Display Form Title: Product Link
     * Display Form ID: label.f_product.product.link
     */ Link: newAttribute("label.f_product.product.link"),
    /**
     * Display Form Title: Product Image
     * Display Form ID: label.f_product.product.image
     */ Image: newAttribute("label.f_product.product.image"),
};
/**
 * Attribute Title: Stage History
 * Attribute ID: attr.f_stagehistory.stagehistory
 */
export const StageHistory: IAttribute = newAttribute("attr.f_stagehistory.stagehistory");
/**
 * Attribute Title: Stage Name
 * Attribute ID: attr.f_stage.stagename
 */
export const StageName = {
    /**
     * Display Form Title: Stage Name
     * Display Form ID: attr.f_stage.stagename
     */
    Default: newAttribute("attr.f_stage.stagename"),
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
 * Attribute Title: County name
 * Attribute ID: county_name
 */
export const CountyName: IAttribute = newAttribute("county_name");
/**
 * Attribute Title: Account Id
 * Attribute ID: f_account.id
 */
export const AccountId: IAttribute = newAttribute("f_account.id");
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
 * Attribute Title: City
 * Attribute ID: f_city.id
 */
export const City = {
    /**
     * Display Form Title: Longitude
     * Display Form ID: f_city.id.longitude
     */
    Longitude: newAttribute("f_city.id.longitude"),
    /**
     * Display Form Title: Latitude
     * Display Form ID: f_city.id.latitude
     */ Latitude: newAttribute("f_city.id.latitude"),
    /**
     * Display Form Title: City ascii name
     * Display Form ID: f_city.id.cityasciiname
     */ AsciiName: newAttribute("f_city.id.cityasciiname"),
    /**
     * Display Form Title: City name
     * Display Form ID: f_city.id.cityname
     */ Name: newAttribute("f_city.id.cityname"),
    /**
     * Display Form Title: City short name
     * Display Form ID: f_city.id.cityshortname
     */ ShortName: newAttribute("f_city.id.cityshortname"),
    /**
     * Display Form Title: City
     * Display Form ID: f_city.id
     */ Default: newAttribute("f_city.id"),
    /**
     * Display Form Title: Location
     * Display Form ID: f_city.id.location
     */ Location: newAttribute("f_city.id.location"),
};
/**
 * Attribute Title: Opportunity Id
 * Attribute ID: f_opportunity.id
 */
export const OpportunityId: IAttribute = newAttribute("f_opportunity.id");
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
 * Attribute Title: Department
 * Attribute ID: f_owner.department_id
 */
export const Department = {
    /**
     * Display Form Title: Department
     * Display Form ID: f_owner.department_id
     */
    Default: newAttribute("f_owner.department_id"),
    /**
     * Display Form Title: Department hyperlink
     * Display Form ID: f_owner.department_id.departmenthyperlink
     */ Hyperlink: newAttribute("f_owner.department_id.departmenthyperlink"),
};
/**
 * Attribute Title: Owner Id
 * Attribute ID: f_owner.id
 */
export const OwnerId: IAttribute = newAttribute("f_owner.id");
/**
 * Attribute Title: Region
 * Attribute ID: f_owner.region_id
 */
export const Region = {
    /**
     * Display Form Title: Region hyperlink
     * Display Form ID: f_owner.region_id.regionhyperlink
     */
    Hyperlink: newAttribute("f_owner.region_id.regionhyperlink"),
    /**
     * Display Form Title: Region
     * Display Form ID: f_owner.region_id
     */ Default: newAttribute("f_owner.region_id"),
};
/**
 * Attribute Title: Product Id
 * Attribute ID: f_product.id
 */
export const ProductId: IAttribute = newAttribute("f_product.id");
/**
 * Attribute Title: Stage History Id
 * Attribute ID: f_stagehistory.id
 */
export const StageHistoryId: IAttribute = newAttribute("f_stagehistory.id");
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
 * Attribute Title: Timeline
 * Attribute ID: f_timeline.id
 */
export const Timeline: IAttribute = newAttribute("f_timeline.id");
/**
 * Attribute Title: State
 * Attribute ID: state_id
 */
export const State = {
    /**
     * Display Form Title: State
     * Display Form ID: state_id
     */
    Default: newAttribute("state_id"),
    /**
     * Display Form Title: State name
     * Display Form ID: state_id.statename
     */ Name: newAttribute("state_id.statename"),
};
/**
 * Attribute Title: Product that is renamed to test the long attribute name
 * Attribute ID: productthatisrenamedtotestthelongattributename
 */
export const ProductThatIsRenamedToTestTheLongAttributeName = {
    /**
     * Display Form Title: Product that is renamed to test the long attribute name
     * Display Form ID: productthatisrenamedtotestthelongattributename
     */
    Default: newAttribute("productthatisrenamedtotestthelongattributename"),
    /**
     * Display Form Title: Product that is renamed to test the long attribute name hyperlink
     * Display Form ID: productthatisrenamedtotestthelongattributename.productthatisrenamedtotestthelongattributenamehyperlink
     */ Hyperlink: newAttribute(
        "productthatisrenamedtotestthelongattributename.productthatisrenamedtotestthelongattributenamehyperlink",
    ),
};
/**
 * Metric Title: 2 literals in datetime_diff
 * Metric ID: 2_literals_in_datetime_diff
 * Metric Type: MAQL Metric
 */
export const _2LiteralsInDatetimeDiff: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("2_literals_in_datetime_diff", "measure"),
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
 * Metric Title: Amount [BOP]
 * Metric ID: amount_bop
 * Metric Type: MAQL Metric
 */
export const AmountBOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("amount_bop", "measure"));
/**
 * Metric Title: Argument bigger granularity
 * Metric ID: argument_bigger_granularity
 * Metric Type: MAQL Metric
 */
export const ArgumentBiggerGranularity: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("argument_bigger_granularity", "measure"),
);
/**
 * Metric Title: Avg. Amount
 * Metric ID: avg._amount
 * Metric Type: MAQL Metric
 */
export const AvgAmount: IMeasure<IMeasureDefinition> = newMeasure(idRef("avg._amount", "measure"));
/**
 * Metric Title: Probability
 * Metric ID: b4e3e3c7-ead3-4d69-8be4-23bcfe5ff7aa
 * Metric Type: MAQL Metric
 */
export const Probability: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("b4e3e3c7-ead3-4d69-8be4-23bcfe5ff7aa", "measure"),
);
/**
 * Metric Title: Best Case
 * Metric ID: best_case
 * Metric Type: MAQL Metric
 */
export const BestCase: IMeasure<IMeasureDefinition> = newMeasure(idRef("best_case", "measure"));
/**
 * Metric Title: _Snapshot [EOP]
 * Metric ID: c5ee7836-126c-41aa-bd69-1873d379a065
 * Metric Type: MAQL Metric
 */
export const SnapshotEOP: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("c5ee7836-126c-41aa-bd69-1873d379a065", "measure"),
);
/**
 * Metric Title: _Close [BOP]
 * Metric ID: close_bop
 * Metric Type: MAQL Metric
 */
export const CloseBOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("close_bop", "measure"));
/**
 * Metric Title: _Close [EOP]
 * Metric ID: close_eop
 * Metric Type: MAQL Metric
 */
export const CloseEOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("close_eop", "measure"));
/**
 * Metric Title: Count of sales rep and datetime condition
 * Metric ID: count_of_sales_rep_and_datetime_condition
 * Metric Type: MAQL Metric
 */
export const CountOfSalesRepAndDatetimeCondition: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("count_of_sales_rep_and_datetime_condition", "measure"),
);
/**
 * Metric Title: Count of sales rep with datetime add and max
 * Metric ID: count_of_sales_rep_with_datetime_add_and_max
 * Metric Type: MAQL Metric
 */
export const CountOfSalesRepWithDatetimeAddAndMax: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("count_of_sales_rep_with_datetime_add_and_max", "measure"),
);
/**
 * Metric Title: Count of sales rep with datetime and previous
 * Metric ID: count_of_sales_rep_with_datetime_and_previous
 * Metric Type: MAQL Metric
 */
export const CountOfSalesRepWithDatetimeAndPrevious: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("count_of_sales_rep_with_datetime_and_previous", "measure"),
);
/**
 * Metric Title: Count of sales rep with diff and 3 difference params
 * Metric ID: count_of_sales_rep_with_diff_and_3_difference_params
 * Metric Type: MAQL Metric
 */
export const CountOfSalesRepWithDiffAnd3DifferenceParams: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("count_of_sales_rep_with_diff_and_3_difference_params", "measure"),
);
/**
 * Metric Title: Count of sales rep with diff and add
 * Metric ID: count_of_sales_rep_with_diff_and_add
 * Metric Type: MAQL Metric
 */
export const CountOfSalesRepWithDiffAndAdd: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("count_of_sales_rep_with_diff_and_add", "measure"),
);
/**
 * Metric Title: Count of sales rep with diff and max by all other
 * Metric ID: count_of_sales_rep_with_diff_and_max_by_all_other
 * Metric Type: MAQL Metric
 */
export const CountOfSalesRepWithDiffAndMaxByAllOther: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("count_of_sales_rep_with_diff_and_max_by_all_other", "measure"),
);
/**
 * Metric Title: Count of sales reps with diff and max condition
 * Metric ID: count_sales_reps_with_diff_and_max_condition
 * Metric Type: MAQL Metric
 */
export const CountOfSalesRepsWithDiffAndMaxCondition: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("count_sales_reps_with_diff_and_max_condition", "measure"),
);
/**
 * Metric Title: Datetime add of day
 * Metric ID: datetime_add_of_day
 * Metric Type: MAQL Metric
 */
export const DatetimeAddOfDay: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_add_of_day", "measure"),
);
/**
 * Metric Title: Datetime add of hour
 * Metric ID: datetime_add_of_hour
 * Metric Type: MAQL Metric
 */
export const DatetimeAddOfHour: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_add_of_hour", "measure"),
);
/**
 * Metric Title: Datetime add of minute
 * Metric ID: datetime_add_of_minute
 * Metric Type: MAQL Metric
 */
export const DatetimeAddOfMinute: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_add_of_minute", "measure"),
);
/**
 * Metric Title: Datetime add of month
 * Metric ID: datetime_add_of_month
 * Metric Type: MAQL Metric
 */
export const DatetimeAddOfMonth: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_add_of_month", "measure"),
);
/**
 * Metric Title: Datetime add of this year
 * Metric ID: datetime_add_of_this_year
 * Metric Type: MAQL Metric
 */
export const DatetimeAddOfThisYear: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_add_of_this_year", "measure"),
);
/**
 * Metric Title: Datetime add of week
 * Metric ID: datetime_add_of_week
 * Metric Type: MAQL Metric
 */
export const DatetimeAddOfWeek: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_add_of_week", "measure"),
);
/**
 * Metric Title: Datetime add of year
 * Metric ID: datetime_add_of_year
 * Metric Type: MAQL Metric
 */
export const DatetimeAddOfYear: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_add_of_year", "measure"),
);
/**
 * Metric Title: Datetime add with if else
 * Metric ID: datetime_add_with_if_else
 * Metric Type: MAQL Metric
 */
export const DatetimeAddWithIfElse: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_add_with_if_else", "measure"),
);
/**
 * Metric Title: Datetime_add with quarter
 * Metric ID: datetime_add_with_quarter
 * Metric Type: MAQL Metric
 */
export const DatetimeAddWithQuarter: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_add_with_quarter", "measure"),
);
/**
 * Metric Title: Diff of month (2 difference params)
 * Metric ID: datetime_diff_of_month_2_diffrence_params
 * Metric Type: MAQL Metric
 */
export const DiffOfMonth2DifferenceParams: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_diff_of_month_2_diffrence_params", "measure"),
);
/**
 * Metric Title: Diff of month (2 params and string)
 * Metric ID: datetime_diff_of_month_2_params_string
 * Metric Type: MAQL Metric
 */
export const DiffOfMonth2ParamsAndString: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_diff_of_month_2_params_string", "measure"),
);
/**
 * Metric Title: Diff of month (2 same params)
 * Metric ID: datetime_diff_of_month_2_same_params
 * Metric Type: MAQL Metric
 */
export const DiffOfMonth2SameParams: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_diff_of_month_2_same_params", "measure"),
);
/**
 * Metric Title: Diff of month (3 difference params)
 * Metric ID: datetime_diff_of_month_3_diffenrence_params
 * Metric Type: MAQL Metric
 */
export const DiffOfMonth3DifferenceParams: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_diff_of_month_3_diffenrence_params", "measure"),
);
/**
 * Metric Title: Diff of month (3 parameters)
 * Metric ID: datetime_diff_of_month_3_parameters
 * Metric Type: MAQL Metric
 */
export const DiffOfMonth3Parameters: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_diff_of_month_3_parameters", "measure"),
);
/**
 * Metric Title: Diff of month (3 params and string)
 * Metric ID: datetime_diff_of_month_3_params_string
 * Metric Type: MAQL Metric
 */
export const DiffOfMonth3ParamsAndString: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_diff_of_month_3_params_string", "measure"),
);
/**
 * Metric Title: Diff of week (2 same params)
 * Metric ID: datetime_diff_of_week_2_same_params
 * Metric Type: MAQL Metric
 */
export const DiffOfWeek2SameParams: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_diff_of_week_2_same_params", "measure"),
);
/**
 * Metric Title: Diff of week (3 parameters)
 * Metric ID: datetime_diff_of_week_3_parameters
 * Metric Type: MAQL Metric
 */
export const DiffOfWeek3Parameters: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_diff_of_week_3_parameters", "measure"),
);
/**
 * Metric Title: Diff of week (month week)
 * Metric ID: datetime_diff_of_week_month_week
 * Metric Type: MAQL Metric
 */
export const DiffOfWeekMonthWeek: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_diff_of_week_month_week", "measure"),
);
/**
 * Metric Title: Diff of week (week year)
 * Metric ID: datetime_diff_of_week_week_year
 * Metric Type: MAQL Metric
 */
export const DiffOfWeekWeekYear: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_diff_of_week_week_year", "measure"),
);
/**
 * Metric Title: Diff of year (2 parameters)
 * Metric ID: datetime_diff_of_year_2_parameters
 * Metric Type: MAQL Metric
 */
export const DiffOfYear2Parameters: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_diff_of_year_2_parameters", "measure"),
);
/**
 * Metric Title: Diff of year (3 parameters)
 * Metric ID: datetime_diff_of_year_3_parameters
 * Metric Type: MAQL Metric
 */
export const DiffOfYear3Parameters: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_diff_of_year_3_parameters", "measure"),
);
/**
 * Metric Title: Diff of year (next)
 * Metric ID: datetime_diff_of_year_next
 * Metric Type: MAQL Metric
 */
export const DiffOfYearNext: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_diff_of_year_next", "measure"),
);
/**
 * Metric Title: Diff of year (previous)
 * Metric ID: datetime_diff_of_year_previous
 * Metric Type: MAQL Metric
 */
export const DiffOfYearPrevious: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_diff_of_year_previous", "measure"),
);
/**
 * Metric Title: Diff of year (previous and next)
 * Metric ID: datetime_diff_of_year_previous_next
 * Metric Type: MAQL Metric
 */
export const DiffOfYearPreviousAndNext: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_diff_of_year_previous_next", "measure"),
);
/**
 * Metric Title: Diff of year (string)
 * Metric ID: datetime_diff_of_year_string
 * Metric Type: MAQL Metric
 */
export const DiffOfYearString: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_diff_of_year_string", "measure"),
);
/**
 * Metric Title: Diff of year (string and this)
 * Metric ID: datetime_diff_of_year_string_and_this
 * Metric Type: MAQL Metric
 */
export const DiffOfYearStringAndThis: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_diff_of_year_string_and_this", "measure"),
);
/**
 * Metric Title: Datetime_diff with quarter
 * Metric ID: datetime_diff_with_quarter
 * Metric Type: MAQL Metric
 */
export const DatetimeDiffWithQuarter: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("datetime_diff_with_quarter", "measure"),
);
/**
 * Metric Title: Diff of week (string)
 * Metric ID: diff_of_week_string
 * Metric Type: MAQL Metric
 */
export const DiffOfWeekString: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("diff_of_week_string", "measure"),
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
 * Metric Title: Won
 * Metric ID: e519fa2a-86c3-4e32-8313-0c03062348j3
 * Metric Type: MAQL Metric
 */
export const Won: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("e519fa2a-86c3-4e32-8313-0c03062348j3", "measure"),
);
/**
 * Metric Title: Filter time transformation (datetime add)
 * Metric ID: filter_time_transformation_datetime_add
 * Metric Type: MAQL Metric
 */
export const FilterTimeTransformationDatetimeAdd: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("filter_time_transformation_datetime_add", "measure"),
);
/**
 * Metric Title: First value of amount by quarter
 * Metric ID: first_value_of_amount_by_quarter
 * Metric Type: MAQL Metric
 */
export const FirstValueOfAmountByQuarter: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("first_value_of_amount_by_quarter", "measure"),
);
/**
 * Metric Title: First value of amount by sales rep
 * Metric ID: first_value_of_amount_by_sales_rep
 * Metric Type: MAQL Metric
 */
export const FirstValueOfAmountBySalesRep: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("first_value_of_amount_by_sales_rep", "measure"),
);
/**
 * Metric Title: First value of amount order asc
 * Metric ID: first_value_of_amount_order_asc
 * Metric Type: MAQL Metric
 */
export const FirstValueOfAmountOrderAsc: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("first_value_of_amount_order_asc", "measure"),
);
/**
 * Metric Title: First value of amount order desc
 * Metric ID: first_value_of_amount_order_desc
 * Metric Type: MAQL Metric
 */
export const FirstValueOfAmountOrderDesc: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("first_value_of_amount_order_desc", "measure"),
);
/**
 * Metric Title: First value of amount with previous
 * Metric ID: first_value_of_amount_with_previous
 * Metric Type: MAQL Metric
 */
export const FirstValueOfAmountWithPrevious: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("first_value_of_amount_with_previous", "measure"),
);
/**
 * Metric Title: First value of rank amount
 * Metric ID: first_value_of_rank_amount
 * Metric Type: MAQL Metric
 */
export const FirstValueOfRankAmount: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("first_value_of_rank_amount", "measure"),
);
/**
 * Metric Title: Last value of runvar amount
 * Metric ID: first_value_of_runvar_amount
 * Metric Type: MAQL Metric
 */
export const LastValueOfRunvarAmount: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("first_value_of_runvar_amount", "measure"),
);
/**
 * Metric Title: First value of runvar amount
 * Metric ID: first_value_of_runvar_amount_2
 * Metric Type: MAQL Metric
 */
export const FirstValueOfRunvarAmount: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("first_value_of_runvar_amount_2", "measure"),
);
/**
 * Metric Title: For Next first value of amount
 * Metric ID: for_next_first_value_of_amount
 * Metric Type: MAQL Metric
 */
export const ForNextFirstValueOfAmount: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("for_next_first_value_of_amount", "measure"),
);
/**
 * Metric Title: For Next last value of amount
 * Metric ID: for_next_last_value_of_amount
 * Metric Type: MAQL Metric
 */
export const ForNextLastValueOfAmount: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("for_next_last_value_of_amount", "measure"),
);
/**
 * Metric Title: For Previous first value of amount
 * Metric ID: for_previous_first_value_of_amount
 * Metric Type: MAQL Metric
 */
export const ForPreviousFirstValueOfAmount: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("for_previous_first_value_of_amount", "measure"),
);
/**
 * Metric Title: For Previous last value of amount
 * Metric ID: for_previous_last_value_of_amount
 * Metric Type: MAQL Metric
 */
export const ForPreviousLastValueOfAmount: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("for_previous_last_value_of_amount", "measure"),
);
/**
 * Metric Title: Incorrect literal string with datetime_add with day
 * Metric ID: incorrect_literal_string_with_datetime_add_with_day
 * Metric Type: MAQL Metric
 */
export const IncorrectLiteralStringWithDatetimeAddWithDay: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("incorrect_literal_string_with_datetime_add_with_day", "measure"),
);
/**
 * Metric Title: Incorrect literal string with datetime_add with month
 * Metric ID: incorrect_literal_string_with_datetime_add_with_month
 * Metric Type: MAQL Metric
 */
export const IncorrectLiteralStringWithDatetimeAddWithMonth: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("incorrect_literal_string_with_datetime_add_with_month", "measure"),
);
/**
 * Metric Title: Incorrect literal string with datetime_diff
 * Metric ID: incorrect_literal_string_with_datetime_diff
 * Metric Type: MAQL Metric
 */
export const IncorrectLiteralStringWithDatetimeDiff: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("incorrect_literal_string_with_datetime_diff", "measure"),
);
/**
 * Metric Title: Last value of amount by quarter
 * Metric ID: last_value_of_amount_by_quarter
 * Metric Type: MAQL Metric
 */
export const LastValueOfAmountByQuarter: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("last_value_of_amount_by_quarter", "measure"),
);
/**
 * Metric Title: Last value of amount by sales rep
 * Metric ID: last_value_of_amount_by_sales_rep
 * Metric Type: MAQL Metric
 */
export const LastValueOfAmountBySalesRep: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("last_value_of_amount_by_sales_rep", "measure"),
);
/**
 * Metric Title: Last value of amount order asc
 * Metric ID: last_value_of_amount_order_asc
 * Metric Type: MAQL Metric
 */
export const LastValueOfAmountOrderAsc: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("last_value_of_amount_order_asc", "measure"),
);
/**
 * Metric Title: Last value of amount order desc
 * Metric ID: last_value_of_amount_order_desc
 * Metric Type: MAQL Metric
 */
export const LastValueOfAmountOrderDesc: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("last_value_of_amount_order_desc", "measure"),
);
/**
 * Metric Title: Last value of amount with previous
 * Metric ID: last_value_of_amount_with_previous
 * Metric Type: MAQL Metric
 */
export const LastValueOfAmountWithPrevious: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("last_value_of_amount_with_previous", "measure"),
);
/**
 * Metric Title: Last value of rank amount
 * Metric ID: last_value_of_rank_amount
 * Metric Type: MAQL Metric
 */
export const LastValueOfRankAmount: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("last_value_of_rank_amount", "measure"),
);
/**
 * Metric Title: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor i
 * Metric ID: lorem_ipsum_dolor_sit_amet_consectetur_adipiscing_elit_sed_do_eiusmod_tempor_incididunt_ut_labore_et_dolore_magna_aliqua._ut_enim_ad_minim_veniam_quis_nostrud_exercitation_ullamco_laboris_nisi_ut_aliquip_ex_ea_commodo_consequat._duis_aute_irure_dolor_i
 * Metric Type: MAQL Metric
 */
export const LoremIpsumDolorSitAmetConsecteturAdipiscingElitSedDoEiusmodTemporIncididuntUtLaboreEtDoloreMagnaAliquaUtEnimAdMinimVeniamQuisNostrudExercitationUllamcoLaborisNisiUtAliquipExEaCommodoConsequatDuisAuteIrureDolorI: IMeasure<IMeasureDefinition> =
    newMeasure(
        idRef(
            "lorem_ipsum_dolor_sit_amet_consectetur_adipiscing_elit_sed_do_eiusmod_tempor_incididunt_ut_labore_et_dolore_magna_aliqua._ut_enim_ad_minim_veniam_quis_nostrud_exercitation_ullamco_laboris_nisi_ut_aliquip_ex_ea_commodo_consequat._duis_aute_irure_dolor_i",
            "measure",
        ),
    );
/**
 * Metric Title: Maximum literal of datetime_add
 * Metric ID: maximum_literal_of_datetime_add
 * Metric Type: MAQL Metric
 */
export const MaximumLiteralOfDatetimeAdd: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("maximum_literal_of_datetime_add", "measure"),
);
/**
 * Metric Title: Max of top level
 * Metric ID: max_of_top_level
 * Metric Type: MAQL Metric
 */
export const MaxOfTopLevel: IMeasure<IMeasureDefinition> = newMeasure(idRef("max_of_top_level", "measure"));
/**
 * Metric Title: Metric has null value
 * Metric ID: metric_has_null_value
 * Metric Type: MAQL Metric
 */
export const MetricHasNullValue: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("metric_has_null_value", "measure"),
);
/**
 * Metric Title: Missing required datetime_add granularity
 * Metric ID: missing_required_datetime_add_granularity
 * Metric Type: MAQL Metric
 */
export const MissingRequiredDatetimeAddGranularity: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("missing_required_datetime_add_granularity", "measure"),
);
/**
 * Metric Title: Negative Metric
 * Metric ID: negative_metric
 * Metric Type: MAQL Metric
 */
export const NegativeMetric: IMeasure<IMeasureDefinition> = newMeasure(idRef("negative_metric", "measure"));
/**
 * Metric Title: Not allow datetime types for datetime_diff
 * Metric ID: not_allow_datetime_types_for_datetime_diff
 * Metric Type: MAQL Metric
 */
export const NotAllowDatetimeTypesForDatetimeDiff: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("not_allow_datetime_types_for_datetime_diff", "measure"),
);
/**
 * Metric Title: Not enough context for MAX
 * Metric ID: not_enough_context_for_max
 * Metric Type: MAQL Metric
 */
export const NotEnoughContextForMAX: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("not_enough_context_for_max", "measure"),
);
/**
 * Metric Title: Not enough context for MIN
 * Metric ID: not_enough_context_for_min
 * Metric Type: MAQL Metric
 */
export const NotEnoughContextForMIN: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("not_enough_context_for_min", "measure"),
);
/**
 * Metric Title: No Time transformation
 * Metric ID: no_time_transformation
 * Metric Type: MAQL Metric
 */
export const NoTimeTransformation: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("no_time_transformation", "measure"),
);
/**
 * Metric Title: # of Activities
 * Metric ID: of_activities
 * Metric Type: MAQL Metric
 */
export const NrOfActivities: IMeasure<IMeasureDefinition> = newMeasure(idRef("of_activities", "measure"));
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
 * Metric Title: _Opp. First Snapshot
 * Metric ID: opp._first_snapshot
 * Metric Type: MAQL Metric
 */
export const OppFirstSnapshot: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("opp._first_snapshot", "measure"),
);
/**
 * Metric Title: Runsum first value of amount with condition
 * Metric ID: runsum_first_value_of_amount_with_condition
 * Metric Type: MAQL Metric
 */
export const RunsumFirstValueOfAmountWithCondition: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("runsum_first_value_of_amount_with_condition", "measure"),
);
/**
 * Metric Title: Runsum last value of amount with condition
 * Metric ID: runsum_last_value_of_amount_with_condition
 * Metric Type: MAQL Metric
 */
export const RunsumLastValueOfAmountWithCondition: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("runsum_last_value_of_amount_with_condition", "measure"),
);
/**
 * Metric Title: _Snapshot [BOP]
 * Metric ID: snapshot_bop
 * Metric Type: MAQL Metric
 */
export const SnapshotBOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("snapshot_bop", "measure"));
/**
 * Metric Title: Sum amount with datetime_add and between
 * Metric ID: sum_amount_with_datetime_add_and_between
 * Metric Type: MAQL Metric
 */
export const SumAmountWithDatetimeAddAndBetween: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("sum_amount_with_datetime_add_and_between", "measure"),
);
/**
 * Metric Title: Sum amount with datetime_add and not between
 * Metric ID: sum_amount_with_datetime_add_and_not_between
 * Metric Type: MAQL Metric
 */
export const SumAmountWithDatetimeAddAndNotBetween: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("sum_amount_with_datetime_add_and_not_between", "measure"),
);
/**
 * Metric Title: Sum of amount between max created year and previous year
 * Metric ID: sum_of_amount_between_max_created_year_and_previous_year
 * Metric Type: MAQL Metric
 */
export const SumOfAmountBetweenMaxCreatedYearAndPreviousYear: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("sum_of_amount_between_max_created_year_and_previous_year", "measure"),
);
/**
 * Metric Title: Sum of amount not between max created year and this year
 * Metric ID: sum_of_amount_not_between_max_created_year_and_this_year
 * Metric Type: MAQL Metric
 */
export const SumOfAmountNotBetweenMaxCreatedYearAndThisYear: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("sum_of_amount_not_between_max_created_year_and_this_year", "measure"),
);
/**
 * Metric Title: Sum of amount with case and max
 * Metric ID: sum_of_amount_with_case_and_max
 * Metric Type: MAQL Metric
 */
export const SumOfAmountWithCaseAndMax: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("sum_of_amount_with_case_and_max", "measure"),
);
/**
 * Metric Title: Sum of amount with if, having and min
 * Metric ID: sum_of_amount_with_if_having_and_min
 * Metric Type: MAQL Metric
 */
export const SumOfAmountWithIfHavingAndMin: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("sum_of_amount_with_if_having_and_min", "measure"),
);
/**
 * Metric Title: Sum of amount with min and by all other
 * Metric ID: sum_of_amount_with_min_and_by_all_other
 * Metric Type: MAQL Metric
 */
export const SumOfAmountWithMinAndByAllOther: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("sum_of_amount_with_min_and_by_all_other", "measure"),
);
/**
 * Metric Title: Sum of amount with min and by all other except
 * Metric ID: sum_of_amount_with_min_and_by_all_other_except
 * Metric Type: MAQL Metric
 */
export const SumOfAmountWithMinAndByAllOtherExcept: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("sum_of_amount_with_min_and_by_all_other_except", "measure"),
);
/**
 * Metric Title: _Timeline [BOP]
 * Metric ID: timeline_bop
 * Metric Type: MAQL Metric
 */
export const TimelineBOP: IMeasure<IMeasureDefinition> = newMeasure(idRef("timeline_bop", "measure"));
/**
 * Metric Title: Time transformation
 * Metric ID: time_transformation
 * Metric Type: MAQL Metric
 */
export const TimeTransformation: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("time_transformation", "measure"),
);
/**
 * Metric Title: Top level of datetime_add
 * Metric ID: top_level_of_datetime_add
 * Metric Type: MAQL Metric
 */
export const TopLevelOfDatetimeAdd: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("top_level_of_datetime_add", "measure"),
);
/**
 * Metric Title: Top level metric for MAX
 * Metric ID: top_level_metric_for_max
 * Metric Type: MAQL Metric
 */
export const TopLevelMetricForMAX: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("top_level_metric_for_max", "measure"),
);
/**
 * Metric Title: Top level metric for MIN
 * Metric ID: top_level_metric_for_min
 * Metric Type: MAQL Metric
 */
export const TopLevelMetricForMIN: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("top_level_metric_for_min", "measure"),
);
/**
 * Metric Title: Time transformation (combined)
 * Metric ID: time_transformation_combined
 * Metric Type: MAQL Metric
 */
export const TimeTransformationCombined: IMeasure<IMeasureDefinition> = newMeasure(
    idRef("time_transformation_combined", "measure"),
);
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
 * Fact Title: Density
 * Fact ID: f_density
 */
export const Density = {
    /**
     * Fact Title: Density
     * Fact ID: f_density
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("f_density", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Density
     * Fact ID: f_density
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("f_density", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Density
     * Fact ID: f_density
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("f_density", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Density
     * Fact ID: f_density
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("f_density", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Density
     * Fact ID: f_density
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("f_density", "fact"), (m) => m.aggregation("median")),
    /**
     * Fact Title: Density
     * Fact ID: f_density
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("f_density", "fact"), (m) => m.aggregation("runsum")),
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
 * Fact Title: Population
 * Fact ID: f_population
 */
export const Population = {
    /**
     * Fact Title: Population
     * Fact ID: f_population
     * Fact Aggregation: sum
     */
    Sum: newMeasure(idRef("f_population", "fact"), (m) => m.aggregation("sum")),
    /**
     * Fact Title: Population
     * Fact ID: f_population
     * Fact Aggregation: avg
     */ Avg: newMeasure(idRef("f_population", "fact"), (m) => m.aggregation("avg")),
    /**
     * Fact Title: Population
     * Fact ID: f_population
     * Fact Aggregation: min
     */ Min: newMeasure(idRef("f_population", "fact"), (m) => m.aggregation("min")),
    /**
     * Fact Title: Population
     * Fact ID: f_population
     * Fact Aggregation: max
     */ Max: newMeasure(idRef("f_population", "fact"), (m) => m.aggregation("max")),
    /**
     * Fact Title: Population
     * Fact ID: f_population
     * Fact Aggregation: median
     */ Median: newMeasure(idRef("f_population", "fact"), (m) => m.aggregation("median")),
    /**
     * Fact Title: Population
     * Fact ID: f_population
     * Fact Aggregation: runsum
     */ Runsum: newMeasure(idRef("f_population", "fact"), (m) => m.aggregation("runsum")),
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
    },
    /**
     * Date Data Set Title: Closed
     * Date Data Set ID: dt_closedate_timestamp
     */ Closed: {
        ref: idRef("dt_closedate_timestamp", "dataSet"),
        identifier: "dt_closedate_timestamp",
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
    },
    /**
     * Date Data Set Title: Created
     * Date Data Set ID: dt_oppcreated_timestamp
     */ Created: {
        ref: idRef("dt_oppcreated_timestamp", "dataSet"),
        identifier: "dt_oppcreated_timestamp",
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
    },
    /**
     * Date Data Set Title: Snapshot
     * Date Data Set ID: dt_snapshotdate_timestamp
     */ Snapshot: {
        ref: idRef("dt_snapshotdate_timestamp", "dataSet"),
        identifier: "dt_snapshotdate_timestamp",
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
    },
    /**
     * Date Data Set Title: Timeline
     * Date Data Set ID: dt_timeline_timestamp
     */ Timeline: {
        ref: idRef("dt_timeline_timestamp", "dataSet"),
        identifier: "dt_timeline_timestamp",
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
    },
};
export const Insights = {
    /**
     * Insight Title: Table using long name metric
     * Insight ID: 1e17f8cf-aa34-4474-8dd5-c1249c688225
     */
    TableUsingLongNameMetric: "1e17f8cf-aa34-4474-8dd5-c1249c688225",
    /**
     * Insight Title: Table has AM metric
     * Insight ID: 343b329b-e2b0-43b2-9724-de8cd664ebac
     */ TableHasAMMetric: "343b329b-e2b0-43b2-9724-de8cd664ebac",
    /**
     * Insight Title: Funnel chart
     * Insight ID: 39fc72a9-5f25-455c-92bb-f7dbde85d586
     */ FunnelChart: "39fc72a9-5f25-455c-92bb-f7dbde85d586",
    /**
     * Insight Title: Combo chart
     * Insight ID: 3c05e649-7897-4a95-9c75-c043f0c39e14
     */ ComboChart: "3c05e649-7897-4a95-9c75-c043f0c39e14",
    /**
     * Insight Title: merge cells insight
     * Insight ID: 3ef94acb-1e15-49ef-88d5-e9e2931be959
     */ MergeCellsInsight: "3ef94acb-1e15-49ef-88d5-e9e2931be959",
    /**
     * Insight Title: Scatter plot segment by attribute
     * Insight ID: 3fb464aa-4a2c-4412-8811-609e5d6e06a5
     */ ScatterPlotSegmentByAttribute: "3fb464aa-4a2c-4412-8811-609e5d6e06a5",
    /**
     * Insight Title: big insight
     * Insight ID: 5517045e-661f-4d6b-b0b0-98030ab9f68c
     */ BigInsight: "5517045e-661f-4d6b-b0b0-98030ab9f68c",
    /**
     * Insight Title: Headline
     * Insight ID: 6010ceaf-b8e9-4cd7-aea8-05da1f68f112
     */ Headline: "6010ceaf-b8e9-4cd7-aea8-05da1f68f112",
    /**
     * Insight Title: Table Sales rep, Forecast category
     * Insight ID: 63a1281d-2ad1-42b2-9577-d653cbe7562c
     */ TableSalesRepForecastCategory: "63a1281d-2ad1-42b2-9577-d653cbe7562c",
    /**
     * Insight Title: Sankey chart
     * Insight ID: 684a2cf2-3b5c-44d3-9287-61e428d0eac2
     */ SankeyChart: "684a2cf2-3b5c-44d3-9287-61e428d0eac2",
    /**
     * Insight Title: Table has multi metrics and multi formats
     * Insight ID: 6d236ec6-5cf7-493e-8285-6613fde4ce18
     */ TableHasMultiMetricsAndMultiFormats: "6d236ec6-5cf7-493e-8285-6613fde4ce18",
    /**
     * Insight Title: Insight has invalid interaction
     * Insight ID: 6d46ac4d-9d6c-434d-a9ae-ff61c98ce066
     */ InsightHasInvalidInteraction: "6d46ac4d-9d6c-434d-a9ae-ff61c98ce066",
    /**
     * Insight Title: Column chart only measures
     * Insight ID: 6ecba0d9-8fff-4c78-8adf-7f33cc1956c8
     */ ColumnChartOnlyMeasures: "6ecba0d9-8fff-4c78-8adf-7f33cc1956c8",
    /**
     * Insight Title: Dependency wheel chart
     * Insight ID: 75e08348-d27f-42b8-a360-41bee971fb6d
     */ DependencyWheelChart: "75e08348-d27f-42b8-a360-41bee971fb6d",
    /**
     * Insight Title: USA geography attribute table
     * Insight ID: 780f3759-65cc-4489-858d-9c318ecece75
     */ USAGeographyAttributeTable: "780f3759-65cc-4489-858d-9c318ecece75",
    /**
     * Insight Title: Repeater
     * Insight ID: 7906ebea-92ef-46eb-868f-afa99792be08
     */ Repeater: "7906ebea-92ef-46eb-868f-afa99792be08",
    /**
     * Insight Title: invalid insight
     * Insight ID: 81452cc9-558b-4b4e-a70b-0a80f3bd2924
     */ InvalidInsight: "81452cc9-558b-4b4e-a70b-0a80f3bd2924",
    /**
     * Insight Title: Insight using long name metric
     * Insight ID: 843701ee-8f24-4942-8522-872a96575f8e
     */ InsightUsingLongNameMetric: "843701ee-8f24-4942-8522-872a96575f8e",
    /**
     * Insight Title: Column chart has not hyperlink
     * Insight ID: 84d13bd9-f976-4e03-8b00-fec9497d580b
     */ ColumnChartHasNotHyperlink: "84d13bd9-f976-4e03-8b00-fec9497d580b",
    /**
     * Insight Title: Column chart long attribute has hyperlink
     * Insight ID: 87c466b7-e3e0-4a1a-a45a-4ae333bce863
     */ ColumnChartLongAttributeHasHyperlink: "87c466b7-e3e0-4a1a-a45a-4ae333bce863",
    /**
     * Insight Title: Amount
     * Insight ID: 87e5c951-0ae6-4a71-a38d-843457bdfc0b
     */ Amount_2: "87e5c951-0ae6-4a71-a38d-843457bdfc0b",
    /**
     * Insight Title: Table With MC
     * Insight ID: 8f88b387-351b-479f-a7fb-e2b072c810f3
     */ TableWithMC: "8f88b387-351b-479f-a7fb-e2b072c810f3",
    /**
     * Insight Title: Column chart has many hyperlinks
     * Insight ID: 9a2ab62b-587a-4b16-9682-1b7962340354
     */ ColumnChartHasManyHyperlinks: "9a2ab62b-587a-4b16-9682-1b7962340354",
    /**
     * Insight Title: Column chart
     * Insight ID: a40866ab-5272-4f2c-9b5a-dd255b1e5d42
     */ ColumnChart: "a40866ab-5272-4f2c-9b5a-dd255b1e5d42",
    /**
     * Insight Title: Table has many rows/columns
     * Insight ID: aa8db374-7a8b-4019-85df-25f47772db5d
     */ TableHasManyRowsColumns: "aa8db374-7a8b-4019-85df-25f47772db5d",
    /**
     * Insight Title: Column chart with Department attribute
     * Insight ID: b1614db1-3058-4071-a2fe-64a017d318c5
     */ ColumnChartWithDepartmentAttribute: "b1614db1-3058-4071-a2fe-64a017d318c5",
    /**
     * Insight Title: AD has null value
     * Insight ID: b3b665b7-bca2-0322-82f1-b86ky73k90f8afe
     */ ADHasNullValue: "b3b665b7-bca2-0322-82f1-b86ky73k90f8afe",
    /**
     * Insight Title: Parent Insight
     * Insight ID: b3b665b7-bca2-4462-82f1-b0e01dff8afe
     */ ParentInsight: "b3b665b7-bca2-4462-82f1-b0e01dff8afe",
    /**
     * Insight Title: Table Transpose
     * Insight ID: b69512f0-6285-4d4d-b31c-47b7b081276c
     */ TableTranspose: "b69512f0-6285-4d4d-b31c-47b7b081276c",
    /**
     * Insight Title: Combine with all filter types
     * Insight ID: ba13041b-87bc-458c-a514-fcc0074c9973
     */ CombineWithAllFilterTypes: "ba13041b-87bc-458c-a514-fcc0074c9973",
    /**
     * Insight Title: Negative Insight
     * Insight ID: c1f236a4-b48a-4bf6-a94f-a89d5bde2fe9
     */ NegativeInsight: "c1f236a4-b48a-4bf6-a94f-a89d5bde2fe9",
    /**
     * Insight Title: With unknown visualization class
     * Insight ID: c4121590-8e24-418e-b3d1-7e442288eb4e
     */ WithUnknownVisualizationClass: "c4121590-8e24-418e-b3d1-7e442288eb4e",
    /**
     * Insight Title: Scatter plot
     * Insight ID: c44d07fb-e48d-445d-87ff-5c07d8749863
     */ ScatterPlot: "c44d07fb-e48d-445d-87ff-5c07d8749863",
    /**
     * Insight Title: Table with order
     * Insight ID: c796d21d-a705-439d-a727-23b144591617
     */ TableWithOrder: "c796d21d-a705-439d-a727-23b144591617",
    /**
     * Insight Title: Waterfall chart
     * Insight ID: cbe62312-b02c-45a8-b641-b13ea473f0f6
     */ WaterfallChart: "cbe62312-b02c-45a8-b641-b13ea473f0f6",
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
     * Insight Title: many data
     * Insight ID: dcce2234-9097-47e7-a165-36cdbaa2e134
     */ ManyData: "dcce2234-9097-47e7-a165-36cdbaa2e134",
    /**
     * Insight Title: Pie chart multiple measures
     * Insight ID: de6092cf-d243-4987-918b-8aac3ecd26cc
     */ PieChartMultipleMeasures: "de6092cf-d243-4987-918b-8aac3ecd26cc",
    /**
     * Insight Title: Pyramid chart
     * Insight ID: eb7f3b09-09e8-498b-bff5-249660ffcd6e
     */ PyramidChart: "eb7f3b09-09e8-498b-bff5-249660ffcd6e",
    /**
     * Insight Title: Table with stage name
     * Insight ID: ed91a9b6-8ee1-4a70-a2cf-a1454817e538
     */ TableWithStageName: "ed91a9b6-8ee1-4a70-a2cf-a1454817e538",
    /**
     * Insight Title: No data
     * Insight ID: f00bd5d5-91da-4139-9e7e-5498d9fe49b5
     */ NoData: "f00bd5d5-91da-4139-9e7e-5498d9fe49b5",
    /**
     * Insight Title: Table with hyperlink attribute
     * Insight ID: f51896d7-1a46-416b-8039-67d8af1d7651
     */ TableWithHyperlinkAttribute: "f51896d7-1a46-416b-8039-67d8af1d7651",
    /**
     * Insight Title: AD with compares
     * Insight ID: f6dc8313-c2dc-4731-b491-b5b0758738ae
     */ ADWithCompares: "f6dc8313-c2dc-4731-b491-b5b0758738ae",
    /**
     * Insight Title: Column chart has hyperlink
     * Insight ID: f7a50db1-5d2d-4b1a-82e6-e1648836985c
     */ ColumnChartHasHyperlink: "f7a50db1-5d2d-4b1a-82e6-e1648836985c",
    /**
     * Insight Title: unmerge cells insight
     * Insight ID: fb53ecfb-3874-4bee-8612-afecd3fa3e04
     */ UnmergeCellsInsight: "fb53ecfb-3874-4bee-8612-afecd3fa3e04",
    /**
     * Insight Title: Table with stage name and atribute filter
     * Insight ID: fbcca86f-c473-446b-b316-eb4f4e5de909
     */ TableWithStageNameAndAtributeFilter: "fbcca86f-c473-446b-b316-eb4f4e5de909",
};
export const Dashboards = {
    /**
     * Dashboard Title: Drill to insight
     * Dashboard ID: 04a8f9c7-cce9-4511-be2b-ea52ea80773f
     */
    DrillToInsight: "04a8f9c7-cce9-4511-be2b-ea52ea80773f",
    /**
     * Dashboard Title: Dashboard multiple date filters
     * Dashboard ID: 0c120022-243d-4146-987c-eadfaa58b0d0
     */ DashboardMultipleDateFilters: "0c120022-243d-4146-987c-eadfaa58b0d0",
    /**
     * Dashboard Title: Dashboard column chart has not hyperlink
     * Dashboard ID: 0de1f35f-994d-4803-b236-ae2549818104
     */ DashboardColumnChartHasNotHyperlink: "0de1f35f-994d-4803-b236-ae2549818104",
    /**
     * Dashboard Title: KD with stage name
     * Dashboard ID: 0e0cb428-c0db-45dc-946e-65b47287a94f
     */ KDWithStageName: "0e0cb428-c0db-45dc-946e-65b47287a94f",
    /**
     * Dashboard Title: Repeater Dashboard
     * Dashboard ID: 14d22840-5851-41c1-9d72-71626471813e
     */ RepeaterDashboard: "14d22840-5851-41c1-9d72-71626471813e",
    /**
     * Dashboard Title: Cross filtering
     * Dashboard ID: 1b35747d-d7a3-4052-9f07-a9aa93248389
     */ CrossFiltering: "1b35747d-d7a3-4052-9f07-a9aa93248389",
    /**
     * Dashboard Title: Dashboard with unknown visualization class
     * Dashboard ID: 2326d431-ccb3-405e-a3d2-394bdf276e61
     */ DashboardWithUnknownVisualizationClass: "2326d431-ccb3-405e-a3d2-394bdf276e61",
    /**
     * Dashboard Title: Dashboard column chart has hyperlinks
     * Dashboard ID: 2c269aba-2a5a-4d54-8bdb-bbf037645f0f
     */ DashboardColumnChartHasHyperlinks: "2c269aba-2a5a-4d54-8bdb-bbf037645f0f",
    /**
     * Dashboard Title: Header Tests
     * Dashboard ID: 2dcc56ff-5ae6-49f1-ba97-9b76000ca4a1
     */ HeaderTests: "2dcc56ff-5ae6-49f1-ba97-9b76000ca4a1",
    /**
     * Dashboard Title: Dashboard scatter plot segmentation
     * Dashboard ID: 3999bcb1-696c-4587-a075-c403eef07552
     */ DashboardScatterPlotSegmentation: "3999bcb1-696c-4587-a075-c403eef07552",
    /**
     * Dashboard Title: Insight on dashboard
     * Dashboard ID: 46dbb7b3-468c-436f-a2ff-85fbf4e8d5ad
     */ InsightOnDashboard: "46dbb7b3-468c-436f-a2ff-85fbf4e8d5ad",
    /**
     * Dashboard Title: Dashboard Testing
     * Dashboard ID: 51ab79db-d7aa-44fe-ba93-404d83f071d3
     */ DashboardTesting: "51ab79db-d7aa-44fe-ba93-404d83f071d3",
    /**
     * Dashboard Title: KD has null value
     * Dashboard ID: 5a224af3-902c-4acd-ac75-bfa88d80e044
     */ KDHasNullValue: "5a224af3-902c-4acd-ac75-bfa88d80e044",
    /**
     * Dashboard Title: KD with table has many rows/columns
     * Dashboard ID: 5c8244eb-6c86-488c-9df1-37d46e5450ed
     */ KDWithTableHasManyRowsColumns: "5c8244eb-6c86-488c-9df1-37d46e5450ed",
    /**
     * Dashboard Title: KPIs
     * Dashboard ID: 601c81ae-0582-42f0-9f35-a4ec2a6a8497
     */ KPIs: "601c81ae-0582-42f0-9f35-a4ec2a6a8497",
    /**
     * Dashboard Title: KD with No data
     * Dashboard ID: 61cbcfcd-efee-407f-ba3a-6c3170f50e03
     */ KDWithNoData: "61cbcfcd-efee-407f-ba3a-6c3170f50e03",
    /**
     * Dashboard Title: Dashboard Readonly Date Filter
     * Dashboard ID: 62554df1-31a8-49c7-bfed-524771a83b1a
     */ DashboardReadonlyDateFilter: "62554df1-31a8-49c7-bfed-524771a83b1a",
    /**
     * Dashboard Title: Dashboard with dependent filters
     * Dashboard ID: 6aac31b1-ba6c-40b6-b727-1c412d9e4d25
     */ DashboardWithDependentFilters: "6aac31b1-ba6c-40b6-b727-1c412d9e4d25",
    /**
     * Dashboard Title: Dashboard column chart only measures
     * Dashboard ID: 6dcf6335-92cf-4b77-981f-a1f4d0763053
     */ DashboardColumnChartOnlyMeasures: "6dcf6335-92cf-4b77-981f-a1f4d0763053",
    /**
     * Dashboard Title: KD with big insight
     * Dashboard ID: 75a429f8-6c26-422a-8e0d-9e52981f5403
     */ KDWithBigInsight: "75a429f8-6c26-422a-8e0d-9e52981f5403",
    /**
     * Dashboard Title: Widget tooltips
     * Dashboard ID: 7a02b8e8-8a46-4b3c-b9b8-69792793eb15
     */ WidgetTooltips: "7a02b8e8-8a46-4b3c-b9b8-69792793eb15",
    /**
     * Dashboard Title: KD using long name metric
     * Dashboard ID: 7b2cd4c1-bb41-473a-9017-e404cbc630d2
     */ KDUsingLongNameMetric: "7b2cd4c1-bb41-473a-9017-e404cbc630d2",
    /**
     * Dashboard Title: RichText
     * Dashboard ID: 8dea7e2f-315d-4d62-ad51-2ed2ab29758b
     */ RichText: "8dea7e2f-315d-4d62-ad51-2ed2ab29758b",
    /**
     * Dashboard Title: Drill to dashboard
     * Dashboard ID: 97aca5e1-ab29-4ad9-a173-72085daf4dbf
     */ DrillToDashboard: "97aca5e1-ab29-4ad9-a173-72085daf4dbf",
    /**
     * Dashboard Title: KD with Table Transpose
     * Dashboard ID: a402fcdc-fa1c-49ca-be7f-dade9e75d33e
     */ KDWithTableTranspose: "a402fcdc-fa1c-49ca-be7f-dade9e75d33e",
    /**
     * Dashboard Title: Target KD has null value
     * Dashboard ID: a87209e0-c53f-4a6f-abf3-17c7d8d4079e
     */ TargetKDHasNullValue: "a87209e0-c53f-4a6f-abf3-17c7d8d4079e",
    /**
     * Dashboard Title: KD with compares
     * Dashboard ID: abcd2251-d78d-4d6b-b088-1845b89c04ba
     */ KDWithCompares: "abcd2251-d78d-4d6b-b088-1845b89c04ba",
    /**
     * Dashboard Title: Dashboard with charts
     * Dashboard ID: b5f958b1-0428-41d6-b211-b4dad61d21ff
     */ DashboardWithCharts: "b5f958b1-0428-41d6-b211-b4dad61d21ff",
    /**
     * Dashboard Title: Drag drop and Move
     * Dashboard ID: b74d3889-655f-4a0d-bc94-15b39d5e1046
     */ DragDropAndMove: "b74d3889-655f-4a0d-bc94-15b39d5e1046",
    /**
     * Dashboard Title: Pivot Table Dashboard
     * Dashboard ID: c03bd065-4377-4b63-80c1-a00b00d20ddd
     */ PivotTableDashboard: "c03bd065-4377-4b63-80c1-a00b00d20ddd",
    /**
     * Dashboard Title: Dashboard Hide Filters
     * Dashboard ID: c4e4916e-ccc2-46d1-8202-8321249ec2a3
     */ DashboardHideFilters: "c4e4916e-ccc2-46d1-8202-8321249ec2a3",
    /**
     * Dashboard Title: Dashboard stage name
     * Dashboard ID: c900b178-b150-4dac-b4e5-20ad5ddfe23b
     */ DashboardStageName: "c900b178-b150-4dac-b4e5-20ad5ddfe23b",
    /**
     * Dashboard Title: Parent Dashboard
     * Dashboard ID: d1965687-f7bd-41ba-9fa2-f63793d62a62
     */ ParentDashboard: "d1965687-f7bd-41ba-9fa2-f63793d62a62",
    /**
     * Dashboard Title: Drill to attribute url
     * Dashboard ID: d9c82618-36d5-4819-909b-5801888ec1ae
     */ DrillToAttributeUrl: "d9c82618-36d5-4819-909b-5801888ec1ae",
    /**
     * Dashboard Title: Drill to custom url
     * Dashboard ID: ddb30edd-6149-473a-846d-3c7fed83106f
     */ DrillToCustomUrl: "ddb30edd-6149-473a-846d-3c7fed83106f",
    /**
     * Dashboard Title: KD with merge and unmerge insights
     * Dashboard ID: dfb03d5e-ba83-4105-badb-0a02e2e668ee
     */ KDWithMergeAndUnmergeInsights: "dfb03d5e-ba83-4105-badb-0a02e2e668ee",
    /**
     * Dashboard Title: KD with many data insight
     * Dashboard ID: e1e6e5fe-95bc-41b9-bd8c-d9cf5e88a5d0
     */ KDWithManyDataInsight: "e1e6e5fe-95bc-41b9-bd8c-d9cf5e88a5d0",
    /**
     * Dashboard Title: Dashboard order
     * Dashboard ID: ed0a80c8-4266-4cb6-88c7-48eafbe47c1d
     */ DashboardOrder: "ed0a80c8-4266-4cb6-88c7-48eafbe47c1d",
    /**
     * Dashboard Title: KD with invalid insight
     * Dashboard ID: f50c7076-1d45-4031-a4fd-564459254b12
     */ KDWithInvalidInsight: "f50c7076-1d45-4031-a4fd-564459254b12",
};
