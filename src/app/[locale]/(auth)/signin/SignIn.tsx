"use client";

import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signinValidator } from "@/lib/validations";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { signIn } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { ShieldCheck } from "lucide-react";
import ButtonWithLoaderAndProgress from "@/components/ButtonWithLoaderAndProgress";
import { cn } from "@/lib/utils";
import AppLogo from "@/components/AppLogo";
import { getDirByLang } from "@/lib/dir";
import { rateLimitterAction } from "@/server-actions";

interface SignUpProps {
  locale: string;
}

const SignUp: React.FC<SignUpProps> = ({ locale }) => {
  const [submittingError, setSubmittingError] = useState<string>("");
  const [isEmailSent, setEmailSent] = useState(false);
  const searchParams = useSearchParams();

  const callback_url = useMemo(
    () => searchParams.get("callbackUrl"),
    [searchParams]
  );

  const { t } = useTranslation();

  const { validator } = signinValidator(t);
  type signinValidatorType = z.infer<typeof validator>;

  const form = useForm<signinValidatorType>({
    resolver: zodResolver(validator),
    defaultValues: {
      email: "",
    },
    mode: "onSubmit",
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: signinValidatorType) => {
    try {
      setSubmittingError("");
      const limit = await rateLimitterAction({
        limit: 4,
        duration: 120,
      });
      if (limit.status === "err" || limit.error)
        return setSubmittingError(t("error:too-many-request", { num: "1" }));
      const res = await signIn("email", {
        email: data.email,
        callbackUrl: callback_url || "/",
        redirect: false,
      });
      if (res?.error) throw new Error();
      if (res?.ok) setEmailSent(true);
    } catch (err: any) {
      console.log(err?.code);
      setSubmittingError(t("error:error-msg-client"));
    }
  };

  return (
    <FormProvider {...form}>
      <AppLogo
        t={t}
        className={cn("fixed top-4 md:top-6", {
          "left-4 md:left-12": getDirByLang(locale as string) === "ltr",
          "right-4 md:right-12": getDirByLang(locale as string) === "rtl",
        })}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {isEmailSent ? (
          <div className="w-full">
            <Alert className="text-emerald-400 border-emerald-300 dark:border-emerald-700 bg-emerald-200/20 dark:bg-emerald-950/50">
              <ShieldCheck className="h-4 w-4" color="rgba(52 211 153)" />
              <AlertTitle>{t("register:check-your-email")}</AlertTitle>
              <AlertDescription>
                {t("register:signin-link-sent")}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <>
            <FormField
              control={control}
              disabled={isSubmitting}
              name="email"
              render={({ field, formState: { errors } }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder={t("register:email")} {...field} />
                  </FormControl>
                  {errors.email ? (
                    <FormMessage>{errors.email.message}</FormMessage>
                  ) : null}
                </FormItem>
              )}
            />
            {submittingError ? (
              <FormMessage>{submittingError}</FormMessage>
            ) : null}
            <ButtonWithLoaderAndProgress
              disabled={isSubmitting}
              loading={isSubmitting}
              type="submit"
              className="hover:bg-primary/90"
            >
              {t("register:submit")}
            </ButtonWithLoaderAndProgress>
          </>
        )}
      </form>
    </FormProvider>
  );
};

export default SignUp;
