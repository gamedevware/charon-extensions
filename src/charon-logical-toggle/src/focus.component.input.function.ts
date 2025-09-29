
import { Component, RefObject } from "react";
import { findDOMNode } from "react-dom";

export function focusComponentInput<T extends Component>(componentRef: RefObject<T>, options?: FocusOptions) {
    const elementOrText = findDOMNode(componentRef.current);
    if (!(elementOrText instanceof HTMLElement)) {
        return; // failed to find HTML element for component
    }
    const input = elementOrText.querySelector("input, [tabindex]:not([tabindex='-1'])") as HTMLElement | null;
    if (!input) {
        return; // failed to find <input>
    }
    setTimeout(() => input.focus(options), 0);
}