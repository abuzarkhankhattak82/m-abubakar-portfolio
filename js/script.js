/* ===== 3D SCENE – Medical Cross with Mouse Parallax ===== */
(function init3D() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;
    const container = document.getElementById('three-container');

    const width = container.clientWidth || 460;
    const size = Math.min(width, 460);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x061724);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(3, 2, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // Lights
    const ambient = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(2, 5, 4);
    key.castShadow = true;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x3ecf8e, 0.4);
    fill.position.set(-3, 1, 2);
    scene.add(fill);

    const back = new THREE.DirectionalLight(0x1a4a6f, 0.6);
    back.position.set(0, -1, -5);
    scene.add(back);

    // Main Cross
    const group = new THREE.Group();

    const geoV = new THREE.BoxGeometry(0.7, 2.8, 0.7);
    const mat = new THREE.MeshStandardMaterial({
        color: 0x3ecf8e,
        metalness: 0.25,
        roughness: 0.35,
        emissive: 0x1a6a4a,
        emissiveIntensity: 0.15,
    });
    const vert = new THREE.Mesh(geoV, mat);
    vert.castShadow = true;
    group.add(vert);

    const geoH = new THREE.BoxGeometry(2.8, 0.7, 0.7);
    const horiz = new THREE.Mesh(geoH, mat);
    horiz.castShadow = true;
    group.add(horiz);

    const sphereGeo = new THREE.SphereGeometry(0.5, 24, 24);
    const sphereMat = new THREE.MeshStandardMaterial({
        color: 0x3ecf8e,
        emissive: 0x3ecf8e,
        emissiveIntensity: 0.35,
        metalness: 0.1,
        roughness: 0.2,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.castShadow = true;
    group.add(sphere);

    const ringMat = new THREE.MeshStandardMaterial({
        color: 0x3ecf8e,
        emissive: 0x3ecf8e,
        emissiveIntensity: 0.1,
        wireframe: false,
        metalness: 0.6,
        roughness: 0.2,
        transparent: true,
        opacity: 0.25,
    });
    for (let i = 0; i < 2; i++) {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.85 + i * 0.25, 0.04, 16, 32),
            ringMat
        );
        ring.rotation.x = Math.PI / 2;
        ring.rotation.z = i * 0.6;
        group.add(ring);
    }

    scene.add(group);

    // Particles
    const particleCount = 120;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 10;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
        color: 0x3ecf8e,
        size: 0.045,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Animation
    let clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const t = clock.getElapsedTime();

        // Auto-rotation
        group.rotation.x = Math.sin(t * 0.25) * 0.08;
        group.rotation.y += 0.005; // slow auto-rotate

        // Mouse parallax – subtle offset
        if (window._mouseX !== undefined) {
            const targetRotY = window._mouseX * 0.2;
            const targetRotX = window._mouseY * 0.1;
            group.rotation.y += (targetRotY - group.rotation.y) * 0.01;
            group.rotation.x += (targetRotX - group.rotation.x) * 0.01;
        }

        const pulse = 1 + 0.06 * Math.sin(t * 1.6);
        sphere.scale.set(pulse, pulse, pulse);

        const rings = group.children.filter(
            c => c.isMesh && c.geometry.type === 'TorusGeometry'
        );
        rings.forEach((r, i) => {
            r.rotation.z = t * (0.3 + i * 0.1) + i * 0.8;
        });

        const pos = particles.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            pos[i3 + 1] += Math.sin(t * 0.5 + i) * 0.0003;
            pos[i3] += Math.cos(t * 0.4 + i * 0.5) * 0.0003;
        }
        particles.geometry.attributes.position.needsUpdate = true;
        particles.rotation.y = t * 0.02;

        renderer.render(scene, camera);
    }

    animate();

    // Resize
    function resize() {
        const w = container.clientWidth || 460;
        const s = Math.min(w, 460);
        renderer.setSize(s, s);
        camera.aspect = 1;
        camera.updateProjectionMatrix();
    }

    window.addEventListener('resize', resize);
    if (window.ResizeObserver) {
        const ro = new ResizeObserver(resize);
        ro.observe(container);
    }

    // Mouse move parallax
    document.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        window._mouseX = x;
        window._mouseY = -y;
    });
})();


/* ===== TYPING EFFECT ===== */
document.addEventListener('DOMContentLoaded', () => {
    const textElement = document.getElementById('typing-text');
    if (textElement) {
        const text = 'Dispenser Technician • Pharmacy Technician';
        let index = 0;
        let isDeleting = false;

        function type() {
            if (!isDeleting) {
                textElement.textContent = text.substring(0, index + 1);
                index++;
                if (index === text.length) {
                    isDeleting = true;
                    setTimeout(type, 2000);
                    return;
                }
                setTimeout(type, 50);
            } else {
                textElement.textContent = text.substring(0, index - 1);
                index--;
                if (index === 0) {
                    isDeleting = false;
                    setTimeout(type, 500);
                    return;
                }
                setTimeout(type, 30);
            }
        }

        type();
    }

    // ===== COUNTER ANIMATION =====
    const counters = document.querySelectorAll('.counter');
    let countersStarted = false;

    function startCounters() {
        if (countersStarted) return;
        countersStarted = true;

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const stepTime = 20;
            const steps = duration / stepTime;
            let current = 0;
            const increment = target / steps;

            const updateCounter = () => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    return;
                }
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            };
            updateCounter();
        });
    }

    // Observe counters section
    const counterSection = document.querySelector('.tagline');
    if (counterSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        observer.observe(counterSection);
    }


    // ===== HAMBURGER =====
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
            });
        });
    }


    // ===== SCROLL REVEAL =====
    const reveals = document.querySelectorAll('.reveal');
    const stagers = document.querySelectorAll('.stagger');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => observer.observe(el));
    stagers.forEach(el => observer.observe(el));


    // ===== NAV SHADOW =====
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            nav.style.boxShadow = '0 4px 30px rgba(0,0,0,0.4)';
        } else {
            nav.style.boxShadow = 'none';
        }
    });


    // ===== SMOOTH ANCHOR SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const top = target.getBoundingClientRect().top +
                    window.pageYOffset - 70;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
});
