"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { BarChart3, Settings, Users, LogOut, Menu, BookmarkIcon, Bell } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function DashboardLayout({
children,
}: {
children: React.ReactNode
}) {
const router = useRouter()
const pathname = usePathname()
const [user, setUser] = useState<any>(null)
const [isMounted, setIsMounted] = useState(false)

useEffect(() => {
  setIsMounted(true)
  // Check if user is logged in
  const userData = localStorage.getItem("paracheck-user")
  if (!userData) {
    router.push("/login")
    return
  }

  try {
    setUser(JSON.parse(userData))
  } catch (error) {
    console.error("Failed to parse user data", error)
    router.push("/login")
  }
}, [router])

const handleLogout = () => {
  localStorage.removeItem("paracheck-user")
  router.push("/login")
}

if (!isMounted) {
  return null // Prevent hydration errors
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Parameters", href: "/dashboard/parameters", icon: BookmarkIcon },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

return (
  <div className="flex h-screen bg-gray-50">
    {/* Sidebar for desktop */}
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto border-r bg-white">
        <div className="flex items-center flex-shrink-0 px-4 mb-5">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Paracheck Logo" width={34} height={34} className="rounded-md" />
            <div className="flex flex-col">
              <span className="font-bold text-lg">paracheck</span>
              <span className="text-xs text-gray-500">parameter pop up</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-grow px-4 mt-5">
          <nav className="flex-1 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-500"}`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 p-4 border-t">
          <Button variant="outline" className="w-full justify-start text-left font-normal" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>
    </div>

    {/* Mobile sidebar */}
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden ml-2 mt-2">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Paracheck Logo" width={34} height={34} className="rounded-md" />
              <div className="flex flex-col">
                <span className="font-bold text-lg">paracheck</span>
                <span className="text-xs text-gray-500">parameter pop up</span>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-500"}`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full justify-start text-left font-normal" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>

    {/* Main content */}
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Top navigation */}
      <header className="bg-white shadow-sm z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center md:hidden">
              {/* Mobile logo - shown when sidebar is hidden */}
              <div className="flex items-center gap-2 ml-10">
                <Image src="/logo.png" alt="Paracheck Logo" width={24} height={24} className="rounded-md md:hidden" />
                <span className="font-bold text-lg md:hidden">paracheck</span>
              </div>
            </div>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="mr-2">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="ml-3 relative">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                    {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </div>
                  <div className="hidden md:flex flex-col">
                    <span className="text-sm font-medium">
                      {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : user?.email}
                    </span>
                    {user?.companyName && <span className="text-xs text-gray-500">{user.companyName}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
    </div>
  </div>
)
}

