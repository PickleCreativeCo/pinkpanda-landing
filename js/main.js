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

  // ---- Products carousel ---------------------------------------------
  var track = document.querySelector(".products__track");
  if (track) {
    var step = function () {
      var card = track.querySelector(".pcard");
      return card ? card.offsetWidth + 24 : 424;
    };
    var prev = document.querySelector(".products__arrow--prev");
    var next = document.querySelector(".products__arrow--next");
    var goTo = function (dir) {
      var s = step();
      var target = (Math.round(track.scrollLeft / s) + dir) * s;
      track.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
    };
    if (prev) prev.addEventListener("click", function () { goTo(-1); });
    if (next) next.addEventListener("click", function () { goTo(1); });

    // Prices and stock come from the live shop; if that fails the cards keep
    // their default (in stock, no price shown).
    var SHOP_URL = "https://pinkpandafitness.store";
    var money = function (pence) {
      var pounds = pence / 100;
      return "\u00a3" + (pounds % 1 === 0 ? pounds : pounds.toFixed(2));
    };
    var handles = ["cap", "bottle"];
    handles.forEach(function (handle) {
      fetch(SHOP_URL + "/products/" + handle + ".js")
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (product) {
          if (!product) return;
          product.variants.forEach(function (v) {
            var el = track.querySelector('[data-product="' + handle + '"][data-variant="' + v.title.toLowerCase() + '"]');
            if (!el) return;
            var price = el.querySelector(".pcard__price");
            var soon = !v.available;
            el.classList.toggle("pcard--soon", soon);
            if (soon) el.removeAttribute("href"); else el.setAttribute("href", SHOP_URL + "/");
            if (soon) {
              if (!el.querySelector(".pcard__badge")) {
                var badge = document.createElement("span");
                badge.className = "pcard__badge";
                badge.textContent = "coming soon";
                el.querySelector(".pcard__media").prepend(badge);
              }
              price.textContent = "coming soon";
            } else {
              var badgeEl = el.querySelector(".pcard__badge");
              if (badgeEl) badgeEl.remove();
              price.textContent = money(v.price);
            }
          });
        })
        .catch(function () {});
    });
  }

  // ---- No one-word last lines -----------------------------------------
  // Joins the last two words of each text block with a non-breaking space
  // so a block can never end on a lone word. Copy is unchanged.
  document.querySelectorAll("h1, h2, p, .bamboo__fact-label").forEach(function (el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var last = null;
    while (walker.nextNode()) {
      if (walker.currentNode.nodeValue.trim()) last = walker.currentNode;
    }
    if (!last) return;
    last.nodeValue = last.nodeValue.replace(/(\S+)\s+(\S+\s*)$/, "$1 $2");
  });

  // ---- Email capture forms ---------------------------------------------
  // Submissions go to Formspree, which forwards each one as an email to
  // pioneers@pinkpandafitness.com. No custom backend involved. If a proper
  // ESP (Klaviyo / Mailchimp) is set up later - see README "Open Items for
  // the Client" - swap this endpoint out for the ESP's signup endpoint.
  var ENDPOINT = "https://formspree.io/f/xwlkvgnl";

  var SOURCE_LABELS = {
    hero: "Hero waitlist",
    pioneer: "Pioneer Programme",
  };

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
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json", // ask Formspree for a JSON response instead of a redirect
            },
            body: JSON.stringify({
              email: email,
              source: source,
              _subject: "Pink Panda pioneer signup - " + (SOURCE_LABELS[source] || source),
            }),
          }).then(function (res) {
            if (!res.ok) throw new Error("Request failed");
          })
        : Promise.resolve();

      submit
        .then(function () {
          setMessage("you're a pioneer. welcome to the community.", false);
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
