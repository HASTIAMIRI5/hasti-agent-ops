export type StepStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';

export interface WorkflowContext<TInput, TState extends Record<string, unknown>> {
  input: TInput;
  state: TState;
  setState: (updater: Partial<TState> | ((current: TState) => TState)) => void;
  getState: <TValue = unknown>(key: keyof TState) => TValue | undefined;
}

export interface WorkflowStep<TInput, TState extends Record<string, unknown>> {
  id: string;
  name: string;
  description?: string;
  dependsOn?: string[];
  run: (context: WorkflowContext<TInput, TState>) => Promise<unknown> | unknown;
}

export interface StepExecution {
  id: string;
  name: string;
  description?: string;
  status: StepStatus;
  startedAt: string;
  finishedAt?: string;
  durationMs: number;
  output?: unknown;
  error?: string;
}

export interface WorkflowDefinition<TInput, TState extends Record<string, unknown>, TOutput> {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep<TInput, TState>[];
  finalize?: (context: WorkflowContext<TInput, TState>) => Promise<TOutput> | TOutput;
}

export interface WorkflowExecutionResult<TInput, TState extends Record<string, unknown>, TOutput> {
  workflowId: string;
  workflowName: string;
  status: 'success' | 'failed';
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  input: TInput;
  state: TState;
  output?: TOutput;
  steps: StepExecution[];
}
