import { Component, RefObject } from "react";
import { findDOMNode } from "react-dom";

export function focusComponentInput<T extends Component>(componentRef: RefObject<T>, options?: FocusOptions) {
    const elementOrText = findDOMNode(componentRef.current);
    if (!(elementOrText instanceof HTMLElement)) {
        return;
    }
    const input = elementOrText.querySelector("input, [tabindex]:not([tabindex='-1'])") as HTMLElement | null;
    if (!input) {
        return;
    }
    setTimeout(() => input.focus(options), 0);
}
