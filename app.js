// State and Constants
const config = {
    floorHeights: [1.5, 6, 9, 12], // 1F to 4F
    floorLabels: ["1F (1.5m)", "2F (6.0m)", "3F (9.0m)", "4F (12.0m)"],
    corridorHeight: 6, // Deck is at 6m
    canopyHeight: 10, // Roof is at 10m
    corridorWidth: 6,
    baseGrowthRate: 0.015 // 1.5% base annual growth
};

let state = {
    village: "東區 大學里 (民族-青年段)",
    distance: 5,
    floorIndex: 1,
    scenario: 'pro', // 'pro' or 'con'
    forecastYears: 10, // 10 or 20
    viewMode: 'res' // 'res' (Residential) or 'svf' (Pedestrian SVF)
};

// DOM Elements
const els = {
    village: document.getElementById('village-select'),
    scenarioBtns: document.querySelectorAll('.toggle-group:not(#view-mode-toggle) .toggle-btn'),
    timeBtns: document.querySelectorAll('.time-btn'),
    viewModeBtns: document.querySelectorAll('#view-mode-toggle .toggle-btn'),
    distSlider: document.getElementById('dist-slider'),
    distValue: document.getElementById('dist-value'),
    floorSlider: document.getElementById('floor-slider'),
    floorValue: document.getElementById('floor-value'),
    
    canvas: document.getElementById('viz-canvas'),
    
    resScores: document.getElementById('res-scores'),
    svfScores: document.getElementById('svf-scores'),
    
    oppScore: document.getElementById('oppression-score'),
    oppBar: document.getElementById('oppression-bar'),
    privScore: document.getElementById('privacy-score'),
    privBar: document.getElementById('privacy-bar'),
    
    svfScoreEl: document.getElementById('svf-score'),
    svfBar: document.getElementById('svf-bar'),
    compressionScoreEl: document.getElementById('compression-score'),
    compressionBar: document.getElementById('compression-bar'),
    
    approvalVal: document.getElementById('approval-value'),
    supportBar: document.getElementById('support-bar'),
    opposeBar: document.getElementById('oppose-bar'),
    feedbackList: document.getElementById('feedback-list'),
    
    envImpact: document.getElementById('env-impact-value'),
    totalGrowth: document.getElementById('total-growth-value'),
    analysisText: document.getElementById('analysis-text')
};

const ctx = els.canvas.getContext('2d');
let priceChart;
let resizeTimeout;

// Resident Feedback Templates
const feedbackTemplates = {
    pro: [
        { type: 'pos', text: '綠園道蓋好後，下樓就可以騎單車，生活品質提升很多！', icon: '🚲' },
        { type: 'pos', text: '頂棚設計很漂亮，且地面保留了植栽空間，感覺社區變明亮了。', icon: '✨' },
        { type: 'pos', text: '對房價絕對是利多，綠色基礎設施是現代城市的指標。', icon: '📈' },
        { type: 'neu', text: '希望政府能做好植栽維護，不然只有水泥體會很突兀。', icon: '🌳' }
    ],
    con: [
        { type: 'neg', text: '距離我家太近了！在6公尺橋上騎車的人完全可以看到我二樓房間！', icon: '👀' },
        { type: 'neg', text: '10公尺高的頂棚龐然大物擋在前面，每天看著覺得很有壓迫感。', icon: '🏢' },
        { type: 'neg', text: '這肯定會帶來噪音跟髒亂，房價一定會跌。', icon: '📉' },
        { type: 'neu', text: '設計圖看起來不錯，但施工期的黑暗期讓人擔憂。', icon: '🚧' }
    ]
};

// Initialization
function init() {
    initChart();
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    attachEventListeners();
    update();
}

