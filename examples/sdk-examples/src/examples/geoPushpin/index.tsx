// (C) 2020 GoodData Corporation
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";
import GeoPushpinChartClusteringExample from "./GeoPushpinChartClusteringExample";
import GeoPushpinChartWithColorLegendExample from "./GeoPushpinChartWithColorLegendExample";
import GeoPushpinChartWithCategoryLegendExample from "./GeoPushpinChartWithCategoryLegendExample";
import GeoPushpinChartConfigurationExample from "./GeoPushpinChartConfigurationExample";
import GeoPushpinChartConfigurationViewportExample from "./GeoPushpinChartConfigurationViewportExample";
import GeoPushpinChartConfigurationColorMappingExample from "./GeoPushpinChartConfigurationColorMappingExample";
import GeoPushpinChartConfigurationPointsGroupNearbyExample from "./GeoPushpinChartConfigurationPointsGroupNearbyExample";
import GeoPushpinChartConfigurationPointsSizeExample from "./GeoPushpinChartConfigurationPointsSizeExample";

import GeoPushpinChartClusteringExampleSRC from "./GeoPushpinChartClusteringExample?raw"; // eslint-disable-line import/no-unresolved
import GeoPushpinChartWithColorLegendExampleSRC from "./GeoPushpinChartWithColorLegendExample?raw"; // eslint-disable-line import/no-unresolved
import GeoPushpinChartWithCategoryLegendExampleSRC from "./GeoPushpinChartWithCategoryLegendExample?raw"; // eslint-disable-line import/no-unresolved
import GeoPushpinChartConfigurationExampleSRC from "./GeoPushpinChartConfigurationExample?raw"; // eslint-disable-line import/no-unresolved
import GeoPushpinChartConfigurationViewportExampleSRC from "./GeoPushpinChartConfigurationViewportExample?raw"; // eslint-disable-line import/no-unresolved

import GeoPushpinChartConfigurationColorMappingExampleSRC from "./GeoPushpinChartConfigurationColorMappingExample?raw"; // eslint-disable-line import/no-unresolved
import GeoPushpinChartConfigurationPointsGroupNearbyExampleSRC from "./GeoPushpinChartConfigurationPointsGroupNearbyExample?raw"; // eslint-disable-line import/no-unresolved
import GeoPushpinChartConfigurationPointsSizeExampleSRC from "./GeoPushpinChartConfigurationPointsSizeExample?raw"; // eslint-disable-line import/no-unresolved
import GeoPushpinChartConfigurationLegendExampleSRC from "./GeoPushpinChartConfigurationLegendExample?raw"; // eslint-disable-line import/no-unresolved

import GeoPushpinChartClusteringExampleSRCJS from "./GeoPushpinChartClusteringExample?rawJS"; // eslint-disable-line import/no-unresolved
import GeoPushpinChartWithColorLegendExampleSRCJS from "./GeoPushpinChartWithColorLegendExample?rawJS"; // eslint-disable-line import/no-unresolved
import GeoPushpinChartWithCategoryLegendExampleSRCJS from "./GeoPushpinChartWithCategoryLegendExample?rawJS"; // eslint-disable-line import/no-unresolved
import GeoPushpinChartConfigurationExampleSRCJS from "./GeoPushpinChartConfigurationExample?rawJS"; // eslint-disable-line import/no-unresolved
import GeoPushpinChartConfigurationViewportExampleSRCJS from "./GeoPushpinChartConfigurationViewportExample?rawJS"; // eslint-disable-line import/no-unresolved
import GeoPushpinChartConfigurationLegendExample from "./GeoPushpinChartConfigurationLegendExample"; // eslint-disable-line import/no-unresolved

import GeoPushpinChartConfigurationColorMappingExampleSRCJS from "./GeoPushpinChartConfigurationColorMappingExample?rawJS"; // eslint-disable-line import/no-unresolved
import GeoPushpinChartConfigurationPointsGroupNearbyExampleSRCJS from "./GeoPushpinChartConfigurationPointsGroupNearbyExample?rawJS"; // eslint-disable-line import/no-unresolved
import GeoPushpinChartConfigurationPointsSizeExampleSRCJS from "./GeoPushpinChartConfigurationPointsSizeExample?rawJS"; // eslint-disable-line import/no-unresolved
import GeoPushpinChartConfigurationLegendExampleSRCJS from "./GeoPushpinChartConfigurationLegendExample?rawJS"; // eslint-disable-line import/no-unresolved

