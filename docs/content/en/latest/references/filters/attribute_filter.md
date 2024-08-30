
---
id: attribute_filter_component
title: Attribute Filter
sidebar_label: Attribute Filter
copyright: (C) 2007-2024 GoodData Corporation

---

The **Attribute Filter component** is a dropdown that lists attribute values.

![Attribute Filter Component](gd-ui/attribute_filter_new.png "Attribute Filter Component")

### Implementing the Component

You can implement the component using one of the following methods:

-   Pass a callback function that receives an updated filter with selected values when a user clicks **Apply**.
-   Use the `connectToPlaceholder` property, where the component automatically handles changes without needing the `onApply` function. Use `onApply` only if you require a specific callback.

You can also define which attribute values should be selected by default in the filter.

> **Note:** When implementing the Attribute Filter Button component, consider GoodData Cloud and GoodData.CN supports filters with attribute elements defined by their `primary key`, which is equal to the title of the respective element.

### Example

In this example, attribute values are listed, and the `onApply` callback is triggered when a user clicks **Apply** to confirm the selection. The `onApply` callback receives a new filter definition, which you can use to filter charts.

```jsx
import React, { useState } from "react";
import { AttributeFilter, Model } from "@gooddata/sdk-ui-filters";
import { newNegativeAttributeFilter } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui-filters/styles/css/main.css";

import * as Md from "./md/full";

const defaultFilter = newNegativeAttributeFilter(Md.EmployeeName.Default, []);

export const AttributeFilterExample = () => {
    const [filter, setFilter] = useState(defaultFilter);

    return (
        <AttributeFilter
            filter={filter}
            onApply={(updatedFilter) => {
                console.log("Applying updated filter:", updatedFilter);
                setFilter(updatedFilter);
            }}
        />
    );
};
```

### Attribute Filter Component vs. Attribute Filter Button Component

The Attribute Filter component is functionally similar to the [Attribute Filter Button component](../attribute_filter_button_component/). You can use either, depending on the preferred look of the filter dropdown button.

![Filter Dropdown Button](gd-ui/attribute_filter_new_top_visual.png "Filter Dropdown Button")

### Defining Default Selection of Values

To define the attribute values that should be selected by default in the filter, include those values in the `filter` property.

```jsx
<AttributeFilter
    filter={newPositiveAttributeFilter(Md.EmployeeName.Default, ["Abbie Adams"])}
    onApply={this.onApply}
/>
```

### Defining Parent-Child Relationships Between Filters

To set up a parent-child relationship between two attribute filters, pass the `parentFilters` and `parentFilterOverAttribute` properties to the child filter.

The `parentFilterOverAttribute` property defines how the parent and child filters are connected. You can specify this relationship using a reference to an attribute in the parent filter or an independent attribute common to both filters.

You can define the parent filter as an AttributeFilter or a visualization definition placeholder.

```jsx
<div>
    <AttributeFilter filter={parentFilter} onApply={setParentFilter} />
    <AttributeFilter
        filter={filter}
        parentFilters={parentFilter ? [parentFilter] : []}
        parentFilterOverAttribute={idRef("attr.restaurantlocation.locationid")}
        onApply={setFilter}
    />
</div>
```

```jsx
<div>
    <AttributeFilter connectToPlaceholder={parentFilterPlaceholder} />
    <AttributeFilter
        connectToPlaceholder={filterPlaceholder}
        parentFilters={parentFilterPlaceholder ? [parentFilterPlaceholder] : []}
        parentFilterOverAttribute={idRef("attr.restaurantlocation.locationid")}
    />
</div>
```

### Using Attributes with Duplicate Values

When an attribute used by the filter has a secondary label with duplicate values, you can display all of them by setting the `enableDuplicatedLabelValuesInAttributeFilter` prop. To select a specific duplicate, the filter definition should use the primary label with unique values. You can then define the secondary label to display the primary values using the `displayAsLabel` prop.

For example, the 'User' attribute might have a 'user_id' label with unique but less readable values and a 'user_name' label with duplicate but more readable values. To distinguish between users, define the filter using 'user_id' and set `displayAsLabel` to 'user_name' to display the more readable label.

```jsx
<AttributeFilter
    filter={newPositiveAttributeFilter(Md.UserId.Default, ["10006"])}
    onApply={this.onApply}
    enableDuplicatedLabelValuesInAttributeFilter={true}
    displayAsLabel={Md.UserId.UserName.attribute.displayForm}
/>
```

### Properties

