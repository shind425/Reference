(() => {
  // 이 별도 프로젝트는 기존 미리보기와 저장 공간을 공유하지 않습니다.
  const projectStorageKey = "portfolio-4categories-projects-v1";
  const categoryStorageKey = "portfolio-4categories-categories-v1";
  const fallbackCategories = ["VIDEO", "RECORDING", "SR/PA", "SYSTEM INTEGRATION"];
  const legacyCategories = { SOUND: "RECORDING", LIVE: "SR/PA" };
  const normaliseCategory = value => String(value || "").trim();
  const normaliseImages = project => {
    const source = Array.isArray(project.images) ? project.images : [project.image];
    return source.map(value => String(value || "").trim()).filter(Boolean);
  };
  const migrateProject = project => {
    const { image, ...rest } = project;
    return {
      ...rest,
      category: legacyCategories[normaliseCategory(project.category).toUpperCase()] || normaliseCategory(project.category) || "VIDEO",
      images: normaliseImages(project)
    };
  };
  const readStorage = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } };
  let projects = readStorage(projectStorageKey, window.PORTFOLIO_PROJECTS || []).map(migrateProject);
  const rawSavedCategories = readStorage(categoryStorageKey, window.PORTFOLIO_CATEGORIES || fallbackCategories);
  const hadLegacyCategories = rawSavedCategories.some(category => ["SOUND", "LIVE"].includes(normaliseCategory(category).toUpperCase()));
  const savedCategories = rawSavedCategories.map(category => legacyCategories[normaliseCategory(category).toUpperCase()] || normaliseCategory(category));
  // 이전 버전에서 저장된 분야를 새 네 분야로 한 번만 보완합니다.
  let categories = [...new Set([...(hadLegacyCategories ? fallbackCategories : []), ...savedCategories, ...projects.map(project => project.category)].map(normaliseCategory).filter(Boolean))];
  const list = document.querySelector("#editor-list");
  const categoryList = document.querySelector("#category-list");
  const status = document.querySelector("#save-status");
  const esc = (value = "") => String(value).replace(/[&<>\'\"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"})[char]);
  const blank = () => ({ id:`project-${Date.now()}`, title:"NEW PROJECT", client:"Client / Artist", category:categories[0] || "VIDEO", year:String(new Date().getFullYear()), role:"", images:[], imageTone:"gray", youtube:"", description:"", credits:[] });
  const field = (label, key, value, options = null, wide = false, hint = "", placeholder = "") => `<label class="${wide ? "wide" : ""}">${label}${options ? `<select data-key="${key}">${options.map(item => `<option value="${esc(item)}" ${item === value ? "selected" : ""}>${esc(item)}</option>`).join("")}</select>` : `<input data-key="${key}" value="${esc(value)}" placeholder="${esc(placeholder)}" />`}${hint ? `<small>${esc(hint)}</small>` : ""}</label>`;
  const setStatus = (message, type = "") => { status.textContent = message; status.className = type; };
  const renderCategories = () => {
    categoryList.innerHTML = categories.map(category => {
      const used = projects.some(project => project.category === category);
      return `<span class="category-chip">${esc(category)} <button type="button" data-remove-category="${esc(category)}" aria-label="${esc(category)} 분야 삭제"${used ? " disabled title=\"사용 중인 분야입니다\"" : ""}>×</button></span>`;
    }).join("");
    categoryList.querySelectorAll("[data-remove-category]").forEach(button => button.addEventListener("click", () => {
      const category = button.dataset.removeCategory;
      if (projects.some(project => project.category === category)) { setStatus("사용 중인 분야입니다. 해당 작업의 분야를 먼저 바꾸세요.", "error"); return; }
      categories = categories.filter(item => item !== category);
      renderCategories(); render();
    }));
  };
  const render = () => {
    list.innerHTML = projects.map((project,index) => `<details class="editor-card" ${index === 0 ? "open" : ""}><summary><span class="editor-card-number">${String(index+1).padStart(2,"0")}</span><span class="editor-card-title">${esc(project.title || "UNTITLED")}</span><span class="editor-card-end"><span class="editor-card-category">${esc(project.category || "VIDEO")}</span><span class="project-order-actions"><button type="button" data-move="-1" data-index="${index}" aria-label="${esc(project.title || "UNTITLED")} 위로 이동" ${index === 0 ? "disabled" : ""}>↑ 위로</button><button type="button" data-move="1" data-index="${index}" aria-label="${esc(project.title || "UNTITLED")} 아래로 이동" ${index === projects.length - 1 ? "disabled" : ""}>↓ 아래로</button></span><span aria-hidden="true">+</span></span></summary><div class="form-grid">
      ${field("작업 ID","id",project.id,null,false,"상세 페이지 주소에 쓰입니다. 만든 뒤에는 보통 수정하지 않습니다.")}${field("분야","category",project.category,categories)}
      ${field("작업 제목","title",project.title)}${field("클라이언트 / 아티스트","client",project.client)}
      ${field("연도","year",project.year)}${field("나의 역할","role",project.role)}
      <label class="wide">작업 이미지 파일명 (한 줄에 하나씩)<textarea data-key="images" placeholder="concert-cover.jpg&#10;concert-stage.jpg&#10;concert-detail.jpg">${esc((project.images || []).join("\n"))}</textarea><small>이미지 파일을 assets 폴더에 넣고 파일명을 한 줄에 하나씩 입력하세요. 첫 번째 이미지가 목록의 대표 이미지가 됩니다. 외부 이미지 주소도 사용할 수 있습니다.</small></label>
      ${field("이미지가 없을 때 쓰는 색상","imageTone",project.imageTone,["gray","violet","orange","blue","red","green"])}${field("YouTube 영상 링크","youtube",project.youtube)}
      <label class="wide">작업 설명<textarea data-key="description">${esc(project.description)}</textarea></label>
      <label class="wide">크레딧 (한 줄에 하나씩)<textarea data-key="credits">${esc((project.credits || []).join("\n"))}</textarea></label>
    </div><button class="remove-project" data-remove="${index}">이 작업 삭제</button></details>`).join("");
    list.querySelectorAll("[data-key]").forEach(input => {
      const update = () => {
        const index = [...list.querySelectorAll(".editor-card")].indexOf(input.closest(".editor-card"));
        const key = input.dataset.key;
        projects[index][key] = ["credits", "images"].includes(key) ? input.value.split("\n").map(item => item.trim()).filter(Boolean) : input.value;
        input.closest("details").querySelector(".editor-card-title").textContent = projects[index].title || "UNTITLED";
        if (key === "category") input.closest("details").querySelector(".editor-card-category").textContent = projects[index].category || "VIDEO";
        if (key === "category") renderCategories();
      };
      input.addEventListener("input", update); input.addEventListener("change", update);
    });
    list.querySelectorAll("[data-move]").forEach(button => button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      const index = Number(button.dataset.index);
      const nextIndex = index + Number(button.dataset.move);
      if (nextIndex < 0 || nextIndex >= projects.length) return;
      [projects[index], projects[nextIndex]] = [projects[nextIndex], projects[index]];
      renderCategories();
      render();
      const movedCard = list.querySelectorAll(".editor-card")[nextIndex];
      if (movedCard) {
        movedCard.open = true;
        movedCard.scrollIntoView({ block:"center", behavior:"smooth" });
      }
      setStatus("프로젝트 순서를 바꿨습니다. 미리보기 저장 또는 GitHub 저장을 누르면 반영됩니다.", "success");
    }));
    list.querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", () => { projects.splice(Number(button.dataset.remove),1); renderCategories(); render(); }));
  };
  const saveLocal = () => { localStorage.setItem(projectStorageKey, JSON.stringify(projects)); localStorage.setItem(categoryStorageKey, JSON.stringify(categories)); setStatus("이 기기의 미리보기에 저장했습니다. 포트폴리오 홈을 새로고침해 확인하세요.", "success"); };
  const fileText = () => `/* 이 파일은 admin.html에서 생성되었습니다. */\nwindow.PORTFOLIO_CATEGORIES = ${JSON.stringify(categories, null, 2)};\n\nwindow.PORTFOLIO_PROJECTS = ${JSON.stringify(projects, null, 2)};\n`;
  const download = () => { const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([JSON.stringify({ categories, projects },null,2)],{type:"application/json"})); link.download = "portfolio-backup.json"; link.click(); URL.revokeObjectURL(link.href); };
  document.querySelector("#add-category-form").addEventListener("submit", event => {
    event.preventDefault();
    const input = document.querySelector("#new-category"); const category = normaliseCategory(input.value);
    if (!category) return;
    if (category.toUpperCase() === "ALL" || categories.some(item => item.toLowerCase() === category.toLowerCase())) { setStatus("이미 있는 분야이거나 사용할 수 없는 이름입니다.", "error"); return; }
    categories.push(category); input.value = ""; renderCategories(); render(); setStatus(`“${category}” 분야를 추가했습니다. 미리보기 저장 또는 GitHub 저장을 누르면 반영됩니다.`, "success");
  });
  document.querySelector("#add-project").addEventListener("click", () => { projects.unshift(blank()); renderCategories(); render(); window.scrollTo({ top:list.offsetTop - 10, behavior:"smooth" }); });
  document.querySelector("#preview-save").addEventListener("click", saveLocal);
  document.querySelector("#download-json").addEventListener("click", download);
  document.querySelector("#import-json").addEventListener("change", async event => { const file = event.target.files[0]; if (!file) return; try { const imported = JSON.parse(await file.text()); projects = (Array.isArray(imported) ? imported : imported.projects).map(migrateProject); categories = [...new Set([...(Array.isArray(imported) ? [] : imported.categories || []), ...projects.map(project => project.category)].map(normaliseCategory).filter(Boolean))]; if (!categories.length) categories = [...fallbackCategories]; renderCategories(); render(); setStatus("백업을 불러왔습니다. 확인 후 저장하세요.", "success"); } catch { setStatus("올바른 백업 JSON 파일이 아닙니다.", "error"); } });
  document.querySelector("#github-save").addEventListener("click", async () => {
    const owner = document.querySelector("#gh-owner").value.trim(); const repo = document.querySelector("#gh-repo").value.trim(); const branch = document.querySelector("#gh-branch").value.trim() || "main"; const token = document.querySelector("#gh-token").value.trim(); const button = document.querySelector("#github-save");
    if (!owner || !repo || !token) { setStatus("GitHub 사용자명, 저장소 이름, 토큰을 모두 입력하세요.", "error"); return; }
    if (projects.some(p => !/^[a-z0-9-]+$/i.test(p.id))) { setStatus("작업 ID에는 영문, 숫자, 하이픈(-)만 사용하세요.", "error"); return; }
    if (new Set(projects.map(p => p.id.toLowerCase())).size !== projects.length) { setStatus("작업 ID가 중복되었습니다. 각 작업마다 서로 다른 ID를 사용하세요.", "error"); return; }
    const endpoint = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/data/projects.js`;
    const headers = { Accept:"application/vnd.github+json", Authorization:`Bearer ${token}`, "X-GitHub-Api-Version":"2022-11-28" };
    button.disabled = true; setStatus("GitHub에 저장 중입니다…");
    try {
      const current = await fetch(`${endpoint}?ref=${encodeURIComponent(branch)}`, { headers });
      if (!current.ok) throw new Error(current.status === 404 ? "저장소·브랜치·토큰 권한을 확인하세요." : `GitHub 오류 (${current.status})`);
      const { sha } = await current.json();
      const content = btoa(unescape(encodeURIComponent(fileText())));
      const saved = await fetch(endpoint, { method:"PUT", headers:{...headers,"Content-Type":"application/json"}, body:JSON.stringify({ message:"Update portfolio content", content, sha, branch }) });
      if (!saved.ok) { const body = await saved.json().catch(()=>({})); throw new Error(body.message || `GitHub 오류 (${saved.status})`); }
      localStorage.setItem(projectStorageKey, JSON.stringify(projects)); localStorage.setItem(categoryStorageKey, JSON.stringify(categories)); document.querySelector("#gh-token").value = "";
      setStatus("저장 완료. GitHub Pages 반영에는 보통 1–2분 정도 걸립니다.", "success");
    } catch (error) { setStatus(`저장하지 못했습니다: ${error.message}`, "error"); }
    finally { button.disabled = false; }
  });
  renderCategories(); render();
})();
