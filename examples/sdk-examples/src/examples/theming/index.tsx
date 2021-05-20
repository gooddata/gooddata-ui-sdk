// (C) 2007-2019 GoodData Corporation
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import { ThemeProviderExample } from "./ThemedComponentsExample";

// eslint-disable-next-line import/no-unresolved
import ThemeProviderExampleSrc from "./ThemedComponentsExample?raw";

// eslint-disable-next-line import/no-unresolved
import ThemeProviderExampleSrcJS from "./ThemedComponentsExample?rawJS";

export const ThemedComponents: React.FC = () => (
    <div>
        <h1>Custom Themed components</h1>
        <p>
            These examples show how to use ThemeProvider component to theme the UI components which support
            customization.
        </p>
        <p>
            NOTE: Even when the ThemeProvider component encapsulates just a sub-tree of yours application the
            custom theme is used globally for all GoodData.UI customizable components in your application.
        </p>

        <hr className="separator" />

        <h2>Custom Theme for supported components</h2>
        <ExampleWithSource
            for={ThemeProviderExample}
            source={ThemeProviderExampleSrc}
            sourceJS={ThemeProviderExampleSrcJS}
        />

        <hr className="separator" />
    </div>
);
