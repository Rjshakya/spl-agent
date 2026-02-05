import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { env } from "cloudflare:workers";
import { Output, stepCountIs, tool, ToolLoopAgent } from "ai";
import z from "zod";

const openrouter = createOpenRouter({
  apiKey: env.OPEN_ROUTER_API_KEY,
});

// example of tool

const anyTool = tool({
  title: "",
  description: "",
  // define output schema
  inputSchema: z.object({ prop: z.string() }),
  execute: async ({ prop }) => {
    // do some thing
    return {};
  },
  // define output schema
  outputSchema: z.object({}),
});

// example agent

const agent = new ToolLoopAgent({
  model: openrouter.chat("<MODEL_NAME>"),
  tools: { anyTool },
  //    toolChoice auto | none | required
  toolChoice: "auto",
  instructions: { role: "system", content: "" },
});

// example run agent ,

const { text } = await agent.generate({ prompt: "<USER_PROMPT>" });

/****   loop control   */

/**
 *  @description
 * By default, agents run for 20 steps (stopWhen: stepCountIs(20)). In each step, the model either generates text
 * or calls a tool. If it generates text, the agent completes. If it calls a tool, the AI SDK executes that tool. To let agents
 * call
 * multiple tools in sequence, configure stopWhen to allow more steps. After each tool execution, the agent triggers a new
 * generation where the model can call another tool or generate text:
 *
 */

const agent1 = new ToolLoopAgent({
  model: openrouter.chat("<MODEL_NAME>"),
  stopWhen: stepCountIs(20), // Allow up to 20 steps
});
const agent2 = new ToolLoopAgent({
  model: openrouter.chat("<MODEL_NAME>"),
  stopWhen: [
    stepCountIs(20), // Maximum 20 steps
    // yourCustomCondition() Custom logic for when to stop
  ], // Allow up to 20 steps
});

/**
 *  @description Structured Output
 *  Define structured output schemas:
 */

const analysisAgent = new ToolLoopAgent({
  model: openrouter.chat("<MODEL_NAME>"),
  output: Output.object({
    schema: z.object({
      sentiment: z.enum(["positive", "neutral", "negative"]),
      summary: z.string(),
      keyPoints: z.array(z.string()),
    }),
  }),
  stopWhen: stepCountIs(20)
});

const { output } = await analysisAgent.generate({
  prompt: "Analyze customer feedback from the last quarter",
});

/**
 * @description Subagents
 *
 * A subagent is an agent that a parent agent can invoke. The parent delegates work via a tool, and the subagent executes
 * autonomously before returning a result.
 */

// Define a subagent for research tasks
const researchSubagent = new ToolLoopAgent({
  model: openrouter.chat("<MODEL_NAME>"),
  instructions: `You are a research agent.
Summarize your findings in your final response.`,
  tools: {
    // read: readFileTool, // defined elsewhere
    // search: searchTool, // defined elsewhere
  },
});

// Create a tool that delegates to the subagent
const researchTool = tool({
  description: "Research a topic or question in depth.",
  inputSchema: z.object({
    task: z.string().describe("The research task to complete"),
  }),
  execute: async ({ task }, { abortSignal }) => {
    const result = await researchSubagent.generate({
      prompt: task,
      abortSignal,
    });
    return result.text;
  },
});

// Main agent uses the research tool
const mainAgent = new ToolLoopAgent({
  model: openrouter.chat("<MODEL_NAME>"),
  instructions: "You are a helpful assistant that can delegate research tasks.",
  tools: {
    research: researchTool,
  },
});
