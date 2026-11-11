import { getGitHubClient } from "../services/github.services.js";

export const getRepositories = async (req, res, next) => {
    try {
        const github = await getGitHubClient(req.userId);

        const repositories = await github(
            "/user/repos?visibility=public&affiliation=owner,collaborator,organization&sort=updated&per_page=100"
        );

        const formattedRepositories = repositories.map((repo) => ({
            id: repo.id,
            name: repo.name,
            owner:{
                login:repo.owner.login
            },
            fullName: repo.full_name,
            description: repo.description,
            htmlUrl: repo.html_url,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            isPrivate: repo.private,
            defaultBranch: repo.default_branch,
            updatedAt: repo.updated_at,
            openIssuesCount: repo.open_issues_count
        }));

        return res.status(200).json({
            success: true,
            count: formattedRepositories.length,
            repositories: formattedRepositories
        });

    } catch (error) {
        next(error);
    }
};

export const getPullRequests = async (req, res, next) => {
    try {
        const { owner, repo } = req.params;

        const github = await getGitHubClient(req.userId);

        const endpoint =
            `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls?state=open&sort=updated&direction=desc&per_page=100`;

        const pullRequests = await github(endpoint);

        const formattedPRs = pullRequests.map((pr) => ({
            id: pr.id,
            number: pr.number,
            title: pr.title,
            body: pr.body,
            state: pr.state,
            htmlUrl: pr.html_url,
            author: {
                username: pr.user.login,
                avatarUrl: pr.user.avatar_url
            },
            createdAt: pr.created_at,
            updatedAt: pr.updated_at,
            baseBranch: pr.base.ref,
            headBranch: pr.head.ref,
            changedFiles: pr.changed_files,
            additions: pr.additions,
            deletions: pr.deletions,
            commits: pr.commits
        }));

        return res.status(200).json({
            success: true,
            count: formattedPRs.length,
            pullRequests: formattedPRs
        });

    } catch (error) {
        next(error);
    }
};

export const getPullRequestFiles = async (req, res, next) => {
    try {
        const { owner, repo, number } = req.params;

        if (!/^\d+$/.test(number)) {
            return res.status(400).json({
                success: false,
                message: "Invalid pull request number"
            });
        }

        const github = await getGitHubClient(req.userId);

        const files = await github(
            `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${number}/files?per_page=100`
        );

        const formattedFiles = files.map((file) => ({
            filename: file.filename,
            status: file.status,
            additions: file.additions,
            deletions: file.deletions,
            changes: file.changes,
            patch: file.patch || null,
            rawUrl: file.raw_url,
            blobUrl: file.blob_url
        }));

        return res.status(200).json({
            success: true,
            count: formattedFiles.length,
            files: formattedFiles
        });

    } catch (error) {
        next(error);
    }
};