'use client';
import React, { useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { getError } from '@/utils/error';
import axios from 'axios';
import Layout from '@/app/components/Layout';
import { redirect } from 'next/navigation';
export const revalidate = 60;
export default function ProfileScreen() {
  const { data: session, update } = useSession({
    required: true,
    onUnauthenticated() {
      redirect(`/signin?callbackUrl=/account`);
    },
  });
  const userid = session?.user?._id;
  const {
    handleSubmit,
    register,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    setValue('name', session?.user?.name);
    setValue('email', session?.user?.email);
  }, [session?.user, setValue]);

  const submitHandler = async ({ name, email, password, userid }) => {
    try {
      console.log(userid);
      await axios.put('/api/auth/update', {
        name,
        email,
        password,
        userid,
      });
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      update({ name: name, email: email });
      toast.success('Profile updated successfully');
      if (result.error) {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <Layout title="Profile">
      <form
        className="mx-auto max-w-screen-md"
        onSubmit={handleSubmit(submitHandler)}
      >
        <h1 className="mb-4 text-xl">Update Profile</h1>

        <div className="mb-4">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            className="w-full"
            id="name"
            autoFocus
            {...register('name', {
              required: 'Please enter name',
            })}
          />
          {errors.name && (
            <div className="text-red-500">{errors.name.message}</div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            className="w-full"
            id="email"
            {...register('email', {
              required: 'Please enter email',
              pattern: {
                value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/i,
                message: 'Please enter valid email',
              },
            })}
          />
          {errors.email && (
            <div className="text-red-500">{errors.email.message}</div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="password">Password</label>
          <input
            className="w-full"
            type="password"
            id="password"
            {...register('password', {
              minLength: { value: 6, message: 'password is more than 5 chars' },
            })}
          />
          {errors.password && (
            <div className="text-red-500 ">{errors.password.message}</div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            className="w-full"
            type="password"
            id="confirmPassword"
            {...register('confirmPassword', {
              validate: (value) => value === getValues('password'),
              minLength: {
                value: 6,
                message: 'confirm password is more than 5 chars',
              },
            })}
          />
          {errors.confirmPassword && (
            <div className="text-red-500 ">
              {errors.confirmPassword.message}
            </div>
          )}
          {errors.confirmPassword &&
            errors.confirmPassword.type === 'validate' && (
              <div className="text-red-500 ">Password do not match</div>
            )}
        </div>
        <div className="mb-4">
          <button
            className="primary-button"
            onClick={() => {
              reset((formValues) => ({
                ...formValues,
                userid: userid,
              }));
            }}
          >
            Update Profile
          </button>
        </div>
      </form>
    </Layout>
  );
}

ProfileScreen.auth = true;
