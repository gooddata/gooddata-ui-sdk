// (C) 2020 GoodData Corporation

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable header/header */
/* THIS FILE WAS AUTO-GENERATED USING MOCK HANDLING TOOL; YOU SHOULD NOT EDIT THIS FILE; GENERATE TIME: 2020-09-16T08:43:32.301Z; */

const df_label_product_id_name = require("./metadata/displayForms/label.product.id.name/elements.json");
const df_label_owner_department = require("./metadata/displayForms/label.owner.department/elements.json");
const df_label_owner_region = require("./metadata/displayForms/label.owner.region/elements.json");
const df_label_stage_status = require("./metadata/displayForms/label.stage.status/elements.json");
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
    Status: { Lost: df_label_stage_status[0], Open: df_label_stage_status[1], Won: df_label_stage_status[2] },
};
