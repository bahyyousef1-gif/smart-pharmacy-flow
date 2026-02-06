import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Search,
  BarChart3,
  Settings,
  Users,
  FileText,
  Bell,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const navigation = [
    {
      id: "inventory",
      name: "Inventory",
      icon: Package,
      badge: "23"
    },
    {
      id: "orders",
      name: "Smart Orders",
      icon: ShoppingCart,
      badge: "8"
    },
    {
      id: "demand-forecast",
      name: "Demand Forecast",
      icon: TrendingUp,
      badge: "NEW"
    },
    {
      id: "suppliers",
      name: "Suppliers",
      icon: Users,
      badge: null
    },
    {
      id: "help",
      name: "Help",
      icon: FileText,
      badge: null
    }
  ];

  return (
    <div className="w-64 bg-card border-r border-border h-full flex flex-col">
      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Main Menu
          </h2>
        </div>
        
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full justify-start h-11 px-3 transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary border-r-2 border-primary font-medium" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span className="flex-1 text-left">{item.name}</span>
              {item.badge && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "ml-auto text-xs h-5 px-1.5",
                    isActive ? "bg-primary/20 text-primary border-primary/30" : "bg-warning-light text-warning border-warning/30"
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
          <Settings className="h-5 w-5 mr-3" />
          Settings
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;