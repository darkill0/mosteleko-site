import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileCheck,
  Users,
  Smartphone,
  Store,
  Wrench,
  Boxes,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get user role from localStorage
  const userRole = localStorage.getItem("role");

  const menuItems = [
    { icon: LayoutDashboard, label: "Главная", path: "/", roles: ["Менеджер", "Администратор"] },
    { icon: FileCheck, label: "Гарантийные случаи", path: "/warranty-cases", roles: ["Менеджер", "Администратор"] },
    { icon: Users, label: "Клиенты", path: "/customers", roles: ["Менеджер", "Администратор"] },
    { icon: Smartphone, label: "Устройства", path: "/devices", roles: ["Менеджер", "Администратор"] },
    { icon: Store, label: "Магазины", path: "/stores", roles: ["Менеджер", "Администратор"] },
    { icon: Boxes, label: "Запчасти", path: "/parts", roles: ["Менеджер", "Администратор"] },
    { icon: Wrench, label: "Поставщики", path: "/suppliers", roles: ["Администратор"] },
    { icon: Users, label: "Работники", path: "/employees", roles: ["Администратор"] },
    { icon: Users, label: "Пользователи", path: "/users", roles: ["Администратор"] },
    { icon: Settings, label: "Настройки", path: "/settings", roles: ["Администратор"] },
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter((item) => item.roles.includes(userRole));

  return (
      <aside
          className={cn(
              "h-screen bg-sidebar relative flex flex-col transition-all duration-300 ease-in-out border-r border-sidebar-border",
              collapsed ? "w-[70px]" : "w-[250px]"
          )}
      >
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
          <div className={cn("flex items-center", collapsed ? "justify-center w-full" : "")}>
            <div className="text-sidebar-foreground font-bold text-2xl flex items-center gap-3">
              {!collapsed && <span>Tele2</span>}
              {collapsed ? (
                  <span className="text-sidebar-foreground">T2</span>
              ) : (
                  <span className="text-sidebar-accent">Warranty</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 py-6 flex flex-col justify-between">
          <nav className="px-2 space-y-1">
            {visibleMenuItems.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                        "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 group",
                        location.pathname === item.path
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-primary/50"
                    )}
                >
                  <item.icon className={cn("flex-shrink-0 h-5 w-5 mr-3", collapsed ? "mr-0" : "")} />
                  <span className={cn("truncate", collapsed ? "opacity-0 w-0" : "opacity-100")}>
                {item.label}
              </span>
                </Link>
            ))}
          </nav>

          <div className="px-2">
            <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md w-full text-sidebar-foreground hover:bg-sidebar-primary/50 transition-all duration-200"
            >
              <LogOut className={cn("flex-shrink-0 h-5 w-5 mr-3", collapsed ? "mr-0" : "")} />
              <span className={cn("truncate", collapsed ? "opacity-0 w-0" : "opacity-100")}>
              Выход
            </span>
            </button>
          </div>
        </div>

        <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 bg-sidebar p-1 rounded-full text-sidebar-foreground hover:text-sidebar-accent border border-sidebar-border"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>
  );
}