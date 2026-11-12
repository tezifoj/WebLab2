function setupCanvas() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
}

function coordinateAxis() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    const step = 32;
    const cx = Math.round(W / 2 / step) * step;
    const cy = Math.round(H / 2 / step) * step;
    ctx.clearRect(0, 0, W, H);

    ctx.strokeStyle = '#d4d2cd';
    ctx.lineWidth = 1;

    for (let x = cx; x <= W; x += step) {
        ctx.beginPath();
        ctx.moveTo(Math.round(x) + 0.5, 0);
        ctx.lineTo(Math.round(x) + 0.5, H);
        ctx.stroke();
    }
    for (let x = cx - step; x >= 0; x -= step) {
        ctx.beginPath();
        ctx.moveTo(Math.round(x) + 0.5, 0);
        ctx.lineTo(Math.round(x) + 0.5, H);
        ctx.stroke();
    }

    for (let y = cy; y <= H; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(W, Math.round(y) + 0.5);
        ctx.stroke();
    }
    for (let y = cy - step; y >= 0; y -= step) {
        ctx.beginPath();
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(W, Math.round(y) + 0.5);
        ctx.stroke();
    }

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(32, cy);
    ctx.lineTo(W - 32, cy);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, 32);
    ctx.lineTo(cx, H - 32);
    ctx.stroke();

    ctx.fillStyle = 'black';

    ctx.beginPath();
        ctx.moveTo(cx, 32);
        ctx.lineTo(cx - 8, 45);
        ctx.lineTo(cx + 8, 45);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(W - 32, cy);
        ctx.lineTo(W - 45, cy - 8);
        ctx.lineTo(W - 45, cy + 8);
        ctx.closePath();
        ctx.fill();

    ctx.lineWidth = 2;

    for (let i = 1; i <= 5; i += 2) {
        const d = i * step;
        ctx.beginPath();
        ctx.moveTo(cx + d, cy - 5);
        ctx.lineTo(cx + d, cy + 5);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx - d, cy - 5);
        ctx.lineTo(cx - d, cy + 5);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx - 5, cy + d);
        ctx.lineTo(cx + 5, cy + d);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx - 5, cy - d);
        ctx.lineTo(cx + 5, cy - d);
        ctx.stroke();
    }

    ctx.font = '500 13px Georgia, "Times New Roman", serif';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 1; i <= 5; i += 2) {
        ctx.fillText(i,  Math.round(cx + i * step), Math.round(cy + 16));
        ctx.fillText(-i, Math.round(cx - i * step), Math.round(cy + 16));

        ctx.fillText(i,  Math.round(cx + 16), Math.round(cy - i * step));
        ctx.fillText(-i, Math.round(cx + 16), Math.round(cy + i * step));
    }

    ctx.font = 'bold 15px Georgia, "Times New Roman", serif';
    ctx.fillText('x', Math.round(W - 40), Math.round(cy - 14));
    ctx.fillText('y', Math.round(cx + 16), 28);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

}

const MIN_R = 2;
const MAX_R = 5;
const MIN_Y = -3;
const MAX_Y = 3;
const ALLOWED_X = [-3, -2, -1, 0, 1, 2, 3, 4, 5];

function getScale() {
    const canvas = document.getElementById("canvas");
    const W = canvas.clientWidth;
    return (W / 2 - 64) / MAX_R;
}

function toPx(x, y) {
    const canvas = document.getElementById("canvas");
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    const step = 32;
    const cx = Math.round(W / 2 / step) * step;
    const cy = Math.round(H / 2 / step) * step;
    const scale = getScale();
    return {
        px: cx + x * scale,
        py: cy - y * scale,
    };
}

function drawArea(R) {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgba(79, 152, 255, 0.5)";

    ctx.beginPath();
    const t1 = toPx(0, 0);
    const t2 = toPx(-R, 0);
    const t3 = toPx(0, R);
    ctx.moveTo(t1.px, t1.py);
    ctx.lineTo(t2.px, t2.py);
    ctx.lineTo(t3.px, t3.py);
    ctx.closePath();
    ctx.fill();

    const center = toPx(0, 0);
    const radiusPx = (R / 2) * getScale();
    ctx.beginPath();
    ctx.moveTo(center.px, center.py);
    ctx.arc(center.px, center.py, radiusPx, 0, Math.PI / 2, false);
    ctx.closePath();
    ctx.fill();

    const c1 = toPx(-R /2, 0);
    const c2 = toPx(0, -R);
    ctx.fillRect(c1.px, c1.py, c2.px - c1.px, c2.py - c1.py);
}

function isHit(x, y, R) {
    if (x <= 0 && y >= 0 && y <= x + R) return true;
    if (x >= 0 && y <= 0 && (x * x + y * y) <= (R / 2) ** 2) return true;
    if (x >= -R / 2 && x <= 0 && y >= -R && y <= 0) return true;
    return false;
}

