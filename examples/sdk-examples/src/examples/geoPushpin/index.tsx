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

import GeoPushpinChartClusteringExampleSRC from "!raw-loader!./GeoPushpinChartClusteringExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import GeoPushpinChartWithColorLegendExampleSRC from "!raw-loader!./GeoPushpinChartWithColorLegendExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import GeoPushpinChartWithCategoryLegendExampleSRC from "!raw-loader!./GeoPushpinChartWithCategoryLegendExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import GeoPushpinChartConfigurationExampleSRC from "!raw-loader!./GeoPushpinChartConfigurationExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import GeoPushpinChartConfigurationViewportExampleSRC from "!raw-loader!./GeoPushpinChartConfigurationViewportExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

import GeoPushpinChartConfigurationColorMappingExampleSRC from "!raw-loader!./GeoPushpinChartConfigurationColorMappingExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import GeoPushpinChartConfigurationPointsGroupNearbyExampleSRC from "!raw-loader!./GeoPushpinChartConfigurationPointsGroupNearbyExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import GeoPushpinChartConfigurationPointsSizeExampleSRC from "!raw-loader!./GeoPushpinChartConfigurationPointsSizeExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import GeoPushpinChartConfigurationLegendExampleSRC from "!raw-loader!./GeoPushpinChartConfigurationLegendExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

import GeoPushpinChartClusteringExampleSRCJS from "!raw-loader!../../../examplesJS/geoPushpin/GeoPushpinChartClusteringExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import GeoPushpinChartWithColorLegendExampleSRCJS from "!raw-loader!../../../examplesJS/geoPushpin/GeoPushpinChartWithColorLegendExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import GeoPushpinChartWithCategoryLegendExampleSRCJS from "!raw-loader!../../../examplesJS/geoPushpin/GeoPushpinChartWithCategoryLegendExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import GeoPushpinChartConfigurationExampleSRCJS from "!raw-loader!../../../examplesJS/geoPushpin/GeoPushpinChartConfigurationExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import GeoPushpinChartConfigurationViewportExampleSRCJS from "!raw-loader!../../../examplesJS/geoPushpin/GeoPushpinChartConfigurationViewportExample";
import GeoPushpinChartConfigurationLegendExample from "./GeoPushpinChartConfigurationLegendExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

import GeoPushpinChartConfigurationColorMappingExampleSRCJS from "!raw-loader!../../../examplesJS/geoPushpin/GeoPushpinChartConfigurationColorMappingExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import GeoPushpinChartConfigurationPointsGroupNearbyExampleSRCJS from "!raw-loader!../../../examplesJS/geoPushpin/GeoPushpinChartConfigurationPointsGroupNearbyExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import GeoPushpinChartConfigurationPointsSizeExampleSRCJS from "!raw-loader!../../../examplesJS/geoPushpin/GeoPushpinChartConfigurationPointsSizeExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import GeoPushpinChartConfigurationLegendExampleSRCJS from "!raw-loader!../../../examplesJS/geoPushpin/GeoPushpinChartConfigurationLegendExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

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
