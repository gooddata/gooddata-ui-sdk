// (C) 2019-2022 GoodData Corporation
import React from "react";

/**
 * @public
 */
export interface ISdkComponentProps {
    message: string;
}

/**
 * @public
 */
export class SdkComponent extends React.Component<ISdkComponentProps> {
    public render() {
        return <p>{this.props.message}</p>;
    }
}

/**
 * @internal
 */
export function functionInternalToThisComponent(input: string): string {
    return `Hello ${input}!`;
}
