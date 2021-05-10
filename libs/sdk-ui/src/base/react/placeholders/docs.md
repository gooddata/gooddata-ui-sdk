# Placeholders

Placeholders represent specific parts of the execution (attributes, measures, filters, sorts...) that may change the value at runtime.

You can provide them to visualizations instead of the attributes/measures/filters/sorts themselves, which allows you to control and change execution elements for any number of visualizations you want.

Placeholders are built on top of React context and hooks.

### Getting started

###### 1/ Wrap your application in PlaceholdersProvider

```
const Root = () =>  (
    <PlaceholdersProvider>
        <App />
    </PlaceholdersProvider>
);
```

###### 2/ Create your first placeholder

```
const primaryMeasurePlaceholder = newMeasurePlaceholder();
```

###### 3/ Use your first placeholder

```
<BarChart
    measures={[primaryMeasurePlaceholder]}
/>
```

###### 4/ Change value of your first placeholder

```
const PrimaryMeasureSelect = () => {
    const [primaryMeasure, setPrimaryMeasure] = primaryMeasurePlaceholder.use();

    return (
        <>
            Active primary measure identifier: {
                primaryMeasure
                    ? measureIdentifier(primaryMeasure)
                    : "No primary measure"
            }
            <button onClick={() => setPlaceholder(Md.Revenue)}>Revenue</button>
        </>
    );
};
```

### Single placeholders

Single placeholders are placeholders that may hold 1 value - typically attribute, measure, filter or sort. By default, each placeholder has usePlaceholder hook attached to it for the convenience. Each placeholder can also have default value and validation attached to it.

Available single placeholder factories in `@gooddata/sdk-ui` are:

-   `newMeasurePlaceholder`
-   `newAttributePlaceholder`
-   `newFilterPlaceholder`
-   `newSortPlaceholder`

###### Create single placeholder

```
// Create single placeholder simply by calling the factory function.
const measurePlaceholder = newMeasurePlaceholder();
```

###### Set default value of the single placeholder

```
// Set default value of the placeholder as first argument.
const measurePlaceholder = newMeasurePlaceholder(Md.Revenue);
```

###### Set validation and other options of the single placeholder

```
// Set custom validation or id of the placeholder.
const measurePlaceholder = newMeasurePlaceholder(Md.Revenue, {

    // For the debugging, it can be useful to speficy readable id.
    id: "primaryMeasure",

    // Specify custom validation of the placeholder value.
    validate: (measure) => {
        // assert something
    },

});
```

###### Provide single placeholder to the visualization

```
// You can provide placeholder instead of the concrete value to any visualization.
// Placeholder will be replaced by its set value or the default value.
<BarChart
    measures={[measurePlaceholder]}
/>
```

###### Get or set single placeholder value

```
const MeasureSelect = () => {
    // Usage of the placeholder is very similar to useState hook
    const [
        // measure is active value of the placeholder
        measure,
        // setMeasure is callback to update the placeholder value
        setMeasure
    ] = measurePlaceholder.use();


    return (
        <>
            <button
                onClick={() => {
                    // Set active placeholder value
                    setMeasure(Md.Revenue);
                }}
            >
                Revenue
            </button>
        </>
    );
};
```

### Group placeholders

Group placeholders are placeholders that may hold multiple values - typically attributes, measures, filters or sorts. Group placeholders can be also composed of other placeholders. By default, each group placeholder has usePlaceholder hook attached to it for the convenience. Each group placeholder can also have default value and validation attached to it.

Available group placeholder factories in `@gooddata/sdk-ui` are:

-   `newMeasureGroupPlaceholder`
-   `newAttributeGroupPlaceholder`
-   `newFilterGroupPlaceholder`
-   `newSortGroupPlaceholder`

###### Create group placeholder

```
// Create group placeholder simply by calling the factory function.
const measuresPlaceholder = newMeasureGroupPlaceholder();
```

###### Set default value of the group placeholder

```
// Set default value of the placeholder as first argument.
const measuresPlaceholder = newMeasureGroupPlaceholder([Md.Revenue]);
```

###### Set validation and other options of the group placeholder

```
// Set custom validation or id of the placeholder.
const measuresPlaceholder = newMeasureGroupPlaceholder([Md.Revenue], {

    // For the debugging, it can be useful to speficy readable id.
    id: "commmonMeasures",

    // Specify custom validation of the placeholder value.
    validate: (measures) => {
        // assert something
    },

});
```

###### Provide group placeholder to the visualization

```
// You can provide group placeholder instead of the concrete values to any visualization.
// Placeholder will be replaced by its set value or the default value.
<BarChart
    measures={measuresPlaceholder}
/>
```

###### Get or set group placeholder value

```
const MeasuresSelect = () => {
    // Usage of the placeholder is very similar to useState hook
    const [
        // measures is active value of the placeholder
        measures,
        // setMeasures is callback to update the placeholder value
        setMeasures
    ] = measurePlaceholder.use();


    return (
        <>
            <button
                onClick={() => {
                    // Set active group placeholder values
                    setMeasures([Md.Revenue, Md.Costs]);
                }}
            >
                Revenue
            </button>
        </>
    );
};
```

### Computed placeholders

Computed placeholder is a placeholder with a value derived from other placeholders. By default, each computed placeholder has usePlaceholder hook attached to it for the convenience. Each computed placeholder can also have default value and validation attached to it.

There is only one computed placeholder factory in `@gooddata/sdk-ui`:

-   `newComputedPlaceholder`

###### Create computed placeholder

```
const computedMeasurePlaceholder = newComputedPlaceholder(
    // Provide placeholders to compute the result
    [primaryMeasurePlaceholder, filtersPlaceholder],
    // Provide function to calculate the result from the current placeholder values
    ([primaryMeasure, filters]) => {
        if (!primaryMeasure) {
            return;
        }

        // Apply some filters for particular measure only
        return modifySimpleMeasure(primaryMeasure, (m) => m.filters(...filters));
    },
);
```

###### Set validation for the computed placeholder

```
// Set custom validation or id of the placeholder.
const computedMeasurePlaceholder = newComputedPlaceholder(
    [primaryMeasurePlaceholder, filtersPlaceholder],
    computeResult,
    {
        validate: ([primaryMeasure, filtersPlaceholder]) => {
            // Validate input of the computed placeholder
        };
    }
);
```

###### Provide computed placeholder to the visualization

```
// You can provide placeholder instead of the concrete value to any visualization.
// Placeholder will be replaced by its computed value
<BarChart
    measures={[computedMeasurePlaceholder]}
/>
```

###### Get computed placeholder value

```
const MeasureSelect = () => {
    const [
        // measure is active value of the placeholder
        measure,
    ] = computedMeasurePlaceholder.use();

    return (
        <>
            ...
        </>
    );
};
```

### Hooks

###### Default hook attached to each placeholder

###### usePlaceholder

###### usePlaceholders

###### useResolvePlaceholderValue

###### useResolvePlaceholdersValues

### Validations

###### Default validations

###### Custom validations

### Typings

###### Default typings

###### Narrowing placehodler types

### Initial values

###### Set initial values

### Custom placeholders

###### Create custom placeholder

### Recommendations
