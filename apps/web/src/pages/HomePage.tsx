import {
  IconMessageCircle,
  IconDatabase,
  IconActivity,
  IconTrendingUp,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.js";
import { Button } from "@/components/ui/button.js";
import { Badge } from "@/components/ui/badge.js";
import { Separator } from "@/components/ui/separator.js";

export function HomePage() {
  // Mock data - in a real app, these would come from an API
  const stats = {
    totalQueries: 1247,
    connections: 3,
    conversations: 28,
    lastActivity: "2 minutes ago",
  };

  const recentActivity = [
    {
      id: 1,
      type: "query",
      message: "SELECT * FROM users LIMIT 10",
      time: "2 min ago",
    },
    {
      id: 2,
      type: "connection",
      message: "Connected to Production DB",
      time: "15 min ago",
    },
    {
      id: 3,
      type: "query",
      message: "Show me sales by month",
      time: "1 hour ago",
    },
    {
      id: 4,
      type: "query",
      message: "Count total orders",
      time: "2 hours ago",
    },
    {
      id: 5,
      type: "connection",
      message: "Added Staging Database",
      time: "3 hours ago",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your SQL Agent activity
          </p>
        </div>
        <Button>
          <a href="/dashboard/chat">Start New Chat</a>
        </Button>
      </div>

      <Separator />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <IconMessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalQueries.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">+12 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
            <IconDatabase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.connections}</div>
            <p className="text-muted-foreground text-xs">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <IconActivity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversations}</div>
            <p className="text-muted-foreground text-xs">5 active today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lastActivity}</div>
            <p className="text-muted-foreground text-xs">Keep it up!</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      activity.type === "query" ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {activity.type === "query" ? "Query" : "Connection"}
                  </Badge>
                  <span className="text-sm">{activity.message}</span>
                </div>
                <span className="text-muted-foreground text-xs">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <IconMessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Start a Conversation</h3>
                <p className="text-muted-foreground text-sm">
                  Ask questions about your data in natural language
                </p>
              </div>
              <Button variant="outline">
                <a href="/dashboard/chat">Chat</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <IconDatabase className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Manage Connections</h3>
                <p className="text-muted-foreground text-sm">
                  Add or configure database connections
                </p>
              </div>
              <Button variant="outline">
                <a href="/dashboard/connections">Connections</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
