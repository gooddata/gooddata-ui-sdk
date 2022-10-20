// (C) 2007-2022 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../../components/ExampleWithSource";

import AttributeFilterWithCustomizations from "./AttributeFilterWithCustomizations";
import AttributeFilterWithCustomizationsSRC from "./AttributeFilterWithCustomizations?raw";
import AttributeFilterWithCustomizationsSRCJS from "./AttributeFilterWithCustomizations?rawJS";

import UseAttributeFilterController from "./UseAttributeFilterController";
import UseAttributeFilterControllerSRC from "./UseAttributeFilterController?raw";
import UseAttributeFilterControllerSRCJS from "./UseAttributeFilterController?rawJS";

import UseAttributeFilterHandler from "./UseAttributeFilterHandler";
import UseAttributeFilterHandlerSRC from "./UseAttributeFilterHandler?raw";
import UseAttributeFilterHandlerSRCJS from "./UseAttributeFilterHandler?rawJS";

import AttributeFilterHandler from "./AttributeFilterHandler";
import AttributeFilterHandlerSRC from "./AttributeFilterHandler?raw";
import AttributeFilterHandlerSRCJS from "./AttributeFilterHandler?rawJS";

const CustomAttributeFilterComponents = (): JSX.Element => (
    <div>
        <h1>Custom Attribute Filters</h1>

        <p>
            The following examples show how to customize the default attribute filter components, or implement
            your own attribute filter.
        </p>

        <hr className="separator" />

        <h2 id="customize-default-components">Customize Default Components</h2>

        <p>This example shows how to customize various parts of the default attribute filter component.</p>
        <p>Note that these customizations are still in a beta stage.</p>

        <ExampleWithSource
            for={AttributeFilterWithCustomizations}
            source={AttributeFilterWithCustomizationsSRC}
            sourceJS={AttributeFilterWithCustomizationsSRCJS}
        />

        <hr className="separator" />

        <h2 id="use-attribute-filter-controller">useAttributeFilterController</h2>
        <p>
            The easiest way to implement your own attribute filter is the useAttributeFilterController hook.
        </p>
        <p>
            Advantage of this hook is that it has the same input props as the original attribute filter
            components, and it works with all the GoodData things out of the box - e.g. BackendProvider,
            WorkspaceProvider and placeholders.
        </p>
        <ExampleWithSource
            for={UseAttributeFilterController}
            source={UseAttributeFilterControllerSRC}
            sourceJS={UseAttributeFilterControllerSRCJS}
        />

        <hr className="separator" />

        <h2 id="use-attribute-filter-handler">useAttributeFilterHandler</h2>
        <p>
            If the useAttributeFilterController hook API is not sufficient for you, and you are looking for
            more control and access to lower level APIs, then you can build on top of it. It gives you full
            access to the AttributeFilterHandler API.
        </p>
        <ExampleWithSource
            for={UseAttributeFilterHandler}
            source={UseAttributeFilterHandlerSRC}
            sourceJS={UseAttributeFilterHandlerSRCJS}
        />

        <hr className="separator" />

        <h2 id="attribute-filter-handler">AttributeFilterHandler</h2>
        <p>
            AttributeFilterHandler comes with a framework agnostic API, so you can integrate it with any
            framework, JavaScript application, or even use it in a headless environment.
        </p>
        <p>It has fully documented interfaces, so feel free to explore it and use it.</p>
        <ExampleWithSource
            for={AttributeFilterHandler}
            source={AttributeFilterHandlerSRC}
            sourceJS={AttributeFilterHandlerSRCJS}
        />
    </div>
);

export default CustomAttributeFilterComponents;
