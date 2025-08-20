/**
 * Offline Page
 * 
 * Shown when the user is offline and tries to navigate to a page
 * that's not in the service worker cache.
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full">
            <WifiOff className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-xl">You&apos;re Offline</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            It looks like you&apos;ve lost your internet connection. Some features may not be available while you&apos;re offline.
          </p>
          
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Available Offline:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• View cached dashboard data</li>
              <li>• Browse recent transfers</li>
              <li>• View rule history</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Requires Connection:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Creating new rules</li>
              <li>• Executing transfers</li>
              <li>• Real-time updates</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button 
              onClick={() => window.location.reload()} 
              className="flex items-center gap-2"
              variant="default"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button 
              onClick={() => window.history.back()} 
              variant="outline"
            >
              Go Back
            </Button>
          </div>

          <div className="pt-4 text-xs text-gray-500">
            <p>
              Once you&apos;re back online, all features will be available again.
              Any actions you attempted while offline will be retried automatically.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const metadata = {
  title: 'Offline - Ferrow',
  description: 'You are currently offline',
  robots: 'noindex, nofollow'
};