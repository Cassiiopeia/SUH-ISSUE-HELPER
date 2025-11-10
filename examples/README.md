# 📁 샘플 워크플로우 파일

이 폴더에는 다른 프로젝트에서 SUH Issue Helper를 사용하기 위한 샘플 워크플로우 파일이 포함되어 있습니다.

## 🚀 사용 방법

1. 원하는 샘플 파일을 선택합니다
2. 파일 내용을 복사합니다
3. 프로젝트의 `.github/workflows/` 폴더에 붙여넣습니다
4. 필요에 따라 설정을 수정합니다

## 📋 샘플 파일 목록

### 1. `issue-helper-basic.yml` - 기본 사용법

가장 간단한 설정으로, 기본 옵션만 사용합니다.

**특징:**
- GITHUB_TOKEN 자동 사용
- 기본 브랜치명 형식: `YYYYMMDD_#이슈번호_제목`
- 기본 커밋 메시지 템플릿 사용

**적합한 경우:**
- 빠르게 시작하고 싶을 때
- 기본 설정으로 충분할 때
- Public Repository

### 2. `issue-helper-custom.yml` - 커스터마이징 예시

모든 옵션을 커스터마이징한 예시입니다.

**특징:**
- 브랜치 prefix 설정 (`feat/`, `fix/` 등)
- 브랜치명 길이 제한
- 커스텀 커밋 메시지 템플릿
- 커스텀 댓글 마커

**적합한 경우:**
- 팀의 브랜치 네이밍 규칙이 있을 때
- 커밋 메시지 형식을 통일하고 싶을 때
- 여러 프로젝트에서 일관된 형식을 사용할 때

### 3. `issue-helper-private-repo.yml` - Private Repository용

Private Repository에서 사용하기 위한 설정입니다.

**특징:**
- Personal Access Token 사용
- Private Repository 권한 문제 해결

**적합한 경우:**
- Private Repository에서 사용할 때
- GITHUB_TOKEN 권한 오류가 발생할 때

**추가 설정 필요:**
1. GitHub에서 Personal Access Token 생성 (repo 권한 필요)
2. Repository Settings > Secrets and variables > Actions
3. New repository secret 클릭
4. Name: `PERSONAL_TOKEN`, Value: 생성한 토큰 입력

## ⚙️ 설정 옵션 상세

### 필수 설정

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `token` | GitHub 토큰 | `${{ secrets.GITHUB_TOKEN }}` |

### 선택 설정

| 옵션 | 설명 | 기본값 | 예시 |
|------|------|--------|------|
| `branch_prefix` | 브랜치 접두사 | `""` | `"feat/"`, `"fix/"` |
| `max_branch_length` | 브랜치명 최대 길이 (prefix 제외) | `"120"` | `"100"`, `"80"` |
| `commit_template` | 커밋 메시지 템플릿 | `"${issueTitle} : feat : {변경 사항에 대한 설명} ${issueUrl}"` | 아래 참조 |
| `comment_marker` | 댓글 마커 | `"<!-- 이 댓글은 SUH-ISSUE-HELPER 에 의해 자동으로 생성되었습니다. - https://github.com/Cassiiopeia/github-issue-helper -->"` | 커스텀 마커 |

### 템플릿 변수

커밋 메시지 템플릿에서 사용할 수 있는 변수:

- `${issueTitle}`: 이슈 제목 (이모지 및 태그 제거됨, 특수문자 유지)
- `${issueUrl}`: 이슈 URL
- `${issueNumber}`: 이슈 번호
- `${branchName}`: 생성된 브랜치명
- `${date}`: 날짜 (YYYYMMDD 형식)

**템플릿 예시:**

```yaml
# 기본 형식
commit_template: "${issueTitle} : feat : {변경 사항에 대한 설명} ${issueUrl}"

# 타입 포함
commit_template: "feat: ${issueTitle} #${issueNumber}"

# 날짜 포함
commit_template: "[${date}] ${issueTitle} - ${issueUrl}"

# 브랜치명 포함
commit_template: "${issueTitle} (${branchName}) ${issueUrl}"
```

## 🔧 권한 오류 해결

### "Resource not accessible by integration" 오류

**해결 방법 1: Workflow permissions 설정**
1. Repository Settings > Actions > General
2. "Workflow permissions"에서 **"Read and write permissions"** 선택
3. "Allow GitHub Actions to create and approve pull requests" 체크

**해결 방법 2: Personal Access Token 사용**
- `issue-helper-private-repo.yml` 샘플 파일 사용
- Personal Access Token을 Repository Secrets에 추가

## 📖 더 알아보기

자세한 사용법과 옵션 설명은 [메인 README](../README.md)를 참조하세요.

## 💡 팁

### 특정 라벨이 있는 이슈만 처리하기

```yaml
jobs:
  generate-comment:
    if: |
      (github.event.action == 'opened' || (github.event.action == 'edited' && github.event.changes.title)) &&
      contains(github.event.issue.labels.*.name, '자동화')
    runs-on: ubuntu-latest
    # ...
```

### 특정 브랜치에서만 실행하기

```yaml
on:
  issues:
    types: [opened, edited]
    branches:
      - main
      - develop
```

### 여러 템플릿 사용하기

라벨에 따라 다른 템플릿을 사용하려면 여러 job을 만들 수 있습니다:

```yaml
jobs:
  feature-comment:
    if: contains(github.event.issue.labels.*.name, 'feature')
    runs-on: ubuntu-latest
    steps:
      - uses: Cassiiopeia/github-issue-helper@main
        with:
          branch_prefix: "feat/"
          commit_template: "feat: ${issueTitle} ${issueUrl}"

  bugfix-comment:
    if: contains(github.event.issue.labels.*.name, 'bug')
    runs-on: ubuntu-latest
    steps:
      - uses: Cassiiopeia/github-issue-helper@main
        with:
          branch_prefix: "fix/"
          commit_template: "fix: ${issueTitle} ${issueUrl}"
```

## 🤝 기여하기

샘플 파일에 대한 개선 사항이나 새로운 사용 사례가 있다면 이슈나 PR을 보내주세요!

