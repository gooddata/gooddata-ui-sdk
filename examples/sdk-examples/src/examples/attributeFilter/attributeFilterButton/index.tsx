// (C) 2007-2022 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../../components/ExampleWithSource";

import AttributeFilterButtonBasicUsage from "./AttributeFilterButtonBasicUsage";
import AttributeFilterButtonBasicUsageSRC from "./AttributeFilterButtonBasicUsage?raw";
import AttributeFilterButtonBasicUsageSRCJS from "./AttributeFilterButtonBasicUsage?rawJS";

import AttributeFilterButtonConnectedToVisualization from "./AttributeFilterButtonConnectedToVisualization";
import AttributeFilterButtonConnectedToVisualizationSRC from "./AttributeFilterButtonConnectedToVisualization?raw";
import AttributeFilterButtonConnectedToVisualizationSRCJS from "./AttributeFilterButtonConnectedToVisualization?rawJS";

import AttributeFilterButtonParentChildFiltering from "./AttributeFilterButtonParentChildFiltering";
import AttributeFilterButtonParentChildFilteringSRC from "./AttributeFilterButtonParentChildFiltering?raw";
import AttributeFilterButtonParentChildFilteringSRCJS from "./AttributeFilterButtonParentChildFiltering?rawJS";

import AttributeFilterButtonParentChildFilteringWithPlaceholders from "./AttributeFilterButtonParentChildFilteringWithPlaceholders";
import AttributeFilterButtonParentChildFilteringWithPlaceholdersSRC from "./AttributeFilterButtonParentChildFilteringWithPlaceholders?raw";
import AttributeFilterButtonParentChildFilteringWithPlaceholdersSRCJS from "./AttributeFilterButtonParentChildFilteringWithPlaceholders?rawJS";

import AttributeFilterButtonWithStaticElements from "./AttributeFilterButtonWithStaticElements";
import AttributeFilterButtonWithStaticElementsSRC from "./AttributeFilterButtonWithStaticElements?raw";
import AttributeFilterButtonWithStaticElementsSRCJS from "./AttributeFilterButtonWithStaticElements?rawJS";

import AttributeFilterButtonWithHiddenElements from "./AttributeFilterButtonWithHiddenElements";
import AttributeFilterButtonWithHiddenElementsSRC from "./AttributeFilterButtonWithHiddenElements?raw";
import AttributeFilterButtonWithHiddenElementsSRCJS from "./AttributeFilterButtonWithHiddenElements?rawJS";

const AttributeFilterButtonComponent = (): JSX.Element => (
    <div>
        <h1>AttributeFilterButton</h1>

        <p>
            Attribute filter button is a component, that can consume and change the attribute filter
            definition, so you can filter your visualizations dynamically.
        </p>

        <hr className="separator" />

        <h2 id="basic-usage">Basic Usage</h2>

        <p>This example shows various ways how you can specify the attribute filter.</p>
        <p>
            Note that using the attribute display form identifier, or the attribute exported by the
            catalog-export tool should be always the preferred way.
        </p>

        <ExampleWithSource
            for={AttributeFilterButtonBasicUsage}
            source={AttributeFilterButtonBasicUsageSRC}
            sourceJS={AttributeFilterButtonBasicUsageSRCJS}
        />

        <hr className="separator" />

        <h2 id="connect-a-visualization">Connect a Visualization</h2>

        <p>
            This example shows how to connect attribute filter button component into a visualization, so you
            can filter it dynamically.
        </p>

        <ExampleWithSource
            for={AttributeFilterButtonConnectedToVisualization}
            source={AttributeFilterButtonConnectedToVisualizationSRC}
            sourceJS={AttributeFilterButtonConnectedToVisualizationSRCJS}
        />

        <hr className="separator" />

        <h2 id="parent-child-filtering">Parent-Child Filtering</h2>

        <p>
            This example shows how to limit attribute elements of the attribute filter button by the selected
            elements of the parent filter.
        </p>

        <p>
            Note that current limitation is that you must specify the parent filter attribute elements using
            their URIs and it is currently supported only by GoodData Platform, not GoodData Cloud or
            GoodData.CN.
            <br />
        </p>

        <ExampleWithSource
            for={AttributeFilterButtonParentChildFiltering}
            source={AttributeFilterButtonParentChildFilteringSRC}
            sourceJS={AttributeFilterButtonParentChildFilteringSRCJS}
        />

        <hr className="separator" />

        <h2 id="parent-child-filtering-with-placeholders">Parent-Child Filtering with Placeholders</h2>

        <p>
            This example shows how to limit attribute elements of the attribute filter button by the selected
            elements of the parent filter using placeholders.
        </p>

        <p>
            Note that current limitation is that you must specify the parent filter attribute elements using
            their URIs and it is currently supported only by GoodData Platform, not GoodData Cloud or
            GoodData.CN.
            <br />
        </p>

        <ExampleWithSource
            for={AttributeFilterButtonParentChildFilteringWithPlaceholders}
            source={AttributeFilterButtonParentChildFilteringWithPlaceholdersSRC}
            sourceJS={AttributeFilterButtonParentChildFilteringWithPlaceholdersSRCJS}
        />

        <hr className="separator" />

        <h2 id="static-elements">Static Elements</h2>

        <p>
            This example shows how to provide static elements to the attribute filter button. These elements
            will replace the elements that would be loaded from the server.
        </p>
        <p>
            Note that if using this, parent filtering will not work: it is your responsibility to filter the
            static elements yourself. You can use this as your advantage, for example if you want to introduce
            your own elements filtering logic.
        </p>

        <ExampleWithSource
            for={AttributeFilterButtonWithStaticElements}
            source={AttributeFilterButtonWithStaticElementsSRC}
            sourceJS={AttributeFilterButtonWithStaticElementsSRCJS}
        />

        <hr className="separator" />

        <h2 id="hidden-elements">Hidden Elements</h2>

        <p>
            This example shows how to hide particular elements in the attribute filter button. The attribute
            filter button will behave as if those elements were not part of the underlying display form.
        </p>
        <p>
            If you want to use the resulting filter, and it{"'"}s negative, you should merge its elements with
            the specified hidden elements before you pass it to the visualization.
        </p>
        <p>
            Note that current limitation is that you must specify the hidden attribute elements using their
            URIs, and it is currently supported only by GoodData Platform, not GoodData Cloud or GoodData.CN.
        </p>

        <ExampleWithSource
            for={AttributeFilterButtonWithHiddenElements}
            source={AttributeFilterButtonWithHiddenElementsSRC}
            sourceJS={AttributeFilterButtonWithHiddenElementsSRCJS}
        />
    </div>
);

export default AttributeFilterButtonComponent;
