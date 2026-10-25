// (C) 2020-2026 GoodData Corporation

// Adapted from react-components

import {
    type ObjRef,
    type ObjectType,
    isAttributeDescriptor,
    isIdentifierRef,
    isMeasureDescriptor,
} from "@gooddata/sdk-model";
import {
    type DrillEventIntersectionElementHeader,
    type IDrillEvent,
    type IDrillEventIntersectionElement,
    type IDrillIntersectionAttributeItem,
    isDrillIntersectionAttributeItem,
} from "@gooddata/sdk-ui";

import { TABLE } from "../../constants/visualization_types.js";
import { BearToBackendConvertors } from "../../convertors/index.js";
import {
    type IMeasure as IMeasureAFM,
    type IObjIdentifierQualifier,
    type IObjUriQualifier,
    type IPopMeasureDefinition,
    type IPreviousPeriodMeasureDefinition,
    type ISimpleMeasureDefinition,
    type Identifier as IdentifierAFM,
} from "../../typings/bear/bearTypes.js";

import { convertAfm } from "./executeAfmToAfm.js";
import {
    type IAfm,
    type ILegacyDrillEvent,
    type ILegacyDrillEventContext,
    type ILegacyDrillEventIntersectionElement,
    type ILegacyDrillPoint,
    type Identifier,
} from "./types.js";

const isDrillingOnMeasure = (measureIndex: number) => measureIndex !== -1;

const skipRowAttributes = (measureIndex: number) => (index: number) =>
    isDrillingOnMeasure(measureIndex) && index > measureIndex;

const getMeasurePositionInsideIntersection = (intersection: IDrillEventIntersectionElement[]): number =>
    intersection.findIndex((intersectionElement: IDrillEventIntersectionElement) =>
        isMeasureDescriptor(intersectionElement.header),
    );

const getAttributeElementIdFromAttributeElementUri = (attributeElementUri: string) => {
    const match = "/elements?id=";
    return attributeElementUri.slice(attributeElementUri.lastIndexOf(match) + match.length);
};

export function createDrillIntersectionElement(
    id: string,
    title: string,
    uri?: string,
    identifier?: string,
    type?: ObjectType,
): ILegacyDrillEventIntersectionElement {
    const element: ILegacyDrillEventIntersectionElement = {
        id: id || "",
        title: title || "",
    };

    if (uri || identifier) {
        element.header = {
            uri: uri || "",
            identifier: identifier || "",
            ...(type ? { type } : {}),
        };
    }

    return element;
}

// the object types the legacy drill contract documents on an intersection header; anything else the
// descriptor ref might carry is not emitted, so consumers never meet an undocumented value
const ATTRIBUTE_HEADER_TYPES: ObjectType[] = ["displayForm", "computedAttribute"];
const MEASURE_HEADER_TYPES: ObjectType[] = ["measure", "fact"];

const pickHeaderType = (ref: ObjRef | undefined, documented: ObjectType[]): ObjectType | undefined =>
    isIdentifierRef(ref) && ref.type && documented.includes(ref.type) ? ref.type : undefined;

/**
 * The object type carried on a legacy intersection header, taken from the descriptor's ref: `displayForm`
 * for a label, `computedAttribute` for a computed attribute (which has no labels and is referenced
 * directly, so the type is the only thing telling it apart from a label of the same identifier),
 * `measure` for a metric and `fact` for a measure computed straight from a fact.
 */
const getMappingHeaderType = (header: DrillEventIntersectionElementHeader): ObjectType | undefined => {
    if (isAttributeDescriptor(header)) {
        return pickHeaderType(header.attributeHeader.ref, ATTRIBUTE_HEADER_TYPES);
    }
    if (isMeasureDescriptor(header)) {
        return pickHeaderType(header.measureHeaderItem.ref, MEASURE_HEADER_TYPES);
    }
    return undefined;
};

const getMappingHeaderLocalIdentifier = (header: DrillEventIntersectionElementHeader): string => {
    if (isAttributeDescriptor(header)) {
        return header.attributeHeader.localIdentifier;
    }
    if (isMeasureDescriptor(header)) {
        return header.measureHeaderItem.localIdentifier;
    }

    throw new Error(
        `DrillEventIntersectionElementHeader of type "${Object.keys(header)}" has no localIdentifier`,
    );
};

const getMappingHeaderName = (header: DrillEventIntersectionElementHeader): string => {
    if (isAttributeDescriptor(header)) {
        return header.attributeHeader.formOf.name;
    }
    if (isDrillIntersectionAttributeItem(header)) {
        return header.attributeHeaderItem.name;
    }
    if (isMeasureDescriptor(header)) {
        return header.measureHeaderItem.name;
    }
    return "";
};

