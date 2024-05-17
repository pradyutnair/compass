"use client";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/auth-actions";
import React from "react";
import Image from 'next/image';

const SignInWithGoogleButton = () => {
    return (
        <Button
            type="button"
            variant="outline"
            className="w-full flex justify-center items-center"
            onClick={() => {
                signInWithGoogle();
            }}
        >
            Sign in with
            <Image src="/icons/google.svg" alt="Google logo" width={24} height={24} className="ml-2" />
        </Button>
    );
};

export default SignInWithGoogleButton;