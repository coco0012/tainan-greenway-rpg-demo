// State and Constants
const config = {
    floorHeights: [1.5, 6, 9, 12], 
    floorLabels: ["1F (1.5m)", "2F (6.0m)", "3F (9.0m)", "4F (12.0m)"],
    corridorHeight: 6, 
    canopyHeight: 10, 
    corridorWidth: 6,
    baseGrowthRate: 0.015 
};

let state = {
    village: "東區 大學里 (民族-青年段)",
    distance: 5,
    floorIndex: 1,
    scenario: 'pro', 
    forecastYears: 10, 
    viewMode: 'res' 
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
    
    canvas2d: document.getElementById('viz-canvas-2d'),
    container3D: document.getElementById('3d-container'),
    
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

const feedbackTemplates = {
    pro: [
        { type: 'pos', text: '綠園道蓋好後，下樓就可以騎單車，生活品質提升很多。' },
        { type: 'pos', text: '頂棚設計很漂亮，且地面保留了植栽空間，感覺社區變明亮了。' },
        { type: 'pos', text: '對房價絕對是利多，綠色基礎設施是現代城市的指標。' },
        { type: 'neu', text: '希望政府能做好植栽維護，不然只有水泥體會很突兀。' }
    ],
    con: [
        { type: 'neg', text: '距離我家太近了！在6公尺橋上騎車的人完全可以看到我二樓房間！' },
        { type: 'neg', text: '10公尺高的頂棚龐然大物擋在前面，每天看著覺得很有壓迫感。' },
        { type: 'neg', text: '這肯定會帶來噪音跟髒亂，房價一定會跌。' },
        { type: 'neu', text: '設計圖看起來不錯，但施工期的黑暗期讓人擔憂。' }
    ]
};

let priceChart;
let ctx2d;
let resizeTimeout;

// Three.js Globals
let scene, camera, renderer, controls;
let corridorGroup, analysisGroup;

function init() {
    ctx2d = els.canvas2d.getContext('2d');
    initChart();
    initThreeJS();
    attachEventListeners();
    window.dispatchEvent(new Event('resize')); // initial resize trigger
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
    
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Resize 2D
            const parent2d = els.canvas2d.parentElement;
            const w2d = parent2d.offsetWidth;
            const h2d = parent2d.offsetHeight;
            if (els.canvas2d.width !== w2d * window.devicePixelRatio || els.canvas2d.height !== h2d * window.devicePixelRatio) {
                els.canvas2d.width = w2d * window.devicePixelRatio;
                els.canvas2d.height = h2d * window.devicePixelRatio;
                ctx2d.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
                drawViz2D();
            }

            // Resize 3D
            if (camera && renderer) {
                camera.aspect = els.container3D.offsetWidth / els.container3D.offsetHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(els.container3D.offsetWidth, els.container3D.offsetHeight);
            }
        }, 100);
    });
}

// ----------------------------------------------------
// CANVAS 2D DRAWING LOGIC
// ----------------------------------------------------
function drawPerson(ctx, x, y, scale) {
    const h = 1.7 * scale;
    const w = 0.5 * scale;
    ctx.fillStyle = '#64748b'; 
    ctx.beginPath();
    ctx.arc(x, y - h + w/2, w/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - w/3, y - h + w, w/1.5, h - w);
}

function drawTree2D(ctx, x, y, scale) {
    const trunkW = 0.6 * scale;
    const trunkH = 2 * scale;
    ctx.fillStyle = '#78350f'; 
    ctx.fillRect(x - trunkW/2, y - trunkH, trunkW, trunkH);
    
    ctx.fillStyle = 'rgba(124, 154, 143, 0.8)';
    ctx.beginPath(); ctx.arc(x, y - trunkH - 1.5 * scale, 2.5 * scale, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x - 1.5 * scale, y - trunkH - 0.5 * scale, 2 * scale, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 1.5 * scale, y - trunkH - 0.5 * scale, 2 * scale, 0, Math.PI * 2); ctx.fill();
}

