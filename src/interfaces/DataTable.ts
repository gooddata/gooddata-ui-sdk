export interface IDataTable {
    execute: (afm, transformation) => Promise<any>;
}
