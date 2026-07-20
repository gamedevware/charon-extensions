import { ObservableLike, UndoRedoService, ValueControl } from "charon-extensions";
import { Subject } from "rxjs";

const BATCH_WINDOW_MS = 800;

/**
 * Dev-harness stand-in for the host-provided UndoRedoService. Watches a ValueControl's
 * `valueChanges` and snapshots on every emission, coalescing snapshots that arrive within
 * BATCH_WINDOW_MS of each other into the current top-of-stack entry — a local approximation
 * of the real host's own time-based auto-batching (its exact window isn't observable from
 * here). `barrier()` forces the next snapshot to start a fresh entry regardless of elapsed
 * time. `undo()`/`redo()` replay via a normal `setValue()` — so the canvas and property
 * editors, which resync from `valueChanges`, actually reflect the restored state — guarded
 * by a `replaying` flag so `record()` ignores the replay's own emission instead of recording
 * it as a new step.
 */
export class DevUndoRedoService<StateT extends object> implements UndoRedoService {
    private readonly states: StateT[];
    private stateIndex: number;
    private lastRecordedAt: number;
    private forceNewEntry: boolean;
    private replaying: boolean;
    private readonly stateChangeSubject: Subject<void>;

    public readonly stateChange: ObservableLike<void>;

    public get canUndo(): boolean {
        return this.stateIndex > 0;
    }
    public get canRedo(): boolean {
        return this.stateIndex < this.states.length - 1;
    }

    constructor(private readonly valueControl: ValueControl<StateT>) {
        this.states = [this.clone(this.valueControl.value)];
        this.stateIndex = 0;
        this.lastRecordedAt = Date.now();
        this.forceNewEntry = false;
        this.replaying = false;
        this.stateChangeSubject = new Subject();
        this.stateChange = this.stateChangeSubject.asObservable() as unknown as ObservableLike<void>;

        this.valueControl.valueChanges.subscribe({
            next: value => this.record(value)
        });
    }

    public undo(): void {
        if (!this.canUndo) {
            return;
        }
        this.stateIndex--;
        this.replayValue(this.states[this.stateIndex]);
        this.forceNewEntry = true;
        this.stateChangeSubject.next();
    }

    public redo(): void {
        if (!this.canRedo) {
            return;
        }
        this.stateIndex++;
        this.replayValue(this.states[this.stateIndex]);
        this.forceNewEntry = true;
        this.stateChangeSubject.next();
    }

    public push(action: { redo: () => void; undo: () => void }): void {
        // This dev harness tracks the bound ValueControl directly via `valueChanges` rather
        // than explicit action-pairs; apply immediately and seal it off as its own step.
        action.redo();
        this.barrier();
    }

    public clear(): void {
        this.states.splice(0, this.states.length, this.clone(this.valueControl.value));
        this.stateIndex = 0;
        this.stateChangeSubject.next();
    }

    public barrier(): void {
        this.forceNewEntry = true;
    }

    private replayValue(value: StateT): void {
        this.replaying = true;
        try {
            this.valueControl.setValue(this.clone(value)); // normal emit — canvas/property editors resync from this
        } finally {
            this.replaying = false;
        }
    }

    private record(value: StateT): void {
        if (this.replaying) {
            return; // ignore the replay's own emission — undo()/redo() already advanced stateIndex
        }
        const now = Date.now();
        const coalesce = !this.forceNewEntry && (now - this.lastRecordedAt) < BATCH_WINDOW_MS;
        this.lastRecordedAt = now;
        this.forceNewEntry = false;

        if (coalesce) {
            this.states[this.stateIndex] = this.clone(value);
        } else {
            this.states.splice(this.stateIndex + 1);
            this.states.push(this.clone(value));
            this.stateIndex++;
        }
        this.stateChangeSubject.next();
    }

    private clone(value: StateT): StateT {
        return JSON.parse(JSON.stringify(value));
    }
}
