// (C) 2007-2020 GoodData Corporation
import React from "react";

import { ExampleWithSource } from "../../../components/ExampleWithSource";

import MeasureValueFilterComponentExample from "./MeasureValueFilterComponentExample";
import MeasureValueFilterComponentExampleSRC from "!raw-loader!./MeasureValueFilterComponentExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import MeasureValueFilterComponentExampleSRCJS from "!raw-loader!../../../../examplesJS/measureValueFilter/measureValueFilterComponent/MeasureValueFilterComponentExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import MeasureValueFilterComponentPercentageExample from "./MeasureValueFilterComponentPercentageExample";
import MeasureValueFilterComponentPercentageExampleSRC from "!raw-loader!./MeasureValueFilterComponentPercentageExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import MeasureValueFilterComponentPercentageExampleSRCJS from "!raw-loader!../../../../examplesJS/measureValueFilter/measureValueFilterComponent/MeasureValueFilterComponentPercentageExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import MeasureValueFilterComponentRatioExample from "./MeasureValueFilterComponentRatioExample";
import MeasureValueFilterComponentRatioExampleSRC from "!raw-loader!./MeasureValueFilterComponentRatioExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import MeasureValueFilterComponentRatioExampleSRCJS from "!raw-loader!../../../../examplesJS/measureValueFilter/measureValueFilterComponent/MeasureValueFilterComponentRatioExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

import MeasureValueFilterDropdownComponentExample from "./MeasureValueFilterDropdownComponentExample";
import MeasureValueFilterDropdownComponentExampleSRC from "!raw-loader!./MeasureValueFilterDropdownComponentExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import MeasureValueFilterDropdownComponentExampleSRCJS from "!raw-loader!../../../../examplesJS/measureValueFilter/measureValueFilterComponent/MeasureValueFilterDropdownComponentExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

import MeasureValueFilterTreatNullAsZeroComponentExample from "./MeasureValueFilterTreatNullAsZeroComponentExample";
import MeasureValueFilterTreatNullAsZeroComponentExampleSRC from "!raw-loader!./MeasureValueFilterTreatNullAsZeroComponentExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import MeasureValueFilterTreatNullAsZeroComponentExampleSRCJS from "!raw-loader!../../../../examplesJS/measureValueFilter/measureValueFilterComponent/MeasureValueFilterTreatNullAsZeroComponentExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const MeasureValueFilterComponent = (): JSX.Element => (
    <div>
        <h1>Measure Value Filter Component</h1>
        <p>The example below shows general usage of the component for managing the measure value filter.</p>
        <div className="s-measure-value-filter-example-1">
            <ExampleWithSource
                for={MeasureValueFilterComponentExample}
                source={MeasureValueFilterComponentExampleSRC}
                sourceJS={MeasureValueFilterComponentExampleSRCJS}
            />
        </div>
        <p>
            This example shows the component for setting up a measure value filter with a measure formatted as
            a percentage.
        </p>
        <div className="s-measure-value-filter-example-2">
            <ExampleWithSource
                for={MeasureValueFilterComponentPercentageExample}
                source={MeasureValueFilterComponentPercentageExampleSRC}
                sourceJS={MeasureValueFilterComponentPercentageExampleSRCJS}
            />
        </div>
        <p>
            This example shows the component for setting up a measure value filter with a measure shown as a
            percentage.
        </p>
        <div className="s-measure-value-filter-example-3">
            <ExampleWithSource
                for={MeasureValueFilterComponentRatioExample}
                source={MeasureValueFilterComponentRatioExampleSRC}
                sourceJS={MeasureValueFilterComponentRatioExampleSRCJS}
            />
        </div>
        <hr className="separator" />
        <h2>Dropdown with custom button</h2>
        <p>Following example shows the dropdown component to be handled on your own using a custom button.</p>
        <div className="s-measure-value-filter-example-4">
            <ExampleWithSource
                for={MeasureValueFilterDropdownComponentExample}
                source={MeasureValueFilterDropdownComponentExampleSRC}
                sourceJS={MeasureValueFilterDropdownComponentExampleSRCJS}
            />
        </div>
        <p>
            This example shows the component for setting up a measure value filter with treat null value as
            zero
        </p>
        <div className="s-measure-value-filter-example-5">
            <ExampleWithSource
                for={MeasureValueFilterTreatNullAsZeroComponentExample}
                source={MeasureValueFilterTreatNullAsZeroComponentExampleSRC}
                sourceJS={MeasureValueFilterTreatNullAsZeroComponentExampleSRCJS}
            />
        </div>
    </div>
);
