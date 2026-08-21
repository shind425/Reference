# 영상·음향 포트폴리오 — 4개 분야 별도본

GitHub Pages에 올려 쓸 수 있는 정적 포트폴리오입니다. 기존 파일을 수정하지 않고 새로 만든 별도 프로젝트입니다. 별도 서버·유료 서비스가 필요 없고, 모바일에서도 동작합니다.

## VS Code에서 열기

1. 이 폴더를 VS Code에서 엽니다. `File > Open Folder`를 누르고 이 폴더를 선택합니다.
2. VS Code 확장 프로그램 **Live Server**를 설치합니다.
3. `index.html`을 열고 오른쪽 아래의 **Go Live**를 누르면 미리보기가 열립니다.

## 첫 설정

아래의 표시만 본인 정보로 바꾸면 됩니다.

- `index.html`, `project.html`, `admin.html`의 `YOUR NAME`
- `index.html`의 `hello@example.com`
- `data/projects.js`의 예시 작업

### 작업 이미지 여러 장 넣기

1. 이미지 파일들을 프로젝트의 `assets` 폴더 안에 넣습니다.
2. UPDATE 화면의 **작업 이미지 파일명**에 경로 없이 파일명을 한 줄에 하나씩 입력합니다.

   ```text
   concert-cover.jpg
   concert-stage.jpg
   concert-detail.jpg
   ```

3. 첫 번째 줄의 이미지가 메인 작업 목록의 대표 이미지가 됩니다. 상세 페이지에는 입력한 이미지가 모두 표시됩니다.
4. 이미지 파일을 추가한 뒤에는 VS Code에서 커밋하고 GitHub로 Push합니다.

UPDATE 화면의 GitHub 저장 버튼은 작업 정보가 들어 있는 `data/projects.js`만 갱신합니다. 이미지 파일 자체를 업로드하는 버튼은 아닙니다. 이미지가 없거나 파일명이 잘못되면 색상 포스터가 대신 표시됩니다.

파일명과 이미 웹에 공개된 이미지의 `https://...` 전체 주소를 함께 사용할 수도 있습니다.

기본 분야는 **VIDEO, RECORDING, SR/PA, SYSTEM INTEGRATION**입니다. UPDATE 화면의 **분야 관리**에서 원하는 분야를 추가할 수 있습니다. 사용 중인 분야를 삭제하려면 먼저 그 분야에 속한 작업들의 분야를 바꾸세요.

## 작업·유튜브 링크 업데이트

사이트의 우측 상단 **UPDATE**를 누르면 콘텐츠 관리 화면이 열립니다.

1. 작업을 추가하거나 수정합니다.
2. YouTube 영상 링크는 전체 주소를 그대로 붙여 넣습니다.
3. 작업 ID는 상세 페이지 주소(`project.html?id=작업-ID`)에 쓰이는 고유값입니다. 영문·숫자·하이픈만 사용하고, 만든 뒤에는 되도록 바꾸지 마세요.
4. 먼저 **이 기기에서 미리보기 저장**으로 확인할 수 있습니다.
5. 실제 사이트를 바꾸려면 아래 `GitHub에 저장하고 사이트 갱신`을 누릅니다.

이 방식은 토큰을 페이지나 저장소에 넣지 않습니다. 입력한 토큰은 현재 탭에서 GitHub에 저장할 때만 쓰고, 저장 후 입력칸을 비웁니다.

### GitHub 토큰은 한 번만 만들면 됩니다

GitHub에서 `Settings > Developer settings > Personal access tokens > Fine-grained tokens`로 이동해 토큰을 만드세요.

- **Repository access**: 이 포트폴리오 저장소만 선택
- **Permissions > Contents**: `Read and write`

토큰을 복사해 UPDATE 화면에 입력하면 됩니다. 토큰은 비밀번호처럼 보관하시고, 절대로 `data/projects.js`나 다른 파일에 적지 마세요.

## GitHub Pages로 공개

1. GitHub에서 빈 저장소를 만듭니다. 예: `portfolio`
2. VS Code의 Source Control에서 이 폴더를 Git 저장소로 초기화하고, GitHub에 Publish 합니다. 또는 GitHub Desktop으로 이 폴더를 올립니다.
3. GitHub 저장소의 `Settings > Pages`에서 **Deploy from a branch**, `main` / `/(root)`를 선택하고 저장합니다.
4. 잠시 뒤 표시되는 `https://사용자명.github.io/저장소이름/` 주소가 포트폴리오 주소입니다.

이후부터는 사이트의 UPDATE 화면만으로 작업 정보와 YouTube 링크를 갱신할 수 있습니다. GitHub Pages는 보통 1–2분 안에 새 내용을 반영합니다.
