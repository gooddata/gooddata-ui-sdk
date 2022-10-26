// (C) 2022 GoodData Corporation
import React from "react";
import { Bubble, BubbleHoverTrigger, Button, IAlignPoint, Typography } from "@gooddata/sdk-ui-kit";
import styles from "./Toolbar.module.css";

interface IToolbarProps {
    onReloadPlugin: () => void;
    reloadDisabled: boolean;
}

const alignPoints: IAlignPoint[] = [{ align: "cr cl" }, { align: "bc tc" }];

export const Toolbar: React.FC<IToolbarProps> = (props) => {
    const { onReloadPlugin, reloadDisabled } = props;

    return (
        <div className={styles.toolbar}>
            <Typography tagName="p" className={styles.label}>
                Plugin Development Tools
            </Typography>
            <div className={styles.reloadButtonContainer}>
                <Button
                    onClick={onReloadPlugin}
                    value="Reload plugin"
                    className="gd-button-primary gd-icon-sync"
                    disabled={reloadDisabled}
                />
                <BubbleHoverTrigger>
                    <span className={`gd-icon-circle-question ${styles.icon}`} />
                    <Bubble alignPoints={alignPoints}>
                        This will reload the plugin keeping any changes you made to the dashboard intact
                    </Bubble>
                </BubbleHoverTrigger>
            </div>
        </div>
    );
};
