export type ListingType = 'sale' | 'borrow' | 'giveaway';

export type Listing = {
  id: string;
  userId: string;
  sellerName: string;
  title: string;
  description: string;
  category: string;
  type: ListingType;
  price: number;
  images: string[];
  location: string;
  status: 'active' | 'reserved' | 'sold';
  createdAt: string;
};

export type CommunityPost = {
  id: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  images: string[];
  location: string;
  createdAt: string;
};

export type Service = {
  id: string;
  userId: string;
  providerName: string;
  serviceName: string;
  description: string;
  category: string;
  location: string;
  price: number;
  availability: string;
  createdAt?: string;
  rating: number;
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  text: string;
  timestamp: string;
  listingId?: string;
  serviceId?: string;
  receiverName?: string;
};

export type Review = {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewedUserId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type AppUser = {
  id: string;
  fullName: string;
  email: string;
  profileImage?: string;
  location: string;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  rating: number;
};

export type NotificationTarget =
  | { page: 'message'; sellerId: string; sellerName: string; listingId?: string; serviceId?: string }
  | { page: 'listing' | 'community' | 'service'; id: string }
  | { page: 'reviews'; userId?: string }
  | { page: 'messages' | 'marketplace' | 'communityFeed' };

export type Notification = {
  target?: NotificationTarget;
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type PostLike = { id: string; postId: string; userId: string; createdAt: string };
export type PostComment = { id: string; postId: string; userId: string; userName: string; content: string; createdAt: string };

export type Preferences = {
  pushEnabled: boolean;
  communityUpdates: boolean;
  useLocation: boolean;
};

export type Report = {
  id: string;
  userId: string;
  listingId?: string;
  reason: string;
  details: string;
  createdAt: string;
  status: 'pending';
};

export type ListingLike = { id: string; listingId: string; userId: string; createdAt: string };
export type ListingComment = { id: string; listingId: string; userId: string; userName: string; content: string; createdAt: string };