function attachEventListeners() {
    els.village.addEventListener('change', (e) => {
        state.village = e.target.value;
        update();
    });

    els.scenarioBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            els.scenarioBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.scenario = e.target.dataset.scenario;
            update();
        });
    });

    els.timeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            els.timeBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.forecastYears = parseInt(e.target.dataset.time);
            update();
        });
    });

    els.viewModeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            els.viewModeBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.viewMode = e.target.dataset.mode;
            
            if (state.viewMode === 'res') {
                els.resScores.style.display = 'grid';
                els.svfScores.style.display = 'none';
            } else {
                els.resScores.style.display = 'none';
                els.svfScores.style.display = 'grid';
            }
            update();
        });
    });

    els.distSlider.addEventListener('input', (e) => {
        state.distance = parseFloat(e.target.value);
        els.distValue.textContent = `${state.distance.toFixed(1)}m`;
        update();
    });

    els.floorSlider.addEventListener('input', (e) => {
        state.floorIndex = parseInt(e.target.value);
        els.floorValue.textContent = config.floorLabels[state.floorIndex];
        update();
    });
}

// Canvas & Visualizer
function resizeCanvas() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const parent = els.canvas.parentElement;
        const w = parent.offsetWidth;
        const h = parent.offsetHeight;
        
        if (els.canvas.width !== w * window.devicePixelRatio || els.canvas.height !== h * window.devicePixelRatio) {
            els.canvas.width = w * window.devicePixelRatio;
            els.canvas.height = h * window.devicePixelRatio;
            ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
            drawViz();
        }
    }, 100);
}

function drawPerson(ctx, x, y, scale) {
    const h = 1.7 * scale; // 1.7m height
    const w = 0.5 * scale; // 0.5m width
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(x, y - h + w/2, w/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - w/3, y - h + w, w/1.5, h - w);
}

