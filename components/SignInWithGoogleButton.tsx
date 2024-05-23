"use client";
import { Button } from "@/components/ui/button";
import { signUpWithGoogle }  from "@/lib/server/oauth";
import React from "react";
import Image from 'next/image';
import {signInWithGoogle} from "@/lib/server/oauth-actions";

const SignInWithGoogleButton = ({type = 'sign-in'}: {type?: string}) => {
    // If type is sign-up use signUpWithGoogle else use signInWithGoogle
    let functionToUse;
    let buttonText;

    if (type === 'sign-up') {
        functionToUse = signUpWithGoogle;
        buttonText = 'Sign up with';
    } else {
        functionToUse = signInWithGoogle;
        buttonText = 'Log in with';
    }

    return (
        <Button
            type="button"
            variant="outline"
            className="w-full flex justify-center items-center"
            onClick={() => {
                functionToUse();
            }}
        >
            {buttonText}
            <Image src="/icons/google.svg" alt="Google logo" width={24} height={24} className="ml-2" />
        </Button>
    );
};

export default SignInWithGoogleButton;