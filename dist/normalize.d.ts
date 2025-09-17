import { NormalizeInputs } from "./types";
/**
 * Java 로직을 TypeScript로 이식한 초기 버전:
 * - [태그] 제거 → 이모지/제어문자 제거
 * - 제목에서 한글/영문/숫자만 남기고 나머지는 '_' 치환
 * - 브랜치: YYYYMMDD_#이슈번호_정규화제목  (prefix는 옵션)
 * - 커밋: 템플릿 치환
 */
export declare function extractIssueNumber(issueUrl: string): string;
export declare function extractIssueTitle(rawTitle: string): string;
export declare function formatDateYYYYMMDD(d: Date): string;
export declare function createBranchName(issueTitle: string, issueNumber: string, dateYYYYMMDD: string, branchPrefix: string, maxBranchLength: number): string;
export declare function renderCommitMessage(template: string, ctx: {
    issueTitle: string;
    issueUrl: string;
    issueNumber: string;
    branchName: string;
    dateYYYYMMDD: string;
}): string;
export declare function normalizeAll(input: NormalizeInputs): {
    branchName: string;
    commitMessage: string;
};
