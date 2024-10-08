'use client'

import PublicProfileDropdown from '@/components/Navigation/PublicProfileDropdown'
import { useAuth } from '@/hooks'
import { MaintainerOrganizationContext } from '@/providers/maintainerOrganization'
import { ArrowBack } from '@mui/icons-material'
import { OrganizationUpdate } from '@polar-sh/sdk'
import { useRouter } from 'next/navigation'
import Button from 'polarkit/components/ui/atoms/button'
import { Form } from 'polarkit/components/ui/form'
import { useContext } from 'react'
import { useForm } from 'react-hook-form'
import { StorefrontPreview } from './StorefrontPreview'
import { StorefrontSidebar } from './StorefrontSidebar'

export const StorefrontCustomization = () => {
  const { organization } = useContext(MaintainerOrganizationContext)

  const router = useRouter()
  const { currentUser } = useAuth()

  const form = useForm<OrganizationUpdate>({
    defaultValues: {
      ...organization,
    },
  })

  return (
    <div className="flex h-full flex-col px-8">
      <div className="relative z-50 flex flex-row items-center justify-between py-8">
        <div className="flex flex-row items-center gap-x-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 text-black dark:text-white"
            onClick={() => {
              router.push(`/dashboard/${organization.slug}`)
            }}
            tabIndex={-1}
          >
            <ArrowBack fontSize="small" />
          </Button>
          <h1 className="text-xl">Storefront</h1>
        </div>
        {/* <Tabs
          className="absolute left-1/2 flex -translate-x-1/2 flex-row items-center"
          value={customizationMode}
          onValueChange={(value) => {
            setCustomizationMode(value as CustomizationContextMode)
          }}
        >
          <TabsList>
            <TabsTrigger value="storefront" size="small">
              Storefront
            </TabsTrigger>
            <TabsTrigger value="checkout" size="small" disabled>
              Checkout
            </TabsTrigger>
            <TabsTrigger value="receipt" size="small" disabled>
              Receipt
            </TabsTrigger>
          </TabsList>
        </Tabs> */}
        <PublicProfileDropdown
          authenticatedUser={currentUser}
          className="flex-shrink-0"
        />
      </div>
      <div className="flex min-h-0 flex-grow flex-row gap-x-8 pb-8">
        <Form {...form}>
          <StorefrontPreview />
          <StorefrontSidebar />
        </Form>
      </div>
    </div>
  )
}
