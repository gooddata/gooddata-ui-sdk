// (C) 2007-2018 GoodData Corporation
import { Execution } from '@gooddata/typings';
import { IMappingHeader } from '../interfaces/Config';

function isAttributeHeader(headerItem: IMappingHeader): headerItem is Execution.IResultAttributeHeaderItem {
    return (headerItem as Execution.IResultAttributeHeaderItem).attributeHeaderItem !== undefined;
}

function isMeasureHeader(headerItem: IMappingHeader): headerItem is Execution.IMeasureHeaderItem {
    return (headerItem as Execution.IMeasureHeaderItem).measureHeaderItem !== undefined;
}

export function getAttributeItemNamePredicate(name: string) {
    return (headerItem: IMappingHeader) => {
        return isAttributeHeader(headerItem)
            ? headerItem.attributeHeaderItem && (headerItem.attributeHeaderItem.name === name)
            : false;
    };
}

export function getMeasureLocalIdentifierPredicate(localIdentifier: string) {
    return (headerItem: IMappingHeader) => {
        return isMeasureHeader(headerItem)
            ? headerItem.measureHeaderItem && (headerItem.measureHeaderItem.localIdentifier === localIdentifier)
            : false;
    };
}

export function getUniversalPredicate(id: string, references: any) {
    return (headerItem: IMappingHeader) => {
        const attributeItemUri = references[id];
        if (attributeItemUri && isAttributeHeader(headerItem)) {
            return attributeItemUri === headerItem.attributeHeaderItem.uri;
        }

        return isMeasureHeader(headerItem) && headerItem.measureHeaderItem.localIdentifier === id;
    };
}
