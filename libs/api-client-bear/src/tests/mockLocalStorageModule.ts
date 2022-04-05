// (C) 2022 GoodData Corporation
import noop from "lodash/noop";
import { ILocalStorageModule } from "../interfaces";

export const mockLocalStorageModule: ILocalStorageModule = {
    clearTokens: noop,
    getSST: () => "fake-sst",
    getTT: () => "fake-tt",
    storeSST: noop,
    storeTT: noop,
};
