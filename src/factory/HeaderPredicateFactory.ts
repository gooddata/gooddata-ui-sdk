// (C) 2007-2018 GoodData Corporation
import { AFM, Execution } from "@gooddata/typings";
import {
    findMeasureByLocalIdentifier,
    getMasterMeasureLocalIdentifier,
    isDerivedMeasure,
} from "../helpers/afmHelper";
import {
    findMeasureHeaderByLocalIdentifier,
    findMeasureGroupInDimensions,
} from "../helpers/executionResultHelper";
import {
    getMappingHeaderIdentifier,
    getMappingHeaderLocalIdentifier,
    getMappingHeaderUri,
    hasMappingHeaderLocalIdentifier,
} from "../helpers/mappingHeader";
import { IHeaderPredicate, IHeaderPredicateContext } from "../interfaces/HeaderPredicate";
import {
    IMappingHeader,
    isMappingHeaderAttributeItem,
    isMappingHeaderMeasureItem,
} from "../interfaces/MappingHeader";

function arithmeticMeasureLocalIdentifierDeepMatch(
    measures: AFM.IMeasure[],
    measureHeaders: Execution.IMeasureHeaderItem[],
    operandLocalIdentifier: string,
    predicate: IHeaderPredicate,
    context: IHeaderPredicateContext,
): boolean {
    const operandInAfm: AFM.IMeasure = measures.find(
        measure => measure.localIdentifier === operandLocalIdentifier,
    );
    const operandHeader: Execution.IMeasureHeaderItem = measureHeaders.find(
        header => getMappingHeaderLocalIdentifier(header) === operandLocalIdentifier,
    );

    if (AFM.isArithmeticMeasureDefinition(operandInAfm.definition)) {
        return operandInAfm.definition.arithmeticMeasure.measureIdentifiers.some(operandLocalIdentifier =>
            arithmeticMeasureLocalIdentifierDeepMatch(
                measures,
                measureHeaders,
                operandLocalIdentifier,
                predicate,
                context,
            ),
        );
    }

    return predicate(operandHeader, context);
}

function getMasterMeasureOperandIdentifiers(measure: AFM.IMeasure): string[] {
    if (AFM.isArithmeticMeasureDefinition(measure.definition)) {
        return measure.definition.arithmeticMeasure.measureIdentifiers;
    }

    return null;
}

function getDerivedMeasureMasterMeasureOperandIdentifiers(measure: AFM.IMeasure, afm: AFM.IAfm): string[] {
    if (!isDerivedMeasure(measure)) {
        return null;
    }

    const masterMeasureLocalIdentifier = getMasterMeasureLocalIdentifier(measure);
    const masterMeasure = findMeasureByLocalIdentifier(afm, masterMeasureLocalIdentifier);

    return getMasterMeasureOperandIdentifiers(masterMeasure);
}

function composedFromQualifier(predicate: IHeaderPredicate): IHeaderPredicate {
    return (header: IMappingHeader, context: IHeaderPredicateContext): boolean => {
        if (!isMappingHeaderMeasureItem(header)) {
            return false;
        }

        const { afm, executionResponse } = context;
        const measureLocalIdentifier = getMappingHeaderLocalIdentifier(header);
        const measureInAFM = afm.measures.find(measure => {
            return measure.localIdentifier === measureLocalIdentifier;
        });

        if (!measureInAFM) {
            return false;
        }

        const arithmeticMeasureOperands =
            getDerivedMeasureMasterMeasureOperandIdentifiers(measureInAFM, afm) ||
            getMasterMeasureOperandIdentifiers(measureInAFM);

        if (!arithmeticMeasureOperands) {
            return false;
        }

        const measureGroup = findMeasureGroupInDimensions(executionResponse.dimensions);

        return arithmeticMeasureOperands.some(operandLocalIdentifier =>
            arithmeticMeasureLocalIdentifierDeepMatch(
                afm.measures,
                measureGroup.items,
                operandLocalIdentifier,
                predicate,
                context,
            ),
        );
    };
}

function getSimpleMeasureUri(afmMeasure: AFM.IMeasure): string {
    const { definition } = afmMeasure;
    if (!AFM.isSimpleMeasureDefinition(definition)) {
        return null;
    }
    if (AFM.isObjectUriQualifier(definition.measure.item)) {
        return definition.measure.item.uri;
    }
    return null;
}

function getSimpleMeasureIdentifier(afmMeasure: AFM.IMeasure): string {
    const { definition } = afmMeasure;
    if (!AFM.isSimpleMeasureDefinition(definition)) {
        return null;
    }
    if (AFM.isObjIdentifierQualifier(definition.measure.item)) {
        return definition.measure.item.identifier;
    }
    return null;
}

function findMeasureInAfmByHeader(header: IMappingHeader, afm: AFM.IAfm): AFM.IMeasure {
    const localIdentifier = getMappingHeaderLocalIdentifier(header);
    return findMeasureByLocalIdentifier(afm, localIdentifier);
}

