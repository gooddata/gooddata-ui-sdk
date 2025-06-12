// (C) 2007-2020 GoodData Corporation
import ReactDOM from "react-dom";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function renderIntoDocumentWithUnmount(element: any) {
    const container = document.createElement("div");
    // eslint-disable-next-line react/no-render-return-value, react/no-deprecated
    const component: any = ReactDOM.render(element, container);

    // eslint-disable-next-line react/no-deprecated
    component.unmount = () => ReactDOM.unmountComponentAtNode(container);

    return component;
}
