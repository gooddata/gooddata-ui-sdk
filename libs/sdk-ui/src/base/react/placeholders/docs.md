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
const primaryMeasurePlaceholder = newPlaceholder<IMeasure>();
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
            <button onClick={() => setPrimaryMeasure(Md.Revenue)}>Revenue</button>
        </>
    );
};
```

### Common placeholders

Common placeholders may hold one or multiple values (attributes/measures/filters/sorts...). Note that you should not set other placeholders as the placeholder value - to combine multiple placeholders, use composed placeholder instead. You can create common placeholder by calling `newPlaceholder` method from `@gooddata/sdk-ui`.

###### Create common placeholder

```
// Create common placeholder that may hold single measure.
const measurePlaceholder = newPlaceholder<IMeasure>();

// Create common placeholder that may hold array of attributes.
const attributesPlaceholder = newPlaceholder<IAttribute[]>();
```

###### Set default value of the common placeholder

```
// Create common placeholder with default value.
// Note that in this case, type of the placeholder is derived from the default value,
// so you don't have to explicitly provide it.
const measurePlaceholder = newPlaceholder(Md.Revenue);

// In this case, you have to provide the typing as [] would be infered as never[].
const measuresPlaceholder = newPlaceholder<IMeasure[]>([]);
```

###### Provide common placeholder to the visualization

```
// You can provide placeholder instead of the concrete value to any visualization.
// Placeholder will be replaced by its set value or the default value.
<BarChart
    measures={[measurePlaceholder]}
/>

// You can provide also placeholders that may hold array of values - it will be flattened.
<BarChart
    measures={[measuresPlaceholder]}
