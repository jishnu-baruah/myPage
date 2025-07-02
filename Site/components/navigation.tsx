"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Projects" },
    { href: "/info", label: "Info" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <nav>
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.href} className="flex items-center">
            <span className="w-1 h-1 bg-neutral-900 dark:bg-neutral-100 rounded-full mr-2"></span>
            <Link
              href={item.href}
              className={`text-xs transition-colors ${
                pathname === item.href
                  ? "text-neutral-900 dark:text-neutral-100 font-medium"
                  : "text-neutral-900 dark:text-neutral-100 hover:text-neutral-600 dark:hover:text-neutral-400"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
