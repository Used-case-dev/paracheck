"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { BookmarkIcon, Search, Plus, Edit, Trash2, CheckCircle, Clock, Link2, Bold, Italic, Underline, List, ListOrdered, Square, CheckSquare } from 'lucide-react'
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

// Mock data for parameters
const mockParameters = [
  {
    id: 1,
    title: "Facebook Click ID",
    paramName: "fbclid",
    paramValue: "",
    paramType: "parameter",
    message:
      "## Facebook Click ID Detected\n\nThis URL contains a Facebook tracking parameter.\n\n[ ] Check referral source\n[ ] Verify campaign settings\n[x] Document in analytics",
    refreshHours: 4,
    frequency: "always",
    lastChecked: Date.now() - 3600000, // 1 hour ago
    emailNotifications: "admin@example.com",
    slackEnabled: true,
    slackChannel: "#marketing",
    color: "#e4f0f9", // Light blue-white
  },
  {
    id: 2,
    title: "Google Analytics",
    paramName: "utm_source",
    paramValue: "newsletter",
    paramType: "parameter",
    message:
      "## Newsletter Traffic\n\nThis visitor came from our newsletter campaign.\n\n[ ] Check conversion rate\n[ ] Update campaign dashboard",
    refreshHours: 24,
    frequency: "daily",
    lastChecked: Date.now() - 86400000, // 1 day ago
    emailNotifications: "",
    slackEnabled: false,
    slackChannel: "",
    color: "#f9f3e4", // Light warm beige
  },
  {
    id: 3,
    title: "Product Page",
    paramName: "https://example.com/products/",
    paramValue: "",
    paramType: "url",
    message:
      "## Product Page Visit\n\n[ ] Check if user added to cart\n[ ] Monitor time spent on page\n[ ] Track clicks on related products",
    refreshHours: 2,
    frequency: "always",
    lastChecked: null,
    emailNotifications: "sales@example.com",
    slackEnabled: true,
    slackChannel: "#sales",
    color: "#f1e4f9", // Light lavender
  },
]

// Function to extract parameters from a URL
const extractParamsFromUrl = (url: string) => {
  try {
    // Check if the URL is valid
    const urlObj = new URL(url);
    
    // Extract search parameters
    const searchParams = new URLSearchParams(urlObj.search);
    const params: {name: string, value: string}[] = [];
    
    searchParams.forEach((value, name) => {
      params.push({ name, value });
    });
    
    // Extract hash parameters if any
    if (urlObj.hash && urlObj.hash.includes('=')) {
      const hashParams = new URLSearchParams(urlObj.hash.substring(1));
      hashParams.forEach((value, name) => {
        params.push({ name, value });
      });
    }
    
    return params;
  } catch (error) {
    // If URL is invalid, try to extract parameters from the string directly
    const paramRegex = /[?&]([^=&]+)=([^&]*)/g;
    const params: {name: string, value: string}[] = [];
    let match;
    
    while ((match = paramRegex.exec(url)) !== null) {
      params.push({ name: match[1], value: match[2] });
    }
    
    return params;
  }
};

