"use client";

import { useState, useEffect } from 'react';
import type { Package, AddOn, PackageFeature } from '@/lib/types'
import { featureIcons } from '@/lib/constants'
import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useRouter } from 'next/navigation'
import { toast } from "@/components/ui/use-toast"
import { format } from 'date-fns'

interface AddOnGroup {
  id: string;
  label: string;
}

interface AddOnUpdate {
  name: string;
  value: string;
  price: number;
  packages: string[];
  description: string;
}

interface SaveStatus {
  [key: string]: string;
}

interface Order {
  id: string
  orderDate: string
  eventDate: string
  companyName: string
  status: string
  total: number
}

const DEFAULT_GROUPS: AddOnGroup[] = [
  { id: 'recording-streaming', label: 'Recording & Streaming' },
  { id: 'equipment-staff', label: 'Equipment & Staff' },
  { id: 'production', label: 'Production Enhancements' },
  { id: 'delivery', label: 'Delivery Options' }
];

interface SortableFeatureProps {
  feature: PackageFeature;
  featureIndex: number;
  packageIndex: number;
  iconMenuOpen: { [key: string]: boolean };
  toggleIconMenu: (packageIndex: number, featureIndex: number) => void;
  handleFeatureIconChange: (packageIndex: number, featureIndex: number, icon: keyof typeof featureIcons) => void;
  handlePackageFeatureChange: (packageIndex: number, featureIndex: number, value: string) => void;
  handleDeleteFeature: (packageIndex: number, featureIndex: number) => void;
}

