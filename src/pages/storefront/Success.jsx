import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Footer } from '../../components/storefront/Footer'
import { CheckCircle, Package, ArrowLeft, Download } from 'lucide-react'

export function Success() {
  const [searchParams] = useSearchParams()
  const [sessionData, setSessionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloads, setDownloads] = useState(null)
  const [loadingDownloads, setLoadingDownloads] = useState(false)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (sessionId) {
      fetchSessionData()
    } else {
      setLoading(false)
    }
  }, [sessionId])

  const fetchSessionData = async () => {
    try {
      const response = await fetch(`/api/checkout-session/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setSessionData(data)
      }
    } catch (error) {
      console.error('Error fetching session data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDownloadTokens = async () => {
    setLoadingDownloads(true)
    try {
      const response = await fetch('/api/create-download-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })
      if (response.ok) {
        const data = await response.json()
        setDownloads(data.downloads)
      }
    } catch (error) {
      console.error('Error fetching download tokens:', error)
    } finally {
      setLoadingDownloads(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Processing your order...</p>
        </div>
      </div>
    )
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Session</h1>
            <p className="text-slate-600 mb-6">
              We couldn't find your order information.
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Store
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>Order Successful - OpenShop</title>
        <meta name="description" content="Thank you for your purchase. Download your digital products instantly." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-600 mb-2">Order Successful!</h1>
            <p className="text-slate-600 mb-6">
              Thank you for your purchase. You should receive a confirmation email shortly.
            </p>

            {sessionData && (
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-600">Order ID</p>
                <p className="font-mono text-sm">{sessionData.id}</p>
              </div>
            )}

            {/* Download Section */}
            {!downloads && !loadingDownloads && (
              <Button
                onClick={fetchDownloadTokens}
                className="w-full mb-4"
                variant="default"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Your Files
              </Button>
            )}

            {loadingDownloads && (
              <div className="mb-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-sm text-slate-600 mt-2">Generating download links...</p>
              </div>
            )}

            {downloads && downloads.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-green-900 mb-3">Your Downloads:</h3>
                <div className="space-y-2">
                  {downloads.map((item, idx) => (
                    <a
                      key={idx}
                      href={'/api/download/' + item.token}
                      download={item.fileName}
                      className="flex items-center justify-between bg-white p-3 rounded border border-green-200 hover:bg-green-100 transition"
                    >
                      <span className="text-sm text-green-800">{item.productName}</span>
                      <Download className="w-4 h-4 text-green-600" />
                    </a>
                  ))}
                </div>
                <p className="text-xs text-green-700 mt-3">Links expire in 24 hours</p>
              </div>
            )}

            <div className="space-y-3">
              <Link to="/" className="block">
                <Button className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  )
}
