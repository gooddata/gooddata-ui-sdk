import get = require('lodash/get');

export interface IIdentifierWithTags {
    identifier: string;
    tags: string;
}

export interface IDisplayForms {
    [key: string]: IIdentifierWithTags;
}

export interface IAttrItem {
    identifier: string;
    tags: string;
    displayForms: IDisplayForms;
    defaultDisplayForm: IIdentifierWithTags;
}

export interface IAttrs {
    [key: string]: IAttrItem;
}

export interface IDataSet {
    identifier: string;
    tags: string;
    attributes: IAttrs;
}

export interface ICatalog {
    metrics: { [key: string]: IIdentifierWithTags };
    visualizations: { [key: string]: IIdentifierWithTags };
    attributes: IAttrs;
    dateDataSets: { [key: string]: IDataSet };
}

function getDisplayFormFromAttr(
        attrs: IAttrs, attributeName: string, displayFormName: string, property: string
    ): string {

    if (!displayFormName) {
        return get<IAttrs, string>(attrs, [attributeName, 'defaultDisplayForm', property]);
    }
    return get<IAttrs, string>(attrs, [attributeName, 'displayForms', displayFormName, property]);
}

/**
 * example usage:
 *  import catalog from './catalog.json';
 *  const C = new CatalogHelper(catalog);
 */
export default class CatalogHelper {
    public metrics: { [key: string]: IIdentifierWithTags };
    public visualizations: { [key: string]: IIdentifierWithTags };
    public attributes: { [key: string]: IAttrItem };
    public dateDataSets: { [key: string]: IDataSet };

    constructor(catalog: ICatalog) {
        this.metrics = catalog.metrics;
        this.visualizations = catalog.visualizations;
        this.attributes = catalog.attributes;
        this.dateDataSets = catalog.dateDataSets;
    }

    public metric(name: string): string {
        return get<CatalogHelper, string>(this, ['metrics', name, 'identifier']);
    }

    public metricTags(name: string): string {
        return get<CatalogHelper, string>(this, ['metrics', name, 'tags']);
    }

    public visualization(name: string): string {
        return get<CatalogHelper, string>(this, ['visualizations', name, 'identifier']);
    }

    public visualizationTags(name: string): string {
        return get<CatalogHelper, string>(this, ['visualizations', name, 'tags']);
    }

    public attribute(attributeName: string): string {
        return get<CatalogHelper, string>(this, ['attributes', attributeName, 'identifier']);
    }

    public attributeTags(attributeName: string): string {
        return get<CatalogHelper, string>(this, ['attributes', attributeName, 'tags']);
    }

    public attributeDisplayForm(attributeName: string, displayFormName?: string): string {
        return getDisplayFormFromAttr(this.attributes, attributeName, displayFormName, 'identifier');
    }

    public attributeDisplayFormTags(attributeName: string, displayFormName?: string): string {
        return getDisplayFormFromAttr(this.attributes, attributeName, displayFormName, 'tags');
    }

    public dateDataSet(dataSetName: string): string {
        return get<CatalogHelper, string>(this, ['dateDataSets', dataSetName, 'identifier']);
    }

    public dateDataSetTags(dataSetName: string): string {
        return get<CatalogHelper, string>(this, ['dateDataSets', dataSetName, 'tags']);
    }

    public dateDataSetAttribute(dataSetName: string, attrName: string): string {
        return get<CatalogHelper, string>(this, ['dateDataSets', dataSetName, 'attributes', attrName, 'identifier']);
    }

    public dateDataSetAttributeTags(dataSetName: string, attrName: string): string {
        return get<CatalogHelper, string>(this, ['dateDataSets', dataSetName, 'attributes', attrName, 'tags']);
    }

    public dateDataSetDisplayForm(dataSetName: string, attributeName: string, displayFormName?: string): string {
        const attrs = get<CatalogHelper, IAttrs>(this, ['dateDataSets', dataSetName, 'attributes']);
        return getDisplayFormFromAttr(attrs, attributeName, displayFormName, 'identifier');
    }

    public dateDataSetDisplayFormTags(dataSetName: string, attributeName: string, displayFormName?: string): string {
        const attrs = get<CatalogHelper, IAttrs>(this, ['dateDataSets', dataSetName, 'attributes']);
        return getDisplayFormFromAttr(attrs, attributeName, displayFormName, 'tags');
    }
}
