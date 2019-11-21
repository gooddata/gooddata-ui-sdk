// (C) 2019 GoodData Corporation
import { IAttributeElement } from "./attributeElement";
import { IObjectMeta } from "./objectMeta";
/**
 * @public
 */
export interface IObjectExpressionToken {
    type: "metadataObject";
    value: string;
    meta: IObjectMeta;
}

/**
 * @public
 */
export interface IAttributeElementExpressionToken {
    type: "attributeElement";
    value: string;
    element: IAttributeElement;
}

/**
 * @public
 */
export interface ITextExpressionToken {
    type: "text";
    value: string;
}

/**
 * @public
 */
export type IMeasureExpressionToken =
    | IObjectExpressionToken
    | IAttributeElementExpressionToken
    | ITextExpressionToken;
