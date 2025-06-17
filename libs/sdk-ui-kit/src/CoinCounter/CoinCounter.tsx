// (C) 2025 GoodData Corporation

import React, { useState, useEffect, useRef } from "react";
import cx from "classnames";

import { Coin } from "../Icon/icons/Coin.js";
import { Merch } from "../Icon/icons/Merch.js";
import { Overlay } from "../Overlay/index.js";
import { Message } from "../Messages/Message.js";
import { Button } from "../Button/index.js";

/**
 * Props for the CoinCounter component
 *
 * @public
 */
export interface ICoinCounterProps {
    /**
     * The count number to display next to the coin icon
     */
    count: number;

    /**
     * Additional CSS class name
     */
    className?: string;

    /**
     * Size of the coin icon in pixels
     */
    coinSize?: number;

    /**
     * Maximum coins for the progress bar (defaults to 100)
     */
    maxCoins?: number;
}

/**
 * CoinCounter component that displays a coin icon with a count number
 * and shows a progress dialog when clicked
 *
 * @public
 */
export const CoinCounter: React.FC<ICoinCounterProps> = ({
    count,
    className,
    coinSize = 32,
    maxCoins = 100,
}) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const wrapperRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        // Trigger animation whenever count changes
        setIsAnimating(true);

        // Reset animation state after animation completes
        const timer = setTimeout(() => {
            setIsAnimating(false);
        }, 600); // Animation duration

        return () => clearTimeout(timer);
    }, [count]);

    const handleClick = () => {
        setIsOverlayOpen(true);
    };

    const handleCloseOverlay = () => {
        setIsOverlayOpen(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick();
        }
    };

    const progressPercentage = Math.min((count / maxCoins) * 100, 100);
    const coinsNeeded = Math.max(maxCoins - count, 0);

    return (
        <>
            <button
                ref={wrapperRef}
                className={cx("gd-coin-counter", className)}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                aria-label={`${count} coins collected. Click to view progress.`}
                type="button"
            >
                <span className={cx("gd-coin-counter-number", { "is-animating": isAnimating })}>{count}</span>
                <div className={cx("gd-coin-counter-icon", { "is-animating": isAnimating })}>
                    <Coin width={coinSize} height={coinSize} />
                </div>
            </button>

            {isOverlayOpen ? (
                <Overlay
                    alignTo={wrapperRef.current}
                    alignPoints={[
                        { align: "tc bc", offset: { x: 0, y: 8 } },
                        { align: "bc tc", offset: { x: 0, y: -8 } },
                        { align: "bl tr", offset: { x: 8, y: 0 } },
                    ]}
                    onClose={handleCloseOverlay}
                    className="gd-coin-counter-overlay"
                    closeOnOutsideClick={true}
                    closeOnEscape={true}
                >
                    <div className="gd-coin-overlay-content">
                        <div className="gd-coin-overlay-close">
                            <Button
                                className="gd-button-link gd-button-icon-only gd-icon-cross"
                                onClick={handleCloseOverlay}
                                accessibilityConfig={{
                                    ariaLabel: "Close overlay",
                                }}
                            />
                        </div>

                        <div className="gd-coin-overlay-main">
                            <div className="gd-coin-overlay-left">
                                <Merch className="gd-coin-overlay-icon" />
                            </div>

                            <div className="gd-coin-overlay-right">
                                <div className="gd-coin-overlay-count">
                                    {count}/{maxCoins} coins
                                </div>

                                <div className="gd-coin-overlay-progress">
                                    <div className="gd-coin-progress-bar">
                                        <div
                                            className="gd-coin-progress-fill"
                                            style={{ width: `${progressPercentage}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="gd-coin-overlay-text">
                                    <p className="gd-coin-overlay-info">
                                        Get <b>{coinsNeeded}</b> more coins and win an awesome GoodData
                                        t-shirt!
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Message type="progress" className="gd-coin-overlay-message">
                            Give feedback on AI answers to get coins.
                        </Message>
                    </div>
                </Overlay>
            ) : null}
        </>
    );
};
