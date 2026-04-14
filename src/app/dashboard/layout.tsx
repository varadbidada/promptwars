"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Clock, Map as MapIcon, Package, MoveRight, Bell, Radio } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const navItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Washrooms", icon: Clock, href: "/dashboard/washrooms" },
    { name: "Inventory", icon: Package, href: "/dashboard/inventory" },
    { name: "Gate Control", icon: Users, href: "/dashboard/gates" },
    { name: "Exit Management", icon: MoveRight, href: "/exit" },
    { name: "Companion Tracker", icon: Users, href: "/attendee/companions" },
  ];

  return (
    <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
      <aside className="w-[220px] bg-surface/80 border-r border-glass flex flex-col pt-6 backdrop-blur-xl hidden md:flex shrink-0">
        <div className="px-4 mb-6">
           <span className="text-xs uppercase font-mono text-gray-500 tracking-wider">Control Panel</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 mt-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active 
                    ? "bg-electric/10 text-electric border-l-2 border-electric shadow-[inset_2px_0_10px_rgba(0,229,255,0.1)]" 
                    : "text-gray-400 hover:bg-glass hover:text-white border-l-2 border-transparent"
                }`}
              >
                <item.icon className={`w-5 h-5 ${active ? "text-electric" : "opacity-70"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-glass">
            <div className="bg-green/10 border border-green/20 rounded-lg p-3 text-sm flex items-start space-x-2">
                <Radio className="w-4 h-4 text-green mt-0.5 animate-pulse shrink-0" />
                <span className="text-green text-xs font-mono">ALL SYSTEMS NOMINAL</span>
            </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 bg-navy/50 relative">
        <div className="max-w-6xl mx-auto space-y-6">
           {children}
        </div>
      </main>
    </div>
  );
}
