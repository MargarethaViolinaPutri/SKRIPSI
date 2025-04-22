'use client';

import { useCallback, useRef } from 'react';

/**
 * A hook to store cell values without triggering re-renders
 */
export function useCellStore<T extends Record<string, any>>() {
    // Store for edited values
    const editedValues = useRef<Record<string, T>>({});

    // Store a value for a specific row
    const storeValue = useCallback((rowId: string | number, field: keyof T, value: any, rowData: T) => {
        const id = String(rowId);

        // Initialize the row if it doesn't exist
        if (!editedValues.current[id]) {
            editedValues.current[id] = { ...rowData };
        }

        // Update the specific field
        editedValues.current[id][field] = value;
    }, []);

    // Get all edited values
    const getEditedValues = useCallback(() => {
        return Object.values(editedValues.current);
    }, []);

    // Get a specific edited row
    const getEditedRow = useCallback((rowId: string | number) => {
        return editedValues.current[String(rowId)];
    }, []);

    // Clear all stored values
    const clearStore = useCallback(() => {
        editedValues.current = {};
    }, []);

    // Process all edited values with a callback
    const processEditedValues = useCallback(
        async (processor: (values: T[]) => Promise<void>) => {
            const values = Object.values(editedValues.current);
            if (values.length > 0) {
                await processor(values);
                clearStore();
            }
        },
        [clearStore],
    );

    return {
        storeValue,
        getEditedValues,
        getEditedRow,
        clearStore,
        processEditedValues,
        hasEditedValues: () => Object.keys(editedValues.current).length > 0,
    };
}
