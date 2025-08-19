// (C) 2019-2025 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import isNil from "lodash/isNil.js";

import { ObjectType } from "../../objRef/index.js";

/**
 * @beta
 */
export interface IMdObjectIdentity {
    /**
     * Type of metadata object
     */
    type: ObjectType;

    /**
     * Metadata object identifier
     */
    id: string;
}

/**
 * @beta
 */
export interface IMdObjectBase {
    /**
     * Title
     */
    title?: string;

    /**
     * Description
     */
    description?: string;

    /**
     * Tags
     */
    tags?: string[];
}

/**
 * Shared metadata object properties.
 * This type represents metadata object with unique id assigned to it.
 * Typically metadata object, that is already persisted on the backend.
 *
 * @beta
 */
export interface IMdObject extends IMdObjectBase, IMdObjectIdentity {}

/**
 * Metadata object definition.
 * This type represents metadata object without unique id assigned to it.
 * Typically metadata object, that is not yet persisted on the backend.
 *
 * @beta
 */
export interface IMdObjectDefinition extends IMdObjectBase, Pick<IMdObjectIdentity, "type"> {}

/**
 * Utility type to get {@link IMdObjectDefinition} from {@link IMdObject}.
 *
 * @beta
 */
export type ToMdObjectDefinition<T extends IMdObject> = Omit<T, "id">;

/**
 * Type guard checking whether input is an instance of {@link IMdObject}.
 *
 * @beta
 */
export function isMdObject(obj: unknown): obj is IMdObject {
    const c = obj as IMdObject;
    const isDefined = !isEmpty(c);
    const hasType = !isNil(c.type);
    const hasId = !isNil(c.id);

    return isDefined && hasType && hasId;
}

/**
 * Type guard checking whether input is an instance of {@link IMdObjectDefinition}.
 *
 * @beta
 */
export function isMdObjectDefinition(obj: unknown): obj is IMdObjectDefinition {
    const c = obj as IMdObjectDefinition;
    const isDefined = !isEmpty(c);
    const hasType = !isNil(c.type);
    const hasNotId = isNil((c as IMdObject).id);

    return isDefined && hasType && hasNotId;
}
