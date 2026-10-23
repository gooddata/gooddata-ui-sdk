// (C) 2021-2026 GoodData Corporation

export const content = `# TRUNC
The TRUNC functions truncates a number based on the number of decimal
places specified in the second parameter.

By default, the TRUNC() function allows you to remove all digits to the
right of the decimal point without applying rounding. If a second
optional parameter is added to the TRUNC() function, it defines the
number of digits to the right of the decimal point at which truncation
is applied. Negative values are supported for the second parameter.

-   The first input value can be any constant, fact, metric, or metric
    expression.
-   The optional second parameter defines the number of decimal points
    at which the remaining digits are removed. This parameter should be
    an integer, although real numbers are supported for input.

## Syntax

\`\`\`
SELECT TRUNC(…)
TRUNC(constant)
TRUNC(fact)
TRUNC(metric)
TRUNC(metric_expression)
TRUNC(input, number_of_decimal_places)
\`\`\`

## Examples

\`\`\`
SELECT TRUNC(12.2) = 12
SELECT TRUNC(12.7) = 12
SELECT TRUNC(12.257,2) = 12.25
SELECT TRUNC(1255.257,-2) = 1200
\`\`\``;
