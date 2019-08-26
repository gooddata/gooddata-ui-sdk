// (C) 2018 GoodData Corporation
import { AFM } from "@gooddata/typings";

export class AttributeSortItemBuilder implements AFM.IAttributeSortItem {
    public attributeSortItem: AFM.IAttributeSortItem["attributeSortItem"];

    constructor(attributeIdentifier: string, direction: AFM.SortDirection) {
        this.attributeSortItem = {
            attributeIdentifier,
            direction,
        };
    }

    public aggregation = (aggregation: "sum") => {
        this.attributeSortItem.aggregation = aggregation;
        return this;
    };
}

export class MeasureSortItemBuilder implements AFM.IMeasureSortItem {
    public measureSortItem: AFM.IMeasureSortItem["measureSortItem"];

    constructor(measureIdentifier: AFM.Identifier, direction: AFM.SortDirection) {
        this.measureSortItem = {
            direction,
            locators: [
                {
                    measureLocatorItem: {
                        measureIdentifier,
                    },
                },
            ],
        };
    }

    public attributeLocators = (
        ...attributeLocators: Array<AFM.IAttributeLocatorItem["attributeLocatorItem"]>
    ) => {
        this.measureSortItem.locators.splice(
            -2,
            0,
            ...attributeLocators.map(attributeLocatorItem => ({
                attributeLocatorItem,
            })),
        );
        return this;
    };
}

export const attributeSortItem = (attributeIdentifier: string, direction: AFM.SortDirection) =>
    new AttributeSortItemBuilder(attributeIdentifier, direction);

export const measureSortItem = (measureIdentifier: AFM.Identifier, direction: AFM.SortDirection) =>
    new MeasureSortItemBuilder(measureIdentifier, direction);
