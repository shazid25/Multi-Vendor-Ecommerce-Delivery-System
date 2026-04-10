# 🚀 ShopHub - Quick Start Guide

## ⚡ Start Your Development Servers

### Step 1: Open Terminal 1 (Backend)
```powershell
cd "c:\Multi-Vendor E-Commerce-Delievery\server"
pnpm dev
```

**Expected Output:**
```
Server running on http://localhost:5000
✓ Express server initialized
✓ Prisma connected
✓ Routes loaded
```

---

### Step 2: Open Terminal 2 (Frontend)
```powershell
cd "c:\Multi-Vendor E-Commerce-Delievery\client"
pnpm dev
```

**Expected Output:**
```
▲ Next.js 15.5.15
- Ready in 2.8s
- Local: http://localhost:3000
```

---

### Step 3: Visit Your App
Open your browser and go to:
```
http://localhost:3000
```

---

## 🎨 Test the Theme System

### Dark Mode (Default)
- Page loads with dark theme
- All text is light-colored
- Cards have dark backgrounds
- Sun icon ☀️ visible in navbar

### Toggle to Light Mode
1. Click the **☀️ Sun icon** in top-right of navbar
2. Watch everything transition smoothly
3. All colors invert for light mode
4. Moon icon 🌙 appears instead

### Features
- ✅ Theme persists across page reloads
- ✅ Works on mobile & desktop
- ✅ Smooth 300ms transitions
- ✅ Respects your browser's dark mode preference
- ✅ High contrast text in both modes

---

## 🧪 Test Authentication

### Create Account
1. Click "Create Free Account" on homepage
2. Fill in email, password, name
3. Click "Sign Up"
4. Should redirect to dashboard

### Login
1. Click "Login" on homepage
2. Enter email and password
3. Click "Sign In"
4. Should redirect to dashboard

### Logout
1. Click your profile avatar (top-right)
2. Click "Logout"
3. Should redirect to login page

---

## 📸 Test Image Upload (Optional)

**Note:** Requires Cloudinary setup (already configured in `.env`)

1. Go to dashboard
2. Look for profile/avatar section
3. Click upload button
4. Select a JPG/PNG/GIF image (max 5MB)
5. Image uploads to Cloudinary automatically

---

## 🎯 Check Responsiveness

### Desktop
- Open DevTools (F12)
- All layouts should look clean
- Theme toggle always visible
- No horizontal scrolling

### Tablet (iPad size)
1. Open DevTools → Responsive mode
2. Set to iPad (768px)
3. Menu becomes hamburger icon 🍔
4. Click menu to see mobile navigation
5. Theme toggle still visible

### Mobile (iPhone size)
1. Open DevTools → Responsive mode
2. Set to iPhone 12 (390px)
3. All UI adapts properly
4. Touch-friendly buttons
5. Theme toggle button accessible

---

## 🎨 Customize Theme (Advanced)

### Change Color Scheme
Edit `client/app/globals.css`:

```css
/* Change primary color from blue to green */
--primary: #10b981; /* Green instead of #3b82f6 */
```

### Add Custom Theme
1. Open `client/app/context/theme-context.tsx`
2. Add new theme option (e.g., 'auto')
3. Update CSS variables in `globals.css`
4. Update toggle logic

### Custom Colors
All colors are in `client/app/globals.css`:
- `--primary` - Main button color
- `--secondary` - Secondary action color  
- `--accent` - Highlights and links
- `--text-light` - Light mode text
- `--text-dark` - Dark mode text

---

## 📱 Browser Support

✅ **Chrome/Edge** - Full support  
✅ **Firefox** - Full support  
✅ **Safari** - Full support  
✅ **Mobile browsers** - Full support  

---

## 🔍 Debugging

### Theme not toggling?
1. Check browser console for errors
2. Verify localStorage is enabled
3. Check `client/app/context/theme-context.tsx`
4. Reload page (Ctrl+F5)

### Colors look wrong?
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check `client/app/globals.css`
4. Verify Tailwind CSS loaded

### Form not working?
1. Check console for errors
2. Verify `.env.local` file exists
3. Check API connection on localhost:5000
4. Restart backend server

---

## 📊 Available Commands

### Backend
```bash
cd server

pnpm dev              # Start development server
pnpm build            # Build for production
pnpm prisma migrate   # Run migrations
pnpm prisma studio   # Open database UI
```

### Frontend
```bash
cd client

pnpm dev              # Start development server
pnpm build            # Build for production
pnpm lint             # Check code quality
pnpm format           # Format code
```

---

## 🎁 Bonus Features

### Keyboard Shortcuts
- `Ctrl+/` - Focus search (add when ready)
- `Ctrl+K` - Command palette (add when ready)

### Mobile Menu
- Click hamburger icon 🍔
- Menu items slide in
- Click item to navigate
- Menu auto-closes

### Animations
- Page transitions smooth
- Button hover effects
- Floating background elements
- Staggered list animations

---

## 💡 Tips & Tricks

1. **Fastest Development**
   - Keep both terminals visible side-by-side
   - Use browser DevTools console for errors
   - Hot reload saves time on changes

2. **Testing Different Scenarios**
   - Use incognito/private mode to avoid cache
   - Test both light and dark modes
   - Test on phone using `http://YOUR_IP:3000`

3. **Debugging Network Issues**
   - Open DevTools → Network tab
   - Check API calls to localhost:5000
   - Verify backend server is running

4. **Database Queries**
   - Use `pnpm prisma studio` to view data
   - Add test data manually
   - Check relationships visually

---

## 📞 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Change: `pnpm dev -- -p 3001` |
| Port 5000 in use | Update `server/.env` PORT value |
| Database connection error | Check `DATABASE_URL` in `.env` |
| Images not uploading | Verify Cloudinary credentials |
| Theme not saving | Enable localStorage in browser |
| Dark mode not working | Clear cache & reload |

---

## 🎯 Next Steps

1. ✅ Start servers (follow above)
2. ✅ Test theme toggle
3. ✅ Create test account
4. ✅ Test login/logout
5. ✅ Try image upload
6. ✅ Test on mobile (DevTools)

---

## 🎉 You're Ready!

Everything is set up and working. Enjoy your beautiful e-commerce platform with dark/light theme support!

**Questions?** Check the files:
- `THEME_IMPLEMENTATION.md` - Theme details
- `FIXES_APPLIED.md` - All fixes made
- `UPDATE_SUMMARY.md` - Full changelog

---

**Happy Coding!** 🚀
