// (C) 2019-2025 GoodData Corporation

import { ReactElement } from "react";

/**
 * @public
 */
export interface ISdkComponentProps {
    message: string;
}

/**
 * @public
 */
export function SdkComponent({ message }: ISdkComponentProps): ReactElement {
    return <p>{message}</p>;
}

/**
 * @internal
 */
export function functionInternalToThisComponent(input: string): string {
    return `Hello ${input}!`;
}
