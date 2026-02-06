// Feature Cards Animation
const cards = document.querySelectorAll(".feature-card");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      entry.target.style.transitionDelay = `${index * 0.2}s`;
    }
  });
});

cards.forEach((card) => observer.observe(card));


// Upgrade Section Animation
const upgradeSection = document.querySelector(".upgrade-section");

const upgradeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show-upgrade");
    }
  });
});

if (upgradeSection) {
  upgradeObserver.observe(upgradeSection);
}
