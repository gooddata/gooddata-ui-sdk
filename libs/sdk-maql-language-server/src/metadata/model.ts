// (C) 2021-2026 GoodData Corporation

import { type IElementsQueryOptions } from "@gooddata/sdk-backend-spi";
import { type TigerObjectType, objectTypeToTigerIdType } from "@gooddata/sdk-backend-tiger";
import {
    type DateAttributeGranularity,
    type IAttributeDisplayFormMetadataObject,
    type IAttributeElement,
    type IAttributeMetadataObject,
    type ICatalogAttribute,
    type ICatalogDateDataset,
    type ICatalogFact,
    type ICatalogMeasure,
    type IComputedAttributeMetadataObject,
    type IFactMetadataObject,
    type IMeasureMetadataObject,
    type IMetadataObject,
    type IParameterMetadataObject,
    areObjRefsEqual,
} from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface ITigerMetadataObject extends IMetadataObject {
    tigerType: TigerObjectType;
}

/**
 * @internal
 */
export type ITigerMetadataObjectStub = Pick<ITigerMetadataObject, "id" | "ref"> &
    Partial<ITigerMetadataObject>;

/**
 * @internal
 */
export interface ITigerAttribute extends IAttributeMetadataObject, ITigerMetadataObject {
    type: "attribute";
    tigerType: "attribute";
    tigerTypeModifier?: "date";
    granularity?: DateAttributeGranularity;
}

/**
 * @internal
 */
export interface ITigerLabel extends IAttributeDisplayFormMetadataObject, ITigerMetadataObject {
    type: "displayForm";
    tigerType: "label";
    tigerTypeModifier?: "date";
    granularity?: DateAttributeGranularity;
}

export interface ITigerDateLabel extends ITigerLabel {
    tigerTypeModifier: "date";
}

/**
 * @internal
 */
export interface ITigerFact extends IFactMetadataObject, ITigerMetadataObject {
    type: "fact";
    tigerType: "fact";
}

/**
 * @internal
 */
export interface ITigerDataset extends ITigerMetadataObject {
    type: "dataSet";
    tigerType: "dataset";
}

/**
 * @internal
 */
export interface ITigerMetric extends IMeasureMetadataObject, ITigerMetadataObject {
    type: "measure";
    tigerType: "metric";
}

/**
 * A computed attribute is referenced from MAQL by its own type rather than through a label - it has
 * no real labels. In MAQL text the type is spelled `computed_attribute`, which
 * {@link normalizeMaqlObjectType} translates into the `computedAttribute` Tiger type used here.
 *
 * @internal
 */
export interface ITigerComputedAttribute extends IComputedAttributeMetadataObject, ITigerMetadataObject {
    type: "computedAttribute";
    tigerType: "computedAttribute";
}

/**
 * @internal
 */
export interface ITigerParameter extends IParameterMetadataObject, ITigerMetadataObject {
    type: "parameter";
    tigerType: "parameter";
}

export function isITigerAttribute(object: ITigerMetadataObject): object is ITigerAttribute {
    return object.tigerType === "attribute";
}

export function isITigerLabel(object: ITigerMetadataObject): object is ITigerLabel {
    return object.tigerType === "label";
}

export function isITigerDateLabel(object: ITigerMetadataObject): object is ITigerDateLabel {
    return isITigerLabel(object) && object.tigerTypeModifier === "date";
}

export function isITigerFact(object: ITigerMetadataObject): object is ITigerFact {
    return object.tigerType === "fact";
}

export function isITigerMetric(object: ITigerMetadataObject): object is ITigerMetric {
    return object.tigerType === "metric";
}

export function isITigerComputedAttribute(object: ITigerMetadataObject): object is ITigerComputedAttribute {
    return object.tigerType === "computedAttribute";
}

/**
 * @internal
 */
export function isITigerParameter(object: ITigerMetadataObject): object is ITigerParameter {
    return object.tigerType === "parameter";
}

