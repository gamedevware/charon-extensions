import { ValueControl } from "charon-extensions";
import { bindInstanceMethods } from "./bind.instance.methods.function";
import { Observable, Subject } from "rxjs";

/**
 * Manages undo/redo functionality for a ValueControl with state snapshots
 * Provides history tracking with configurable limits and state change notifications
 * 
 * @template StateT - The type of state object being managed, must extend Object
 * 
 * @example
 * const undoRedo = new UndoRedoState(formControl, 50);
 * 
 * // Save state after changes
 * undoRedo.saveState();
 * 
 * // Navigate history
 * if (undoRedo.canUndo) undoRedo.undo();
 * if (undoRedo.canRedo) undoRedo.redo();
 * 
 * // Listen for history changes
 * undoRedo.stateChange.subscribe(() => updateUI());
 */
export class UndoRedoState<StateT extends object> {
    private readonly states: StateT[];
    private stateIndex: number;
    private stateChangeSubject: Subject<void>;

    public readonly stateChange: Observable<void>;

    /**
     * Checks if undo operation is available
     * @returns {boolean} True if there are previous states to restore
     */
    public get canUndo(): boolean {
        return this.stateIndex > 0;
    }

    /**
     * Checks if redo operation is available
     * @returns {boolean} True if there are future states to restore
     */
    public get canRedo(): boolean {
        return this.stateIndex < this.states.length - 1;
    }

    /**
     * Creates a new UndoRedoState instance for managing ValueControl history
     * 
     * @param {ValueControl<StateT>} valueControl - The ValueControl to track and manage
     * @param {number} [maxStateSnapshots=100] - Maximum number of states to keep in history
     * 
     * @throws {Error} If maxStateSnapshots is less than 10, it will be clamped to 10
     */
    constructor(
        private readonly valueControl: ValueControl<StateT>,
        private readonly maxStateSnapshots = 100
    ) {
        this.states = [];
        this.stateIndex = 0;
        this.stateChangeSubject = new Subject();
        this.stateChange = this.stateChangeSubject.asObservable();

        // Ensure minimum history size for basic functionality
        if (this.maxStateSnapshots < 10) {
            this.maxStateSnapshots = 10;
        }

        this.saveState();

        bindInstanceMethods(this);
    }

    /**
     * Restores the previous state from history
     * Updates the ValueControl and moves the history pointer backward
     * 
     * @returns {boolean} True if undo was successful, false if no previous state exists
     * 
     * @example
     * if (undoManager.undo()) {
     *   console.log('State restored to previous version');
     * }
     */
    public undo(): boolean {
        if (this.stateIndex <= 0) {
            return false;
        }

        this.stateIndex--;
        if (this.stateIndex < 0) {
            this.stateIndex = 0;
        }

        const state = this.states[this.stateIndex];
        if (state === undefined) {
            return false;
        }
        this.valueControl.setValue(state);
        this.stateChangeSubject.next();
        return true;
    }

    /**
     * Restores the next state from history
     * Updates the ValueControl and moves the history pointer forward
     * 
     * @returns {boolean} True if redo was successful, false if no future state exists
     * 
     * @example
     * if (undoManager.redo()) {
     *   console.log('State restored to next version');
     * }
     */
    public redo(): boolean {
        if (this.stateIndex >= this.states.length - 1) {
            return false;
        }

        this.stateIndex++;
        if (this.stateIndex > this.states.length - 1) {
            this.stateIndex = this.states.length - 1;
        }

        const state = this.states[this.stateIndex];
        if (state === undefined) {
            return false;
        }
        this.valueControl.setValue(state);
        this.stateChangeSubject.next();
        return true;
    }

    /**
     * Saves the current state to the history stack
     * Clears any future states (after current position) and maintains size limits
     * 
     * @returns {boolean} True if state was saved, false if state is identical to current
     * 
     * @example
     * // Save state after user makes changes
     * formControl.setValue(newData);
     * undoManager.saveState();
     */
    public saveState(): boolean {
        const state = this.valueControl.value;

        // Skip saving if state is identical to current
        if (this.isSameState(this.states[this.stateIndex], state)) {
            return false;
        }

        if (this.stateIndex < 0) {
            this.stateIndex = 0;
        }

        // Remove all future states (creates new branch)
        this.states.splice(this.stateIndex + 1, this.states.length);

        // Deep clone state to prevent reference issues
        this.states.push(JSON.parse(JSON.stringify(state)));
        this.stateIndex++;

        // Ensure index bounds
        if (this.stateIndex >= this.states.length - 1) {
            this.stateIndex = this.states.length - 1;
        }

        // Maintain history size limit by removing oldest states
        while (this.states.length > this.maxStateSnapshots) {
            this.states.shift();
            this.stateIndex--;
        }

        this.stateChangeSubject.next();
        return true;
    }

    /**
     * Compares two states for equality using JSON serialization
     * 
     * @param {StateT | undefined} state1 - First state to compare
     * @param {StateT | undefined} state2 - Second state to compare
     * @returns {boolean} True if states are deeply equal
     * 
     * @private
     */
    private isSameState<StateT extends object>(state1: StateT | undefined, state2: StateT | undefined) {
        if (state1 === undefined || state2 === undefined) {
            return false;
        }
        return JSON.stringify(state1) === JSON.stringify(state2);
    }
}