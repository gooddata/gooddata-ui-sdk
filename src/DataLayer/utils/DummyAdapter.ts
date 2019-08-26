// (C) 2007-2018 GoodData Corporation
import { AFM } from "@gooddata/typings";
import { IAdapter } from "../interfaces/Adapter";
import { IDataSource } from "../interfaces/DataSource";
import { DummyDataSource } from "./DummyDataSource";

export class DummyAdapter implements IAdapter<any> {
    private data: any;
    private success: boolean;
    private dataSource: any;

    // Intentional any
    constructor(data: any, success: boolean = true, dataSource: any = null) {
        this.data = data;
        this.success = success;
        this.dataSource = dataSource;
    }

    public createDataSource(_afm: AFM.IAfm): Promise<IDataSource<any>> {
        return this.dataSource
            ? Promise.resolve(this.dataSource)
            : Promise.resolve(new DummyDataSource<any>(this.data, this.success));
    }
}
