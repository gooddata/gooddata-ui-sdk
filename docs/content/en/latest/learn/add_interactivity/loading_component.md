---
id: loading_component
title: LoadingComponent
sidebar_label: LoadingComponent
copyright: (C) 2007-2018 GoodData Corporation
---

LoadingComponent indicator is a property that enables you to customize what content is displayed when a visual component is in its loading state. You can disable the default setting of the LoadingComponent indicator by explicitly passing null instead.

The LoadingComponent indicator is supported by all visualization components.

## Example: Disabled LoadingComponent

In the following example, the KPI shows neither the loading indicator nor the error message.

```jsx
import { Kpi } from "@gooddata/sdk-ui";
import * as Md from "./md/full";

<Kpi
    measure={Md.$FranchiseFees}
    format="<format>"
    LoadingComponent={null}
    ErrorComponent={null}
/>
```

## Example: Customized LoadingComponent

In the following example, the default LoadingComponent is customized with color, fixed size, indicator size, and speed of animation.

```jsx
import React, { Component } from "react";
import { Kpi, LoadingComponent } from "@gooddata/sdk-ui";
import * as Md from "./md/full";

export class CustomisedLoadingComponentExample extends Component {
    render() {
        return (
            <LoadingComponent
                color="tomato"
                height={300}
                imageHeight={16}
                speed={2}
            />
        );
    }
}

export default CustomisedLoadingComponentExample;

<Kpi
    measure={Md.$FranchiseFees}
    LoadingComponent={CustomisedLoadingComponentExample}
/>
```