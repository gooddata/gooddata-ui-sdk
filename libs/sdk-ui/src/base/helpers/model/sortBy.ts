// (C) 2018 GoodData Corporation
import {
    IAttributeLocatorItem,
    IAttributeSortItem,
    Identifier,
    IMeasureSortItem,
    SortDirection,
} from "@gooddata/sdk-model";

export class AttributeSortItemBuilder implements IAttributeSortItem {
    public attributeSortItem: IAttributeSortItem["attributeSortItem"];

    constructor(attributeIdentifier: string, direction: SortDirection) {
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

export class MeasureSortItemBuilder implements IMeasureSortItem {
    public measureSortItem: IMeasureSortItem["measureSortItem"];

    constructor(measureIdentifier: Identifier, direction: SortDirection) {
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
        ...attributeLocators: Array<IAttributeLocatorItem["attributeLocatorItem"]>
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

export const attributeSortItem = (attributeIdentifier: string, direction: SortDirection) =>
    new AttributeSortItemBuilder(attributeIdentifier, direction);

export const measureSortItem = (measureIdentifier: Identifier, direction: SortDirection) =>
    new MeasureSortItemBuilder(measureIdentifier, direction);
