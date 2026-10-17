import { Component, type ReactNode } from "react";
import { sceneLoader } from "./sceneLoader";

type Props = { onRetry: () => void; retried: boolean; children: ReactNode };
type State = { failed: boolean };

/** Keeps a failed scene chunk from unmounting the rest of the office UI. */
export default class SceneBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    sceneLoader.report(error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const { retried, onRetry } = this.props;
    return (
      <div className="scene-fallback" role="alert">
        <strong>The office floor could not load.</strong>
        <p>Capacity, Needs You, the inspector and replay still work.</p>
        {retried ? (
          <>
            <p>Retrying did not help. Reloading the page usually fixes this.</p>
            <button type="button" onClick={() => sceneLoader.reload()}>
              Reload page
            </button>
          </>
        ) : (
          <button type="button" onClick={onRetry}>
            Retry loading office
          </button>
        )}
      </div>
    );
  }
}
