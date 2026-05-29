import { Button } from "@/shared/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/components/ui/select";
import { useLogin, useRegister } from "@/shared/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import z from "zod";

interface AuthFormProps {
  mode: "login" | "register";
  onSwitch: () => void;
}

type FormValues = {
  display_name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  sex?: "male" | "female";
  unit_system?: "kg" | "lbs";
};

export function AuthForm({ mode, onSwitch }: AuthFormProps) {
  const { t } = useTranslation();
  const login = useLogin();
  const register = useRegister();
  const isRegister = mode === "register";
  const mutation = isRegister ? register : login;

  const schema = useMemo(() => {
    const base = z.object({
      display_name: z.string().max(100).optional(),
      email: z.email(t("auth.validation.invalidEmail")),
      password: z.string().min(8, t("auth.validation.minPassword")),
      confirmPassword: z.string().optional(),
      sex: z.enum(["male", "female"]).optional(),
      unit_system: z.enum(["kg", "lbs"]).optional(),
    });
    if (!isRegister) return base;
    return base.refine((d) => d.password === d.confirmPassword, {
      message: t("auth.validation.passwordMismatch"),
      path: ["confirmPassword"],
    });
  }, [t, isRegister]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      sex: "male",
      unit_system: "kg",
    },
  });

  useEffect(() => {
    const sub = form.watch(() => {
      if (mutation.isError) mutation.reset();
    });
    return () => sub.unsubscribe();
  }, [form, mutation]);

  function onSubmit(values: FormValues) {
    if (isRegister) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...data } = values;
      register.mutate({
        ...data,
        sex: data.sex ?? "male",
        unit_system: data.unit_system ?? "kg",
      });
    } else {
      login.mutate({ email: values.email, password: values.password });
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {isRegister && (
            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.register.username")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John"
                      autoComplete="nickname"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.fields.email")}</FormLabel>
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
                <FormLabel>{t("auth.fields.password")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete={
                      isRegister ? "new-password" : "current-password"
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isRegister && (
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.register.confirmPassword")}</FormLabel>
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
          )}
          {isRegister && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.register.sex")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          {field.value === "male"
                            ? t("auth.register.sexMale")
                            : t("auth.register.sexFemale")}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">
                          {t("auth.register.sexMale")}
                        </SelectItem>
                        <SelectItem value="female">
                          {t("auth.register.sexFemale")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit_system"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.register.unitSystem")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          {field.value === "kg"
                            ? t("auth.register.unitKg")
                            : t("auth.register.unitLbs")}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kg">
                          {t("auth.register.unitKg")}
                        </SelectItem>
                        <SelectItem value="lbs">
                          {t("auth.register.unitLbs")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          {mutation.error && (
            <p className="text-destructive text-sm">
              {t(
                `auth.errors.${(mutation.error as { code?: string }).code ?? "fallback"}`,
                { defaultValue: t("auth.errors.fallback") },
              )}
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? t(
                  isRegister
                    ? "auth.register.submitting"
                    : "auth.login.submitting",
                )
              : t(isRegister ? "auth.register.submit" : "auth.login.submit")}
          </Button>
        </form>
      </Form>
      <p className="mt-4 text-end text-sm text-muted-foreground">
        {t(isRegister ? "auth.register.hasAccount" : "auth.login.noAccount")}{" "}
        <Button variant="link" className="pl-0" onClick={onSwitch}>
          {t(
            isRegister ? "auth.register.loginLink" : "auth.login.createAccount",
          )}
        </Button>
      </p>
    </>
  );
}
