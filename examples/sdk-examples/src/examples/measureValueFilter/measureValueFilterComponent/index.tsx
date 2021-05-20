// (C) 2007-2020 GoodData Corporation
import React from "react";

import { ExampleWithSource } from "../../../components/ExampleWithSource";

import MeasureValueFilterComponentExample from "./MeasureValueFilterComponentExample";
import MeasureValueFilterComponentExampleSRC from "./MeasureValueFilterComponentExample?raw"; // eslint-disable-line import/no-unresolved
import MeasureValueFilterComponentExampleSRCJS from "./MeasureValueFilterComponentExample?rawJS"; // eslint-disable-line import/no-unresolved
import MeasureValueFilterComponentPercentageExample from "./MeasureValueFilterComponentPercentageExample";
import MeasureValueFilterComponentPercentageExampleSRC from "./MeasureValueFilterComponentPercentageExample?raw"; // eslint-disable-line import/no-unresolved
import MeasureValueFilterComponentPercentageExampleSRCJS from "./MeasureValueFilterComponentPercentageExample?rawJS"; // eslint-disable-line import/no-unresolved
import MeasureValueFilterComponentRatioExample from "./MeasureValueFilterComponentRatioExample";
import MeasureValueFilterComponentRatioExampleSRC from "./MeasureValueFilterComponentRatioExample?raw"; // eslint-disable-line import/no-unresolved
import MeasureValueFilterComponentRatioExampleSRCJS from "./MeasureValueFilterComponentRatioExample?rawJS"; // eslint-disable-line import/no-unresolved

import MeasureValueFilterDropdownComponentExample from "./MeasureValueFilterDropdownComponentExample";
import MeasureValueFilterDropdownComponentExampleSRC from "./MeasureValueFilterDropdownComponentExample?raw"; // eslint-disable-line import/no-unresolved
import MeasureValueFilterDropdownComponentExampleSRCJS from "./MeasureValueFilterDropdownComponentExample?rawJS"; // eslint-disable-line import/no-unresolved

import MeasureValueFilterTreatNullAsZeroComponentExample from "./MeasureValueFilterTreatNullAsZeroComponentExample";
import MeasureValueFilterTreatNullAsZeroComponentExampleSRC from "./MeasureValueFilterTreatNullAsZeroComponentExample?raw"; // eslint-disable-line import/no-unresolved
import MeasureValueFilterTreatNullAsZeroComponentExampleSRCJS from "./MeasureValueFilterTreatNullAsZeroComponentExample?rawJS"; // eslint-disable-line import/no-unresolved

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