const getMappingHeaderIdentifier = (header: DrillEventIntersectionElementHeader): string => {
    if (isAttributeDescriptor(header)) {
        return header.attributeHeader.identifier;
    }
    if (isMeasureDescriptor(header)) {
        return header.measureHeaderItem.identifier;
    }
    throw new Error(
        `DrillEventIntersectionElementHeader header of type "${Object.keys(header)}" has no identifier`,
    );
};

const getMappingHeaderUri = (header: DrillEventIntersectionElementHeader): string => {
    if (isAttributeDescriptor(header)) {
        return header.attributeHeader.uri;
    }
    if (isDrillIntersectionAttributeItem(header)) {
        return header.attributeHeaderItem.uri;
    }
    if (isMeasureDescriptor(header)) {
        return header.measureHeaderItem.uri;
    }
    return "";
};

const getMasterMeasureLocalIdentifier = (measure: IMeasureAFM): IdentifierAFM => {
    const measureDefinition =
        (measure?.definition as IPopMeasureDefinition)?.popMeasure ||
        (measure?.definition as IPreviousPeriodMeasureDefinition)?.previousPeriodMeasure;
    return measureDefinition?.measureIdentifier;
};

const findMeasureByLocalIdentifier = (afm: IAfm, localIdentifier: IdentifierAFM): IMeasureAFM => {
    return (afm.measures || []).find((m: IMeasureAFM) => m.localIdentifier === localIdentifier);
};

const getMasterMeasureObjQualifier = (afm: IAfm, localIdentifier: Identifier) => {
    let measure = findMeasureByLocalIdentifier(afm, localIdentifier);
    if (measure) {
        const masterMeasureIdentifier = getMasterMeasureLocalIdentifier(measure);
        if (masterMeasureIdentifier) {
            measure = findMeasureByLocalIdentifier(afm, masterMeasureIdentifier);
        }
        if (!measure) {
            return null;
        }
        return {
            uri: ((measure?.definition as ISimpleMeasureDefinition)?.measure?.item as IObjUriQualifier)?.uri,
            identifier: (
                (measure?.definition as ISimpleMeasureDefinition)?.measure?.item as IObjIdentifierQualifier
            )?.identifier,
        };
    }
    return null;
};

const getDrillItemsForRowDrill = (
    intersectionExtended: IDrillEventIntersectionElement[],
): DrillEventIntersectionElementHeader[] => {
    const lastItem = intersectionExtended.at(-1);
    if (!lastItem) {
        return [];
    }

    if (isDrillIntersectionAttributeItem(lastItem.header)) {
        // the legacy intersection splits the attribute header into TWO entries; each half is
        // probed by the mapping-header readers
        const { attributeHeader, attributeHeaderItem } = lastItem.header;
        return [
            { attributeHeader } as unknown as DrillEventIntersectionElementHeader,
            { attributeHeaderItem } as IDrillIntersectionAttributeItem,
        ];
    } else {
        return [lastItem.header];
    }
};

