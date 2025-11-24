"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputNumberProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type"> {
    value?: number;
    defaultValue?: number;
    onChange?: (value: number | undefined) => void;
    min?: number;
    max?: number;
    step?: number;
}

const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
    (
        {
            className,
            value,
            defaultValue,
            onChange,
            placeholder,
            min,
            max,
            step: _step = 1,
            ...props
        },
        ref
    ) => {
        const [internalValue, setInternalValue] = React.useState<string>("");
        const [isFocused, setIsFocused] = React.useState(false);
        const isControlled = value !== undefined;

        React.useEffect(() => {
            if (isControlled && !isFocused) {
                setInternalValue(value !== null && value !== undefined ? String(value) : "");
            }
        }, [value, isControlled, isFocused]);

        React.useEffect(() => {
            if (!isControlled && defaultValue !== undefined && internalValue === "" && !isFocused) {
                setInternalValue(String(defaultValue));
            }
        }, [defaultValue, isControlled, internalValue, isFocused]);

        const handleFocus = () => {
            setIsFocused(true);
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;

            if (newValue === "" || newValue === "-" || /^-?\d+$/.test(newValue)) {
                setInternalValue(newValue);

                if (newValue === "" || newValue === "-") {
                    onChange?.(undefined);
                } else {
                    const numValue = parseInt(newValue, 10);
                    if (!isNaN(numValue)) {
                        onChange?.(numValue);
                    }
                }
            }
        };

        const handleBlur = () => {
            setIsFocused(false);

            if (internalValue === "" || internalValue === "-") {
                if (defaultValue !== undefined) {
                    setInternalValue(String(defaultValue));
                    onChange?.(defaultValue);
                } else {
                    setInternalValue("");
                    onChange?.(undefined);
                }
                return;
            }

            const numValue = parseInt(internalValue, 10);
            if (!isNaN(numValue)) {
                let finalValue = numValue;

                if (min !== undefined && finalValue < min) {
                    finalValue = min;
                }
                if (max !== undefined && finalValue > max) {
                    finalValue = max;
                }

                setInternalValue(String(finalValue));
                onChange?.(finalValue);
            } else {
                if (isControlled && value !== undefined) {
                    setInternalValue(String(value));
                } else if (defaultValue !== undefined) {
                    setInternalValue(String(defaultValue));
                    onChange?.(defaultValue);
                } else {
                    setInternalValue("");
                    onChange?.(undefined);
                }
            }
        };

        return (
            <input
                type="text"
                inputMode="numeric"
                className={cn(
                    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                value={internalValue}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                {...props}
            />
        );
    }
);

InputNumber.displayName = "InputNumber";

export { InputNumber };
