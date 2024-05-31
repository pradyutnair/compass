"use client"

import {FormEvent, useEffect, useState} from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function SelectBankForm() {
    const [institutions, setInstitutions] = useState([])
    const [selectedInstitution, setSelectedInstitution] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        // Retrieve institutions from localStorage
        const institutionsData = localStorage.getItem('institutions')
        if (institutionsData) {
            const parsedInstitutions = JSON.parse(institutionsData)
            parsedInstitutions.sort((a: any, b: any) => a.name.localeCompare(b.name))
            setInstitutions(parsedInstitutions)
        }
    }, [])

    const handleInstitutionChange = (value: string) => {
        setSelectedInstitution(value)
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!selectedInstitution) {
            setError("Please select a bank.")
            return
        }
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/initSession', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ institutionId: selectedInstitution })
            })

            if (!response.ok) {
                throw new Error('Network response was not ok')
            }

            const data = await response.json()
            console.log('Initialization data:', data)

            if (data.link) {
                // Redirect to the Nordigen session link
                await router.push(data.link)
            } else {
                setError('Failed to initialize session.')
            }
        } catch (error) {
            console.error('Initialization error:', error)
            setError('Failed to initialize session. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="mx-auto w-[350px]">
            <CardHeader>
                <CardTitle className="text-lg text-center">Select Bank</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Select onValueChange={handleInstitutionChange} defaultValue={selectedInstitution}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select your bank" />
                                </SelectTrigger>
                                <SelectContent className="shadow-lg border border-gray-200 rounded-md bg-white divide-y divide-gray-200 w-full overflow-y-auto p-2">
                                    {institutions.map((institution: any) => (
                                        <SelectItem value={institution.id} key={institution.id} className="py-2 px-4">
                                            <div className="flex items-center">
                                                <img
                                                    src={institution.logo}
                                                    alt={institution.name}
                                                    className="inline-block w-7 h-7 mr-2"
                                                />
                                                <span className="font-inter text-sm px-4">{institution.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="mb-4"></div>
                        {error && <div className="text-red-600 text-center">{error}</div>}
                        <Button
                            type="submit"
                            className="w-full text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-600 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Submit'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
