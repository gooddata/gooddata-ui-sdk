// (C) 2021-2026 GoodData Corporation

export const content = `# SIGN
The signum (SIGN) function returns a number or metric input as one of
the following three values:

-   -1 if the number is negative
-   0 if the number is zero
-   1 if the number is positive

The SIGN function follows the rule: 

\`\`\`
SIGN(number_input) = (number_input)/(abs(number_input))
\`\`\`

## Syntax

\`\`\`
SELECT SIGN(…)
SELECT SIGN(number)
SELECT SIGN(metric)
\`\`\`

## Examples

\`\`\`
SELECT SIGN(-3) returns the value -1
SELECT SIGN(3) returns the value 1
SELECT SIGN(0) returns the value 0
\`\`\``;
