"use client";

import * as React from "react";
import {Check, ChevronsUpDown} from "lucide-react";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem,} from "@/components/ui/command";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";

// Importing the European countries and their flags
import europeanCountries from "../../../components/europeanCountries";

interface Country {
    name: string;
    flag: string;
}

export function ComboboxDemo() {
    const [open, setOpen] = React.useState(false);
    const [selectedCountry, setSelectedCountry] = React.useState<Country | null>(
        null
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {selectedCountry ? (
                        <>
                            <img
                                src={selectedCountry.flag}
                                alt={selectedCountry.name}
                                className="inline-block w-5 h-5 mr-2"
                            />
                            {selectedCountry.name}
                        </>
                    ) : (
                        "Select country..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search country..."/>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                        {europeanCountries.map((country) => (
                            <CommandItem
                                key={country.name}
                                value={country.name} // Pass the name property of the country object
                                onSelect={() => {
                                    setSelectedCountry(country); // Pass the entire country object
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedCountry &&
                                        selectedCountry.name === country.name
                                            ? "opacity-100"
                                            : "opacity-0"
                                    )}
                                />
                                <img
                                    src={country.flag}
                                    alt={country.name}
                                    className="inline-block w-5 h-5 mr-2"
                                />
                                {country.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
