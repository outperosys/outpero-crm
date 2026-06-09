"use client"

import { useState, useTransition } from "react"
import type { Service } from "@prisma/client"
import { createService, deleteService } from "@/actions/services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus } from "lucide-react"

export function ServicesManager({ initialServices }: { initialServices: Service[] }) {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [isPending, startTransition] = useTransition()
  
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")

  const handleAdd = () => {
    if (!name.trim()) return
    const priceNum = parseFloat(price) || 0
    
    startTransition(async () => {
      const res = await createService({ name, defaultPrice: priceNum })
      if (res.success) {
        setServices(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)))
        setName("")
        setPrice("")
      } else {
        alert(res.error)
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteService(id)
      if (res.success) {
        setServices(prev => prev.filter(s => s.id !== id))
      } else {
        alert(res.error)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Input 
          placeholder="Service Name (e.g. Web Development)" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          className="flex-1"
        />
        <Input 
          type="number" 
          placeholder="Default Price" 
          value={price} 
          onChange={e => setPrice(e.target.value)} 
          className="w-32"
        />
        <Button onClick={handleAdd} disabled={isPending || !name.trim()}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      <div className="space-y-2 border rounded-md divide-y">
        {services.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No services added yet.
          </div>
        ) : (
          services.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 bg-muted/5">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-muted-foreground">${s.defaultPrice.toLocaleString()}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDelete(s.id)}
                disabled={isPending}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
