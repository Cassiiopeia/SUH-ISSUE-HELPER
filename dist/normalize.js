"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractIssueNumber = extractIssueNumber;
exports.extractIssueTitle = extractIssueTitle;
exports.formatDateYYYYMMDD = formatDateYYYYMMDD;
exports.createBranchName = createBranchName;
exports.renderCommitMessage = renderCommitMessage;
exports.normalizeAll = normalizeAll;
/**
 * Java 로직을 TypeScript로 이식한 초기 버전:
 * - [태그] 제거 → 이모지/제어문자 제거
 * - 제목에서 한글/영문/숫자만 남기고 나머지는 '_' 치환
 * - 브랜치: YYYYMMDD_#이슈번호_정규화제목  (prefix는 옵션)
 * - 커밋: 템플릿 치환
 */
function extractIssueNumber(issueUrl) {
    const trimmed = issueUrl.trim().replace(/\/+$/, "");
    const last = trimmed.split("/").pop();
    return last ?? "";
}
function extractIssueTitle(rawTitle) {
    let title = rawTitle.replace(/\[.*?]/g, "").trim();
    // 이모지/제어문자 제거
    title = title.replace(/\p{So}|\p{C}|\uFE0F|\u200D/gu, "").trim();
    return title.length > 0 ? title : rawTitle.trim();
}
function formatDateYYYYMMDD(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
}
function createBranchName(issueTitle, issueNumber, dateYYYYMMDD, branchPrefix, maxBranchLength) {
    const formattedTitle = issueTitle.replace(/[^a-zA-Z0-9가-힣]/gu, "_");
    const base = `${dateYYYYMMDD}_#${issueNumber}_${formattedTitle}`;
    const limitedBase = maxBranchLength > 0 ? base.slice(0, maxBranchLength) : base;
    return `${branchPrefix}${limitedBase}`;
}
function renderCommitMessage(template, ctx) {
    return template
        .replace(/\$\{issueTitle}/g, ctx.issueTitle)
        .replace(/\$\{issueUrl}/g, ctx.issueUrl)
        .replace(/\$\{issueNumber}/g, ctx.issueNumber)
        .replace(/\$\{branchName}/g, ctx.branchName)
        .replace(/\$\{date}/g, ctx.dateYYYYMMDD)
        .trim();
}
function normalizeAll(input) {
    const branchName = createBranchName(input.title, input.issueNumber, input.dateYYYYMMDD, input.branchPrefix, input.maxBranchLength);
    const commitMessage = renderCommitMessage(input.commitTemplate, {
        issueTitle: input.title,
        issueUrl: input.issueUrl,
        issueNumber: input.issueNumber,
        branchName,
        dateYYYYMMDD: input.dateYYYYMMDD,
    });
    return { branchName, commitMessage };
}
//# sourceMappingURL=normalize.js.map