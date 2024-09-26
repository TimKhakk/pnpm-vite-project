import { Checkbox } from '@/components/ui/checkbox';
import { SelectScrollable } from '@/components/ui/selectScrollable';
import { api } from '@/lib/api/connect';
import { getIssuesGraphqlQuery, IssueNode, IssuesDataResponse } from '@/lib/api/issues';
import { WORKFLOW_STATES_GRAPHQL_QUERY, WorkflowStateDataResponse, WorkflowStateNode } from '@/lib/api/workflowStates';
import { CheckedState } from '@radix-ui/react-checkbox';
import { groupBy } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

function App() {
  const [workflowStates, setWorkflowStates] = useState<WorkflowStateNode[]>([])
  const [workflowStateId, setWorkflowStateId] = useState<WorkflowStateNode['id']>()
  const [issues, setIssues] = useState<IssueNode[]>([])
  const [issuesPreview, setIssuesPreview] = useState<Map<IssueNode['id'], IssueNode>>(new Map())
  console.log(issuesPreview)

  useEffect(() => {
    const wrapper = async () => {

      const data = await api<WorkflowStateDataResponse>(WORKFLOW_STATES_GRAPHQL_QUERY)

      setWorkflowStates(data.data.workflowStates.nodes)
    }
    wrapper()
  }, []);

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

  const resolveProjectDefaultChecked = useCallback((issues: IssueNode[]): boolean => {
    return issues.every((issue) => issuesPreview.has(issue.id));
  }, [issuesPreview])


  return (
    <main className='container flex mx-auto my-4'>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-5 ">
          <SelectScrollable value={workflowStateId} onValueChange={(v) => {
            setWorkflowStateId(v)
          }} groups={groupedByTeamName} />

          <div className="max-h-[calc(100vh_-_64px)] overflow-auto">
            {groupedIssuesByProjectName.map(([projectName, issues]) => (
              <div key={projectName} className="flex flex-col gap-1">
                <label
                  className="flex items-center gap-1 space-x-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <Checkbox defaultChecked={resolveProjectDefaultChecked(issues)} onCheckedChange={(e) => handleProjectCheck(e, issues)} />
                  {projectName}
                </label>

                <ul className="flex flex-col ml-6">
                  {issues.map((i) => (
                    <li key={i.id}>
                      {i.title}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col px-1 py-0.5" contentEditable>
          {groupedIssuesByProjectNameForPreview.map(([projectName, issues]) => (
            <div key={projectName} className="flex flex-col gap-1">
              {projectName}

              <ul className="flex flex-col ml-6">
                {issues.map((i) => (
                  <li key={i.id}>
                    {i.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default App
