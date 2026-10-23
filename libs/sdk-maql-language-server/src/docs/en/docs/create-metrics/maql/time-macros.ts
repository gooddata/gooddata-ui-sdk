// (C) 2021-2026 GoodData Corporation

export const content = `# Time Macros
Time macros or time macro functions are \"floating\" references to day, month, week, and other date-related attribute values, relative to the present.
MAQL supports the following time macro functions:

- THIS
- PREVIOUS
- NEXT

These macros are useful for creating visualizations that relate to data from \"today\", \"yesterday\", \"this month\", \"next year\" etc.

### "THIS" Macro

THIS macro references the current value of the specified date granularity.

In the following example, THIS macro is used with the day granularity, effectively meaning *this day*, or \"today\":

\`\`\`
SELECT {metric/payment} WHERE {attribute/date} = THIS(DAY)
\`\`\`

If the date granularity of the macro changes, so does the meaning of THIS. You can use following time macro granularities:

- DAY
- MONTH
- QUARTER
- YEAR
- WEEK
- WEEKOFYEAR
- MONTHOFYEAR
- QUARTEROFYEAR
- DAYOFMONTH
- DAYOFWEEK
- DAYOFYEAR

Other date granularities supported by GoodData platform (such as HOUR, MINUTE etc.) are currently not available for time macros.

### Referencing past or future dates

Optionally you can specify second parameter of THIS macro to reference future
or previous time periods. For example,

\`\`\`
SELECT {metric/payment} WHERE {attribute/month} = THIS(Month, -2)
\`\`\`

computes payments of the month two months ago.

To illustrate more, suppose the current date is **November 3, 2014**.
Then following table summarizes values of THIS macro for various combinations of granularities (in rows) and period shifts (columns).
Note that \`THIS(<granularity>, 0)\` is equivalent to \`THIS(<granularity>)\`.

|  | 0 | 2 | -1 |
| - | - | - | - |
| Day | 11/3/2014 | 11/5/2014 |  11/2/2014 |
| DayOfWeek | 1 (Monday) | 3 (Wednesday) | 0 (Sunday) |
| MonthOfYear | 11 (November) | 1 (January) | 10 (October) |
| QuarterOfYear | Q4 | Q2 | Q3 |
| Quarter | Q4/2014 | Q2/2015 | Q3/2014 |


Notice that if the date granularity is periodic, such as QuarterOfYear (Q1, Q2,
Q3, Q4) or MonthOfYear (January, February, March, etc), the resulting value might roll over to the next or
backward to the previous period.

### "PREVIOUS" and "NEXT" Macros

For convenience MAQL also supports shortcuts for the other two most common relative periods: previous and next.

- \`PREVIOUS(<granularity>)\` is equivalent to \`THIS(<granularity>, -1)\`
- \`NEXT(<granularity>)\` is equivalent to \`THIS(<granularity>, 1)\`
- \`PREVIOUS(<granularity>, <shift>)\` is equivalent to \`THIS(<granularity>, - <shift>)\`
- \`NEXT(<granularity>, <shift>)\` is equivalent to \`THIS(<granularity>, shift>)\`

Example:

\`\`\`
SELECT {metric/payment} WHERE {attribute/month} = PREVIOUS(Month)
\`\`\``;
