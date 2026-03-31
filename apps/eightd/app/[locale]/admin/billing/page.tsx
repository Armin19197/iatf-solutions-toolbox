'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import type { BillingPlan, IntegratedTool, StripeConfig } from '@/lib/billing/types'

type EditablePlan = BillingPlan

type EditableTool = IntegratedTool

const emptyStripeConfig: StripeConfig = {
  publishableKey: '',
  secretKey: '',
  webhookSecret: '',
  apiVersion: '2024-12-18.acacia',
  successUrl: '',
  cancelUrl: '',
  updatedAt: '',
}

export default function BillingAdminPage() {
  const [adminToken, setAdminToken] = useState('')
  const [plans, setPlans] = useState<EditablePlan[]>([])
  const [tools, setTools] = useState<EditableTool[]>([])
  const [stripeConfig, setStripeConfig] = useState<StripeConfig>(emptyStripeConfig)
  const [loading, setLoading] = useState(false)

  const [newPlan, setNewPlan] = useState({
    name: '',
    toolId: 'tool_8d',
    stripePriceId: '',
    unitAmount: 0,
    currency: 'usd',
    creditCount: 1,
    interval: 'one_time',
  })

  const [newTool, setNewTool] = useState({
    name: '',
    description: '',
    baseUrl: '',
    active: true,
  })

  const isAuthenticated = useMemo(() => adminToken.trim().length > 0, [adminToken])

  useEffect(() => {
    void loadPublicData()
  }, [])

  async function apiFetch(path: string, init?: RequestInit, admin = false): Promise<Response> {
    const headers = new Headers(init?.headers || {})
    headers.set('Content-Type', 'application/json')
    if (admin) {
      headers.set('x-admin-token', adminToken.trim())
    }

    return fetch(path, { ...init, headers })
  }

  async function loadPublicData() {
    try {
      setLoading(true)
      const [plansRes, toolsRes] = await Promise.all([
        apiFetch('/api/billing/plans'),
        apiFetch('/api/billing/tools'),
      ])

      const plansJson = await plansRes.json()
      const toolsJson = await toolsRes.json()

      setPlans(plansJson.plans || [])
      setTools(toolsJson.tools || [])
    } catch {
      toast.error('Failed to load billing data')
    } finally {
      setLoading(false)
    }
  }

  async function loadAdminStripeConfig() {
    if (!isAuthenticated) {
      toast.error('Enter admin token first')
      return
    }

    try {
      const response = await apiFetch('/api/billing/stripe-config', { method: 'GET' }, true)
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json?.error || 'Failed to load Stripe config')
      }
      setStripeConfig(json.config)
      toast.success('Admin access verified')
    } catch (error: any) {
      toast.error(error.message || 'Invalid admin token')
    }
  }

  async function savePlan(plan: EditablePlan) {
    try {
      const response = await apiFetch(
        '/api/billing/plans',
        {
          method: 'POST',
          body: JSON.stringify(plan),
        },
        true,
      )
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json?.error || 'Failed to save plan')
      }
      setPlans((prev) => prev.map((p) => (p.id === plan.id ? json.plan : p)))
      toast.success('Plan updated')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update plan')
    }
  }

  async function createPlan() {
    try {
      const response = await apiFetch(
        '/api/billing/plans',
        {
          method: 'POST',
          body: JSON.stringify(newPlan),
        },
        true,
      )
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json?.error || 'Failed to create plan')
      }
      setPlans((prev) => [...prev, json.plan])
      setNewPlan({
        name: '',
        toolId: 'tool_8d',
        stripePriceId: '',
        unitAmount: 0,
        currency: 'usd',
        creditCount: 1,
        interval: 'one_time',
      })
      toast.success('Plan created')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create plan')
    }
  }

  async function deletePlan(id: string) {
    try {
      const response = await apiFetch(
        '/api/billing/plans',
        {
          method: 'DELETE',
          body: JSON.stringify({ id }),
        },
        true,
      )
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json?.error || 'Failed to delete plan')
      }
      setPlans((prev) => prev.filter((p) => p.id !== id))
      toast.success('Plan deleted')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete plan')
    }
  }

  async function saveTool(tool: EditableTool) {
    try {
      const response = await apiFetch(
        '/api/billing/tools',
        {
          method: 'POST',
          body: JSON.stringify(tool),
        },
        true,
      )
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json?.error || 'Failed to save tool')
      }
      setTools((prev) => prev.map((t) => (t.id === tool.id ? json.tool : t)))
      toast.success('Tool updated')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update tool')
    }
  }

  async function createTool() {
    try {
      const response = await apiFetch(
        '/api/billing/tools',
        {
          method: 'POST',
          body: JSON.stringify(newTool),
        },
        true,
      )
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json?.error || 'Failed to create tool')
      }
      setTools((prev) => [...prev, json.tool])
      setNewTool({
        name: '',
        description: '',
        baseUrl: '',
        active: true,
      })
      toast.success('Tool added')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create tool')
    }
  }

  async function deleteTool(id: string) {
    try {
      const response = await apiFetch(
        '/api/billing/tools',
        {
          method: 'DELETE',
          body: JSON.stringify({ id }),
        },
        true,
      )
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json?.error || 'Failed to delete tool')
      }
      setTools((prev) => prev.filter((tool) => tool.id !== id))
      toast.success('Tool removed')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete tool')
    }
  }

  async function saveStripeConfig() {
    try {
      const response = await apiFetch(
        '/api/billing/stripe-config',
        {
          method: 'PUT',
          body: JSON.stringify(stripeConfig),
        },
        true,
      )
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json?.error || 'Failed to update Stripe config')
      }
      setStripeConfig(json.config)
      toast.success('Stripe configuration updated')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update Stripe config')
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Billing Microservice Admin Panel</CardTitle>
            <CardDescription>
              Manage Stripe config, plans, and the list of integrated tools from one place.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="admin-token">Admin Token</Label>
              <Input
                id="admin-token"
                type="password"
                value={adminToken}
                onChange={(event) => setAdminToken(event.target.value)}
                placeholder="Set BILLING_ADMIN_TOKEN and paste it here"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={loadAdminStripeConfig} disabled={!isAuthenticated}>
                Verify Admin Token
              </Button>
              <Button variant="outline" onClick={loadPublicData} disabled={loading}>
                Refresh Plans & Tools
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stripe Configuration</CardTitle>
            <CardDescription>Update Stripe keys and checkout redirect URLs.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Input
              value={stripeConfig.publishableKey || ''}
              onChange={(event) => setStripeConfig((prev) => ({ ...prev, publishableKey: event.target.value }))}
              placeholder="Publishable key"
            />
            <Input
              value={stripeConfig.secretKey || ''}
              onChange={(event) => setStripeConfig((prev) => ({ ...prev, secretKey: event.target.value }))}
              placeholder="Secret key"
            />
            <Input
              value={stripeConfig.webhookSecret || ''}
              onChange={(event) => setStripeConfig((prev) => ({ ...prev, webhookSecret: event.target.value }))}
              placeholder="Webhook secret"
            />
            <Input
              value={stripeConfig.apiVersion || ''}
              onChange={(event) => setStripeConfig((prev) => ({ ...prev, apiVersion: event.target.value }))}
              placeholder="Stripe API version"
            />
            <Input
              value={stripeConfig.successUrl || ''}
              onChange={(event) => setStripeConfig((prev) => ({ ...prev, successUrl: event.target.value }))}
              placeholder="Success URL or relative path"
            />
            <Input
              value={stripeConfig.cancelUrl || ''}
              onChange={(event) => setStripeConfig((prev) => ({ ...prev, cancelUrl: event.target.value }))}
              placeholder="Cancel URL or relative path"
            />
            <div className="md:col-span-2">
              <Button onClick={saveStripeConfig} disabled={!isAuthenticated}>
                Save Stripe Config
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Plans</CardTitle>
            <CardDescription>Create, edit, and remove Stripe plans per tool.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 rounded-md border p-3 md:grid-cols-4">
              <Input placeholder="Name" value={newPlan.name} onChange={(event) => setNewPlan((prev) => ({ ...prev, name: event.target.value }))} />
              <Input placeholder="Tool ID" value={newPlan.toolId} onChange={(event) => setNewPlan((prev) => ({ ...prev, toolId: event.target.value }))} />
              <Input placeholder="Stripe Price ID" value={newPlan.stripePriceId} onChange={(event) => setNewPlan((prev) => ({ ...prev, stripePriceId: event.target.value }))} />
              <Input
                placeholder="Unit amount"
                type="number"
                value={newPlan.unitAmount}
                onChange={(event) => setNewPlan((prev) => ({ ...prev, unitAmount: Number(event.target.value || 0) }))}
              />
              <Input placeholder="Currency" value={newPlan.currency} onChange={(event) => setNewPlan((prev) => ({ ...prev, currency: event.target.value }))} />
              <Input
                placeholder="Credit count"
                type="number"
                value={newPlan.creditCount}
                onChange={(event) => setNewPlan((prev) => ({ ...prev, creditCount: Number(event.target.value || 1) }))}
              />
              <Input
                placeholder="Interval: one_time | month | year"
                value={newPlan.interval}
                onChange={(event) => setNewPlan((prev) => ({ ...prev, interval: event.target.value }))}
              />
              <Button onClick={createPlan} disabled={!isAuthenticated}>Add Plan</Button>
            </div>

            <div className="space-y-3">
              {plans.map((plan) => (
                <div key={plan.id} className="grid gap-2 rounded-md border p-3 md:grid-cols-5">
                  <Input value={plan.name} onChange={(event) => setPlans((prev) => prev.map((p) => (p.id === plan.id ? { ...p, name: event.target.value } : p)))} />
                  <Input value={plan.toolId} onChange={(event) => setPlans((prev) => prev.map((p) => (p.id === plan.id ? { ...p, toolId: event.target.value } : p)))} />
                  <Input value={plan.stripePriceId} onChange={(event) => setPlans((prev) => prev.map((p) => (p.id === plan.id ? { ...p, stripePriceId: event.target.value } : p)))} />
                  <Input
                    type="number"
                    value={plan.unitAmount}
                    onChange={(event) => setPlans((prev) => prev.map((p) => (p.id === plan.id ? { ...p, unitAmount: Number(event.target.value || 0) } : p)))}
                  />
                  <Input
                    type="number"
                    value={plan.creditCount}
                    onChange={(event) => setPlans((prev) => prev.map((p) => (p.id === plan.id ? { ...p, creditCount: Number(event.target.value || 1) } : p)))}
                  />
                  <Input value={plan.currency} onChange={(event) => setPlans((prev) => prev.map((p) => (p.id === plan.id ? { ...p, currency: event.target.value } : p)))} />
                  <Input value={plan.interval} onChange={(event) => setPlans((prev) => prev.map((p) => (p.id === plan.id ? { ...p, interval: event.target.value as EditablePlan['interval'] } : p)))} />
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`plan-active-${plan.id}`}>Active</Label>
                    <Checkbox
                      id={`plan-active-${plan.id}`}
                      checked={plan.active}
                      onCheckedChange={(checked) => setPlans((prev) => prev.map((p) => (p.id === plan.id ? { ...p, active: Boolean(checked) } : p)))}
                    />
                  </div>
                  <Button onClick={() => savePlan(plan)} disabled={!isAuthenticated}>Save</Button>
                  <Button variant="destructive" onClick={() => deletePlan(plan.id)} disabled={!isAuthenticated}>Delete</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrated Tools</CardTitle>
            <CardDescription>List all tools where billing and Stripe are integrated.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 rounded-md border p-3 md:grid-cols-4">
              <Input placeholder="Tool name" value={newTool.name} onChange={(event) => setNewTool((prev) => ({ ...prev, name: event.target.value }))} />
              <Input placeholder="Description" value={newTool.description} onChange={(event) => setNewTool((prev) => ({ ...prev, description: event.target.value }))} />
              <Input placeholder="Base URL" value={newTool.baseUrl} onChange={(event) => setNewTool((prev) => ({ ...prev, baseUrl: event.target.value }))} />
              <Button onClick={createTool} disabled={!isAuthenticated}>Add Tool</Button>
            </div>

            <div className="space-y-3">
              {tools.map((tool) => (
                <div key={tool.id} className="grid gap-2 rounded-md border p-3 md:grid-cols-5">
                  <Input value={tool.id} disabled />
                  <Input value={tool.name} onChange={(event) => setTools((prev) => prev.map((t) => (t.id === tool.id ? { ...t, name: event.target.value } : t)))} />
                  <Input value={tool.description || ''} onChange={(event) => setTools((prev) => prev.map((t) => (t.id === tool.id ? { ...t, description: event.target.value } : t)))} />
                  <Input value={tool.baseUrl || ''} onChange={(event) => setTools((prev) => prev.map((t) => (t.id === tool.id ? { ...t, baseUrl: event.target.value } : t)))} />
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`tool-active-${tool.id}`}>Active</Label>
                    <Checkbox
                      id={`tool-active-${tool.id}`}
                      checked={tool.active}
                      onCheckedChange={(checked) => setTools((prev) => prev.map((t) => (t.id === tool.id ? { ...t, active: Boolean(checked) } : t)))}
                    />
                  </div>
                  <Button onClick={() => saveTool(tool)} disabled={!isAuthenticated}>Save</Button>
                  <Button variant="destructive" onClick={() => deleteTool(tool.id)} disabled={!isAuthenticated}>Delete</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
