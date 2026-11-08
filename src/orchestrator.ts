import type {
  StepExecution,
  WorkflowContext,
  WorkflowDefinition,
  WorkflowExecutionResult,
} from './types.js';

export class WorkflowEngine {
  async execute<TInput, TState extends Record<string, unknown>, TOutput>(
    definition: WorkflowDefinition<TInput, TState, TOutput>,
    input: TInput,
    initialState: Partial<TState> = {},
  ): Promise<WorkflowExecutionResult<TInput, TState, TOutput>> {
    const startedAt = new Date();
    const state = { ...initialState } as TState;
    const stepRecords = new Map<string, StepExecution>();
    const remaining = new Set(definition.steps.map((step) => step.id));

    const applyStateUpdate = (
      updater: Partial<TState> | ((current: TState) => TState),
    ): void => {
      if (typeof updater === 'function') {
        Object.assign(state, updater(state));
        return;
      }

      Object.assign(state, updater);
    };

    const getStateValue = <TValue = unknown>(key: keyof TState): TValue | undefined => {
      const value = state[key];
      return value as TValue | undefined;
    };

    const contextFactory = (): WorkflowContext<TInput, TState> => ({
      input,
      state,
      setState: applyStateUpdate,
      getState: getStateValue,
    });

    while (remaining.size > 0) {
      let progress = false;

      for (const step of definition.steps) {
        if (!remaining.has(step.id)) {
          continue;
        }

        const dependencies = step.dependsOn ?? [];
        const allDependenciesSucceeded = dependencies.every((dependencyId) => {
          const dependencyRecord = stepRecords.get(dependencyId);
          return dependencyRecord?.status === 'success';
        });

        if (!allDependenciesSucceeded) {
          continue;
        }

        progress = true;
        remaining.delete(step.id);

        const runStart = new Date();
        const record: StepExecution = {
          id: step.id,
          name: step.name,
          description: step.description,
          status: 'running',
          startedAt: runStart.toISOString(),
          durationMs: 0,
        };

        stepRecords.set(step.id, record);

        try {
          const output = await step.run(contextFactory());
          record.output = output;
          record.status = 'success';
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          record.status = 'failed';
          record.error = message;
        }

        record.finishedAt = new Date().toISOString();
        record.durationMs = new Date().getTime() - runStart.getTime();
      }

      if (!progress) {
        const unresolved = [...remaining];

        for (const stepId of unresolved) {
          const unresolvedStep = definition.steps.find((step) => step.id === stepId);
          if (!unresolvedStep) {
            continue;
          }

          const record: StepExecution = {
            id: stepId,
            name: unresolvedStep.name,
            description: unresolvedStep.description,
            status: 'skipped',
            startedAt: new Date().toISOString(),
            finishedAt: new Date().toISOString(),
            durationMs: 0,
            error: 'Skipped because dependencies were not satisfied or a circular dependency was detected.',
          };

          stepRecords.set(stepId, record);
          remaining.delete(stepId);
        }

        if (remaining.size > 0) {
          break;
        }
      }
    }

    const orderedSteps = definition.steps.map((step) => stepRecords.get(step.id)).filter(Boolean) as StepExecution[];
    const failed = orderedSteps.some((step) => step.status === 'failed');

    let output: TOutput | undefined;
    if (definition.finalize) {
      try {
        output = await definition.finalize(contextFactory());
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        orderedSteps.push({
          id: '__finalize__',
          name: 'finalize',
          status: 'failed',
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          durationMs: 0,
          error: message,
        });
      }
    }

    const finishedAt = new Date();

    return {
      workflowId: definition.id,
      workflowName: definition.name,
      status: failed ? 'failed' : 'success',
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      input,
      state,
      output,
      steps: orderedSteps,
    };
  }
}
