import type { Href } from 'expo-router';

export function notificationRoute(input: unknown): Href {
  if (!input || typeof input !== 'object') return '/notifications';
  const target = input as Record<string, unknown>;
  const id = typeof target.id === 'string' ? target.id : '';
  switch (target.page) {
    case 'message':
      if (typeof target.sellerId !== 'string' || !target.sellerId) return '/(tabs)/messages';
      return { pathname: '/chat', params: { sellerId: target.sellerId, sellerName: typeof target.sellerName === 'string' ? target.sellerName : 'Neighbour', ...(typeof target.listingId === 'string' ? { listingId: target.listingId } : {}), ...(typeof target.serviceId === 'string' ? { serviceId: target.serviceId } : {}) } };
    case 'listing': return id ? { pathname: '/listing/[id]', params: { id } } : '/(tabs)/marketplace';
    case 'community': return id ? { pathname: '/community/[id]', params: { id } } : '/(tabs)/community';
    case 'service': return id ? { pathname: '/services/[id]', params: { id } } : '/(tabs)/marketplace';
    case 'reviews': return { pathname: '/reviews', params: typeof target.userId === 'string' ? { userId: target.userId } : {} };
    case 'messages': return '/(tabs)/messages';
    case 'marketplace': return '/(tabs)/marketplace';
    case 'communityFeed': return '/(tabs)/community';
    default: return '/notifications';
  }
}
