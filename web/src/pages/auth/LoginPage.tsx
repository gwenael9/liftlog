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
import { useLogin } from '@/hooks/useAuth'
import { useTranslation } from 'react-i18next'

type FormValues = { email: string; password: string }

export function LoginPage() {
  const { t } = useTranslation()
  const login = useLogin()

  const schema = useMemo(() => z.object({
    email: z.email(t('auth.validation.invalidEmail')),
    password: z.string().min(8, t('auth.validation.minPassword')),
  }), [t])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <AuthLayout title={t('auth.login.title')}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((v) => login.mutate(v))} className="space-y-4">
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
              {t('auth.login.error')}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? t('auth.login.submitting') : t('auth.login.submit')}
          </Button>
        </form>
      </Form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {t('auth.login.noAccount')}{' '}
        <Link to="/register" className="text-primary underline-offset-4 hover:underline">
          {t('auth.login.createAccount')}
        </Link>
      </p>
    </AuthLayout>
  )
}
