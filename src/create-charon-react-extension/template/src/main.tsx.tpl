import { createRoot } from 'react-dom/client';
import './index.scss';
import __CLASS_NAME__ from './EditorElement';

// Register the custom element
customElements.define('__ELEMENT_NAME__', __CLASS_NAME__);

// Tell TypeScript that <__ELEMENT_NAME__> is a valid JSX element
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      '__ELEMENT_NAME__': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

// Dev mode: render the custom element for local testing
const isDev = import.meta.env.MODE === 'development';
if (isDev) {
  createRoot(document.getElementById('root')!).render(
    <__ELEMENT_NAME__ />
  );
}
