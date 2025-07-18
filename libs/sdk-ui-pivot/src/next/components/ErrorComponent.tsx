// (C) 2025 GoodData Corporation
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
export function ErrorComponent({ error }: IErrorComponentProps) {
    return <pre>{JSON.stringify(error, null, 2)}</pre>;
}
