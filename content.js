/*****************************************************************************
 *
 *  TweetIconBlind
 *
 *****************************************************************************/

const TweetBlindButtonClassName = "btn-blind-icon";
const DefaultIconURL =
  "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png";

//-----------------------------------------------------------------------------
// Hidden tweet management.
//-----------------------------------------------------------------------------
const blinder = new (class {
  #lsKey = "tweeticonblind_hiddentweets";

  constructor() {}

  allHiddenUsers() {
    return JSON.parse(localStorage.getItem(this.#lsKey) || "[]");
  }

  dump() {
    const hus = this.allHiddenUsers();
    console.log("----- Hidden User List -----");
    for (let i = 0; i < hus.length; ++i) {
      const hu = hus[i];
      console.log(`ID: ${hu.id} (${new Date(hu.ts).toISOString()})`);
    }
    console.log("-----------------------------");
  }

  toggleUserHideState(userId) {
    let hus = this.allHiddenUsers();

    if (hus.find(user => user.id === userId)) {
      console.log(`UserIcon#release ${userId}`);
      hus = hus.filter(user => user.id !== userId);
    } else {
      console.log(`UserIcon#hide: ${userId}`);
      hus.push({
        id: userId,
        ts: Date.now(), // Blind Timestamp
      });
    }

    localStorage.setItem(this.#lsKey, JSON.stringify(hus));
  }
})();

//-----------------------------------------------------------------------------
// Element maker
//-----------------------------------------------------------------------------
function makeIconBlindButton(listener) {
  const div = document.createElement("div");
  div.style.width = "1.25em";
  div.style.padding = "0px";
  div.style.marginLeft = "0.75em";

  const btn = document.createElement("button");
  btn.className = TweetBlindButtonClassName;
  btn.textContent = "🈯"; // Emoji of "禁"
  btn.style.padding = "0px";
  btn.style.textAlign = "center";
  btn.addEventListener("click", listener);

  div.appendChild(btn);
  return div;
}

//-----------------------------------------------------------------------------
// Methods vulnerable to Twitter changes.
//-----------------------------------------------------------------------------
function getUserIdFromArticle(article) {
  const atag = article.querySelector('a[href^="/"');
  if (!atag) {
    return "";
  }

  const href = atag.getAttribute("href");
  if (!href) {
    return "";
  }

  return href.slice(1);
}

function hideIcon(article) {
  const img = article.querySelector("img");
  if (!img) {
    console.log("hideIcon: img not found.");
    return;
  }
  img.setAttribute("src", DefaultIconURL);

  const siblings = Array.from(img.parentElement.children).filter(
    el => el !== img,
  );
  if (siblings.length >= 1) {
    let sib = siblings[0];
    sib.style.backgroundImage = `url("${DefaultIconURL}")`;
  }
}

function addBlindButtonToTweetElement() {
  const tl_selectors = [
    '[aria-label="Timeline: Your Home Timeline"]',
    '[aria-label="タイムライン: ホームタイムライン"]',
  ].join(",");
  const tl = document.querySelector(tl_selectors);
  if (!tl) return;

  const hus = blinder.allHiddenUsers();
  const tweets = tl.firstChild.children;
  for (let i = 0; i < tweets.length; ++i) {
    const tw = tweets[i];

    const article = tw.querySelector("article");
    if (!article) {
      continue;
    }

    const userid = getUserIdFromArticle(article);
    if (!userid) {
      continue;
    }

    if (hus.find(user => user.id === userid)) {
      hideIcon(article);
    }

    // Get the div of the button group (reply, retweet, fav, etc buttons...).
    const btn_reply = tw.querySelector('[data-testid="reply"]');
    const div_btns = btn_reply?.parentNode?.parentNode;
    if (!div_btns) {
      continue;
    }

    // Skip if the blind button already added.
    const bt_btn = div_btns.querySelector(`.${TweetBlindButtonClassName}`);
    if (bt_btn) {
      continue;
    }

    // Make button
    const btn = makeIconBlindButton(() => {
      blinder.toggleUserHideState(userid);
    });
    div_btns.appendChild(btn);
  }
}

//-----------------------------------------------------------------------------
// Content functions.
//-----------------------------------------------------------------------------
function update() {
  addBlindButtonToTweetElement();
}

function main() {
  blinder.dump();
  window.setInterval(update, 1000);
}

// Entrypoint.
if (document.readyState !== "loading") {
  window.setTimeout(main, 3000);
} else {
  document.addEventListener("DOMContentLoaded", () => {
    window.setTimeout(main, 1000);
  });
}
