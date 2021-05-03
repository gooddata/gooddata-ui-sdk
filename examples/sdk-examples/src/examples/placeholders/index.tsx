// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import PlaceholdersExample from "./PlaceholdersExample";

import PlaceholdersExampleExampleSRC from "!raw-loader!./PlaceholdersExample";

import PlaceholdersExampleExampleSRCJS from "!raw-loader!../../../examplesJS/placeholders/PlaceholdersExample";

export const Placeholders = (): JSX.Element => (
    <div>
        <h1>Placeholders</h1>

        <p>Placeholders represent particular pieces of execution that may change at runtime.</p>

        <hr className="separator" />

        <ExampleWithSource
            for={PlaceholdersExample}
            source={PlaceholdersExampleExampleSRC}
            sourceJS={PlaceholdersExampleExampleSRCJS}
        />
    </div>
);
