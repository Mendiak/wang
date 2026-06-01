document.documentElement.classList.add("is-ready");

document.addEventListener("DOMContentLoaded", () => {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
});

const sectionLinks = document.querySelectorAll('.primary-links a[href^="#"]');
const sections = document.querySelectorAll(".content-section");
const stage = document.querySelector(".sections-stage");
let currentSectionId = "";

function showSection(sectionId) {
  document.body.classList.add("is-compact");

  if (sectionId === currentSectionId) {
    return;
  }

  currentSectionId = sectionId;

  sections.forEach((section) => {
    section.classList.toggle("active-section", section.id === sectionId);
  });

  sectionLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${sectionId}`);
  });

  if (stage) {
    stage.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function showLanding() {
  currentSectionId = "";
  document.body.classList.remove("is-compact");
  sections.forEach((section) => {
    section.classList.remove("active-section");
  });
  sectionLinks.forEach((link) => {
    link.classList.remove("is-active");
  });
}

sectionLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const sectionId = link.getAttribute("href").slice(1);
    showSection(sectionId);
    history.replaceState(null, "", `#${sectionId}`);
  });
});

const initialSection = window.location.hash.replace("#", "") || "bio";
if (window.location.hash && document.getElementById(initialSection)) {
  showSection(initialSection);
} else {
  showLanding();
}

window.addEventListener("hashchange", () => {
  if (!window.location.hash) {
    showLanding();
    return;
  }

  const sectionId = window.location.hash.replace("#", "");
  if (document.getElementById(sectionId)) {
    showSection(sectionId);
  }
});

window.setInterval(() => {
  if (!window.location.hash) {
    if (document.body.classList.contains("is-compact")) {
      showLanding();
    }
    return;
  }

  const sectionId = window.location.hash.replace("#", "");
  if (document.getElementById(sectionId) && sectionId !== currentSectionId) {
    showSection(sectionId);
  }
}, 250);
