// (C) 2007-2022 GoodData Corporation
import { IHeaderPredicate, IHeaderPredicateContext } from "./HeaderPredicate.js";
import {
    getMappingHeaderIdentifier,
    getMappingHeaderLocalIdentifier,
    getMappingHeaderUri,
    hasMappingHeaderLocalIdentifier,
    IMappingHeader,
} from "./MappingHeader.js";
import {
    attributeDisplayFormRef,
    attributeLocalId,
    IMeasure,
    isArithmeticMeasure,
    isAttribute,
    isIdentifierRef,
    isObjRef,
    isSimpleMeasure,
    measureArithmeticOperands,
    measureIdentifier,
    measureItem,
    measureLocalId,
    measureMasterIdentifier,
    measureUri,
    ObjRef,
    IMeasureDescriptor,
    isMeasureDescriptor,
    isResultAttributeHeader,
} from "@gooddata/sdk-model";
import { DataViewFacade } from "../results/facade.js";

/**
 * This predicate is returned when predicate factory encounters invalid input. Having it to keep backward
 * compatibility with the previous more lenient behavior.
 */
const alwaysFalsePredicate = () => false;

function arithmeticMeasureLocalIdentifierDeepMatch(
    dv: DataViewFacade,
    operandLocalIdentifier: string,
    predicate: IHeaderPredicate,
    context: IHeaderPredicateContext,
): boolean {
    const operand: IMeasure = dv.def().measure(operandLocalIdentifier)!;
    const operandDescriptor: IMeasureDescriptor = dv.meta().measureDescriptor(operandLocalIdentifier)!;

    if (isArithmeticMeasure(operand)) {
        const operands = measureArithmeticOperands(operand);

        return (operands ? operands : []).some((operandLocalIdentifier) =>
            arithmeticMeasureLocalIdentifierDeepMatch(dv, operandLocalIdentifier, predicate, context),
        );
    }

    return predicate(operandDescriptor, context);
}

function getMasterMeasureOperandIdentifiers(measure: IMeasure): string[] | undefined {
    return measureArithmeticOperands(measure);
}

function getDerivedMeasureMasterMeasureOperandIdentifiers(
    measure: IMeasure,
    dv: DataViewFacade,
): string[] | null {
    const masterMeasureLocalIdentifier = measureMasterIdentifier(measure);

    if (!masterMeasureLocalIdentifier) {
        return null;
    }

    const masterMeasure = dv.def().measure(masterMeasureLocalIdentifier)!;

    const result = getMasterMeasureOperandIdentifiers(masterMeasure);

    if (result === undefined) {
        return null;
    }

    return result;
}

function composedFromQualifier(predicate: IHeaderPredicate): IHeaderPredicate {
    return (header: IMappingHeader, context: IHeaderPredicateContext): boolean => {
        if (!isMeasureDescriptor(header)) {
            return false;
        }

        const { dv } = context;
        const measureLocalIdentifier = getMappingHeaderLocalIdentifier(header);
        const measure = dv.def().measure(measureLocalIdentifier);

        if (!measure) {
            return false;
        }

        const arithmeticMeasureOperands =
            getDerivedMeasureMasterMeasureOperandIdentifiers(measure, dv) ||
            getMasterMeasureOperandIdentifiers(measure);

        if (!arithmeticMeasureOperands) {
            return false;
        }

        return arithmeticMeasureOperands.some((operandLocalIdentifier) =>
            arithmeticMeasureLocalIdentifierDeepMatch(dv, operandLocalIdentifier, predicate, context),
        );
    };
}

function matchHeaderUri(uri: string, header: IMappingHeader): boolean {
    const headerUri = getMappingHeaderUri(header);
    return headerUri ? headerUri === uri : false;
}

function matchHeaderIdentifier(identifier: string, header: IMappingHeader): boolean {
    const headerIdentifier = getMappingHeaderIdentifier(header);
    return headerIdentifier ? headerIdentifier === identifier : false;
}

function matchUri(uri: string, measure: IMeasure): boolean {
    const simpleMeasureUri = measureUri(measure);
    return simpleMeasureUri ? simpleMeasureUri === uri : false;
}

function matchMeasureIdentifier(identifier: string, measure: IMeasure): boolean {
    const simpleMeasureIdentifier = measureIdentifier(measure);
    return simpleMeasureIdentifier ? simpleMeasureIdentifier === identifier : false;
}

function matchDerivedMeasureByMasterUri(
    uri: string,
    measure: IMeasure,
    context: IHeaderPredicateContext,
): boolean {
    const { dv } = context;
    const masterMeasureLocalIdentifier = measureMasterIdentifier(measure);

    if (masterMeasureLocalIdentifier === undefined) {
        return false;
    }

    const masterMeasureHeader = dv.meta().measureDescriptor(masterMeasureLocalIdentifier)!;

    if (matchHeaderUri(uri, masterMeasureHeader)) {
        return true;
    }

    const masterMeasure = dv.def().measure(masterMeasureLocalIdentifier)!;

    return matchUri(uri, masterMeasure);
}

function matchDerivedMeasureByMasterIdentifier(
    identifier: string,
    measure: IMeasure,
    context: IHeaderPredicateContext,
): boolean {
    const { dv } = context;
    const masterMeasureLocalIdentifier = measureMasterIdentifier(measure);

    if (masterMeasureLocalIdentifier === undefined) {
        return false;
    }

    const masterMeasureHeader = dv.meta().measureDescriptor(masterMeasureLocalIdentifier)!;

    if (matchHeaderIdentifier(identifier, masterMeasureHeader)) {
        return true;
    }

    const masterMeasure = dv.def().measure(masterMeasureLocalIdentifier)!;

    return matchMeasureIdentifier(identifier, masterMeasure);
}