function drawPoint(x, y, R, hit) {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const p = toPx(x, y);

    ctx.beginPath();
    ctx.arc(p.px, p.py, 5, 0, Math.PI * 2);
    ctx.fillStyle = hit ? "green" : "red";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
}

function formatDate(iso) {
    return new Date(iso).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

const pointsStorageKey = 'app_points';

function isValidPoint(p) {
    return (
        p !== null &&
        typeof p === "object" &&
        typeof p.x === "number" && ALLOWED_X.includes(p.x) &&
        typeof p.y === "number" && Number.isFinite(p.y) && p.y >= MIN_Y && p.y <= MAX_Y &&
        typeof p.r === "number" && Number.isFinite(p.r) && p.r >= MIN_R && p.r <= MAX_R &&
        typeof p.time === "string" && !Number.isNaN(new Date(p.time).getTime())
    );
}

function loadPoints() {
    try {
        const raw = localStorage.getItem(pointsStorageKey);
        const data = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(data)) return [];
        return data
        .filter(isValidPoint)
        .map((p) => ({ ...p, hit: isHit(p.x, p.y, p.r) })); // результат пересчитываем
    } catch {
         return [];
    }
}

function savePoints(points) {
    localStorage.setItem(pointsStorageKey, JSON.stringify(points));
}

function renderTable() {
    const tbody = document.getElementById("results-body");
    const points = loadPoints();
    tbody.innerHTML = "";

    points.reverse().forEach((p) => {
        const tr = document.createElement("tr");

        const tdX = document.createElement("td");
        tdX.textContent = p.x;

        const tdY = document.createElement("td");
        tdY.textContent = p.y;

        const tdR = document.createElement("td");
        tdR.textContent = p.r;

        const tdHit = document.createElement("td");
        tdHit.className = p.hit ? "hit" : "miss";
        tdHit.textContent = p.hit ? "Попадание" : "Промах";

        const tdTime = document.createElement("td");
        tdTime.textContent = formatDate(p.time);

        tr.append(tdX, tdY, tdR, tdHit, tdTime);
        tbody.appendChild(tr);

    });
}

function validateNumberInput(input, min, max) {
    const value = input.value.trim();

    input.classList.remove("invalid");

    if (value === "") {
        input.classList.add("invalid");
        return {value: null, error: "Поле обязательно для заполнения"};
    }

    if (!/^-?\d+(\.\d+)?$/.test(value)) {
        input.classList.add("invalid");
        return {value: null, error: "Введите число"};
    }

    const num = Number(value);

    if (!Number.isFinite(num) || num < min || num > max) {
        input.classList.add("invalid");
        return {value: null, error: `Число от ${min} до ${max}` };
    }
    return {value: num, error: null };
}

const xRadios = Array.from(document.querySelectorAll('input[name="x"]'));

function getSelectedX() {
    const idx = xRadios.findIndex((r) => r.checked);

    if (idx === -1) {
        return { value: null, error: "Выберите значение" };
    }

    return { value: ALLOWED_X[idx], error: null };
}

let currentR = 2;
function redrawAll() {
    coordinateAxis();
    drawArea(currentR);
    const points = loadPoints();

    points.forEach((p) => {
        const hit = isHit(p.x, p.y, currentR);
        drawPoint(p.x, p.y, currentR, hit);
    });
}

const errorMessage = document.getElementById("error-message");

document.getElementById("point").addEventListener("submit", (event) => {
    event.preventDefault();

    const yInput = document.getElementById("y-input");
    const rInput = document.getElementById("r-input");

    const xRes = getSelectedX();
    const yRes = validateNumberInput(yInput, -3, 3);
    const rRes = validateNumberInput(rInput, 2, 5);

    const messages = [];
    if (xRes.error !== null) messages.push("X: " + xRes.error);
    if (yRes.error !== null) messages.push("Y: " + yRes.error);
    if (rRes.error !== null) messages.push("R: " + rRes.error);

    if (messages.length > 0) {
        errorMessage.textContent = messages.join("\n");
        return;
    }

    errorMessage.textContent = "";

    const x = xRes.value;
    const y = yRes.value;
    const r = rRes.value;
    const hit = isHit(x, y, r);

    const point = {
        x, y, r, hit,
        time: new Date().toISOString(),
    }

    const points = loadPoints();
    points.push(point);
    savePoints(points);

    currentR = r;
    renderTable();
    redrawAll();
});

document.getElementById("clear-btn").addEventListener("click", () => {
    localStorage.removeItem(pointsStorageKey);
    errorMessage.textContent = "";
    renderTable();
    redrawAll();
});

document.getElementById("point").addEventListener("input", () => {
    errorMessage.textContent = "";
});

document.getElementById("r-input").addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= MIN_R && val <= MAX_R) {
        currentR = val;
        redrawAll();
    }
});

setupCanvas();
coordinateAxis();
renderTable();

window.addEventListener("resize", () => {
    setupCanvas();
    redrawAll();
});