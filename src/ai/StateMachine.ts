export interface State {
  name: string;
  enter?(): void;
  update?(dt: number): void;
  exit?(): void;
}

export class StateMachine {
  private states: Map<string, State> = new Map();
  private currentState: State | null = null;
  private _currentStateName: string = '';

  addState(state: State): void {
    this.states.set(state.name, state);
  }

  setState(name: string): void {
    if (this._currentStateName === name) return;

    if (this.currentState?.exit) {
      this.currentState.exit();
    }

    const next = this.states.get(name);
    if (!next) {
      console.warn(`State "${name}" not found`);
      return;
    }

    this.currentState = next;
    this._currentStateName = name;

    if (this.currentState.enter) {
      this.currentState.enter();
    }
  }

  update(dt: number): void {
    if (this.currentState?.update) {
      this.currentState.update(dt);
    }
  }

  get stateName(): string {
    return this._currentStateName;
  }

  isInState(...names: string[]): boolean {
    return names.includes(this._currentStateName);
  }
}
