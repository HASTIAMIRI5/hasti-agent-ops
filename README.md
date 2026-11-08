# hasti-agent-ops

Modern AI workflow orchestration platform starter for building structured, repeatable automation pipelines in TypeScript.

This project gives you a clean foundation for orchestrating AI-powered tasks, multi-step workflows, dependency-aware execution, and reusable runtime state management.

## Why this project exists

AI systems are rarely a single step. They often require:

- prompt collection and validation
- context preprocessing
- multi-stage reasoning or task execution
- state tracking between steps
- final synthesis or output generation
- observability of what ran, when, and why

`hasti-agent-ops` is a lightweight starter for that pattern. It provides a workflow engine that can run dependency-based steps, manage state, and expose results in a predictable structure.

## Features

- Dependency-aware workflow execution
- Typed workflow definitions
- Mutable runtime state with setters and readers
- Step lifecycle tracking with status and timing
- Finalization step for output synthesis
- TypeScript-first architecture for easy extension
- Example AI research workflow included

## Project structure

```text
hasti-agent-ops/
├── src/
│   ├── index.ts
│   ├── orchestrator.ts
│   ├── types.ts
│   └── ...
├── .env.example
├── .gitignore
├── LICENSE
├── package.json
├── README.md
├── tsconfig.json
└── dist/ (generated after build)
```

## Getting started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Install dependencies

```bash
npm install
```

### Run the example workflow

```bash
npm run dev -- "Build an AI workflow for a startup team" "Prioritize speed, transparency, and automation"
```

### Build the project

```bash
npm run build
```

### Start the compiled app

```bash
npm start -- "Design a marketing automation pipeline"
```

## Example workflow

The project includes an example `AI Research Workflow` in `src/index.ts` that demonstrates:

1. collecting input and context
2. summarizing findings
3. converting results into a practical action plan
4. returning a structured output object

## Core concepts

### WorkflowDefinition

A workflow definition defines the pipeline shape:

- workflow id and name
- base description
- ordered steps
- optional finalize hook

### WorkflowEngine

The workflow engine executes each step in order while respecting dependencies. It tracks:

- step status
- start/end timestamps
- execution duration
- outputs/errors
- final workflow result

### WorkflowContext

Each step receives context containing:

- the original input payload
- current workflow state
- `setState()` helper for updates
- `getState()` helper for reading values

## Environment configuration

Copy the example file:

```bash
cp .env.example .env
```

Then update values such as ports and AI provider settings as needed:

```env
PORT=3000
APP_NAME=hasti-agent-ops
LOG_LEVEL=info
```

## Example output

```json
{
  "workflowId": "ai-research-pipeline",
  "workflowName": "AI Research Workflow",
  "status": "success",
  "durationMs": 12,
  "output": {
    "title": "Workflow output for: Build an AI workflow for a startup team",
    "summary": "Prompt: Build an AI workflow for a startup team | Context: Prioritize speed, transparency, and automation",
    "actionPlan": [
      "Clarify the goal behind: Build an AI workflow for a startup team",
      "Define success metrics and constraints early",
      "Map the work into small, testable phases",
      "Validate outcomes and iterate based on evidence"
    ]
  }
}
```

## Extending the starter

This starter is designed to be expanded into a real product. Common next steps include:

- integrating LLM providers (OpenAI, Anthropic, etc.)
- adding API routes with Express or Fastify
- persisting workflow runs to a database
- adding job queues for asynchronous execution
- exposing a dashboard for monitoring execution
- adding retries, error handling, and human approval steps

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contributing

Contributions are welcome. If you want to improve the engine, add new workflow types, or build a richer AI orchestration experience, open an issue or submit a pull request.

## Roadmap

Planned enhancements may include:

- real agent/provider integrations
- workflow persistence and replay
- execution tracing
- validation and retry strategies
- event-driven orchestration
- production-ready API scaffolding
