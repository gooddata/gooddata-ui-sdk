// (C) 2021-2026 GoodData Corporation

export const content = `# Filtering with the LIKE Clause
The LIKE clause is a filtering condition designed to search
attribute-label string values to match a specified pattern.

The LIKE clause can be used with the following criteria:

-    **LIKE** - filters for the string pattern and is case sensitive.

-    **ILIKE** - filters for the string pattern and is case insensitive.

-    **NOT LIKE** - returns anything not defined in the string pattern
    and is case sensitive .

-    **NOT ILIKE** - returns anything not defined in the string pattern
    and is case insensitive .

**Wildcards**

-   An underscore (_) matches any single character.

-   A percentage sign (%) matches any string of zero or more
    characters.

To match underscore or percent sign without matching other characters,
the character in the pattern must be preceded by two backslash
characters (e.g. *\"\\\\%\"*).

**Example**

\`\`\`
SELECT SUM({metric/revenue}) WHERE {label/product_name} LIKE "%red%"
\`\`\`

The revenue comes from products containing \"red\" in the Product Name
label of attribute Product.`;
