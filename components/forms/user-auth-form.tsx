"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema } from "@/schemas";
import React, { ReactNode, useState } from "react";
import { login } from "@/actions/login";
import { register } from "@/actions/register";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { FormSuccess } from "@/components/form-success";
import { FormError } from "@/components/form-error";
import { KeySquare } from "lucide-react";

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface LoginFormProps {
  onSubmit: SubmitHandler<LoginFormValues>;
  error?: string;
  loading: boolean;
}

interface RegisterFormProps {
  onSubmit: SubmitHandler<RegisterFormValues>;
  error?: string;
  success?: string;
  loading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, error, loading }) => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <Form {...form}>
      <div className="flex items-center justify-center">
        <KeySquare className="w-6 h-6 mr-2" />
        <h2 className="text-2xl font-semibold tracking-tight">
          Sign in to your account
        </h2>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit as SubmitHandler<LoginFormValues>)}
        className="w-full space-y-2"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email..."
                  disabled={loading}
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password..."
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <FormError message={error} />}
        <Button disabled={loading} className="ml-auto w-full" type="submit">
          Login
        </Button>
      </form>
    </Form>
  );
};

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  error,
  success,
  loading,
}) => {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  return (
    <Form {...form}>
      <div className="flex items-center justify-center">
        <KeySquare className="w-6 h-6 mr-2" />
        <h2 className="text-2xl font-semibold tracking-tight">
          Create an account
        </h2>
      </div>
      <form
        onSubmit={form.handleSubmit(
          onSubmit as SubmitHandler<RegisterFormValues>,
        )}
        className="w-full space-y-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Enter your name..."
                  disabled={loading}
                  {...field}
                />
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
                  placeholder="Enter your email..."
                  disabled={loading}
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password..."
                  disabled={loading}
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
              <FormLabel>Confim password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password..."
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <FormError message={error} />}
        {success && <FormSuccess message={success} />}
        <Button disabled={loading} className="ml-auto w-full" type="submit">
          Register
        </Button>
      </form>
    </Form>
  );
};

const UserAuthForm: React.FC = (): ReactNode => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const onLoginSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setLoading(true);
    login(values).then((data) => {
      if (data && data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      window.location.href = DEFAULT_LOGIN_REDIRECT;
      setLoading(false);
    });
  };

  const onRegisterSubmit: SubmitHandler<RegisterFormValues> = async (
    values,
  ) => {
    setLoading(true);
    register(values).then((data) => {
      setError(data.error);
      setSuccess(data.success);
    });
    setLoading(false);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    RegisterForm;
    setError(undefined);
    setSuccess(undefined);
  };

  return (
    <>
      {isLogin ? (
        <LoginForm onSubmit={onLoginSubmit} error={error} loading={loading} />
      ) : (
        <RegisterForm
          onSubmit={onRegisterSubmit}
          error={error}
          success={success}
          loading={loading}
        />
      )}
      <div className="text-center mt-4">
        <Button variant="link" onClick={toggleForm}>
          {isLogin
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </Button>
      </div>
    </>
  );
};

export default UserAuthForm;
