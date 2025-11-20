import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface QuickAction {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  layout?: "grid" | "vertical";
}

export default function QuickActions({
  actions,
  layout = "vertical",
}: QuickActionsProps) {
  if (layout === "grid") {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            asChild
            variant="outline"
            className="h-auto p-4 sm:p-6 flex-col gap-2 sm:gap-3 overflow-hidden"
          >
            <Link href={action.href} className="w-full overflow-hidden">
              <action.icon className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
              <div className="text-center w-full min-w-0 overflow-hidden px-2">
                <p className="font-medium text-sm sm:text-base truncate">
                  {action.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2 break-words">
                  {action.description}
                </p>
              </div>
            </Link>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              asChild
              variant="outline"
              className="justify-start h-auto p-3 sm:p-4 w-full"
            >
              <Link href={action.href} className="w-full overflow-hidden">
                <action.icon className="h-4 w-4 mr-2 sm:mr-3 flex-shrink-0" />
                <div className="text-left min-w-0 flex-1 overflow-hidden">
                  <p className="font-medium text-sm truncate">{action.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2">
                    {action.description}
                  </p>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
