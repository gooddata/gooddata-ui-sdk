// (C) 2007-2018 GoodData Corporation
import { get } from 'lodash';
import { catalog } from './catalog';

export const { projectId } = catalog;

export const totalSalesIdentifier = get(catalog, 'measures[$ Total Sales].identifier');
export const franchiseFeesIdentifier = get(catalog, 'measures[$ Franchise Fees].identifier');
export const franchiseFeesAdRoyaltyIdentifier = get(catalog, 'measures[$ Franchise Fees (Ad Royalty)].identifier');
export const franchiseFeesInitialFranchiseFeeIdentifier = get(catalog, 'measures[$ Franchise Fees (Initial Franchise Fee)].identifier');
export const franchiseFeesIdentifierOngoingRoyalty = get(catalog, 'measures[$ Franchise Fees (Ongoing Royalty)].identifier');
export const averageDailyTotalSales = get(catalog, 'measures[$ Avg Daily Total Sales].identifier');
export const averageCheckSizeByServer = get(catalog, 'measures[Avg Check Size by Server].identifier');

export const monthDateIdentifier = get(catalog, 'dateDataSets[Date (Date)].attributes[Month (Date)].displayForms[Short (Jan) (Date)].identifier');
export const dateDatasetIdentifier = get(catalog, 'dateDataSets[Date (Date)].identifier');

export const locationStateAttributeIdentifier = get(catalog, 'attributes[Location State].identifier');
export const locationStateAttributeUri = `/gdc/md/${projectId}/obj/2210`;
export const locationStateDisplayFormIdentifier = get(catalog, 'attributes[Location State].defaultDisplayForm.identifier');

export const locationCityAttributeIdentifier = get(catalog, 'attributes[Location City].identifier');
export const locationCityAttributeUri = `/gdc/md/${projectId}/obj/2208`;
export const locationCityDisplayFormIdentifier = get(catalog, 'attributes[Location City].defaultDisplayForm.identifier');

export const locationIdAttributeIdentifier = get(catalog, 'attributes[Location Id].identifier');

export const locationNameDisplayFormIdentifier = get(catalog, 'attributes[Location Name].defaultDisplayForm.identifier');
export const locationNameAttributeUri = `/gdc/md/${projectId}/obj/2204`;

export const locationResortIdentifier = get(catalog, 'attributes[Location Resort].defaultDisplayForm.identifier');

export const employeeNameIdentifier = get(catalog, 'attributes[Employee Name].defaultDisplayForm.identifier');
export const menuItemNameAttributeDFIdentifier = get(catalog, 'attributes[Menu Item Name].defaultDisplayForm.identifier');
export const menuCategoryAttributeDFIdentifier = get(catalog, 'attributes[Menu Category].defaultDisplayForm.identifier');

export const tableVisualizationIdentifier = get(catalog, 'visualizations[Table report Labor Costs Vs Scheduled Costs].identifier');
export const columnVisualizationIdentifier = get(catalog, 'visualizations[Sales over Time].identifier');
export const franchiseFeesVisualizationIdentifier = get(catalog, 'visualizations[Franchise Fees].identifier');


export const franchiseFeesTag = 'franchise_fees';
