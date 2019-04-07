// (C) 2007-2018 GoodData Corporation
import { AFM, Execution } from "@gooddata/typings";
import { IMappingHeader } from "../../../../interfaces/MappingHeader";
import { TableRow } from "../../../../interfaces/Table";

export const EXECUTION_REQUEST_2A_1M: AFM.IExecution = {
    execution: {
        afm: {
            attributes: [
                {
                    localIdentifier: "owner_name",
                    displayForm: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028",
                    },
                },
                {
                    localIdentifier: "stage_name",
                    displayForm: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805",
                    },
                },
            ],
            measures: [
                {
                    localIdentifier: "num_of_open_opps",
                    definition: {
                        measure: {
                            item: {
                                uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/13465",
                            },
                        },
                    },
                },
            ],
        },
        resultSpec: {
            dimensions: [
                {
                    itemIdentifiers: ["owner_name", "stage_name"],
                },
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ],
        },
    },
};

export const EXECUTION_RESPONSE_2A_1M: Execution.IExecutionResponse = {
    dimensions: [
        {
            headers: [
                {
                    attributeHeader: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028",
                        identifier: "label.owner.id.name",
                        localIdentifier: "owner_name",
                        name: "Owner Name DF Title",
                        formOf: {
                            name:
                                "Sales Rep (element 1, element 2, element 3, element 4, element 5, element 6, element 7, element 8, element 9, element 10, element 11)", // tslint:disable-line:max-line-length
                            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/12345",
                            identifier: "owner_name_attr_local_identifier",
                        },
                    },
                },
                {
                    attributeHeader: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805",
                        identifier: "label.stage.name.stagename",
                        localIdentifier: "stage_name",
                        name: "Stage Name DF Title",
                        formOf: {
                            name: "Stage Name",
                            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/67890",
                            identifier: "stage_name_attr_local_identifier",
                        },
                    },
                },
            ],
        },
        {
            headers: [
                {
                    measureGroupHeader: {
                        items: [
                            {
                                measureHeaderItem: {
                                    uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/13465",
                                    identifier: "aaYh6Voua2yj",
                                    localIdentifier: "num_of_open_opps",
                                    name: "# of Open Opps.",
                                    format: "#,##0",
                                },
                            },
                        ],
                    },
                },
            ],
        },
    ],
    links: {
        executionResult:
            "/gdc/app/projects/project_id/executionResults/foo?q=bar&c=baz&dimension=a&dimension=m",
    },
};

