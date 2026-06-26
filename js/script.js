/* ===== 3D SCENE – Medical Cross ===== */
(function init3D() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    const width = canvas.parentElement.clientWidth || 460;
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

        group.rotation.x = Math.sin(t * 0.25) * 0.08;
        group.rotation.y = t * 0.35;

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
        const w = canvas.parentElement.clientWidth || 460;
        const s = Math.min(w, 460);
        renderer.setSize(s, s);
        camera.aspect = 1;
        camera.updateProjectionMatrix();
    }

    window.addEventListener('resize', resize);
    if (window.ResizeObserver) {
        const ro = new ResizeObserver(resize);
        ro.observe(canvas.parentElement);
    }
})();

/* ===== DOM INTERACTIONS ===== */
document.addEventListener('DOMContentLoaded', () => {
    // Hamburger
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

    // Scroll Reveal
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

    // Nav shadow
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            nav.style.boxShadow = '0 4px 30px rgba(0,0,0,0.4)';
        } else {
            nav.style.boxShadow = 'none';
        }
    });

    // Smooth anchor scroll
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
