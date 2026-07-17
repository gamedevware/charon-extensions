import './index.scss';
import SchemaGraphPageElement from './schema.graph.page.element';
import { createDevPageContext } from './dev';

customElements.define('ext-schema-graph-page', SchemaGraphPageElement);

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'ext-schema-graph-page': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

const isDev = import.meta.env.MODE === 'development';
if (isDev) {
  const element = document.createElement('ext-schema-graph-page') as SchemaGraphPageElement;
  element.context = createDevPageContext();
  document.getElementById('root')!.replaceChildren(element);
}
