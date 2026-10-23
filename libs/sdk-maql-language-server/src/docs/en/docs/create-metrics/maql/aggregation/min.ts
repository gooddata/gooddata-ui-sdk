// (C) 2021-2026 GoodData Corporation

export const content = `# MIN
## Metrics

The MIN function returns the minimum value of all numbers in the set
(e.g., Salary Paid).

### Syntax

\`\`\`
SELECT MIN(…)
SELECT MIN(fact)
\`\`\`

### Example

The MIN of the *Opportunity Amount* fact is the lowest opportunity
amount value on record:

\`\`\`
SELECT MIN({fact/opportunity_amount})
\`\`\`

## Attributes

The MIN function can be also used to determine the minimum value of attributes with non-numeric data types (e.g. string or date attributes). 

The results cannot be displayed in insights directly, but they can be used in conditional filtering, for example, to filter the last snapshot.

### Syntax

\`\`\`
SELECT MIN(attribute)
SELECT MIN(attribute,primary_key)
SELECT MIN(attribute,dataset)
SELECT MIN(attribute) USING attribute
\`\`\`

If the attribute is referenced from multiple fact datasets, use two parameters in the MIN function. 

The context where to search for minimum value of the attribute is determined by the second parameter - the primary key of the dataset or the dataset identifier. 

For date attributes, use the second attribute or the USING keyword.

### Examples

The sum of semi-additive snapshot values for the first of the daily snapshots.  

\`\`\`
SELECT SUM({fact/snapshot_value}) 
WHERE {attribute/snapshot_date.day} =
      (SELECT MIN({attribute/snapshot_date.day},{dataset/fact_dataset}))
\`\`\`


If the metric is broken down by other attributes and displayed as a table, the minimum value can be different for each row. 

To use the minimum date for all rows, add \`BY ALL OTHER\` to the syntax.
\`\`\`
SELECT SUM({fact/snapshot_value}) 
WHERE {attribute/snapshot_date.day} =
      (SELECT MIN({attribute/snapshot_date.day},{dataset/fact_dataset}) BY ALL OTHER)
\`\`\``;
