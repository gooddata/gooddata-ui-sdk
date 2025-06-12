---
title: Visualization Definition Placeholders
sidebar_label: Visualization Definition Placeholders
copyright: (C) 2007-2021 GoodData Corporation
weight: 12
---

**Visualization definition placeholders** let you dynamically change the data coming to visualizations (such as measures and attributes) based on a specific user action.

The visualization definition placeholders are parts of the visualization execution elements (attributes, measures, filters, sorts, or totals) that can change their value at runtime.

Using the visualization definition placeholders in visualizations instead of the execution elements allows you to change the visualizations by simply changing the placeholder values.

The visualization definition placeholders are built on top of React context and hooks.

## Create and use a visualization definition placeholder

**Steps:**

1. Wrap your application with `PlaceholdersProvider`.

    ```
    import { PlaceholdersProvider } from '@gooddata/sdk-ui';

    const Root = () =>  (
        <PlaceholdersProvider>
            <App />
        </PlaceholdersProvider>
    );
    ```

1. Create a visualization definition placeholder.

    ```
    import { newPlaceholder } from '@gooddata/sdk-ui';

    export const primaryMeasurePlaceholder = newPlaceholder();
    ```

1. Use the visualization definition placeholder in a visualization.

    ```
    import { BarChart } from '@gooddata/sdk-ui-charts';

    <BarChart
        measures={[primaryMeasurePlaceholder]}
    />
    ```

1. Change the value of the visualization definition placeholder.

    ```
    const PrimaryMeasureSelect = () => {
        // Usage of the placeholder is similar to using the React useState hook.
        const [
            // An active value of the placeholder
            primaryMeasure,
            // A callback to set the value of the placeholder
            setPrimaryMeasure
        ] = primaryMeasurePlaceholder.use();

        return (
            <div>
                Active primary measure identifier: {
                    primaryMeasure
                        ? measureIdentifier(primaryMeasure)
                        : "No primary measure"
                }
                <button
                    onClick={() => {
                        // Set the value of the placeholder.
                        setPrimaryMeasure(Md.Revenue);
                    }}
                >
                    Revenue
                </button>
            <div/>
        );
    };
    ```

## Set the initial values of a visualization definition placeholder

```
const Root = () =>  (
    <PlaceholdersProvider initialValues={[
        // Pairs of [placeholder, initialValue]
        [measurePlaceholder, Md.Revenue],
        [attributePlaceholder, Md.State],
    ]}>
        <App />
    </PlaceholdersProvider>
);
```

## Common visualization definition placeholders

**Common visualization definition placeholders** can have one or multiple values (attributes, measures, filters, sorts, or totals).

