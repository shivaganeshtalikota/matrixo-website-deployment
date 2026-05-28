# 🔧 Firebase Authentication Troubleshooting

## ❌ "GitHub sign-in failed" Error

### Root Cause
GitHub OAuth is not fully configured in Firebase Console. You need to set up a GitHub OAuth App and add credentials.

### ✅ Solution Steps

#### Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the details:
   - **Application name**: `matriXO Authentication`
   - **Homepage URL**: `https://matrixo.in`
   - **Authorization callback URL**: `https://matrixo-in-auth.firebaseapp.com/__/auth/handler`
4. Click **"Register application"**
5. Copy the **Client ID**
6. Click **"Generate a new client secret"**
7. Copy the **Client Secret** (save it somewhere safe!)

#### Step 2: Configure Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/matrixo-in-auth/authentication/providers)
2. Click on **GitHub** provider
3. Click **Enable**
4. Paste your **Client ID** from GitHub
5. Paste your **Client Secret** from GitHub
6. Copy the **Authorization callback URL** shown in Firebase
7. Click **Save**

#### Step 3: Update GitHub OAuth App

1. Go back to your GitHub OAuth App settings
2. Make sure the **Authorization callback URL** matches exactly what Firebase shows
3. Add additional callback URLs for your domains:
   - `https://matrixo.in/__/auth/handler`
   - `https://beta.matrixo.in/__/auth/handler`
   - `http://localhost:3000/__/auth/handler` (for testing)

---

## ❌ "Unauthorized domain" Error

### Root Cause
Your domain is not added to Firebase authorized domains list.

### ✅ Solution Steps

1. Go to [Firebase Console](https://console.firebase.google.com/project/matrixo-in-auth/authentication/settings)
2. Click on **Settings** tab
3. Scroll to **Authorized domains**
4. Click **Add domain**
5. Add these domains:
   - `matrixo.in`
   - `beta.matrixo.in`
   - `matrixo-in-auth.web.app` (automatically added)
   - `localhost` (automatically added)
6. Click **Add**

---

## ❌ Vercel Deployment Issues

### Check Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `matrixo-website-deployment`
3. Go to **Settings** > **Environment Variables**
4. Make sure ALL these variables are added:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=matrixo-in-auth.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=matrixo-in-auth
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=matrixo-in-auth.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=431287252568
NEXT_PUBLIC_FIREBASE_APP_ID=1:431287252568:web:0bdc2975d8951203bf7c2d
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-J18MTSRX3K
```

5. **Important**: Select **All environments** (Production, Preview, Development)
6. Click **Save**
7. **Redeploy** your site for changes to take effect

---

## ❌ "Popup blocked" Error

### Root Cause
Browser is blocking the OAuth popup window.

### ✅ Solution Steps

1. **Allow popups** for your domain in browser settings
2. Or use **redirect method** instead of popup (better for mobile):

Update `lib/AuthContext.tsx`:
```typescript
import { signInWithRedirect, getRedirectResult } from 'firebase/auth'

// In component
useEffect(() => {
  getRedirectResult(auth).then((result) => {
    if (result?.user) {
      toast.success('Signed in successfully!')
    }
  }).catch((error) => {
    console.error('Redirect error:', error)
  })
}, [])

// Change popup to redirect
const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  await signInWithRedirect(auth, provider)
}
```

---

## ✅ Quick Test Checklist

After configuration, test these:

### Email/Password Authentication
- [ ] Sign up with new email
- [ ] Log in with existing email
- [ ] Check if user appears in Firebase Console > Authentication > Users
- [ ] Verify navbar shows user name/email
- [ ] Test logout functionality

### Google OAuth
- [ ] Click Google button
- [ ] Complete Google sign-in flow
- [ ] Check if redirected back to site
- [ ] Verify user is logged in

### GitHub OAuth
- [ ] Click GitHub button
- [ ] Complete GitHub authorization
- [ ] Check if redirected back to site
- [ ] Verify user is logged in

---

## 🔍 Debugging Tips

### Check Browser Console
1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for Firebase errors
4. Common error codes:
   - `auth/unauthorized-domain` - Add domain to Firebase
   - `auth/popup-blocked` - Allow popups
   - `auth/operation-not-allowed` - Enable auth method in Firebase
   - `auth/invalid-api-key` - Check API key is correct

### Check Firebase Console
1. Go to **Authentication** > **Users**
2. See if users are being created
3. Check **Sign-in method** tab
4. Verify providers are enabled (green checkmark)

### Check Network Tab
1. Open DevTools > Network tab
2. Try to sign in
3. Look for failed requests to `firebase` or `google`
4. Check response messages

---

## 📞 Still Having Issues?

### For Email/Password Issues:
- Verify email format is correct
- Check password is at least 6 characters
- Look in browser console for specific error codes

### For OAuth Issues:
- Double-check Client ID and Secret in Firebase Console
- Verify callback URLs match exactly
- Make sure domains are authorized
- Try in incognito mode (clears cache)

### For Vercel Deployment:
- Check build logs for errors
- Verify all environment variables are set
- Redeploy after adding variables
- Check that variables start with `NEXT_PUBLIC_`

---

## 🎯 Working Configuration Example

**Firebase Console should show:**
- ✅ Email/Password: Enabled
- ✅ Google: Enabled (with proper config)
- ✅ GitHub: Enabled (with Client ID/Secret)

**Authorized domains should include:**
- ✅ localhost
- ✅ matrixo.in
- ✅ beta.matrixo.in
- ✅ matrixo-in-auth.web.app
- ✅ matrixo-in-auth.firebaseapp.com

**Vercel should have:**
- ✅ All 7 environment variables
- ✅ Set for all environments
- ✅ Recent deployment after adding variables

---

**Status**: 🔧 Troubleshooting in progress  
**Most Common Issue**: GitHub OAuth credentials not configured in Firebase Console  
**Quick Fix**: Use email/password authentication while setting up OAuth

---

*Last Updated: November 15, 2025*
