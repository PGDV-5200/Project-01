const politicsPosters = [];
const starts = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000];

const FONT = "'Gotham', 'Gotham SSm', 'Montserrat', 'Helvetica Neue', Arial, sans-serif";

const NAVY   = "#1f4e79";
const BLUE   = "#2e6da4";
const LIGHT  = "#3a7fc4";
const RED    = "#a83232";
const ORANGE = "#e8701a";

const PALETTE = [NAVY, BLUE, ORANGE, LIGHT, NAVY, BLUE, RED, LIGHT, ORANGE, NAVY];

function getURL(start) {
    const fqs = encodeURIComponent('["object_type:Posters","online_media_type:Images"]');
    return "https://api.si.edu/openaccess/api/v1.0/search?q=poster&fqs=" + fqs +
        "&start=" + start + "&rows=1000&type=edanmdm&row_group=objects&api_key=" + SI_KEY;
}

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

window.addEventListener('DOMContentLoaded', function() {
    const requests = starts.map(function (start) {
        return d3.json(getURL(start))
            .then(function (data) { return (data.response && data.response.rows) || []; })
            .catch(function (error) { console.error("API ERROR:", start, error); return []; });
    });

    Promise.all(requests).then(function (batches) {
        const all = batches.flat();

        all.forEach(function (poster) {
            const topics = (poster.content && poster.content.indexedStructured &&
                poster.content.indexedStructured.topic) || [];
            if (topics.includes("Politics")) {
                politicsPosters.push({ topics: topics, images: getImages(poster), elements: [] });
            }
        });

        createPosterStrips(politicsPosters);

        document.fonts.ready.then(function () {
            createNetwork(politicsPosters);
        });
    });
});

function createPosterStrips(posters) {
    const strip = document.querySelector("#right-posters");
    if (!strip) return;

    strip.innerHTML = '<div class="strip-title">ALL POSTERS</div>';

    posters.forEach(function (poster) {
        if (!poster.images.length) return;

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
        });
    });

    const statPosters = document.querySelector("#stat-posters");
    if (statPosters) statPosters.textContent = posters.length.toLocaleString();
}

function layoutWords(words, measure, aspect) {
    const placed = [];
    const grid = {};
    const CELL = 48;

    const ex = Math.sqrt(aspect) * 1.8;
    const ey = (1 / Math.sqrt(aspect)) * 2.2;
    const PAD_X = 6, PAD_Y = 2; 

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
            const r = 3.5 * theta;
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

            theta += Math.max(0.025, 6 / (r + 8));
        }
    });

    return placed;
}

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

function createNetwork(posters) {
    try {
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

        others.forEach(function (d, i) {
            d.color = d.id.toLowerCase().indexOf("princeton") === 0 ? BLUE : PALETTE[i % PALETTE.length];
        });

        const center = {
            id: "Politics", count: posters.length, color: RED, fixed: true
        };

        const words = [center].concat(others);

        const container = document.querySelector("#network-container");
        if (!container) return;
        container.innerHTML = "";

        const innerW = Math.max(300, (container.clientWidth  || 900));
        const innerH = Math.max(300, (container.clientHeight || 700));

        const POLITICS_SIZE = Math.max(54, innerH * 0.085);
        const TOP_SIZE      = Math.max(30, innerH * 0.048);
        const ABS_MIN       = 10.5;

        function setSizes(minSize) {
            center.size = POLITICS_SIZE;
            others.forEach(function (d) {
                const t = maxCount > 1 ? (d.count - 1) / (maxCount - 1) : 0;
                d.size = minSize + (TOP_SIZE - minSize) * Math.sqrt(t);
            });
        }

        const ctx = document.createElement("canvas").getContext("2d");
        function measure(text, size) {
            ctx.font = "700 " + size + "px " + FONT;
            return ctx.measureText(text).width;
        }

        setSizes(ABS_MIN);
        layoutWords(words, measure, innerW / innerH);

        let maxExtentX = 0;
        let maxExtentY = 0;

        words.forEach(function (w) {
            const hw = measure(w.id, w.size) / 2;
            const hh = (w.size * 1.05) / 2;
            maxExtentX = Math.max(maxExtentX, Math.abs(w.x) + hw);
            maxExtentY = Math.max(maxExtentY, Math.abs(w.y) + hh);
        });

        const padX = 20;
        const padY = 20;
        
        const vbW = (maxExtentX * 2) + padX;
        const vbH = (maxExtentY * 2) + padY;

        // Unconstrained aspect ratio stretches horizontal dimensions to fill width
        const svg = d3.select(container).append("svg")
            .attr("viewBox", [-vbW / 2, -vbH / 2, vbW, vbH].join(" "))
            .attr("preserveAspectRatio", "none")
            .style("width", "100%")
            .style("height", "100%");

        const label = svg.append("g").selectAll("text").data(words).enter().append("text")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("font-family", FONT)
            .attr("font-weight", 700)
            .attr("font-size", function (d) { return d.size + "px"; })
            .attr("fill", function (d) { return d.color; })
            .style("cursor", "pointer")
            .text(function (d) { return d.id; });

        label.on("mouseenter", function (event, d) {
            highlightPosters(d.id);
            showTip(event, d);
            label.attr("opacity", function (n) {
                return (n.id === d.id || n.id === "Politics") ? 1 : 0.18;
            });
        });

        label.on("mousemove", function (event) {
            moveTip(event);
        });

        label.on("mouseleave", function () {
            clearHighlights();
            hideTip();
            label.attr("opacity", 1);
        });

        const statTopics = document.querySelector("#stat-topics");
        if (statTopics) statTopics.textContent = others.length.toLocaleString();

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