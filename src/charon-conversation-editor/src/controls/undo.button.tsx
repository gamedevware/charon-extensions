import { useUndoRedo } from "../state";

function UndoButton({ enabled }: { enabled: boolean }) {
    const { undo, canUndo } = useUndoRedo();

    return <>
        <button type="button" disabled={!canUndo || !enabled} className="react-flow__controls-button ext-ce-undo-button" onClick={undo} title="Undo the last action">
            <svg width="18px" height="18px" viewBox="-0.5 0 25 25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 21.4199H15C16.8565 21.4199 18.637 20.6824 19.9497 19.3696C21.2625 18.0569 22 16.2764 22 14.4199C22 12.5634 21.2625 10.783 19.9497 9.47021C18.637 8.15746 16.8565 7.41992 15 7.41992H2" fill="none" />
                <path d="M6 11.4199L2 7.41992L6 3.41992" fill="none" />
            </svg>
        </button>
    </>
}

export default UndoButton;