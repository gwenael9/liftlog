import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useLogin } from '@/hooks/useAuth'

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const login = useLogin()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <AuthLayout title="Connexion">
      <Form {...form}>
        <form onSubmit={form.handleSubmit((v) => login.mutate(v))} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {login.error && (
            <p className="text-destructive text-sm">
              Email ou mot de passe incorrect.
            </p>
          )}

          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? 'Connexion…' : 'Se connecter'}
          </Button>
        </form>
      </Form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{' '}
        <Link to="/register" className="text-primary underline-offset-4 hover:underline">
          Créer un compte
        </Link>
      </p>
    </AuthLayout>
  )
}
