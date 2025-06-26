# GoodData UI SDK Translation Glossary

## Introduction

This glossary provides standardized definitions and translation guidance for common terms used throughout the GoodData UI SDK. Its purpose is to:

1. Ensure consistency in translations across all localization files
2. Provide context and examples for translators
3. Serve as a reference for developers adding new strings to the application
4. Document whether terms should be translated or maintained as-is

## How to Use This Glossary

-   When adding new strings to localization files, check if related terms exist in this glossary
-   Reference glossary definitions when creating comments for translation strings
-   When appropriate, comments in localization files can directly reference this glossary
-   If adding new terms to the application, consider updating this glossary

---

## Data Visualization Terms

### Measure

**Definition**: A quantitative data value calculated from your data, typically representing numerical metrics that can be aggregated (summed, averaged, etc.).

**Examples**: Sum of Revenue, Count of Orders, Average Rating

**Translation Guidance**: Should be translated, maintaining consistency with mathematical/analytical terminology in the target language.

**Standard Comment**: "Label for quantitative data values calculated from your data (e.g., Sum of Revenue, Count of Orders)"

### Metric

**Definition**: A calculated indicator based on metric data that shows business performance or key performance indicators (KPIs).

**Examples**: Revenue Growth, Profit Margin, Year-over-Year Change

**Translation Guidance**: Should be translated, maintaining consistency with business/analytical terminology in the target language.

**Standard Comment**: "Label for calculated indicators based on metric data that show performance (e.g., Revenue Growth, Profit Margin)"

### View by

**Definition**: A categorical field used to group or categorize data in visualizations, typically representing the primary dimension for data grouping.

**Examples**: Product, Customer, Region

**Translation Guidance**: Should be translated to convey the concept of "grouping by" or "categorizing by" in the target language.

**Standard Comment**: "Label for a categorical data field used to group or categorize your data (e.g., Product, Customer, Region)"

### Stack by

**Definition**: A categorical field used to further segment data that has already been grouped, creating stacked visualizations where each stack represents a category.

**Examples**: Product Category, Sales Channel, Customer Segment

**Translation Guidance**: Should be translated to convey the concept of "stacking data by category" in the target language.

**Standard Comment**: "Label for a categorical field used to create stacked segments in visualizations (e.g., splitting bars into segments by Product Category)"

### Trend by

**Definition**: A time-based field used to show data changes over time periods, typically used with time series visualizations.

**Examples**: Date, Month, Quarter, Year

**Translation Guidance**: Should be translated to convey the concept of "showing trends over time" in the target language.

**Standard Comment**: "Label for a time-based field showing how data changes over time periods (e.g., Month, Year, Quarter)"

### Segment by

**Definition**: A categorical field used to subdivide data into distinct segments or categories, often used for color differentiation in visualizations.

**Examples**: Product Type, Customer Status, Region

**Translation Guidance**: Should be translated to convey the concept of "dividing into segments" in the target language.

**Standard Comment**: "Label for a categorical field used to divide data into segments or categories (e.g., Product Type, Customer Status)"

---

## UI Components and Actions

### Widget

**Definition**: A UI container that displays a visualization, filter, or other dashboard element.

**Examples**: Chart widget, Filter widget, Text widget

**Translation Guidance**: Should be translated, using the equivalent UI component terminology in the target language.

**Standard Comment**: "Label for a UI container that displays a visualization or dashboard element"

### Filter

**Definition**: A UI control that allows users to restrict data shown in visualizations based on specific criteria.

**Examples**: Date filter, Attribute filter, Measure filter

**Translation Guidance**: Should be translated, maintaining consistency with data filtering terminology in the target language.

**Standard Comment**: "Label for a control that allows users to restrict what data is displayed in visualizations"

---

## Technical Terms

### Attribute

**Definition**: A categorical dimension or characteristic of your data that is used for grouping, filtering or labeling.

**Examples**: Product Name, Customer ID, Category

**Translation Guidance**: Should be translated, but maintain consistency with database/data modeling terminology in the target language.

**Standard Comment**: "Label for a categorical data field representing a characteristic or property (e.g., Product, Customer, Region)"

### Fact

**Definition**: A numeric value in your data model that can be aggregated to create measures.

**Examples**: Revenue amount, Quantity sold, Rating value

**Translation Guidance**: Should be translated, but maintain consistency with database/data modeling terminology in the target language.

**Standard Comment**: "Label for a numerical data point that can be aggregated into measures (e.g., Price, Quantity)"

### Columns

**Definition**: A structural element in tabular visualizations representing vertical divisions of data, typically containing measures or attributes.

**Examples**: In tables, pivot tables, and tabular layouts

**Translation Guidance**: Should be translated, maintaining consistency with spreadsheet and table terminology in the target language.

**Standard Comment**: "Label for categorical data fields or measures that will be displayed as columns in a tabular visualization"

### Rows

**Definition**: A structural element in tabular visualizations representing horizontal divisions of data, typically containing attributes for categorization.

**Examples**: In tables, pivot tables, and tabular layouts

**Translation Guidance**: Should be translated, maintaining consistency with spreadsheet and table terminology in the target language.

**Standard Comment**: "Label for categorical data fields that will be displayed as rows in a tabular visualization"

---

## Error and Notification Messages

### Missing Primary Item Error

**Definition**: Error message displayed when a visualization or report is missing a required primary item (measure or metric).

**Examples**: "No primary measure in your visualization", "No primary metric in your report"

**Translation Guidance**: Should be translated, maintaining clarity of what is missing and from where. Keep message concise but instructive.

**Standard Comment**: "Error message shown when a required data item is missing from a visualization or report"

### View By Limitation Warning

**Definition**: Warning message shown when there are limitations on how many attributes can be used in a View By configuration based on the number of measures/metrics.

**Examples**: "To view by another attribute, a visualization can have only one measure"

**Translation Guidance**: Should maintain the conditional relationship between number of measures and view by capabilities. Preserve the technical meaning.

**Standard Comment**: "Warning message explaining View By configuration limitations based on measure/metric count"

### Stack By Limitation Warning

**Definition**: Warning message shown when there are limitations on how many attributes can be used in a Stack By configuration based on the number of measures/metrics.

**Examples**: "To stack by, a visualization can have only one measure"

**Translation Guidance**: Should maintain the conditional relationship between number of measures and stack by capabilities. Preserve the technical meaning.

**Standard Comment**: "Warning message explaining Stack By configuration limitations based on measure/metric count"

---

## Future Additions

This glossary will be expanded with additional terms as they are identified and standardized. Categories may include:

-   Chart-specific terminology
-   Dashboard layout terms
-   More error and notification messages
-   Accessibility-related terms
-   Analytical function terminology

---

_Last updated: June 17, 2025_
