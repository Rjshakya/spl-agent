import { useState } from "react";
import {
  IconDatabase,
  IconPlus,
  IconTrash,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card.js";
import { Badge } from "@/components/ui/badge.js";
import { Separator } from "@/components/ui/separator.js";

interface Connection {
  id: string;
  name: string;
  connectionString: string;
  createdAt: Date;
}

export function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([
    {
      id: "1",
      name: "Production DB",
      connectionString: "postgresql://localhost:5432/production",
      createdAt: new Date("2026-01-15"),
    },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newConnectionName, setNewConnectionName] = useState("");
  const [newConnectionString, setNewConnectionString] = useState("");
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");

  const handleAddConnection = () => {
    if (!newConnectionName.trim() || !newConnectionString.trim()) return;

    const newConnection: Connection = {
      id: Date.now().toString(),
      name: newConnectionName.trim(),
      connectionString: newConnectionString.trim(),
      createdAt: new Date(),
    };

    setConnections([...connections, newConnection]);
    setNewConnectionName("");
    setNewConnectionString("");
    setIsAdding(false);
    setTestStatus("idle");
  };

  const handleDeleteConnection = (id: string) => {
    setConnections(connections.filter((c) => c.id !== id));
  };

  const handleTestConnection = () => {
    setTestStatus("testing");
    // Simulate connection test
    setTimeout(() => {
      setTestStatus("success");
    }, 1500);
  };

  const maskConnectionString = (str: string) => {
    // Simple masking for display purposes
    if (str.length <= 20) return str;
    return str.substring(0, 20) + "...";
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Database Connections</h1>
          <p className="text-muted-foreground mt-1">
            Manage your PostgreSQL database connections
          </p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <IconPlus className="mr-2 h-4 w-4" />
          Add Connection
        </Button>
      </div>

      <Separator />

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Connection</CardTitle>
            <CardDescription>
              Enter your PostgreSQL connection details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Connection Name</label>
              <Input
                placeholder="e.g., Production Database"
                value={newConnectionName}
                onChange={(e) => setNewConnectionName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Connection String</label>
              <Input
                placeholder="postgresql://user:password@host:port/database"
                value={newConnectionString}
                onChange={(e) => setNewConnectionString(e.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                Format: postgresql://username:password@host:port/database
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={
                  testStatus === "testing" || !newConnectionString.trim()
                }
              >
                {testStatus === "testing" ? (
                  <>Testing...</>
                ) : testStatus === "success" ? (
                  <>
                    <IconCheck className="mr-2 h-4 w-4 text-green-500" />
                    Connection successful
                  </>
                ) : testStatus === "error" ? (
                  <>
                    <IconX className="mr-2 h-4 w-4 text-red-500" />
                    Connection failed
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAdding(false);
                  setNewConnectionName("");
                  setNewConnectionString("");
                  setTestStatus("idle");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddConnection}
                disabled={
                  !newConnectionName.trim() || !newConnectionString.trim()
                }
              >
                Save Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {connections.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <IconDatabase className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground mt-4">
                No connections configured yet
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsAdding(true)}
              >
                <IconPlus className="mr-2 h-4 w-4" />
                Add your first connection
              </Button>
            </CardContent>
          </Card>
        ) : (
          connections.map((connection) => (
            <Card key={connection.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <IconDatabase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{connection.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        PostgreSQL
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {maskConnectionString(connection.connectionString)}
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Added {connection.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteConnection(connection.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <IconTrash className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
