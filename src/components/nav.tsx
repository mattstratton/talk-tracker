"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/events", label: "Events" },
  { href: "/talks", label: "Talks" },
  { href: "/proposals", label: "Proposals" },
  { href: "/analytics", label: "Analytics" },
  { href: "/calendar", label: "Calendar" },
  { href: "/settings", label: "Settings" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="sm" variant="ghost">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    className={`w-full justify-start ${
                      pathname === item.href ? "text-gray-900" : ""
                    }`}
                    variant="ghost"
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              className={`whitespace-nowrap ${
                pathname === item.href ? "text-gray-900" : ""
              }`}
              size="sm"
              type="button"
              variant="ghost"
            >
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
    </>
  );
}
