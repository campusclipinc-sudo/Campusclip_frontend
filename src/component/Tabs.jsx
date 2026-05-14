import React from "react";
import { Button } from "react-bootstrap";

/**
 * Reusable button-group Tabs to match CampusClip design.
 *
 * Props:
 * - items: Array<{ key: string, label: ReactNode, disabled?: boolean }>
 * - activeKey: string
 * - onSelect: (key: string) => void
 * - className?: string
 * - fullWidth?: boolean (default true)
 */
const Tabs = ({
    items = [],
    activeKey,
    onSelect,
    className = "",
    fullWidth = true,
}) => {
    const containerCls = `cc-tabs-main ${fullWidth ? "w-100" : ""} ${className}`.trim();

    return (
        <div className={containerCls} role="tablist" aria-orientation="horizontal">
            <div className="cc-tabs">
                {items.map((it) => {
                    const isActive = activeKey === it.key;
                    return (
                        <Button
                            key={it.key}
                            className={`flex-grow-1 border-0 border-0 ${isActive ? "active" : ""}`}
                            onClick={() => !it.disabled && onSelect?.(it.key)}
                            disabled={it.disabled}
                            role="tab"
                            aria-selected={isActive}
                        >
                            {it.label}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
};

export default Tabs;
