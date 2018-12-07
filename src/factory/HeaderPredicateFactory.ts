// (C) 2007-2018 GoodData Corporation
import { AFM } from '@gooddata/typings';
import { getMasterMeasureObjQualifier } from '../components/visualizations/utils/drilldownEventing';
import {
    getMappingHeaderIndentifier,
    getMappingHeaderLocalIdentifier,
    getMappingHeaderUri,
    hasMappingHeaderIndentifier,
    hasMappingHeaderLocalIdentifier
} from '../helpers/mappingHeader';
import { IHeaderPredicate } from '../interfaces/HeaderPredicate';
import { IMappingHeader, isMappingHeaderAttributeItem, isMappingHeaderMeasureItem } from '../interfaces/MappingHeader';

type IObjectQualifierPredicate = (qualifier: AFM.ObjQualifier) => boolean;

function arithmeticMeasureLocalIdentifierDeepMatch(
    measures: AFM.IMeasure[],
    operandLocalIdentifier: string,
    predicate: (qualifier: AFM.ObjQualifier) => boolean
): boolean {
    const operand: AFM.IMeasure = measures.find(measure => measure.localIdentifier === operandLocalIdentifier);

    if (AFM.isArithmeticMeasureDefinition(operand.definition)) {
        return operand.definition.arithmeticMeasure.measureIdentifiers.some(operandLocalIdentifier =>
            arithmeticMeasureLocalIdentifierDeepMatch(measures, operandLocalIdentifier, predicate));
    }

    if (AFM.isSimpleMeasureDefinition(operand.definition)) {
        return predicate(operand.definition.measure.item);
    }

    return false;
}

function composedFromQualifier(predicate: IObjectQualifierPredicate): IHeaderPredicate {
    return (header: IMappingHeader, afm: AFM.IAfm): boolean => {
        if (!isMappingHeaderMeasureItem(header)) {
            return false;
        }

        const measureLocalIdentifier = getMappingHeaderLocalIdentifier(header);
        const arithmeticMeasure = afm.measures.find((measure) => {
            return measure.localIdentifier === measureLocalIdentifier;
        });

        if (!arithmeticMeasure || !AFM.isArithmeticMeasureDefinition(arithmeticMeasure.definition)) {
            return;
        }

        return arithmeticMeasure.definition.arithmeticMeasure.measureIdentifiers.some(operandLocalIdentifier =>
            arithmeticMeasureLocalIdentifierDeepMatch(afm.measures, operandLocalIdentifier, predicate)
        );
    };
}

export function uriMatch(uri: string): IHeaderPredicate {
    return (header: IMappingHeader, afm: AFM.IAfm): boolean => {
        const headerUri = getMappingHeaderUri(header);
        if (headerUri && headerUri === uri) {
            return true;
        }

        if (!hasMappingHeaderLocalIdentifier(header)) {
            return false;
        }

        const headerLocalIdentifier = getMappingHeaderLocalIdentifier(header);
        if (headerLocalIdentifier) {
            const measureHeader = getMasterMeasureObjQualifier(afm, headerLocalIdentifier);
            return measureHeader && measureHeader.uri ? measureHeader.uri === uri : false;
        }

        return false;
    };
}

export function identifierMatch(identifier: string): IHeaderPredicate {
    return (header: IMappingHeader, afm: AFM.IAfm): boolean => {
        if (!hasMappingHeaderIndentifier(header)) {
            return false;
        }

        const headerIdentifier = getMappingHeaderIndentifier(header);
        if (headerIdentifier && headerIdentifier === identifier) {
            return true;
        }

        const headerLocalIdentifier = getMappingHeaderLocalIdentifier(header);
        if (headerLocalIdentifier) {
            const measureHeader = getMasterMeasureObjQualifier(afm, headerLocalIdentifier);
            return measureHeader && measureHeader.identifier ? measureHeader.identifier === identifier : false;
        }

        return false;
    };
}

export function attributeItemNameMatch(name: string): IHeaderPredicate  {
    return (header: IMappingHeader, _afm: AFM.IAfm): boolean => {
        return isMappingHeaderAttributeItem(header)
            ? header.attributeHeaderItem && (header.attributeHeaderItem.name === name)
            : false;
    };
}

export function localIdentifierMatch(localIdentifier: string): IHeaderPredicate  {
    return (header: IMappingHeader, _afm: AFM.IAfm): boolean => {
        if (!hasMappingHeaderLocalIdentifier(header)) {
            return false;
        }
        const headerLocalIdentifier = getMappingHeaderLocalIdentifier(header);
        return headerLocalIdentifier && headerLocalIdentifier === localIdentifier;
    };
}

export function composedFromUri(uri: string): IHeaderPredicate {
    return composedFromQualifier(
        qualifier => AFM.isObjectUriQualifier(qualifier) && qualifier.uri === uri
    );
}

export function composedFromIdentifier(identifier: string): IHeaderPredicate {
    return composedFromQualifier(
        qualifier => AFM.isObjIdentifierQualifier(qualifier) && qualifier.identifier === identifier
    );
}
