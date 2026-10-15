/* ===== Lock In — accounts & sync (Firebase). Only active on the published site. ===== */
const Cloud = (() => {
  // Public web config: safe to ship. Access is controlled by firestore.rules.
  const CONFIG = {
    apiKey: 'AIzaSyCEaxnHjk_jd3UCKQUKzvTNM8r48UtcI3I',
    authDomain: 'lockin-jm8.firebaseapp.com',
    projectId: 'lockin-jm8',
    storageBucket: 'lockin-jm8.firebasestorage.app',
    messagingSenderId: '235990007033',
    appId: '1:235990007033:web:e8e2dc9f45594b921cb628',
  };
  let topLevel = false; try { topLevel = window.top === window; } catch (e) { }
  const available = typeof firebase !== 'undefined' && topLevel && (location.protocol === 'https:' || location.hostname === 'localhost');
  let auth = null, db = null;
  if (available) {
    firebase.initializeApp(CONFIG);
    auth = firebase.auth(); db = firebase.firestore();
    db.enablePersistence({ synchronizeTabs: true }).catch(() => { });
  }
  const now = () => firebase.firestore.FieldValue.serverTimestamp();

  return {
    available,
    init(onUser) { if (!available) return onUser(null); auth.onAuthStateChanged(u => onUser(u ? { uid: u.uid } : null)); },
    async signIn() {
      // Desktop app: Google doesn't allow sign-in inside apps, so it happens in the normal browser
      // and comes back as a credential (see desktop/main.js and desktop/signin.html).
      if (window.lockinDesktop) {
        const t = await window.lockinDesktop.signInWithGoogle();
        if (!t) { const e = new Error('closed'); e.code = 'auth/popup-closed-by-user'; throw e; }
        return auth.signInWithCredential(firebase.auth.GoogleAuthProvider.credential(t.idToken, t.accessToken));
      }
      const p = new firebase.auth.GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
      await auth.signInWithPopup(p); // popup only: redirect sign-in breaks on iPhone when the site isn't on firebaseapp.com
    },
    signOut: () => auth.signOut(),
    // users/{uid} = { nickname, avatar, state (JSON string of the app state), updatedAt }
    async load(uid) { const s = await db.doc('users/' + uid).get(); return s.exists ? s.data() : null; },
    save: (uid, data) => db.doc('users/' + uid).set({ ...data, updatedAt: now() }, { merge: true }),

    // groups/{code} = { name, owner, createdAt }; groups/{code}/members/{uid} = leaderboard row
    async createGroup(name, uid, member) {
      for (let i = 0; i < 5; i++) {
        const code = Logic.newGroupCode();
        try { await db.doc('groups/' + code).set({ name, owner: uid, createdAt: now() }); }
        catch (e) { if (e.code === 'permission-denied') continue; throw e; } // code taken by someone else's group
        await this.joinGroup(code, uid, member);
        return code;
      }
      throw new Error('Couldn\'t make a group code. Try again.');
    },
    async joinGroup(code, uid, member) {
      const g = await db.doc('groups/' + code).get();
      if (!g.exists) { const e = new Error('No group with that code'); e.code = 'not-found'; throw e; }
      await db.doc(`groups/${code}/members/${uid}`).set({ ...member, updatedAt: now() });
      return { code, name: g.data().name };
    },
    leaveGroup: (code, uid) => db.doc(`groups/${code}/members/${uid}`).delete(),
    pushMember: (codes, uid, member) => Promise.all(codes.map(c => db.doc(`groups/${c}/members/${uid}`).set({ ...member, updatedAt: now() }))),
    async board(code) { const s = await db.collection(`groups/${code}/members`).get(); return s.docs.map(d => ({ uid: d.id, ...d.data() })); },
  };
})();
