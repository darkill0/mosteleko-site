
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  trendValue, 
  className 
}: StatsCardProps) {
  return (
    <div className={cn(
      "bg-card text-card-foreground p-6 rounded-lg card-shadow hover-scale transition-all duration-300",
      className
    )}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-1">{value}</h3>
          {description && (
            <p className="text-sm mt-1 text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                trend === "up" ? "bg-success/15 text-success" : 
                trend === "down" ? "bg-destructive/15 text-destructive" : 
                "bg-muted text-muted-foreground"
              )}>
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
