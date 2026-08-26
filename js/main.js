(function () {
  "use strict";

  // ---- Scroll progress rail -------------------------------------------
  var dots = document.querySelectorAll(".progress-dot");
  var sections = document.querySelectorAll("[data-progress-section]");

  if (dots.length && sections.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var index = entry.target.getAttribute("data-progress-section");
          dots.forEach(function (dot) {
            dot.classList.toggle("is-active", dot.getAttribute("data-dot") === index);
          });
        });
      },
      { threshold: 0.5 }
    );
    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  // ---- Email capture forms ---------------------------------------------
  // No ESP (Klaviyo / Mailchimp) has been selected yet — see README "Open
  // Items for the Client". ENDPOINT is left blank on purpose; until it's
  // set, submissions are validated and given a success state but not sent
  // anywhere. Point ENDPOINT at the ESP's signup endpoint once chosen.
  var ENDPOINT = "";

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  document.querySelectorAll(".email-form").forEach(function (form) {
    var input = form.querySelector("input[type=email]");
    var button = form.querySelector("button[type=submit]");
    var message = form.querySelector(".form-message");
    var source = form.getAttribute("data-source") || "unknown";

    function setMessage(text, isError) {
      message.textContent = text;
      message.classList.toggle("is-error", !!isError);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var email = input.value.trim();
      if (!EMAIL_RE.test(email)) {
        setMessage("enter a valid email address.", true);
        input.focus();
        return;
      }

      button.disabled = true;
      var originalLabel = button.getAttribute("aria-label");
      button.setAttribute("aria-label", "submitting");
      setMessage("submitting…", false);

      var submit = ENDPOINT
        ? fetch(ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, source: source }),
          }).then(function (res) {
            if (!res.ok) throw new Error("Request failed");
          })
        : Promise.resolve();

      submit
        .then(function () {
          setMessage("you're on the list. welcome to the pack.", false);
          form.reset();
        })
        .catch(function () {
          setMessage("something went wrong. please try again.", true);
        })
        .finally(function () {
          button.disabled = false;
          button.setAttribute("aria-label", originalLabel);
        });
    });
  });
})();
