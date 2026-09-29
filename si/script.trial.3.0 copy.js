// ============================================================
// SMITHSONIAN POLITICAL POSTERS
// ============================================================


// ------------------------------------------------------------
// API
// ------------------------------------------------------------

const SI_URL =
  "https://api.si.edu/openaccess/api/v1.0/search?q=Political%20posters%20%2B%20object%20type%20Posters%20%2B%20online%20media&start=0&rows=1000&type=edanmdm&row_group=objects&api_key=" +
  SI_KEY;


// ------------------------------------------------------------
// THEMES
// ------------------------------------------------------------

const themes = [
  "Civil Rights",
  "Activism",
  "Elections",
  "Politics",
  "Women's Rights",
  "LGBTQ Rights",
  "Labor Unions",
  "Political Organizations",
  "Reform Movements"
];


// ============================================================
// KEYWORDS
// ============================================================

const keywords = {

  "Women's Rights": [

    "women's rights",
    "womens rights",

    "women's history",
    "womens history",

    "woman suffrage",
    "women suffrage",
    "women's suffrage",
    "womens suffrage",

    "suffrage",

    "feminism",
    "feminist",

    "equal rights amendment",
    "equal rights amendments",

    "women's march",
    "womens march",

    "women's health",
    "womens health",

    "gender issues",

    "reproductive rights",
    "abortion rights",

    "women in war",

    "pro-choice",
    "pro choice"
  ],


  "LGBTQ Rights": [

    "lgbtq",
    "lgbtq rights",

    "lgbt",
    "lgbt rights",

    "gay rights",
    "gay liberation",
    "gay movement",
    "gay community",

    "lesbian rights",
    "lesbian and gay",

    "lesbian",

    "queer",
    "queer rights",

    "transgender",
    "transgender rights",
    "trans rights",
    "transsexual",

    "gender identity",

    "sexual orientation",

    "homosexual",
    "homosexuality",
    "homophile",

    "same-sex",
    "same sex",

    "same-sex marriage",
    "same sex marriage",

    "gay marriage",
    "marriage equality",

    "gay pride",
    "pride parade",

    "stonewall",
    "stonewall riots",

    "gay liberation movement",

    "sexual minorities"
  ],


  "Labor Unions": [

    "labor union",
    "labor unions",

    "labour union",
    "labour unions",

    "labor issues",
    "labour issues",

    "trade union",
    "trade unions",

    "labor movement",
    "labour movement",

    "organized labor",
    "organised labor",
    "organized labour",
    "organised labour",

    "workers' rights",
    "workers rights",
    "worker rights",

    "labor rights",
    "labour rights",

    "collective bargaining",

    "labor strike",
    "general strike",
    "strikes",

    "afl-cio",
    "afl",
    "cio",

    "afscme",
    "seiu",
    "uaw",
    "iww",

    "industrial workers of the world",

    "united farm workers",
    "farm workers",

    "teamsters",

    "minimum wage",
    "fair wages",
    "equal pay"
  ],


  "Elections": [

    "election",
    "elections",

    "voting",
    "voter",
    "voters",
    "vote",

    "ballot",

    "polling",
    "poll",

    "primary election",
    "primary elections",
    "primaries",

    "caucus",

    "candidate",
    "candidates",

    "presidential candidate",
    "presidential candidates",

    "presidential election",
    "presidential elections",

    "general election",
    "national election",
    "local election",

    "election day",

    "voter registration",

    "register to vote",
    "register and vote",

    "voting rights",

    "political campaign",
    "political campaigns",

    "campaign poster",
    "campaign posters",

    "presidential campaign",
    "presidential campaigns",

    "campaign trail",

    "reelection",
    "re-election",

    "donald trump",
    "trump",

    "joe biden",
    "biden",

    "barack obama",
    "obama",

    "hillary clinton",
    "clinton",

    "bernie sanders",
    "sanders",

    "john kerry",

    "al gore",

    "bill clinton",

    "george bush",
    "george w bush",

    "ronald reagan",

    "jimmy carter",

    "richard nixon",

    "john f kennedy",
    "jfk",

    "lyndon johnson",

    "dwight eisenhower",

    "franklin roosevelt",

    "theodore roosevelt",

    "abraham lincoln",

    "nelson rockefeller",

    "aaron henry"
  ],


  "Politics": [

    "politics",
    "political",

    "government",
    "government politics",

    "public policy",

    "political parties",
    "political party",

    "political organizations",
    "political organization",

    "political movement",
    "political movements",

    "political activism",

    "political action",

    "political protest",

    "public officers",

    "government officials",
    "public officials",

    "democracy",
    "american democracy",

    "liberty",

    "social reform"
  ],


  "Civil Rights": [

    "civil rights",

    "civil rights movement",

    "black civil rights",

    "history civil rights",

    "desegregation",

    "race relations",

    "racial discrimination",

    "racial equality",

    "equal rights",

    "black power",

    "black lives matter"
  ],


  "Activism": [

    "activism",

    "activist",
    "activists",

    "protest",
    "protests",

    "protest and civil disobedience",

    "demonstration",
    "demonstrations",

    "civil disobedience",

    "resistance",

    "social movement",
    "social movements"
  ],


  "Political Organizations": [

    "political organizations",
    "political organization",

    "student nonviolent coordinating committee",
    "sncc",

    "league of women voters",

    "aclu",

    "black panther party",

    "republican party",

    "democratic party"
  ],


  "Reform Movements": [

    "reform movements",
    "reform movement",

    "social reform",

    "social reformers",

    "peace movements",
    "peace movement",

    "anti-imperialist movements",

    "prohibition"
  ]
};


