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
      const p = new firebase.auth.GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
      try { await auth.signInWithPopup(p); }
      catch (e) { if (e.code === 'auth/popup-blocked') return auth.signInWithRedirect(p); throw e; }
    },
    signOut: () => auth.signOut(),
    // users/{uid} = { nickname, avatar, state (JSON string of the app state), updatedAt }
    async load(uid) { const s = await db.doc('users/' + uid).get(); return s.exists ? s.data() : null; },
    save: (uid, data) => db.doc('users/' + uid).set({ ...data, updatedAt: now() }, { merge: true }),
  };
})();
