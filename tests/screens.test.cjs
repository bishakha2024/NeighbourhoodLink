const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { create, act } = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;
const { notificationRoute } = (() => { const exports = {}; vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/notificationRoute.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports }); return exports; })();
function screen(file, { params = {}, user = { id: 'me' }, data = {} } = {}) {
  const routes = []; const alerts = [];
  const mocks = {
    react: React, 'react/jsx-runtime': require('react/jsx-runtime'),
    'expo-router': { useFocusEffect: callback => React.useEffect(callback, [callback]), useLocalSearchParams: () => params, router: { push: (route) => routes.push(route), replace: (route) => routes.push(route), back: () => routes.push('back') } },
    'react-native': { Pressable: 'Pressable', Text: 'Text', TextInput: 'TextInput', View: 'View', Image: 'Image', ScrollView: 'ScrollView', Switch: 'Switch', Alert: { alert: (...args) => alerts.push(args) }, StyleSheet: { create: (styles) => styles } },
  };
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  vm.runInNewContext(source, { exports, console, require: (name) => {
    if (name in mocks) return mocks[name];
    if (name.endsWith('/ProfilePhoto')) return { ProfilePhoto: ({ uri }) => React.createElement('Image', { source: { uri } }) };
    if (name.endsWith('/ListingCard')) return { ListingCard: ({ listing }) => React.createElement('Text', null, listing.title) };
    if (name.endsWith('/Chip')) return { Chip: ({ label, onPress }) => React.createElement('Pressable', { onPress }, React.createElement('Text', null, label)) };
    if (name.endsWith('/Screen')) return { Screen: ({ children }) => React.createElement('Screen', null, children) };
    if (name.endsWith('/AppHeader')) return { AppHeader: ({ title }) => React.createElement('Header', null, title) };
    if (name.endsWith('/DataContext')) return { useData: () => data };
    if (name.endsWith('/AuthContext')) return { useAuth: () => ({ user }) };
    if (name.endsWith('/colors')) return { colors: {}, shadow: {} };
    if (name.endsWith('/notificationRoute')) return { notificationRoute };
    throw new Error(`Unexpected import: ${name}`);
  } });
  return { component: exports.default, routes, alerts };
}
const text = (node) => typeof node === 'string' ? node : Array.isArray(node) ? node.map(text).join('') : node && typeof node === 'object' ? text(node.children ?? []) : '';
async function render(component) { let renderer; await act(async () => { renderer = create(React.createElement(component)); }); return renderer; }
function button(renderer, label) { return renderer.root.findAllByType('Pressable').find((node) => text(node.toJSON ? node.toJSON() : node.findAllByType('Text').map((item) => item.props.children)).includes(label)); }

