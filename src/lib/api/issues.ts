export type IssueNode = {
  id: string;
  title: string;
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

export const ISSUES_GRAPHQL_QUERY = {
  "query": ISSUES_QUERY,
  "variables": {
    "filter": {
      "state": {
        "id": {
          "eq": "2b4011f4-3e12-4c32-9fa8-c6e1445a50c7"
        }
      }
    }
  },
  "operationName": "Issues"
}
