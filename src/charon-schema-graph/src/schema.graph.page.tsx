import { useMemo } from 'react';
import { ExtensionPageContext, Metadata, ObservableLike } from 'charon-extensions';
import { throwError } from 'rxjs';
import { useObservable } from './reactive';
import SchemaGraph from './schema.graph';

function SchemaGraphPage({ context }: { context: ExtensionPageContext }) {
    // getMetadata() returns a fresh ObservableLike on every call — memoize it so
    // useObservable subscribes once per context instead of resubscribing (and
    // resetting to "loading") on every render. `services` is Partial — gameData
    // may be absent, in which case we surface that as the same error state used
    // for a failed load rather than crashing.
    const metadata$ = useMemo(
        () => context.services.gameData?.getMetadata()
            ?? (throwError(() => new Error('gameData service is not available in this context')) as unknown as ObservableLike<Metadata>),
        [context]
    );
    const [metadata, error] = useObservable(metadata$);

    if (error) {
        return <div className="ext-sg-message ext-sg-error">Failed to load schema metadata: {error.message}</div>;
    }
    if (!metadata) {
        return <div className="ext-sg-message">Loading schema graph…</div>;
    }
    return <SchemaGraph metadata={metadata} />;
}

export default SchemaGraphPage;
