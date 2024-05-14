"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {sidebarLinks} from "@/constants";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";

const SideBar = ({user}: SiderbarProps) => {
    const pathname = usePathname();
    return (
        <section className={"sidebar"}>
            <nav className={"flex flex-col gap-4"}>
                <Link href={"/"}
                      className={"mb-12 cursor-pointer items-center flex gap-2"}>
                    <Image src={"/icons/logo.svg"}
                           width={32}
                           height={32}
                           alt={"Logo"}
                           className={"size-[24px] max-xl:size-14"}
                    />
                    <h1
                        className={"sidebar-logo"}>Compass
                    </h1>
                </Link>
                {sidebarLinks.map((item) => {
                    const isActive = pathname === item.route
                        || pathname.startsWith(`${item.route}/`);
                    return (
                        <Link href={item.route} key={item.label}
                              className={cn('sidebar-link', {'bg-bank-gradient': isActive})}>
                            <div className={"relative size-6"}>
                                <Image src={item.imgURL}
                                       fill
                                       alt={item.label}
                                       className={cn({'brightness-[3] invert-0': isActive})}
                                />
                            </div>
                            <p className={cn('sidebar-label', {'!text-white': isActive})}>
                                {item.label}
                            </p>
                        </Link>
                    )
                })}
                USER
            </nav>
            FOOTER
        </section>
    );
};

export default SideBar;