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

const Login = () => {
  const router = useRouter();
  const [submittingError, setSubmittingError] = useState<string>("");

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
                <Input placeholder="Email" {...field} />
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
                <Input placeholder="Password" {...field} />
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
          {isSubmitting ? <Loader className="w-7" /> : "Login"}
        </Button>
        <FormDescription className="dark:text-slate-400 self-center">
          Don't have an account?{" "}
          <Link href={"/signup"} className="text-primary">
            Sign Up
          </Link>
        </FormDescription>
      </form>
    </FormProvider>
  );
};

export default Login;
