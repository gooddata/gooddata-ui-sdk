// (C) 2022 GoodData Corporation
const SST_STORAGE_KEY = "GoodData_SST";
const TT_STORAGE_KEY = "GoodData_TT";

export class LocalStorageModule {
    public storeSST(sst: string): void {
        window.localStorage.setItem(SST_STORAGE_KEY, sst);
    }

    public storeTT(tt: string): void {
        window.localStorage.setItem(TT_STORAGE_KEY, tt);
    }

    public getSST(): string | null {
        return window.localStorage.getItem(SST_STORAGE_KEY);
    }

    public getTT(): string | null {
        return window.localStorage.getItem(TT_STORAGE_KEY);
    }
}
