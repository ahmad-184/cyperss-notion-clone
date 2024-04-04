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
import { Button } from "@/components/ui/Button";
import Loader from "@/components/Loader";
import { signIn } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { ShieldCheck } from "lucide-react";
import ButtonWithLoaderAndProgress from "@/components/ButtonWithLoaderAndProgress";

const SignUp = () => {
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
      const res = await signIn("email", {
        email: data.email,
        callbackUrl: callback_url || "/",
        redirect: false,
      });
      if (res?.ok) setEmailSent(true);
    } catch (err: any) {
      console.log(err?.code);
      setSubmittingError("Something went wrong, please try again");
    }
  };

  return (
    <FormProvider {...form}>
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
