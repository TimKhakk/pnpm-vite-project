import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkflowStateNode } from "@/lib/api/workflowStates";
import { SelectProps } from "@radix-ui/react-select";

export function SelectScrollable({
  groups,
  ...selectProps
}: {
  groups: [WorkflowStateNode['team']['name'], WorkflowStateNode[]][]
} & Pick<SelectProps, 'onValueChange' | 'value'>) {
  return (
    <Select {...selectProps}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a linear status" />
      </SelectTrigger>
      <SelectContent>
        {groups.map(([name, workflowStates]) => (
          <SelectGroup key={name}>
            <SelectLabel>{name}</SelectLabel>
            {workflowStates.map((w) => (
              <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}