function matchHeaderUri(uri: string, header: IMappingHeader): boolean {
    const headerUri = getMappingHeaderUri(header);
    return headerUri ? headerUri === uri : false;
}

function matchHeaderIdentifier(identifier: string, header: IMappingHeader): boolean {
    const headerIdentifier = getMappingHeaderIdentifier(header);
    return headerIdentifier ? headerIdentifier === identifier : false;
}

function matchAfmMeasureUri(uri: string, afmMeasure: AFM.IMeasure): boolean {
    const measureUri = getSimpleMeasureUri(afmMeasure);
    return measureUri ? measureUri === uri : false;
}

function matchAfmMeasureIdentifier(identifier: string, afmMeasure: AFM.IMeasure): boolean {
    const measureIdentifier = getSimpleMeasureIdentifier(afmMeasure);
    return measureIdentifier ? measureIdentifier === identifier : false;
}

function matchDerivedMeasureByMasterUri(
    uri: string,
    afmMeasure: AFM.IMeasure,
    context: IHeaderPredicateContext,
): boolean {
    const { afm, executionResponse } = context;
    const masterMeasureLocalIdentifier = getMasterMeasureLocalIdentifier(afmMeasure);
    const isDerived = !!masterMeasureLocalIdentifier;

    if (isDerived) {
        const masterMeasureHeader = findMeasureHeaderByLocalIdentifier(
            executionResponse,
            masterMeasureLocalIdentifier,
        );
        if (matchHeaderUri(uri, masterMeasureHeader)) {
            return true;
        }

        const masterMeasure = findMeasureByLocalIdentifier(afm, masterMeasureLocalIdentifier);
        return matchAfmMeasureUri(uri, masterMeasure);
    }
    return false;
}

function matchDerivedMeasureByMasterIdentifier(
    identifier: string,
    afmMeasure: AFM.IMeasure,
    context: IHeaderPredicateContext,
): boolean {
    const { afm, executionResponse } = context;
    const masterMeasureLocalIdentifier = getMasterMeasureLocalIdentifier(afmMeasure);
    const isDerived = !!masterMeasureLocalIdentifier;

    if (isDerived) {
        const masterMeasureHeader = findMeasureHeaderByLocalIdentifier(
            executionResponse,
            masterMeasureLocalIdentifier,
        );
        if (matchHeaderIdentifier(identifier, masterMeasureHeader)) {
            return true;
        }

        const masterMeasure = findMeasureByLocalIdentifier(afm, masterMeasureLocalIdentifier);
        return matchAfmMeasureIdentifier(identifier, masterMeasure);
    }
    return false;
}

export function uriMatch(uri: string): IHeaderPredicate {
    return (header: IMappingHeader, context: IHeaderPredicateContext): boolean => {
        if (matchHeaderUri(uri, header)) {
            return true;
        }

        if (!isMappingHeaderMeasureItem(header)) {
            return false;
        }

        const afmMeasure = findMeasureInAfmByHeader(header, context.afm);
        if (!afmMeasure) {
            return false;
        }

        if (matchAfmMeasureUri(uri, afmMeasure)) {
            return true;
        }

        return matchDerivedMeasureByMasterUri(uri, afmMeasure, context);
    };
}

export function identifierMatch(identifier: string): IHeaderPredicate {
    return (header: IMappingHeader, context: IHeaderPredicateContext): boolean => {
        if (isMappingHeaderAttributeItem(header)) {
            return false;
        }

        if (matchHeaderIdentifier(identifier, header)) {
            return true;
        }

        if (!isMappingHeaderMeasureItem(header)) {
            return false;
        }

        const afmMeasure = findMeasureInAfmByHeader(header, context.afm);
        if (!afmMeasure) {
            return false;
        }

        if (matchAfmMeasureIdentifier(identifier, afmMeasure)) {
            return true;
        }

        return matchDerivedMeasureByMasterIdentifier(identifier, afmMeasure, context);
    };
}

export function attributeItemNameMatch(name: string): IHeaderPredicate {
    return (header: IMappingHeader, _context: IHeaderPredicateContext): boolean => {
        return isMappingHeaderAttributeItem(header)
            ? header.attributeHeaderItem && header.attributeHeaderItem.name === name
            : false;
    };
}

export function localIdentifierMatch(localIdentifier: string): IHeaderPredicate {
    return (header: IMappingHeader, _context: IHeaderPredicateContext): boolean => {
        if (!hasMappingHeaderLocalIdentifier(header)) {
            return false;
        }
        const headerLocalIdentifier = getMappingHeaderLocalIdentifier(header);
        return headerLocalIdentifier && headerLocalIdentifier === localIdentifier;
    };
}

export function composedFromUri(uri: string): IHeaderPredicate {
    return composedFromQualifier(uriMatch(uri));
}

export function composedFromIdentifier(identifier: string): IHeaderPredicate {
    return composedFromQualifier(identifierMatch(identifier));
}
