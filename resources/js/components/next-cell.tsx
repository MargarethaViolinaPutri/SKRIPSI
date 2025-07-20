'use client';

import type React from 'react';

import { Input } from '@/components/ui/input';
import { useCallback, useEffect, useRef, useState } from 'react';

type NextCellProps = {
    initial: any;
    onChange: (value: any) => void;
    type: React.HTMLInputTypeAttribute;
    className?: string;
    cellClassName?: string;
    preventTableRefresh?: boolean;
    storeOnly?: boolean;
    onStoreValue?: (value: any) => void;
};

export const NextCell = ({
    initial,
    type,
    onChange,
    className,
    cellClassName,
    preventTableRefresh = true,
    storeOnly = false,
    onStoreValue,
}: NextCellProps) => {
    const [value, setValue] = useState<any>(initial);
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const initialValueRef = useRef(initial);
    const onChangeRef = useRef(onChange);
    const onStoreValueRef = useRef(onStoreValue);

    // Update the onChange ref when the prop changes
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // Update the onStoreValue ref when the prop changes
    useEffect(() => {
        onStoreValueRef.current = onStoreValue;
    }, [onStoreValue]);

    // Update internal value when initial prop changes
    // But only if we're not editing and the value has actually changed
    useEffect(() => {
        if (!isEditing && initial !== initialValueRef.current) {
            setValue(initial);
            initialValueRef.current = initial;
        }
    }, [initial, isEditing]);

    // Focus input when entering edit mode
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleClick = useCallback(() => {
        setIsEditing(true);
    }, []);

    const handleBlur = useCallback(() => {
        setIsEditing(false);

        // Only process if the value actually changed
        if (value !== initialValueRef.current) {
            initialValueRef.current = value;

            // If storeOnly is true, just call onStoreValue and don't trigger onChange
            if (storeOnly && onStoreValueRef.current) {
                onStoreValueRef.current(value);
                return;
            }

            // Use setTimeout to break the React event loop and prevent immediate re-renders
            if (preventTableRefresh) {
                setTimeout(() => {
                    onChangeRef.current(value);
                }, 0);
            } else {
                onChangeRef.current(value);
            }
        }
    }, [value, preventTableRefresh, storeOnly]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }, []);

    // Prevent form submission on Enter key
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            inputRef.current?.blur();
        }
    }, []);

    if (isEditing) {
        return (
            <Input
                ref={inputRef}
                type={type}
                value={value}
                onBlur={handleBlur}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={className}
                // Stop propagation to prevent table events
                onClick={(e) => e.stopPropagation()}
            />
        );
    }

    return (
        <div onClick={handleClick} className={`hover:bg-muted/50 cursor-pointer py-2 ${cellClassName}`}>
            {value}
        </div>
    );
};
