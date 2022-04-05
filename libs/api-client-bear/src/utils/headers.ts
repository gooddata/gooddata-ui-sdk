// (C) 2022 GoodData Corporation
import { IConfigStorage, ILocalStorageModule } from "../interfaces";

export function ttHeader(localStore: ILocalStorageModule, configStorage: IConfigStorage): object {
    if (configStorage.verificationLevel === "header") {
        const tt = localStore.getTT();
        if (tt) {
            return {
                "X-GDC-AUTHTT": tt,
            };
        }
    }
    return {};
}

export function sstHeader(localStore: ILocalStorageModule, configStorage: IConfigStorage): object {
    if (configStorage.verificationLevel === "header") {
        const sst = localStore.getSST();
        if (sst) {
            return {
                "X-GDC-AUTHSST": sst,
            };
        }
    }
    return {};
}
