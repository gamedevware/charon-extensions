
import { Component, RefObject } from "react";

// findDOMNode was removed in React 19; react-toggle exposes its <input> DOM node
// directly on the instance as `.input`, so we read that instead.
export function focusComponentInput<T extends Component>(componentRef: RefObject<T | null>, options?: FocusOptions) {
    const instance = componentRef.current as (T & { input?: HTMLElement | null }) | null;
    const input = instance?.input;
    if (!input) {
        return; // failed to find <input>
    }
    setTimeout(() => input.focus(options), 0);
}