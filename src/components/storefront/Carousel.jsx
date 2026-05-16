import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { normalizeImageUrl } from '../../lib/utils'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Gift, Percent, Clock, Star, TrendingUp, Package } from 'lucide-react'

// 营销Banner数据
const marketingBanners = [
  {
    id: 1,
    type: 'promo',
    bgColor: 'from-violet-600 to-purple-700',
    icon: Gift,
    title: 'Special Launch Offer',
    subtitle: 'Get 20% off on all templates',
    description: 'Use code LAUNCH20 at checkout',
    cta: 'Shop Templates',
    ctaLink: '/collections/templates',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80',
    badge: 'Limited Time'
  },
  {
    id: 2,
    type: 'featured',
    bgColor: 'from-blue-600 to-cyan-600',
    icon: Star,
    title: 'Best Seller Bundle',
    subtitle: 'Resume Template Collection',
    description: '20+ professional designs, ATS-optimized',
    cta: 'View Bundle',
    ctaLink: '/products/professional-resume-template-bundle',
    price: '$9.99',
    originalPrice: '$19.99',
    badge: 'Best Seller'
  },
  {
    id: 3,
    type: 'new',
    bgColor: 'from-emerald-600 to-teal-600',
    icon: TrendingUp,
    title: 'New Arrival',
    subtitle: 'AI Prompt Library',
    description: '500+ ChatGPT prompts for productivity',
    cta: 'Explore Now',
    ctaLink: '/products/ai-prompt-library',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    badge: 'New'
  },
  {
    id: 4,
    type: 'bundle',
    bgColor: 'from-orange-500 to-amber-600',
    icon: Package,
    title: 'Complete Productivity Pack',
    subtitle: 'Notion + AI Prompts + E-Books',
    description: 'Everything you need to 10x your productivity',
    cta: 'View Collection',
    ctaLink: '/collections/productivity',
    badge: 'Popular'
  }
]

export function Carousel({ products = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === marketingBanners.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? marketingBanners.length - 1 : currentIndex - 1)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToNext = () => {
    setCurrentIndex(currentIndex === marketingBanners.length - 1 ? 0 : currentIndex + 1)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const currentBanner = marketingBanners[currentIndex]
  const IconComponent = currentBanner.icon

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl">
      {/* Banner Container */}
      <div className={`relative h-[400px] md:h-[350px] bg-gradient-to-r ${currentBanner.bgColor}`}>
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left Content */}
              <div className="text-white space-y-4">
                {/* Badge */}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm">
                  {currentBanner.badge}
                </span>

                {/* Icon + Title */}
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold">{currentBanner.title}</h3>
                </div>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl font-medium text-white/90">
                  {currentBanner.subtitle}
                </p>

                {/* Description */}
                <p className="text-gray-200 text-sm md:text-base max-w-md">
                  {currentBanner.description}
                </p>

                {/* Price (if available) */}
                {currentBanner.price && (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold">{currentBanner.price}</span>
                    {currentBanner.originalPrice && (
                      <span className="text-lg text-white/60 line-through">
                        {currentBanner.originalPrice}
                      </span>
                    )}
                  </div>
                )}

                {/* CTA Button */}
                <Link to={currentBanner.ctaLink}>
                  <Button
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-gray-100 font-semibold mt-2"
                  >
                    {currentBanner.cta}
                  </Button>
                </Link>
              </div>

              {/* Right Image (if available) */}
              {currentBanner.image && (
                <div className="hidden md:flex justify-center items-center">
                  <div className="relative">
                    <img
                      src={normalizeImageUrl(currentBanner.image)}
                      alt={currentBanner.title}
                      className="w-72 h-72 object-cover rounded-2xl shadow-2xl"
                    />
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Navigation Buttons */}
      <button
        type="button"
        onClick={goToPrevious}
        aria-label="Previous banner"
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all z-20"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={goToNext}
        aria-label="Next banner"
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all z-20"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {marketingBanners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 h-2 bg-white rounded-full'
                : 'w-2 h-2 bg-white/50 hover:bg-white/75 rounded-full'
            }`}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-white transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / marketingBanners.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
