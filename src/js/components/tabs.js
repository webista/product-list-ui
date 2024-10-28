/*!
 * tabs.js
 */
(function () {
  const tabsEls = document.querySelectorAll(".js-tabs");
  const isActive = "is-active";

  const tabs = (tabsEl) => {
    const tabsButtons = tabsEl.querySelectorAll(".js-tabs-button");

    function clear() {
      tabsButtons.forEach((tabButton) => {
        tabButton.classList.remove(isActive);
        tabButton.setAttribute("aria-selected", false);
      });
    }

    tabsButtons.forEach((tabButton) => {
      tabButton.addEventListener("click", (ev) => {
        ev.preventDefault();

        if (tabButton.classList.contains(isActive)) {
          return;
        }

        clear();
        tabButton.classList.add(isActive);
        tabButton.setAttribute("aria-selected", true);
      });
    });
  };

  if (tabsEls.length) {
    tabsEls.forEach((tabsEl) => {
      tabs(tabsEl);
    });
  }
})();
