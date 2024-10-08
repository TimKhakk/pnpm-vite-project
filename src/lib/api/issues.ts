import { WorkflowStateNode } from "@/lib/api/workflowStates";

export type IssueNode = {
  id: string;
  url: string;
  title: string;
  identifier: string;
  team: {
    name: string;
  }
  state: {
    name: string;
  }
  project: {
    name: string;
  }
}

export type IssuesDataResponse = { data: { issues: { nodes: IssueNode[] } } }

export const ISSUES_QUERY = `
  query Issues($filter: IssueFilter) {
    issues(filter: $filter) {
      nodes {
        id
        title
        identifier
        url
        team {
          name
        }
        state {
          name
        }
        project {
          name
        }
      }
    }
  }
`

export const getIssuesGraphqlQuery = (workflowStateId: WorkflowStateNode['id']) => ({
  "query": ISSUES_QUERY,
  "variables": {
    "filter": {
      "state": {
        "id": {
          "eq": workflowStateId,
        }
      }
    }
  },
  "operationName": "Issues"
})
