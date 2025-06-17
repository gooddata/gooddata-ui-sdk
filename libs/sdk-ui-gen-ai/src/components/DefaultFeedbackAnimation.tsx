// (C) 2024-2025 GoodData Corporation

import React, { useEffect, useState } from "react";
import { Icon } from "@gooddata/sdk-ui-kit";

/**
 * Default feedback animation component that shows a spinning coin with jumping effect.
 * This component is used automatically when no custom feedbackAnimationComponent is provided.
 * Users can create their own animation components following this interface.
 *
 * @example
 * ```tsx
 * // Uses default animation
 * <GenAIChatDialog
 *     // ... props (no feedbackAnimationComponent needed)
 * />
 *
 * // Uses custom animation
 * <GenAIChatDialog
 *     feedbackAnimationComponent={MyCustomAnimation}
 *     // ... other props
 * />
 * ```
 *
 * @public
 */
export const DefaultFeedbackAnimation: React.FC<{
    onComplete: () => void;
    triggerElement?: HTMLElement | null;
}> = ({ onComplete, triggerElement }) => {
    const [position, setPosition] = useState({ top: "50%", left: "50%" });

    useEffect(() => {
        // Calculate position relative to trigger element immediately
        if (triggerElement) {
            const rect = triggerElement.getBoundingClientRect();
            setPosition({
                top: `${rect.top + rect.height / 2}px`,
                left: `${rect.left + rect.width / 2}px`,
            });
        } else {
            // Fallback to center if no trigger element
            setPosition({
                top: "50%",
                left: "50%",
            });
        }

        // Auto-complete animation after 800ms
        const timer = setTimeout(onComplete, 800);
        return () => clearTimeout(timer);
    }, [onComplete, triggerElement]);

    return (
        <div
            className="gd-gen-ai-feedback-animation"
            style={{
                position: "fixed",
                top: position.top,
                left: position.left,
                transform: "translate(-50%, -50%)",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "feedbackJump 0.8s ease-out",
                pointerEvents: "none",
                zIndex: 9999,
            }}
        >
            <div
                style={{
                    animation: "feedbackSpinClockwise 1s ease-in-out",
                    color: "#14b2e2",
                    fontSize: "24px",
                    transformOrigin: "center center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Icon.Coin width={28} height={28} />
            </div>
            <style>{`
                @keyframes feedbackJump {
                    0% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.5) translateY(0px);
                    }
                    25% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1.1) translateY(-50px);
                    }
                    50% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1.2) translateY(-80px);
                    }
                    75% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1.1) translateY(-50px);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.8) translateY(-100px);
                    }
                }
                
                @keyframes feedbackSpinClockwise {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
};