function drawViz2D() {
    const w = els.canvas2d.width / window.devicePixelRatio;
    const h = els.canvas2d.height / window.devicePixelRatio;
    if(w === 0 || h === 0) return;

    ctx2d.clearRect(0, 0, w, h);

    const scale = 12; 
    const groundY = h - 30;
    const bldgX = 50;
    const corridorX = bldgX + state.distance * scale;
    const eyeHeight = config.floorHeights[state.floorIndex];
    const eyeY = groundY - eyeHeight * scale;

    ctx2d.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx2d.lineWidth = 1;
    for(let i=0; i<w; i+=scale) {
        ctx2d.beginPath(); ctx2d.moveTo(i, 0); ctx2d.lineTo(i, h); ctx2d.stroke();
    }
    
    ctx2d.beginPath(); ctx2d.moveTo(0, groundY); ctx2d.lineTo(w, groundY);
    ctx2d.strokeStyle = 'rgba(0, 0, 0, 0.2)'; ctx2d.lineWidth = 2; ctx2d.stroke();

    if (state.viewMode === 'svf') {
        const pedX = bldgX + 3 * scale;
        const pedY = groundY - 1.6 * scale;
        const bldgTopX = bldgX, bldgTopY = groundY - 15 * scale;
        const corrTopX = corridorX, corrTopY = groundY - config.canopyHeight * scale;
        const a1 = Math.atan2(pedY - bldgTopY, pedX - bldgTopX); 
        const a2 = Math.atan2(pedY - corrTopY, corrTopX - pedX); 

        ctx2d.fillStyle = 'rgba(148, 163, 184, 0.15)'; 
        ctx2d.beginPath(); ctx2d.moveTo(pedX, pedY); ctx2d.arc(pedX, pedY, 300, Math.PI + a1, -a2, false); ctx2d.fill();

        ctx2d.fillStyle = 'rgba(225, 29, 72, 0.05)'; 
        ctx2d.beginPath(); ctx2d.moveTo(pedX, pedY); ctx2d.arc(pedX, pedY, 300, -a2, 0, false); ctx2d.fill();

        ctx2d.beginPath(); ctx2d.moveTo(pedX, pedY); ctx2d.arc(pedX, pedY, 300, Math.PI, Math.PI + a1, false); ctx2d.fill();

        ctx2d.setLineDash([4, 4]); ctx2d.strokeStyle = '#94a3b8';
        ctx2d.beginPath(); ctx2d.moveTo(pedX, pedY); ctx2d.lineTo(bldgTopX, bldgTopY); ctx2d.stroke();
        ctx2d.beginPath(); ctx2d.moveTo(pedX, pedY); ctx2d.lineTo(corrTopX, corrTopY); ctx2d.stroke();
        ctx2d.setLineDash([]);
    }

    ctx2d.fillStyle = 'rgba(100, 116, 139, 0.1)'; 
    ctx2d.fillRect(0, groundY - 15 * scale, bldgX, 15 * scale);
    ctx2d.strokeStyle = '#94a3b8'; ctx2d.strokeRect(0, groundY - 15 * scale, bldgX, 15 * scale);

    const deckY = groundY - config.corridorHeight * scale;
    const canopyY = groundY - config.canopyHeight * scale;
    const corrW = config.corridorWidth * scale;
    
    ctx2d.strokeStyle = '#94a3b8'; ctx2d.lineWidth = 6;
    ctx2d.beginPath(); ctx2d.moveTo(corridorX + corrW + 2*scale, groundY); 
    ctx2d.lineTo(corridorX + corrW/2, canopyY); ctx2d.stroke();
    
    ctx2d.strokeStyle = 'rgba(0, 0, 0, 0.2)'; ctx2d.lineWidth = 1;
    ctx2d.beginPath(); ctx2d.moveTo(corridorX, deckY); ctx2d.lineTo(corridorX, deckY - 1.2*scale); ctx2d.stroke();
    ctx2d.beginPath(); ctx2d.moveTo(corridorX + corrW, deckY); ctx2d.lineTo(corridorX + corrW, deckY - 1.2*scale); ctx2d.stroke();

    ctx2d.fillStyle = '#7c9a8f'; ctx2d.fillRect(corridorX, deckY, corrW, 10);
    
    ctx2d.strokeStyle = '#7c9a8f'; ctx2d.fillStyle = 'rgba(124, 154, 143, 0.1)'; ctx2d.lineWidth = 3;
    ctx2d.beginPath(); ctx2d.moveTo(corridorX - scale, canopyY - 1.5*scale);
    ctx2d.lineTo(corridorX + corrW/2, canopyY); ctx2d.lineTo(corridorX + corrW + scale, canopyY - 1.5*scale);
    ctx2d.fill(); ctx2d.stroke();

    if(state.distance >= 4) drawTree2D(ctx2d, bldgX + (state.distance * scale)/2, groundY, scale);
    drawTree2D(ctx2d, corridorX + corrW + 3*scale, groundY, scale);

    drawPerson(ctx2d, bldgX + 3 * scale, groundY, scale); 
    drawPerson(ctx2d, corridorX + corrW / 2 + 10, deckY, scale); 

    if (state.viewMode === 'res') {
        ctx2d.fillStyle = '#1e293b';
        ctx2d.beginPath(); ctx2d.arc(bldgX - 5, eyeY, 4, 0, Math.PI * 2); ctx2d.fill();
        ctx2d.beginPath(); ctx2d.arc(bldgX - 5, eyeY, 8, 0, Math.PI * 2);
        ctx2d.strokeStyle = 'rgba(0, 0, 0, 0.3)'; ctx2d.stroke();

        ctx2d.setLineDash([4, 4]); ctx2d.beginPath(); ctx2d.moveTo(bldgX - 5, eyeY);
        ctx2d.lineTo(corridorX + corrW/2, deckY - 1.5*scale); 
        ctx2d.strokeStyle = '#e11d48'; ctx2d.stroke(); ctx2d.setLineDash([]);
    }
    
    ctx2d.font = '10px monospace'; ctx2d.fillStyle = '#64748b'; 
    ctx2d.fillText(`${state.distance}m`, bldgX + (state.distance * scale)/2 - 10, groundY - 10);
    ctx2d.fillText('6m 寬', corridorX + corrW + 5, deckY + 15);
}