export const EXECUTION_RESULT_2A_1M: Execution.IExecutionResult = {
    data: [
        ["13"],
        ["11"],
        ["3"],
        ["2"],
        ["2"],
        ["2"],
        ["8"],
        ["11"],
        ["7"],
        ["1"],
        ["2"],
        ["8"],
        ["11"],
        ["9"],
        ["1"],
        ["3"],
        ["3"],
        ["11"],
        ["9"],
        ["4"],
        ["3"],
        ["1"],
        ["2"],
        ["5"],
        ["12"],
        ["6"],
        ["2"],
        ["5"],
        ["6"],
        ["11"],
        ["10"],
        ["1"],
        ["3"],
        ["4"],
        ["13"],
        ["5"],
        ["7"],
        ["1"],
        ["1"],
        ["2"],
        ["9"],
        ["7"],
        ["5"],
        ["2"],
        ["4"],
        ["4"],
        ["5"],
        ["8"],
        ["9"],
        ["2"],
        ["2"],
        ["6"],
        ["7"],
        ["9"],
        ["5"],
        ["1"],
        ["1"],
        ["3"],
        ["11"],
        ["11"],
        ["7"],
        ["2"],
        ["6"],
        ["5"],
        ["7"],
        ["8"],
        ["9"],
        ["1"],
        ["2"],
        ["3"],
        ["8"],
        ["5"],
        ["9"],
        ["3"],
        ["1"],
        ["4"],
    ],
    headerItems: [
        [
            [
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1224",
                        name: "Adam Bradley",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1224",
                        name: "Adam Bradley",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1224",
                        name: "Adam Bradley",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1224",
                        name: "Adam Bradley",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1224",
                        name: "Adam Bradley",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1224",
                        name: "Adam Bradley",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1227",
                        name: "Alejandro Vabiano",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1227",
                        name: "Alejandro Vabiano",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1227",
                        name: "Alejandro Vabiano",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1227",
                        name: "Alejandro Vabiano",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1227",
                        name: "Alejandro Vabiano",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1228",
                        name: "Alexsandr Fyodr",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1228",
                        name: "Alexsandr Fyodr",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1228",
                        name: "Alexsandr Fyodr",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1228",
                        name: "Alexsandr Fyodr",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1228",
                        name: "Alexsandr Fyodr",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1228",
                        name: "Alexsandr Fyodr",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1229",
                        name: "Cory Owens",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1229",
                        name: "Cory Owens",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1229",
                        name: "Cory Owens",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1229",
                        name: "Cory Owens",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1229",
                        name: "Cory Owens",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1229",
                        name: "Cory Owens",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1230",
                        name: "Dale Perdadtin",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1230",
                        name: "Dale Perdadtin",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1230",
                        name: "Dale Perdadtin",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1230",
                        name: "Dale Perdadtin",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1230",
                        name: "Dale Perdadtin",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1231",
                        name: "Dave Bostadt",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1231",
                        name: "Dave Bostadt",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1231",
                        name: "Dave Bostadt",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1231",
                        name: "Dave Bostadt",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1231",
                        name: "Dave Bostadt",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1231",
                        name: "Dave Bostadt",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1232",
                        name: "Ellen Jones",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1232",
                        name: "Ellen Jones",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1232",
                        name: "Ellen Jones",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1232",
                        name: "Ellen Jones",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1232",
                        name: "Ellen Jones",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1232",
                        name: "Ellen Jones",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1233",
                        name: "Huey Jonas",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1233",
                        name: "Huey Jonas",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1233",
                        name: "Huey Jonas",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1233",
                        name: "Huey Jonas",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1233",
                        name: "Huey Jonas",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1233",
                        name: "Huey Jonas",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1235",
                        name: "Jessica Traven",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1235",
                        name: "Jessica Traven",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1235",
                        name: "Jessica Traven",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1235",
                        name: "Jessica Traven",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1235",
                        name: "Jessica Traven",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1235",
                        name: "Jessica Traven",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1236",
                        name: "John Jovi",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1236",
                        name: "John Jovi",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1236",
                        name: "John Jovi",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1236",
                        name: "John Jovi",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1236",
                        name: "John Jovi",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1236",
                        name: "John Jovi",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1238",
                        name: "Jon Jons",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1238",
                        name: "Jon Jons",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1238",
                        name: "Jon Jons",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1238",
                        name: "Jon Jons",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1238",
                        name: "Jon Jons",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1238",
                        name: "Jon Jons",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1239",
                        name: "Lea Forbes",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1239",
                        name: "Lea Forbes",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1239",
                        name: "Lea Forbes",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1239",
                        name: "Lea Forbes",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1239",
                        name: "Lea Forbes",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1239",
                        name: "Lea Forbes",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1240",
                        name: "Monique Babonas",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1240",
                        name: "Monique Babonas",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1240",
                        name: "Monique Babonas",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1240",
                        name: "Monique Babonas",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1240",
                        name: "Monique Babonas",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1240",
                        name: "Monique Babonas",
                    },
                },
            ],
            [
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
                        name: "Interest",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
                        name: "Discovery",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
                        name: "Short List",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
                        name: "Risk Assessment",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
                        name: "Conviction",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
                        name: "Negotiation",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
                        name: "Interest",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
                        name: "Discovery",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
                        name: "Short List",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
                        name: "Risk Assessment",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
                        name: "Conviction",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
                        name: "Interest",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
                        name: "Discovery",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
                        name: "Short List",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
                        name: "Risk Assessment",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
                        name: "Conviction",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
                        name: "Negotiation",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
                        name: "Interest",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
                        name: "Discovery",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
                        name: "Short List",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
                        name: "Risk Assessment",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
                        name: "Conviction",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
                        name: "Negotiation",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
                        name: "Interest",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
                        name: "Discovery",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
                        name: "Short List",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
                        name: "Risk Assessment",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
                        name: "Negotiation",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
                        name: "Interest",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
                        name: "Discovery",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
                        name: "Short List",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
                        name: "Risk Assessment",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
                        name: "Conviction",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
                        name: "Negotiation",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
                        name: "Interest",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
                        name: "Discovery",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
                        name: "Short List",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
                        name: "Risk Assessment",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
                        name: "Conviction",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
                        name: "Negotiation",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
                        name: "Interest",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
                        name: "Discovery",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
                        name: "Short List",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
                        name: "Risk Assessment",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
                        name: "Conviction",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
                        name: "Negotiation",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
                        name: "Interest",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
                        name: "Discovery",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
                        name: "Short List",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
                        name: "Risk Assessment",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
                        name: "Conviction",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
                        name: "Negotiation",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
                        name: "Interest",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
                        name: "Discovery",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
                        name: "Short List",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
                        name: "Risk Assessment",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
                        name: "Conviction",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
                        name: "Negotiation",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
                        name: "Interest",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
                        name: "Discovery",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
                        name: "Short List",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
                        name: "Risk Assessment",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
                        name: "Conviction",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
                        name: "Negotiation",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
                        name: "Interest",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
                        name: "Discovery",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
                        name: "Short List",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
                        name: "Risk Assessment",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
                        name: "Conviction",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
                        name: "Negotiation",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
                        name: "Interest",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
                        name: "Discovery",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
                        name: "Short List",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
                        name: "Risk Assessment",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
                        name: "Conviction",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
                        name: "Negotiation",
                    },
                },
            ],
        ],
        [
            [
                {
                    measureHeaderItem: {
                        name: "# of Open Opps.",
                        order: 0,
                    },
                },
            ],
        ],
    ],
    paging: {
        count: [76, 1],
        offset: [0, 0],
        total: [76, 1],
    },
};

