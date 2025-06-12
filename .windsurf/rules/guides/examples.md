---
trigger: model_decision
description: Creating new live code examples
globs:
---

# GoodData.UI SDK Examples

## Standard Example Structure

-   Examples should be organized following the pattern in the sdk-interactive-examples directory
-   Each example should have a clear and focused purpose demonstrating a specific feature of GoodData.UI
-   Examples should be runnable in both CodeSandbox and locally
-   All examples should include a README.md with clear instructions

## Example Component Implementation

-   Example components should be kept simple and focused on demonstrating a single concept
-   Avoid complex logic that detracts from the main demonstration
-   Include helpful comments in code to explain key concepts
-   Follow this basic structure:

    ```tsx
    import React from "react";
    import { SomeComponent } from "@gooddata/sdk-ui-charts"; // Import appropriate components
    import * as Catalog from "../catalog.js"; // Use the catalog for metrics/attributes

    export default () => (
        <>
            <h1>Example Title</h1>
            <div style={{ height: 300 }}>
                <SomeComponent measures={[Catalog.SomeMeasure]} viewBy={Catalog.SomeAttribute} />
            </div>
        </>
    );
    ```

## Example Dependencies

-   All example-specific dependencies must be declared in the "exampleDependencies" array in package.json
-   Use Rush to add dependencies: `rush add -p [package-name] -m`
-   Keep dependencies consistent with the main SDK where possible

## Example Creation Workflow

1. Use the template in examples-template as a starting point
2. Run `npm run create-example` from the sdk-interactive-examples directory
3. Create your example code in the src/example directory
4. Create a 1024x768 PNG preview and save it to .example/preview.png
5. Validate your example with `npm run validate`

## Example Updates

-   When updating examples, use `npm run update-examples-template` to propagate changes
-   Do not modify catalog exports directly in individual examples
-   Update catalogs in the examples-template directory with `npm run refresh-md`

## Example Documentation

-   Ensure each example has a descriptive title and description in package.json
-   README.md should explain what the example demonstrates and how to run it
-   Include comments in code for tricky or important parts of the implementation

## Example Types to Include

-   Basic chart examples (column, bar, line, pie, etc.)
-   Data filtering examples
-   Dashboard components
-   Advanced features (drill downs, custom visualizations)
-   Data loading and transformation
