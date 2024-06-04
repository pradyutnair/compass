'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {getLoggedInUser} from "@/lib/user.actions";

export function UserNav() {
    const user = await getLoggedInUser();
    if (user) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        {/*<Avatar className="h-8 w-8">*/}
                        {/*    <AvatarImage*/}
                        {/*        src={session.user?.image ?? ''}*/}
                        {/*        alt={session.user?.name ?? ''}*/}
                        {/*    />*/}
                        {/*    <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback>*/}
                        {/*</Avatar>*/}
                        <Avatar className="h-8 w-8">
                            <AvatarImage
                                src={"icons/a-coffee.svg"}
                                alt={user.name ?? ''}
                            />
                            <AvatarFallback>{user.name.[0] ?? ''}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {user.name}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            Profile
                            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Billing
                            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Settings
                            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem>New Team</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }
}