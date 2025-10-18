import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Box, Sparkles, Shield, Users, TrendingUp, Wallet } from "lucide-react"
import { Header } from "@/components/header"
import Link from "next/link"

export default function LandingPage() {
  // Fila 1 del carrusel - Imágenes principales
  const row1Images = [
    "/streetwear-sneakers-.jpg",
    "/art-toys-kaws-bearbrick-.jpg", 
    "/luxury-watches-streetwear-.jpg",
    "/supreme-hoodie-streetwear.jpg",
    "/jordan-sneakers-collection.jpg",
  ]

  // Fila 2 del carrusel - Imágenes secundarias
  const row2Images = [
    "/nike-dunk-low-panda-black-white.jpg",
    "/kaws-companion-grey-figure-art-toy.jpg",
    "/bape-shark-hoodie-camo-green.jpg", 
    "/rolex-submariner-black-watch-luxury.jpg",
    "/air-jordan-1-retro-high-chicago-red.jpg",
  ]

  const row1Order = [0, 3, 1, 4, 2, 0, 3, 1, 4, 2, 0, 3]
  const row2Order = [2, 0, 4, 1, 3, 2, 0, 4, 1, 3, 2, 0]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0 flex flex-col justify-center gap-4 py-8">
          {/* Row 1 - Scrolling Right */}
          <div className="flex gap-4 animate-scroll-right">
            {row1Order.map((imgIndex, i) => (
              <div key={`row1-${i}`} className="flex-shrink-0 w-56 h-56 bg-muted/20 rounded-lg overflow-hidden">
                <img
                  src={row1Images[imgIndex] || "/placeholder.svg"}
                  alt="Streetwear collection item"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {row1Order.map((imgIndex, i) => (
              <div key={`row1-dup-${i}`} className="flex-shrink-0 w-56 h-56 bg-muted/20 rounded-lg overflow-hidden">
                <img
                  src={row1Images[imgIndex] || "/placeholder.svg"}
                  alt="Streetwear collection item"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Row 2 - Scrolling Left */}
          <div className="flex gap-4 animate-scroll-left">
            {row2Order.map((imgIndex, i) => (
              <div key={`row2-${i}`} className="flex-shrink-0 w-56 h-56 bg-muted/20 rounded-lg overflow-hidden">
                <img
                  src={row2Images[imgIndex] || "/placeholder.svg"}
                  alt="Streetwear collection item"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {row2Order.map((imgIndex, i) => (
              <div key={`row2-dup-${i}`} className="flex-shrink-0 w-56 h-56 bg-muted/20 rounded-lg overflow-hidden">
                <img
                  src={row2Images[imgIndex] || "/placeholder.svg"}
                  alt="Streetwear collection item"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="absolute inset-0 backdrop-blur-md bg-background/70" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance leading-tight drop-shadow-lg">
              Tokenize Your <span className="text-primary">Streetwear</span>
              <br />
              Own Your Legacy
            </h1>
            <p className="text-xl md:text-2xl text-foreground/90 font-medium max-w-2xl mx-auto text-balance leading-relaxed drop-shadow-md">
              Transform your physical collectibles into verified NFTs. Showcase your collection, prove authenticity, and
              trade with confidence on the blockchain.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8">
                  Start Tokenizing
                </Button>
              </Link>
              <Link href="/feed">
                <Button size="lg" variant="outline" className="text-base px-8 bg-background/80 backdrop-blur-sm">
                  Explore Collections
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { label: "Items Tokenized", value: "10K+" },
            { label: "Active Collectors", value: "2.5K+" },
            { label: "Trading Volume", value: "$500K+" },
            { label: "Verified Brands", value: "50+" },
          ].map((stat) => (
            <div key={stat.label} className="text-center space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Why Choose UnboX</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The complete platform for streetwear collectors in web3
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              icon: Shield,
              title: "Verified Authenticity",
              description: "On-chain certificates eliminate fakes and build trust in every transaction",
            },
            {
              icon: TrendingUp,
              title: "Instant Liquidity",
              description: "Trade your collectibles P2P with transparent pricing and secure transactions",
            },
            {
              icon: Users,
              title: "Social Community",
              description: "Connect with collectors, share your collection, and discover trending items",
            },
            {
              icon: Wallet,
              title: "Web3 Native",
              description: "Built on Solana for fast, low-cost transactions and true digital ownership",
            },
            {
              icon: Sparkles,
              title: "Digital Provenance",
              description: "Complete ownership history tracked on-chain for every tokenized item",
            },
            {
              icon: Box,
              title: "Easy Tokenization",
              description: "Upload photos, add details, and mint your NFT in minutes",
            },
          ].map((feature) => (
            <Card key={feature.title} className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
              <feature.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Get Started in Minutes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple steps to tokenize your first collectible
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              step: "01",
              title: "Connect Wallet",
              description: "Sign in with your Solana wallet or create a new account with email",
            },
            {
              step: "02",
              title: "Upload & Verify",
              description: "Take photos of your item, add details like brand, year, and condition",
            },
            {
              step: "03",
              title: "Mint NFT",
              description: "Generate your on-chain certificate and showcase it to the community",
            },
          ].map((step) => (
            <div key={step.step} className="relative">
              <div className="text-6xl font-bold text-primary/20 mb-4">{step.step}</div>
              <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-br from-primary/20 via-secondary/20 to-background border-primary/30 p-12 md:p-16 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-balance">
              Ready to Tokenize Your Collection?
            </h2>
            <p className="text-lg text-muted-foreground text-balance">
              Join thousands of collectors showcasing and trading their streetwear on Solana
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8">
                  Launch App
                </Button>
              </Link>
              <Link href="/feed">
                <Button size="lg" variant="outline" className="text-base px-8 bg-transparent">
                  View Collections
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Box className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">UnboX</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Tokenize streetwear, art toys, and luxury collectibles on Solana
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 UnboX. Built for Frutero Jam Hackathon on Solana.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