| Name                                         | Required? | Type                                 | Description                                                                                                                                                                                                                                                                                                                                   |
| :------------------------------------------- | :-------- | :----------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| onApply                                      | false     | OnApplyCallbackType                  | A callback that contains the updated filter when a user confirms the selection.                                                                                                                                                                                                                                                               |
| onError                                      | false     | (error: GoodDataSdkError) => void;   | A callback triggered when the component encounters an error.                                                                                                                                                                                                                                                                                  |
| filter                                       | false     | IAttributeFilter                     | The attribute filter definition.                                                                                                                                                                                                                                                                                                              |
| parentFilters                                | false     | AttributeFiltersOrPlaceholders       | An array of parent attribute filter definitions. GoodData does not yet support this feature.                                                                                                                                                                                                                                                  |
| connectToPlaceholder                         | false     | IPlaceholder&lt;IAttributeFilter&gt; | The visualization definition placeholder is used to get and set the value of the attribute filter.                                                                                                                                                                                                                                            |
| parentFilterOverAttribute                    | false     | ParentFilterOverAttributeType        | The reference to the parent filter attribute that reduces the available options or the function that returns this reference for a given parent filter.                                                                                                                                                                                        |
| backend                                      | false     | IAnalyticalBackend                   | The object with the configuration related to communication with the backend and access to analytical workspaces.                                                                                                                                                                                                                              |
| workspace                                    | false     | string                               | The workspace ID.                                                                                                                                                                                                                                                                                                                             |
| locale                                       | false     | ILocale                              | The localization of the component. Defaults to `en-US`.                                                                                                                                                                                                                                                                                       |
| fullscreenOnMobile                           | false     | boolean                              | If `true`, adjusts the filter to render properly on mobile devices.                                                                                                                                                                                                                                                                           |
| title                                        | false     | string                               | A custom label to show on the dropdown button.                                                                                                                                                                                                                                                                                                |
| titleWithSelection                           | false     | string                               | The label displays the attribute title and the applied selection. This option is not applied if the `title` property is set.                                                                                                                                                                                                                  |
| hiddenElements                               | false     | string[]                             | Specify elements to exclude from the selection list. Currently, elements can only be specified by their URIs. This feature is not yet supported by GoodData.CN and GoodData Cloud.                                                                                                                                                            |
| staticElements                               | false     | string[]                             | Provide elements to show in the selection list instead of loading them from the backend.                                                                                                                                                                                                                                                      |
| enableDuplicatedLabelValuesInAttributeFilter | true      | boolean                              | Allows the filter to show duplicated label elements.                                                                                                                                                                                                                                                                                          |
| displayAsLabel                               | false     | ObjRef                               | Defines the attribute label used for representing elements in the UI. The `filter` property should use the attribute's primary label if `displayAsLabel` is used. This allows defining the selection by the unique elements of the primary label while showing them in the AttributeFilter component using the more readable secondary label. |

**NOTE:** The `uri` property (the URI of the attribute displayForm used in the filter) and the `identifier` property (the identifier of the attribute displayForm used in the filter) are **deprecated**. Do not use them. To define an attribute, use the `filter` property.

### Customizing AttributeFilter Components

> **Note:** The AttributeFilter component customizations are still in beta. We appreciate any feedback that will help us improve this feature.

If you want to customize the look of the AttributeFilter, you can provide your own components to render its specific parts.

```jsx
<AttributeFilter
    filter={newNegativeAttributeFilter(Md.EmployeeName.Default, [])}
    onApply={setFilter}
    // Provide your own component for rendering "Apply" and "Cancel" buttons
    DropdownActionsComponent={CustomActions}
    // Provide your own component for rendering attribute elements
    ElementsSelectItemComponent={CustomItem}
/>
```

To see all the customization options, refer to the table below with the [customization properties](#customization-properties).

### Accessing Internal AttributeFilter Context

In some cases, the properties provided to custom components may not be sufficient. In such cases, you can use the `useAttributeFilterContext` hook to access the full internal state of the component and obtain the data and callbacks you need.

```jsx
const { attribute } = useAttributeFilterContext();
```

Currently, we recommend using component customizations mainly for minor tweaks to the AttributeFilter UI. Consider other options if you need a completely custom UI that differs significantly from the AttributeFilter component.

### Customization Properties

| Name                           | Required? | Type      | Description                                                                                                                                                                                 |
| :----------------------------- | :-------- | :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ErrorComponent                 | false     | Component | A component to be rendered if the initialization of the attribute filter fails.                                                                                                             |
| LoadingComponent               | false     | Component | A component to be rendered while the attribute filter is loading.                                                                                                                           |
| DropdownButtonComponent        | false     | Component | A component to be rendered instead of the default dropdown button. ![Dropdown Button](gd-ui/attribute_filter_dropdown_button.png "Dropdown Button")                                         |
| DropdownBodyComponent          | false     | Component | A component to be rendered instead of the default dropdown body. ![Dropdown Body](gd-ui/attribute_filter_dropdown_body.png "Dropdown Body")                                                 |
| DropdownActionsComponent       | false     | Component | A component to be rendered instead of the default dropdown actions. ![Dropdown Actions](gd-ui/attribute_filter_dropdown_actions.png "Dropdown Actions")                                     |
| ElementsSearchBarComponent     | false     | Component | A component to be rendered instead of the default elements search bar. ![Elements Search Bar](gd-ui/attribute_filter_elements_search_bar.png "Elements Search Bar")                         |
| ElementsSelectComponent        | false     | Component | A component to be rendered instead of the default elements selected. ![Elements Select](gd-ui/attribute_filter_elements_select.png "Elements Select")                                       |
| ElementsSelectLoadingComponent | false     | Component | A component should be rendered instead of the default elements, so select loading. ![Elements Select Loading](gd-ui/attribute_filter_elements_select_loading.png "Elements Select Loading") |
| ElementsSelectItemComponent    | false     | Component | A component to be rendered instead of the default elements select item. ![Elements Select Item](gd-ui/attribute_filter_elements_select_item.png "Elements Select Item")                     |
| ElementsSelectActionsComponent | false     | Component | A component to be rendered instead of the default elements select actions. ![Elements Select Actions](gd-ui/attribute_filter_elements_select_actions.png "Elements Select Actions")         |
| ElementsSelectErrorComponent   | false     | Component | A component to be rendered instead of the default elements select error. ![Elements Select Error](gd-ui/attribute_filter_elements_select_error.png "Elements Select Error")                 |
| EmptyResultComponent           | false     | Component | A component to be rendered instead of the default empty result. ![Empty Result](gd-ui/attribute_filter_empty_result.png "Empty Result")                                                     |
| StatusBarComponent             | false     | Component | A component to be rendered instead of the default status bar. ![Status Bar](gd-ui/attribute_filter_status_bar.png "Status Bar")                                                             |

```

```
