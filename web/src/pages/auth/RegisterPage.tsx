import { useMemo } from 'react'
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
import { useTranslation } from 'react-i18next'

type FormValues = {
  display_name?: string
  email: string
  password: string
  confirmPassword: string
}

export function RegisterPage() {
  const { t } = useTranslation()
  const register = useRegister()

  const schema = useMemo(() => z.object({
    display_name: z.string().max(100).optional(),
    email: z.email(t('auth.validation.invalidEmail')),
    password: z.string().min(8, t('auth.validation.minPassword')),
    confirmPassword: z.string(),
  }).refine((d) => d.password === d.confirmPassword, {
    message: t('auth.validation.passwordMismatch'),
    path: ['confirmPassword'],
  }), [t])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { display_name: '', email: '', password: '', confirmPassword: '' },
  })

  function onSubmit(values: FormValues) {
    register.mutate(values)
  }

  return (
    <AuthLayout title={t('auth.register.title')}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.register.username')}</FormLabel>
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
                <FormLabel>{t('auth.fields.email')}</FormLabel>
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
                <FormLabel>{t('auth.fields.password')}</FormLabel>
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
                <FormLabel>{t('auth.register.confirmPassword')}</FormLabel>
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
              {t('auth.register.error')}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={register.isPending}>
            {register.isPending ? t('auth.register.submitting') : t('auth.register.submit')}
          </Button>
        </form>
      </Form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {t('auth.register.hasAccount')}{' '}
        <Link to="/login" className="text-primary underline-offset-4 hover:underline">
          {t('auth.register.loginLink')}
        </Link>
      </p>
    </AuthLayout>
  )
}
