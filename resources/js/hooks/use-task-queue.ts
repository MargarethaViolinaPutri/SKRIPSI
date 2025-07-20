'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Task = () => Promise<any>;

export function useTaskQueue() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const processingRef = useRef(false);

    // Add a new task to the queue
    const addTask = useCallback((task: Task) => {
        setTasks((prevTasks) => [...prevTasks, task]);
    }, []);

    // Clear all pending tasks
    const clearTasks = useCallback(() => {
        setTasks([]);
    }, []);

    // Process tasks in FIFO order
    const processNextTask = useCallback(async () => {
        if (processingRef.current || tasks.length === 0) return;

        processingRef.current = true;
        setIsProcessing(true);

        const nextTask = tasks[0];

        try {
            await nextTask();
            // Remove the completed task
            setTasks((prevTasks) => prevTasks.slice(1));
        } catch (error) {
            // Error handling is done in the task itself
            console.error('Task failed:', error);
        } finally {
            processingRef.current = false;
            setIsProcessing(false);
        }
    }, [tasks]);

    // Process tasks whenever the queue changes
    useEffect(() => {
        if (tasks.length > 0 && !processingRef.current) {
            processNextTask();
        }
    }, [tasks, processNextTask]);

    return {
        addTask,
        clearTasks,
        isProcessing,
        pendingTasksCount: tasks.length,
    };
}