/>
```

###### Set validation and other options of the common placeholder

```
// Set custom validation or id of the placeholder.
const measurePlaceholder = newPlaceholder(Md.Revenue, {

    // For the debugging, it can be useful to speficy readable id.
    id: "primaryMeasure",

    // Specify validation of the placeholder value.
    validate: (measure) => {
        // throw error if some condition is not met
    },

});
```

###### Get or set common placeholder value

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

### Composed placeholders

Composed placeholders are placeholders with a value derived from other placeholders and or your custom resolution context. You can create composed placeholder by calling `newComposedPlaceholder` method from `@gooddata/sdk-ui`.

 <!-- By default, each computed placeholder has usePlaceholder hook attached to it for the convenience. -->

###### Create composed placeholder

```
// By default, composed placeholder value
// is resolved as a tuple of resolved input placeholder values.
// In this case it will be [IMeasure, IMeasure]
const combinedMeasuresPlaceholder = newComposedPlaceholder(
    [primaryMeasurePlaceholder, secondaryMeasurePlaceholder]
);
```

###### Create composed placeholder with computed measure

```
// You can also perform some computation with the values of input
const computedMeasurePlaceholder = newComposedPlaceholder(
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

###### Create composed placeholder that accepts custom resolution context

Note that when you have composed placeholders composed from other composed placeholders, custom resolution context is shared among all of these placeholders..

```
const arithmeticMeasurePlaceholder = newComposedPlaceholder(
    [primaryMeasurePlaceholder],
    // Second argument offer a way to provide custom context for the resolution
    ([primaryMeasure], { operator }) => {
        if (!primaryMeasure) {
            return;
        }

        // Create arithmetic measure from the input
        return newArithmeticMeasure([primaryMeasure], operator);
    },
);

// Then you can call the hook like this.
const arithmeticMeasure = arithmeticMeasurePlaceholder.use({ operator: "sum" });

// Or like this.
const arithmeticMeasure = useComputedPlaceholder(arithmeticMeasurePlaceholder, { operator: "sum" });
```

###### Provide composed placeholder to the visualization

```
// You can provide composed placeholder instead of the concrete value to any visualization.
// Placeholder will be replaced by its computed value.
<BarChart
    measures={[arithmeticMeasurePlaceholder]}
    // Provide custom context for the composed placeholders resolution
    placeholdersResolutionContext={{ operator: "sum" }}
/>
```

###### Get composed placeholder value

```
const MeasureSelect = () => {
    const measure = arithmeticMeasurePlaceholder.use({ operator: "sum" });

    // Usage with useComposedPlaceholder hook.
    const arithmeticMeasure = useComposedPlaceholder(arithmeticMeasurePlaceholder, { operator });
    ...
};
```

### Hooks

###### Default hook attached to each placeholder

```
// By default, each placeholder has usePlaceholder hook attached to it for the convenience
const measurePlaceholder = newPlaceholder<IMeasure>();

// Also, each composed placeholder has useComposedPlaceholder hook attached to it for the convenience
const composedPlaceholder = newComposedPlaceholder([measurePlaceholder]);

const Component = () => {
    // With common placeholder

    // This expression
    const [measure, setMeasure] = measurePlaceholder.use();

    // And this expression are equal
    const [measure, setMeasure] = usePlaceholder(measurePlaceholder);

    // With composed placeholder

    // This expression
    const result = composedPlaceholder.use();

    // And this expression are equal
    const result = useComposedPlaceholder(composedPlaceholder);

    ...
};
```

###### usePlaceholder

```
const measurePlaceholder = newPlaceholder<IMeasure>();

const Component = () => {
    // usePlaceholder hook is very similar to useState hook
    const [
        // measure is active or default value of the placeholder
        measure,
        // setMeasure is callback to update the placeholder value
        setMeasure
    ] = usePlaceholder(measurePlaceholder);

    // You can update the placeholder by providing the value
    setMeasure(Md.Revenue)

    // Or you can update the placeholder by providing update callback
    setMeasure((activeMeasure) => {
        // Update the placeholder value according to the active value
        const updatedMeasure = ...;

        return updatedMeasure;
    });
};
```

###### usePlaceholders

```
const measurePlaceholder = newPlaceholder<IMeasure>();
const attributePlaceholder = newPlaceholder<IAttribute>();

const Component = () => {
    const [
        [activeMeasure, activeAttribute],
        setMeasureAndAttribute
    ] = usePlaceholders([measurePlaceholder, attributePlaceholder]);

    // You can update multiple placeholders at once by providing the values.
    // Order of the values is same as input placeholders in usePlaceholders hook
    setMeasureAndAttribute([Md.Revenue, Md.Location]);

    // Or you can update mutiple placeholders at once by providing update callback
    setMeasureAndAttribute(([activeMeasure, activeAttribute]) => {
        // Update placeholders values according to the active values
        const updatedMeasure = ...;
        const updatedAttribute = ...;

        // You have to keep the same order of values as placeholders
        return [updatedMeasure, updatedAttribute];
    });
};
```

###### useComposedPlaceholder

```
const measuresPlaceholder = newPlaceholder([Md.Revenue, Md.Costs]);

const selectedMeasurePlaceholder = newComposedPlaceholder(
    [measuresPlaceholder],
    // measures is resolved value of measures placeholder.
    // Second argument is custom resolution context
    // wich you may provide at the time you are calling it.
    ([measures], { measureIndex }: { measureIndex: number }) => {
        return measures[measureIndex];
    }
);

const Component = () => {
    // Get composed placeholder value. In this case it's resolved as Md.Revenue.
    const measure = selectedMeasurePlaceholder.use({ measureIndex: 0 });

    // In this case it's resolved as Md.Costs
    const measure = selectedMeasurePlaceholder.use({ measureIndex: 1 });

    // Usage with useComposedPlaceholder hook
    const measure = useComposedPlaceholder(selectedMeasurePlaceholder, { measureIndex: 0 });
};
```

###### useResolveValueWithPlaceholders

```
const measurePlaceholder = newPlaceholder(Md.Revenue);
const measuresPlaceholder = newPlaceholder([Md.Costs]);

const Component = () => {
    // Get resolved placeholder value. In this case it's resolved as Md.Revenue.
    const measure = useResolveValueWithPlaceholders(measurePlaceholder);

    // In this case it's resolved as [Md.Costs]
    const measures = useResolveValueWithPlaceholders(measuresPlaceholder);

    // Resolution is working even for arrays with placeholders mixed with other values.
    // Placeholders holding arrays are flattened.
    // In this case it's resolved as [Md.Sales, Md.Revenue, Md.Costs]
    const measures = useResolveValueWithPlaceholders([Md.Sales, measurePlaceholder, measuresPlaceholder]);
};
```

###### useResolveValuesWithPlaceholders

```
const measurePlaceholder = newPlaceholder(Md.Revenue);
const measuresPlaceholder = newPlaceholder([Md.Costs]);

const Component = () => {
    // Get resolved value of multiple placeholders at once.
    // In this case it's resolved as [Md.Revenue, [Md.Costs]].
    const [measure, measures] = useResolveValuesWithPlaceholders([measurePlaceholder, measuresPlaceholder]);

};
```

### Initial placeholder values

```
// Set initial values by providing pairs of placeholders with their initial values
const Root = () =>  (
    <PlaceholdersProvider initialValues={[
        [measurePlaceholder, Md.Revenue],
        [attributePlaceholder, Md.State],
    ]}>
        <App />
    </PlaceholdersProvider>
);
```
