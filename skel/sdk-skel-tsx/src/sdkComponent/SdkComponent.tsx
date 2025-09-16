// (C) 2019-2025 GoodData Corporation

/**
 * @public
 */
export interface ISdkComponentProps {
    message: string;
}

/**
 * @public
 */
export function SdkComponent({ message }: ISdkComponentProps) {
    return <p>{message}</p>;
}

/**
 * @internal
 */
export function functionInternalToThisComponent(input: string): string {
    return `Hello ${input}!`;
}
