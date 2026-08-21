(() => {
  "use strict";

  const PROJECT_STORAGE_KEY = "portfolio-4categories-projects-v1";
  const CATEGORY_STORAGE_KEY = "portfolio-4categories-categories-v1";
  const FALLBACK_CATEGORIES = [
    "VIDEO",
    "RECORDING",
    "SR/PA",
    "SYSTEM INTEGRATION"
  ];
  const LEGACY_CATEGORIES = {
    SOUND: "RECORDING",
    LIVE: "SR/PA"
  };

  const toText = value => String(value ?? "").trim();

  const escapeHTML = value =>
    String(value ?? "").replace(/[&<>'"]/g, character => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
      };

      return entities[character];
    });

  const normaliseCategory = value => {
    const category = toText(value);
    return LEGACY_CATEGORIES[category.toUpperCase()] || category;
  };

  const normaliseImages = project => {
    const source = Array.isArray(project?.images)
      ? project.images
      : [project?.image];

    return [...new Set(source.map(toText).filter(Boolean))];
  };

  const normaliseCredits = credits => {
    if (Array.isArray(credits)) {
      return credits.map(toText).filter(Boolean);
    }

    return toText(credits)
      .split("\n")
      .map(toText)
      .filter(Boolean);
  };

  const normaliseProject = source => {
    const project =
      source && typeof source === "object" ? source : {};
    const category =
      normaliseCategory(project.category) || FALLBACK_CATEGORIES[0];

    return {
      id: toText(project.id),
      title: toText(project.title) || "UNTITLED",
      client: toText(project.client),
      category,
      year: toText(project.year),
      role: toText(project.role),
      images: normaliseImages(project),
      imageTone: toText(project.imageTone) || "gray",
      youtube: toText(project.youtube),
      description: toText(project.description),
      credits: normaliseCredits(project.credits)
    };
  };

  const readStorage = (key, fallback) => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return fallback;

      const parsed = JSON.parse(stored);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  };

  const defaultProjects = (
    Array.isArray(window.PORTFOLIO_PROJECTS)
      ? window.PORTFOLIO_PROJECTS
      : []
  ).map(normaliseProject);

  const storedProjects = readStorage(
    PROJECT_STORAGE_KEY,
    defaultProjects
  );

  const projects = (
    Array.isArray(storedProjects) ? storedProjects : defaultProjects
  ).map(normaliseProject);

  const defaultCategories = Array.isArray(
    window.PORTFOLIO_CATEGORIES
  )
    ? window.PORTFOLIO_CATEGORIES
    : FALLBACK_CATEGORIES;

  const storedCategories = readStorage(
    CATEGORY_STORAGE_KEY,
    defaultCategories
  );

  const rawCategories = Array.isArray(storedCategories)
    ? storedCategories
    : defaultCategories;

  const hadLegacyCategory = rawCategories.some(category =>
    Object.keys(LEGACY_CATEGORIES).includes(
      toText(category).toUpperCase()
    )
  );

  const categories = [
    ...new Set(
      [
        ...(hadLegacyCategory ? FALLBACK_CATEGORIES : []),
        ...rawCategories,
        ...projects.map(project => project.category)
      ]
        .map(normaliseCategory)
        .filter(Boolean)
    )
  ];

  const imageSource = value => {
    const image = toText(value);
    if (!image) return "";

    if (
      /^(?:https?:)?\/\//i.test(image) ||
      /^(?:data|blob):/i.test(image)
    ) {
      return image;
    }

    if (image.startsWith("/assets/")) return `.${image}`;
    if (image.startsWith("./") || image.startsWith("../")) {
      return image;
    }
    if (image.startsWith("assets/")) return `./${image}`;
    if (!image.includes("/")) return `./assets/${image}`;

    return image;
  };

  const youtubeId = value => {
    const match = toText(value).match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([\w-]{11})/
    );

    return match ? match[1] : "";
  };

  const posterMarkup = (project, hidden = false) => {
    const words = escapeHTML(project.title)
      .split(/\s+/)
      .join("<br>");

    return `
      <span
        class="generated-poster tone-${escapeHTML(
          project.imageTone
        )}"
        ${hidden ? "hidden" : ""}
        aria-hidden="true"
      >
        <span>${words}</span>
        <i></i>
      </span>
    `;
  };

  const cardImageMarkup = project => {
    const source = imageSource(project.images[0]);

    if (!source) return posterMarkup(project);

    return `
      <img
        class="js-fallback-image"
        src="${escapeHTML(source)}"
        alt="${escapeHTML(project.title)}"
        loading="lazy"
        decoding="async"
      >
      ${posterMarkup(project, true)}
    `;
  };

  const projectCardMarkup = project => `
    <a
      class="project-card"
      href="./project.html?id=${encodeURIComponent(project.id)}"
      aria-label="${escapeHTML(project.title)} 상세 보기"
    >
      <div class="project-image">
        ${cardImageMarkup(project)}
        <span class="view-badge" aria-hidden="true">
          VIEW
          <b>↗</b>
        </span>
      </div>

      <div class="project-meta">
        <span>
          ${escapeHTML(project.category)} /
          ${escapeHTML(project.year)}
        </span>
        <span>${escapeHTML(project.role)}</span>
      </div>

      <h3>${escapeHTML(project.title)}</h3>
      <p>${escapeHTML(project.client)}</p>
    </a>
  `;

  const galleryItemMarkup = (project, image, index) => {
    const source = imageSource(image);
    const alt = `${project.title} 작업 이미지 ${index + 1}`;

    return `
      <figure class="project-gallery-item">
        <button
          class="gallery-open"
          type="button"
          data-gallery-index="${index}"
          aria-label="${escapeHTML(alt)} 크게 보기"
        >
          <img
            class="js-fallback-image"
            src="${escapeHTML(source)}"
            alt="${escapeHTML(alt)}"
            loading="${index === 0 ? "eager" : "lazy"}"
            decoding="async"
          >
          ${posterMarkup(project, true)}
          <span class="zoom-label" aria-hidden="true">확대</span>
        </button>
      </figure>
    `;
  };

  const bindImageFallbacks = root => {
    root.querySelectorAll(".js-fallback-image").forEach(image => {
      const showFallback = () => {
        image.hidden = true;

        const fallback = image.nextElementSibling;
        if (fallback) fallback.hidden = false;

        const openButton = image.closest(".gallery-open");
        if (openButton) {
          openButton.disabled = true;
          openButton.removeAttribute("data-gallery-index");
        }
      };

      image.addEventListener("error", showFallback, { once: true });

      if (image.complete && image.naturalWidth === 0) {
        showFallback();
      }
    });
  };

  const setCurrentYear = () => {
    document.querySelectorAll("#year").forEach(element => {
      element.textContent = String(new Date().getFullYear());
    });
  };

  const renderProjectGrid = () => {
    const grid = document.querySelector("#project-grid");
    if (!grid) return;

    const count = document.querySelector("#work-count");
    const filters = document.querySelector(".filters");

    const render = selectedCategory => {
      const selected =
        selectedCategory === "ALL"
          ? projects
          : projects.filter(
              project => project.category === selectedCategory
            );

      grid.innerHTML = selected.map(projectCardMarkup).join("");
      bindImageFallbacks(grid);

      if (count) {
        count.textContent = `(${String(selected.length).padStart(
          2,
          "0"
        )})`;
      }
    };

    if (filters) {
      filters.innerHTML = ["ALL", ...categories]
        .map(
          (category, index) => `
            <button
              class="filter${index === 0 ? " active" : ""}"
              data-filter="${escapeHTML(category)}"
              type="button"
              aria-pressed="${index === 0 ? "true" : "false"}"
            >
              ${escapeHTML(category)}
            </button>
          `
        )
        .join("");

      filters.addEventListener("click", event => {
        const button = event.target.closest(".filter");
        if (!button || !filters.contains(button)) return;

        filters.querySelectorAll(".filter").forEach(item => {
          const active = item === button;
          item.classList.toggle("active", active);
          item.setAttribute("aria-pressed", String(active));
        });

        render(button.dataset.filter || "ALL");
      });
    }

    render("ALL");
  };

  const lightboxMarkup = () => `
    <div
      class="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="작업 이미지 크게 보기"
      hidden
    >
      <button
        class="lightbox-close"
        type="button"
        aria-label="크게 보기 닫기"
      >×</button>
      <button
        class="lightbox-nav lightbox-prev"
        type="button"
        aria-label="이전 이미지"
      >←</button>
      <div class="lightbox-stage">
        <img class="lightbox-image" src="" alt="">
        <p class="lightbox-error" hidden>
          이미지를 불러올 수 없습니다.
        </p>
      </div>
      <button
        class="lightbox-nav lightbox-next"
        type="button"
        aria-label="다음 이미지"
      >→</button>
      <p class="lightbox-count" aria-live="polite"></p>
    </div>
  `;

  const initialiseLightbox = (detail, project) => {
    if (!project.images.length) return;

    document.body.insertAdjacentHTML("beforeend", lightboxMarkup());

    const lightbox = document.querySelector(".lightbox");
    const lightboxImage = lightbox.querySelector(".lightbox-image");
    const errorMessage = lightbox.querySelector(".lightbox-error");
    const closeButton = lightbox.querySelector(".lightbox-close");
    const previousButton = lightbox.querySelector(".lightbox-prev");
    const nextButton = lightbox.querySelector(".lightbox-next");
    const count = lightbox.querySelector(".lightbox-count");
    let currentIndex = 0;
    let returnFocus = null;

    const showImage = index => {
      currentIndex =
        (index + project.images.length) % project.images.length;

      const source = imageSource(project.images[currentIndex]);
      lightboxImage.hidden = false;
      errorMessage.hidden = true;
      lightboxImage.alt = `${project.title} 작업 이미지 ${
        currentIndex + 1
      }`;
      lightboxImage.src = source;
      count.textContent = `${currentIndex + 1} / ${
        project.images.length
      }`;
    };

    const open = index => {
      returnFocus = document.activeElement;
      lightbox.hidden = false;
      document.body.classList.add("lightbox-open");
      showImage(index);
      closeButton.focus();
    };

    const close = () => {
      lightbox.hidden = true;
      document.body.classList.remove("lightbox-open");
      lightboxImage.removeAttribute("src");

      if (returnFocus instanceof HTMLElement) {
        returnFocus.focus();
      }
    };

    lightboxImage.addEventListener("error", () => {
      lightboxImage.hidden = true;
      errorMessage.hidden = false;
    });

    detail.addEventListener("click", event => {
      const button = event.target.closest(".gallery-open");
      if (!button || button.disabled) return;

      open(Number(button.dataset.galleryIndex));
    });

    closeButton.addEventListener("click", close);
    previousButton.addEventListener("click", () =>
      showImage(currentIndex - 1)
    );
    nextButton.addEventListener("click", () =>
      showImage(currentIndex + 1)
    );

    lightbox.addEventListener("click", event => {
      if (event.target === lightbox) close();
    });

    document.addEventListener("keydown", event => {
      if (lightbox.hidden) return;

      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") showImage(currentIndex - 1);
      if (event.key === "ArrowRight") showImage(currentIndex + 1);
    });

    const hasMultipleImages = project.images.length > 1;
    previousButton.hidden = !hasMultipleImages;
    nextButton.hidden = !hasMultipleImages;
  };

  const renderProjectDetail = () => {
    const detail = document.querySelector("#project-detail");
    if (!detail) return;

    const id = new URLSearchParams(window.location.search).get("id");
    const project = projects.find(item => item.id === id);

    if (!project) {
      detail.innerHTML = `
        <section class="not-found">
          <p>PROJECT NOT FOUND</p>
          <a class="outline-link" href="./index.html#work">
            BACK TO WORKS ↗
          </a>
        </section>
      `;
      return;
    }

    document.title = `${project.title} — YOUR NAME`;

    const videoId = youtubeId(project.youtube);
    const videoMarkup = videoId
      ? `
        <div class="video-frame">
          <iframe
            src="https://www.youtube-nocookie.com/embed/${videoId}"
            title="${escapeHTML(project.title)}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      `
      : "";

    const galleryMarkup = project.images.length
      ? `
        <div class="project-gallery">
          ${project.images
            .map((image, index) =>
              galleryItemMarkup(project, image, index)
            )
            .join("")}
        </div>
      `
      : "";

    const emptyMediaMarkup =
      !videoId && !project.images.length
        ? posterMarkup(project)
        : "";

    const creditsMarkup = project.credits
      .map(item => `<li>${escapeHTML(item)}</li>`)
      .join("");

    detail.innerHTML = `
      <section class="project-hero">
        <p class="eyebrow">
          ${escapeHTML(project.category)} /
          ${escapeHTML(project.year)}
        </p>
        <h1>${escapeHTML(project.title)}</h1>
        <p>${escapeHTML(project.client)}</p>
      </section>

      <section class="project-media">
        ${videoMarkup}
        ${galleryMarkup}
        ${emptyMediaMarkup}
      </section>

      <section class="project-info">
        <div>
          <p class="eyebrow">ROLE</p>
          <p class="role-text">${escapeHTML(project.role)}</p>
        </div>
        <div>
          <p class="eyebrow">ABOUT THE WORK</p>
          <p class="description">
            ${escapeHTML(project.description)}
          </p>
        </div>
        <div>
          <p class="eyebrow">CREDITS</p>
          <ul>${creditsMarkup}</ul>
        </div>
      </section>

      <div class="next-project">
        <a class="outline-link" href="./index.html#work">
          ALL WORKS <span>↗</span>
        </a>
      </div>
    `;

    bindImageFallbacks(detail);
    initialiseLightbox(detail, project);
  };

  setCurrentYear();
  renderProjectGrid();
  renderProjectDetail();
})();
