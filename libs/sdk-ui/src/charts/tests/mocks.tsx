// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { prepareExecution } from "@gooddata/sdk-backend-spi";
import { emptyDef } from "@gooddata/sdk-model";

export class DummyComponent extends React.Component<any, any> {
    public render() {
        return <div />;
    }
}

export class Visualization extends DummyComponent {}
export class BaseChart extends DummyComponent {}
export class Table extends DummyComponent {}
export class LoadingComponent extends DummyComponent {}
export class ErrorComponent extends DummyComponent {}

/*
const testMeasure: IMeasure<IMeasureDefinition> = {
    measure: {
        definition: {
            measureDefinition: {
                item: {
                    identifier: "testMeasure"
                }
            }
        },
        localIdentifier: "testMeasure",
        alias: "Test Measure"
    }
};
*/

export const dummyExecution = prepareExecution(dummyBackend(), emptyDef("testWorkspace"));
