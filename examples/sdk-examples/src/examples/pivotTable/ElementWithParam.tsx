// (C) 2020 GoodData Corporation

import React from "react";

interface IElementWithParamProps {
    component: any;
    params: any[];
    onClick: ([]) => void;
    className: string;
}

export class ElementWithParam extends React.Component<IElementWithParamProps> {
    public static defaultProps = {
        component: (props: any) => <button {...props} />,
        onClick: (f: any) => f,
    };

    public onClick = () => {
        return this.props.onClick([...this.props.params]);
    };

    public render() {
        const { component: Elem, ...otherProps } = this.props;
        delete otherProps.params;
        return <Elem {...otherProps} onClick={this.onClick} />;
    }
}
