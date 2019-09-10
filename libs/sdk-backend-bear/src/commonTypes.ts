// (C) 2019 GoodData Corporation
import { SDK } from "@gooddata/gooddata-js";

export interface IAuthenticatedSdkProvider {
    get(): Promise<SDK>;
}
