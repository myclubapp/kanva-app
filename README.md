# Kanva Mobile App

A mobile application built with Ionic/React v8, Capacitor, and Supabase for creating beautiful graphic designs on iOS and Android.

## Features

- **User Authentication**: Sign up, sign in, and profile management with Supabase
- **Design Studio**: Canvas-based design editor for creating graphics
- **Template Management**: Browse and use pre-made templates
- **Cross-Platform**: Runs on iOS, Android, and web
- **Cloud Storage**: Designs and templates saved to Supabase

## Tech Stack

- **Ionic Framework v8**: UI components and mobile framework
- **React 19**: UI library
- **Capacitor v7**: Native runtime for iOS and Android
- **Supabase**: Backend-as-a-Service (authentication, database)
- **TypeScript**: Type-safe development
- **Vite**: Build tool and dev server

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- iOS development: Xcode (macOS only)
- Android development: Android Studio and Java JDK

## Getting Started

### 1. Clone and Install

```bash
cd kanva-mobile
npm install
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Fill in your Supabase credentials in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Set Up Database

Run the following SQL in your Supabase SQL editor to create the required tables:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  canvas_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create designs table
CREATE TABLE designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  template_id UUID REFERENCES templates,
  name TEXT NOT NULL,
  canvas_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Templates policies
CREATE POLICY "Anyone can view public templates"
  ON templates FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create templates"
  ON templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON templates FOR DELETE
  USING (auth.uid() = user_id);

-- Designs policies
CREATE POLICY "Users can view their own designs"
  ON designs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create designs"
  ON designs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own designs"
  ON designs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs"
  ON designs FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Development

### Run in Browser

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

### Sync with Native Projects

After making changes to web assets or native configuration:

```bash
npx cap sync
```

## Mobile Development

### iOS

1. Open the iOS project in Xcode:
   ```bash
   npx cap open ios
   ```

2. Configure signing in Xcode (select your development team)

3. Run on simulator or device from Xcode

### Android

1. Open the Android project in Android Studio:
   ```bash
   npx cap open android
   ```

2. Configure gradle settings if needed

3. Run on emulator or device from Android Studio

## Project Structure

```
kanva-mobile/
├── src/
│   ├── components/          # Reusable components
│   │   └── studio/          # Studio-specific components
│   ├── config/              # App configuration
│   │   └── supabase.ts      # Supabase client setup
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   │   ├── Home.tsx         # Home page
│   │   ├── Login.tsx        # Login page
│   │   ├── Register.tsx     # Registration page
│   │   ├── Profile.tsx      # User profile
│   │   ├── Templates.tsx    # Template browser
│   │   └── Studio.tsx       # Design studio
│   ├── types/               # TypeScript types
│   │   └── supabase.ts      # Database types
│   └── theme/               # Ionic theme
├── public/                  # Static assets
│   └── assets/              # Images and logos
├── ios/                     # iOS native project
├── android/                 # Android native project
└── capacitor.config.ts      # Capacitor configuration
```

## Key Features Implementation

### Authentication

The app uses Supabase Auth with email/password authentication. The `AuthContext` provides:
- `signUp(email, password, fullName)` - Create new account
- `signIn(email, password)` - Sign in user
- `signOut()` - Sign out user
- `updateProfile(updates)` - Update user profile

### Design Studio

The studio provides a canvas-based editor with:
- Text elements
- Shapes
- Basic transformations (position, rotation)
- Export to PNG
- Save designs to Supabase

### Templates

Users can:
- Browse public templates
- View their own templates
- Use templates as starting points for designs
- Save designs as new templates

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `VITE_APP_NAME` | Application name |
| `VITE_APP_VERSION` | Application version |

## Customization

### Branding

Replace logos in `public/assets/`:
- `logo_light.png` - Light theme logo
- `logo_dark.png` - Dark theme logo
- `logo_wide.png` - Wide format logo

### Theme

Edit `src/theme/variables.css` to customize colors and styling.

## Troubleshooting

### "Missing dist directory" warning

This is normal before the first build. Run `npm run build` to create the dist directory.

### Supabase connection errors

1. Verify your `.env` file has the correct credentials
2. Check that your Supabase project is active
3. Ensure RLS policies are correctly configured

### iOS build issues

1. Make sure you have Xcode installed
2. Run `npx cap sync ios`
3. Open in Xcode and check signing settings

### Android build issues

1. Ensure Android Studio is installed
2. Set JAVA_HOME environment variable
3. Run `npx cap sync android`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the [Ionic documentation](https://ionicframework.com/docs)
- Check the [Supabase documentation](https://supabase.com/docs)
