// SMITHSONIAN LEVEL 3 - POLITICS POSTERS + STATIC WORD-CLOUD NETWORK
// Needs: d3 v7, SI_KEY (keys.0.js), and in the HTML:
// #right-posters, #network-container, #stat-posters, #stat-topics, h1, #tooltip

const politicsPosters = [];
const starts = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000];

const FONT = "'Gotham', 'Gotham SSm', 'Montserrat', 'Helvetica Neue', Arial, sans-serif";

// 60-30-10:  60% cream background | 30% blues | 10% red + orange accents
const NAVY   = "#1f4e79";
const BLUE   = "#2e6da4";
const LIGHT  = "#3a7fc4";
const RED    = "#a83232";
const ORANGE = "#e8701a";
const PAPER  = "#faf7f1";

// mostly blues, a little orange, a touch of red
const PALETTE = [NAVY, BLUE, ORANGE, LIGHT, NAVY, BLUE, RED, LIGHT, ORANGE, NAVY];

function getURL(start) {
    const fqs = encodeURIComponent('["object_type:Posters","online_media_type:Images"]');
    return "https://api.si.edu/openaccess/api/v1.0/search?q=poster&fqs=" + fqs +
        "&start=" + start + "&rows=1000&type=edanmdm&row_group=objects&api_key=" + SI_KEY;
}

// every image listed in the poster's online_media (not only the first one)
function getImages(poster) {
    const dnr = poster.content && poster.content.descriptiveNonRepeating;
    let media = (dnr && dnr.online_media && dnr.online_media.media) || [];
    if (!Array.isArray(media)) media = [media];

    const urls = [];

    media.forEach(function (m) {
        if (!m) return;
        if (m.type && !/image/i.test(m.type)) return;

        let url = m.thumbnail || m.content;

        if (!url && m.idsId) {
            url = "https://ids.si.edu/ids/deliveryService?id=" + m.idsId + "&max=300";
        }
        if (!url && m.resources && m.resources.length && m.resources[0].url) {
            url = m.resources[0].url;
        }

        if (url && urls.indexOf(url) === -1) urls.push(url);
    });

    return urls;
}

const requests = starts.map(function (start) {
    return d3.json(getURL(start))
        .then(function (data) { return (data.response && data.response.rows) || []; })
        .catch(function (error) { console.error("API ERROR:", start, error); return []; });
});

Promise.all(requests).then(function (batches) {
    const all = batches.flat();
    console.log("TOTAL POSTERS:", all.length);

    all.forEach(function (poster) {
        const topics = (poster.content && poster.content.indexedStructured &&
            poster.content.indexedStructured.topic) || [];
        if (topics.includes("Politics")) {
            politicsPosters.push({ topics: topics, images: getImages(poster), elements: [] });
        }
    });

    console.log("POLITICS POSTERS:", politicsPosters.length);
    createPosterStrips(politicsPosters);

    // wait for the font so text is measured correctly
    document.fonts.ready.then(function () {
        createNetwork(politicsPosters);
    });
});

function createPosterStrips(posters) {
    const strip = document.querySelector("#right-posters");
    if (!strip) { console.error("#right-posters NOT FOUND"); return; }

    strip.innerHTML = '<div class="strip-title">ALL POSTERS</div>';

    let postersWithImages = 0;
    let totalImages = 0;

    posters.forEach(function (poster) {

        if (!poster.images.length) return;
        postersWithImages++;

        poster.images.forEach(function (url) {
            const card = document.createElement("div");
            card.className = "poster-card";

            const img = document.createElement("img");
            img.src = url;
            img.alt = "Smithsonian political poster";
            img.loading = "lazy";

            card.appendChild(img);
            strip.appendChild(card);
            poster.elements.push(card);
            totalImages++;
        });

    });

    const statPosters = document.querySelector("#stat-posters");
    if (statPosters) statPosters.textContent = posters.length.toLocaleString();

    console.log("POSTERS WITH IMAGES:", postersWithImages, "of", posters.length,
        "| IMAGES IN STRIP:", totalImages);
}

