// (C) 2021-2026 GoodData Corporation

export const content = `# Running Totals for Core Functions
Running Totals for Core Functions take the running sum, average,
minimum, or maximum of a project fact or metric. In a table broken down
by a date attribute, the running total value on any given day would be
calculated by aggregating values from all prior days along with that of
the current day.

Running total metrics can be broken down by two or more date attributes
from the same date dimension. Non-date attributes are not supported.

## Syntax

\`\`\`
SELECT RUNSUM(...)
SELECT RUNAVG(...)
SELECT RUNMIN(...)
SELECT RUNMAX(...)
SELECT RUNSUM(...) WITHIN (...)
\`\`\`

The value for WITHIN must be a date attribute.

\`\`\`
SELECT RUNSUM(...) WITHIN (ALL OTHER)
\`\`\`

## Examples

\`\`\`
SELECT RUNSUM({fact/sales})
SELECT RUNSUM({fact/sales}) WITHIN({label/date.week})
SELECT RUNSUM({fact/sales}) WITHIN({label/date.week}) BY {label/date}, {attribute/region}
SELECT RUNMIN({fact/probability}) WHERE {label/date.year} = THIS AND {metric/amount} > 500000
SELECT RUNMAX({fact/opportunity}) BY {label/date.quarter_year}
SELECT RUNMAX({fact/sales}) WITHIN ({label/date.year}) WITHOUT PARENT FILTER
\`\`\``;