export const convertTableDrillIntersectionToLegacy = (
    intersectionExtended: IDrillEventIntersectionElement[],
    afm: IAfm,
): ILegacyDrillEventIntersectionElement[] => {
    // structure for new intersection when drilling on measure cell
    // [0..n] column attribute+item header
    // [1] measure header
    // [0..n] row attribute+item header - these needs to be removed during conversion to be backward compatible
    const measureIndex = getMeasurePositionInsideIntersection(intersectionExtended);
    const drillingOnMeasure = isDrillingOnMeasure(measureIndex);
    const shouldSkipRowAttributes = skipRowAttributes(measureIndex);
    const drillItems: DrillEventIntersectionElementHeader[] = drillingOnMeasure
        ? intersectionExtended.reduce(
              (
                  drillItems: DrillEventIntersectionElementHeader[],
                  intersectionElement: IDrillEventIntersectionElement,
                  index: number,
              ) => {
                  if (shouldSkipRowAttributes(index)) {
                      // skip new row attributes in legacy intersection
                      return drillItems;
                  }
                  if (isDrillIntersectionAttributeItem(intersectionElement.header)) {
                      const { attributeHeader, attributeHeaderItem } = intersectionElement.header;
                      // different item/attribute order for drilling on measure and drilling on attr :(
                      // the legacy intersection splits the attribute header into TWO entries;
                      // each half is probed by the mapping-header readers below
                      drillItems.push({ attributeHeaderItem } as IDrillIntersectionAttributeItem);
                      drillItems.push({ attributeHeader } as unknown as DrillEventIntersectionElementHeader);
                  } else {
                      drillItems.push(intersectionElement.header);
                  }
                  return drillItems;
              },
              [],
          )
        : getDrillItemsForRowDrill(intersectionExtended);
    // Drilling needs refactoring: all '' should be replaced by null (breaking change)
    // intersection consists of
    //     0..1 measure
    //     0..1 row attribute and row attribute value
    //     0..n column attribute and column attribute values
    return drillItems.map((drillItem) => {
        if (isDrillIntersectionAttributeItem(drillItem)) {
            const id = getAttributeElementIdFromAttributeElementUri(drillItem.attributeHeaderItem.uri);
            return createDrillIntersectionElement(
                id,
                getMappingHeaderName(drillItem),
                getMappingHeaderUri(drillItem),
                "",
            );
        }

        const headerLocalIdentifier = getMappingHeaderLocalIdentifier(drillItem);
        const headerIdentifier = getMappingHeaderIdentifier(drillItem) || "";
        const uriAndIdentifier = headerLocalIdentifier
            ? getMasterMeasureObjQualifier(afm, headerLocalIdentifier)
            : null;

        const headerUri = getMappingHeaderUri(drillItem) || "";
        const uri = uriAndIdentifier?.uri || headerUri;
        const identifier = uriAndIdentifier?.identifier || headerIdentifier;
        const id = headerLocalIdentifier || headerIdentifier;

        return createDrillIntersectionElement(
            id,
            getMappingHeaderName(drillItem),
            uri,
            identifier,
            getMappingHeaderType(drillItem),
        );
    });
};

const convertMeasureHeaderItem = (
    header: DrillEventIntersectionElementHeader,
    afm: IAfm,
): ILegacyDrillEventIntersectionElement => {
    if (!isMeasureDescriptor(header)) {
        throw new Error("Converting wrong item type, IMeasureDescriptor expected!");
    }

    const { localIdentifier, name, uri: headerUri, identifier: headerIdentifier } = header.measureHeaderItem;

    const masterMeasureQualifier = getMasterMeasureObjQualifier(afm, localIdentifier);

    if (!masterMeasureQualifier) {
        throw new Error("The measure ids has not been found in execution request!");
    }

    const id: string = localIdentifier;
    const uri = masterMeasureQualifier.uri || headerUri;
    const identifier = masterMeasureQualifier.identifier || headerIdentifier;
    return createDrillIntersectionElement(id, name, uri, identifier, getMappingHeaderType(header));
};

const convertDrillIntersectionToLegacy = (
    intersection: IDrillEventIntersectionElement[],
    afm: IAfm,
): ILegacyDrillEventIntersectionElement[] => {
    return intersection.map((intersectionItem) => {
        const { header } = intersectionItem;
        if (isDrillIntersectionAttributeItem(header)) {
            const { uri: itemUri, name } = header.attributeHeaderItem;
            const { uri, identifier } = header.attributeHeader;
            return createDrillIntersectionElement(
                getAttributeElementIdFromAttributeElementUri(itemUri),
                name,
                uri,
                identifier,
                getMappingHeaderType({ attributeHeader: header.attributeHeader }),
            );
        }
        return convertMeasureHeaderItem(header, afm);
    });
};

export const transformDrillEventToLegacy = (drillEvent: IDrillEvent): ILegacyDrillEvent => {
    const afm = convertAfm(
        BearToBackendConvertors.toAfmExecution(drillEvent.dataView.definition).execution.afm,
    );
    const converter =
        drillEvent.drillContext.type === TABLE
            ? convertTableDrillIntersectionToLegacy
            : convertDrillIntersectionToLegacy;

    const intersection = drillEvent.drillContext.intersection
        ? converter(drillEvent.drillContext.intersection, afm)
        : undefined;

    const points = drillEvent.drillContext.points?.map((p): ILegacyDrillPoint => ({
        ...p,
        intersection: p.intersection ? converter(p.intersection, afm) : undefined,
    }));

    return {
        // when a part is absent the sdk-shaped original stays in place — pre-existing behaviour the
        // legacy context type cannot express
        drillContext: {
            ...drillEvent.drillContext,
            ...(intersection ? { intersection } : {}),
            ...(points ? { points } : {}),
        } as ILegacyDrillEventContext,
        executionContext: afm,
    };
};
