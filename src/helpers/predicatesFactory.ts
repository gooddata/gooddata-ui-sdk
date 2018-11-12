// (C) 2007-2018 GoodData Corporation
import { Execution } from '@gooddata/typings';
import { IMappingHeader } from '../interfaces/Config';

export function isAttributeHeaderItem(headerItem: IMappingHeader): headerItem is Execution.IResultAttributeHeaderItem {
    return (headerItem as Execution.IResultAttributeHeaderItem).attributeHeaderItem !== undefined;
}

export function isMeasureHeaderItem(headerItem: IMappingHeader): headerItem is Execution.IMeasureHeaderItem {
    return (headerItem as Execution.IMeasureHeaderItem).measureHeaderItem !== undefined;
}

export function getAttributeItemNamePredicate(name: string) {
    return (headerItem: IMappingHeader) => {
        return isAttributeHeaderItem(headerItem)
            ? headerItem.attributeHeaderItem && (headerItem.attributeHeaderItem.name === name)
            : false;
    };
}

export function getMeasureLocalIdentifierPredicate(localIdentifier: string) {
    return (headerItem: IMappingHeader) => {
        return isMeasureHeaderItem(headerItem)
            ? headerItem.measureHeaderItem && (headerItem.measureHeaderItem.localIdentifier === localIdentifier)
            : false;
    };
}

export function getUniversalPredicate(id: string, references: any) {
    return (headerItem: IMappingHeader) => {
        if (references) {
            const attributeItemUri = references[id];
            if (attributeItemUri && isAttributeHeaderItem(headerItem)) {
                return attributeItemUri === headerItem.attributeHeaderItem.uri;
            }
        }

        return isMeasureHeaderItem(headerItem) && headerItem.measureHeaderItem.localIdentifier === id;
    };
}
