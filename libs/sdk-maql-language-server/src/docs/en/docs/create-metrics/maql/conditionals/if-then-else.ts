// (C) 2021-2026 GoodData Corporation

export const content = `# IF THEN ELSE
IF THEN ELSE construct is a simplified version of CASE statement: 

\`\`\`
SELECT IF condition THEN expression ELSE expression END
\`\`\`
is equivalent to
\`\`\`
SELECT CASE WHEN condition THEN expression ELSE expression END
\`\`\`

For the detailed discussion of the semantics see [CASE statement](https://www.gooddata.com/developers/cloud-native/doc/hosted/create-metrics/maql/conditionals/case/).

## Syntax

\`\`\`
SELECT IF … THEN … ELSE … END
SELECT IF condition THEN number ELSE number END
SELECT IF condition THEN arithmetic_operation ELSE arithmetic_operation END
\`\`\`

## Examples

\`\`\`
SELECT IF SUM({fact/amount})>= AVG({fact/amount}) THEN 10 ELSE 0 END
SELECT IF SUM({fact/duration}) - AVG({fact/duration}) > 2000  THEN 0 ELSE 1 END
SELECT IF AVG({fact/probability}) > 0.5 THEN SUM({fact/amount}) * 10 ELSE SUM({fact/amount}) / 10 END
\`\`\``;
