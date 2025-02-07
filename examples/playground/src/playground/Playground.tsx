// (C) 2024-2025 GoodData Corporation

import * as React from "react";
// import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { BubbleHoverTrigger, Button, Bubble } from "@gooddata/sdk-ui-kit";

// const dashboard = import.meta.env.VITE_DASHBOARD;

export const Playground: React.FC = () => {
    return (
        <div style={{ padding: "10rem" }}>
            <Button className="gd-button-secondary" value="First" />
            <BubbleHoverTrigger className="gd-list-item-tooltip" showDelay={0} hideDelay={1500}>
                <Button className="gd-button-secondary" value="Kit Button (non interactive tooltip)" />
                <Bubble alignPoints={[{ align: "bc tl", offset: { x: 20, y: 25 } }]}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis
                </Bubble>
            </BubbleHoverTrigger>
            <BubbleHoverTrigger className="gd-list-item-tooltip" showDelay={0} hideDelay={1500}>
                <button className="gd-button-secondary">HTML Button (non interactive tooltip)</button>
                <Bubble alignPoints={[{ align: "bc tl", offset: { x: 20, y: 25 } }]}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis
                </Bubble>
            </BubbleHoverTrigger>
            <BubbleHoverTrigger
                className="gd-list-item-tooltip"
                showDelay={0}
                hideDelay={1500}
                isInteractive={true}
            >
                <button className="gd-button-secondary">HTML Button (interactive tooltip)</button>
                <Bubble alignPoints={[{ align: "bc tl", offset: { x: 20, y: 25 } }]}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis in
                    <br />
                    <br />
                    <Button className="gd-button-secondary" value="Inside a tooltip" tabIndex={2} />
                    <br />
                    <br />
                    <a href="https://www.google.com" target="_blank" rel="noopener noreferrer" tabIndex={1}>
                        https://google.com
                    </a>
                </Bubble>
            </BubbleHoverTrigger>
            <Button className="gd-button-secondary" value="Last" />
        </div>
    );
    // if (!dashboard) return null;
    //
    // return (
    //     <Dashboard
    //         dashboard={dashboard}
    //         config={{
    //             initialRenderMode: "view",
    //         }}
    //     />
    // );
};
