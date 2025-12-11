'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ChevronDown, ChevronUp, Download, RefreshCw, Zap, Box, Settings } from 'lucide-react'

const SAMPLE_PROBLEM = "I need a customer support chatbot that answers questions from 5 PDF product manuals. It should handle about 3000 queries per month, support multi-turn conversations with memory, integrate with Slack for notifications, and comply with data privacy regulations."

interface ArchitectureData {
  problemSummary: string
  agentsCount: number
  agentBreakdown: Array<{ name: string; purpose: string; complexity: string }>
  knowledgeBases: { count: number; averageSize: string; types: string[] }
  tools: { count: number; list: string[]; integrations: string[] }
  estimatedMonthlyVolume: { queries: number; avgConversationTurns: number; totalTokenEstimate: number }
  raiRequirements: string[]
  memoryNeeds: string
  complexity: string
}

interface CostData {
  setupCosts: {
    agents: { quantity: number; unitCost: number; total: number }
    knowledgeBases: { quantity: number; unitCost: number; total: number }
    tools: { quantity: number; unitCost: number; total: number }
    raiCompliance: { quantity: number; unitCost: number; total: number }
    totalSetup: number
  }
  monthlyCosts: {
    agentExecution: { queries: number; costPerQuery: number; total: number }
    kbRetrieval: { retrievals: number; costPerRetrieval: number; total: number }
    tokenProcessing: { estimatedTokens: number; costPer1k: number; total: number }
    sessionManagement: { sessions: number; costPerSession: number; total: number }
    memoryStorage: { gbPerMonth: number; costPerGb: number; total: number }
    totalMonthly: number
  }
  projections: {
    monthlyAverage: number
    quarterly: number
    annual: number
    costPerQuery: number
  }
  breakdownByCategory: { infrastructure: number; api: number; processing: number; storage: number }
  recommendations: string[]
}

interface CalculationResult {
  architecture: ArchitectureData
  costs: CostData
  summary: {
    totalSetup: number
    monthlyAverage: number
    annualProjection: number
    costPerQuery: number
    key_insights: string[]
  }
}

const SAMPLE_RESULT: CalculationResult = {
  architecture: {
    problemSummary: 'Customer support chatbot with 5 knowledge bases handling 3000 monthly queries',
    agentsCount: 2,
    agentBreakdown: [
      { name: 'Support Chatbot Agent', purpose: 'Handles customer inquiries and knowledge base retrieval', complexity: 'medium' },
      { name: 'Slack Notifier Agent', purpose: 'Sends notifications to support channels', complexity: 'low' }
    ],
    knowledgeBases: { count: 5, averageSize: '100-200 pages each', types: ['PDF documents', 'Product manuals'] },
    tools: { count: 2, list: ['Slack integration', 'PDF retrieval'], integrations: ['Slack', 'Internal APIs'] },
    estimatedMonthlyVolume: { queries: 3000, avgConversationTurns: 3, totalTokenEstimate: 450000 },
    raiRequirements: ['Data privacy compliance', 'GDPR adherence'],
    memoryNeeds: 'medium',
    complexity: 'moderate'
  },
  costs: {
    setupCosts: {
      agents: { quantity: 2, unitCost: 50, total: 100 },
      knowledgeBases: { quantity: 5, unitCost: 100, total: 500 },
      tools: { quantity: 2, unitCost: 25, total: 50 },
      raiCompliance: { quantity: 2, unitCost: 500, total: 1000 },
      totalSetup: 1650
    },
    monthlyCosts: {
      agentExecution: { queries: 3000, costPerQuery: 0.1, total: 300 },
      kbRetrieval: { retrievals: 3000, costPerRetrieval: 0.05, total: 150 },
      tokenProcessing: { estimatedTokens: 450000, costPer1k: 0.001, total: 450 },
      sessionManagement: { sessions: 1000, costPerSession: 0.2, total: 200 },
      memoryStorage: { gbPerMonth: 2, costPerGb: 0.5, total: 1 },
      totalMonthly: 1101
    },
    projections: {
      monthlyAverage: 1101,
      quarterly: 3303,
      annual: 13212,
      costPerQuery: 0.367
    },
    breakdownByCategory: { infrastructure: 450, api: 450, processing: 150, storage: 51 },
    recommendations: [
      'Consider caching frequently asked questions to reduce KB retrievals',
      'Implement rate limiting to optimize monthly query costs',
      'Review session management strategy for further optimization'
    ]
  },
  summary: {
    totalSetup: 1650,
    monthlyAverage: 1101,
    annualProjection: 13212,
    costPerQuery: 0.367,
    key_insights: [
      'Token processing dominates operational costs at 40.8%',
      'KB-heavy solutions require strategic retrieval optimization',
      'Memory and session management are relatively low-cost components'
    ]
  }
}

