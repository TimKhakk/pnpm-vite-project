import ReleaseNotesBuilder from '@/components/release-notes-builder/component';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useZodForm } from '@/lib/form/useZodForm';
import { LINEAR_TOKEN_API_KEY } from '@/linear-token-api-form/config';
import { useLinearTokenApiLocalStorage } from '@/linear-token-api-form/hooks';
import { linearTokenApiSchema } from '@/linear-token-api-form/schema';
import { startCase } from 'lodash-es';
import { FormProvider } from 'react-hook-form';
import type { z } from 'zod';
import './App.css';

function App() {
  const { value, setValue } = useLinearTokenApiLocalStorage()

  // move to useLinearTokenApiForm
  const form = useZodForm(linearTokenApiSchema, {
    linear_api_token: ''
  })

  function onSubmit(values: z.infer<typeof linearTokenApiSchema>) {
    setValue(values.linear_api_token)
  }

  return (
    <main className='container flex flex-col gap-6 mx-auto my-4'>
      {value == null ? (
        <>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 space-y-8">
              <FormField
                control={form.control}
                name="linear_api_token"
                render={({ field }) => (
                  <FormItem className='min-w-[500px]'>
                    <FormLabel>{startCase(LINEAR_TOKEN_API_KEY)}</FormLabel>
                    <FormControl>
                      <Input placeholder="lin_api_..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Save in browser</Button>
            </form>
          </FormProvider>
        </>
      ) : (
        <ReleaseNotesBuilder />
      )}
    </main>
  )
}

export default App
