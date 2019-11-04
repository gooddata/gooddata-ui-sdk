// (C) 2019 GoodData Corporation
import { Identifier } from "../base";

/**
 * Attribute display form is a way that a certain attribute can be represented.
 * For example an attribute representing Employee can have a display form that shows Employee's ID
 * and another one that shows their full name.
 * @public
 */
export interface IAttributeDisplayForm {
    /**
     * Id of the attribute display form. The value is used to reference model elements independently of their URIs.
     */
    id: Identifier;

    /**
     * User friendly name of the attribute display form.
     */
    title: string;
}

/**
 * Gets the attribute display form's id.
 * @param displayForm - attribute display form to work with
 * @returns id of the attribute display form
 * @public
 */
export function attributeDisplayFormId(displayForm: IAttributeDisplayForm): string {
    return displayForm.id;
}

/**
 * Gets the attribute display form's title.
 * @param displayForm - attribute display form to work with
 * @returns title of the attribute display form
 * @public
 */
export function attributeDisplayFormTitle(displayForm: IAttributeDisplayForm): string {
    return displayForm.title;
}
