import * as core from "@actions/core";
import * as github from "@actions/github";
import { IssuesEventPayload, NormalizeInputs } from "./types";
import { extractIssueNumber, extractIssueTitle, formatDateYYYYMMDD, normalizeAll } from "./normalize";

function isIssuesEventPayload(x: unknown): x is IssuesEventPayload {
  if (typeof x !== "object" || x === null) return false;
  const obj = x as Record<string, unknown>;
  const issue = obj["issue"] as Record<string, unknown> | undefined;
  const repo = obj["repository"] as Record<string, unknown> | undefined;
  return (
      typeof obj["action"] === "string" &&
      !!issue &&
      typeof issue["number"] === "number" &&
      typeof issue["title"] === "string" &&
      typeof issue["html_url"] === "string" &&
      !!repo &&
      typeof (repo["name"] as string) === "string" &&
      !!(repo["owner"] as Record<string, unknown>) &&
      typeof (repo["owner"] as Record<string, unknown>)["login"] === "string"
  );
}

async function run(): Promise<void> {
  try {
    const payloadUnknown: unknown = github.context.payload;
    if (!isIssuesEventPayload(payloadUnknown)) {
      core.setFailed("issues 이벤트가 아닙니다.");
      return;
    }
    const payload: IssuesEventPayload = payloadUnknown;
    const isOpened: boolean = payload.action === "opened";
    const isEditedWithTitle: boolean = payload.action === "edited" && !!payload.changes?.title;

    if (!isOpened && !isEditedWithTitle) {
      core.info("열림 또는 제목 변경 이벤트가 아님 → 종료");
      return;
    }

    const owner: string = payload.repository.owner.login;
    const repo: string = payload.repository.name;

    const rawTitle: string = payload.issue.title;
    const issueUrl: string = payload.issue.html_url;
    const issueNumber: string = extractIssueNumber(issueUrl) || String(payload.issue.number);

    const title: string = extractIssueTitle(rawTitle);
    const dateYYYYMMDD: string = formatDateYYYYMMDD(new Date());

    const tokenInput: string = core.getInput("token", { required: false }).trim();
    const commentMarker: string = core.getInput("comment_marker", { required: false }) || "<!-- 이 댓글은 SUH-ISSUE-HELPER 에 의해 자동으로 생성되었습니다. - https://github.com/Cassiiopeia/github-issue-helper -->";
    const branchPrefix: string = core.getInput("branch_prefix", { required: false }) || "";
    const maxBranchLengthRaw: string = core.getInput("max_branch_length", { required: false }) || "120";
    const commitTemplate: string =
        core.getInput("commit_template", { required: false }) ||
        "${issueTitle} : feat : {변경 사항에 대한 설명} ${issueUrl}";

    const maxBranchLength: number = Number(maxBranchLengthRaw);
    if (Number.isNaN(maxBranchLength) || maxBranchLength < 0) {
      core.setFailed("max_branch_length 는 0 이상의 숫자여야 합니다.");
      return;
    }

    const token: string = tokenInput.length > 0 ? tokenInput : process.env.GITHUB_TOKEN ?? "";
    if (!token) {
      core.setFailed("토큰이 없습니다. (GITHUB_TOKEN 또는 inputs.token)");
      return;
    }

    const octokit = github.getOctokit(token);

    const inputs: NormalizeInputs = {
      title,
      issueUrl,
      issueNumber,
      dateYYYYMMDD,
      branchPrefix,
      maxBranchLength,
      commitTemplate,
    };
    const { branchName, commitMessage } = normalizeAll(inputs);

    const body: string = `${commentMarker}

Guide by SUH-LAB
---

### 브랜치
\`\`\`
${branchName}
\`\`\`

### 커밋 메시지
\`\`\`
${commitMessage}
\`\`\`

${commentMarker}`;

    const comments = await octokit.paginate(octokit.rest.issues.listComments, {
      owner,
      repo,
      issue_number: payload.issue.number,
      per_page: 100,
    });

    const existing = comments.find((c) => typeof c.body === "string" && c.body.includes(commentMarker));

    if (existing) {
      await octokit.rest.issues.updateComment({ owner, repo, comment_id: existing.id, body });
      core.info("기존 코멘트를 갱신했습니다.");
    } else {
      await octokit.rest.issues.createComment({ owner, repo, issue_number: payload.issue.number, body });
      core.info("새 코멘트를 작성했습니다.");
    }

    core.setOutput("branchName", branchName);
    core.setOutput("commitMessage", commitMessage);
  } catch (e) {
    const msg: string = e instanceof Error ? e.message : String(e);
    core.setFailed(`실행 실패: ${msg}`);
  }
}

void run();