// ----------------------------------------------------
// THREE.JS 3D SCENE SETUP
// ----------------------------------------------------
function initThreeJS() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#f8fafc'); 

    camera = new THREE.PerspectiveCamera(45, els.container3D.offsetWidth / els.container3D.offsetHeight, 0.1, 1000);
    camera.position.set(12, 10, 18);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(els.container3D.offsetWidth, els.container3D.offsetHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    els.container3D.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(3, 5, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    build3DScene();

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

function build3DScene() {
    // Materials
    const groundMat = new THREE.MeshLambertMaterial({ color: '#f8fafc' }); 
    const roadMat = new THREE.MeshLambertMaterial({ color: '#94a3b8' }); // Road
    const sidewalkMat = new THREE.MeshLambertMaterial({ color: '#e2e8f0' }); // Sidewalk
    const bldgMat = new THREE.MeshLambertMaterial({ color: '#cbd5e1' }); 
    const glassMat = new THREE.MeshPhongMaterial({ color: '#38bdf8', shininess: 100, opacity: 0.8, transparent: true }); // Windows
    const deckMat = new THREE.MeshLambertMaterial({ color: '#7c9a8f' }); 
    const canopyMat = new THREE.MeshLambertMaterial({ color: '#8ba397', transparent: true, opacity: 0.9 }); 
    const pillarMat = new THREE.MeshLambertMaterial({ color: '#64748b' }); 
    const railMat = new THREE.MeshLambertMaterial({ color: '#94a3b8' }); 
    const treeMat = new THREE.MeshLambertMaterial({ color: '#5b8a72' });
    const trunkMat = new THREE.MeshLambertMaterial({ color: '#78350f' });

    // Helper to create a more realistic humanoid figure
    function createHuman() {
        const group = new THREE.Group();
        const shirtMat = new THREE.MeshLambertMaterial({ color: '#3b82f6' }); // Blue shirt
        const skinMat = new THREE.MeshLambertMaterial({ color: '#fcd34d' });  // Skin tone
        const pantsMat = new THREE.MeshLambertMaterial({ color: '#1e293b' }); // Dark pants
        const shoeMat = new THREE.MeshLambertMaterial({ color: '#0f172a' });  // Shoes

        // Torso
        const torsoGeo = new THREE.BoxGeometry(0.45, 0.65, 0.25);
        const torso = new THREE.Mesh(torsoGeo, shirtMat);
        torso.position.y = 0.95; 
        torso.castShadow = true;
        group.add(torso);

        // Head
        const headGeo = new THREE.SphereGeometry(0.14, 16, 16);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 1.45; 
        head.castShadow = true;
        group.add(head);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.18, 0.6, 0.18);
        const legL = new THREE.Mesh(legGeo, pantsMat);
        legL.position.set(-0.12, 0.35, 0);
        legL.castShadow = true;
        group.add(legL);

        const legR = new THREE.Mesh(legGeo, pantsMat);
        legR.position.set(0.12, 0.35, 0);
        legR.castShadow = true;
        group.add(legR);

        // Shoes
        const shoeGeo = new THREE.BoxGeometry(0.2, 0.1, 0.25);
        const shoeL = new THREE.Mesh(shoeGeo, shoeMat);
        shoeL.position.set(-0.12, 0.05, 0.03);
        shoeL.castShadow = true;
        group.add(shoeL);

        const shoeR = new THREE.Mesh(shoeGeo, shoeMat);
        shoeR.position.set(0.12, 0.05, 0.03);
        shoeR.castShadow = true;
        group.add(shoeR);

        // Arms
        const armGeo = new THREE.BoxGeometry(0.14, 0.6, 0.14);
        const armL = new THREE.Mesh(armGeo, skinMat);
        armL.position.set(-0.32, 0.9, 0);
        armL.castShadow = true;
        group.add(armL);

        const armR = new THREE.Mesh(armGeo, skinMat);
        armR.position.set(0.32, 0.9, 0);
        armR.castShadow = true;
        group.add(armR);

        // Face direction (small nose)
        const noseGeo = new THREE.SphereGeometry(0.03, 8, 8);
        const nose = new THREE.Mesh(noseGeo, skinMat);
        nose.position.set(0, 1.45, 0.14); // Nose pointing towards +Z
        group.add(nose);

        return group;
    }

    // Ground Base
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Road (x = 3 to 33)
    const roadGeo = new THREE.PlaneGeometry(30, 100);
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(18, 0.01, 0); 
    road.receiveShadow = true;
    scene.add(road);

    // Sidewalk (x = 0 to 3)
    const swGeo = new THREE.PlaneGeometry(3, 100);
    const sidewalk = new THREE.Mesh(swGeo, sidewalkMat);
    sidewalk.rotation.x = -Math.PI / 2;
    sidewalk.position.set(1.5, 0.02, 0); 
    sidewalk.receiveShadow = true;
    scene.add(sidewalk);

    // Grid Helper
    const grid = new THREE.GridHelper(100, 100, 0x000000, 0x000000);
    grid.material.opacity = 0.05;
    grid.material.transparent = true;
    scene.add(grid);

    // Building (Face at X=0)
    const bldgHeight = 15;
    const bldgGeo = new THREE.BoxGeometry(10, bldgHeight, 40);
    const building = new THREE.Mesh(bldgGeo, bldgMat);
    building.position.set(-5, bldgHeight / 2, 0); 
    building.castShadow = true;
    building.receiveShadow = true;
    scene.add(building);

    // Floor lines and Windows
    for (let i = 1; i <= 4; i++) {
        // Floor line
        const lineGeo = new THREE.BoxGeometry(10.1, 0.1, 40.1);
        const lineMat = new THREE.MeshBasicMaterial({ color: '#94a3b8' });
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.position.set(-5, i * 3, 0);
        scene.add(line);

        // Windows (glass panes)
        for (let z = -18; z <= 18; z += 4) {
            const winGeo = new THREE.PlaneGeometry(2.5, 1.8);
            const win = new THREE.Mesh(winGeo, glassMat);
            win.position.set(0.01, i * 3 - 1.2, z); 
            win.rotation.y = Math.PI / 2; 
            scene.add(win);
        }
    }

    // Corridor Group 
    corridorGroup = new THREE.Group();
    scene.add(corridorGroup);

    // Deck
    const corrW = config.corridorWidth;
    const deckGeo = new THREE.BoxGeometry(corrW, 0.5, 40);
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(corrW / 2, config.corridorHeight, 0);
    deck.castShadow = true;
    deck.receiveShadow = true;
    corridorGroup.add(deck);

    // Railings on Deck
    const railH = 1.2;
    const railTopGeo = new THREE.BoxGeometry(0.1, 0.1, 40);
    const railLeft = new THREE.Mesh(railTopGeo, railMat);
    railLeft.position.set(0.1, config.corridorHeight + 0.25 + railH, 0);
    corridorGroup.add(railLeft);
    const railRight = new THREE.Mesh(railTopGeo, railMat);
    railRight.position.set(corrW - 0.1, config.corridorHeight + 0.25 + railH, 0);
    corridorGroup.add(railRight);

    for (let z = -19; z <= 19; z += 2) {
        const postGeo = new THREE.CylinderGeometry(0.05, 0.05, railH);
        const postL = new THREE.Mesh(postGeo, railMat);
        postL.position.set(0.1, config.corridorHeight + 0.25 + railH/2, z);
        corridorGroup.add(postL);
        const postR = new THREE.Mesh(postGeo, railMat);
        postR.position.set(corrW - 0.1, config.corridorHeight + 0.25 + railH/2, z);
        corridorGroup.add(postR);
    }

    // Canopy
    const canopyGeo = new THREE.BoxGeometry(corrW + 1, 0.2, 40);
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(corrW / 2, config.canopyHeight, 0);
    canopy.rotation.z = 0.05; 
    canopy.castShadow = true;
    corridorGroup.add(canopy);

    // Structural Pillars
    for (let z = -15; z <= 15; z += 10) {
        const pillarGeo = new THREE.CylinderGeometry(0.3, 0.4, 11); // Tapered
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(corrW + 0.5, config.canopyHeight / 2, z);
        pillar.rotation.z = Math.PI / 16; 
        pillar.castShadow = true;
        corridorGroup.add(pillar);
        
        // Base
        const baseGeo = new THREE.BoxGeometry(1, 0.5, 1);
        const base = new THREE.Mesh(baseGeo, pillarMat);
        base.position.set(corrW + 0.5 + 1.1, 0.25, z);
        corridorGroup.add(base);
    }

    // Trees (Enhanced Multi-sphere)
    for (let z = -18; z <= 18; z += 6) {
        const tGeo = new THREE.CylinderGeometry(0.2, 0.3, 2.5);
        const trunk = new THREE.Mesh(tGeo, trunkMat);
        trunk.position.set(2, 1.25, z);
        trunk.castShadow = true;
        
        const treeGroup = new THREE.Group();
        treeGroup.add(trunk);

        // Multiple spheres for canopy
        const leafPositions = [
            {y: 3.5, size: 1.5},
            {x: 0.8, y: 3, size: 1.2},
            {x: -0.8, y: 3, size: 1.2},
            {z: 0.8, y: 3, size: 1.2},
            {z: -0.8, y: 3, size: 1.2}
        ];

        leafPositions.forEach(p => {
            const lGeo = new THREE.SphereGeometry(p.size, 7, 7);
            const leaves = new THREE.Mesh(lGeo, treeMat);
            leaves.position.set(2 + (p.x||0), p.y, z + (p.z||0));
            leaves.castShadow = true;
            treeGroup.add(leaves);
        });

        scene.add(treeGroup);
    }

    // Add Human on Deck (Cyclist/Pedestrian for Residential View)
    const deckHuman = createHuman();
    // Rotate human so they face the building (-X direction)
    deckHuman.rotation.y = -Math.PI / 2;
    deckHuman.position.set(corrW / 2, config.corridorHeight + 0.05, 0);
    corridorGroup.add(deckHuman);

    // Add Human on Ground (SVF Pedestrian)
    const groundHuman = createHuman();
    // Rotate human so they face the corridor (+X direction)
    groundHuman.rotation.y = Math.PI / 2;
    groundHuman.position.set(3, 0, 0);
    scene.add(groundHuman);

    analysisGroup = new THREE.Group();
    scene.add(analysisGroup);
}

function updateCamera() {
    if (!corridorGroup) return;
    corridorGroup.position.x = state.distance;
}

function drawAnalysis() {
    while(analysisGroup.children.length > 0) { 
        analysisGroup.remove(analysisGroup.children[0]); 
    }

    const floorH = config.floorHeights[state.floorIndex];
    const targetX = state.distance + config.corridorWidth / 2;

    // 1. Residential Line of Sight
    const material = new THREE.LineBasicMaterial({ color: 0xe11d48, linewidth: 2 });
    const points = [];
    points.push(new THREE.Vector3(0, floorH, 0)); 
    points.push(new THREE.Vector3(targetX, config.corridorHeight + 1.5, 0)); 
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    analysisGroup.add(line);
    
    const sphereGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0xe11d48 });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(targetX, config.corridorHeight + 1.5, 0);
    analysisGroup.add(sphere);

    // 2. SVF Radar Dome
    const pedX = 3;
    const pedY = 1.6;
    const bldgHeight = 15;

    const angleLeft = Math.atan2(bldgHeight - pedY, pedX); 
    let angleRight = 0; 
    if (state.distance - pedX > 0) {
        angleRight = Math.atan2(config.canopyHeight - pedY, state.distance - pedX);
    } else {
        angleRight = Math.PI / 2; 
    }
    
    const radius = 6;
    const zPos = 0;

    const geoBldg = new THREE.CircleGeometry(radius, 32, Math.PI - angleLeft, angleLeft);
    const matBldg = new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
    const meshBldg = new THREE.Mesh(geoBldg, matBldg);
    meshBldg.position.set(pedX, pedY, zPos);
    analysisGroup.add(meshBldg);

    const geoCanopy = new THREE.CircleGeometry(radius, 32, 0, angleRight);
    const matCanopy = new THREE.MeshBasicMaterial({ color: 0xe11d48, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
    const meshCanopy = new THREE.Mesh(geoCanopy, matCanopy);
    meshCanopy.position.set(pedX, pedY, zPos);
    analysisGroup.add(meshCanopy);

    const skyLen = (Math.PI - angleLeft) - angleRight;
    if (skyLen > 0) {
        const geoSky = new THREE.CircleGeometry(radius, 32, angleRight, skyLen);
        const matSky = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
        const meshSky = new THREE.Mesh(geoSky, matSky);
        meshSky.position.set(pedX, pedY, zPos);
        analysisGroup.add(meshSky);
    }
}

// ----------------------------------------------------
// MATH & UI LOGIC
// ----------------------------------------------------

function calculateSVF() {
    const distToBuilding = 3;
    const bldgHeight = 15;
    const eyeHeight = 1.7;
    
    const angleLeft = Math.atan2(bldgHeight - eyeHeight, distToBuilding);
    const blockedLeft = (angleLeft / (Math.PI / 2)) * 50;

    const distToCorridor = state.distance - distToBuilding;
    let angleRight = 0;
    if (distToCorridor > 0) {
        angleRight = Math.atan2(config.canopyHeight - eyeHeight, distToCorridor);
    } else {
        angleRight = Math.PI / 2; 
    }
    const blockedRight = (angleRight / (Math.PI / 2)) * 50;

    const totalBlocked = Math.min(100, blockedLeft + blockedRight);
    const compression = Math.max(0, 100 - (state.distance * 5));

    return { totalBlocked, compression };
}

function update() {
    drawViz2D(); // Draw 2D canvas
    updateCamera(); // Update 3D Camera
    drawAnalysis(); // Draw 3D overlays

    const floorH = config.floorHeights[state.floorIndex];
    
    let oppScore = 100 * Math.exp(-(state.distance - 2) / 6) * (1 - (floorH - 1.5) / 20);
    if(state.scenario === 'pro') oppScore *= 0.7;
    oppScore = Math.min(100, Math.max(0, oppScore));

    let privScore = 100 * Math.exp(-(state.distance - 2) / 5) * Math.exp(-Math.pow(floorH - config.corridorHeight, 2) / 10);
    if(state.scenario === 'pro') privScore *= 0.6;
    privScore = Math.min(100, Math.max(0, privScore));

    els.oppScore.textContent = Math.round(oppScore);
    els.oppBar.style.width = `${oppScore}%`;
    els.oppBar.className = `progress-fill ${oppScore > 60 ? 'gradient-danger' : (oppScore > 30 ? 'gradient-warning' : 'gradient-success')}`;

    els.privScore.textContent = Math.round(privScore);
    els.privBar.style.width = `${privScore}%`;
    els.privBar.className = `progress-fill ${privScore > 60 ? 'gradient-danger' : (privScore > 30 ? 'gradient-warning' : 'gradient-success')}`;

    const svfData = calculateSVF();
    
    els.svfScoreEl.textContent = `${Math.round(svfData.totalBlocked)}%`;
    els.svfBar.style.width = `${svfData.totalBlocked}%`;
    els.svfBar.className = `progress-fill ${svfData.totalBlocked > 80 ? 'gradient-danger' : (svfData.totalBlocked > 50 ? 'gradient-warning' : 'gradient-success')}`;

    els.compressionScoreEl.textContent = `${Math.round(svfData.compression)}%`;
    els.compressionBar.style.width = `${svfData.compression}%`;
    els.compressionBar.className = `progress-fill ${svfData.compression > 70 ? 'gradient-danger' : (svfData.compression > 40 ? 'gradient-warning' : 'gradient-success')}`;

    const combinedImpact = Math.max(oppScore, svfData.totalBlocked);
    let baseApproval = state.scenario === 'pro' ? 65 : 40;
    let penalty = (combinedImpact * 0.3) + (privScore * 0.2); 
    let finalApproval = Math.max(5, Math.min(95, baseApproval - penalty));
    
    els.approvalVal.textContent = `${Math.round(finalApproval)}%`;
    els.supportBar.style.width = `${finalApproval}%`;
    els.opposeBar.style.width = `${100 - finalApproval}%`;
    
    updateFeedbackList(finalApproval, oppScore, privScore, svfData.totalBlocked);

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
}

function updateFeedbackList(approval, opp, priv, svf) {
    let html = '';
    const pool = state.scenario === 'pro' ? feedbackTemplates.pro : feedbackTemplates.con;
    const showFeedback = [];
    
    if(priv > 60) {
        showFeedback.push({ type: 'neg', text: `我家在${config.floorLabels[state.floorIndex]}，離走道才${state.distance}公尺，騎士高度跟我家一樣，隱私完全被看光。` });
    } else if(priv < 30 && state.scenario === 'pro') {
        showFeedback.push({ type: 'pos', text: `這個距離剛剛好，且視角不會對到，不會互相干擾。` });
    } else {
        showFeedback.push(pool[Math.floor(Math.random() * pool.length)]);
    }

    if(state.viewMode === 'svf' && svf > 80) {
        showFeedback.push({ type: 'neg', text: `10公尺高的頂棚把天空遮蔽了超過80%，走在一樓覺得像是在隧道裡，非常壓迫。` });
    } else if (opp > 60) {
        showFeedback.push({ type: 'neg', text: `那麼巨大的頂棚就在眼前，景觀感覺很壓迫，可能會影響區域發展。` });
    } else {
        showFeedback.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    
    showFeedback.push(pool[0]);

    showFeedback.forEach(f => {
        html += `
            <li class="feedback-item ${f.type}">
                <span>${f.text}</span>
            </li>
        `;
    });
    
    els.feedbackList.innerHTML = html;
}

function updateAnalysisText(envImpact, combinedImpact, priv) {
    let text = "";
    if (envImpact > 0) {
        text = `強勁的綠色溢價：距離與視角配置得宜，天空視野開闊，預期能享受較高環境紅利，長期具增值潛力。`;
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

function initChart() {
    const chartCtx = document.getElementById('price-chart').getContext('2d');
    
    Chart.defaults.color = '#64748b'; 
    Chart.defaults.font.family = "'Inter', 'Noto Sans TC', sans-serif";
    
    priceChart = new Chart(chartCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '預測房價指數 (Base=100)',
                data: [],
                borderColor: '#7c9a8f',
                backgroundColor: 'rgba(124, 154, 143, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#7c9a8f',
                pointBorderColor: '#ffffff',
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
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#1e293b',
                    bodyColor: '#1e293b',
                    borderColor: 'rgba(0,0,0,0.1)',
                    borderWidth: 1,
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
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
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
    
    let currentVal = 100; 
    for(let i = 0; i <= years; i++) {
        labels.push(`第${i}年`);
        data.push(currentVal.toFixed(1));
        currentVal *= (1 + growthRate);
    }
    
    priceChart.data.labels = labels;
    priceChart.data.datasets[0].data = data;
    
    const isPositive = growthRate > config.baseGrowthRate;
    const color = isPositive ? '#7c9a8f' : (growthRate < 0 ? '#e11d48' : '#64748b');
    const bgColor = isPositive ? 'rgba(124, 154, 143, 0.1)' : (growthRate < 0 ? 'rgba(225, 29, 72, 0.1)' : 'rgba(100, 116, 139, 0.1)');
    
    priceChart.data.datasets[0].borderColor = color;
    priceChart.data.datasets[0].pointBackgroundColor = color;
    priceChart.data.datasets[0].backgroundColor = bgColor;
    
    priceChart.update();
}

document.addEventListener('DOMContentLoaded', init);
