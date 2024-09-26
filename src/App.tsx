import { SelectScrollable } from '@/components/ui/selectScrollable';
import { api } from '@/lib/api/connect';
import { IssueNode, ISSUES_GRAPHQL_QUERY, IssuesDataResponse } from '@/lib/api/issues';
import { WORKFLOW_STATES_GRAPHQL_QUERY, WorkflowStateDataResponse, WorkflowStateNode } from '@/lib/api/workflowStates';
import { groupBy } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';
import './App.css';

function App() {
  const [workflowStates, setWorkflowStates] = useState<WorkflowStateNode[]>([])
  const [workflowStateId, setWorkflowStateId] = useState<WorkflowStateNode['id']>()
  const [issues, setIssues] = useState<IssueNode[]>()

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

  const selectedWorkflowState = useMemo(() => {
    return workflowStateMap.get(workflowStateId ?? '')
  }, [workflowStateId, workflowStateMap])

  useEffect(() => {
    if (selectedWorkflowState == null) return;
    const wrapper = async () => {

      const data = await api<IssuesDataResponse>(ISSUES_GRAPHQL_QUERY)

      setIssues(data.data.issues.nodes)
    }
    wrapper()
  }, [selectedWorkflowState]);

  return (
    <main className='container flex mx-auto my-4'>
      <SelectScrollable value={workflowStateId} onValueChange={(v) => {
        setWorkflowStateId(v)
      }} groups={groupedByTeamName} />

      {JSON.stringify(issues, null, 2)}
    </main>
  )
}

export default App
