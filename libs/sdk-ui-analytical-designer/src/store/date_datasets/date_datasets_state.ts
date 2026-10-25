// (C) 2026 GoodData Corporation

import { type IDateDataset, type IDateDatasets } from "../../typings/datasets.js";

export interface IDateDatasetsState extends IDateDatasets {
    available: IDateDataset[];
    allItems?: IDateDataset[];
    unavailable: number;
    loaded: boolean;
    updating?: boolean;
    dropdownLoaded: boolean;
}

export const dateDatasetsInitialState: IDateDatasetsState = {
    available: [],
    unavailable: 0,
    loaded: false,
    dropdownLoaded: false,
};
