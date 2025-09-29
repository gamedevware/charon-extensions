import { createRoot } from 'react-dom/client';
import './index.scss'
import LogicalToggleElement from './LogicalToggleElement.tsx'

// register custom element
customElements.define("ext-logical-toggle-editor", LogicalToggleElement);

// tell TS that <ext-logical-toggle-editor> is a custom element
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'ext-logical-toggle-editor': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}

const isDev = import.meta.env.MODE === 'development';
if (isDev) {
    createRoot(document.getElementById('root')!).render(
        <ext-logical-toggle-editor />
    )
}
