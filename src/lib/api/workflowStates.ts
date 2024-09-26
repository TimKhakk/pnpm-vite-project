
export const WORKFLOW_STATES_QUERY = `
  query Nodes($filter: WorkflowStateFilter) {
    workflowStates(filter: $filter) {
      nodes {
        id
        name
        team {
          id
          name
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

export type WorkflowStateNode = {
  id: string;
  name: string;
  team: {
    id: string;
    name: string;
  }
}

export type WorkflowStateDataResponse = { data: { workflowStates: { nodes: WorkflowStateNode[] } } }

export const WORKFLOW_STATES_GRAPHQL_QUERY = {
  "query": WORKFLOW_STATES_QUERY,
  "variables": {
    "filter": {
      "or": [
        {
          "name": {
            "containsIgnoreCase": "stag"
          }
        },
        {
          "name": {
            "containsIgnoreCase": "done"
          }
        },
        {
          "name": {
            "containsIgnoreCase": "prod"
          }
        }
      ]
    }
  },
  "operationName": "Nodes"
}
