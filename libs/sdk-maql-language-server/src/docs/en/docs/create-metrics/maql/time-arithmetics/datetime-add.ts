// (C) 2021-2026 GoodData Corporation

export const content = `# DATETIME_ADD
The \`DATETIME_ADD\` function adds a specified amount of intervals based on the granularity. 

## Syntax

\`\`\`
SELECT … WHERE DATETIME_ADD(time_attribute, amount) >= time_attribute
SELECT … WHERE DATETIME_ADD(time_attribute, granularity, amount) >= time_attribute
\`\`\`

**Time attribute** can have the following formats:
- Timestamp: \` {label/date.day}\`
- Date and time macro: \`THIS(DAY)\`
- Strings: \`"2022"\` 

The strings must be in the following formats: 

\`"YYYY-MM-DD HH24:MI"\` for minutes, \`"YYYY-MM-DD HH24"\` for hours, \`"YYYY-MM-DD"\` for days, \`"YYYY-MM"\` for months, \`"YYYY-WW"\` for weeks, and \`"YYYY"\` for years.

**Amount** is an integer and specifies the amount of intervals of the given granularity.

**Granularity** can be one of the following:
* \`MINUTE\`
* \`HOUR\`
* \`DAY\`
* \`WEEK\`
* \`MONTH\`
* \`YEAR\`

* If the time attribute is a string, you must specify the granularity.
* The granularity of the time attribute and the specified granularity in the function may be different.
* If you do not specify the granularity, the granularity of the time attribute is used.

## Examples

Return the number of loans that was returned in the last three days:

\`\`\`
SELECT COUNT({label/l_loankey}) WHERE {label/l_returned.day} >= DATETIME_ADD({label/l_to.day}, -2)
\`\`\`

Return the number of loans from the 20th week of 2022:

\`\`\`
SELECT COUNT({label/l_loankey}) WHERE {label/l_from.day} >= DATETIME_ADD("2022-01", WEEK, 19) 
\`\`\`

Return the sum of the shipping prices in the 7 days before the last returned loan.

\`\`\`
SELECT SUM({fact/l_shippingprice}) WHERE {label/l_returned.day} >= DATETIME_ADD(MAX({label/l_returned.day}, {dataset/loan}), -7) 
\`\`\``;
