import { NormalizeInputs } from "./types";

/**
 * Java 로직을 TypeScript로 이식한 초기 버전:
 * - [태그] 제거 → 이모지/제어문자 제거
 * - 제목에서 한글/영문/숫자만 남기고 나머지는 '_' 치환
 * - 브랜치: YYYYMMDD_#이슈번호_정규화제목  (prefix는 옵션)
 * - 커밋: 템플릿 치환
 */

export function extractIssueNumber(issueUrl: string): string {
  const trimmed: string = issueUrl.trim().replace(/\/+$/, "");
  const last: string | undefined = trimmed.split("/").pop();
  return last ?? "";
}

export function extractIssueTitle(rawTitle: string): string {
  let title: string = rawTitle.replace(/\[.*?]/g, "").trim();
  // 이모지/제어문자 제거
  title = title.replace(/\p{So}|\p{C}|\uFE0F|\u200D/gu, "").trim();
  return title.length > 0 ? title : rawTitle.trim();
}

export function formatDateYYYYMMDD(d: Date): string {
  const yyyy: number = d.getFullYear();
  const mm: string = String(d.getMonth() + 1).padStart(2, "0");
  const dd: string = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

export function normalizeTitle(title: string): string {
  // 한글/영문/숫자를 제외한 모든 문자를 언더바로 치환
  let normalized = title.replace(/[^a-zA-Z0-9가-힣]/gu, "_");
  // 연속된 언더바를 하나로 축약
  normalized = normalized.replace(/_+/g, "_");
  // 앞뒤 언더바 제거
  normalized = normalized.replace(/^_+|_+$/g, "");
  return normalized;
}

export function createBranchName(
    issueTitle: string,
    issueNumber: string,
    dateYYYYMMDD: string,
    branchPrefix: string,
    maxBranchLength: number,
): string {
  const normalizedTitle: string = normalizeTitle(issueTitle);
  const base: string = `${dateYYYYMMDD}_#${issueNumber}_${normalizedTitle}`;
  const limitedBase: string = maxBranchLength > 0 ? base.slice(0, maxBranchLength) : base;
  return `${branchPrefix}${limitedBase}`;
}

export function renderCommitMessage(
    template: string,
    ctx: {
      issueTitle: string;
      issueUrl: string;
      issueNumber: string;
      branchName: string;
      dateYYYYMMDD: string;
    },
): string {
  return template
  .replace(/\$\{issueTitle}/g, ctx.issueTitle)
  .replace(/\$\{issueUrl}/g, ctx.issueUrl)
  .replace(/\$\{issueNumber}/g, ctx.issueNumber)
  .replace(/\$\{branchName}/g, ctx.branchName)
  .replace(/\$\{date}/g, ctx.dateYYYYMMDD)
  .trim();
}

export function normalizeAll(input: NormalizeInputs): { branchName: string; commitMessage: string } {
  const normalizedTitle = normalizeTitle(input.title);

  const branchName: string = createBranchName(
      input.title,
      input.issueNumber,
      input.dateYYYYMMDD,
      input.branchPrefix,
      input.maxBranchLength,
  );

  const commitMessage: string = renderCommitMessage(input.commitTemplate, {
    issueTitle: normalizedTitle, // 정규화된 제목 사용
    issueUrl: input.issueUrl,
    issueNumber: input.issueNumber,
    branchName,
    dateYYYYMMDD: input.dateYYYYMMDD,
  });

  return { branchName, commitMessage };
}