// ============================================================
// WHOLE-WORD KEYWORD MATCHING
// ============================================================

function containsKeyword(text, keyword) {

  const escapedKeyword =
    keyword.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );


  const regex =
    new RegExp(
      `(^|\\W)${escapedKeyword}(\\W|$)`,
      "i"
    );


  return regex.test(text);
}


// ============================================================
// GET RELEVANT METADATA
// ============================================================

function getRelevantMetadata(poster) {

  const text = [];


  if (poster.title) {

    text.push(
      poster.title
    );

  }


  const freetext =
    poster.content?.freetext;


  if (freetext) {

    if (freetext.topic) {

      text.push(
        JSON.stringify(
          freetext.topic
        )
      );

    }


    if (freetext.description) {

      text.push(
        JSON.stringify(
          freetext.description
        )
      );

    }


    if (freetext.name) {

      text.push(
        JSON.stringify(
          freetext.name
        )
      );

    }


    if (freetext.event) {

      text.push(
        JSON.stringify(
          freetext.event
        )
      );

    }

  }


  const indexed =
    poster.content?.indexedStructured;


  if (indexed) {

    if (indexed.topic) {

      text.push(
        JSON.stringify(
          indexed.topic
        )
      );

    }


    if (indexed.name) {

      text.push(
        JSON.stringify(
          indexed.name
        )
      );

    }


    if (indexed.event) {

      text.push(
        JSON.stringify(
          indexed.event
        )
      );

    }

  }


  return text
    .join(" ")
    .toLowerCase();
}


// ============================================================
// FIND MATCHING THEMES
// ============================================================

function getMatchingThemes(poster) {

  const metadata =
    getRelevantMetadata(
      poster
    );


  const matches = [];


  themes.forEach(
    theme => {

      const themeKeywords =
        keywords[theme];


      const found =
        themeKeywords.some(
          keyword =>
            containsKeyword(
              metadata,
              keyword
            )
        );


      if (found) {

        matches.push(
          theme
        );

      }

    }
  );


  return matches;
}


// ============================================================
// FIND MATCHED KEYWORDS
// ============================================================

function findMatchedKeywords(
  poster,
  theme
) {

  const metadata =
    getRelevantMetadata(
      poster
    );


  return keywords[theme].filter(
    keyword =>
      containsKeyword(
        metadata,
        keyword
      )
  );
}


// ============================================================
// GET IMAGE URL
// ============================================================

