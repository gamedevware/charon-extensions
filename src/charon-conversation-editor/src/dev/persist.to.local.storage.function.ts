import { ValueControl } from "charon-extensions";

const LOCAL_STORAGE_SLOT_NAME = 'ext-conversation-editor-dev-state'

export function persistToLocalStorage<T>(valueControl: ValueControl<T>) {
    // Load initial state from localStorage
    const savedState = localStorage.getItem(LOCAL_STORAGE_SLOT_NAME);
    if (savedState) {
        try {
            const parsedValue = JSON.parse(savedState);
            valueControl.setValue(parsedValue);
        } catch (error) {
            console.warn('Failed to parse saved state from localStorage:', error);
        }
    }

    // Save state to localStorage on every value change
    valueControl.valueChanges.subscribe({
        next: (value: T) => {
            try {
                localStorage.setItem(LOCAL_STORAGE_SLOT_NAME, JSON.stringify(value));
            } catch (error) {
                console.warn('Failed to save state to localStorage:', error);
            }
        }
    });
}