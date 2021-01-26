// (C) 2007-2020 GoodData Corporation
import { Component } from "react";
import isEqual from "lodash/isEqual";
import { removeFromDom } from "../utils/domUtilities";

interface IHeaderIconProps {
    rel: "shortcut icon" | "apple-touch-icon";
    type: "image/x-icon" | "image/png";
    url?: string;
}

export default class HeaderIcon extends Component<IHeaderIconProps> {
    static defaultProps = {
        url: "",
    };

    favicon: HTMLLinkElement;

    componentDidMount(): void {
        this.createFavicon();
    }

    shouldComponentUpdate(nextProps: IHeaderIconProps): boolean {
        return !isEqual(this.props, nextProps);
    }

    componentDidUpdate(): void {
        this.removeFavicon();
        this.createFavicon();
    }

    componentWillUnmount(): void {
        this.removeFavicon();
    }

    createFavicon(): void {
        if (this.props.url) {
            this.favicon = document.createElement("link");
            this.favicon.href = this.props.url;
            this.favicon.rel = this.props.rel;
            this.favicon.type = this.props.type;
            document.head.appendChild(this.favicon);
        }
    }

    removeFavicon(): void {
        removeFromDom(this.favicon);
    }

    render(): null {
        return null;
    }
}
