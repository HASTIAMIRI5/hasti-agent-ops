import { config as loadEnv } from 'dotenv';
import { WorkflowEngine } from './orchestrator.js';
import type { WorkflowDefinition } from './types.js';

loadEnv();

type ResearchInput = {
  prompt: string;
  context?: string;
};

type ResearchState = {
  findings: string[];
  summary: string;
  actionPlan: string[];
};

type ResearchOutput = {
  title: string;
  summary: string;
  actionPlan: string[];
};

const workflow: WorkflowDefinition<ResearchInput, ResearchState, ResearchOutput> = {
  id: 'ai-research-pipeline',
  name: 'AI Research Workflow',
  description: 'Generate structured research insights from a user prompt.',
  steps: [
    {
      id: 'collect-findings',
      name: 'Collect findings',
      description: 'Gather the main research signals from the user prompt and context.',
      run: ({ input, setState }) => {
        const findings = [
          `Prompt: ${input.prompt}`,
          input.context ? `Context: ${input.context}` : 'Context: no additional constraints provided',
          'Goal: produce a practical action plan grounded in the request.',
        ];

        setState({ findings });
        return findings;
      },
    },
    {
      id: 'summarize',
      name: 'Summarize findings',
      description: 'Turn raw findings into a concise narrative summary.',
      dependsOn: ['collect-findings'],
      run: ({ state }) => {
        const summary = state.findings
          .map((item) => item.replace(/^\s+/, ''))
          .join(' | ')
          .slice(0, 260);

        return summary;
      },
    },
    {
      id: 'build-plan',
      name: 'Build action plan',
      description: 'Convert the summary into a concrete roadmap.',
      dependsOn: ['summarize'],
      run: ({ input, state, setState }) => {
        const plan = [
          `Clarify the goal behind: ${input.prompt}`,
          'Define success metrics and constraints early',
          'Map the work into small, testable phases',
          'Validate outcomes and iterate based on evidence',
        ];

        setState({
          summary: state.summary || 'Operational summary generated',
          actionPlan: plan,
        });

        return plan;
      },
    },
  ],
  finalize: ({ input, state }) => ({
    title: `Workflow output for: ${input.prompt}`,
    summary: state.summary || `Summary generated for ${input.prompt}`,
    actionPlan: state.actionPlan ?? [
      'Define the objective',
      'Break it into measurable steps',
      'Review and refine based on results',
    ],
  }),
};

async function main(): Promise<void> {
  const prompt = process.argv[2] ?? 'Design an AI ops workflow for a modern startup';
  const context = process.argv[3] ?? 'Prioritize reliability, human oversight, and rapid iteration.';

  const engine = new WorkflowEngine();
  const result = await engine.execute(
    workflow,
    {
      prompt,
      context,
    },
    { findings: [], summary: '', actionPlan: [] },
  );

  console.log(JSON.stringify({
    workflowId: result.workflowId,
    workflowName: result.workflowName,
    status: result.status,
    durationMs: result.durationMs,
    output: result.output,
    steps: result.steps.map((step) => ({
      id: step.id,
      name: step.name,
      status: step.status,
      durationMs: step.durationMs,
      error: step.error,
    })),
  }, null, 2));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`Workflow execution failed: ${message}`);
  process.exitCode = 1;
});
