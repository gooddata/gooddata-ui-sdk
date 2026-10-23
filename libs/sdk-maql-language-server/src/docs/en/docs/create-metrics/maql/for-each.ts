// (C) 2023-2026 GoodData Corporation

export const content = `# For Each
Display all values for a given label. For datetime attributes continuous series of values is generated.


### MAQL Syntax

\`\`\`
SELECT … BY … FOR EACH {attribute/label}, {attribute/label}, …  FOR PREVIOUS … WHERE … HAVING … USING … WITHOUT PF …
\`\`\`

Example:

\`\`\`
SELECT SUM({fact/lineitem.l_extendedprice}) FOR EACH {attribute/o_orderdatetime.month}, {attribute/part.p_brand}
\`\`\`
`;
