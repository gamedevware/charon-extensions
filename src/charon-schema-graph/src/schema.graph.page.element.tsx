import { ExtensionPageContext } from "charon-extensions";
import { createRoot, Root } from "react-dom/client";
import SchemaGraphPage from "./schema.graph.page";
import { ErrorBoundary } from "./error.boundary";

/**
 * Custom HTML Element hosting the schema graph page.
 * Charon sets the `context` property when mounting the element (per the
 * custom-routed-pages contract: the host calls `setProperty('context', pageContext)`
 * after `Renderer2.createElement('ext-schema-graph-page')`).
 *
 * @element ext-schema-graph-page
 */
export default class SchemaGraphPageElement extends HTMLElement {
    private _context?: ExtensionPageContext;
    private _root?: Root;

    get context(): ExtensionPageContext {
        return this._context!;
    }

    set context(value: ExtensionPageContext) {
        if (Object.is(value, this._context)) {
            return; // same value
        }
        this._context = value;
        this.render();
    }

    public connectedCallback() {
        this.classList.add('ext-schema-graph-page');
        this.render();
    }

    public disconnectedCallback() {
        this.unmount();
    }

    private render() {
        this._root ??= createRoot(this);

        if (this._context) {
            this._root.render(
                <ErrorBoundary>
                    <SchemaGraphPage context={this._context} />
                </ErrorBoundary>
            );
        }
    }

    private unmount() {
        if (this._root) {
            this._root.unmount();
            delete this._root;
        }
    }
}
