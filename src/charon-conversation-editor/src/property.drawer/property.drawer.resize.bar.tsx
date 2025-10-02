import { MouseEventHandler, useCallback, useEffect } from "react";
import { RefObject, useState } from "react";

/**
 * Resize handle component for controlling the width of a container element
 * Provides mouse-driven resizing functionality with smooth drag operations
 * 
 * @description
 * This component provides:
 * - Visual resize handle that responds to mouse drag events
 * - Real-time width adjustment during drag operations
 * - Proper event cleanup to prevent memory leaks
 * - Smooth resizing with mouse movement tracking
 * 
 * @note
 * The resize handle calculates width based on the distance from the right edge
 * of the container to the current mouse position during drag operations
 */
function PropertyDrawerResizeBar({ containerRef }: { containerRef: RefObject<HTMLDivElement | null> }) {

    const [isResizing, setIsResizing] = useState(false);
    const [, setSidebarWidth] = useState(containerRef.current?.clientWidth ?? 300);

    /**
     * Initiates the resize operation when the handle is clicked
     * Sets the resizing state and prevents default browser behavior
     * 
     * @param {MouseEvent<HTMLDivElement>} mouseDownEvent - The mouse down event on the resize handle
     */
    const startResizing = useCallback<MouseEventHandler>((mouseDownEvent) => {
        setIsResizing(true);
        mouseDownEvent.preventDefault();
    }, []);

    /**
     * Terminates the resize operation when mouse is released
     * Cleans up the resizing state
     */
    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    /**
     * Handles mouse movement during resize operations
     * Calculates new width based on mouse position and updates container
     * 
     * @param {MouseEvent} mouseMoveEvent - The mouse move event
     */
    const resize = useCallback((mouseMoveEvent: MouseEvent) => {
        if (isResizing && containerRef.current) {
            // Calculate new width based on distance from right edge to mouse position
            const newWidth = Math.abs(mouseMoveEvent.clientX - containerRef.current.getBoundingClientRect().right);
            setSidebarWidth(newWidth);
            containerRef.current.style.width = newWidth + 'px';
        }
    }, [isResizing, containerRef]);

    /**
     * Sets up global mouse event listeners for resize operations
     * Listens for mouse movements and releases during resize
     */
    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [resize, stopResizing]);

    return <>
        <div className="ext-ce-resize-bar" onMouseDown={startResizing}>
        </div>
    </>
}

export default PropertyDrawerResizeBar;