export const TABLE_HEADERS_2A_1M: IMappingHeader[] = [
    {
        attributeHeader: {
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028",
            identifier: "label.owner.id.name",
            localIdentifier: "owner_name",
            name: "Owner Name DF Title",
            formOf: {
                uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/12345",
                identifier: "owner_name_attr_local_identifier",
                // tslint:disable-next-line:max-line-length
                name:
                    "Sales Rep (element 1, element 2, element 3, element 4, element 5, element 6, element 7, element 8, element 9, element 10, element 11)",
            },
        },
    },
    {
        attributeHeader: {
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805",
            identifier: "label.stage.name.stagename",
            localIdentifier: "stage_name",
            name: "Stage Name DF Title",
            formOf: {
                uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/67890",
                identifier: "stage_name_attr_local_identifier",
                name: "Stage Name",
            },
        },
    },
    {
        measureHeaderItem: {
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/13465",
            identifier: "aaYh6Voua2yj",
            localIdentifier: "num_of_open_opps",
            name: "# of Open Opps.",
            format: "#,##0",
        },
    },
];

export const TABLE_ROWS_2A_1M: TableRow[] = [
    [
        {
            name: "Adam Bradley",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1224",
        },
        {
            name: "Interest",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
        },
        "13",
    ],
    [
        {
            name: "Adam Bradley",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1224",
        },
        {
            name: "Discovery",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
        },
        "11",
    ],
    [
        {
            name: "Adam Bradley",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1224",
        },
        {
            name: "Short List",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
        },
        "3",
    ],
    [
        {
            name: "Adam Bradley",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1224",
        },
        {
            name: "Risk Assessment",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
        },
        "2",
    ],
    [
        {
            name: "Adam Bradley",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1224",
        },
        {
            name: "Conviction",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
        },
        "2",
    ],
    [
        {
            name: "Adam Bradley",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1224",
        },
        {
            name: "Negotiation",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
        },
        "2",
    ],
    [
        {
            name: "Alejandro Vabiano",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1227",
        },
        {
            name: "Interest",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
        },
        "8",
    ],
    [
        {
            name: "Alejandro Vabiano",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1227",
        },
        {
            name: "Discovery",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
        },
        "11",
    ],
    [
        {
            name: "Alejandro Vabiano",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1227",
        },
        {
            name: "Short List",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
        },
        "7",
    ],
    [
        {
            name: "Alejandro Vabiano",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1227",
        },
        {
            name: "Risk Assessment",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
        },
        "1",
    ],
    [
        {
            name: "Alejandro Vabiano",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1227",
        },
        {
            name: "Conviction",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
        },
        "2",
    ],
    [
        {
            name: "Alexsandr Fyodr",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1228",
        },
        {
            name: "Interest",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
        },
        "8",
    ],
    [
        {
            name: "Alexsandr Fyodr",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1228",
        },
        {
            name: "Discovery",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
        },
        "11",
    ],
    [
        {
            name: "Alexsandr Fyodr",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1228",
        },
        {
            name: "Short List",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
        },
        "9",
    ],
    [
        {
            name: "Alexsandr Fyodr",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1228",
        },
        {
            name: "Risk Assessment",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
        },
        "1",
    ],
    [
        {
            name: "Alexsandr Fyodr",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1228",
        },
        {
            name: "Conviction",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
        },
        "3",
    ],
    [
        {
            name: "Alexsandr Fyodr",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1228",
        },
        {
            name: "Negotiation",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
        },
        "3",
    ],
    [
        {
            name: "Cory Owens",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1229",
        },
        {
            name: "Interest",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
        },
        "11",
    ],
    [
        {
            name: "Cory Owens",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1229",
        },
        {
            name: "Discovery",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
        },
        "9",
    ],
    [
        {
            name: "Cory Owens",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1229",
        },
        {
            name: "Short List",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
        },
        "4",
    ],
    [
        {
            name: "Cory Owens",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1229",
        },
        {
            name: "Risk Assessment",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
        },
        "3",
    ],
    [
        {
            name: "Cory Owens",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1229",
        },
        {
            name: "Conviction",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
        },
        "1",
    ],
    [
        {
            name: "Cory Owens",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1229",
        },
        {
            name: "Negotiation",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
        },
        "2",
    ],
    [
        {
            name: "Dale Perdadtin",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1230",
        },
        {
            name: "Interest",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
        },
        "5",
    ],
    [
        {
            name: "Dale Perdadtin",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1230",
        },
        {
            name: "Discovery",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
        },
        "12",
    ],
    [
        {
            name: "Dale Perdadtin",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1230",
        },
        {
            name: "Short List",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
        },
        "6",
    ],
    [
        {
            name: "Dale Perdadtin",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1230",
        },
        {
            name: "Risk Assessment",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
        },
        "2",
    ],
    [
        {
            name: "Dale Perdadtin",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1230",
        },
        {
            name: "Negotiation",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
        },
        "5",
    ],
    [
        {
            name: "Dave Bostadt",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1231",
        },
        {
            name: "Interest",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
        },
        "6",
    ],
    [
        {
            name: "Dave Bostadt",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1231",
        },
        {
            name: "Discovery",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
        },
        "11",
    ],
    [
        {
            name: "Dave Bostadt",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1231",
        },
        {
            name: "Short List",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
        },
        "10",
    ],
    [
        {
            name: "Dave Bostadt",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1231",
        },
        {
            name: "Risk Assessment",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
        },
        "1",
    ],
    [
        {
            name: "Dave Bostadt",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1231",
        },
        {
            name: "Conviction",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
        },
        "3",
    ],
    [
        {
            name: "Dave Bostadt",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1231",
        },
        {
            name: "Negotiation",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
        },
        "4",
    ],
    [
        {
            name: "Ellen Jones",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1232",
        },
        {
            name: "Interest",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
        },
        "13",
    ],
    [
        {
            name: "Ellen Jones",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1232",
        },
        {
            name: "Discovery",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
        },
        "5",
    ],
    [
        {
            name: "Ellen Jones",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1232",
        },
        {
            name: "Short List",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
        },
        "7",
    ],
    [
        {
            name: "Ellen Jones",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1232",
        },
        {
            name: "Risk Assessment",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
        },
        "1",
    ],
    [
        {
            name: "Ellen Jones",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1232",
        },
        {
            name: "Conviction",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
        },
        "1",
    ],
    [
        {
            name: "Ellen Jones",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1232",
        },
        {
            name: "Negotiation",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
        },
        "2",
    ],
    [
        {
            name: "Huey Jonas",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1233",
        },
        {
            name: "Interest",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
        },
        "9",
    ],
    [
        {
            name: "Huey Jonas",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1233",
        },
        {
            name: "Discovery",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
        },
        "7",
    ],
    [
        {
            name: "Huey Jonas",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1233",
        },
        {
            name: "Short List",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
        },
        "5",
    ],
    [
        {
            name: "Huey Jonas",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1233",
        },
        {
            name: "Risk Assessment",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
        },
        "2",
    ],
    [
        {
            name: "Huey Jonas",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1233",
        },
        {
            name: "Conviction",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
        },
        "4",
    ],
    [
        {
            name: "Huey Jonas",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1233",
        },
        {
            name: "Negotiation",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
        },
        "4",
    ],
    [
        {
            name: "Jessica Traven",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1235",
        },
        {
            name: "Interest",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
        },
        "5",
    ],
    [
        {
            name: "Jessica Traven",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1235",
        },
        {
            name: "Discovery",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
        },
        "8",
    ],
    [
        {
            name: "Jessica Traven",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1235",
        },
        {
            name: "Short List",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
        },
        "9",
    ],
    [
        {
            name: "Jessica Traven",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1235",
        },
        {
            name: "Risk Assessment",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
        },
        "2",
    ],
    [
        {
            name: "Jessica Traven",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1235",
        },
        {
            name: "Conviction",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
        },
        "2",
    ],
    [
        {
            name: "Jessica Traven",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1235",
        },
        {
            name: "Negotiation",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
        },
        "6",
    ],
    [
        {
            name: "John Jovi",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1236",
        },
        {
            name: "Interest",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
        },
        "7",
    ],
    [
        {
            name: "John Jovi",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1236",
        },
        {
            name: "Discovery",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
        },
        "9",
    ],
    [
        {
            name: "John Jovi",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1236",
        },
        {
            name: "Short List",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
        },
        "5",
    ],
    [
        {
            name: "John Jovi",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1236",
        },
        {
            name: "Risk Assessment",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
        },
        "1",
    ],
    [
        {
            name: "John Jovi",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1236",
        },
        {
            name: "Conviction",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
        },
        "1",
    ],
    [
        {
            name: "John Jovi",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1236",
        },
        {
            name: "Negotiation",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
        },
        "3",
    ],
    [
        {
            name: "Jon Jons",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1238",
        },
        {
            name: "Interest",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
        },
        "11",
    ],
    [
        {
            name: "Jon Jons",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1238",
        },
        {
            name: "Discovery",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
        },
        "11",
    ],
    [
        {
            name: "Jon Jons",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1238",
        },
        {
            name: "Short List",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
        },
        "7",
    ],
    [
        {
            name: "Jon Jons",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1238",
        },
        {
            name: "Risk Assessment",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
        },
        "2",
    ],
    [
        {
            name: "Jon Jons",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1238",
        },
        {
            name: "Conviction",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
        },
        "6",
    ],
    [
        {
            name: "Jon Jons",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1238",
        },
        {
            name: "Negotiation",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
        },
        "5",
    ],
    [
        {
            name: "Lea Forbes",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1239",
        },
        {
            name: "Interest",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
        },
        "7",
    ],
    [
        {
            name: "Lea Forbes",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1239",
        },
        {
            name: "Discovery",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
        },
        "8",
    ],
    [
        {
            name: "Lea Forbes",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1239",
        },
        {
            name: "Short List",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
        },
        "9",
    ],
    [
        {
            name: "Lea Forbes",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1239",
        },
        {
            name: "Risk Assessment",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
        },
        "1",
    ],
    [
        {
            name: "Lea Forbes",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1239",
        },
        {
            name: "Conviction",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
        },
        "2",
    ],
    [
        {
            name: "Lea Forbes",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1239",
        },
        {
            name: "Negotiation",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
        },
        "3",
    ],
    [
        {
            name: "Monique Babonas",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1240",
        },
        {
            name: "Interest",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966643",
        },
        "8",
    ],
    [
        {
            name: "Monique Babonas",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1240",
        },
        {
            name: "Discovery",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966644",
        },
        "5",
    ],
    [
        {
            name: "Monique Babonas",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1240",
        },
        {
            name: "Short List",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=1251",
        },
        "9",
    ],
    [
        {
            name: "Monique Babonas",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1240",
        },
        {
            name: "Risk Assessment",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966645",
        },
        "3",
    ],
    [
        {
            name: "Monique Babonas",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1240",
        },
        {
            name: "Conviction",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966646",
        },
        "1",
    ],
    [
        {
            name: "Monique Babonas",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1028/elements?id=1240",
        },
        {
            name: "Negotiation",
            uri: "/gdc/md/tgqkx9leq2tntui4j6fp08tk6epftziu/obj/1805/elements?id=966647",
        },
        "4",
    ],
];
