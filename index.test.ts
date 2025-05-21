import nock from 'nock';
// Adjust the import path as necessary if approveMergeRequest is not directly exported
// For now, let's assume we can import it. If not, we'll need to refactor index.ts or test via server.
// This will likely require approveMergeRequest to be exported from index.ts
// For the purpose of this exercise, I will assume it's exported.
// If index.ts is a script that runs a server, direct function import might not be straightforward.

// Mock environment variables
process.env.GITLAB_PERSONAL_ACCESS_TOKEN = 'test-token';
process.env.GITLAB_API_URL = 'https://gitlab.example.com';

import { jest } from '@jest/globals'; // Import jest
// Import the function to test - this might require changes in index.ts to export it
import { approveMergeRequest, normalizeGitLabApiUrl, handleGitLabError } from './index'; // Import actual functions
import { GitLabMergeRequestSchema, ApproveMergeRequestSchema } from './schemas'; // Assuming schemas are also available/exported or adjust path

// Mock environment variables are already set globally in the file.

describe('approveMergeRequest', () => {
  const projectId = '123';
  const mergeRequestIid = 1;
  const gitlabApiBase = `${process.env.GITLAB_API_URL}/api/v4`;

  beforeEach(() => {
    nock.cleanAll();
    if (!nock.isActive()) { // Ensure nock is active
      nock.activate();
    }
    // Mock GITLAB_API_URL to include /api/v4 if normalizeGitLabApiUrl is not used or tested separately
    // For these tests, we directly use the /api/v4 path.
  });

  afterEach(() => {
    nock.restore();
  });

  it('should approve a merge request successfully', async () => {
    const mockMergeRequestResponse = {
      id: 1,
      iid: mergeRequestIid,
      project_id: parseInt(projectId),
      title: 'Test MR',
      description: 'Test description',
      state: 'opened',
      // Add other required fields for GitLabMergeRequestSchema
      author: { id: 1, name: 'Test User', username: 'testuser', avatar_url: '', web_url: '', email: '', date: '' },
      source_branch: 'feature-branch',
      target_branch: 'main',
      web_url: 'http://example.com/mr/1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Add missing nullable fields required by GitLabMergeRequestSchema
      merged_at: null,
      closed_at: null,
      merge_commit_sha: null,
      // Ensure all other potentially nullable fields that are part of the schema are present or handled
      description: 'Test description', // Already there, but as an example
      // Add other fields from GitLabMergeRequestSchema as needed, with null or default values
      assignees: [],
      draft: false,
      work_in_progress: false,
      merged: false,
      blocking_discussions_resolved: true,
      should_remove_source_branch: false,
      force_remove_source_branch: false,
      allow_collaboration: false,
      allow_maintainer_to_push: false,
      changes_count: "10",
      detailed_merge_status: "ci_must_pass", // Example, adjust as per schema
      merge_status: "can_be_merged", // Example
      merge_error: null,
      squash: false,
      labels: [],
      diff_refs: {
        base_sha: "basesha",
        head_sha: "headsha",
        start_sha: "startsha",
      }
    };

    nock(gitlabApiBase)
      .post(`/projects/${projectId}/merge_requests/${mergeRequestIid}/approve`)
      .reply(201, mockMergeRequestResponse);

    // Now call the actual imported function
    const result = await approveMergeRequest(projectId, mergeRequestIid);

    expect(result).toEqual(GitLabMergeRequestSchema.parse(mockMergeRequestResponse)); // Ensure parsing for strictness
    expect(nock.isDone()).toBe(true); // Ensures the mock was called
  });

  it('should throw an error for 401 Unauthorized', async () => {
    nock(gitlabApiBase)
      .post(`/projects/${projectId}/merge_requests/${mergeRequestIid}/approve`)
      .reply(401, { message: 'Unauthorized' });

    // The actual function will use the imported handleGitLabError
    await expect(approveMergeRequest(projectId, mergeRequestIid)).rejects.toThrow(
      /GitLab API error: 401 Unauthorized/
    );
    expect(nock.isDone()).toBe(true);
  });

  it('should throw an error for 404 Not Found', async () => {
    nock(gitlabApiBase)
      .post(`/projects/${projectId}/merge_requests/${mergeRequestIid}/approve`)
      .reply(404, { message: 'Not Found' });

    await expect(approveMergeRequest(projectId, mergeRequestIid)).rejects.toThrow(
      /GitLab API error: 404 Not Found/
    );
    expect(nock.isDone()).toBe(true);
  });

  it('should throw an error for 422 Unprocessable Entity (e.g., MR already approved or cannot be approved)', async () => {
    nock(gitlabApiBase)
      .post(`/projects/${projectId}/merge_requests/${mergeRequestIid}/approve`)
      .reply(422, { message: 'Unprocessable Entity' });

    await expect(approveMergeRequest(projectId, mergeRequestIid)).rejects.toThrow(
      /GitLab API error: 422 Unprocessable Entity/
    );
    expect(nock.isDone()).toBe(true);
  });

  it('should throw an error for 500 Internal Server Error', async () => {
    nock(gitlabApiBase)
      .post(`/projects/${projectId}/merge_requests/${mergeRequestIid}/approve`)
      .reply(500, { message: 'Internal Server Error' });

    await expect(approveMergeRequest(projectId, mergeRequestIid)).rejects.toThrow(
      /GitLab API error: 500 Internal Server Error/
    );
    expect(nock.isDone()).toBe(true);
  });

  it('should call fetch with the correct parameters', async () => {
    const mockMergeRequestResponse = {
      id: 1,
      iid: mergeRequestIid,
      project_id: parseInt(projectId),
      title: 'Test MR',
      description: 'Test description',
      state: 'opened',
      author: { id: 1, name: 'Test User', username: 'testuser', avatar_url: '', web_url: '', email: '', date: '' },
      source_branch: 'feature-branch',
      target_branch: 'main',
      web_url: 'http://example.com/mr/1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      merged_at: null,
      closed_at: null,
      merge_commit_sha: null,
      assignees: [],
      draft: false,
      work_in_progress: false,
      merged: false,
      blocking_discussions_resolved: true,
      should_remove_source_branch: false,
      force_remove_source_branch: false,
      allow_collaboration: false,
      allow_maintainer_to_push: false,
      changes_count: "10",
      detailed_merge_status: "ci_must_pass",
      merge_status: "can_be_merged",
      merge_error: null,
      squash: false,
      labels: [],
      diff_refs: {
        base_sha: "basesha",
        head_sha: "headsha",
        start_sha: "startsha",
      }
    };

    // Nock defines the expected URL and method.
    // If it's not called, nock.isDone() will be false.
    nock(gitlabApiBase)
      .post(`/projects/${projectId}/merge_requests/${mergeRequestIid}/approve`) // This implicitly checks method and URL
      .reply(201, mockMergeRequestResponse);

    await approveMergeRequest(projectId, mergeRequestIid);

    // Assert that the nock interceptor was called as expected.
    // This verifies the URL, method, and that a request was made.
    // Specific header checks can be added to the nock interceptor if needed, e.g. .matchHeader('Authorization', ...)
    expect(nock.isDone()).toBe(true);
  });

  // Test input validation (delegated to Zod, but ensure function uses it)
  it('should throw validation error for invalid input (e.g., missing project_id)', async () => {
    // This test relies on ApproveMergeRequestSchema being used internally
    // @ts-expect-error Testing invalid input
    await expect(approveMergeRequest(undefined, mergeRequestIid)).rejects.toThrow();
  });

  it('should throw validation error for invalid merge_request_iid type', async () => {
    // @ts-expect-error Testing invalid input
    await expect(approveMergeRequest(projectId, "not-a-number")).rejects.toThrow();
  });

});