// ======================================================
// WORD LAYOUT (runs once, nothing moves afterwards)
// Biggest word first, then each word is placed on the
// nearest free spot spiralling out from the center.
// A grid index keeps the collision check fast.
// ======================================================

function layoutWords(words, measure, aspect) {

    const placed = [];
    const grid = {};
    const CELL = 48;
    const ex = Math.sqrt(aspect);       // stretch the spiral to fit the screen shape
    const ey = 1 / Math.sqrt(aspect);
    const PAD_X = 11, PAD_Y = 6;      // space kept between words

    function eachCell(x0, y0, x1, y1, fn) {
        const cx0 = Math.floor(x0 / CELL), cx1 = Math.floor(x1 / CELL);
        const cy0 = Math.floor(y0 / CELL), cy1 = Math.floor(y1 / CELL);
        for (let i = cx0; i <= cx1; i++) {
            for (let j = cy0; j <= cy1; j++) {
                if (fn(i + "," + j) === false) return false;
            }
        }
        return true;
    }

    function free(r) {
        return eachCell(r.x0 - PAD_X, r.y0 - PAD_Y, r.x1 + PAD_X, r.y1 + PAD_Y, function (key) {
            const list = grid[key];
            if (!list) return true;
            for (let k = 0; k < list.length; k++) {
                const p = list[k];
                if (r.x0 < p.x1 + PAD_X && r.x1 > p.x0 - PAD_X &&
                    r.y0 < p.y1 + PAD_Y && r.y1 > p.y0 - PAD_Y) return false;
            }
            return true;
        });
    }

    function add(r) {
        placed.push(r);
        eachCell(r.x0, r.y0, r.x1, r.y1, function (key) {
            (grid[key] = grid[key] || []).push(r);
            return true;
        });
    }

    words.forEach(function (w) {

        const width = measure(w.id, w.size);
        const height = w.size * 1.05;
        let theta = 0;

        for (let n = 0; n < 60000; n++) {

            const r = 3 * theta;
            const cx = w.fixed ? 0 : r * Math.cos(theta) * ex;
            const cy = w.fixed ? 0 : r * Math.sin(theta) * ey;

            const rect = {
                x0: cx - width / 2, x1: cx + width / 2,
                y0: cy - height / 2, y1: cy + height / 2
            };

            if (free(rect)) {
                w.x = cx; w.y = cy;
                add(rect);
                break;
            }

            theta += Math.max(0.02, 6 / (r + 8));
        }

    });

    return placed;
}

// box around all words; f spreads the positions (not the text) outward
function boundsOfWords(words, measure, f) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    words.forEach(function (w) {
        const hw = measure(w.id, w.size) / 2;
        const hh = (w.size * 1.05) / 2;
        const cx = w.x * f, cy = w.y * f;
        if (cx - hw < x0) x0 = cx - hw;
        if (cy - hh < y0) y0 = cy - hh;
        if (cx + hw > x1) x1 = cx + hw;
        if (cy + hh > y1) y1 = cy + hh;
    });
    return { x0: x0, y0: y0, x1: x1, y1: y1, w: x1 - x0, h: y1 - y0 };
}

// ======================================================
// TOOLTIP (topic name + number of posters)
// ======================================================

function showTip(event, d) {
    const tip = document.querySelector("#tooltip");
    if (!tip) return;

    tip.textContent = "";

    const name = document.createElement("b");
    name.textContent = d.id;

    const num = document.createElement("span");
    num.textContent = d.count.toLocaleString() + (d.count === 1 ? " poster" : " posters");

    tip.appendChild(name);
    tip.appendChild(num);
    tip.style.opacity = 1;
    moveTip(event);
}