export const GeoPushpin = (): JSX.Element => (
    <div>
        <h1>Geo Pushpin Chart</h1>

        <hr className="separator" />

        <h2 id="geo-pushpin-chart-clustering">Example of Geo Pushpin Chart with Clustering</h2>
        <ExampleWithSource
            for={() => <GeoPushpinChartClusteringExample />}
            source={GeoPushpinChartClusteringExampleSRC}
            sourceJS={GeoPushpinChartClusteringExampleSRCJS}
        />

        <hr className="separator" />

        <h2 id="geo-pushpin-chart-size-color">Example of Geo Pushpin Chart with Size and Color Legend</h2>
        <ExampleWithSource
            for={() => <GeoPushpinChartWithColorLegendExample />}
            source={GeoPushpinChartWithColorLegendExampleSRC}
            sourceJS={GeoPushpinChartWithColorLegendExampleSRCJS}
        />

        <hr className="separator" />

        <h2 id="geo-pushpin-chart-category">Example of Geo Pushpin Chart with Size and Category Legend</h2>
        <ExampleWithSource
            for={() => <GeoPushpinChartWithCategoryLegendExample />}
            source={GeoPushpinChartWithCategoryLegendExampleSRC}
            sourceJS={GeoPushpinChartWithCategoryLegendExampleSRCJS}
        />

        <hr className="separator" />

        <h2 id="geo-pushpin-chart-configuration">Example of Geo Pushpin Chart with Geo Configuration</h2>
        <ExampleWithSource
            for={() => <GeoPushpinChartConfigurationExample />}
            source={GeoPushpinChartConfigurationExampleSRC}
            sourceJS={GeoPushpinChartConfigurationExampleSRCJS}
        />

        <hr className="separator" />

        <h2 id="geo-pushpin-chart-configuration-legend">
            Example of Geo Pushpin Chart with Configuration - Legend
        </h2>
        <ExampleWithSource
            for={() => <GeoPushpinChartConfigurationLegendExample />}
            source={GeoPushpinChartConfigurationLegendExampleSRC}
            sourceJS={GeoPushpinChartConfigurationLegendExampleSRCJS}
        />

        <h2 id="geo-pushpin-chart-configuration-viewport">
            Example of Geo Pushpin Chart with Configuration - Viewport
        </h2>
        <ExampleWithSource
            for={() => <GeoPushpinChartConfigurationViewportExample />}
            source={GeoPushpinChartConfigurationViewportExampleSRC}
            sourceJS={GeoPushpinChartConfigurationViewportExampleSRCJS}
        />

        <h2 id="geo-pushpin-chart-configuration-color-mapping">
            Example of Geo Pushpin Chart with Configuration - Custom Palette and Color Mapping
        </h2>
        <ExampleWithSource
            for={() => <GeoPushpinChartConfigurationColorMappingExample />}
            source={GeoPushpinChartConfigurationColorMappingExampleSRC}
            sourceJS={GeoPushpinChartConfigurationColorMappingExampleSRCJS}
        />

        <h2 id="geo-pushpin-chart-configuration-points-group-nearby">
            Example of Geo Pushpin Chart with Configuration - Group nearby points
        </h2>
        <ExampleWithSource
            for={() => <GeoPushpinChartConfigurationPointsGroupNearbyExample />}
            source={GeoPushpinChartConfigurationPointsGroupNearbyExampleSRC}
            sourceJS={GeoPushpinChartConfigurationPointsGroupNearbyExampleSRCJS}
        />

        <h2 id="geo-pushpin-chart-configuration-points-size">
            Example of Geo Pushpin Chart with Configuration - Points size
        </h2>
        <ExampleWithSource
            for={() => <GeoPushpinChartConfigurationPointsSizeExample />}
            source={GeoPushpinChartConfigurationPointsSizeExampleSRC}
            sourceJS={GeoPushpinChartConfigurationPointsSizeExampleSRCJS}
        />
    </div>
);

export default GeoPushpin;
