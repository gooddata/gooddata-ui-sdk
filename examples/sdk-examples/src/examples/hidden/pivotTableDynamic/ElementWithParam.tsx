// (C) 2020 GoodData Corporation

import React, { HTMLAttributes } from "react";

interface IElementWithParamProps {
    component: any;
    params: any[];
    onClick: (params: any[]) => void;
    className: string;
}

export class ElementWithParam extends React.Component<IElementWithParamProps> {
    public static defaultProps = {
        component: (props: HTMLAttributes<HTMLButtonElement>): JSX.Element => <button {...props} />,
        onClick: (f: unknown): unknown => f,
    };

    public onClick = (): any => {
        return this.props.onClick([...this.props.params]);
    };

    public render(): React.ReactNode {
        const { component: Elem, params: _remove, ...otherProps } = this.props;
        return <Elem {...otherProps} onClick={this.onClick} />;
    }
}
