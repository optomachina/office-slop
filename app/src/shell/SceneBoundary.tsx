import { Component, type ReactNode } from "react";

type Props = { onRetry: () => void; children: ReactNode };
type State = { failed: boolean };

/** Keeps a failed scene chunk from unmounting the rest of the office UI. */
export default class SceneBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("Office scene failed to load", error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="scene-fallback" role="alert">
        <strong>The office floor could not load.</strong>
        <p>Capacity, Needs You, the inspector and replay still work.</p>
        <button type="button" onClick={this.props.onRetry}>
          Retry loading office
        </button>
      </div>
    );
  }
}