function SortableFeature({ 
  feature, 
  featureIndex, 
  packageIndex, 
  iconMenuOpen, 
  toggleIconMenu, 
  handleFeatureIconChange, 
  handlePackageFeatureChange, 
  handleDeleteFeature 
}: SortableFeatureProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: `${feature.icon}-${featureIndex}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center mb-2 group bg-white/50 backdrop-blur-sm border rounded p-2"
    >
      <div
        {...attributes}
        {...listeners}
        className="mr-2 cursor-move"
      >
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M4 8h16M4 16h16" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <span className="mr-2 cursor-pointer relative" onClick={() => toggleIconMenu(packageIndex, featureIndex)}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d={featureIcons[feature.icon as keyof typeof featureIcons]} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
        {iconMenuOpen[`${packageIndex}-${featureIndex}`] && (
          <div className="absolute left-0 top-full mt-1 bg-white border rounded shadow-lg icon-menu z-10 w-48">
            {Object.keys(featureIcons).map((iconKey) => (
              <div
                key={iconKey}
                className="flex items-center p-2 cursor-pointer hover:bg-gray-50"
                onClick={() => handleFeatureIconChange(packageIndex, featureIndex, iconKey as keyof typeof featureIcons)}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d={featureIcons[iconKey as keyof typeof featureIcons]} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                {iconKey}
              </div>
            ))}
          </div>
        )}
      </span>
      <input
        type="text"
        value={feature.value}
        onChange={(e) => handlePackageFeatureChange(packageIndex, featureIndex, e.target.value)}
        className="flex-1 p-2 border rounded bg-transparent focus:ring-[#0095ff] focus:border-[#0095ff]"
        placeholder="Enter feature"
      />
      <button
        onClick={() => handleDeleteFeature(packageIndex, featureIndex)}
        className="ml-2 p-1 text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remove feature"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </button>
    </div>
  );
}

const AdminPage = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [addons, setAddons] = useState<AddOn[]>([]);
  const [keyFeatures, setKeyFeatures] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({});
  const [iconMenuOpen, setIconMenuOpen] = useState<{ [key: string]: boolean }>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [addonGroups, setAddonGroups] = useState<AddOnGroup[]>(DEFAULT_GROUPS);
  const [activeTab, setActiveTab] = useState('packages');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState('rental-config');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/rental-config');
        if (!response.ok) {
          throw new Error('Failed to fetch configuration');
        }
        const config = await response.json();
        setPackages(config.packages);
        setAddons(config.addOns);
        setKeyFeatures(config.keyFeatures || []);
        setAddonGroups(config.addonGroups || DEFAULT_GROUPS);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target && !target.closest('.icon-menu')) {
        setIconMenuOpen({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const timeouts: { [key: string]: NodeJS.Timeout } = {};
    
    Object.keys(saveStatus).forEach((key) => {
      if (saveStatus[key] === 'Saved successfully!') {
        timeouts[key] = setTimeout(() => {
          setSaveStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[key];
            return newStatus;
          });
        }, 5000);
      }
    });

    return () => {
      Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
    };
  }, [saveStatus]);

  useEffect(() => {
    // Check local storage for auth state on component mount
    const authState = localStorage.getItem('adminAuth');
    if (authState === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch orders');
      }
    };

    if (activeSection === 'orders') {
      fetchOrders();
    }
  }, [activeSection]);

  const handlePackageChange = (index: number, field: keyof Package, value: any) => {
    const updatedPackages = [...packages];
    updatedPackages[index] = { ...updatedPackages[index], [field]: value };
    setPackages(updatedPackages);
  };

  const handleAddonChange = (index: number, field: keyof AddOn, value: string | number | string[]) => {
    const newAddOns = [...addons];
    newAddOns[index] = {
      ...newAddOns[index],
      [field]: value
    };
    setAddons(newAddOns);
  };

  const handleKeyFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...keyFeatures];
    updatedFeatures[index] = value;
    setKeyFeatures(updatedFeatures);
  };

  const handlePackageFeatureChange = (packageIndex: number, featureIndex: number, value: string) => {
    const updatedPackages = [...packages];
    updatedPackages[packageIndex].keyFeatures[featureIndex].value = value;
    setPackages(updatedPackages);
  };

  const handleFeatureIconChange = (packageIndex: number, featureIndex: number, icon: keyof typeof featureIcons) => {
    const updatedPackages = [...packages];
    updatedPackages[packageIndex].keyFeatures[featureIndex].icon = icon;
    setPackages(updatedPackages);
    setIconMenuOpen((prev) => ({ ...prev, [`${packageIndex}-${featureIndex}`]: false }));
  };

  const handleSavePackage = async (index: number) => {
    try {
      const response = await fetch('/api/update-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packages,
          addOns: addons,
          keyFeatures,
          addonGroups
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }
      
      const result = await response.json();
      if (result.success) {
        // Update local state with the saved data
        setPackages(result.data.packages);
        setAddons(result.data.addOns);
        setKeyFeatures(result.data.keyFeatures || []);
        setAddonGroups(result.data.addonGroups || DEFAULT_GROUPS);
        setSaveStatus((prev) => ({ ...prev, [packages[index].id]: 'Saved successfully!' }));
      } else {
        throw new Error(result.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus((prev) => ({ ...prev, [packages[index].id]: 'Save failed!' }));
    }
  };

  const handleSaveAddOn = async (index: number) => {
    try {
      await fetch('/api/update-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packages, addOns: addons, keyFeatures }),
      });
      setSaveStatus((prev) => ({ ...prev, [addons[index].id]: 'Saved successfully!' }));
    } catch {
      setSaveStatus((prev) => ({ ...prev, [addons[index].id]: 'Save failed!' }));
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/update-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packages,
          addOns: addons,
          keyFeatures,
          addonGroups
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }
      
      const result = await response.json();
      if (result.success) {
        // Update local state with the saved data
        setPackages(result.data.packages);
        setAddons(result.data.addOns);
        setKeyFeatures(result.data.keyFeatures || []);
        setAddonGroups(result.data.addonGroups || DEFAULT_GROUPS);
        setSaveStatus((prev) => ({ ...prev, global: 'Saved successfully!' }));
      } else {
        throw new Error(result.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus((prev) => ({ ...prev, global: 'Save failed!' }));
    }
  };

  const handleReplaceImage = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedPackages = [...packages];
      updatedPackages[index].image = reader.result as string;
      setPackages(updatedPackages);
    };
    reader.readAsDataURL(file);
  };

  const handleReplaceAdditionalImage = (index: number, imageIndex: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedPackages = [...packages];
      if (!updatedPackages[index].additionalImages) {
        updatedPackages[index].additionalImages = [];
      }
      updatedPackages[index].additionalImages[imageIndex] = reader.result as string;
      setPackages(updatedPackages);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAdditionalImage = (packageIndex: number, imageIndex: number) => {
    const updatedPackages = [...packages];
    if (updatedPackages[packageIndex].additionalImages) {
      updatedPackages[packageIndex].additionalImages = updatedPackages[packageIndex].additionalImages.filter((_, idx) => idx !== imageIndex);
    }
    setPackages(updatedPackages);
  };

  const toggleIconMenu = (packageIndex: number, featureIndex: number) => {
    setIconMenuOpen((prev) => ({ ...prev, [`${packageIndex}-${featureIndex}`]: !prev[`${packageIndex}-${featureIndex}`] }));
  };

  const handleLogin = () => {
    if (password === 'GoAvAdmin#') {
      setIsAuthenticated(true);
      // Store auth state in local storage
      localStorage.setItem('adminAuth', 'true');
    } else {
      alert('Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    // Remove auth state from local storage
    localStorage.removeItem('adminAuth');
  };

  const handleAddOnPackageToggle = (addOnIndex: number, packageId: string) => {
    const updatedAddons = [...addons];
    const addOn = updatedAddons[addOnIndex];
    if (!addOn.packages) addOn.packages = [];
    if (addOn.packages.includes(packageId)) {
      addOn.packages = addOn.packages.filter((id) => id !== packageId);
    } else {
      addOn.packages.push(packageId);
    }
    setAddons(updatedAddons);
  };

  const handleCreateAddon = () => {
    const newAddon: AddOn = {
      id: `addon-${Date.now()}`, // Generate a unique ID
      name: "New Add-on",
      value: "",
      price: 0,
      description: "",
      image: "",
      packages: []
    };
    setAddons([...addons, newAddon]);
  };

  const handleCreateGroup = () => {
    const newGroup: AddOnGroup = {
      id: `group-${Date.now()}`,
      label: "New Group",
    };
    setAddonGroups([...addonGroups, newGroup]);
  };

  const handleGroupChange = (index: number, field: keyof AddOnGroup, value: string) => {
    const newGroups = [...addonGroups];
    newGroups[index][field] = value;
    setAddonGroups(newGroups);
  };

  const handleDeletePackage = (index: number) => {
    const updatedPackages = [...packages];
    updatedPackages.splice(index, 1);
    setPackages(updatedPackages);
  };

  const handleDeleteGroup = (index: number) => {
    const updatedGroups = [...addonGroups];
    updatedGroups.splice(index, 1);
    setAddonGroups(updatedGroups);
  };

  const handleDeleteAddon = (index: number) => {
    const updatedAddons = [...addons];
    updatedAddons.splice(index, 1);
    setAddons(updatedAddons);
  };

  const handleDeleteKeyFeature = (index: number) => {
    const updatedFeatures = [...keyFeatures];
    updatedFeatures.splice(index, 1);
    setKeyFeatures(updatedFeatures);
  };

  const handleSaveGroup = async (index: number) => {
    try {
      await fetch('/api/update-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          packages, 
          addOns: addons, 
          keyFeatures,
          addonGroups 
        }),
      });
      setSaveStatus((prev) => ({ ...prev, [addonGroups[index].id]: 'Saved successfully!' }));
    } catch {
      setSaveStatus((prev) => ({ ...prev, [addonGroups[index].id]: 'Save failed!' }));
    }
  };

  const handleDeleteFeature = (packageIndex: number, featureIndex: number) => {
    const updatedPackages = [...packages];
    updatedPackages[packageIndex].keyFeatures.splice(featureIndex, 1);
    setPackages(updatedPackages);
  };

  const handleTrashOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/trash`, {
        method: 'PUT',
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error('Failed to trash order');
      }

      // Force a fresh fetch of orders
      const ordersResponse = await fetch('/api/orders', { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const updatedOrders = await ordersResponse.json();
      setOrders(updatedOrders);

    } catch (error) {
      console.error('Error trashing order:', error);
      toast({
        title: "Error",
        description: "Failed to trash order",
        variant: "destructive",
      });
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      
      // Parse the JSON strings into objects
      const parsedOrder = {
        ...data,
        items: JSON.parse(data.items),
        eventDetails: JSON.parse(data.eventDetails)
      };
      
      setSelectedOrder(parsedOrder);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch order details');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 bg-white shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Admin Login</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>
            <Button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm">
              Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900">SimpleAV Admin</span>
              <nav className="ml-10 flex space-x-4">
                <button
                  onClick={() => setActiveSection('rental-config')}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium",
                    activeSection === 'rental-config' 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  Packages & Add-ons
                </button>
                <button
                  onClick={() => setActiveSection('orders')}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium",
                    activeSection === 'orders' 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  Orders
                </button>
                <button
                  onClick={() => setActiveSection('inventory')}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium",
                    activeSection === 'inventory' 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  Inventory
                </button>
              </nav>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="text-gray-600 hover:text-gray-700"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {activeSection === 'rental-config' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Packages & Add-ons</h1>
                <div className="flex items-center gap-3">
                  {saveStatus.global === 'Saved successfully!' && (
                    <span className="text-sm text-green-600 font-medium animate-in fade-in slide-in-from-right-5">
                      ✓ All Changes Saved
                    </span>
                  )}
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                    Save All Changes
                  </Button>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 bg-white shadow-md border border-gray-100">
                  <TabsTrigger value="packages" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-700">Packages</TabsTrigger>
                  <TabsTrigger value="addons" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-700">Add-ons</TabsTrigger>
                  <TabsTrigger value="groups" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-700">Groups</TabsTrigger>
                </TabsList>

                <TabsContent value="packages" className="space-y-4">
                  <div className="grid gap-4">
                    {packages.map((pkg, index) => (
                      <Card key={pkg.id} className="p-4 bg-white shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                        <Accordion
                          type="single"
                          collapsible
                          value={expandedItems.includes(`package-${index}`) ? `package-${index}` : ''}
                          onValueChange={(value) => {
                            setExpandedItems(prev => 
                              value === `package-${index}` 
                                ? [...prev, `package-${index}`]
                                : prev.filter(item => item !== `package-${index}`)
                            );
                          }}
                        >
                          <AccordionItem value={`package-${index}`} className="border-none">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-900">{pkg.name}</span>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 shadow-sm border border-blue-200">${pkg.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4 pt-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div>
                                    <Label>Name</Label>
                                    <Input
                                      value={pkg.name}
                                      onChange={(e) => handlePackageChange(index, 'name', e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <Label>Price</Label>
                                    <Input
                                      type="number"
                                      value={pkg.price}
                                      onChange={(e) => handlePackageChange(index, 'price', parseFloat(e.target.value))}
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <Label>Description</Label>
                                  <Textarea
                                    value={pkg.description}
                                    onChange={(e) => handlePackageChange(index, 'description', e.target.value)}
                                    rows={3}
                                  />
                                </div>

                                {/* Package Images Section */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                  <Label className="text-sm font-medium text-gray-900 mb-4 block">Package Images</Label>
                                  <div className="flex gap-6">
                                    {/* Featured Image */}
                                    <div className="w-48">
                                      <p className="text-sm font-medium text-gray-700 mb-2">Featured Image</p>
                                      <div className="relative aspect-[4/3] rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-white mb-2">
                                        {pkg.image ? (
                                          <img
                                            src={pkg.image}
                                            alt={`${pkg.name} main preview`}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                                            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-xs">No image</span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="space-y-1">
                                        <Input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              handleReplaceImage(index, file);
                                            }
                                          }}
                                          className="w-full text-xs"
                                        />
                                        {pkg.image && (
                                          <Button
                                            onClick={() => handlePackageChange(index, 'image', '')}
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-red-600 hover:text-red-700 text-xs"
                                          >
                                            Remove
                                          </Button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Vertical Divider */}
                                    <div className="w-px bg-gray-200 self-stretch"></div>

                                    {/* Additional Images */}
                                    <div className="flex gap-4 flex-1">
                                      {[
                                        { label: 'Camera Setup', index: 0 },
                                        { label: 'Stream Interface', index: 1 },
                                        { label: 'Equipment', index: 2 },
                                        { label: 'Setup', index: 3 }
                                      ].map(({ label, index: imageIndex }) => (
                                        <div key={imageIndex} className="w-48">
                                          <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
                                          <div className="relative aspect-[4/3] rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-white mb-2">
                                            {pkg.additionalImages?.[imageIndex] ? (
                                              <img
                                                src={pkg.additionalImages[imageIndex]}
                                                alt={`${pkg.name} ${label.toLowerCase()}`}
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                                                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-xs">No image</span>
                                              </div>
                                            )}
                                          </div>
                                          <div className="space-y-1">
                                            <Input
                                              type="file"
                                              accept="image/*"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                  handleReplaceAdditionalImage(index, imageIndex, file);
                                                }
                                              }}
                                              className="w-full text-xs"
                                            />
                                            {pkg.additionalImages?.[imageIndex] && (
                                              <Button
                                                onClick={() => handleRemoveAdditionalImage(index, imageIndex)}
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-red-600 hover:text-red-700 text-xs"
                                              >
                                                Remove
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <Label className="mb-2 block">Key Features</Label>
                                  <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={(event) => {
                                      const { active, over } = event;
                                      if (over && active.id !== over.id) {
                                        const oldIndex = parseInt(active.id.toString().split('-')[1]);
                                        const newIndex = parseInt(over.id.toString().split('-')[1]);
                                        const newFeatures = arrayMove(pkg.keyFeatures, oldIndex, newIndex);
                                        handlePackageChange(index, 'keyFeatures', newFeatures);
                                      }
                                    }}
                                  >
                                    <SortableContext
                                      items={pkg.keyFeatures.map((_, i) => `${pkg.id}-${i}`)}
                                      strategy={verticalListSortingStrategy}
                                    >
                                      {pkg.keyFeatures.map((feature, featureIndex) => (
                                        <SortableFeature
                                          key={`${feature.icon}-${featureIndex}`}
                                          feature={feature}
                                          featureIndex={featureIndex}
                                          packageIndex={index}
                                          iconMenuOpen={iconMenuOpen}
                                          toggleIconMenu={toggleIconMenu}
                                          handleFeatureIconChange={handleFeatureIconChange}
                                          handlePackageFeatureChange={handlePackageFeatureChange}
                                          handleDeleteFeature={handleDeleteFeature}
                                        />
                                      ))}
                                    </SortableContext>
                                  </DndContext>
                                  <Button
                                    onClick={() => {
                                      const updatedPackages = [...packages];
                                      updatedPackages[index].keyFeatures.push({
                                        icon: 'video',
                                        value: ''
                                      });
                                      setPackages(updatedPackages);
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                  >
                                    Add Feature
                                  </Button>
                                </div>

                                <div className="flex justify-between items-center pt-4">
                                  <Button
                                    onClick={() => handleDeletePackage(index)}
                                    variant="destructive"
                                    className="bg-red-600 hover:bg-red-700 shadow-sm"
                                  >
                                    Delete Package
                                  </Button>
                                  <div className="flex items-center gap-3">
                                    {saveStatus[pkg.id] === 'Saved successfully!' && (
                                      <span className="text-sm text-green-600 font-medium animate-in fade-in slide-in-from-right-5">
                                        ✓ Saved
                                      </span>
                                    )}
                                    <Button
                                      onClick={() => handleSavePackage(index)}
                                      className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                                    >
                                      Save Package
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </Card>
                    ))}
                  </div>
                  <Button
                    onClick={() => {
                      setPackages([
                        ...packages,
                        {
                          id: `package-${packages.length + 1}`,
                          name: 'New Package',
                          description: '',
                          price: 0,
                          keyFeatures: [],
                          image: '',
                          slug: `package-${packages.length + 1}`,
                          includedItems: [],
                          additionalImages: []
                        }
                      ]);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm"
                  >
                    Add New Package
                  </Button>
                </TabsContent>

                <TabsContent value="addons" className="space-y-4">
                  <div className="grid gap-4">
                    {addons.map((addon, index) => (
                      <Card key={addon.id} className="p-4">
                        <Accordion
                          type="single"
                          collapsible
                          value={expandedItems.includes(`addon-${index}`) ? `addon-${index}` : ''}
                          onValueChange={(value) => {
                            setExpandedItems(prev => 
                              value === `addon-${index}` 
                                ? [...prev, `addon-${index}`]
                                : prev.filter(item => item !== `addon-${index}`)
                            );
                          }}
                        >
                          <AccordionItem value={`addon-${index}`} className="border-none">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold">{addon.name}</span>
                                <Badge variant="secondary">${addon.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4 pt-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div>
                                    <Label>Name</Label>
                                    <Input
                                      value={addon.name}
                                      onChange={(e) => handleAddonChange(index, 'name', e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <Label>Price</Label>
                                    <Input
                                      type="number"
                                      value={addon.price}
                                      onChange={(e) => handleAddonChange(index, 'price', parseFloat(e.target.value))}
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label>Description</Label>
                                  <Textarea
                                    value={addon.description}
                                    onChange={(e) => handleAddonChange(index, 'description', e.target.value)}
                                    rows={3}
                                  />
                                </div>

                                <div>
                                  <Label className="mb-2 block">Available for Packages</Label>
                                  <div className="grid grid-cols-2 gap-2">
                                    {packages.map((pkg) => (
                                      <label key={pkg.id} className="flex items-center space-x-2">
                                        <input
                                          type="checkbox"
                                          checked={addon.packages?.includes(pkg.id)}
                                          onChange={() => handleAddOnPackageToggle(index, pkg.id)}
                                          className="rounded border-gray-300 text-[#0095ff] focus:ring-[#0095ff]"
                                        />
                                        <span className="text-sm">{pkg.name}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex justify-between items-center pt-4">
                                  <Button
                                    onClick={() => handleDeleteAddon(index)}
                                    variant="destructive"
                                    className="bg-red-600 hover:bg-red-700 shadow-sm"
                                  >
                                    Delete Add-on
                                  </Button>
                                  <div className="flex items-center gap-3">
                                    {saveStatus[addon.id] === 'Saved successfully!' && (
                                      <span className="text-sm text-green-600 font-medium animate-in fade-in slide-in-from-right-5">
                                        ✓ Saved
                                      </span>
                                    )}
                                    <Button
                                      onClick={() => handleSaveAddOn(index)}
                                      className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                                    >
                                      Save Add-on
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </Card>
                    ))}
                  </div>
                  <Button
                    onClick={handleCreateAddon}
                    className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm"
                  >
                    Add New Add-on
                  </Button>
                </TabsContent>

                <TabsContent value="groups" className="space-y-4">
                  <div className="grid gap-4">
                    {addonGroups.map((group, index) => (
                      <Card key={group.id} className="p-4">
                        <div className="space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <Label>ID</Label>
                              <Input
                                value={group.id}
                                onChange={(e) => handleGroupChange(index, 'id', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Label</Label>
                              <Input
                                value={group.label}
                                onChange={(e) => handleGroupChange(index, 'label', e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <Button
                              onClick={() => handleDeleteGroup(index)}
                              variant="destructive"
                              className="bg-red-600 hover:bg-red-700 shadow-sm"
                              size="sm"
                            >
                              Delete
                            </Button>
                            <div className="flex items-center gap-3">
                              {saveStatus[group.id] === 'Saved successfully!' && (
                                <span className="text-sm text-green-600 font-medium animate-in fade-in slide-in-from-right-5">
                                  ✓ Saved
                                </span>
                              )}
                              <Button
                                onClick={() => handleSaveGroup(index)}
                                className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                                size="sm"
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <Button
                    onClick={handleCreateGroup}
                    className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm"
                  >
                    Add New Group
                  </Button>
                </TabsContent>
              </Tabs>
            </>
          )}

          {activeSection === 'orders' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                  {selectedOrderId && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedOrderId(null);
                        setSelectedOrder(null);
                      }}
                      className="text-sm"
                    >
                      ← Back to Orders
                    </Button>
                  )}
                </div>
                {!selectedOrderId && (
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="trashed">Trashed</option>
                  </select>
                )}
              </div>

              <Card className="p-6">
                {!selectedOrderId ? (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>
                            <th className="px-4 py-3">Order #</th>
                            <th className="px-4 py-3">Order Date</th>
                            <th className="px-4 py-3">Event Date</th>
                            <th className="px-4 py-3">Company</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Total</th>
                            <th className="px-4 py-3 w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {orders
                            .filter(order => statusFilter === 'all' || order.status === statusFilter)
                            .map((order) => (
                            <tr 
                              key={order.id} 
                              className="bg-white hover:bg-gray-50 group cursor-pointer"
                              onClick={() => {
                                setSelectedOrderId(order.id);
                                fetchOrderDetails(order.id);
                              }}
                            >
                              <td className="px-4 py-3">{order.id}</td>
                              <td className="px-4 py-3">{order.orderDate}</td>
                              <td className="px-4 py-3">{order.eventDate}</td>
                              <td className="px-4 py-3">{order.companyName}</td>
                              <td className="px-4 py-3">
                                <Badge variant="secondary" className={
                                  order.status === 'trashed' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }>
                                  {order.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-right">${order.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTrashOrder(order.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-red-600"
                                  title="Move to trash"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : selectedOrder ? (
                  <div className="space-y-8">
                    {/* Order Details Content */}
                    <div className="grid grid-cols-2 gap-8">
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="text-lg font-semibold mb-4">Event Details</h3>
                          <div className="space-y-2 text-gray-600">
                            <p><span className="font-medium">Date:</span> {format(new Date(selectedOrder.eventDate), 'MMMM d, yyyy')}</p>
                            <p><span className="font-medium">Time:</span> {selectedOrder.eventDetails.eventStartTime} to {selectedOrder.eventDetails.eventEndTime}</p>
                            <p><span className="font-medium">Location:</span> {selectedOrder.eventDetails.eventLocation}</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                          <div className="space-y-2 text-gray-600">
                            <p><span className="font-medium">Company:</span> {selectedOrder.eventDetails.companyName}</p>
                            <p><span className="font-medium">Contact:</span> {selectedOrder.eventDetails.contactName}</p>
                            <p><span className="font-medium">Email:</span> {selectedOrder.eventDetails.contactEmail}</p>
                            <p><span className="font-medium">Phone:</span> {selectedOrder.eventDetails.contactPhone}</p>
                            <p><span className="font-medium">Address:</span><br />
                              {selectedOrder.eventDetails.street}<br />
                              {selectedOrder.eventDetails.city}, {selectedOrder.eventDetails.state} {selectedOrder.eventDetails.zip}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Order Items */}
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-4">Order Details</h3>
                        
                        {/* Packages */}
                        {selectedOrder.items
                          .filter((item: any) => item.type === 'package')
                          .map((item: any) => (
                          <div key={item.id} className="mb-6 pb-6 border-b">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-lg font-semibold text-[#0095ff]">{item.name}</h4>
                                {item.keyFeatures && (
                                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                    {item.keyFeatures.map((feature: any, index: number) => (
                                      <li key={index}>• {feature.value}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                              <p className="text-lg font-semibold">${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                          </div>
                        ))}

                        {/* Add-ons */}
                        {selectedOrder.items.filter((item: any) => item.type === 'addon').length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-4">Add-ons</h4>
                            {selectedOrder.items
                              .filter((item: any) => item.type === 'addon')
                              .map((item: any) => (
                              <div key={item.id} className="flex justify-between items-center py-2">
                                <span className="text-gray-600">{item.name}</span>
                                <span className="font-semibold">${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Total */}
                        <div className="border-t pt-4">
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span>${selectedOrder.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 mt-2">
                            <span>50% Payment Due Today:</span>
                            <span>${(selectedOrder.total / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>50% Due After Completion:</span>
                            <span>${(selectedOrder.total / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8">Loading order details...</div>
                )}
              </Card>
            </>
          )}

          {activeSection === 'inventory' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Inventory</h1>
              <p className="text-gray-600">Inventory management coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

