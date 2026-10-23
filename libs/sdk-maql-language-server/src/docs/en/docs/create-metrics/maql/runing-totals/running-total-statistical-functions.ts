// (C) 2021-2026 GoodData Corporation

export const content = `# Running Total Statistical Functions
Running Total Statistical Functions calculate the standard deviation or
variance using all values up to the current date for a fact or metric.
Functions are available for standard deviation, variance, and versions
of those functions for populations. See [Standard Deviation Functions](https://www.gooddata.com/developers/cloud-native/doc/hosted/create-metrics/maql/statistic/standard-deviation-functions/) and [Variance Functions](https://www.gooddata.com/developers/cloud-native/doc/hosted/create-metrics/maql/statistic/variance-functions/).

Suppose you are tracking daily production for your enterprise throughout
the month in a simple visualization tracking daily Units. You can use the
RUNAVG and RUNSTDEV statistical functions to track the reliability of
estimates as the month begins to close:


| Date      |   Units  | Running Avg Daily Units |  Running StDev |
| ------------ | ------- | ------------------------- | --------------- |
| 06/02/2014|  50| 50.00|  (blank value) |
| 06/03/2014|  60| 55.00|  7.07 |
| 06/04/2014|  70| 60.00|  10.00 |
| 06/05/2014|  50| 57.50|  9.57 |
| 06/06/2014|  60| 58.00|  8.37 |
| 06/09/2014|  80| 61.67|  11.69 |
| 06/10/2014|  50| 60.00|  11.55 |
| 06/11/2014|  70| 61.25|  11.26 |
| 06/12/2014|  60| 61.11|  10.54 |
| 06/13/2014|  80| 63.00|  11.60 |


Running total metrics can be broken down by two or more date attributes
from the same date dimension. Non-date attributes are not supported.

## Syntax

\`\`\`
SELECT RUNSTDEV(...)
SELECT RUNSTDEVP(...)
SELECT RUNVAR(...)
SELECT RUNVARP(...)
SELECT RUNSTDEV(...) WITHIN (...)
\`\`\`

The value for WITHIN must be a date attribute.

\`\`\`
SELECT RUNSTDEV(...) WITHIN (ALL OTHER)
\`\`\`

## Examples

\`\`\`
SELECT RUNVAR({fact/sales})
SELECT RUNSTDEVP({metric/leads}) WHERE {label/date_ordered.year} = THIS
SELECT RUNVARP({metric/returns}) WHERE {metric/amount} > 500000
SELECT RUNSTDEV({metric/opportunities}) WITHIN ({label/date_ordered.quarter_year})
\`\`\``;
