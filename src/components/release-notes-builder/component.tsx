import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { SelectScrollable } from "@/components/ui/selectScrollable"
import { toast } from "@/hooks/use-toast"
import { api } from "@/lib/api/connect"
import { getIssuesGraphqlQuery, type IssueNode, type IssuesDataResponse } from "@/lib/api/issues"
import { WORKFLOW_STATES_GRAPHQL_QUERY, type WorkflowStateDataResponse, type WorkflowStateNode } from "@/lib/api/workflowStates"
import { LINEAR_TOKEN_API_KEY } from "@/linear-token-api-form/config"
import { useLinearTokenApiLocalStorage } from "@/linear-token-api-form/hooks"
import type { CheckedState } from "@radix-ui/react-checkbox"
import { groupBy, startCase } from "lodash-es"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useBoolean } from "usehooks-ts"

const ReleaseNotesBuilder = () => {
  const { removeValue } = useLinearTokenApiLocalStorage()
  const [workflowStates, setWorkflowStates] = useState<WorkflowStateNode[]>([])
  const [workflowStateId, setWorkflowStateId] = useState<WorkflowStateNode['id']>()
  const [issues, setIssues] = useState<IssueNode[]>([])
  const [issuesPreview, setIssuesPreview] = useState<Map<IssueNode['id'], IssueNode>>(new Map())
  const { value: isError, setFalse: resetError, setTrue: enableError } = useBoolean(false)

  useEffect(() => {
    const wrapper = async () => {
      try {
        resetError()
        const data = await api<WorkflowStateDataResponse>(WORKFLOW_STATES_GRAPHQL_QUERY)
        setWorkflowStates(data.data.workflowStates.nodes)
      } catch (e) {
        enableError()
        console.log(e)
        const error = e as { errors: { message: string; extensions: { userPresentableMessage: string } }[] } | undefined;
        console.error(e)
        setWorkflowStates([])
        toast({
          variant: "destructive",
          duration: 30000,
          title: "Uh oh! Something went wrong.",
          description: (
            <div>
              <p>Linear Api says:</p>
              {error?.errors?.map((e) => e?.extensions?.userPresentableMessage ?? '')}

              <p>Probably incorrect {startCase(LINEAR_TOKEN_API_KEY)}</p>
            </div>
          ),
        })
      }
    }
    wrapper()
  }, [resetError, enableError]);

  const groupedByTeamName = useMemo(() => {
    return Object.entries(groupBy(workflowStates, (w) => w.team.name)) as [WorkflowStateNode['team']['name'], WorkflowStateNode[]][]
  }, [workflowStates])

  const workflowStateMap = useMemo(() => {
    return new Map(workflowStates.map((w) => [w.id, w]))
  }, [workflowStates])

  const issueMap = useMemo(() => {
    return new Map(issues.map((i) => [i.id, i]))
  }, [issues])

  const selectedWorkflowState = useMemo(() => {
    return workflowStateMap.get(workflowStateId ?? '')
  }, [workflowStateId, workflowStateMap])

  useEffect(() => {
    if (selectedWorkflowState == null) return;
    const wrapper = async () => {

      const data = await api<IssuesDataResponse>(getIssuesGraphqlQuery(selectedWorkflowState['id']))

      setIssues(data.data.issues.nodes)
    }
    wrapper()
  }, [selectedWorkflowState]);


  const groupedIssuesByProjectName = useMemo(() => {
    return Object.entries(groupBy(issues, (i) => i.project?.name ?? 'Projectless')) as [IssueNode['team']['name'], IssueNode[]][]
  }, [issues])

  const groupedIssuesByProjectNameForPreview = useMemo(() => {
    const flatIssues = [...issuesPreview].map(([_, i]) => i);

    return Object.entries(groupBy(flatIssues, (i) => i.project?.name ?? 'Projectless')) as [IssueNode['team']['name'], IssueNode[]][]
  }, [issuesPreview])

  const handleProjectCheck = (checked: CheckedState, issues: IssueNode[]) => {
    if (typeof checked !== 'boolean') return;

    const issueIds = issues.map((i) => i.id);

    setIssuesPreview((prev) => {
      const newState = new Map(prev);

      issueIds.forEach((issueId) => {
        if (newState.has(issueId)) {
          newState.delete(issueId)
        } else {
          newState.set(issueId, issueMap.get(issueId)!)
        }
      })
      return newState;
    })
  }

  const handleIssueCheck = (checked: CheckedState, issueId: IssueNode['id']) => {
    if (typeof checked !== 'boolean') return;

    setIssuesPreview((prev) => {
      const newState = new Map(prev);

      if (newState.has(issueId)) {
        newState.delete(issueId)
      } else {
        newState.set(issueId, issueMap.get(issueId)!)
      }
      return newState;
    })
  }

  const resolveProjectChecked = useCallback((issues: IssueNode[]): CheckedState => {
    return issues.every((issue) => issuesPreview.has(issue.id));
  }, [issuesPreview])

  const resolveIssueChecked = useCallback((issueId: IssueNode['id']): boolean => {
    return issuesPreview.has(issueId);
  }, [issuesPreview])

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <SelectScrollable disabled={isError} value={workflowStateId} onValueChange={(v) => {
          setWorkflowStateId(v)
        }} groups={groupedByTeamName} />
        <Button className='w-max' onClick={removeValue} variant="destructive">Reset {startCase(LINEAR_TOKEN_API_KEY)}</Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-5 ">
          <div className="flex flex-col gap-5 max-h-[calc(100vh_-_100px)] overflow-auto">
            {groupedIssuesByProjectName.map(([projectName, issues]) => (
              <div key={projectName} className="flex flex-col gap-1">
                <label
                  className="flex items-center gap-1 space-x-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <Checkbox checked={resolveProjectChecked(issues)} onCheckedChange={(e) => handleProjectCheck(e, issues)} />
                  {projectName}
                </label>

                <ul className="flex flex-col gap-2 ml-5">
                  {issues.map((i) => (
                    <li key={i.id}>
                      <label
                        className="flex items-center gap-1 space-x-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <Checkbox checked={resolveIssueChecked(i.id)} onCheckedChange={(e) => handleIssueCheck(e, i.id)} />
                        {i.title}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5 max-h-[calc(100vh_-_100px)] overflow-auto px-1 py-0.5" contentEditable>
          {groupedIssuesByProjectNameForPreview.map(([projectName, issues]) => (
            <div key={projectName} className="flex flex-col gap-1">
              <h4><strong>{projectName}</strong></h4>

              <ul className="flex flex-col ml-6">
                {issues.map((i) => (
                  <li key={i.id} className='inline-flex items-center'>
                    <a
                      className="inline-flex w-max text-blue-400 hover:underline cursor-pointer"
                      href={i.url}>{i.identifier}</a
                    >
                    {': '}{i.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default ReleaseNotesBuilder;
