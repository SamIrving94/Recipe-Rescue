# Recipe Rescue - Setup Guide

This guide will walk you through setting up the Recipe Rescue PWA with Supabase integration.

## Prerequisites

- Node.js 18+ and pnpm
- Supabase account (free tier works great)
- OpenAI API key

## Step 1: Supabase Project Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `recipe-rescue` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 1.2 Get Project Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

## Step 2: Database Setup

### 2.1 Run Database Scripts

1. Go to **SQL Editor** in your Supabase dashboard
2. Run the scripts in order:

**Script 1: Create Tables**
```sql
-- Copy and paste the contents of scripts/01-create-tables.sql
```

**Script 2: Setup RLS**
```sql
-- Copy and paste the contents of scripts/02-setup-rls.sql
```

**Script 3: Create Functions**
```sql
-- Copy and paste the contents of scripts/03-create-functions.sql
```

### 2.2 Setup Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **Create a new bucket**
3. Enter:
   - **Name**: `menu-photos`
   - **Public bucket**: ✅ Check this
4. Click **Create bucket**

5. Go to **SQL Editor** and run:
```sql
-- Set up storage policies
CREATE POLICY "Users can upload their own photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'menu-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own photos" ON storage.objects
FOR SELECT USING (bucket_id = 'menu-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos" ON storage.objects
FOR DELETE USING (bucket_id = 'menu-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 3: Authentication Setup

### 3.1 Configure Auth Settings

1. Go to **Authentication** → **Settings**
2. Configure **Site URL**:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback`

### 3.2 Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the email templates for better UX

## Step 4: Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Custom domain for production
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Step 5: OpenAI Setup

### 5.1 Get API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up/login
3. Go to **API Keys**
4. Click **Create new secret key**
5. Copy the key and add it to your `.env.local`

### 5.2 Add Credit (Required)

OpenAI requires a credit card for API usage. Add at least $5-10 to start.

## Step 6: Install and Run

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

## Step 7: Test the Setup

### 7.1 Create Account

1. Go to your app
2. Click "Sign Up"
3. Enter your email and password
4. Check your email for verification
5. Sign in

### 7.2 Test Features

1. **Camera**: Try capturing a menu photo
2. **Upload**: Verify photos upload to Supabase Storage
3. **Database**: Check that visits are saved in the database
4. **Search**: Test the search functionality

## Step 8: Production Deployment

### 8.1 Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### 8.2 Update Supabase Settings

1. Go to **Authentication** → **Settings**
2. Update **Site URL** to your production domain
3. Add production redirect URL

## Troubleshooting

### Common Issues

**1. "Invalid API key" error**
- Check your Supabase URL and anon key
- Ensure they're in `.env.local`

**2. "Unauthorized" errors**
- Check RLS policies are set up correctly
- Verify user is authenticated

**3. Photo upload fails**
- Check storage bucket exists and is public
- Verify storage policies are set up

**4. Database connection issues**
- Check Supabase project is active
- Verify database password is correct

### Debug Mode

Add this to your `.env.local` for debugging:
```env
NEXT_PUBLIC_DEBUG=true
```

### Support

- Check the [Supabase docs](https://supabase.com/docs)
- Review the [Next.js docs](https://nextjs.org/docs)
- Open an issue in this repository

## Security Checklist

- ✅ Row Level Security enabled
- ✅ Environment variables set
- ✅ Storage policies configured
- ✅ Authentication middleware active
- ✅ HTTPS enabled (production)
- ✅ API keys secured

## Performance Tips

1. **Enable Supabase Edge Functions** for better performance
2. **Use CDN** for static assets
3. **Optimize images** before upload
4. **Enable caching** headers
5. **Monitor usage** in Supabase dashboard

---

Your Recipe Rescue PWA is now ready! 🎉 