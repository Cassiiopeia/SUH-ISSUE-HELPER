export type IssuesEventPayload = {
    action: string;
    issue: {
        number: number;
        title: string;
        html_url: string;
    };
    repository: {
        name: string;
        owner: {
            login: string;
        };
    };
    changes?: {
        title?: {
            from: string;
        };
    };
};
export type NormalizeInputs = {
    title: string;
    issueUrl: string;
    issueNumber: string;
    dateYYYYMMDD: string;
    branchPrefix: string;
    maxBranchLength: number;
    commitTemplate: string;
};
