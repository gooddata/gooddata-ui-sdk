// (C) 2007-2020 GoodData Corporation
import { IHeaderPredicate, IHeaderPredicateContext } from "./HeaderPredicate";
import {
    getMappingHeaderIdentifier,
    getMappingHeaderLocalIdentifier,
    getMappingHeaderUri,
    hasMappingHeaderLocalIdentifier,
    IMappingHeader,
} from "./MappingHeader";
import {
    DataViewFacade,
    IMeasureDescriptor,
    isMeasureDescriptor,
    isResultAttributeHeader,
} from "@gooddata/sdk-backend-spi";
import {
    IMeasure,
    isArithmeticMeasure,
    measureArithmeticOperands,
    measureIdentifier,
    measureLocalId,
    measureMasterIdentifier,
    measureUri,
} from "@gooddata/sdk-model";

function arithmeticMeasureLocalIdentifierDeepMatch(
    dv: DataViewFacade,
    operandLocalIdentifier: string,
    predicate: IHeaderPredicate,
    context: IHeaderPredicateContext,
): boolean {
    const operand: IMeasure = dv.measure(operandLocalIdentifier);
    const operandDescriptor: IMeasureDescriptor = dv.measureDescriptor(operandLocalIdentifier);

    if (isArithmeticMeasure(operand)) {
        const operands = measureArithmeticOperands(operand);

        return (operands ? operands : []).some(operandLocalIdentifier =>
            arithmeticMeasureLocalIdentifierDeepMatch(dv, operandLocalIdentifier, predicate, context),
        );
    }

    return predicate(operandDescriptor, context);
}

function getMasterMeasureOperandIdentifiers(measure: IMeasure): string[] {
    return measureArithmeticOperands(measure);
}

function getDerivedMeasureMasterMeasureOperandIdentifiers(measure: IMeasure, dv: DataViewFacade): string[] {
    const masterMeasureLocalIdentifier = measureMasterIdentifier(measure);

    if (!masterMeasureLocalIdentifier) {
        return null;
    }

    const masterMeasure = dv.measure(masterMeasureLocalIdentifier);

    return getMasterMeasureOperandIdentifiers(masterMeasure);
}

function composedFromQualifier(predicate: IHeaderPredicate): IHeaderPredicate {
    return (header: IMappingHeader, context: IHeaderPredicateContext): boolean => {
        if (!isMeasureDescriptor(header)) {
            return false;
        }

        const { dv } = context;
        const measureLocalIdentifier = getMappingHeaderLocalIdentifier(header);
        const measure = dv.measure(measureLocalIdentifier);

        if (!measure) {
            return false;
        }

        const arithmeticMeasureOperands =
            getDerivedMeasureMasterMeasureOperandIdentifiers(measure, dv) ||
            getMasterMeasureOperandIdentifiers(measure);

        if (!arithmeticMeasureOperands) {
            return false;
        }

        return arithmeticMeasureOperands.some(operandLocalIdentifier =>
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
    const isDerived = !!masterMeasureLocalIdentifier;

    if (isDerived) {
        const masterMeasureHeader = dv.measureDescriptor(masterMeasureLocalIdentifier);

        if (matchHeaderUri(uri, masterMeasureHeader)) {
            return true;
        }

        const masterMeasure = dv.measure(masterMeasureLocalIdentifier);

        return matchUri(uri, masterMeasure);
    }
    return false;
}

function matchDerivedMeasureByMasterIdentifier(
    identifier: string,
    measure: IMeasure,
    context: IHeaderPredicateContext,
): boolean {
    const { dv } = context;
    const masterMeasureLocalIdentifier = measureMasterIdentifier(measure);
    const isDerived = !!masterMeasureLocalIdentifier;

    if (isDerived) {
        const masterMeasureHeader = dv.measureDescriptor(masterMeasureLocalIdentifier);

        if (matchHeaderIdentifier(identifier, masterMeasureHeader)) {
            return true;
        }

        const masterMeasure = dv.measure(masterMeasureLocalIdentifier);

        return matchMeasureIdentifier(identifier, masterMeasure);
    }
    return false;
}

export function uriMatch(uri: string): IHeaderPredicate {
    return (header: IMappingHeader, context: IHeaderPredicateContext): boolean => {
        const { dv } = context;

        if (matchHeaderUri(uri, header)) {
            return true;
        }

        if (!isMeasureDescriptor(header)) {
            return false;
        }

        const measure = dv.measure(getMappingHeaderLocalIdentifier(header));
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
 * TODO: SDK8: add docs
 *
 * @public
 */
export function identifierMatch(identifier: string): IHeaderPredicate {
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

        const measure = dv.measure(getMappingHeaderLocalIdentifier(header));

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
 * TODO: SDK8: add docs
 *
 * @public
 */
export function attributeItemNameMatch(name: string): IHeaderPredicate {
    return (header: IMappingHeader, _context: IHeaderPredicateContext): boolean => {
        return isResultAttributeHeader(header)
            ? header.attributeHeaderItem && header.attributeHeaderItem.name === name
            : false;
    };
}

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export function localIdentifierMatch(localIdOrMeasure: string | IMeasure): IHeaderPredicate {
    const localId =
        typeof localIdOrMeasure === "string" ? localIdOrMeasure : measureLocalId(localIdOrMeasure);

    return (header: IMappingHeader, _context: IHeaderPredicateContext): boolean => {
        if (!hasMappingHeaderLocalIdentifier(header)) {
            return false;
        }
        const headerLocalIdentifier = getMappingHeaderLocalIdentifier(header);
        return headerLocalIdentifier && headerLocalIdentifier === localId;
    };
}

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export function composedFromUri(uri: string): IHeaderPredicate {
    return composedFromQualifier(uriMatch(uri));
}

/**
 * TODO: SDK8: add docs
 *
 * @public
 */
export function composedFromIdentifier(identifier: string): IHeaderPredicate {
    return composedFromQualifier(identifierMatch(identifier));
}
