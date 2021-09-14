// (C) 2021 GoodData Corporation
import { IUser } from "../user";

/**
 * Object that can provide information about the users that created or modified it and when those actions occurred.
 * @public
 */
export interface IAuditable {
    /**
     * Creation date - YYYY-MM-DD HH:mm:ss
     */
    created?: string;

    /**
     * User id of the user that created the object.
     */
    createdBy?: IUser;

    /**
     * Last update date - YYYY-MM-DD HH:mm:ss
     */
    updated?: string;

    /**
     * User id of the user that last modified the object.
     */
    updatedBy?: IUser;
}
