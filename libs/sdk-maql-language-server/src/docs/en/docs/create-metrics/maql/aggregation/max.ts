// (C) 2021-2026 GoodData Corporation

export const content = `# MAX
## Metrics

The MAX function returns the maximum value of all numbers in the set
(e.g., Salary Paid).

### Syntax

\`\`\`
SELECT MAX(…)
SELECT MAX(fact)
\`\`\`

### Example

The MAX of the Store Sales fact is the highest sales transaction value on record:

\`\`\`
SELECT MAX({fact/sales})
\`\`\`

## Attributes

The MAX function can be also used to determine the maximum value of attributes with non-numeric data types (e.g. string or date attributes). 

The results cannot be displayed in insights directly, but they can be used in conditional filtering, for example, to filter the last snapshot.

### Syntax

\`\`\`
SELECT MAX(attribute)
SELECT MAX(attribute,primary_key)
SELECT MAX(attribute,dataset)
SELECT MAX(attribute) USING attribute
\`\`\`

If the attribute is referenced from multiple fact datasets, use two parameters in the MAX function. 

The context where to search for maximum value of the attribute is determined by the second parameter - the primary key of the dataset or the dataset identifier. 

For date attributes, use the second attribute or the USING keyword.

### Examples

The sum of semi-additive snapshot values for the last of the daily snapshots.  

\`\`\`
SELECT SUM({fact/snapshot_value}) 
WHERE {attribute/snapshot_date.day} =
      (SELECT MAX({attribute/snapshot_date.day},{dataset/fact_dataset}))
\`\`\`

If the metric is broken down by other attributes and displayed as a table, the maximum value can be different for each row. 

To use the maximum date for all rows, add \`BY ALL OTHER\` to the syntax.
\`\`\`
SELECT SUM({fact/snapshot_value}) 
WHERE {attribute/snapshot_date.day} =
      (SELECT MAX({attribute/snapshot_date.day},{dataset/fact_dataset}) BY ALL OTHER)
\`\`\``;
