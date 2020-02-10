// (C) 2019-2020 GoodData Corporation
import { IMetadataObject } from "./types";
export { IMetadataObjectBuilder, MetadataObjectBuilder } from "./factory";

import { IAttributeMetadataObject } from "./attribute";
import { IAttributeDisplayFormMetadataObject } from "./attributeDisplayForm";
import { IFactMetadataObject } from "./fact";
import { IMeasureMetadataObject } from "./measure";
import { IDataSetMetadataObject } from "./dataSet";

export { AttributeMetadataObjectBuilder, newAttributeMetadataObject } from "./attribute/factory";
export {
    AttributeDisplayFormMetadataObjectBuilder,
    newAttributeDisplayFormMetadataObject,
} from "./attributeDisplayForm/factory";
export { FactMetadataObjectBuilder, newFactMetadataObject } from "./fact/factory";
export { MeasureMetadataObjectBuilder, newMeasureMetadataObject } from "./measure/factory";
export { DataSetMetadataObjectBuilder, newDataSetMetadataObject } from "./dataSet/factory";

export {
    IMetadataObject,
    IAttributeMetadataObject,
    IAttributeDisplayFormMetadataObject,
    IFactMetadataObject,
    IMeasureMetadataObject,
    IDataSetMetadataObject,
};

/**
 * @public
 */
export type MetadataObject =
    | IAttributeMetadataObject
    | IAttributeDisplayFormMetadataObject
    | IFactMetadataObject
    | IMeasureMetadataObject
    | IDataSetMetadataObject;

/**
 * @public
 */
export const metadataObjectId = <T extends IMetadataObject>(metadataObject: T) => {
    return metadataObject.id;
};
