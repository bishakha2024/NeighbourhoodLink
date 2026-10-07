import type { Listing, ListingLike, ListingComment, CommunityPost, Message, Notification, PostComment, PostLike, Preferences, Review } from '../types';

export function buildNotifications(userId: string, data: { listings?: Listing[]; listingLikes?: ListingLike[]; listingComments?: ListingComment[]; messages: Message[]; posts: CommunityPost[]; reviews: Review[]; postComments: PostComment[]; postLikes: PostLike[] }, readIds: string[], preferences: Preferences): Notification[] {
  const result: Notification[] = [];
  const add = (id: string, title: string, body: string, createdAt: string, target: Notification['target']) => result.push({ id, title, body, createdAt, target, read: readIds.includes(id) });
  for (const message of data.messages) {
    if (message.receiverId === userId && message.senderId !== userId) add(`message-${message.id}`, 'New message', `${message.senderName}: ${message.text}`, message.timestamp, { page: 'message', sellerId: message.senderId, sellerName: message.senderName, ...(message.listingId ? { listingId: message.listingId } : {}), ...(message.serviceId ? { serviceId: message.serviceId } : {}) });
  }
  for (const review of data.reviews) {
    if (review.reviewedUserId === userId) add(`review-${review.id}`, 'Review received', `${review.reviewerName} left you a ${review.rating}-star review.`, review.createdAt, { page: 'reviews', userId });
  }
  for (const post of data.posts) {
    if (preferences.communityUpdates && post.userId !== userId) add(`post-${post.id}`, 'Neighbourhood update', post.title, post.createdAt, { page: 'community', id: post.id });
    if (post.userId !== userId) continue;
    for (const comment of data.postComments.filter((item) => item.postId === post.id && item.userId !== userId)) add(`comment-${comment.id}`, 'New comment', `${comment.userName}: ${comment.content}`, comment.createdAt, { page: 'community', id: post.id });
    for (const like of data.postLikes.filter((item) => item.postId === post.id && item.userId !== userId)) add(`like-${like.id}`, 'Post liked', `A neighbour liked “${post.title}”.`, like.createdAt, { page: 'community', id: post.id });
  }
  for (const listing of data.listings ?? []) {
    if (listing.userId !== userId) continue;
    for (const comment of (data.listingComments ?? []).filter(item => item.listingId === listing.id && item.userId !== userId)) add(`listing-comment-${comment.id}`, 'Listing comment', `${comment.userName}: ${comment.content}`, comment.createdAt, { page: 'listing', id: listing.id });
    for (const like of (data.listingLikes ?? []).filter(item => item.listingId === listing.id && item.userId !== userId)) add(`listing-like-${like.id}`, 'Listing liked', `A neighbour liked “${listing.title}”.`, like.createdAt, { page: 'listing', id: listing.id });
  }
  return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
