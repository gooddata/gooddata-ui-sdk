/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable header/header */
/* THIS FILE WAS AUTO-GENERATED USING MOCK HANDLING TOOL; YOU SHOULD NOT EDIT THIS FILE; GENERATE TIME: 2023-09-08T08:39:48.879Z; */
const df_label_activity_id_subject = require("./metadata/displayForms/label.activity.id.subject/elements.json");
const df_label_product_id_name = require("./metadata/displayForms/label.product.id.name/elements.json");
const df_label_owner_department = require("./metadata/displayForms/label.owner.department/elements.json");
const df_label_owner_region = require("./metadata/displayForms/label.owner.region/elements.json");
const df_label_stage_status = require("./metadata/displayForms/label.stage.status/elements.json");
const df_label_opportunitysnapshot_forecastcategory = require("./metadata/displayForms/label.opportunitysnapshot.forecastcategory/elements.json");
const df_label_stage_name_stagename = require("./metadata/displayForms/label.stage.name.stagename/elements.json");
export const DataSamples = {
    Department: { DirectSales: df_label_owner_department[0], InsideSales: df_label_owner_department[1] },
    ForecastCategory: {
        Exclude: df_label_opportunitysnapshot_forecastcategory[0],
        Include: df_label_opportunitysnapshot_forecastcategory[1],
    },
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
    StageName: {
        Interest: df_label_stage_name_stagename[0],
        Discovery: df_label_stage_name_stagename[1],
        ShortList: df_label_stage_name_stagename[2],
        RiskAssessment: df_label_stage_name_stagename[3],
        Conviction: df_label_stage_name_stagename[4],
        Negotiation: df_label_stage_name_stagename[5],
        ClosedWon: df_label_stage_name_stagename[6],
        ClosedLost: df_label_stage_name_stagename[7],
    },
    Status: { Lost: df_label_stage_status[0], Open: df_label_stage_status[1], Won: df_label_stage_status[2] },
    Subject: {
        EmailWith1000BulbsComOnApr2108: df_label_activity_id_subject[0],
        EmailWith1000BulbsComOnDec1409: df_label_activity_id_subject[1],
        EmailWith1000BulbsComOnDec2908: df_label_activity_id_subject[2],
        EmailWith1000BulbsComOnFeb1009: df_label_activity_id_subject[3],
        EmailWith1000BulbsComOnJan0610: df_label_activity_id_subject[4],
        EmailWith1000BulbsComOnJan2909: df_label_activity_id_subject[5],
        EmailWith1000BulbsComOnJul0308: df_label_activity_id_subject[6],
        EmailWith1000BulbsComOnJul0610: df_label_activity_id_subject[7],
        EmailWith1000BulbsComOnJul2410: df_label_activity_id_subject[8],
        EmailWith1000BulbsComOnJun0110: df_label_activity_id_subject[9],
    },
};
