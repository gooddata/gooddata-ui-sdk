// (C) 2019 GoodData Corporation

/**
 * TODO: SDK8 add docs
 *
 * @public
 */
export interface IDateDataSetAttribute {
    granularity: string;
    attributeId: string;
    defaultDisplayFormId: string;
    defaultDisplayFormTitle: string;
}

/**
 * TODO: SDK8 add docs
 *
 * @public
 */
export interface IDateDataSet {
    relevance: number;
    availableDateAttributes?: IDateDataSetAttribute[];
}
