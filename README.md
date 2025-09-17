# GitHub Issue Comment Generator

GitHub Issue가 생성되거나 제목이 수정될 때 자동으로 브랜치명과 커밋 메시지를 생성하여 댓글로 추가하는 GitHub Action입니다.

## 특징

- 🌿 **브랜치명 자동 생성**: 날짜, 이슈번호, 정규화된 제목으로 브랜치명 생성
- 💬 **커밋 메시지 템플릿**: 커스터마이징 가능한 커밋 메시지 템플릿
- 🔄 **댓글 업데이트**: 이슈 제목 변경 시 자동으로 댓글 업데이트
- 🔒 **Private Repository 지원**: 사용자 토큰으로 Private Repository에서도 사용 가능
- 🎯 **한글/영문 지원**: 한글과 영문 이슈 제목 모두 지원

## 사용법

### 1. Workflow 파일 생성

`.github/workflows/issue-comment.yml` 파일을 생성합니다:

```yaml
name: Issue Branch & Commit Generator

on:
  issues:
    types: [opened, edited]

jobs:
  generate-comment:
    if: github.event.action == 'opened' || (github.event.action == 'edited' && github.event.changes.title)
    runs-on: ubuntu-latest
    steps:
      - name: Generate Branch & Commit Comment
        uses: Chuseok22/github-issue-commnet-generator@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          branch_prefix: "feat/"
          max_branch_length: 100
          commit_template: "${issueTitle} : feat : {변경 사항에 대한 설명} ${issueUrl}"
```

### 2. Private Repository에서 사용하기

Private Repository에서 사용하려면 Personal Access Token을 사용하세요:

1. GitHub에서 Personal Access Token 생성 (repo 권한 필요)
2. Repository Settings > Secrets에 토큰 추가 (예: `PERSONAL_TOKEN`)
3. Workflow에서 토큰 사용:

```yaml
- name: Generate Branch & Commit Comment
  uses: Chuseok22/github-issue-commnet-generator@v1
  with:
    token: ${{ secrets.PERSONAL_TOKEN }}
```

## 입력 옵션

| 입력값 | 설명 | 기본값 | 필수 |
|--------|------|--------|------|
| `token` | GitHub 토큰 (빈 값이면 GITHUB_TOKEN 자동 사용) | `""` | ❌ |
| `comment_marker` | 댓글 업데이트를 위한 마커 | `"<!-- Chuseok22 issue helper -->"` | ❌ |
| `branch_prefix` | 브랜치 접두사 (예: feat/) | `""` | ❌ |
| `max_branch_length` | 브랜치 기본 부분 최대 길이 (prefix 제외) | `"120"` | ❌ |
| `commit_template` | 커밋 메시지 템플릿 | `"${issueTitle} : feat : {변경 사항에 대한 설명} ${issueUrl}"` | ❌ |

## 출력값

| 출력값 | 설명 |
|--------|------|
| `branchName` | 생성된 브랜치명 |
| `commitMessage` | 생성된 커밋 메시지 |

## 템플릿 변수

커밋 메시지 템플릿에서 사용할 수 있는 변수들:

- `${issueTitle}`: 정규화된 이슈 제목
- `${issueUrl}`: 이슈 URL
- `${issueNumber}`: 이슈 번호
- `${branchName}`: 생성된 브랜치명
- `${date}`: 날짜 (YYYYMMDD 형식)

## 예시

### 이슈 제목: `[Bug] 로그인 페이지에서 비밀번호 입력 오류`

생성되는 결과:
- **브랜치명**: `feat/20250917_#123_로그인_페이지에서_비밀번호_입력_오류`
- **커밋 메시지**: `로그인 페이지에서 비밀번호 입력 오류 : feat : {변경 사항에 대한 설명} https://github.com/owner/repo/issues/123`

### 생성되는 댓글 예시

```
<!-- issue-normalizer -->
브랜치: `feat/20250917_#123_로그인_페이지에서_비밀번호_입력_오류`
커밋: `로그인 페이지에서 비밀번호 입력 오류 : feat : {변경 사항에 대한 설명} https://github.com/owner/repo/issues/123`
```

## 정규화 규칙

1. **태그 제거**: `[Bug]`, `[Feature]` 등의 태그 제거
2. **이모지 제거**: 이모지와 제어 문자 제거
3. **특수문자 처리**: 한글, 영문, 숫자를 제외한 문자는 `_`로 변경
4. **브랜치명 형식**: `{prefix}{YYYYMMDD}_#{issueNumber}_{normalizedTitle}`

## 라이선스

MIT License

## 기여하기

이슈나 개선사항이 있으시면 언제든지 Issue를 등록하거나 Pull Request를 보내주세요!
