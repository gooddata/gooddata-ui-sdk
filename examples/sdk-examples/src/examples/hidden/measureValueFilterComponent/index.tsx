// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved */
import React from "react";

import { ExampleWithSource } from "../../../components/ExampleWithSource";

import { MeasureValueFilterDropdownExample } from "./MeasureValueFilterDropdownExample";
import MeasureValueFilterDropdownExampleSRC from "!raw-loader!./MeasureValueFilterDropdownExample";

import { MeasureValueFilterDropdownCustomButtonExample } from "./MeasureValueFilterDropdownCustomButtonExample";
import MeasureValueFilterDropdownCustomButtonExampleSRC from "!raw-loader!./MeasureValueFilterDropdownCustomButtonExample";

export const MeasureValueFilterComponent: React.FC = () => (
    <div>
        <h1>Measure Value Filter Component</h1>
        <p>Set of components for easy measure value filter management.</p>
        <hr className="separator" />
        <h2>Dropdown</h2>
        <p>Example of dropdown component for measure value filter setup.</p>
        <div className="s-measure-value-filter-example-1">
            <ExampleWithSource
                for={MeasureValueFilterDropdownExample}
                source={MeasureValueFilterDropdownExampleSRC}
            />
        </div>
        <h2>Custom dropdown button</h2>
        <p>
            Default measure value filter dropdown button can be customized using <code>button</code> property
            of <code>MeasureValueFilterDropdown</code> component.
        </p>
        <div className="s-measure-value-filter-example-2">
            <ExampleWithSource
                for={MeasureValueFilterDropdownCustomButtonExample}
                source={MeasureValueFilterDropdownCustomButtonExampleSRC}
            />
        </div>
    </div>
);
