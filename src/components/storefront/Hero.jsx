import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { normalizeImageUrl } from '../../lib/utils'
import { Button } from '../ui/button'
import { ChevronLeft, ChevronRight, Sparkles, Zap, Shield, Download } from 'lucide-react'

// Hero轮播内容
const heroSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80',
    title: 'Premium Digital Products',
    subtitle: 'Elevate your creative work with professional templates, design assets, and learning resources.',
    cta: 'Shop Now',
    ctaLink: '/collections',
    highlight: 'Instant Download'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1920&q=80',
    title: 'Professional Resume Templates',
    subtitle: 'Land your dream job with ATS-optimized designs. Stand out from the competition.',
    cta: 'Browse Templates',
    ctaLink: '/products/professional-resume-template-bundle',
    highlight: 'Best Seller'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1920&q=80',
    title: 'Learn UI/UX Design',
    subtitle: 'Master Figma with our comprehensive video course. From beginner to pro.',
    cta: 'Start Learning',
    ctaLink: '/products/figma-masterclass',
    highlight: 'New Course'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1920&q=80',
    title: 'Boost Your Productivity',
    subtitle: 'AI prompts, Notion templates, and productivity bundles for modern professionals.',
    cta: 'Explore Now',
    ctaLink: '/collections/productivity',
    highlight: 'Trending'
  }
]

// 信任徽章
const trustBadges = [
  { icon: Download, text: 'Instant Download', desc: 'Get your files immediately' },
  { icon: Shield, text: 'Secure Payment', desc: 'Stripe protected checkout' },
  { icon: Zap, text: 'Lifetime Access', desc: 'Free updates forever' },
  { icon: Sparkles, text: 'Premium Quality', desc: 'Professionally crafted' }
]

export function Hero({ previewSettings }) {
  const [fetchedSettings, setFetchedSettings] = useState({
    heroImageUrl: '',
    heroTitle: 'Welcome to OpenShop',
    heroSubtitle: 'Discover amazing products at unbeatable prices. Built on Cloudflare for lightning-fast performance.'
  })

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Use previewSettings if provided, otherwise use fetched settings
  const settings = previewSettings || fetchedSettings

  useEffect(() => {
    // If we have preview settings, we don't need to fetch
    if (previewSettings) return

    let isMounted = true
    async function fetchSettings() {
      try {
        const res = await fetch('/api/store-settings')
        if (res.ok) {
          const data = await res.json()
          if (isMounted) setFetchedSettings(prev => ({
            ...prev,
            heroImageUrl: data.heroImageUrl || '',
            heroTitle: data.heroTitle || prev.heroTitle,
            heroSubtitle: data.heroSubtitle || prev.heroSubtitle
          }))
        }
      } catch (e) {
        console.error('Failed to load store settings', e)
      }
    }
    fetchSettings()
    return () => { isMounted = false }
  }, [previewSettings])

  // Auto-advance hero slides
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1))
    }, 6000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToSlide = (index) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToPrevious = () => {
    setCurrentSlide(currentSlide === 0 ? heroSlides.length - 1 : currentSlide - 1)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToNext = () => {
    setCurrentSlide(currentSlide === heroSlides.length - 1 ? 0 : currentSlide + 1)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const currentHero = heroSlides[currentSlide]

  return (
    <section className="relative w-full overflow-hidden">
      {/* Hero Slides */}
      <div className="relative h-[85vh] min-h-[600px]">
        {/* Background Image with Transition */}
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={normalizeImageUrl(slide.image)}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30 z-20" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              {/* Highlight Badge */}
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white mb-6 shadow-lg">
                <Sparkles className="w-4 h-4 mr-2" />
                {currentHero.highlight}
              </span>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {currentHero.title}
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-xl">
                {currentHero.subtitle}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={currentHero.ctaLink}>
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg px-8">
                    {currentHero.cta}
                  </Button>
                </Link>
                <Link to="/about">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/50 text-white hover:bg-white/10 backdrop-blur-sm"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 ${
                index === currentSlide
                  ? 'w-12 h-3 bg-white rounded-full'
                  : 'w-3 h-3 bg-white/50 hover:bg-white/75 rounded-full'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Trust Badges Bar */}
      <div className="bg-slate-900 py-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center justify-center gap-3 text-gray-300">
                <badge.icon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <div className="font-medium text-sm text-white">{badge.text}</div>
                  <div className="text-xs text-gray-400">{badge.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
