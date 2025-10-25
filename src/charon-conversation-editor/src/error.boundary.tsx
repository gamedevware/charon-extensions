import { Component, ErrorInfo, PropsWithChildren } from "react";

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<
    PropsWithChildren,
    ErrorBoundaryState
> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Error in ConversationEditor:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="ext-ce-error-container">
                    <h1>Something went wrong 😢</h1>
                    <p>We're sorry, but the editor failed to load.</p>
                    <pre>
                        {this.state.error?.message}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}