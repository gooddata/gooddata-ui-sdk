// (C) 2019-2020 GoodData Corporation
import { IDataset } from "@gooddata/sdk-model";

const generateDummyDataset = (id: string): IDataset => ({
    dataset: {
        datasetId: id,
        datasetLoadStatus: "OK",
        name: `${id} - Dummy Dataset`,
        loadedRowCount: 1000,
        dataHeader: {
            headerRowIndex: 0,
            columns: [
                {
                    column: {
                        name: "Id",
                        type: "ATTRIBUTE",
                    },
                },
                {
                    column: {
                        name: "Status",
                        type: "ATTRIBUTE",
                    },
                },
                {
                    column: {
                        name: "Channel",
                        type: "ATTRIBUTE",
                    },
                },
                {
                    column: {
                        name: "Price",
                        type: "FACT",
                    },
                },
                {
                    column: {
                        name: "Date",
                        type: "DATE",
                        format: "MM/dd/yyyy",
                    },
                },
            ],
        },
        firstSuccessfulUpdate: {
            status: "OK",
            owner: {
                login: "foo.bar@dummy.yeah",
                fullName: "Foo Bar",
            },
            created: "2019-09-16T03:55:14.000Z",
        },
        lastUpdate: {
            owner: {
                login: "foo.bar@dummy.yeah",
                fullName: "Foo Bar",
            },
            created: "2019-09-16T03:55:13.348Z",
            status: "OK",
        },
        lastSuccessfulUpdate: {
            created: "",
            owner: {
                fullName: "",
                login: "",
            },
            status: "OK",
        },
    },
});

export const datasets: IDataset[] = new Array(10)
    .fill(undefined)
    .map((_, i) => generateDummyDataset(i.toString()));
