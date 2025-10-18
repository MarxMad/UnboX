"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Camera, Sparkles } from "lucide-react"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { useTokenizeStreetwear } from "@/app/hooks/useTokenizeStreetwear"

export default function TokenizePage() {
  const [images, setImages] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    size: "",
    condition: "",
    year: new Date().getFullYear(),
    rarity: "Common",
    description: ""
  })
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { tokenize, loading: tokenizeLoading, error } = useTokenizeStreetwear()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return null
  }
  // </CHANGE>

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      const file = files[0]
      setSelectedFile(file)
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setImages([...images, ...newImages])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      alert("Please select an image")
      return
    }

    if (!formData.name || !formData.brand || !formData.condition) {
      alert("Please fill in all required fields")
      return
    }

    try {
      await tokenize({
        name: formData.name,
        brand: formData.brand,
        model: formData.model || formData.name,
        size: formData.size,
        condition: formData.condition,
        year: formData.year,
        rarity: formData.rarity,
        image: selectedFile
      })
      
      // Redirect to profile or feed after successful tokenization
      router.push("/profile")
    } catch (error) {
      console.error("Tokenization failed:", error)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* </CHANGE> */}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Tokenize Your Item</h1>
          <p className="text-muted-foreground">
            Upload photos and details to create an on-chain certificate for your collectible
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold mb-3 block">Photos</Label>
              <p className="text-sm text-muted-foreground mb-4">Upload at least 3 photos from different angles</p>

              <div className="grid grid-cols-2 gap-3">
                {images.map((image, index) => (
                  <Card key={index} className="aspect-square overflow-hidden border-border">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </Card>
                ))}

                {images.length < 6 && (
                  <label className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/20">
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Upload Photo</span>
                  </label>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1 gap-2 bg-transparent">
                  <Camera className="h-4 w-4" />
                  Take Photo
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-2 bg-transparent">
                  <Upload className="h-4 w-4" />
                  Upload from Device
                </Button>
              </div>
            </div>

            {/* Preview Card */}
            <Card className="p-4 bg-muted/30 border-border">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                NFT Preview
              </h3>
              <p className="text-sm text-muted-foreground">
                Your item will be minted as an NFT on Solana with all details stored on-chain
              </p>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="item-name">Item Name *</Label>
                <Input 
                  id="item-name" 
                  placeholder="e.g., Supreme Box Logo Hoodie" 
                  className="bg-muted/50"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Input 
                  id="brand" 
                  placeholder="e.g., Supreme, Nike, KAWS" 
                  className="bg-muted/50"
                  value={formData.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model (Optional)</Label>
                <Input 
                  id="model" 
                  placeholder="e.g., Box Logo Hoodie, Air Jordan 1" 
                  className="bg-muted/50"
                  value={formData.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input 
                    id="year" 
                    type="number" 
                    placeholder="2024" 
                    className="bg-muted/50"
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", parseInt(e.target.value))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rarity">Rarity</Label>
                  <Select value={formData.rarity} onValueChange={(value) => handleInputChange("rarity", value)}>
                    <SelectTrigger id="rarity" className="bg-muted/50">
                      <SelectValue placeholder="Select rarity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Common">Common</SelectItem>
                      <SelectItem value="Uncommon">Uncommon</SelectItem>
                      <SelectItem value="Rare">Rare</SelectItem>
                      <SelectItem value="Epic">Epic</SelectItem>
                      <SelectItem value="Legendary">Legendary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                  <SelectTrigger id="condition" className="bg-muted/50">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New - Never Worn</SelectItem>
                    <SelectItem value="Used - Excellent">Used - Excellent</SelectItem>
                    <SelectItem value="Used - Good">Used - Good</SelectItem>
                    <SelectItem value="Used - Fair">Used - Fair</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Size (Optional)</Label>
                <Input 
                  id="size" 
                  placeholder="e.g., US 10, L, One Size" 
                  className="bg-muted/50"
                  value={formData.size}
                  onChange={(e) => handleInputChange("size", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add any additional details about your item..."
                  rows={4}
                  className="bg-muted/50 resize-none"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>

            <div className="space-y-2">
              <Label htmlFor="purchase-price">Purchase Price (Optional)</Label>
              <Input id="purchase-price" type="number" placeholder="USD" className="bg-muted/50" />
              <p className="text-xs text-muted-foreground">This helps track your collection value</p>
            </div>

            <Card className="p-4 bg-primary/10 border-primary/30">
              <h3 className="font-semibold mb-2">Minting Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network</span>
                  <span className="font-medium">Solana</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Fee</span>
                  <span className="font-medium">~0.01 SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Storage</span>
                  <span className="font-medium">IPFS</span>
                </div>
              </div>
            </Card>

            <Button 
              type="submit"
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              disabled={tokenizeLoading}
            >
              <Sparkles className="h-5 w-5" />
              {tokenizeLoading ? "Minting..." : "Mint NFT"}
            </Button>
            
            {error && (
              <div className="text-red-500 text-sm text-center">
                Error: {error}
              </div>
            )}
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