function getImageURL(poster) {

  const onlineMedia =
    poster.content
      ?.descriptiveNonRepeating
      ?.online_media;


  if (!onlineMedia) {
    return null;
  }


  const media =
    onlineMedia.media;


  if (!media || media.length === 0) {
    return null;
  }


  // ----------------------------------------------------------
  // Try the first media item
  // ----------------------------------------------------------

  const firstMedia =
    media[0];


  if (!firstMedia) {
    return null;
  }


  // Most Smithsonian records use one of these
  // ----------------------------------------------------------

  if (
    typeof firstMedia.thumbnail === "string"
  ) {

    return firstMedia.thumbnail;

  }


  if (
    typeof firstMedia.content === "string"
  ) {

    return firstMedia.content;

  }


  // ----------------------------------------------------------
  // Sometimes thumbnail/content can be nested
  // ----------------------------------------------------------

  if (
    firstMedia.thumbnail &&
    typeof firstMedia.thumbnail.url === "string"
  ) {

    return firstMedia.thumbnail.url;

  }


  if (
    firstMedia.content &&
    typeof firstMedia.content.url === "string"
  ) {

    return firstMedia.content.url;

  }


  // ----------------------------------------------------------
  // Try other media items
  // ----------------------------------------------------------

  for (
    let i = 1;
    i < media.length;
    i++
  ) {

    const item =
      media[i];


    if (
      item &&
      typeof item.thumbnail === "string"
    ) {

      return item.thumbnail;

    }


    if (
      item &&
      typeof item.content === "string"
    ) {

      return item.content;

    }

  }


  return null;
}


// ============================================================
// LOAD SMITHSONIAN DATA
// ============================================================

d3.json(SI_URL)

  .then(
    data => {


      console.log(
        "FULL API RESPONSE:",
        data
      );


      const posters =
        data.response?.rows || [];


      console.log(
        "NUMBER OF POSTERS:",
        posters.length
      );


      // ======================================================
      // PROCESS EACH POSTER
      // ======================================================

      const processedPosters =
        posters.map(
          (poster, index) => {


            const matchedThemes =
              getMatchingThemes(
                poster
              );


            // ------------------------------------------------
            // IMAGE
            // ------------------------------------------------

            const image =
              getImageURL(
                poster
              );


            // ------------------------------------------------
            // ID
            // ------------------------------------------------

            const id =
              poster.id ||
              poster.content
                ?.descriptiveNonRepeating
                ?.record_ID ||
              `poster-${index}`;


            // ------------------------------------------------
            // TITLE
            // ------------------------------------------------

            const title =
              poster.title ||
              poster.content
                ?.freetext
                ?.title?.[0]
                ?.content ||
              "Untitled poster";


            return {

              id: id,

              title: title,

              image: image,

              poster: poster,

              themes: matchedThemes

            };

          }
        );


      // ======================================================
      // ONLY KEEP CATEGORIZED POSTERS
      // ======================================================

      const categorizedPosters =
        processedPosters.filter(
          poster =>
            poster.themes.length > 0
        );


      console.log(
        "POSTERS WITH AT LEAST ONE THEME:",
        categorizedPosters.length
      );


      // ======================================================
      // CREATE CATEGORY DATA
      // ======================================================

      const topicData =
        themes.map(
          theme => {


            const postersForTheme =
              categorizedPosters.filter(
                poster =>
                  poster.themes.includes(
                    theme
                  )
              );


            return {

              theme: theme,

              posters: postersForTheme

            };

          }
        );


      // ======================================================
      // PRINT CLEAN LIST
      // ======================================================

      console.log("");

      console.log(
        "=============================================="
      );

      console.log(
        "POSTERS BY CATEGORY"
      );

      console.log(
        "=============================================="
      );


      topicData.forEach(
        topic => {


          console.log("");

          console.log(
            "=============================================="
          );

          console.log(
            topic.theme.toUpperCase()
          );

          console.log(
            "TOTAL:",
            topic.posters.length
          );

          console.log(
            "=============================================="
          );


          topic.posters.forEach(
            (poster, index) => {


              const matchedKeywords =
                findMatchedKeywords(
                  poster.poster,
                  topic.theme
                );


              console.log(
                `${index + 1}. ${poster.title}`
              );


              console.log(
                `   Matched because: ${matchedKeywords.join(", ")}`
              );

            }
          );

        }
      );


      // ======================================================
      // UNIQUE POSTER COUNT
      // ======================================================

      const uniquePosterIDs =
        new Set();


      categorizedPosters.forEach(
        poster => {

          uniquePosterIDs.add(
            poster.id
          );

        }
      );


      console.log("");

      console.log(
        "=============================================="
      );

      console.log(
        "UNIQUE POSTERS:",
        uniquePosterIDs.size
      );

      console.log(
        "=============================================="
      );


      // ======================================================
      // DRAW
      // ======================================================

      drawVisualization(
        topicData,
        uniquePosterIDs.size
      );

    }
  )


  // ==========================================================
  // ERROR
  // ==========================================================

  .catch(
    error => {

      console.error(
        "ERROR LOADING SMITHSONIAN DATA:",
        error
      );

    }
  );


