import { z } from "zod";
import { useTamboThread, type TamboComponent } from "@tambo-ai/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const QueryPermissionBoxPropsSchema = z
  .object({
    query: z.string().optional().describe("The SQL query to review and confirm"),
  })
  .describe("Display SQL query for user review before execution");

export type QueryPermissionBoxProps = z.infer<
  typeof QueryPermissionBoxPropsSchema
>;

function QueryPermissionBox({ query }: QueryPermissionBoxProps) {
  const { thread, sendThreadMessage } = useTamboThread();

  if (!query) return null;
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg">Review SQL Query</CardTitle>
        <CardDescription>
          Please review the generated SQL query before execution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-md overflow-x-auto">
          <pre className="text-sm font-mono whitespace-pre-wrap break-all">
            <code>{query}</code>
          </pre>
        </div>
        <div className="flex gap-3 justify-end">
          <Button
            onClick={() => sendThreadMessage("CANCEL", { threadId: thread.id })}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              sendThreadMessage("PERMISSION GRANTED", { threadId: thread.id })
            }
            className="bg-green-600 hover:bg-green-700"
          >
            Confirm & Run
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export const queryPermissionComponent: TamboComponent = {
  component: QueryPermissionBox,
  name: "PermissionBox",
  description:
    "Display SQL query for user review with Confirm and Cancel buttons. Use when you need user approval before executing a generated SQL query.",
  propsSchema: QueryPermissionBoxPropsSchema,
};

export { QueryPermissionBox };