export default function CostCalculator() {
  const [problemStatement, setProblemStatement] = useState(SAMPLE_PROBLEM)
  const [monthlyQueries, setMonthlyQueries] = useState(1000)
  const [conversationTurns, setConversationTurns] = useState(3)
  const [modelPreference, setModelPreference] = useState('gpt-4o-mini')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CalculationResult>(SAMPLE_RESULT)
  const [showDetails, setShowDetails] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>('setup')

  const handleCalculate = async () => {
    if (!problemStatement.trim()) {
      alert('Please enter a problem statement')
      return
    }

    setLoading(true)
    setShowDetails(false)

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${problemStatement}\n\nUsage estimates: ${monthlyQueries} queries/month, ${conversationTurns} avg conversation turns, preferred model: ${modelPreference}`,
          agent_id: '693a5648829cb256a64c4244'
        })
      })

      const data = await response.json()

      if (data.success && data.response) {
        const calculationResult = typeof data.response === 'string' ? JSON.parse(data.response) : data.response
        setResult(calculationResult)
        setShowDetails(true)
        setExpandedSection('setup')
      } else {
        alert('Failed to calculate costs. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setProblemStatement(SAMPLE_PROBLEM)
    setMonthlyQueries(1000)
    setConversationTurns(3)
    setModelPreference('gpt-4o-mini')
    setShowDetails(false)
    setResult(SAMPLE_RESULT)
  }

  const handleExport = () => {
    if (!result) return

    const csv = [
      ['Lyzr Credit Cost Calculator - Estimate'],
      [],
      ['Problem Summary', result.architecture.problemSummary],
      ['Solution Complexity', result.architecture.complexity],
      [],
      ['SETUP COSTS (One-time)'],
      ['Item', 'Quantity', 'Unit Cost', 'Total'],
      ['Agents', result.costs.setupCosts.agents.quantity, `$${result.costs.setupCosts.agents.unitCost}`, `$${result.costs.setupCosts.agents.total}`],
      ['Knowledge Bases', result.costs.setupCosts.knowledgeBases.quantity, `$${result.costs.setupCosts.knowledgeBases.unitCost}`, `$${result.costs.setupCosts.knowledgeBases.total}`],
      ['Tools', result.costs.setupCosts.tools.quantity, `$${result.costs.setupCosts.tools.unitCost}`, `$${result.costs.setupCosts.tools.total}`],
      ['RAI Compliance', result.costs.setupCosts.raiCompliance.quantity, `$${result.costs.setupCosts.raiCompliance.unitCost}`, `$${result.costs.setupCosts.raiCompliance.total}`],
      ['TOTAL SETUP', '', '', `$${result.costs.setupCosts.totalSetup}`],
      [],
      ['MONTHLY COSTS'],
      ['Item', 'Volume', 'Unit Cost', 'Total'],
      ['Agent Execution', result.costs.monthlyCosts.agentExecution.queries, `$${result.costs.monthlyCosts.agentExecution.costPerQuery}`, `$${result.costs.monthlyCosts.agentExecution.total}`],
      ['KB Retrieval', result.costs.monthlyCosts.kbRetrieval.retrievals, `$${result.costs.monthlyCosts.kbRetrieval.costPerRetrieval}`, `$${result.costs.monthlyCosts.kbRetrieval.total}`],
      ['Token Processing', `${(result.costs.monthlyCosts.tokenProcessing.estimatedTokens / 1000).toFixed(0)}k tokens`, `$${result.costs.monthlyCosts.tokenProcessing.costPer1k}`, `$${result.costs.monthlyCosts.tokenProcessing.total}`],
      ['Session Management', result.costs.monthlyCosts.sessionManagement.sessions, `$${result.costs.monthlyCosts.sessionManagement.costPerSession}`, `$${result.costs.monthlyCosts.sessionManagement.total}`],
      ['Memory Storage', `${result.costs.monthlyCosts.memoryStorage.gbPerMonth}GB`, `$${result.costs.monthlyCosts.memoryStorage.costPerGb}`, `$${result.costs.monthlyCosts.memoryStorage.total}`],
      ['TOTAL MONTHLY', '', '', `$${result.costs.monthlyCosts.totalMonthly.toFixed(2)}`],
      [],
      ['ANNUAL PROJECTIONS'],
      ['Monthly Average', `$${result.costs.projections.monthlyAverage.toFixed(2)}`],
      ['Quarterly', `$${result.costs.projections.quarterly.toFixed(2)}`],
      ['Annual', `$${result.costs.projections.annual.toFixed(2)}`],
      ['Cost Per Query', `$${result.costs.projections.costPerQuery.toFixed(3)}`]
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lyzr-cost-estimate.csv'
    a.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1f36] via-[#0f1419] to-[#1a1f36]">
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-to-r from-[#1a1f36]/80 to-[#0f1419]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-[#4f6ef7]" />
            <h1 className="text-3xl font-bold text-white">Lyzr Cost Calculator</h1>
          </div>
          <p className="text-gray-400 text-sm">Design your agent architecture and understand deployment costs instantly</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <Card className="border-white/10 bg-white/5 backdrop-blur sticky top-20">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#4f6ef7]" />
                  Calculator Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Problem Statement */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white block">Problem Statement</label>
                  <Textarea
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    placeholder="Describe your use case... e.g., 'I need a customer support bot that answers from 5 PDF manuals...'"
                    className="min-h-[120px] bg-white/5 border-white/20 text-white placeholder:text-gray-500 resize-none"
                  />
                  <p className="text-xs text-gray-500">{problemStatement.length}/500 characters</p>
                </div>

                <Separator className="bg-white/10" />

                {/* Monthly Queries */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white block">Monthly Queries</label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={monthlyQueries}
                      onChange={(e) => setMonthlyQueries(Math.max(1, parseInt(e.target.value) || 1))}
                      className="bg-white/5 border-white/20 text-white"
                    />
                    <span className="text-sm text-gray-400">queries</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="100000"
                    step="100"
                    value={monthlyQueries}
                    onChange={(e) => setMonthlyQueries(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#4f6ef7]"
                  />
                  <p className="text-xs text-gray-500">Range: 100 - 100,000 queries/month</p>
                </div>

                {/* Conversation Turns */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white block">Avg Conversation Turns</label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={conversationTurns}
                      onChange={(e) => setConversationTurns(Math.max(1, parseInt(e.target.value) || 1))}
                      className="bg-white/5 border-white/20 text-white"
                    />
                    <span className="text-sm text-gray-400">turns</span>
                  </div>
                </div>

                {/* Model Preference */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white block">Preferred Model</label>
                  <Select value={modelPreference} onValueChange={setModelPreference}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1f36] border-white/10">
                      <SelectItem value="gpt-4o-mini" className="text-white focus:bg-[#4f6ef7]/20">
                        GPT-4o Mini
                      </SelectItem>
                      <SelectItem value="gpt-4o" className="text-white focus:bg-[#4f6ef7]/20">
                        GPT-4o
                      </SelectItem>
                      <SelectItem value="gpt-4-turbo" className="text-white focus:bg-[#4f6ef7]/20">
                        GPT-4 Turbo
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="bg-white/10" />

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={handleCalculate}
                    disabled={loading}
                    className="w-full bg-[#4f6ef7] hover:bg-[#4f6ef7]/90 text-white font-semibold py-2"
                  >
                    {loading ? 'Calculating...' : 'Calculate Costs'}
                  </Button>
                  <Button
                    onClick={handleReset}
                    disabled={loading}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/5"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2 space-y-6">
            {showDetails && result && (
              <>
                {/* Summary Card */}
                <Card className="border-[#4f6ef7]/30 bg-gradient-to-br from-white/5 to-white/2">
                  <CardHeader className="border-b border-[#4f6ef7]/20">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#4f6ef7]" />
                      Cost Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 uppercase">Setup Cost</p>
                        <p className="text-2xl font-bold text-white">${result.summary.totalSetup}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 uppercase">Monthly</p>
                        <p className="text-2xl font-bold text-[#4f6ef7]">${result.summary.monthlyAverage.toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 uppercase">Annual</p>
                        <p className="text-2xl font-bold text-white">${result.summary.annualProjection.toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 uppercase">Per Query</p>
                        <p className="text-2xl font-bold text-white">${result.summary.costPerQuery.toFixed(3)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Architecture Overview */}
                <Card className="border-white/10 bg-white/5">
                  <CardHeader className="border-b border-white/10">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Box className="w-5 h-5 text-[#4f6ef7]" />
                      Architecture Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <p className="text-sm text-gray-400 mb-1">Agents</p>
                        <p className="text-2xl font-bold text-white">{result.architecture.agentsCount}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <p className="text-sm text-gray-400 mb-1">Knowledge Bases</p>
                        <p className="text-2xl font-bold text-white">{result.architecture.knowledgeBases.count}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <p className="text-sm text-gray-400 mb-1">Tools</p>
                        <p className="text-2xl font-bold text-white">{result.architecture.tools.count}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <p className="text-sm text-gray-400 mb-1">Complexity</p>
                        <p className="text-lg font-bold text-[#4f6ef7] capitalize">{result.architecture.complexity}</p>
                      </div>
                    </div>

                    {result.architecture.agentBreakdown.length > 0 && (
                      <div className="space-y-3 mt-4 pt-4 border-t border-white/10">
                        <p className="text-sm font-semibold text-white">Agents</p>
                        {result.architecture.agentBreakdown.map((agent, idx) => (
                          <div key={idx} className="bg-white/5 rounded p-3 border border-white/10">
                            <div className="flex justify-between items-start mb-1">
                              <p className="font-semibold text-white text-sm">{agent.name}</p>
                              <span className={`text-xs px-2 py-1 rounded ${agent.complexity === 'high' ? 'bg-red-500/20 text-red-300' : agent.complexity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}>
                                {agent.complexity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400">{agent.purpose}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Cost Breakdown */}
                <Card className="border-white/10 bg-white/5">
                  <CardHeader className="border-b border-white/10">
                    <CardTitle className="text-white">Cost Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Tabs defaultValue="setup" className="w-full">
                      <TabsList className="bg-white/5 border border-white/10">
                        <TabsTrigger value="setup" className="text-gray-400 data-[state=active]:text-white data-[state=active]:bg-[#4f6ef7]/20">
                          Setup
                        </TabsTrigger>
                        <TabsTrigger value="monthly" className="text-gray-400 data-[state=active]:text-white data-[state=active]:bg-[#4f6ef7]/20">
                          Monthly
                        </TabsTrigger>
                        <TabsTrigger value="projections" className="text-gray-400 data-[state=active]:text-white data-[state=active]:bg-[#4f6ef7]/20">
                          Projections
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="setup" className="space-y-3 mt-4">
                        {[
                          { label: 'Agents', value: result.costs.setupCosts.agents },
                          { label: 'Knowledge Bases', value: result.costs.setupCosts.knowledgeBases },
                          { label: 'Tools', value: result.costs.setupCosts.tools },
                          { label: 'RAI Compliance', value: result.costs.setupCosts.raiCompliance }
                        ].map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded border border-white/10">
                            <div>
                              <p className="text-white font-semibold text-sm">{item.label}</p>
                              <p className="text-xs text-gray-400">{item.value.quantity} x ${item.value.unitCost}</p>
                            </div>
                            <p className="text-white font-bold">${item.value.total}</p>
                          </div>
                        ))}
                        <Separator className="bg-white/10 my-2" />
                        <div className="flex justify-between items-center bg-[#4f6ef7]/10 p-3 rounded border border-[#4f6ef7]/30">
                          <p className="text-white font-bold">Total Setup</p>
                          <p className="text-[#4f6ef7] font-bold text-lg">${result.costs.setupCosts.totalSetup}</p>
                        </div>
                      </TabsContent>

                      <TabsContent value="monthly" className="space-y-3 mt-4">
                        {[
                          { label: 'Agent Execution', value: result.costs.monthlyCosts.agentExecution, volume: `${result.costs.monthlyCosts.agentExecution.queries} queries` },
                          { label: 'KB Retrieval', value: result.costs.monthlyCosts.kbRetrieval, volume: `${result.costs.monthlyCosts.kbRetrieval.retrievals} retrievals` },
                          { label: 'Token Processing', value: result.costs.monthlyCosts.tokenProcessing, volume: `${(result.costs.monthlyCosts.tokenProcessing.estimatedTokens / 1000000).toFixed(1)}M tokens` },
                          { label: 'Session Management', value: result.costs.monthlyCosts.sessionManagement, volume: `${result.costs.monthlyCosts.sessionManagement.sessions} sessions` },
                          { label: 'Memory Storage', value: result.costs.monthlyCosts.memoryStorage, volume: `${result.costs.monthlyCosts.memoryStorage.gbPerMonth}GB` }
                        ].map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded border border-white/10">
                            <div>
                              <p className="text-white font-semibold text-sm">{item.label}</p>
                              <p className="text-xs text-gray-400">{item.volume}</p>
                            </div>
                            <p className="text-white font-bold">${item.value.total.toFixed(2)}</p>
                          </div>
                        ))}
                        <Separator className="bg-white/10 my-2" />
                        <div className="flex justify-between items-center bg-[#4f6ef7]/10 p-3 rounded border border-[#4f6ef7]/30">
                          <p className="text-white font-bold">Total Monthly</p>
                          <p className="text-[#4f6ef7] font-bold text-lg">${result.costs.monthlyCosts.totalMonthly.toFixed(2)}</p>
                        </div>
                      </TabsContent>

                      <TabsContent value="projections" className="space-y-3 mt-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/5 p-3 rounded border border-white/10">
                            <p className="text-xs text-gray-400 mb-1">Monthly Average</p>
                            <p className="text-xl font-bold text-white">${result.costs.projections.monthlyAverage.toFixed(2)}</p>
                          </div>
                          <div className="bg-white/5 p-3 rounded border border-white/10">
                            <p className="text-xs text-gray-400 mb-1">Quarterly</p>
                            <p className="text-xl font-bold text-white">${result.costs.projections.quarterly.toFixed(2)}</p>
                          </div>
                          <div className="bg-white/5 p-3 rounded border border-white/10">
                            <p className="text-xs text-gray-400 mb-1">Annual</p>
                            <p className="text-xl font-bold text-[#4f6ef7]">${result.costs.projections.annual.toFixed(2)}</p>
                          </div>
                          <div className="bg-white/5 p-3 rounded border border-white/10">
                            <p className="text-xs text-gray-400 mb-1">Cost Per Query</p>
                            <p className="text-xl font-bold text-white">${result.costs.projections.costPerQuery.toFixed(3)}</p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Key Insights */}
                {result.summary.key_insights.length > 0 && (
                  <Card className="border-[#4f6ef7]/30 bg-[#4f6ef7]/5">
                    <CardHeader className="border-b border-[#4f6ef7]/20">
                      <CardTitle className="text-white text-base">Key Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-2">
                      {result.summary.key_insights.map((insight, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#4f6ef7] mt-2 flex-shrink-0" />
                          <p className="text-sm text-gray-300">{insight}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                {result.costs.recommendations.length > 0 && (
                  <Card className="border-white/10 bg-white/5">
                    <CardHeader className="border-b border-white/10">
                      <CardTitle className="text-white text-base">Cost Optimization Tips</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-2">
                      {result.costs.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#4f6ef7] mt-2 flex-shrink-0" />
                          <p className="text-sm text-gray-300">{rec}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Export Button */}
                <Button
                  onClick={handleExport}
                  className="w-full bg-[#4f6ef7] hover:bg-[#4f6ef7]/90 text-white font-semibold py-2"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Estimate
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
