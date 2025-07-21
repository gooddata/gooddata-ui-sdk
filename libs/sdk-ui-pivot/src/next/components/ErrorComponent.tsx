// (C) 2025 GoodData Corporation
import React from "react";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

/**
 * @alpha
 */
interface IErrorComponentProps {
    error: GoodDataSdkError;
}

/**
 * TODO: new ui-kit component
 *
 * @alpha
 */
export const ErrorComponent = (props: IErrorComponentProps) => {
    const { error } = props;
    return <pre>{JSON.stringify(error, null, 2)}</pre>;
};
