import { ExtensionActionContextBase } from "./extension.action.context";

/**
 * Context object handed to a custom page's root element via its `context` property.
 *
 * Each entry in a package's `config.customPages` (declared in `package.json`, validated by
 * `package.json.schema.json`) names a custom-element `selector`; the host mounts that element
 * directly at the page's route and sets this object on the element's `.context` property. This is
 * a separate declaration mechanism from `config.customActions` — see
 * `extension.action.context.ts`'s file overview for how that one works. Pages are always mounted
 * elements, never function calls.
 */
export interface ExtensionPageContext extends ExtensionActionContextBase {
    /** Query params from the current URL. */
    readonly params: Readonly<Record<string, string>>;
    /** Path segments after the page id in the current URL — lets a page implement its own internal deep-linking (tabs, wizard steps, detail views). Empty array when the page was opened with no extra segments. */
    readonly restOfRoute: readonly string[];
}