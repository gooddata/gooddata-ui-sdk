// (C) 2007-2020 GoodData Corporation
import { BACKEND_URL } from "./env";

const demoProject = {
    "https://secure.gooddata.com": "k26dtejorcqlqf11crn6imbeevp2q4kg",
    "https://staging3.intgdc.com": "kytra720hke4d84e8ozohoz7uycn53mi",
    "https://staging2.intgdc.com": "ws7pxsamkx8o0t1s7kfvkj5o41uwcmqg",
    "https://staging.intgdc.com": "na1q8a0q4efb7cajbgre9mmm776dr1yv",
    "https://developer.na.gooddata.com": "xms7ga4tf3g3nzucd8380o2bev8oeknp",
};

const backendUrl = BACKEND_URL;
const demoProjectId = demoProject[backendUrl];

if (!demoProjectId) {
    // tslint:disable-next-line no-console
    console.error(`[fixtures.js] ProjectId for backend "${backendUrl}" is not in `, demoProject);
}

// tslint:disable-next-line no-console
console.log("The /gdc proxy is connected to: ", backendUrl, " with workspace: ", demoProjectId);

// your workspace would be probably static (you may ignore the code above)
export const backendUrlForInfo = backendUrl;
export const workspace = demoProjectId;

export const averageCheckSizeByServerIdentifier = "afewRzGAersh";
export const averageDailyTotalSalesIdentifier = "aagJGHg1bxap";
export const barInsightViewIdentifier = "aaKaMZUJeyGo";
export const barInsightViewUri = `/gdc/md/${demoProjectId}/obj/9285`;
export const dualAxisBarInsightViewIdentifier = "acSoPx4Mc7Rr";
export const lineInsightViewIdentifier = "aaAaDFt4c1yC";
export const lineInsightViewUri = `/gdc/md/${demoProjectId}/obj/9276`;
export const areaInsightViewIdentifier = "acCaGDIrc1iU";
export const areaInsightViewUri = `/gdc/md/${demoProjectId}/obj/9278`;
export const headlineInsightViewIdentifier = "aaiaOcMqbyMj";
export const headlineInsightViewUri = `/gdc/md/${demoProjectId}/obj/9279`;
export const scatterInsightViewIdentifier = "ab4aHg6lej5e";
export const scatterInsightViewUri = `/gdc/md/${demoProjectId}/obj/9277`;
export const bubbleInsightViewIdentifier = "abNaJG2Aed2M";
export const bubbleInsightViewUri = `/gdc/md/${demoProjectId}/obj/9280`;
export const pieInsightViewIdentifier = "aaraOcrmdjZd";
export const pieInsightViewUri = `/gdc/md/${demoProjectId}/obj/9281`;
export const donutInsightViewIdentifier = "absaJEALgcdO";
export const donutInsightViewUri = `/gdc/md/${demoProjectId}/obj/9282`;
export const treemapInsightViewIdentifier = "aajaObFleXdD";
export const treemapInsightViewUri = `/gdc/md/${demoProjectId}/obj/9283`;
export const heatmapInsightViewIdentifier = "abkaJfMYiiCU";
export const heatmapInsightViewUri = `/gdc/md/${demoProjectId}/obj/9284`;
export const columnsInsightViewIdentifier = "aabOspdLbbvs";
export const columnInsightViewIdentifier = "acFJltTsifSQ";
export const columnInsightViewUri = `/gdc/md/${demoProjectId}/obj/6862`;
export const comboInsightViewIdentifier = "aaTJJW6adsaj";
export const dateDatasetIdentifier = "date.dataset.dt";
export const dateDataSetUri = `/gdc/md/${demoProjectId}/obj/2180`;
export const employeeNameIdentifier = "label.employee.employeename";
export const franchiseFeesAdRoyaltyIdentifier = "aabHeqImaK0d";
export const franchiseFeesIdentifier = "aaEGaXAEgB7U";
export const franchiseFeesIdentifierOngoingRoyalty = "aaWGcgnsfxIg";
export const franchiseFeesInitialFranchiseFeeIdentifier = "aaDHcv6wevkl";
export const franchiseFeesTag = "franchise_fees";
export const franchiseFeesInsightViewIdentifier = "aahnVeLugyFj";
export const franchisedSalesIdentifier = "aclF4oDIe5hP";
export const locationCityAttributeIdentifier = "attr.restaurantlocation.locationcity";
export const locationCityAttributeUri = `/gdc/md/${demoProjectId}/obj/2208`;
export const locationCityDisplayFormIdentifier = "label.restaurantlocation.locationcity";
export const locationIdAttributeIdentifier = "attr.restaurantlocation.locationid";
export const locationNameAttributeUri = `/gdc/md/${demoProjectId}/obj/2204`;
export const locationNameDisplayFormIdentifier = "label.restaurantlocation.locationname";
export const locationResortIdentifier = "label.restaurantlocation.locationresort";
export const locationResortUri = `/gdc/md/${demoProjectId}/obj/2206`;
export const locationStateAttributeIdentifier = "attr.restaurantlocation.locationstate";
export const locationStateAttributeUri = `/gdc/md/${demoProjectId}/obj/2210`;
export const locationStateAttributeCaliforniaUri = `/gdc/md/${demoProjectId}/obj/2210/elements?id=6340116`;
export const locationStateDisplayFormIdentifier = "label.restaurantlocation.locationstate";
export const menuCategoryAttributeDFIdentifier = "label.menuitem.menucategory";
export const menuItemNameAttributeDFIdentifier = "label.menuitem.menuitemname";
export const yearDateDataSetAttributeIdentifier = "date.year";
export const monthDateDataSetAttributeIdentifier = "date.month";
export const monthOfYearDateIdentifier = "date.act81lMifn6q";
export const yearDateIdentifier = "date.aag81lMifn6q";
export const quarterDateIdentifier = "date.aam81lMifn6q";
export const monthDateIdentifier = "date.abm81lMifn6q";
export const monthDateIdentifierJanuary = `/gdc/md/${demoProjectId}/obj/2071/elements?id=1`;
export const numberOfChecksIdentifier = "aeOt50ngicOD";
export const tableInsightViewIdentifier = "aatFRvXBdilm";
export const tableInsightViewUri = `/gdc/md/${demoProjectId}/obj/8702`;
export const totalSalesIdentifier = "aa7ulGyKhIE5";
export const totalCostsIdentifier = "aaQHncjzfrtR";
export const totalSalesLocalIdentifier = "c11c27a0b0314a83bfe5b64ab9de7b89";
export const totalCostsLocalIdentifier = "aaQHncjzfrtR";
export const numberOfRestaurantsIdentifier = "aawAq8YqhM3o";
export const averageRestaurantDailyCostsIdentifier = "aaQJzQzoeKwZ";
