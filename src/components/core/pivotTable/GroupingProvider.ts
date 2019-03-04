// (C) 2007-2018 GoodData Corporation
import max = require('lodash/max');
import { IGridRow } from '../../../interfaces/AGGrid';
import { isMappingHeaderAttributeItem } from '../../../interfaces/MappingHeader';

interface IAttributesRowItemUris {
    [attributeId: string]: string[];
}

interface IAttributesRowItemRepetitions {
    [attributeId: string]: boolean[];
}

export interface IGroupingProvider {
    reset: () => void;
    isRepeated: (attributeId: string, rowIndex: number) => boolean;
    isGroupBoundary: (rowIndex: number) => boolean;
    processPage: (pageRows: IGridRow[], rowOffset: number, rowAttributeIDs: string[]) => void;
}

class DefaultGroupingProvider implements IGroupingProvider {
    // tslint:disable-next-line:no-empty
    public reset() {
    }

    public isGroupBoundary(_rowIndex: number) {
        return false;
    }

    // tslint:disable-next-line:no-empty
    public processPage(_pageRows: IGridRow[], _rowOffset: number, _rowAttributeIDs: string[]) {
    }

    public isRepeated(_attributeId: string, _rowIndex: number) {
        return false;
    }
}

class AttributeGroupingProvider implements IGroupingProvider {
    private itemUris: IAttributesRowItemUris;
    private itemRepetitions: IAttributesRowItemRepetitions;
    private repetitionsCounts: number[];
    private maxRepetitions: number;

    constructor() {
        this.reset();
    }

    public reset() {
        this.itemUris = {};
        this.itemRepetitions = {};
        this.repetitionsCounts = [];
        this.maxRepetitions = 0;
    }

    public isRepeated(attributeId: string, rowIndex: number) {
        if (this.itemRepetitions[attributeId]) {
            return this.itemRepetitions[attributeId][rowIndex] === true;
        }
        return false;
    }

    public isGroupBoundary(rowIndex: number) {
        return !!this.repetitionsCounts &&
            (this.repetitionsCounts[rowIndex] === undefined || this.repetitionsCounts[rowIndex] < this.maxRepetitions);
    }

    public processPage(pageRows: IGridRow[], rowOffset: number, rowAttributeIDs: string[]) {
        let previousAttributeId: string = null;
        rowAttributeIDs.forEach((attributeId) => {
            if (!this.itemUris[attributeId]) {
                this.itemUris[attributeId] = [];
            }

            pageRows.forEach((row: IGridRow, rowIndex: number) => {
                const headerItem = row.headerItemMap[attributeId];
                if (isMappingHeaderAttributeItem(headerItem)) {
                    const attributeItemUri = headerItem.attributeHeaderItem.uri;
                    this.itemUris[attributeId][rowIndex + rowOffset] = attributeItemUri;
                }
            });

            previousAttributeId = attributeId;
        });

        this.update();
    }

    private update() {
        this.repetitionsCounts = null;
        this.maxRepetitions = 0;
        let previousAttributeId: string = null;

        Object.keys(this.itemUris).forEach((attributeId) => {
            const rowCount = this.itemUris[attributeId].length;
            this.itemRepetitions[attributeId] = Array(rowCount).fill(false);
            if (this.repetitionsCounts === null) {
                this.repetitionsCounts = Array(rowCount).fill(0);
            }

            this.updateAttributeColumn(
                this.itemUris[attributeId],
                this.itemRepetitions[attributeId],
                previousAttributeId !== null ? this.itemRepetitions[previousAttributeId] : null
            );

            previousAttributeId = attributeId;
        });

        this.maxRepetitions = max(this.repetitionsCounts);
    }

    private updateAttributeColumn(
        itemUris: string[],
        itemRepetitions: boolean[],
        previousAttributeItemRepetitions: boolean[]
    ) {
        let previousItemUri: string = null;
        itemUris.forEach((itemUri, rowIndex) => {
            let repeatedItem = previousItemUri === itemUri;
            if (previousAttributeItemRepetitions !== null) {
                repeatedItem = repeatedItem && previousAttributeItemRepetitions[rowIndex];
            }

            if (repeatedItem) {
                itemRepetitions[rowIndex] = true;
                this.repetitionsCounts[rowIndex] += 1;
            }

            previousItemUri = itemUri;
        });
    }
}

export class GroupingProviderFactory {
    public static createProvider(groupRows: boolean): IGroupingProvider {
        if (groupRows) {
            return new AttributeGroupingProvider();
        }

        return new DefaultGroupingProvider();
    }
}
