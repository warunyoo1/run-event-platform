import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldGuardLink } from '../src/lib/navigation-guard.ts';
const current = 'http://localhost:3001/events/run/register';
test('guards internal routes and same-tab external links', () => {
 assert.equal(shouldGuardLink(current,'/events/run'),true);
 assert.equal(shouldGuardLink(current,'/find-order'),true);
 assert.equal(shouldGuardLink(current,'https://example.com'),true);
 assert.equal(shouldGuardLink(current,current+'?step=2'),true);
});
test('allows anchors and separate browsing without discarding this form', () => {
 assert.equal(shouldGuardLink(current,'#firstName'),false);
 assert.equal(shouldGuardLink(current,current),false);
 assert.equal(shouldGuardLink(current,'/events',{target:'_blank'}),false);
 assert.equal(shouldGuardLink(current,'/events',{modified:true}),false);
 assert.equal(shouldGuardLink(current,'/calendar',{download:true}),false);
 assert.equal(shouldGuardLink(current,'mailto:organizer@example.com'),false);
});