/**
 * The dataset fields that MAQL completion uses. SPI dataset metadata objects and declarative
 * datasets both have them.
 *
 * @internal
 */
export interface ILdmDataset {
    id: string;
    title: string;
    description?: string;
}

/**
 * @internal
 */
export class LdmObjects {
    private readonly attributes: IMetadataObjectStruct<ITigerAttribute>;
    private readonly labels: IMetadataObjectStruct<ITigerLabel>;
    private readonly facts: ITigerFact[];
    private readonly metrics: ITigerMetric[];
    private readonly computedAttributes: ITigerComputedAttribute[];
    private readonly parameters: ITigerParameter[];
    private readonly datasets: ITigerDataset[];
    readonly size: number;

    constructor(
        attributes: ICatalogAttribute[],
        facts: ICatalogFact[],
        metrics: ICatalogMeasure[],
        parameters: IParameterMetadataObject[],
        dates: ICatalogDateDataset[],
        datasets: ILdmDataset[],
        computedAttributes: IComputedAttributeMetadataObject[] = [],
    ) {
        const processedAttributes = this.processAttributes(attributes);
        const processedDates = this.processDates(dates);

        const regularAttributes = processedAttributes.flatMap((item) => item.attributes);
        const dateAttributes = processedDates.flatMap((item) => item.attributes);
        this.attributes = {
            regular: regularAttributes,
            date: dateAttributes,
            all: regularAttributes.concat(dateAttributes),
        };
        const regularLabels = processedAttributes.flatMap((item) => item.labels);
        const dateLabels = processedDates.flatMap((item) => item.labels);
        this.labels = {
            regular: regularLabels,
            date: dateLabels,
            all: regularLabels.concat(dateLabels),
        };
        this.facts = facts.map((fact) => LdmObjects.toTigerMetadataObject(fact.fact));
        this.metrics = metrics.map((metric) => LdmObjects.toTigerMetadataObject(metric.measure));
        this.computedAttributes = computedAttributes.map((computedAttribute) =>
            LdmObjects.toTigerMetadataObject(computedAttribute),
        );
        this.parameters = parameters.map((parameter) => LdmObjects.toTigerMetadataObject(parameter));
        this.datasets = datasets.map((dataset) => LdmObjects.toTigerDataset(dataset));
        this.size =
            this.attributes.all.length +
            this.labels.all.length +
            this.facts.length +
            this.metrics.length +
            this.computedAttributes.length +
            this.parameters.length;
    }

    public get(type: "attribute", typeModifier?: TypeModifiers): ITigerAttribute[];
    public get(type: "label", typeModifier?: TypeModifiers): ITigerLabel[];
    public get(type: "fact", typeModifier?: undefined): ITigerFact[];
    public get(type: "dataset", typeModifier?: undefined): ITigerDataset[];
    public get(type: "metric", typeModifier?: undefined): ITigerMetric[];
    public get(type: "computedAttribute", typeModifier?: undefined): ITigerComputedAttribute[];
    public get(type: "parameter", typeModifier?: undefined): ITigerParameter[];
    public get(type: TigerObjectType, typeModifier?: TypeModifiers): ITigerMetadataObject[] | undefined;
    public get(
        type: TigerObjectType,
        typeModifier: TypeModifiers = "all",
    ): ITigerMetadataObject[] | undefined {
        switch (type) {
            case "attribute":
                return this.attributes[typeModifier];
            case "fact":
                return this.facts;
            case "metric":
                return this.metrics;
            case "computedAttribute":
                return this.computedAttributes;
            case "parameter":
                return this.parameters;
            case "dataset":
                return this.datasets;
            case "label":
                return this.labels[typeModifier];
            default:
                return undefined;
        }
    }

    public findObject(object: ITigerMetadataObjectStub): ITigerMetadataObject | undefined {
        if (!object.tigerType) {
            return undefined;
        }
        const objects = this.get(object.tigerType);
        return objects?.find((tigerObject) => areObjRefsEqual(tigerObject.ref, object.ref));
    }

