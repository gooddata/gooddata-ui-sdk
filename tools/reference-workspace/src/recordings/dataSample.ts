// (C) 2020 GoodData Corporation

/* tslint:disable:file-header */
/* tslint:disable:variable-name */
/* tslint:disable:no-var-requires */
/* eslint-disable @typescript-eslint/no-var-requires */
/* THIS FILE WAS AUTO-GENERATED USING MOCK HANDLING TOOL; YOU SHOULD NOT EDIT THIS FILE; GENERATE TIME: 2020-07-10T08:43:45.044Z; */

const df_label_product_id_name = require("./metadata/displayForms/label.product.id.name/elements.json");
const df_label_owner_department = require("./metadata/displayForms/label.owner.department/elements.json");
const df_label_owner_region = require("./metadata/displayForms/label.owner.region/elements.json");
export const DataSamples = {
    Department: { DirectSales: df_label_owner_department[0], InsideSales: df_label_owner_department[1] },
    ProductName: {
        CompuSci: df_label_product_id_name[0],
        Educationly: df_label_product_id_name[1],
        Explorer: df_label_product_id_name[2],
        GrammarPlus: df_label_product_id_name[3],
        PhoenixSoft: df_label_product_id_name[4],
        TouchAll: df_label_product_id_name[5],
        WonderKid: df_label_product_id_name[6],
    },
    Region: { EastCoast: df_label_owner_region[0], WestCoast: df_label_owner_region[1] },
};