function moveTip(event) {
    const tip = document.querySelector("#tooltip");
    if (!tip) return;

    let x = event.clientX + 16;
    let y = event.clientY + 16;

    if (x + tip.offsetWidth > window.innerWidth - 8) x = event.clientX - tip.offsetWidth - 16;
    if (y + tip.offsetHeight > window.innerHeight - 8) y = event.clientY - tip.offsetHeight - 16;

    tip.style.left = x + "px";
    tip.style.top = y + "px";
}

function hideTip() {
    const tip = document.querySelector("#tooltip");
    if (tip) tip.style.opacity = 0;
}

// ======================================================
// NETWORK
// Every word is smaller than the title
// ======================================================

function createNetwork(posters) {
    try {

        // count topics (once per poster)
        const counts = {};
        posters.forEach(function (p) {
            Array.from(new Set(p.topics)).forEach(function (t) {
                counts[t] = (counts[t] || 0) + 1;
            });
        });

        const others = Object.keys(counts)
            .filter(function (t) { return t !== "Politics"; })
            .map(function (t) { return { id: t, count: counts[t] }; })
            .sort(function (a, b) { return b.count - a.count; });

        let maxCount = 1;
        others.forEach(function (d) { if (d.count > maxCount) maxCount = d.count; });

        // colours (Princeton Posters is always blue)
        others.forEach(function (d, i) {
            d.color = d.id.toLowerCase().indexOf("princeton") === 0 ? BLUE : PALETTE[i % PALETTE.length];
        });

        const center = {
            id: "Politics", count: posters.length, color: RED, fixed: true
        };

        const words = [center].concat(others);

        // size limits come from the title's font size (words always stay smaller than the title)
        const titleEl = document.querySelector("h1");
        const TITLE = (titleEl && parseFloat(getComputedStyle(titleEl).fontSize)) || 34;

        const POLITICS_SIZE = TITLE * 0.66;   // biggest word
        const TOP_SIZE      = TITLE * 0.54;   // biggest related topic
        const ABS_MIN       = 9;              // never smaller than this

        function setSizes(minSize) {
            center.size = POLITICS_SIZE;
            others.forEach(function (d) {
                const t = maxCount > 1 ? (d.count - 1) / (maxCount - 1) : 0;
                d.size = minSize + (TOP_SIZE - minSize) * Math.sqrt(t);
            });
        }

        // measure text width with the real font
        const ctx = document.createElement("canvas").getContext("2d");
        function measure(text, size) {
            ctx.font = "700 " + size + "px " + FONT;
            return ctx.measureText(text).width;
        }

        const container = document.querySelector("#network-container");
        if (!container) { console.error("#network-container NOT FOUND"); return; }
        container.innerHTML = "";

        const PAD = 16;
        const SLACK = 0.95;     // keep ~5% free so the words can be spread out
        const innerW = Math.max(300, (container.clientWidth  || 900) - 40);
        const innerH = Math.max(300, (container.clientHeight || 700) - 40);

        function attempt(minSize) {
            setSizes(minSize);
            layoutWords(words, measure, innerW / innerH);
            return {
                minSize: minSize,
                box: boundsOfWords(words, measure, 1),
                pos: words.map(function (w) { return { x: w.x, y: w.y, size: w.size }; })
            };
        }

        function fits(box) {
            return box.w + PAD * 2 <= innerW * SLACK && box.h + PAD * 2 <= innerH * SLACK;
        }

        // find the largest smallest-size that still fits with some room to spare
        let lo = ABS_MIN, hi = TOP_SIZE * 0.85;
        let best = attempt(lo);

        if (fits(best.box)) {
            for (let i = 0; i < 3; i++) {
                const mid = (lo + hi) / 2;
                const result = attempt(mid);
                if (fits(result.box)) { lo = mid; best = result; } else { hi = mid; }
            }
        }

        words.forEach(function (w, i) {
            w.x = best.pos[i].x;
            w.y = best.pos[i].y;
            w.size = best.pos[i].size;
        });

        // spread the words outward (as far as the screen allows, max +20%)
        let spread = 1;
        for (let f = 1.2; f > 1.001; f -= 0.02) {
            const b = boundsOfWords(words, measure, f);
            if (b.w + PAD * 2 <= innerW && b.h + PAD * 2 <= innerH) { spread = f; break; }
        }
        words.forEach(function (w) { w.x *= spread; w.y *= spread; });

        console.log("smallest text:", best.minSize.toFixed(1) + "px",
            "| title:", TITLE + "px", "| spread:", spread.toFixed(2));

        // never scale up (so no word can pass the title size); scale down only if needed
        const box = boundsOfWords(words, measure, 1);
        const scale = Math.min(1, innerW / (box.w + PAD * 2), innerH / (box.h + PAD * 2));
        const vbW = innerW / scale;
        const vbH = innerH / scale;
        const cx = (box.x0 + box.x1) / 2;
        const cy = (box.y0 + box.y1) / 2;

        const svg = d3.select(container).append("svg")
            .attr("viewBox", [cx - vbW / 2, cy - vbH / 2, vbW, vbH].join(" "))
            .attr("preserveAspectRatio", "xMidYMid meet");

        // red lines: Politics -> every topic (behind the text)
        const LINE_OPACITY = 0.3;

        const link = svg.append("g").selectAll("line").data(others).enter().append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", function (d) { return d.x; })
            .attr("y2", function (d) { return d.y; })
            .attr("stroke", RED)
            .attr("stroke-width", function (d) {
                return 0.7 + 1.1 * Math.sqrt((d.count - 1) / Math.max(1, maxCount - 1));
            })
            .attr("stroke-opacity", LINE_OPACITY);

        const label = svg.append("g").selectAll("text").data(words).enter().append("text")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("font-family", FONT)
            .attr("font-weight", 700)
            .attr("font-size", function (d) { return d.size + "px"; })
            .attr("fill", function (d) { return d.color; })
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("stroke-linejoin", "round")
            .attr("paint-order", "stroke")
            .style("cursor", "pointer")
            .text(function (d) { return d.id; });

        // hover: highlight + number of posters, nothing moves
        label.on("mouseenter", function (event, d) {
            highlightPosters(d.id);
            showTip(event, d);
            label.attr("opacity", function (n) {
                return (n.id === d.id || n.id === "Politics") ? 1 : 0.18;
            });
            link.attr("stroke-opacity", function (l) {
                if (d.id === "Politics") return 0.6;
                return l.id === d.id ? 1 : 0.05;
            });
        });

        label.on("mousemove", function (event) {
            moveTip(event);
        });

        label.on("mouseleave", function () {
            clearHighlights();
            hideTip();
            label.attr("opacity", 1);
            link.attr("stroke-opacity", LINE_OPACITY);
        });

        const statTopics = document.querySelector("#stat-topics");
        if (statTopics) statTopics.textContent = others.length.toLocaleString();

        console.log("NETWORK DRAWN:", words.length, "topics");

    } catch (error) {
        console.error("createNetwork FAILED:", error);
    }
}

function highlightPosters(topic) {
    politicsPosters.forEach(function (p) {
        p.elements.forEach(function (el) {
            el.classList.add("dimmed");
            el.classList.remove("highlighted");
        });
    });

    const matches = politicsPosters
        .filter(function (p) { return p.elements.length && p.topics.includes(topic); })
        .slice(0, 3);

    matches.forEach(function (p) {
        p.elements.forEach(function (el) {
            el.classList.remove("dimmed");
            el.classList.add("highlighted");
        });
    });

    if (matches.length > 0) {
        const strip = document.querySelector("#right-posters");
        const el = matches[0].elements[0];
        strip.scrollTo({
            top: el.offsetTop - strip.clientHeight / 2 + el.clientHeight / 2,
            behavior: "smooth"
        });
    }
}

function clearHighlights() {
    politicsPosters.forEach(function (p) {
        p.elements.forEach(function (el) {
            el.classList.remove("dimmed");
            el.classList.remove("highlighted");
        });
    });
}