    public findById(type: "metric", id: string): ITigerMetric | undefined;
    public findById(type: "parameter", id: string): ITigerParameter | undefined;
    public findById(type: TigerObjectType, id: string): ITigerMetadataObject | undefined;
    public findById(type: TigerObjectType, id: string): ITigerMetadataObject | undefined {
        return this.get(type)?.find((object) => object.id === id);
    }

    private processAttributes(attributes: ICatalogAttribute[]): IProcessedAttributes[] {
        return attributes.flatMap((attribute) => ({
            attributes: [LdmObjects.toTigerMetadataObject(attribute.attribute)],
            labels: attribute.displayForms.flatMap((label) => LdmObjects.toTigerMetadataObject(label)),
        }));
    }

    private processDates(dates: ICatalogDateDataset[]): IProcessedAttributes[] {
        return dates.flatMap((date) => ({
            attributes: dates.flatMap((date) =>
                date.dateAttributes.map((attr) => ({
                    tigerTypeModifier: "date",
                    granularity: attr.granularity,
                    ...LdmObjects.toTigerMetadataObject(attr.attribute),
                })),
            ),
            labels: date.dateAttributes.flatMap((dateAttr) =>
                dateAttr.attribute.displayForms.map((label) => ({
                    tigerTypeModifier: "date",
                    granularity: dateAttr.granularity,
                    ...LdmObjects.toTigerMetadataObject(label),
                })),
            ),
        }));
    }

    private static toTigerMetadataObject(metadataObject: IAttributeMetadataObject): ITigerAttribute;
    private static toTigerMetadataObject(metadataObject: IAttributeDisplayFormMetadataObject): ITigerLabel;
    private static toTigerMetadataObject(metadataObject: IFactMetadataObject): ITigerFact;
    private static toTigerMetadataObject(metadataObject: IMeasureMetadataObject): ITigerMetric;
    private static toTigerMetadataObject(metadataObject: IParameterMetadataObject): ITigerParameter;
    private static toTigerMetadataObject(
        metadataObject: IComputedAttributeMetadataObject,
    ): ITigerComputedAttribute;
    private static toTigerMetadataObject(metadataObject: IMetadataObject): ITigerMetadataObject {
        return {
            tigerType: (objectTypeToTigerIdType as unknown as Record<string, TigerObjectType>)[
                metadataObject.type
            ],
            ...metadataObject,
        };
    }

    private static toTigerDataset(dataset: ILdmDataset): ITigerDataset {
        return {
            type: "dataSet",
            tigerType: "dataset",
            id: dataset.id,
            title: dataset.title,
            description: dataset.description || "",
            deprecated: false,
            production: true,
            ref: {
                type: "dataSet",
                identifier: dataset.id,
            },
            unlisted: false,
            uri: "",
        };
    }
}

interface IProcessedAttributes {
    attributes: ITigerAttribute[];
    labels: ITigerLabel[];
}

/**
 * @internal
 */
export interface IMetadataObjectStruct<T extends IMetadataObject> {
    regular: T[];
    date: T[];
    all: T[];
}

/**
 * @internal
 */
export type TypeModifiers = keyof IMetadataObjectStruct<IMetadataObject>;

/**
 * @param labels - label objects for which to get elements
 * @param excluded - label elements which should be filtered out from the result
 * @param options - label elements API advanced query options
 * @internal
 */
export type LabelElementsFunc = <T extends ITigerMetadataObjectStub>(
    labels: T[],
    excluded: string[],
    options: IElementsQueryOptions,
    limit?: number,
    offset?: number,
) => Promise<ILabelElementsFuncResult<T>>;

/**
 * @internal
 */
export interface ILabelElementsFuncResult<T extends ITigerMetadataObjectStub> {
    list: ILabelElementList;
    rejected: T[];
    /**
     * Errors the elements queries of the rejected labels failed with
     */
    rejectionReasons?: Map<T, unknown>;
}

/**
 * @internal
 */
export interface ILabelElementList {
    elements: IAttributeElement[];
    isIncomplete: boolean;
}