export default function ParametersPage() {
  const [parameters, setParameters] = useState(mockParameters)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [extractedParams, setExtractedParams] = useState<{name: string, value: string}[]>([])
  const [useEntireUrl, setUseEntireUrl] = useState(false)
  
  // Update the parameter form to better match the provided images
  // Modify the newParameter state to include color
  const [newParameter, setNewParameter] = useState({
    title: "",
    paramName: "",
    paramValue: "",
    paramType: "parameter",
    message: "",
    refreshHours: 4,
    frequency: "always",
    emailNotifications: "",
    slackEnabled: false,
    slackChannel: "",
    color: "#e4f0f9" // Default to light blue
  })

  // Extract parameters when URL changes in URL mode
  useEffect(() => {
    if (newParameter.paramType === "url" && newParameter.paramName) {
      const params = extractParamsFromUrl(newParameter.paramName);
      setExtractedParams(params);
    } else {
      setExtractedParams([]);
    }
  }, [newParameter.paramName, newParameter.paramType]);

  // Filter parameters based on search query
  const filteredParameters = parameters.filter(
    (param) =>
      param.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      param.paramName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddParameter = () => {
    const newId = Math.max(0, ...parameters.map((p) => p.id)) + 1
    const paramToAdd = {
      ...newParameter,
      id: newId,
      lastChecked: null,
    }

    setParameters([...parameters, paramToAdd])
    setIsAddDialogOpen(false)

    // Reset form
    setNewParameter({
      title: "",
      paramName: "",
      paramValue: "",
      paramType: "parameter",
      message: "",
      refreshHours: 4,
      frequency: "always",
      emailNotifications: "",
      slackEnabled: false,
      slackChannel: "",
      color: "#e4f0f9",
    })
    setExtractedParams([]);
    setUseEntireUrl(false);
  }

  const handleDeleteParameter = (id: number) => {
    if (confirm("Are you sure you want to delete this parameter?")) {
      setParameters(parameters.filter((param) => param.id !== id))
    }
  }

  // Calculate progress for a parameter's checkboxes
  const calculateProgress = (message: string) => {
    if (!message) return { total: 0, checked: 0, percentage: 0 }

    const checkboxRegex = /\[([ xX])\]/g
    const matches = message.match(checkboxRegex) || []
    const total = matches.length
    const checked = matches.filter((match) => match.includes("x") || match.includes("X")).length
    const percentage = total > 0 ? Math.round((checked / total) * 100) : 0

    return { total, checked, percentage }
  }

  // Handle selecting a parameter from the extracted list
  const handleSelectParam = (param: {name: string, value: string}) => {
    setNewParameter({
      ...newParameter,
      paramType: "parameter",
      paramName: param.name,
      paramValue: param.value,
      title: param.name // Set a default title based on the parameter name
    });
  };

  // Handle using the entire URL
  const handleUseEntireUrl = () => {
    setUseEntireUrl(true);
    // Keep the URL in paramName but switch to URL mode
    setNewParameter({
      ...newParameter,
      paramType: "url",
      paramValue: "",
      title: "URL Monitor" // Set a default title
    });
  };

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Parameters</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search parameters..."
              className="w-full md:w-[200px] pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Parameter
              </Button>
            </DialogTrigger>
            {/* Update the parameter form dialog content to better match the provided images */}
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Parameter</DialogTitle>
                <DialogDescription>Create a new parameter to track on your websites</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 overflow-hidden rounded-md border">
                  <button
                    type="button"
                    className={`py-3 text-center font-medium ${
                      newParameter.paramType === "parameter" ? "bg-primary text-white" : "bg-white text-gray-700"
                    }`}
                    onClick={() => {
                      setNewParameter({ ...newParameter, paramType: "parameter" });
                      setUseEntireUrl(false);
                    }}
                  >
                    Parameter Mode
                  </button>
                  <button
                    type="button"
                    className={`py-3 text-center font-medium ${
                      newParameter.paramType === "url" ? "bg-primary text-white" : "bg-white text-gray-700"
                    }`}
                    onClick={() => setNewParameter({ ...newParameter, paramType: "url", paramValue: "" })}
                  >
                    URL Mode
                  </button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Parameter title"
                    value={newParameter.title}
                    onChange={(e) => setNewParameter({ ...newParameter, title: e.target.value })}
                  />
                </div>

                {newParameter.paramType === "parameter" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="paramName">Parameter Name</Label>
                      <Input
                        id="paramName"
                        placeholder="e.g. fbclid"
                        value={newParameter.paramName}
                        onChange={(e) => setNewParameter({ ...newParameter, paramName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paramValue">Parameter Value</Label>
                      <Input
                        id="paramValue"
                        placeholder="e.g. 1234567890"
                        value={newParameter.paramValue}
                        onChange={(e) => setNewParameter({ ...newParameter, paramValue: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullUrl">Full URL</Label>
                      <Input
                        id="fullUrl"
                        placeholder="https://example.com/path?param=value"
                        value={newParameter.paramName}
                        onChange={(e) => setNewParameter({ ...newParameter, paramName: e.target.value, paramValue: "" })}
                      />
                    </div>
                    
                    {/* Display extracted parameters */}
                    {extractedParams.length > 0 && (
                      <div className="space-y-2 mt-2">
                        <div className="flex flex-wrap gap-2">
                          {extractedParams.map((param, index) => (
                            <button
                              key={index}
                              type="button"
                              className="px-3 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200 transition-colors"
                              onClick={() => handleSelectParam(param)}
                            >
                              {param.name}={param.value}
                            </button>
                          ))}
                        </div>
                        
                        <Button 
                          variant="outline" 
                          className="w-full mt-2 flex items-center justify-center"
                          onClick={handleUseEntireUrl}
                        >
                          <Link2 className="mr-2 h-4 w-4" />
                          Use Entire URL
                        </Button>
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="message">Notification Message</Label>
                  <div className="border rounded-md">
                    <div className="flex border-b p-2 gap-2 overflow-x-auto">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Underline className="h-4 w-4" />
                      </Button>
                      <Separator orientation="vertical" />
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <span className="font-bold">H1</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <span className="font-bold">H2</span>
                      </Button>
                      <Separator orientation="vertical" />
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <List className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ListOrdered className="h-4 w-4" />
                      </Button>
                      <Separator orientation="vertical" />
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Square className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <CheckSquare className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      id="message"
                      placeholder="Enter notification message..."
                      className="min-h-[150px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      value={newParameter.message}
                      onChange={(e) => setNewParameter({ ...newParameter, message: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refreshHours">Time Interval (hours, max 24)</Label>
                  <Input
                    id="refreshHours"
                    type="number"
                    min={1}
                    max={24}
                    value={newParameter.refreshHours}
                    onChange={(e) =>
                      setNewParameter({ ...newParameter, refreshHours: Number.parseInt(e.target.value) || 4 })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Notification Frequency</Label>
                  <Select
                    value={newParameter.frequency}
                    onValueChange={(value) => setNewParameter({ ...newParameter, frequency: value })}
                  >
                    <SelectTrigger id="frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">Show every time (default)</SelectItem>
                      <SelectItem value="once">Show only once</SelectItem>
                      <SelectItem value="daily">Show once a day</SelectItem>
                      <SelectItem value="weekly">Show once a week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailNotifications">Email Notifications (comma separated)</Label>
                  <Input
                    id="emailNotifications"
                    placeholder="email1@example.com, email2@example.com"
                    value={newParameter.emailNotifications}
                    onChange={(e) => setNewParameter({ ...newParameter, emailNotifications: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="slackEnabled">Slack Notifications</Label>
                    <Switch
                      id="slackEnabled"
                      checked={newParameter.slackEnabled}
                      onCheckedChange={(checked) => setNewParameter({ ...newParameter, slackEnabled: checked })}
                    />
                  </div>
                  {newParameter.slackEnabled && (
                    <div className="pt-2">
                      <Label htmlFor="slackChannel">Slack Channel</Label>
                      <Input
                        id="slackChannel"
                        placeholder="#general (leave empty for default)"
                        value={newParameter.slackChannel}
                        onChange={(e) => setNewParameter({ ...newParameter, slackChannel: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Parameter Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "#e4f0f9",
                      "#e6f4f1",
                      "#f9f3e4",
                      "#f1e4f9",
                      "#e4f9e6",
                      "#f9e4e4",
                      "#e4f9e4",
                      "#f9e4d4",
                      "#e4e4f9",
                      "#f2f2f2",
                    ].map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`h-10 w-10 rounded-md border ${newParameter.color === color ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewParameter({ ...newParameter, color: color })}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <span className="mr-2">👁️</span>
                    Test Popup
                  </Button>
                  <Button onClick={handleAddParameter}>
                    <span className="mr-2">💾</span>
                    Save
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filteredParameters.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border">
          <BookmarkIcon className="h-12 w-12 text-gray-300 mb-4" />
          {searchQuery ? (
            <>
              <h3 className="text-lg font-medium mb-1">No parameters found</h3>
              <p className="text-sm text-gray-500">Try a different search term</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium mb-1">No parameters yet</h3>
              <p className="text-sm text-gray-500 mb-4">Add your first parameter to get started</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Parameter
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredParameters.map((param) => {
            const progress = calculateProgress(param.message)
            const isChecked = param.lastChecked && Date.now() - param.lastChecked < param.refreshHours * 3600000

            return (
              <Card key={param.id} style={{ backgroundColor: param.color || "#f2f2f2" }}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-medium">{param.title}</CardTitle>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteParameter(param.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {param.paramType === "url" ? (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">URL</span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Parameter</span>
                    )}
                    <span className="ml-2 text-xs text-gray-500">
                      {param.paramType === "url"
                        ? param.paramName.substring(0, 30) + (param.paramName.length > 30 ? "..." : "")
                        : `${param.paramName}${param.paramValue ? `=${param.paramValue}` : ""}`}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {param.message && (
                      <div className="text-sm bg-white p-3 rounded border">
                        {param.message.split("\n").map((line, i) => {
                          if (line.startsWith("##")) {
                            return (
                              <h3 key={i} className="font-bold text-sm">
                                {line.replace("##", "")}
                              </h3>
                            )
                          } else if (line.match(/\[([ xX])\]/)) {
                            const isChecked = line.match(/\[(x|X)\]/)
                            return (
                              <div key={i} className="flex items-center space-x-2">
                                <div
                                  className={`w-4 h-4 border rounded flex items-center justify-center ${isChecked ? "bg-primary border-primary" : "border-gray-300"}`}
                                >
                                  {isChecked && <CheckCircle className="h-3 w-3 text-white" />}
                                </div>
                                <span>{line.replace(/\[([ xX])\]\s*/, "")}</span>
                              </div>
                            )
                          } else if (line.trim()) {
                            return (
                              <p key={i} className="text-sm">
                                {line}
                              </p>
                            )
                          } else {
                            return <br key={i} />
                          }
                        })}
                      </div>
                    )}

                    {progress.total > 0 && (
                      <div className="space-y-1">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${progress.percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-right text-gray-500">
                          {progress.checked}/{progress.total} ({progress.percentage}%)
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center">
                    {isChecked ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        <span>Checked {new Date(param.lastChecked).toLocaleTimeString()}</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 text-gray-400 mr-1" />
                        <span>{param.lastChecked ? "Needs check" : "Not checked yet"}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {param.emailNotifications && (
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">Email</span>
                    )}
                    {param.slackEnabled && (
                      <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-[10px]">Slack</span>
                    )}
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

