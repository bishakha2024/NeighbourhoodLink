import { CommunityPost, Listing, Message, Notification, Review, Service } from '../types';

export const demoUser = {
  id: 'demo-user',
  fullName: 'Sarah Roy',
  email: 'Sarah@gmail.com',
  location: 'Hamilton, ON',
  verificationStatus: 'verified' as const,
  rating: 4.8,
};

export const listings: Listing[] = [
  {
    id: 'l1', userId: 'u1', sellerName: 'Maya Chen', title: 'Cordless Drill',
    description: 'Lightly used drill set. Perfect for small home projects.', category: 'Tools',
    type: 'sale', price: 35, images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80'],
    location: '2 blocks away', status: 'active', createdAt: '2026-09-21T13:00:00.000Z'
  },
  {
    id: 'l2', userId: 'u2', sellerName: 'Jordan Patel', title: 'Folding Camping Chairs',
    description: 'Two clean folding chairs available for weekend borrowing.', category: 'Outdoor',
    type: 'borrow', price: 0, images: ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=900&q=80'],
    location: '4 blocks away', status: 'active', createdAt: '2026-09-20T15:30:00.000Z'
  },
  {
    id: 'l3', userId: 'u3', sellerName: 'Amelia Wright', title: 'Moving Boxes',
    description: 'Clean medium-size boxes from a recent move. Free to a neighbour.', category: 'Home',
    type: 'giveaway', price: 0, images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80'],
    location: '6 blocks away', status: 'active', createdAt: '2026-09-19T10:10:00.000Z'
  },
  {
    id: 'l4', userId: 'u4', sellerName: 'Sam Lee', title: 'Kids Bicycle',
    description: 'Good condition 20-inch bike. Helmet included.', category: 'Kids',
    type: 'sale', price: 60, images: ['https://images.unsplash.com/photo-1511994298241-608e28f14fde?auto=format&fit=crop&w=900&q=80'],
    location: '8 blocks away', status: 'active', createdAt: '2026-09-18T09:45:00.000Z'
  },
];

export const posts: CommunityPost[] = [
  { id: 'p1', userId: 'u5', userName: 'Nina Brooks', title: 'Block clean-up this Saturday', content: 'We are meeting by the community garden at 10 AM. Bring gloves if you have them.', images: [], location: 'Community Garden', createdAt: '2026-09-22T12:00:00.000Z' },
  { id: 'p2', userId: 'u6', userName: 'Carlos Mendes', title: 'Found: set of keys', content: 'Found a small set of keys near the playground. Message me with a description.', images: [], location: 'East Park', createdAt: '2026-09-21T16:00:00.000Z' },
  { id: 'p3', userId: 'u1', userName: 'Maya Chen', title: 'Neighbourhood yard sale map', content: 'Several homes are joining the yard sale next weekend. I posted a map in the comments.', images: [], location: 'Maple Street', createdAt: '2026-09-20T08:15:00.000Z' },
];

export const services: Service[] = [
  { id: 's1', userId: 'u7', providerName: 'Noah Williams', serviceName: 'Lawn & Garden Help', description: 'Mowing, edging and seasonal yard clean-up for nearby homes.', category: 'Home', location: 'Within 3 km', price: 25, availability: 'Weekends', rating: 4.9 },
  { id: 's2', userId: 'u8', providerName: 'Priya Singh', serviceName: 'Math Tutoring', description: 'High-school math tutoring with flexible evening sessions.', category: 'Education', location: 'Online + local', price: 30, availability: 'Mon–Thu evenings', rating: 5.0 },
  { id: 's3', userId: 'u9', providerName: 'Ethan Brooks', serviceName: 'Pet Sitting', description: 'Reliable dog walking and pet check-ins for neighbours.', category: 'Pets', location: 'Within 2 km', price: 18, availability: 'Daily', rating: 4.7 },
];

export const messages: Message[] = [
  { id: 'm1', senderId: 'u1', receiverId: 'demo-user', senderName: 'Maya Chen', text: 'Hi! The drill is still available.', timestamp: '2026-09-23T18:10:00.000Z', listingId: 'l1' },
  { id: 'm2', senderId: 'demo-user', receiverId: 'u1', senderName: 'Bishakha Roy', text: 'Great. Is pickup possible this evening?', timestamp: '2026-09-23T18:12:00.000Z', listingId: 'l1' },
  { id: 'm3', senderId: 'u2', receiverId: 'demo-user', senderName: 'Jordan Patel', text: 'You can borrow the chairs this weekend.', timestamp: '2026-09-22T14:25:00.000Z', listingId: 'l2' },
];

export const reviews: Review[] = [
  { id: 'r1', reviewerId: 'u1', reviewerName: 'Maya Chen', reviewedUserId: 'demo-user', rating: 5, comment: 'Friendly and easy to coordinate with.', createdAt: '2026-09-18T11:00:00.000Z' },
  { id: 'r2', reviewerId: 'u3', reviewerName: 'Amelia Wright', reviewedUserId: 'demo-user', rating: 5, comment: 'Great neighbour and quick communication.', createdAt: '2026-09-10T12:00:00.000Z' },
];

export const notifications: Notification[] = [
  { id: 'n1', target: { page: 'message', sellerId: 'u1', sellerName: 'Maya Chen', listingId: 'l1' }, title: 'New message', body: 'Maya Chen sent you a message about Cordless Drill.', createdAt: '2026-09-23T18:10:00.000Z', read: false },
  { id: 'n2', target: { page: 'community', id: 'p1' }, title: 'Neighbourhood update', body: 'A new community clean-up event was posted.', createdAt: '2026-09-22T12:00:00.000Z', read: true },
  { id: 'n3', target: { page: 'reviews' }, title: 'Review received', body: 'You received a 5-star review.', createdAt: '2026-09-18T11:00:00.000Z', read: true },
];