function drawTree(ctx, x, y, scale) {
    const trunkW = 0.6 * scale;
    const trunkH = 2 * scale;
    // Trunk
    ctx.fillStyle = '#78350f'; // amber-900
    ctx.fillRect(x - trunkW/2, y - trunkH, trunkW, trunkH);
    
    // Leaves
    ctx.fillStyle = 'rgba(16, 185, 129, 0.4)'; // emerald-500
    ctx.beginPath();
    ctx.arc(x, y - trunkH - 1.5 * scale, 2.5 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - 1.5 * scale, y - trunkH - 0.5 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 1.5 * scale, y - trunkH - 0.5 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.fill();
}

function drawViz() {
    const w = els.canvas.width / window.devicePixelRatio;
    const h = els.canvas.height / window.devicePixelRatio;
    ctx.clearRect(0, 0, w, h);

    const scale = 12; // px per meter
    const groundY = h - 30;
    const bldgX = 50;
    const corridorX = bldgX + state.distance * scale;
    
    const eyeHeight = config.floorHeights[state.floorIndex];
    const eyeY = groundY - eyeHeight * scale;

    // Grid & Ground
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for(let i=0; i<w; i+=scale) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
    }
    
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(w, groundY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // SVF Mode Rays (Background)
    if (state.viewMode === 'svf') {
        const pedX = bldgX + 2.5 * scale;
        const pedY = groundY - 1.7 * scale;
        
        // Angle to Building Top
        const bldgTopX = bldgX;
        const bldgTopY = groundY - 15 * scale;
        const a1 = Math.atan2(pedY - bldgTopY, pedX - bldgTopX); 
        
        // Angle to Canopy Top
        const corrTopX = corridorX;
        const corrTopY = groundY - config.canopyHeight * scale;
        const a2 = Math.atan2(pedY - corrTopY, corrTopX - pedX); 

        // Draw Sky Area 
        ctx.fillStyle = 'rgba(14, 165, 233, 0.15)'; 
        ctx.beginPath();
        ctx.moveTo(pedX, pedY);
        ctx.arc(pedX, pedY, 300, Math.PI + a1, -a2, false);
        ctx.fill();

        // Draw Blocked Areas
        ctx.fillStyle = 'rgba(244, 63, 94, 0.1)'; 
        ctx.beginPath();
        ctx.moveTo(pedX, pedY);
        ctx.arc(pedX, pedY, 300, -a2, 0, false);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(pedX, pedY);
        ctx.arc(pedX, pedY, 300, Math.PI, Math.PI + a1, false);
        ctx.fill();

        // Ray lines
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#0ea5e9';
        ctx.beginPath(); ctx.moveTo(pedX, pedY); ctx.lineTo(bldgTopX, bldgTopY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(pedX, pedY); ctx.lineTo(corrTopX, corrTopY); ctx.stroke();
        ctx.setLineDash([]);
        
        // Label
        ctx.font = '12px Inter';
        ctx.fillStyle = '#0ea5e9';
        ctx.fillText('可見天空範圍', pedX, pedY - 120);
    }

    // Building
    ctx.fillStyle = 'rgba(59, 130, 246, 0.15)'; // blue-500
    ctx.fillRect(0, groundY - 15 * scale, bldgX, 15 * scale);
    ctx.strokeStyle = '#3b82f6';
    ctx.strokeRect(0, groundY - 15 * scale, bldgX, 15 * scale);

    // Corridor Structure
    const deckY = groundY - config.corridorHeight * scale;
    const canopyY = groundY - config.canopyHeight * scale;
    const corrW = config.corridorWidth * scale;
    
    // Slanted Pillar
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(corridorX + corrW + 2*scale, groundY); // Base slightly to the right
    ctx.lineTo(corridorX + corrW/2, canopyY); // Meets the canopy center
    ctx.stroke();
    
    // Safety railings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(corridorX, deckY); ctx.lineTo(corridorX, deckY - 1.2*scale); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(corridorX + corrW, deckY); ctx.lineTo(corridorX + corrW, deckY - 1.2*scale); ctx.stroke();

    // Deck
    ctx.fillStyle = '#10b981'; // emerald-500
    ctx.fillRect(corridorX, deckY, corrW, 10);
    
    // Canopy Roof (V Shape)
    ctx.strokeStyle = '#34d399';
    ctx.fillStyle = 'rgba(52, 211, 153, 0.1)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(corridorX - scale, canopyY - 1.5*scale);
    ctx.lineTo(corridorX + corrW/2, canopyY);
    ctx.lineTo(corridorX + corrW + scale, canopyY - 1.5*scale);
    ctx.fill();
    ctx.stroke();

    // Trees
    if(state.distance >= 4) {
        drawTree(ctx, bldgX + (state.distance * scale)/2, groundY, scale);
    }
    drawTree(ctx, corridorX + corrW + 3*scale, groundY, scale);

    // Humans
    drawPerson(ctx, bldgX + 2.5 * scale, groundY, scale); // Pedestrian
    drawPerson(ctx, corridorX + corrW / 2 + 10, deckY, scale); // On the green corridor

    if (state.viewMode === 'res') {
        // Residential Eye Point
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(bldgX - 5, eyeY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(bldgX - 5, eyeY, 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.stroke();

        // Line of sight
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(bldgX - 5, eyeY);
        ctx.lineTo(corridorX + corrW/2, deckY - 1.5*scale); // Sight to cyclist face
        ctx.strokeStyle = '#f43f5e'; // rose-500
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Measurement Labels
    ctx.font = '10px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${state.distance}m`, bldgX + (state.distance * scale)/2 - 10, groundY - 10);
    ctx.fillText('6m 寬', corridorX + corrW + 5, deckY + 15);
}

// Math Helpers for SVF
function calculateSVF() {
    const distToBuilding = 3;
    const bldgHeight = 15;
    const eyeHeight = 1.7;
    
    const angleLeft = Math.atan2(bldgHeight - eyeHeight, distToBuilding);
    const blockedLeft = (angleLeft / (Math.PI / 2)) * 50;

    const distToCorridor = state.distance - distToBuilding;
    let angleRight = 0;
    if (distToCorridor > 0) {
        // Now using canopy height as the main blocker
        angleRight = Math.atan2(config.canopyHeight - eyeHeight, distToCorridor);
    } else {
        angleRight = Math.PI / 2; 
    }
    const blockedRight = (angleRight / (Math.PI / 2)) * 50;

    const totalBlocked = Math.min(100, blockedLeft + blockedRight);
    const compression = Math.max(0, 100 - (state.distance * 5));

    return { totalBlocked, compression };
}

// Logic & Core Updates
function update() {
    const floorH = config.floorHeights[state.floorIndex];
    
    // 1. Calculate Residential Impact (Mode 1)
    let oppScore = 100 * Math.exp(-(state.distance - 2) / 6) * (1 - (floorH - 1.5) / 20);
    if(state.scenario === 'pro') oppScore *= 0.7;
    oppScore = Math.min(100, Math.max(0, oppScore));

    // Privacy peaks at 6m (Deck height) now
    let privScore = 100 * Math.exp(-(state.distance - 2) / 5) * Math.exp(-Math.pow(floorH - config.corridorHeight, 2) / 10);
    if(state.scenario === 'pro') privScore *= 0.6;
    privScore = Math.min(100, Math.max(0, privScore));

    // Update Residential UI
    els.oppScore.textContent = Math.round(oppScore);
    els.oppBar.style.width = `${oppScore}%`;
    els.oppBar.className = `progress-fill ${oppScore > 60 ? 'gradient-danger' : (oppScore > 30 ? 'gradient-warning' : 'gradient-success')}`;

    els.privScore.textContent = Math.round(privScore);
    els.privBar.style.width = `${privScore}%`;
    els.privBar.className = `progress-fill ${privScore > 60 ? 'gradient-danger' : (privScore > 30 ? 'gradient-warning' : 'gradient-success')}`;

    // 2. Calculate SVF Impact (Mode 2)
    const svfData = calculateSVF();
    
    // Update SVF UI
    els.svfScoreEl.textContent = `${Math.round(svfData.totalBlocked)}%`;
    els.svfBar.style.width = `${svfData.totalBlocked}%`;
    els.svfBar.className = `progress-fill ${svfData.totalBlocked > 80 ? 'gradient-danger' : (svfData.totalBlocked > 50 ? 'gradient-warning' : 'gradient-success')}`;

    els.compressionScoreEl.textContent = `${Math.round(svfData.compression)}%`;
    els.compressionBar.style.width = `${svfData.compression}%`;
    els.compressionBar.className = `progress-fill ${svfData.compression > 70 ? 'gradient-danger' : (svfData.compression > 40 ? 'gradient-warning' : 'gradient-success')}`;

    // 3. Public Opinion Simulation
    const combinedImpact = Math.max(oppScore, svfData.totalBlocked);
    let baseApproval = state.scenario === 'pro' ? 65 : 40;
    let penalty = (combinedImpact * 0.3) + (privScore * 0.2); 
    let finalApproval = Math.max(5, Math.min(95, baseApproval - penalty));
    
    els.approvalVal.textContent = `${Math.round(finalApproval)}%`;
    els.supportBar.style.width = `${finalApproval}%`;
    els.opposeBar.style.width = `${100 - finalApproval}%`;
    
    updateFeedbackList(finalApproval, oppScore, privScore, svfData.totalBlocked);

    // 4. Housing Price Impact
    let envImpactPercent = 0;
    if(state.scenario === 'pro' && combinedImpact < 50 && privScore < 40) {
        envImpactPercent = 2.0; 
    } else if (state.scenario === 'con' || combinedImpact > 75 || privScore > 70) {
        envImpactPercent = -1.5 - (combinedImpact/100) - (privScore/100); 
    } else {
        envImpactPercent = -0.5;
    }

    const totalGrowth = config.baseGrowthRate + (envImpactPercent / 100);
    
    els.envImpact.textContent = `${envImpactPercent > 0 ? '+' : ''}${envImpactPercent.toFixed(1)}%`;
    els.envImpact.className = `impact-val ${envImpactPercent > 0 ? 'positive' : (envImpactPercent < 0 ? 'negative' : '')}`;
    
    els.totalGrowth.textContent = `${(totalGrowth * 100).toFixed(1)}%`;
    els.totalGrowth.className = `impact-val ${totalGrowth > config.baseGrowthRate ? 'positive' : (totalGrowth < config.baseGrowthRate ? 'negative' : '')}`;

    updateChartData(totalGrowth);
    updateAnalysisText(envImpactPercent, combinedImpact, privScore);
    drawViz();
}

function updateFeedbackList(approval, opp, priv, svf) {
    let html = '';
    const pool = state.scenario === 'pro' ? feedbackTemplates.pro : feedbackTemplates.con;
    const showFeedback = [];
    
    if(priv > 60) {
        showFeedback.push({ type: 'neg', text: `我家在${config.floorLabels[state.floorIndex]}，離走道才${state.distance}公尺，騎士高度跟我家一樣，隱私完全被看光！`, icon: '😡' });
    } else if(priv < 30 && state.scenario === 'pro') {
        showFeedback.push({ type: 'pos', text: `這個距離剛剛好，且視角不會對到，不會互相干擾。`, icon: '👍' });
    } else {
        showFeedback.push(pool[Math.floor(Math.random() * pool.length)]);
    }

    if(state.viewMode === 'svf' && svf > 80) {
        showFeedback.push({ type: 'neg', text: `10公尺高的頂棚把天空遮蔽了超過80%，走在一樓覺得像是在隧道裡，非常壓迫！`, icon: '☁️' });
    } else if (opp > 60) {
        showFeedback.push({ type: 'neg', text: `那麼巨大的頂棚就在眼前，景觀超壓迫，房子絕對跌價！`, icon: '🏢' });
    } else {
        showFeedback.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    
    showFeedback.push(pool[0]);

    showFeedback.forEach(f => {
        html += `
            <li class="feedback-item ${f.type}">
                <span class="feedback-icon">${f.icon}</span>
                <span>${f.text}</span>
            </li>
        `;
    });
    
    els.feedbackList.innerHTML = html;
}

function updateAnalysisText(envImpact, combinedImpact, priv) {
    let text = "";
    if (envImpact > 0) {
        text = `強勁的綠色溢價：距離與視角配置得宜，天空視野開闊，預期能享受最高環境紅利，長期具增值潛力。`;
    } else if (envImpact < -1.5) {
        text = `高度社會與空間阻力：`;
        if (combinedImpact > 75) text += `極大的視覺壓迫與天空遮蔽 `;
        if (priv > 70) text += `與二樓嚴重的隱私外洩風險 `;
        text += `將導致強烈民怨。建議退縮建築線或重新評估廊道高度。`;
    } else {
        text = `中立影響：環境衝擊在可控範圍內，天空遮蔽適中。建議持續與周邊居民溝通以提升支持度。`;
    }
    els.analysisText.textContent = text;
}

// Chart.js Setup
function initChart() {
    const chartCtx = document.getElementById('price-chart').getContext('2d');
    
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', 'Noto Sans TC', sans-serif";
    
    priceChart = new Chart(chartCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '預測房價指數 (Base=100)',
                data: [],
                borderColor: '#0ea5e9',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#0ea5e9',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 14 },
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `指數: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    beginAtZero: false
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function updateChartData(growthRate) {
    const years = state.forecastYears;
    const labels = [];
    const data = [];
    
    let currentVal = 100; // Base index
    for(let i = 0; i <= years; i++) {
        labels.push(`第${i}年`);
        data.push(currentVal.toFixed(1));
        currentVal *= (1 + growthRate);
    }
    
    priceChart.data.labels = labels;
    priceChart.data.datasets[0].data = data;
    
    // Dynamic color based on growth direction
    const isPositive = growthRate > config.baseGrowthRate;
    const color = isPositive ? '#10b981' : (growthRate < 0 ? '#f43f5e' : '#0ea5e9');
    const bgColor = isPositive ? 'rgba(16, 185, 129, 0.1)' : (growthRate < 0 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(14, 165, 233, 0.1)');
    
    priceChart.data.datasets[0].borderColor = color;
    priceChart.data.datasets[0].pointBackgroundColor = color;
    priceChart.data.datasets[0].backgroundColor = bgColor;
    
    priceChart.update();
}

// Bootstrap
document.addEventListener('DOMContentLoaded', init);
