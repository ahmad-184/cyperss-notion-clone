"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginValidator, loginValidatorType } from "@/lib/validations";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Loader from "@/components/Loader";
import Link from "next/link";
import { login } from "@/server-actions";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const Login = () => {
  const router = useRouter();
  const [submittingError, setSubmittingError] = useState<string>("");

  const { t } = useTranslation();

  const form = useForm<loginValidatorType>({
    resolver: zodResolver(loginValidator),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: loginValidatorType) => {
    setSubmittingError("");
    const { error } = await login(data);
    if (error) {
      setSubmittingError(error.message as string);
      form.reset();
    } else {
      toast("Loged in successfully");
      router.push("/dashboard");
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <FormField
          control={control}
          disabled={isSubmitting}
          name="email"
          render={({ field, formState: { errors } }) => (
            <FormItem>
              <FormControl>
                <Input placeholder={t("login:email")} {...field} />
              </FormControl>
              {errors.email ? (
                <FormMessage>{errors.email.message}</FormMessage>
              ) : null}
            </FormItem>
          )}
        />
        <FormField
          control={control}
          disabled={isSubmitting}
          name="password"
          render={({ field, formState: { errors } }) => (
            <FormItem>
              <FormControl>
                <Input placeholder={t("login:password")} {...field} />
              </FormControl>
              {errors.password ? (
                <FormMessage>{errors.password.message}</FormMessage>
              ) : null}
            </FormItem>
          )}
        />
        {submittingError ? <FormMessage>{submittingError}</FormMessage> : null}
        <Button
          type="submit"
          className="hover:bg-primary/90"
          variant={"default"}
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader className="w-7" /> : t("login:login")}
        </Button>
        <FormDescription className="dark:text-slate-400 self-center">
          {t("login:dont-have-account")}{" "}
          <Link href={"/signup"} className="text-primary">
            {t("login:signup")}
          </Link>
        </FormDescription>
      </form>
    </FormProvider>
  );
};

export default Login;