/**
 * Creates a new predicate that returns true for any header that belongs to either attribute or measure with the
 * provided URI.
 *
 * @public
 */
export function uriMatch(uri: string): IHeaderPredicate {
    if (!uri) {
        return alwaysFalsePredicate;
    }

    return (header: IMappingHeader, context: IHeaderPredicateContext): boolean => {
        const { dv } = context;

        if (matchHeaderUri(uri, header)) {
            return true;
        }

        if (!isMeasureDescriptor(header)) {
            return false;
        }

        const measure = dv.def().measure(getMappingHeaderLocalIdentifier(header));
        if (!measure) {
            return false;
        }

        if (matchUri(uri, measure)) {
            return true;
        }

        return matchDerivedMeasureByMasterUri(uri, measure, context);
    };
}

/**
 * Creates a new predicate that returns true for any header that belongs to either attribute or measure with the
 * provided identifier.
 *
 * @public
 */
export function identifierMatch(identifier: string): IHeaderPredicate {
    if (!identifier) {
        return alwaysFalsePredicate;
    }

    return (header: IMappingHeader, context: IHeaderPredicateContext): boolean => {
        const { dv } = context;
        if (isResultAttributeHeader(header)) {
            return false;
        }

        if (matchHeaderIdentifier(identifier, header)) {
            return true;
        }

        if (!isMeasureDescriptor(header)) {
            return false;
        }

        const measure = dv.def().measure(getMappingHeaderLocalIdentifier(header));

        if (!measure) {
            return false;
        }

        if (matchMeasureIdentifier(identifier, measure)) {
            return true;
        }

        return matchDerivedMeasureByMasterIdentifier(identifier, measure, context);
    };
}

/**
 * Creates a predicate that return true for any attribute result header with the provided name.
 *
 * @public
 */
export function attributeItemNameMatch(name: string): IHeaderPredicate {
    if (!name) {
        return alwaysFalsePredicate;
    }

    return (header: IMappingHeader, _context: IHeaderPredicateContext): boolean => {
        return isResultAttributeHeader(header)
            ? header.attributeHeaderItem && header.attributeHeaderItem.name === name
            : false;
    };
}

/**
 * Creates a new predicate that returns true for any header that belongs to either attribute or measure with the
 * provided local identifier.
 *
 * @public
 */
export function localIdentifierMatch(localIdOrMeasure: string | IMeasure): IHeaderPredicate {
    if (!localIdOrMeasure) {
        return alwaysFalsePredicate;
    }

    const localId =
        typeof localIdOrMeasure === "string" ? localIdOrMeasure : measureLocalId(localIdOrMeasure);

    return (header: IMappingHeader, _context: IHeaderPredicateContext): boolean => {
        if (!hasMappingHeaderLocalIdentifier(header)) {
            return false;
        }
        const headerLocalIdentifier = getMappingHeaderLocalIdentifier(header);

        return headerLocalIdentifier !== undefined && headerLocalIdentifier === localId;
    };
}

/**
 * Creates a new predicate that returns true for any header that belongs to either attribute or measure with the
 * provided object reference.
 *
 * @public
 */
export function objRefMatch(objRef: ObjRef): IHeaderPredicate {
    return isIdentifierRef(objRef)
        ? HeaderPredicates.identifierMatch(objRef.identifier)
        : HeaderPredicates.uriMatch(objRef.uri);
}

/**
 * Creates a new predicate that returns true for any header that belongs to either attribute or measure matching
 * the provided object.
 *
 * @remarks
 * If the object is empty or is not attribute, simple measure or object reference, the function returns predicate
 * that is always falsy.
 *
 * @param obj - the object to be checked
 *
 * @public
 */
export function objMatch(obj: any): IHeaderPredicate {
    if (!obj) {
        return alwaysFalsePredicate;
    }

    if (isAttribute(obj)) {
        return (header, context) =>
            localIdentifierMatch(attributeLocalId(obj))(header, context) ||
            objRefMatch(attributeDisplayFormRef(obj))(header, context);
    }

    if (isSimpleMeasure(obj)) {
        return (header, context) =>
            localIdentifierMatch(measureLocalId(obj))(header, context) ||
            objRefMatch(measureItem(obj))(header, context);
    }

    if (isObjRef(obj)) {
        return objRefMatch(obj);
    }

    return alwaysFalsePredicate;
}

/**
 * Creates a new predicate that returns true of any arithmetic measure where measure with the provided URI
 * is used as an operand.
 *
 * @public
 */
export function composedFromUri(uri: string): IHeaderPredicate {
    if (!uri) {
        return alwaysFalsePredicate;
    }

    return composedFromQualifier(uriMatch(uri));
}

/**
 * Creates a new predicate that returns true of any arithmetic measure where measure with the provided identifier
 * is used as an operand.
 *
 * @public
 */
export function composedFromIdentifier(identifier: string): IHeaderPredicate {
    if (!identifier) {
        return alwaysFalsePredicate;
    }

    return composedFromQualifier(identifierMatch(identifier));
}

/**
 * Set of factory functions to create the most commonly-used {@link IHeaderPredicate | HeaderPredicates}.
 *
 * @public
 */
export const HeaderPredicates = {
    attributeItemNameMatch,
    composedFromIdentifier,
    composedFromUri,
    identifierMatch,
    localIdentifierMatch,
    uriMatch,
    objRefMatch,
    objMatch,
};
