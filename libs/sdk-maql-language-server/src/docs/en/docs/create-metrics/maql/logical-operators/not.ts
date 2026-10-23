// (C) 2021-2026 GoodData Corporation

export const content = `# NOT
NOT is a logical operator that negates the filter it precedes.

If you specify a filter and precede it with NOT, then everything that is
specified by the filter is excluded from the computation.

**Example:**

\`\`\`
SELECT {metric/profit} WHERE NOT ({label/date_ordered.year} = "2006" AND {label/date_ordered.month} = "5")
\`\`\``;