// ============================================================
// DRAW VISUALIZATION
// ============================================================

function drawVisualization(
  topicData,
  totalPosters
) {


  // ==========================================================
  // CONTAINER
  // ==========================================================

  const container =
    d3.select(
      "#visualization"
    );


  container
    .selectAll("*")
    .remove();


  // ==========================================================
  // ADD VISUALIZATION CSS
  // ==========================================================

  const style =
    document.createElement(
      "style"
    );


  style.textContent = `

    #visualization {
      width: 100%;
      box-sizing: border-box;
      overflow: visible;
    }

    .poster-row {
      display: flex;
      width: 100%;
      min-height: 145px;
      border-bottom: 1px solid #d4cec3;
      box-sizing: border-box;
    }

    .poster-label {
      flex: 0 0 190px;
      width: 190px;
      box-sizing: border-box;
      padding: 20px 20px 15px 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: right;
      background: transparent;
      position: relative;
      z-index: 2;
    }

    .poster-label-title {
      font-family: Arial, sans-serif;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.2;
      color: #182943;
      margin-bottom: 8px;
    }

    .poster-label-count {
      font-family: Arial, sans-serif;
      font-size: 14px;
      color: #666;
    }

    .poster-scroll {
      flex: 1;
      min-width: 0;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 18px 20px 18px 15px;
      box-sizing: border-box;
      scrollbar-width: thin;
    }

    .poster-strip {
      display: flex;
      flex-wrap: nowrap;
      gap: 10px;
      width: max-content;
      min-height: 108px;
      align-items: center;
    }

    .poster-card {
      flex: 0 0 70px;
      width: 70px;
      height: 95px;
      position: relative;
      cursor: pointer;
      box-sizing: border-box;
      transition:
        transform 0.18s ease,
        box-shadow 0.18s ease;
      background: #eee8dc;
      border: 1px solid #d5cdbf;
      overflow: hidden;
    }

    .poster-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 18px rgba(0,0,0,0.18);
      z-index: 5;
    }

    .poster-card img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #f5f1e8;
    }

    .poster-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 6px;
      box-sizing: border-box;
      font-family: Arial, sans-serif;
      font-size: 10px;
      color: #777;
      background: #eee8dc;
    }

    .visualization-total {
      text-align: right;
      padding: 18px 10px 25px 0;
      font-family: Arial, sans-serif;
      font-size: 13px;
      color: #666;
    }

    .poster-modal {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 30px;
      box-sizing: border-box;
      background: rgba(15, 24, 40, 0.82);
    }

    .poster-modal.open {
      display: flex;
    }

    .poster-modal-box {
      position: relative;
      max-width: 900px;
      max-height: 90vh;
      width: min(900px, 92vw);
      padding: 28px;
      box-sizing: border-box;
      background: #f5f0e4;
      box-shadow: 0 20px 60px rgba(0,0,0,0.35);
      border-top: 5px solid #b72d32;
    }

    .poster-modal-close {
      position: absolute;
      top: 8px;
      right: 14px;
      border: none;
      background: none;
      font-size: 30px;
      line-height: 1;
      color: #182943;
      cursor: pointer;
    }

    .poster-modal-image {
      display: block;
      max-width: 100%;
      max-height: 62vh;
      width: auto;
      height: auto;
      margin: 0 auto 20px auto;
      object-fit: contain;
      background: white;
    }

    .poster-modal-title {
      margin: 0 40px 10px 0;
      font-family: Georgia, serif;
      font-size: 24px;
      line-height: 1.25;
      color: #182943;
    }

    .poster-modal-topic {
      font-family: Arial, sans-serif;
      font-size: 14px;
      color: #b72d32;
      font-weight: 600;
    }

    .poster-modal-id {
      margin-top: 8px;
      font-family: Arial, sans-serif;
      font-size: 12px;
      color: #777;
    }

    @media (max-width: 700px) {

      .poster-label {
        flex-basis: 135px;
        width: 135px;
      }

      .poster-label-title {
        font-size: 15px;
      }

      .poster-label-count {
        font-size: 12px;
      }

    }

  `;


  document.head.appendChild(
    style
  );


  // ==========================================================
  // CREATE MODAL
  // ==========================================================

  let modal =
    document.querySelector(
      ".poster-modal"
    );


  if (!modal) {

    modal =
      document.createElement(
        "div"
      );


    modal.className =
      "poster-modal";


    modal.innerHTML = `

      <div class="poster-modal-box">

        <button
          class="poster-modal-close"
          aria-label="Close"
        >
          ×
        </button>

        <img
          class="poster-modal-image"
          alt=""
        >

        <h2
          class="poster-modal-title"
        ></h2>

        <div
          class="poster-modal-topic"
        ></div>

        <div
          class="poster-modal-id"
        ></div>

      </div>

    `;


    document.body.appendChild(
      modal
    );

  }


  const modalImage =
    modal.querySelector(
      ".poster-modal-image"
    );


  const modalTitle =
    modal.querySelector(
      ".poster-modal-title"
    );


  const modalTopic =
    modal.querySelector(
      ".poster-modal-topic"
    );


  const modalID =
    modal.querySelector(
      ".poster-modal-id"
    );


  const closeButton =
    modal.querySelector(
      ".poster-modal-close"
    );


  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  closeButton.onclick =
    () => {

      modal.classList.remove(
        "open"
      );

    };


  modal.onclick =
    event => {

      if (
        event.target === modal
      ) {

        modal.classList.remove(
          "open"
        );

      }

    };


  document.onkeydown =
    event => {

      if (
        event.key === "Escape"
      ) {

        modal.classList.remove(
          "open"
        );

      }

    };


  // ==========================================================
  // DRAW EACH CATEGORY
  // ==========================================================

  topicData.forEach(
    topic => {


      // ------------------------------------------------------
      // ROW
      // ------------------------------------------------------

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "poster-row";


      // ------------------------------------------------------
      // LABEL
      // ------------------------------------------------------

      const label =
        document.createElement(
          "div"
        );


      label.className =
        "poster-label";


      label.innerHTML = `

        <div
          class="poster-label-title"
        >
          ${topic.theme}
        </div>

        <div
          class="poster-label-count"
        >
          ${topic.posters.length} posters
        </div>

      `;


      row.appendChild(
        label
      );


      // ------------------------------------------------------
      // SCROLL CONTAINER
      // ------------------------------------------------------

      const scroll =
        document.createElement(
          "div"
        );


      scroll.className =
        "poster-scroll";


      // ------------------------------------------------------
      // POSTER STRIP
      // ------------------------------------------------------

      const strip =
        document.createElement(
          "div"
        );


      strip.className =
        "poster-strip";


      scroll.appendChild(
        strip
      );


      row.appendChild(
        scroll
      );


      container
        .node()
        .appendChild(
          row
        );


      // ======================================================
      // ADD POSTERS
      // ======================================================

      topic.posters.forEach(
        poster => {


          const card =
            document.createElement(
              "div"
            );


          card.className =
            "poster-card";


          // --------------------------------------------------
          // IMAGE EXISTS
          // --------------------------------------------------

          if (poster.image) {

            const image =
              document.createElement(
                "img"
              );


            image.src =
              poster.image;


            image.alt =
              poster.title;


            // ----------------------------------------------
            // If image fails, show placeholder
            // ----------------------------------------------

            image.onerror =
              function() {

                this.remove();


                const placeholder =
                  document.createElement(
                    "div"
                  );


                placeholder.className =
                  "poster-placeholder";


                placeholder.textContent =
                  "Image unavailable";


                card.appendChild(
                  placeholder
                );

              };


            card.appendChild(
              image
            );

          }


          // --------------------------------------------------
          // NO IMAGE URL
          // --------------------------------------------------

          else {

            const placeholder =
              document.createElement(
                "div"
              );


            placeholder.className =
              "poster-placeholder";


            placeholder.textContent =
              "Image unavailable";


            card.appendChild(
              placeholder
            );

          }


          // ==================================================
          // CLICK
          // ==================================================

          card.onclick =
            () => {


              if (!poster.image) {
                return;
              }


              modalImage.src =
                poster.image;


              modalImage.alt =
                poster.title;


              modalTitle.textContent =
                poster.title;


              modalTopic.textContent =
                `Topic: ${topic.theme}`;


              modalID.textContent =
                `Smithsonian ID: ${poster.id}`;


              modal.classList.add(
                "open"
              );

            };


          strip.appendChild(
            card
          );

        }
      );

    }
  );


  // ==========================================================
  // TOTAL
  // ==========================================================

  const total =
    document.createElement(
      "div"
    );


  total.className =
    "visualization-total";


  total.textContent =
    `n = ${totalPosters} unique posters`;


  container
    .node()
    .appendChild(
      total
    );

}