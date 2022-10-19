// (C) 2007-2022 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../../components/ExampleWithSource";

import AttributeFilterBasicUsage from "./AttributeFilterBasicUsage";
import AttributeFilterBasicUsageSRC from "./AttributeFilterBasicUsage?raw";
import AttributeFilterBasicUsageSRCJS from "./AttributeFilterBasicUsage?rawJS";

import AttributeFilterConnectedToVisualization from "./AttributeFilterConnectedToVisualization";
import AttributeFilterConnectedToVisualizationSRC from "./AttributeFilterConnectedToVisualization?raw";
import AttributeFilterConnectedToVisualizationSRCJS from "./AttributeFilterConnectedToVisualization?rawJS";

import AttributeFilterParentChildFiltering from "./AttributeFilterParentChildFiltering";
import AttributeFilterParentChildFilteringSRC from "./AttributeFilterParentChildFiltering?raw";
import AttributeFilterParentChildFilteringSRCJS from "./AttributeFilterParentChildFiltering?rawJS";

import AttributeFilterParentChildFilteringWithPlaceholders from "./AttributeFilterParentChildFilteringWithPlaceholders";
import AttributeFilterParentChildFilteringWithPlaceholdersSRC from "./AttributeFilterParentChildFilteringWithPlaceholders?raw";
import AttributeFilterParentChildFilteringWithPlaceholdersSRCJS from "./AttributeFilterParentChildFilteringWithPlaceholders?rawJS";

import AttributeFilterWithStaticElements from "./AttributeFilterWithStaticElements";
import AttributeFilterWithStaticElementsSRC from "./AttributeFilterWithStaticElements?raw";
import AttributeFilterWithStaticElementsSRCJS from "./AttributeFilterWithStaticElements?rawJS";

import AttributeFilterWithHiddenElements from "./AttributeFilterWithHiddenElements";
import AttributeFilterWithHiddenElementsSRC from "./AttributeFilterWithHiddenElements?raw";
import AttributeFilterWithHiddenElementsSRCJS from "./AttributeFilterWithHiddenElements?rawJS";

const AttributeFilterComponent = (): JSX.Element => (
    <div>
        <h1>AttributeFilter</h1>

        <p>
            Attribute filter is a component, that can consume and change the attribute filter definition, so
            you can filter your visualizations dynamically.
        </p>

        <hr className="separator" />
        <h2 id="basic-usage">Basic Usage</h2>

        <p>This example shows various ways how you can specify the attribute filter.</p>
        <p>
            Note that using the attribute display form identifier, or the attribute exported by the
            catalog-export tool should be always the preferred way.
        </p>

        <ExampleWithSource
            for={AttributeFilterBasicUsage}
            source={AttributeFilterBasicUsageSRC}
            sourceJS={AttributeFilterBasicUsageSRCJS}
        />

        <hr className="separator" />

        <h2 id="connect-a-visualization">Connect a Visualization</h2>

        <p>
            This example shows how to connect attribute filter component into a visualization, so you can
            filter it dynamically.
        </p>

        <ExampleWithSource
            for={AttributeFilterConnectedToVisualization}
            source={AttributeFilterConnectedToVisualizationSRC}
            sourceJS={AttributeFilterConnectedToVisualizationSRCJS}
        />

        <hr className="separator" />

        <h2 id="parent-child-filtering">Parent-Child Filtering</h2>

        <p>
            This example shows how to limit attribute elements of the attribute filter by the selected
            elements of the parent filter.
        </p>

        <p>
            Note that current limitation is that you must specify the parent filter attribute elements using
            their URIs and it is currently supported only by GoodData Platform, not GoodData Cloud or
            GoodData.CN.
            <br />
        </p>

        <ExampleWithSource
            for={AttributeFilterParentChildFiltering}
            source={AttributeFilterParentChildFilteringSRC}
            sourceJS={AttributeFilterParentChildFilteringSRCJS}
        />

        <hr className="separator" />

        <h2 id="parent-child-filtering-with-placeholders">Parent-Child Filtering with Placeholders</h2>

        <p>
            This example shows how to limit attribute elements of the attribute filter by the selected
            elements of the parent filter using placeholders.
        </p>

        <p>
            Note that current limitation is that you must specify the parent filter attribute elements using
            their URIs and it is currently supported only by GoodData Platform, not GoodData Cloud or
            GoodData.CN.
            <br />
        </p>

        <ExampleWithSource
            for={AttributeFilterParentChildFilteringWithPlaceholders}
            source={AttributeFilterParentChildFilteringWithPlaceholdersSRC}
            sourceJS={AttributeFilterParentChildFilteringWithPlaceholdersSRCJS}
        />

        <hr className="separator" />

        <h2 id="static-elements">Static Elements</h2>

        <p>
            This example shows how to provide static elements to the attribute filter. These elements will
            replace the elements that would be loaded from the server.
        </p>
        <p>
            Note that if using this, parent filtering will not work: it is your responsibility to filter the
            static elements yourself. You can use this as your advantage, for example if you want to introduce
            your own elements filtering logic.
        </p>

        <ExampleWithSource
            for={AttributeFilterWithStaticElements}
            source={AttributeFilterWithStaticElementsSRC}
            sourceJS={AttributeFilterWithStaticElementsSRCJS}
        />

        <hr className="separator" />

        <h2 id="hidden-elements">Hidden Elements</h2>

        <p>
            This example shows how to hide particular elements in the attribute filter. The attribute filter
            will behave as if those elements were not part of the underlying display form.
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
            for={AttributeFilterWithHiddenElements}
            source={AttributeFilterWithHiddenElementsSRC}
            sourceJS={AttributeFilterWithHiddenElementsSRCJS}
        />
    </div>
);

export default AttributeFilterComponent;
