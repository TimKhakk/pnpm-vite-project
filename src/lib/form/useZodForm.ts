import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type DefaultValues } from "react-hook-form"
import type { z } from "zod"

export const useZodForm = <S extends z.Schema>(schema: S, defaultValues: DefaultValues<z.TypeOf<S>>) => {
  return useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues,
  })
}