test('owner Manage listing opens the editor instead of a chat', async () => {
  const setup = screen('app/listing/[id].tsx', { params: { id: 'l1' }, data: { listings: [{ id: 'l1', userId: 'me', sellerName: 'Me', images: [], type: 'sale', title: 'Item', price: 10 }] } });
  const renderer = await render(setup.component);
  await act(async () => button(renderer, 'Manage listing').props.onPress());
  assert.equal(setup.routes[0].pathname, '/listing/manage/[id]'); assert.equal(setup.routes[0].params.id, 'l1');
  await act(async () => renderer.unmount());
});
test('service contact targets the correct provider and service', async () => {
  const setup = screen('app/services/[id].tsx', { params: { id: 's1' }, data: { services: [{ id: 's1', userId: 'provider', providerName: 'Provider', serviceName: 'Tutoring', rating: 0 }] } });
  const renderer = await render(setup.component);
  await act(async () => button(renderer, 'Contact provider').props.onPress());
  assert.equal(setup.routes[0].pathname, '/chat'); assert.equal(setup.routes[0].params.sellerId, 'provider'); assert.equal(setup.routes[0].params.serviceId, 's1');
  await act(async () => renderer.unmount());
});
test('notification presses mark read and open the specific community post', async () => {
  const read = [];
  const setup = screen('app/notifications.tsx', { data: { notifications: [{ id: 'n1', title: 'New comment', body: 'Hi', createdAt: '2026-10-06', target: { page: 'community', id: 'p1' } }], markNotificationRead: (id) => read.push(id) } });
  const renderer = await render(setup.component);
  await act(async () => renderer.root.findByType('Pressable').props.onPress());
  assert.equal(read[0], 'n1'); assert.equal(setup.routes[0].pathname, '/community/[id]'); assert.equal(setup.routes[0].params.id, 'p1');
  await act(async () => renderer.unmount());
});
test('community detail like and comment buttons call the correct actions', async () => {
  const likes = []; const comments = [];
  const setup = screen('app/community/[id].tsx', { params: { id: 'p1' }, data: { loading: false, posts: [{ id: 'p1', userName: 'Author', title: 'Post', content: 'Content', images: [], createdAt: '2026-10-06' }], postLikes: [], postComments: [], togglePostLike: async (id) => likes.push(id), addPostComment: async (id, content) => comments.push({ id, content }) } });
  const renderer = await render(setup.component);
  await act(async () => button(renderer, 'Like').props.onPress()); assert.equal(likes[0], 'p1');
  await act(async () => renderer.root.findByType('TextInput').props.onChangeText('Hello'));
  await act(async () => button(renderer, 'Post comment').props.onPress()); assert.equal(comments[0].id, 'p1'); assert.equal(comments[0].content, 'Hello'); assert.equal(renderer.root.findByType('TextInput').props.value, '');
  await act(async () => renderer.unmount());
});

test('seller chat retains history across listings, marks read, and opens profile', async () => {
 const read = [];
 const setup = screen('app/chat.tsx', { params: { sellerId: 'seller', sellerName: 'Seller', listingId: 'new' }, data: { markConversationRead: id => read.push(id), addMessage: async () => {}, messages: [
 { id: 'old', senderId: 'seller', receiverId: 'me', senderName: 'Seller', text: 'Previous conversation', listingId: 'old-listing', timestamp: '2026-10-01' },
 { id: 'new', senderId: 'me', receiverId: 'seller', text: 'Recent conversation', listingId: 'new', timestamp: '2026-10-06' },
 { id: 'private', senderId: 'someone', receiverId: 'me', text: 'Another conversation', timestamp: '2026-10-06' },
 ] } });
 const renderer = await render(setup.component);
 const content = text(renderer.toJSON());
 assert.match(content, /Previous conversation/); assert.match(content, /Recent conversation/); assert.doesNotMatch(content, /Another conversation/);
 assert.deepEqual(read, ['seller']);
 await act(async () => button(renderer, 'View profile').props.onPress());
 assert.equal(setup.routes[0].pathname, '/neighbour/[id]');
 assert.equal(setup.routes[0].params.id, 'seller');
 await act(async () => renderer.unmount());
});

test('All marketplace includes searchable services and Services excludes items', async () => {
 const setup = screen('app/(tabs)/marketplace.tsx', { data: { markMarketplaceSeen: () => {}, listings: [{ id: 'l', title: 'Drill', category: 'Tools', description: 'Tool', type: 'sale' }], services: [{ id: 's', serviceName: 'Tutoring', category: 'Education', description: 'Math', providerName: 'Teacher', rating: 0 }] } });
 const renderer = await render(setup.component);
 assert.match(text(renderer.toJSON()), /Drill/); assert.match(text(renderer.toJSON()), /Tutoring/);
 await act(async () => renderer.root.findByType('TextInput').props.onChangeText('math'));
 assert.match(text(renderer.toJSON()), /Tutoring/); assert.doesNotMatch(text(renderer.toJSON()), /Drill/);
 await act(async () => renderer.root.findByType('TextInput').props.onChangeText(''));
 await act(async () => button(renderer, 'Services').props.onPress());
 assert.match(text(renderer.toJSON()), /Tutoring/); assert.doesNotMatch(text(renderer.toJSON()), /Drill/);
 await act(async () => renderer.unmount());
});
