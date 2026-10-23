// (C) 2021-2026 GoodData Corporation

export const content = `# ROUND
The ROUND() function rounds a fact or metric to the number of decimal
places specified in the second parameter. If the second parameter is not
specified, then the function rounds to the nearest integer.

The input value is rounded to an integer (by default) or to a defined
number of decimal points. This function allows metric builds to retain
exact levels of precision throughout a set of calculations.

-   The first input value can be any constant, fact, metric, or metric
    expression.
-   The optional second parameter defines the number of decimal points
    to which the function applies rounding. This parameter should be an
    integer, although real numbers are supported for input.

## Syntax

\`\`\`
SELECT ROUND(…)
ROUND(fact)
ROUND(metric)
ROUND(metric_expression)
ROUND(input, number_of_decimal_places)
\`\`\`

## Examples

\`\`\`
SELECT ROUND(12.2) = 12
SELECT ROUND(12.7) = 13
SELECT ROUND(12.257,2) = 12.26
SELECT ROUND (12.257,-1) = 10
\`\`\``;
