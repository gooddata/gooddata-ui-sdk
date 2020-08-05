// (C) 2007-2020 GoodData Corporation
import * as routes from "./routes";
import { XhrModule } from "../xhr";

export class ContractsModule {
    constructor(private xhr: XhrModule) {}

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public getUserContracts() {
        return this.xhr.get(routes.CONTRACTS).then((data: any) => ({
            items: data.getData().contracts.items.map((item: any) => item.contract),
            paging: data.getData().contracts.paging,
        }));
    }
}
