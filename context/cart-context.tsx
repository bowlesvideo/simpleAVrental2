'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import type { Package, AddOn, PackageFeature } from '@/lib/types'

interface CartItem {
  type: 'package' | 'addon'
  id: string
  name: string
  price: number
  quantity: number
  keyFeatures?: PackageFeature[]
}

interface CartContextType {
  items: CartItem[]
  addPackage: (pkg: Package) => void
  addAddOn: (addon: AddOn) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'cart_items'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (savedCart) {
      setItems(JSON.parse(savedCart))
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } else {
      localStorage.removeItem(CART_STORAGE_KEY)
    }
  }, [items])

  const addPackage = useCallback((pkg: Package) => {
    setItems(currentItems => {
      const exists = currentItems.find(item => item.id === pkg.id)
      if (exists) {
        return currentItems
      }
      return [...currentItems, {
        type: 'package',
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        quantity: 1,
        keyFeatures: pkg.keyFeatures
      }]
    })
  }, [])

  const addAddOn = useCallback((addon: AddOn) => {
    setItems(currentItems => {
      const exists = currentItems.find(item => item.id === addon.id)
      if (exists) {
        return currentItems.map(item =>
          item.id === addon.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...currentItems, {
        type: 'addon',
        id: addon.id,
        name: addon.name,
        price: addon.price,
        quantity: 1
      }]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id)
      return
    }
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
    localStorage.removeItem(CART_STORAGE_KEY)
  }, [])

  const total = useMemo(() => 
    items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [items]
  )

  const value = useMemo(() => ({
    items,
    addPackage,
    addAddOn,
    removeItem,
    updateQuantity,
    clearCart,
    total
  }), [items, addPackage, addAddOn, removeItem, updateQuantity, clearCart, total])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 