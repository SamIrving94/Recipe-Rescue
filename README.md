# Recipe Rescue - Restaurant PWA

A modern Progressive Web App for tracking restaurant visits, analyzing menus with AI, and discovering recipes. Built with Next.js, Supabase, and OpenAI.

## 🚀 Features

- **📱 PWA Support** - Install as a native app on mobile devices
- **🔐 Supabase Authentication** - Secure user authentication and data isolation
- **📸 Camera Integration** - Capture menu photos with real-time camera access
- **🤖 AI Menu Analysis** - Extract dishes from menu photos using OpenAI
- **⭐ Dish Rating System** - Rate and review dishes with notes
- **📊 Visit Timeline** - Track your restaurant journey over time
- **🍳 Recipe Discovery** - Find recipes for dishes you want to recreate
- **☁️ Cloud Storage** - Photos stored securely in Supabase Storage
- **📱 Responsive Design** - Beautiful UI that works on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: OpenAI GPT-4 Vision for menu analysis
- **PWA**: Service Worker, Web App Manifest

## 📋 Prerequisites

- Node.js 18+ and pnpm
- Supabase account and project
- OpenAI API key

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd Recipe-Rescue
pnpm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Optional: Custom domain for production
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 3. Supabase Setup

#### Database Schema

Run the SQL scripts in the `scripts/` directory:

```bash
# 1. Create tables
psql -h your-project.supabase.co -U postgres -d postgres -f scripts/01-create-tables.sql

# 2. Setup Row Level Security
psql -h your-project.supabase.co -U postgres -d postgres -f scripts/02-setup-rls.sql

# 3. Create functions
psql -h your-project.supabase.co -U postgres -d postgres -f scripts/03-create-functions.sql
```

#### Storage Bucket

Create a storage bucket for menu photos:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('menu-photos', 'menu-photos', true);

-- Set up storage policies
CREATE POLICY "Users can upload their own photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'menu-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own photos" ON storage.objects
FOR SELECT USING (bucket_id = 'menu-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos" ON storage.objects
FOR DELETE USING (bucket_id = 'menu-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📱 PWA Features

### Installation

The app can be installed as a PWA on supported devices:

- **iOS**: Tap the share button and "Add to Home Screen"
- **Android**: Tap "Install app" in the browser menu
- **Desktop**: Click the install button in the address bar

### Offline Support

The app includes service worker for offline functionality and caching.

## 🗄️ Database Schema

### Tables

#### `profiles`
- User profile information
- Linked to Supabase Auth users

#### `restaurant_visits`
- Restaurant visit records
- Includes location, date, photos, and ratings

#### `dishes`
- Individual dishes from visits
- Includes ratings, notes, and recreation flags

#### `recipes`
- Saved recipes linked to dishes
- Includes ingredients, instructions, and metadata

## 🔐 Security Features

- **Row Level Security (RLS)** - Users can only access their own data
- **Authentication Middleware** - Protected routes and API endpoints
- **Secure File Uploads** - Validated and authenticated photo uploads
- **Environment Variables** - Sensitive data kept secure

## 🎨 UI Components

Built with shadcn/ui components for a consistent and beautiful design:

- Responsive cards and layouts
- Modern form components
- Toast notifications
- Loading states and animations
- Mobile-optimized camera interface

## 📊 API Endpoints

### Authentication
- `POST /auth/callback` - OAuth callback handling

### Photo Upload
- `POST /api/upload-photo` - Secure photo upload to Supabase Storage

### Menu Analysis
- `POST /api/analyze-menu` - AI-powered menu dish extraction

### Recipe Generation
- `POST /api/generate-recipe` - Generate recipes from dish names
- `POST /api/generate-recipes` - Batch recipe generation

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Development

### Project Structure

```
Recipe-Rescue/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── providers/        # Context providers
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase configuration
│   ├── database.ts       # Database operations
│   └── storage.ts        # Storage operations
├── scripts/              # Database setup scripts
└── types/                # TypeScript type definitions
```

### Key Components

- **Dashboard** - Main app interface with stats and recent visits
- **CameraCapture** - Camera interface for menu photos
- **MenuAnalysis** - AI-powered menu analysis
- **DishSelection** - Select dishes from analyzed menu
- **RatingInterface** - Rate and review dishes
- **VisitTimeline** - Browse and search visit history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Check the [Issues](../../issues) page
- Review the [Documentation](../../wiki)
- Contact the maintainers

---

Built with ❤️ using Next.js, Supabase, and OpenAI
