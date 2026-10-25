// (C) 2020-2026 GoodData Corporation

import {
    type BuilderModifications,
    type MetadataObjectBuilder,
    newCatalogAttribute,
    newCatalogFact,
    newCatalogMeasure,
} from "@gooddata/sdk-backend-base";
import {
    type AccessGranularPermission,
    type ICatalogAttribute,
    type ICatalogFact,
    type ICatalogMeasure,
    type IMetadataObject,
    type ObjRef,
    idRef,
} from "@gooddata/sdk-model";

interface IItemBase {
    ref: ObjRef;
    id: string;
    uri: string;
    title: string;
}

export const generateItemBase = (index: number, type: string): IItemBase => {
    const id = `${type}${index}.identifier`;
    return {
        ref: idRef(id),
        id,
        uri: `uri/${type}${index}`,
        title: `${type} ${index}`,
    };
};

const itemBaseToCommonModifications =
    <TItem extends IMetadataObject, TBuilder extends MetadataObjectBuilder<TItem>>(
        itemBase: IItemBase,
    ): BuilderModifications<TBuilder, TItem> =>
    (m) =>
        m.id(itemBase.id).uri(itemBase.uri).title(itemBase.title);

export const getCatalogMeasure = (index: number): ICatalogMeasure =>
    newCatalogMeasure((catalogM) => {
        const measureBase = generateItemBase(index, "measure");
        return catalogM.measure(measureBase.ref, (m) =>
            m.modify(itemBaseToCommonModifications(measureBase)).format("").expression(""),
        );
    });

export const catalogMeasure = getCatalogMeasure(1);

/** A catalog metric carrying its object-level permissions, or none when they were not asked for. */
export const getCatalogMeasureWithPermissions = (
    index: number,
    permissions?: AccessGranularPermission[],
): ICatalogMeasure => {
    const measure = getCatalogMeasure(index);
    return { ...measure, measure: { ...measure.measure, permissions } };
};

export const getCatalogFact = (index: number): ICatalogFact =>
    newCatalogFact((catalogF) => {
        const factBase = generateItemBase(index, "fact");
        return catalogF.fact(factBase.ref, (f) => f.modify(itemBaseToCommonModifications(factBase)));
    });

export const catalogFact = getCatalogFact(1);

export const getCatalogAttribute = (index: number): ICatalogAttribute =>
    newCatalogAttribute((catalogF) => {
        const attributeBase = generateItemBase(index, "attribute");
        const displayFormBase = generateItemBase(index, "displayForm");

        return catalogF
            .attribute(attributeBase.ref, (f) => f.modify(itemBaseToCommonModifications(attributeBase)))
            .defaultDisplayForm(displayFormBase.ref, (df) =>
                df.modify(itemBaseToCommonModifications(displayFormBase)).attribute(attributeBase.ref),
            )
            .geoPinDisplayForms([]);
    });

export const catalogAttribute = getCatalogAttribute(1);
