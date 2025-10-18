"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Heart, Share2, Filter } from "lucide-react"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"

export default function FeedPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return null
  }
  // </CHANGE>

  const trendingItems = [
    {
      id: 1,
      name: "Supreme Box Logo Hoodie",
      brand: "Supreme",
      year: "2023",
      condition: "New",
      price: "USD 850",
      image: "/red-hoodie.png",
      likes: 234,
      verified: true,
      trending: true,
    },
    {
      id: 2,
      name: "Nike Dunk Low Panda",
      brand: "Nike",
      year: "2024",
      condition: "Used - Excellent",
      price: "USD 220",
      image: "/nike-dunk-low-panda-black-white.jpg",
      likes: 189,
      verified: true,
      trending: false,
    },
    {
      id: 3,
      name: "KAWS Companion Figure",
      brand: "KAWS",
      year: "2022",
      condition: "New",
      price: "USD 1,200",
      image: "/kaws-companion-grey-figure-art-toy.jpg",
      likes: 456,
      verified: true,
      trending: true,
    },
    {
      id: 4,
      name: "Bape Shark Hoodie",
      brand: "A Bathing Ape",
      year: "2023",
      condition: "New",
      price: "USD 650",
      image: "/bape-shark-hoodie-camo-green.jpg",
      likes: 167,
      verified: true,
      trending: false,
    },
    {
      id: 5,
      name: "Rolex Submariner",
      brand: "Rolex",
      year: "2021",
      condition: "Used - Good",
      price: "USD 12,500",
      image: "/rolex-submariner-black-watch-luxury.jpg",
      likes: 892,
      verified: true,
      trending: true,
    },
    {
      id: 6,
      name: "Jordan 1 Retro High OG",
      brand: "Nike",
      year: "2024",
      condition: "New",
      price: "USD 380",
      image: "/air-jordan-1-retro-high-chicago-red.jpg",
      likes: 312,
      verified: true,
      trending: false,
    },
  ]

  const categories = ["All", "Sneakers", "Streetwear", "Art Toys", "Watches", "Accessories"]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* </CHANGE> */}

      {/* Category Navigation */}
      <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-[73px] z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <Button variant="ghost" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "ghost"}
                size="sm"
                className={category === "All" ? "bg-primary text-primary-foreground" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Trending Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Trending Now</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {trendingItems.map((item) => (
              <Card
                key={item.id}
                className="group overflow-hidden border-border hover:border-primary/50 transition-all cursor-pointer"
              >
                <div className="relative aspect-square overflow-hidden bg-muted/20">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                  {item.trending && (
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">HOT</Badge>
                  )}
                  {item.verified && (
                    <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">Verified</Badge>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 right-2 flex gap-2">
                      <Button size="icon" variant="secondary" className="h-8 w-8">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="secondary" className="h-8 w-8">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.brand}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-bold text-primary">{item.price}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {item.likes}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {item.condition}
                    </Badge>
                    <span>{item.year}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Drops */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Drops</h2>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {trendingItems.slice(0, 6).map((item) => (
              <Card
                key={`recent-${item.id}`}
                className="group overflow-hidden border-border hover:border-primary/50 transition-all cursor-pointer"
              >
                <div className="relative aspect-square overflow-hidden bg-muted/20">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                  {item.verified && (
                    <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">Verified</Badge>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.brand}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-bold text-primary">{item.price}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {item.likes}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
