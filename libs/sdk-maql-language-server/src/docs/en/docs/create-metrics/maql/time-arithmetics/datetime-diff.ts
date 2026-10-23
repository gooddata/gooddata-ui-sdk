// (C) 2021-2026 GoodData Corporation

export const content = `# DATETIME_DIFF
The \`DATETIME_DIFF\` function calculates the difference between two timestamps or dates. The resulting number is the difference between the two specified timestamps/dates based on the granularity. 

The function can be used, for example, to calculate the duration of your business processes.

## Syntax

\`\`\`
SELECT DATETIME_DIFF(time_attribute1, time_attribute2)
SELECT DATETIME_DIFF(time_attribute1, time_attribute2, granularity)
SELECT … WHERE DATETIME_DIFF(time_attribute1, time_attribute2) > 5
\`\`\`
**Time attributes** can have the following formats:
- Timestamp: \` {label/date.day}\`
- Date and time macro: \`THIS(DAY)\`
- Strings: \`"2022"\` 

* The strings must be in the following formats: \`"YYYY-MM-DD HH24:MI"\` for minutes, \`"YYYY-MM-DD HH24"\` for hours, \`"YYYY-MM-DD"\` for days, \`"YYYY-MM"\` for months, \`"YYYY-WW"\` for weeks, and \`"YYYY"\` for years..
* Use max one string as time attribute.
* Strings must have the same granularity as the second time attribute.


**Granularity** is optional and can be one of the following:
* \`MINUTE\`
* \`HOUR\`
* \`DAY\`
* \`WEEK\`
* \`MONTH\`
* \`YEAR\`

* If the time attribute is in the \`date\` format, you cannot use the \`MINUTE\` or \`HOUR\` granularity.
* If you do not specify the granularity, the greater granularity of the two date attributes is used.
* If you specify the granularity, the two attributes must have the same or lower granularity.


## Examples

To count the difference between two dates without specifying the granularity (the granularity is taken from the attributes):

\`\`\`
SELECT DATETIME_DIFF({label/l_from.day}, {label/l_to.day})
\`\`\`

Difference in days between two time attributes with hour granularity:

\`\`\`
SELECT DATETIME_DIFF({label/l_from.hour}, {label/l_to.hour}, DAY)
\`\`\`

Filter data where the duration is greater than the specified amount:

\`\`\`
SELECT COUNT({dataset/item}) WHERE DATETIME_DIFF({label/i_decommisioned.day}, THIS(DAY)) > 10
\`\`\``;
