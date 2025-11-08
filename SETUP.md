# Setup Guide for LYZN

## Quick Start

There's a permission issue with the npm cache that needs to be fixed first.

### Fix npm permissions (run this once):

```bash
sudo chown -R $(whoami) ~/.npm
```

### Then install and run:

```bash
# Navigate to project directory
cd /Users/angelinayeh/Lyzn

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

### Open the app:

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## Alternative: Use Yarn or pnpm

If you continue having npm issues, you can use alternative package managers:

### Using Yarn:

```bash
# Install yarn if you don't have it
npm install -g yarn

# Install dependencies
yarn install

# Run dev server
yarn dev
```

### Using pnpm:

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install dependencies
pnpm install

# Run dev server
pnpm dev
```

---

## What's Included

The complete LYZN prototype includes:

### Pages:
- `/` - Landing page
- `/chat` - AI risk assessment
- `/risks` - Risk dashboard with contracts
- `/marketplace` - Contract marketplace
- `/create` - Create custom contract
- `/contract/[id]` - Contract details & purchase
- `/dashboard` - Portfolio dashboard
- `/login` - Login page
- `/about` - About page
- `/solutions` - Solutions by industry
- `/contact` - Contact page

### Components:
- Navigation bar with routing
- Contract cards
- Chat interface
- Forms and inputs
- Mock data for demonstration

### Styling:
- Modern dark theme
- Tailwind CSS
- Responsive design
- Financial UI patterns

---

## Demo Flow

1. Start at homepage → "Get Started"
2. Chat with AI about your business
3. View suggested risks and contracts
4. Purchase or create contracts
5. View portfolio dashboard

---

## Troubleshooting

### If port 3000 is already in use:

```bash
npm run dev -- -p 3001
```

Then visit [http://localhost:3001](http://localhost:3001)

### If you see TypeScript errors:

These should not block the app from running. The dev server will still work.

### If you see module not found errors:

Make sure all dependencies installed correctly:

```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

---

## Need Help?

Contact: nghia.nim@columbia.edu

