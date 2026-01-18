# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in this repository.

## Project Overview

This is a Next.js 15 job board platform called "EmpleaHub" built with:
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **UI**: Tailwind CSS v4 with Radix UI components
- **Forms**: React Hook Form with Zod validation
- **State Management**: SWR for data fetching
- **Styling**: Tailwind CSS with custom design system

## Build & Development Commands

```bash
# Development
npm run dev              # Start development server with Turbopack

# Build & Production
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run postinstall     # Generate Prisma client (runs automatically)

# Database
npx prisma generate     # Generate Prisma client
npx prisma db push      # Push schema changes to database
npx prisma studio       # Open Prisma Studio
npx tsx prisma/seed.ts  # Seed database
```

## Testing

This project currently does not have a test suite configured. When adding tests:
- Use Jest or Vitest for unit/integration tests
- Use Playwright for E2E tests
- Configure test scripts in package.json

## Code Style Guidelines

### File Structure & Naming

- **Components**: PascalCase (e.g., `JobCard.tsx`, `LoginForm.tsx`)
- **Pages/Routes**: kebab-case for folders, `page.tsx` for files
- **Hooks**: camelCase with `use-` prefix (e.g., `use-mobile.ts`)
- **Utilities**: camelCase (e.g., `cn.ts`, `filters.ts`)
- **Types**: camelCase (e.g., `index.ts` for type exports)
- **Schemas**: camelCase with descriptive names (e.g., `ofertaLaboralSchema.ts`)

### Import Organization

```typescript
// 1. React/Next.js imports
import { NextResponse } from "next/server"
import { useRouter } from "next/navigation"

// 2. Third-party libraries
import { z } from "zod"
import { useForm } from "react-hook-form"

// 3. Local imports (use @/ alias)
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { ofertaLaboralFormSchema } from "@/lib/schemas/ofertaLaboralSchema"
```

### TypeScript & Types

- **Strict typing**: Always use TypeScript interfaces/types
- **Zod schemas**: Use for form validation and API validation
- **Prisma types**: Leverage generated types from Prisma
- **Component props**: Use React.ComponentProps or define interfaces

```typescript
// Example component with proper typing
interface JobCardProps {
  id: string
  puesto: string
  empresa: string
  isSaved?: boolean
  onSave?: (id: string) => void
}

export function JobCard({ id, puesto, empresa, isSaved, onSave }: JobCardProps) {
  // Component implementation
}
```

### Component Patterns

- **UI Components**: Use Radix UI primitives with Tailwind styling
- **Form Components**: Use React Hook Form with Zod validation
- **Server Components**: Use for data fetching, mark with `export const dynamic = 'force-dynamic'`
- **Client Components**: Mark with `"use client"` directive, use sparingly

```typescript
// Server component pattern
export const dynamic = 'force-dynamic'

export async function getOfertasLaborales() {
  const ofertas = await prisma.ofertaLaboral.findMany()
  return ofertas
}

// Client component pattern
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
```

### API Routes

- **HTTP Methods**: Use appropriate methods (GET, POST, PUT, DELETE)
- **Error Handling**: Use try-catch blocks with proper error responses
- **Validation**: Use Zod schemas for request body validation
- **Authentication**: Use `requireEmpresaSession()` or `auth()` for protected routes

```typescript
export async function POST(req: Request) {
  try {
    const session = await auth()
    const body = await req.json()
    
    const parsed = ofertaLaboralServerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }
    
    // Process request
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
```

### Database Patterns

- **Prisma Client**: Import from `@/lib/prisma`
- **Queries**: Use proper includes for relations
- **Error Handling**: Log errors and return empty arrays/null as appropriate
- **Transactions**: Use for complex operations

```typescript
import { prisma } from "@/lib/prisma"

export async function getOfertasLaborales() {
  try {
    const ofertas = await prisma.ofertaLaboral.findMany({
      include: {
        empresa: true,
        ubicacionDepartamento: true,
        ubicacionCiudad: true,
      },
      orderBy: {
        fechaCreacion: "desc",
      },
    })
    return ofertas
  } catch (error) {
    console.error("Error fetching ofertas:", error)
    return []
  }
}
```

### Styling Guidelines

- **Tailwind CSS**: Use utility classes, avoid custom CSS
- **Component Variants**: Use `class-variance-authority` (CVA) for component variants
- **Responsive Design**: Use Tailwind responsive prefixes
- **Dark Mode**: Support dark mode with `dark:` prefixes

```typescript
// Button component with CVA
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### Error Handling

- **API Errors**: Return proper HTTP status codes with error messages
- **Form Errors**: Use React Hook Form error state
- **Toast Notifications**: Use `sonner` for user notifications
- **Console Logging**: Log errors for debugging

### Security Best Practices

- **Authentication**: Protect routes with proper auth checks
- **Input Validation**: Always validate user input with Zod
- **SQL Injection**: Use Prisma ORM (prevents SQL injection)
- **Environment Variables**: Use `.env` for secrets, never commit to git

### Performance Guidelines

- **Dynamic Imports**: Use for code splitting large components
- **Image Optimization**: Use Next.js Image component
- **Caching**: Use appropriate caching strategies
- **Bundle Size**: Monitor and optimize bundle size

## Common Patterns

### Form with Validation

```typescript
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (data: z.infer<typeof schema>) => {
    // Handle submission
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  )
}
```

### Data Fetching with SWR

```typescript
"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function MyComponent() {
  const { data, error, isLoading } = useSWR("/api/ofertaslaborales", fetcher)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading data</div>

  return <div>{/* Render data */}</div>
}
```

## Development Workflow

1. **Run development server**: `npm run dev`
2. **Make changes**: Follow the code style guidelines
3. **Test manually**: Check functionality in browser
4. **Run linting**: `npm run lint` before committing
5. **Database changes**: Use Prisma migrations

## Notes

- This is a Spanish-language application (job board platform)
- User roles include: SUPERADMIN, ADMIN, RECLUTADOR, CANDIDATO
- Subscription-based model with different plans
- File uploads handled with Vercel Blob
- Email notifications with React Email and Resend