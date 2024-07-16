import {
  Article,
  Issue,
  ListResourceIssue,
  ListResourceOrganization,
  ListResourceRepository,
  Organization,
  Repository,
} from '@polar-sh/sdk'
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

import OpenGraphImageArticle from '@/components/Organization/OpenGraphImageArticle'
import OpenGraphImageCreator from '@/components/Organization/OpenGraphImageCreator'
import OpenGraphImageFunding from '@/components/Organization/OpenGraphImageFunding'
import { getServerURL } from '@/utils/api'
import { notFound } from 'next/navigation'

export const runtime = 'edge'

const renderFundingOG = async (
  org_name: string,
  repository: Repository | undefined,
  issue_count: number,
  avatar: string,
  issues: Issue[],
  largeIssue: boolean,
) => {
  // const [interRegular, interMedium] = await Promise.all([
  //   fetch(`https://polar.sh/fonts/Inter-Regular.ttf`).then((res) =>
  //     res.arrayBuffer(),
  //   ),
  //   fetch(`https://polar.sh/fonts/Inter-Medium.ttf`).then((res) =>
  //     res.arrayBuffer(),
  //   ),
  // ])

  return new ImageResponse(
    (
      <OpenGraphImageFunding
        org_name={org_name}
        repo_name={repository?.name}
        issue_count={issue_count}
        avatar={avatar}
        issues={issues}
        largeIssue={largeIssue}
      />
    ),
    {
      height: 630,
      width: 1200,
      // fonts: [
      //   {
      //     name: 'Inter',
      //     data: interRegular,
      //     weight: 500,
      //     style: 'normal',
      //   },
      //   {
      //     name: 'Inter',
      //     data: interMedium,
      //     weight: 600,
      //   },
      // ],
    },
  )
}
const renderCreatorOG = async (organization: Organization) => {
  // const [interRegular, interMedium] = await Promise.all([
  //   fetch(`https://polar.sh/fonts/Inter-Regular.ttf`).then((res) =>
  //     res.arrayBuffer(),
  //   ),
  //   fetch(`https://polar.sh/fonts/Inter-Medium.ttf`).then((res) =>
  //     res.arrayBuffer(),
  //   ),
  // ])

  return new ImageResponse(
    <OpenGraphImageCreator organization={organization} />,
    {
      height: 630,
      width: 1200,
      // fonts: [
      //   {
      //     name: 'Inter',
      //     data: interRegular,
      //     weight: 500,
      //   },
      //   {
      //     name: 'Inter',
      //     data: interMedium,
      //     weight: 600,
      //   },
      // ],
    },
  )
}

const renderArticleOG = async (article: Article) => {
  // const [interRegular, interMedium] = await Promise.all([
  //   fetch(`https://polar.sh/fonts/Inter-Regular.ttf`).then((res) =>
  //     res.arrayBuffer(),
  //   ),
  //   fetch(`https://polar.sh/fonts/Inter-Medium.ttf`).then((res) =>
  //     res.arrayBuffer(),
  //   ),
  // ])

  return new ImageResponse(<OpenGraphImageArticle article={article} />, {
    height: 630,
    width: 1200,
    // fonts: [
    //   {
    //     name: 'Inter',
    //     data: interRegular,
    //     weight: 500,
    //   },
    //   {
    //     name: 'Inter',
    //     data: interMedium,
    //     weight: 600,
    //   },
    // ],
  })
}

const listIssues = async (
  org: string,
  repo: string | null,
): Promise<ListResourceIssue> => {
  const params = new URLSearchParams()
  params.set('platform', 'github')
  params.set('organization_name', org)
  if (repo) {
    params.set('repository_name', repo)
  }
  params.set('have_badge', 'true')
  params.set('sort', 'funding_goal_desc_and_most_positive_reactions')
  return await fetch(
    `${getServerURL()}/v1/issues/search?${params.toString()}`,
    {
      method: 'GET',
    },
  ).then((response) => {
    if (!response.ok) {
      throw new Error(`Unexpected ${response.status} status code`)
    }
    return response.json()
  })
}

const getOrg = async (org: string): Promise<Organization> => {
  let url = `${getServerURL()}/v1/organizations/?slug=${org}&limit=1`

  const response = await fetch(url, {
    method: 'GET',
  })
  const data = (await response.json()) as ListResourceOrganization

  const organization = data.items?.[0]

  if (!organization) {
    notFound()
  }

  return organization
}

const getRepo = async (orgId: string, repo: string): Promise<Repository> => {
  const response = await fetch(
    `${getServerURL()}/v1/repositories/?organization_id=${orgId}&name=${repo}`,
    {
      method: 'GET',
    },
  )
  const data = (await response.json()) as ListResourceRepository

  const repository = data.items?.[0]

  if (!repository) {
    notFound()
  }

  return repository
}

const getIssue = async (externalUrl: string): Promise<Issue> => {
  const params = new URLSearchParams()
  params.set('external_url', externalUrl)
  return await fetch(
    `${getServerURL()}/v1/issues/lookup?${params.toString()}`,
    {
      method: 'GET',
    },
  ).then((response) => {
    if (!response.ok) {
      throw new Error(`Unexpected ${response.status} status code`)
    }
    return response.json()
  })
}

const getArticle = async (id: string): Promise<Article> => {
  return await fetch(`${getServerURL()}/v1/articles/${id}`, {
    method: 'GET',
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Unexpected ${response.status} status code`)
    }
    return response.json()
  })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  // Article image
  try {
    const articleId = searchParams.get('articleId')
    if (articleId) {
      const articleData = await getArticle(articleId)
      return renderArticleOG(articleData)
    }
  } catch (error) {
    return new Response(`Failed to generate article OG image`, {
      status: 500,
    })
  }

  // Funding image
  try {
    const org = searchParams.get('org')
    if (!org) {
      throw new Error('no org')
    }

    const repo = searchParams.get('repo')
    const number = searchParams.get('number')

    let orgData: Organization | undefined
    let repoData: Repository | undefined
    let issueData: Issue | undefined

    if (org && repo && number) {
      issueData = await getIssue(
        `https://github.com/${org}/${repo}/issues/${number}`,
      )
      repoData = issueData.repository
      orgData = repoData.organization
    } else if (org && repo) {
      repoData = await getRepo(org, repo)
      orgData = repoData.organization
    } else if (org) {
      orgData = await getOrg(org)
      return await renderCreatorOG(orgData)
    }

    if (!orgData) {
      notFound()
    }

    let issues: Issue[] = []
    let largeIssue = false
    let total_issue_count = 0

    if (issueData) {
      issues = [issueData]
      largeIssue = true
    } else {
      const res = await listIssues(org, repo)
      if (res.items) {
        issues = res.items
        total_issue_count = res.pagination.total_count
      }
    }

    return await renderFundingOG(
      orgData.name,
      repoData,
      total_issue_count,
      orgData.avatar_url,
      issues,
      largeIssue,
    )
  } catch (error) {
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
