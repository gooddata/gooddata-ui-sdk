// (C) 2007-2018 GoodData Corporation
import {
    getMappingHeaderIdentifier,
    getMappingHeaderLocalIdentifier,
    getMappingHeaderUri,
    hasMappingHeaderLocalIdentifier,
} from "../helpers/mappingHeader";
import { IHeaderPredicate2, IHeaderPredicateContext2 } from "../interfaces/HeaderPredicate";
import { IMappingHeader } from "../interfaces/MappingHeader";
import {
    DataViewFacade,
    IMeasureHeaderItem,
    isMeasureHeaderItem,
    isResultAttributeHeaderItem,
} from "@gooddata/sdk-backend-spi";
import {
    IMeasure,
    isArithmeticMeasure,
    measureArithmeticOperands,
    measureIdentifier,
    measureMasterIdentifier,
    measureUri,
} from "@gooddata/sdk-model";

function arithmeticMeasureLocalIdentifierDeepMatch(
    dv: DataViewFacade,
    operandLocalIdentifier: string,
    predicate: IHeaderPredicate2,
    context: IHeaderPredicateContext2,
): boolean {
    const operand: IMeasure = dv.measure(operandLocalIdentifier);
    const operandHeader: IMeasureHeaderItem = dv.measureGroupHeaderItem(operandLocalIdentifier);

    if (isArithmeticMeasure(operand)) {
        const operands = measureArithmeticOperands(operand);

        return (operands ? operands : []).some(operandLocalIdentifier =>
            arithmeticMeasureLocalIdentifierDeepMatch(dv, operandLocalIdentifier, predicate, context),
        );
    }

    return predicate(operandHeader, context);
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

function composedFromQualifier(predicate: IHeaderPredicate2): IHeaderPredicate2 {
    return (header: IMappingHeader, context: IHeaderPredicateContext2): boolean => {
        if (!isMeasureHeaderItem(header)) {
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
    context: IHeaderPredicateContext2,
): boolean {
    const { dv } = context;
    const masterMeasureLocalIdentifier = measureMasterIdentifier(measure);
    const isDerived = !!masterMeasureLocalIdentifier;

    if (isDerived) {
        const masterMeasureHeader = dv.measureGroupHeaderItem(masterMeasureLocalIdentifier);

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
    context: IHeaderPredicateContext2,
): boolean {
    const { dv } = context;
    const masterMeasureLocalIdentifier = measureMasterIdentifier(measure);
    const isDerived = !!masterMeasureLocalIdentifier;

    if (isDerived) {
        const masterMeasureHeader = dv.measureGroupHeaderItem(masterMeasureLocalIdentifier);

        if (matchHeaderIdentifier(identifier, masterMeasureHeader)) {
            return true;
        }

        const masterMeasure = dv.measure(masterMeasureLocalIdentifier);

        return matchMeasureIdentifier(identifier, masterMeasure);
    }
    return false;
}

export function uriMatch(uri: string): IHeaderPredicate2 {
    return (header: IMappingHeader, context: IHeaderPredicateContext2): boolean => {
        const { dv } = context;

        if (matchHeaderUri(uri, header)) {
            return true;
        }

        if (!isMeasureHeaderItem(header)) {
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

export function identifierMatch(identifier: string): IHeaderPredicate2 {
    return (header: IMappingHeader, context: IHeaderPredicateContext2): boolean => {
        const { dv } = context;
        if (isResultAttributeHeaderItem(header)) {
            return false;
        }

        if (matchHeaderIdentifier(identifier, header)) {
            return true;
        }

        if (!isMeasureHeaderItem(header)) {
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

export function attributeItemNameMatch(name: string): IHeaderPredicate2 {
    return (header: IMappingHeader, _context: IHeaderPredicateContext2): boolean => {
        return isResultAttributeHeaderItem(header)
            ? header.attributeHeaderItem && header.attributeHeaderItem.name === name
            : false;
    };
}

export function localIdentifierMatch(localIdentifier: string): IHeaderPredicate2 {
    return (header: IMappingHeader, _context: IHeaderPredicateContext2): boolean => {
        if (!hasMappingHeaderLocalIdentifier(header)) {
            return false;
        }
        const headerLocalIdentifier = getMappingHeaderLocalIdentifier(header);
        return headerLocalIdentifier && headerLocalIdentifier === localIdentifier;
    };
}

export function composedFromUri(uri: string): IHeaderPredicate2 {
    return composedFromQualifier(uriMatch(uri));
}

export function composedFromIdentifier(identifier: string): IHeaderPredicate2 {
    return composedFromQualifier(identifierMatch(identifier));
}
