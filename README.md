# A Silent Thread 🧵

> Where connections flow like gentle threads

A modern community renting platform that visualizes connections, services, and conversations as beautiful, flowing threads. Experience a new way to discover services, book rentals, and connect with your community.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![React](https://img.shields.io/badge/React-19.1-61dafb)
![Convex](https://img.shields.io/badge/Convex-1.27-orange)

## Features

- **Thread Connections**: Visualize your connections through beautiful, flowing thread animations
- **Service Discovery**: Find and offer services within your community
- **Seamless Bookings**: Manage rentals with an intuitive calendar interface
- **Real-Time Messaging**: Communicate instantly with threaded conversations
- **User Profiles**: Showcase your services and manage your offerings
- **Dark/Light Themes**: Beautiful glass morphism design with pastel theming
- **Responsive Design**: Fully mobile-responsive interface

## Tech Stack

- **Frontend**:
  - Vite
  - TypeScript
  - React 19 (for frontend components)
  - React Router v7 (all imports from `react-router`)
  - Tailwind CSS v4 (for styling)
  - shadcn/ui (for UI components library)
  - Lucide Icons (for icons)
  - Framer Motion (for animations)
  - Three.js (for 3D models)

- **Backend**:
  - Convex (for backend & database)
  - Convex Auth (for authentication)

- **Package Manager**: pnpm

All relevant files live in the 'src' directory.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Start Convex backend
npx convex dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # shadcn/ui components
│   └── ...          # Custom components
├── pages/           # Application pages/routes
│   ├── Landing.tsx  # Landing page
│   ├── Feed.tsx     # Main feed
│   ├── Services.tsx # Service discovery
│   ├── Messages.tsx # Messaging interface
│   ├── Bookings.tsx # Booking management
│   ├── Profile.tsx  # User profiles
│   └── Settings.tsx # User settings
├── hooks/           # Custom React hooks
├── convex/          # Convex backend functions
└── index.css        # Global styles & theme
```

## Environment Variables

### Client-side
- `VITE_CONVEX_URL` - Convex deployment URL

### Server-side (Convex)
- `JWKS` - JSON Web Key Set for authentication
- `JWT_PRIVATE_KEY` - Private key for JWT signing
- `SITE_URL` - Application site URL

This project is set up to run on a cloud environment with Convex development in the sandbox.


# Using Authentication (Important!)

You must follow these conventions when using authentication.

## Auth is already set up.

All convex authentication functions are already set up. The auth currently uses email OTP and anonymous users, but can support more.

The email OTP configuration is defined in `src/convex/auth/emailOtp.ts`. DO NOT MODIFY THIS FILE.

Also, DO NOT MODIFY THESE AUTH FILES: `src/convex/auth.config.ts` and `src/convex/auth.ts`.

## Using Convex Auth on the backend

On the `src/convex/users.ts` file, you can use the `getCurrentUser` function to get the current user's data.

## Authentication

The application uses Convex Auth with email OTP (One-Time Password) for secure authentication.

### Using Authentication

Navigate to `/auth` for login/signup.

**Frontend Usage:**
```typescript
import { useAuth } from "@/hooks/use-auth";

const { isLoading, isAuthenticated, user, signIn, signOut } = useAuth();
```

**Backend Usage:**
```typescript
import { getCurrentUser } from "@/convex/users";

const user = await getCurrentUser(ctx);
```

### Protected Routes

Use the `useAuth` hook to check authentication status and redirect to `/auth` when needed.

### Configuration

- Auth configuration: `src/convex/auth.config.ts`
- Email OTP settings: `src/convex/auth/emailOtp.ts`
- Auth page: `src/pages/Auth.tsx`

After authentication, users are redirected to `/feed` (configured in `src/main.tsx`).

## Available Scripts

```bash
# Development
pnpm dev              # Start Vite dev server
npx convex dev        # Start Convex backend in dev mode

# Building
pnpm build            # Build for production
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier

# Type Checking
npx tsc -b --noEmit   # Check TypeScript types
```

## Development Guidelines

### Frontend

- **Components**: Place reusable components in `src/components/`, page components in `src/pages/`
- **Routing**: Add new routes in `src/main.tsx` using React Router v7
- **Styling**: Use Tailwind CSS classes with shadcn/ui components
- **Animations**: Use Framer Motion for smooth transitions
- **Icons**: Use Lucide React icons
- **Mobile First**: Always ensure responsive design

### Backend (Convex)

- **Schema**: Define database schema in `src/convex/schema.ts`
- **Functions**: Use `query`, `mutation`, and `action` for public functions
- **Internal Functions**: Use `internalQuery`, `internalMutation`, `internalAction` for private functions
- **Node Runtime**: Add `"use node"` at the top of files requiring Node.js APIs
- **Type Safety**: Use `Doc<"tableName">` and `Id<"tableName">` types

### Best Practices

- Keep code simple and minimal
- Avoid over-engineering and unnecessary abstractions
- Use TypeScript strictly for type safety
- Implement proper error handling
- Always use toast notifications for user feedback
- Never create files unnecessarily - prefer editing existing files

## Theming

The application supports light and dark themes with a glass morphism aesthetic.

**Theme Configuration**: `src/index.css`
- Uses OKLCH color format for Tailwind v4
- Supports seamless theme switching
- Pastel color palette for soft, approachable design

**Toggle Theme:**
```typescript
import { useTheme } from "@/components/ThemeProvider";

const { theme, setTheme } = useTheme();
setTheme(theme === "dark" ? "light" : "dark");
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check existing documentation in this README

---

Built with ❤️ using React, TypeScript, and Convex

# Frontend Conventions

You will be using the Vite frontend with React 19, Tailwind v4, and Shadcn UI.

Generally, pages should be in the `src/pages` folder, and components should be in the `src/components` folder.

Shadcn primitives are located in the `src/components/ui` folder and should be used by default.

## Page routing

Your page component should go under the `src/pages` folder.

When adding a page, update the react router configuration in `src/main.tsx` to include the new route you just added.

## Shad CN conventions

Follow these conventions when using Shad CN components, which you should use by default.
- Remember to use "cursor-pointer" to make the element clickable
- For title text, use the "tracking-tight font-bold" class to make the text more readable
- Always make apps MOBILE RESPONSIVE. This is important
- AVOID NESTED CARDS. Try and not to nest cards, borders, components, etc. Nested cards add clutter and make the app look messy.
- AVOID SHADOWS. Avoid adding any shadows to components. stick with a thin border without the shadow.
- Avoid skeletons; instead, use the loader2 component to show a spinning loading state when loading data.


## Landing Pages

You must always create good-looking designer-level styles to your application. 
- Make it well animated and fit a certain "theme", ie neo brutalist, retro, neumorphism, glass morphism, etc

Use known images and emojis from online.

If the user is logged in already, show the get started button to say "Dashboard" or "Profile" instead to take them there.

## Responsiveness and formatting

Make sure pages are wrapped in a container to prevent the width stretching out on wide screens. Always make sure they are centered aligned and not off-center.

Always make sure that your designs are mobile responsive. Verify the formatting to ensure it has correct max and min widths as well as mobile responsiveness.

- Always create sidebars for protected dashboard pages and navigate between pages
- Always create navbars for landing pages
- On these bars, the created logo should be clickable and redirect to the index page

## Animating with Framer Motion

You must add animations to components using Framer Motion. It is already installed and configured in the project.

To use it, import the `motion` component from `framer-motion` and use it to wrap the component you want to animate.


### Other Items to animate
- Fade in and Fade Out
- Slide in and Slide Out animations
- Rendering animations
- Button clicks and UI elements

Animate for all components, including on landing page and app pages.

## Three JS Graphics

Your app comes with three js by default. You can use it to create 3D graphics for landing pages, games, etc.


## Colors

You can override colors in: `src/index.css`

This uses the oklch color format for tailwind v4.

Always use these color variable names.

Make sure all ui components are set up to be mobile responsive and compatible with both light and dark mode.

Set theme using `dark` or `light` variables at the parent className.

## Styling and Theming

When changing the theme, always change the underlying theme of the shad cn components app-wide under `src/components/ui` and the colors in the index.css file.

Avoid hardcoding in colors unless necessary for a use case, and properly implement themes through the underlying shad cn ui components.

When styling, ensure buttons and clickable items have pointer-click on them (don't by default).

Always follow a set theme style and ensure it is tuned to the user's liking.

## Toasts

You should always use toasts to display results to the user, such as confirmations, results, errors, etc.

Use the shad cn Sonner component as the toaster. For example:

```
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
export function SonnerDemo() {
  return (
    <Button
      variant="outline"
      onClick={() =>
        toast("Event has been created", {
          description: "Sunday, December 03, 2023 at 9:00 AM",
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        })
      }
    >
      Show Toast
    </Button>
  )
}
```

Remember to import { toast } from "sonner". Usage: `toast("Event has been created.")`

## Dialogs

Always ensure your larger dialogs have a scroll in its content to ensure that its content fits the screen size. Make sure that the content is not cut off from the screen.

Ideally, instead of using a new page, use a Dialog instead. 

# Using the Convex backend

You will be implementing the convex backend. Follow your knowledge of convex and the documentation to implement the backend.

## The Convex Schema

You must correctly follow the convex schema implementation.

The schema is defined in `src/convex/schema.ts`.

Do not include the `_id` and `_creationTime` fields in your queries (it is included by default for each table).
Do not index `_creationTime` as it is indexed for you. Never have duplicate indexes.


## Convex Actions: Using CRUD operations

When running anything that involves external connections, you must use a convex action with "use node" at the top of the file.

You cannot have queries or mutations in the same file as a "use node" action file. Thus, you must use pre-built queries and mutations in other files.

You can also use the pre-installed internal crud functions for the database:

```ts
// in convex/users.ts
import { crud } from "convex-helpers/server/crud";
import schema from "./schema.ts";

export const { create, read, update, destroy } = crud(schema, "users");

// in some file, in an action:
const user = await ctx.runQuery(internal.users.read, { id: userId });

await ctx.runMutation(internal.users.update, {
  id: userId,
  patch: {
    status: "inactive",
  },
});
```


## Common Convex Mistakes To Avoid

When using convex, make sure:
- Document IDs are referenced as `_id` field, not `id`.
- Document ID types are referenced as `Id<"TableName">`, not `string`.
- Document object types are referenced as `Doc<"TableName">`.
- Keep schemaValidation to false in the schema file.
- You must correctly type your code so that it passes the type checker.
- You must handle null / undefined cases of your convex queries for both frontend and backend, or else it will throw an error that your data could be null or undefined.
- Always use the `@/folder` path, with `@/convex/folder/file.ts` syntax for importing convex files.
- This includes importing generated files like `@/convex/_generated/server`, `@/convex/_generated/api`
- Remember to import functions like useQuery, useMutation, useAction, etc. from `convex/react`
- NEVER have return type validators.
