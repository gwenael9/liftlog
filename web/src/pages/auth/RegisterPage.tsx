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
import { useRegister } from '@/hooks/useAuth'

const schema = z.object({
  display_name: z.string().max(100).optional(),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const register = useRegister()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { display_name: '', email: '', password: '', confirmPassword: '' },
  })

  function onSubmit({ confirmPassword: _, ...values }: FormValues) {
    register.mutate(values)
  }

  return (
    <AuthLayout title="Créer un compte">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pseudo (optionnel)</FormLabel>
                <FormControl>
                  <Input placeholder="John" autoComplete="nickname" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmer le mot de passe</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {register.error && (
            <p className="text-destructive text-sm">
              Erreur lors de la création du compte.
            </p>
          )}

          <Button type="submit" className="w-full" disabled={register.isPending}>
            {register.isPending ? 'Création…' : 'Créer un compte'}
          </Button>
        </form>
      </Form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Déjà un compte ?{' '}
        <Link to="/login" className="text-primary underline-offset-4 hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  )
}