**NOTE:** Do not use the common placeholders as values of another placeholder. To combine multiple visualization definition placeholders, use [composed placeholders](#composed-visualization-definition-placeholders).

### Create a common visualization definition placeholder

```
const measurePlaceholder = newPlaceholder();
```

### Create a common visualization definition placeholder with a predefined default value

```
const measurePlaceholder = newPlaceholder(Md.Revenue);
```

### Create a common visualization definition placeholder with a predefined ID and validation rules

```
const measurePlaceholder = newPlaceholder(Md.Revenue, {

    // For easier debugging, specify a user-friendly ID for the placeholder.
    id: "primaryMeasure",

    // Specify validation for the placeholder value.
    validate: (measure) => {
        // Throw an error if some condition is not met.
    },

});
```

### Get or set a value of a common visualization definition placeholder

By default, a common visualization definition placeholder has a [`usePlaceholder`](#usePlaceholder) hook attached for convenience. Its usage is similar to using the React [`useState`](https://reactjs.org/docs/hooks-state.html) hook.

```
const MeasureSelect = () => {
    const [
        // measure is an active value of the placeholder.
        measure,
        // setMeasure is a callback to update the value of the placeholder.
        setMeasure
    ] = measurePlaceholder.use();

    return (
        <button
            onClick={() => {
                // Set an active placeholder value.
                setMeasure(Md.Revenue);
            }}
        >
            Revenue
        </button>
    );
};
```

### Use a common visualization definition placeholder in a visualization

At runtime, a common visualization definition placeholder is replaced with either its default value or the value that has been set for it.

```
<BarChart
    measures={[measurePlaceholder]}
/>
```

You can use the visualization definition placeholders that hold an array of values. It will be flattened during the placeholder resolution.

```
<BarChart
    measures={[measureGroupPlaceholder]}
/>
```

## Composed visualization definition placeholders

**Composed visualization definition placeholders** are placeholders with a value derived from other placeholders and/or your custom resolution context.

### Create a composed visualization definition placeholder

By default, a value of a composed visualization definition placeholder is resolved as a tuple of resolved input values of the visualization definition placeholder.

In the following example, it is an array of measures:

```
const combinedMeasuresPlaceholder = newComposedPlaceholder(
    [primaryMeasurePlaceholder, secondaryMeasurePlaceholder]
);
```

### Create a composed visualization definition placeholder with a computed value

With the composed visualization definition placeholders, you can perform computations on top of resolved input values of a visualization definition placeholder. This can be useful, for example, when you want to apply filters from some visualization definition placeholder to a particular measure placeholder.

```
const computedMeasurePlaceholder = newComposedPlaceholder(
    // The placeholders to compute the result
    [primaryMeasurePlaceholder, filtersPlaceholder],

    // The function to calculate the result from the resolved placeholder values
    ([primaryMeasure, filters]) => {
        if (!primaryMeasure) {
            return;
        }

        // Apply some filters only to a specific measure
        return modifySimpleMeasure(primaryMeasure, (m) => m.filters(...filters));
    },
);
```

### Create a composed visualization definition placeholder that accepts custom resolution context

You can provide your own resolution context to composed visualization definition placeholders. This can be useful, for example, when you want to influence the resolution of a visualization definition placeholder's value based on some data that the placeholder does not know about.

**NOTE:** When you have composed visualization definition placeholders that are composed of other composed placeholders, custom resolution context is shared among **all** of these placeholders.

```
const arithmeticMeasurePlaceholder = newComposedPlaceholder(
    [primaryMeasurePlaceholder, secondaryMeasurePlaceholder],
    // The second argument offers a way to provide custom context for the resolution.
    ([primaryMeasure, secondaryMeasure], { operator }) => {
        if (!primaryMeasure) {
            return;
        }

        // Create an arithmetic measure from the input.
        return newArithmeticMeasure([primaryMeasure, secondaryMeasure], operator);
    },
);

// Then, you can call a hook in your component like this:
const arithmeticMeasure = arithmeticMeasurePlaceholder.use({ operator: "sum" });

// ...or like this:
const arithmeticMeasure = useComputedPlaceholder(arithmeticMeasurePlaceholder, { operator: "sum" });
```

### Get a value of a composed visualization definition placeholder

By default, a composed visualization definition placeholder has the [`useComposedPlaceholder`](#useComposedPlaceholder) hook attached for convenience.

```
const MeasureSelect = () => {
    // Without resolution context:
    const measure = composedMeasurePlaceholder.use();

    // With resolution context:
    const measure = arithmeticMeasurePlaceholder.use({ operator: "sum" });

    // Usage with the useComposedPlaceholder hook:
    const arithmeticMeasure = useComposedPlaceholder(arithmeticMeasurePlaceholder, { operator });

    ...
};
```

### Use a composed visualization definition placeholder in a visualization

At runtime, a composed visualization definition placeholder is replaced with its resolved value.

```
<BarChart
    measures={[arithmeticMeasurePlaceholder]}
    // Provide custom context for the composed placeholders resolution.
    placeholdersResolutionContext={{ operator: "sum" }}
/>
```

## Hooks

GoodData.UI contains React hooks that help you obtain, set, and resolve visualization definition placeholder values.

- `usePlaceholder` to get or set a value of a common visualization definition placeholder.
- `usePlaceholders` to get or set multiple values of a common visualization definition placeholder at once.
- `useComposedPlaceholder` to get a value of a composed visualization definition placeholder.
- `useResolveValueWithPlaceholders` to resolve a value that may contain visualization definition placeholders to actual values.
- `useResolveValuesWithPlaceholders` to resolve multiple values that may contain visualization definition placeholders to actual values at once.

### usePlaceholder

Use the `usePlaceholder` hook to get or set a value of a common visualization definition placeholder.

```
const measurePlaceholder = newPlaceholder();

const Component = () => {
    // The usePlaceholder hook is similar to the useState hook.
    const [
        // measure is an active or default value of the placeholder.
        measure,
        // setMeasure is a callback to update the value of the placeholder.
        setMeasure
    ] = usePlaceholder(measurePlaceholder);

    // You can update the placeholder by providing either a value:
    setMeasure(Md.Revenue)

    // ...or an update callback:
    setMeasure((activeMeasure) => {
        // Update the value of the placeholder according to the active value.
        const updatedMeasure = ...;

        return updatedMeasure;
    });
};
```

### usePlaceholders

Use the `usePlaceholders` hook to get or set multiple values of a common visualization definition placeholder at once. This can be useful, for example, when you want to make an atomic change (such as setting a preset of values to multiple visualization definition placeholders).

```
const measurePlaceholder = newPlaceholder();
const attributePlaceholder = newPlaceholder();

const Component = () => {
    const [
        [activeMeasure, activeAttribute],
        setMeasureAndAttribute
    ] = usePlaceholders([measurePlaceholder, attributePlaceholder]);

    // You can update multiple placeholders at once by providing the values.
    // The order of the values must be the same as the order of the input placeholders.
    setMeasureAndAttribute([Md.Revenue, Md.Location]);

    // Alternatively, you can update multiple placeholders at once by providing an update callback.
    setMeasureAndAttribute(([activeMeasure, activeAttribute]) => {
        // Update the values of the placeholders according to the active values.
        const updatedMeasure = ...;
        const updatedAttribute = ...;

        // The order of the values must be the same as the order of the input placeholders.
        return [updatedMeasure, updatedAttribute];
    });
};
```

### useComposedPlaceholder

Use the `useComposedPlaceholder` hook to get a value of a composed visualization definition placeholder.

```
const measureGroupPlaceholder = newPlaceholder([Md.Revenue, Md.Costs]);

const selectedMeasurePlaceholder = newComposedPlaceholder(
    [measureGroupPlaceholder],
    // measures is a resolved value of the measure placeholder.
    // The second argument is custom resolution context
    // that you can provide at the moment when you are calling it.
    ([measures], { measureIndex }) => {
        return measures[measureIndex];
    }
);

const Component = () => {
    // Get a value of the composed placeholder.
    // In this example, it is resolved to Md.Revenue.
    const measure = selectedMeasurePlaceholder.use({ measureIndex: 0 });

    // In this example, it is resolved to Md.Costs.
    const measure = selectedMeasurePlaceholder.use({ measureIndex: 1 });

    // Usage with the useComposedPlaceholder hook
    const measure = useComposedPlaceholder(selectedMeasurePlaceholder, { measureIndex: 0 });
};
```

### useResolveValueWithPlaceholders

Use the `useResolveValueWithPlaceholders` hook to resolve a value that may contain visualization definition placeholders to actual values.

When the value is an array, visualization definition placeholders that hold array values are flattened.

Objects are not recursively traversed; placeholder nesting is not supported.

```
const measurePlaceholder = newPlaceholder(Md.Revenue);
const measureGroupPlaceholder = newPlaceholder([Md.Costs]);

const Component = () => {
    // Get a resolved value of the placeholder.
    // In this example, it is resolved to Md.Revenue.
    const measure = useResolveValueWithPlaceholders(measurePlaceholder);

    // In this example, it is resolved to [Md.Costs].
    const measures = useResolveValueWithPlaceholders(measureGroupPlaceholder);

    // Resolution works even for arrays with placeholders mixed with other values.
    // Placeholders holding arrays are flattened.
    // In this example, it is resolved to [Md.Sales, Md.Revenue, Md.Costs].
    const measures = useResolveValueWithPlaceholders([Md.Sales, measurePlaceholder, measuresPlaceholder]);
};
```

### useResolveValuesWithPlaceholders

Use the `useResolveValuesWithPlaceholders` to resolve multiple values that may contain visualization definition placeholders to actual values at once.

The resolution rules are the same as the rules for the [useResolveValueWithPlaceholders](#useResolveValueWithPlaceholders) hook.

```
const measurePlaceholder = newPlaceholder(Md.Revenue);
const measureGroupPlaceholder = newPlaceholder([Md.Costs]);

const Component = () => {
    // Get a resolved value of multiple placeholders at once.
    // In this example, it is resolved to [Md.Revenue, [Md.Costs]].
    const [measure, measures] = useResolveValuesWithPlaceholders([
        measurePlaceholder,
        measureGroupPlaceholder
    ]);

};
```

## Use the visualization definition placeholders with TypeScript

The visualization definition placeholders have built-in first-class TypeScript support.

### Specify the type of a common visualization definition placeholder

```
// A placeholder that can hold any measure
export const primaryMeasurePlaceholder = newPlaceholder<IMeasure>();

// A placeholder that can hold multiple attributes
export const attributeGroupPlaceholder = newPlaceholder<IAttribute[]>([]);
```

### Use type inference

When you set the default value for a visualization definition placeholder, the placeholder type is inferred from this default value.

```
// The placeholder type is inferred from the primaryMeasure type.
export const primaryMeasurePlaceholder = newPlaceholder(primaryMeasure);

// If the primaryMeasure type is too narrow (for example, IMeasure<IPoPMeasureDefinition>),
// you may want to correct it to make it accept any measure type.
export const primaryMeasurePlaceholder = newPlaceholder<IMeasure>(primaryMeasure);
```

Type inference also works for the [hooks](#Hooks).

```
export const measurePlaceholder = newPlaceholder<IMeasure>(Md.Sales);

// The value is correctly inferred as IMeasure.
const value = useResolveValueWithPlaceholders(measurePlaceholder)

export const attributesPlaceholder = newPlaceholder<IAttribute[]>([]);

// The value is correctly inferred as IAttribute[].
const value = useResolveValueWithPlaceholders(attributesPlaceholder)

// Inference is even aware of resolution array flattening.
// In this example, it is inferred as IAttribute[].
const value = useResolveValueWithPlaceholders([attributesPlaceholder])
```
