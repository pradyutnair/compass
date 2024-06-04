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

export  function UserNav(userInfo: any) {
    console.log("User NAV user: ", userInfo)
    let user1 = userInfo.user;
    if (user1) {
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
                                alt={user1.name ?? ''}
                            />
                            <AvatarFallback>{user1.name[0] ?? ''}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {user1.name}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user1.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator/>
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
                    <DropdownMenuSeparator/>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }
}