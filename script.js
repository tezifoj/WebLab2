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

const MIN_Y = -5;
const MAX_Y = 3;
const ALLOWED_X = [-3, -2, -1, 0, 1, 2, 3, 4, 5];
const MAX_R = 3;
const ALLOWED_R = [1, 1.5, 2, 2.5, 3];

function getScale() {
    return 32;
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
    const scale = getScale();
    const center = toPx(0, 0);

    ctx.fillStyle = "rgba(79, 152, 255, 0.5)";

    // I четверть
    const top = toPx(0, R / 2);
    ctx.fillRect(top.px, top.py, R * scale, (R / 2) * scale);

    // II четверть
    const a = toPx(-R, 0);
    const b = toPx(0, R / 2);
    ctx.beginPath();
    ctx.moveTo(center.px, center.py);
    ctx.lineTo(a.px, a.py);
    ctx.lineTo(b.px, b.py);
    ctx.closePath();
    ctx.fill();

    // III четверть
    ctx.beginPath();
    ctx.moveTo(center.px, center.py);
    ctx.arc(center.px, center.py, R * scale, Math.PI / 2, Math.PI, false);
    ctx.closePath();
    ctx.fill();
}

function isHit(x, y, R) {
    if (x >= 0 && x <= R && y >= 0 && y <= (R / 2)) return true;
    if (x <= 0 && y >= 0 && 2 * y <= x + R) return true;
    if (x <= 0 && y <= 0 && x * x + y * y <= R * R) return true;
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
        typeof p.r === "number" && ALLOWED_R.includes(p.r) &&
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
    const value = input.value.trim().replace(",", ".");

    input.classList.remove("invalid", "valid");

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
    input.classList.add("valid");
    return {value: num, error: null };
}

const rRadios = Array.from(document.querySelectorAll('input[name="r"]'));

function getSelectedR() {
    const idx = rRadios.findIndex((request) => request.checked);

    if (idx === -1) {
        return { value: null, error: "Выберите значение" };
    }

    return { value: ALLOWED_R[idx], error: null };
}

const xSelect = document.getElementById("x-select");

function getSelectedX() {
    const value = Number(xSelect.value);
    if (xSelect.value === "" || !ALLOWED_X.includes(value)) {
        return { value: null, error: "Выберите значение" };
    }

    return { value, error: null };
}

let currentR = 1;
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

    const yRes = validateNumberInput(yInput, -5, 3);
    const xRes = getSelectedX();
    const rRes = getSelectedR();


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

const yInput = document.getElementById("y-input");
const yError = document.getElementById("y-error");

yInput.addEventListener("input", () => {
    if (yInput.value.trim() === "") {
        yInput.classList.remove("invalid", "valid");
        return;
    }
    validateNumberInput(yInput, MIN_Y, MAX_Y);
});

rRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
        currentR = Number(radio.value);
        redrawAll();
    });
});

setupCanvas();
redrawAll();
renderTable();

window.addEventListener("resize", () => {
    setupCanvas();
    redrawAll();
});