document.addEventListener('DOMContentLoaded', () => {
	gsap.registerPlugin(ScrollTrigger);

	const lenis = new Lenis();
	lenis.on('scroll', ScrollTrigger.update);
	gsap.ticker.add((time) => {
		lenis.raf(time * 1000);
	});
	gsap.ticker.lagSmoothing(0);

	const mainSection = document.querySelector('.wrapper-action');
	const hero = document.querySelector('.hero');
	const content = document.querySelector('.content-after');
	const contentBefore = document.querySelector('.content-before');
	const gallerySection = document.querySelector('.gallery-section');
	const images = document.querySelectorAll('.gallery-section .images img');
	const barcode = document.querySelector('.futuristic-barcode');
	const barcodeBars = document.querySelectorAll('.futuristic-barcode rect[style*="--bar-index"]');
	const dataPoints = document.querySelectorAll('.futuristic-barcode circle[style*="--data-index"]');
	const particles = document.querySelectorAll('.futuristic-barcode circle[style*="--particle-index"]');
	const heroBarcode = document.querySelector('.hero-barcode');
	const heroBarcodeContainer = document.querySelector('.hero-barcode-container');
	const heroImage = document.querySelector('.pixel-loader');

	const precargarImagenes = () => {
		images.forEach(img => {
			const newImg = new Image();
			newImg.src = img.src;
		});
	};

	precargarImagenes();

	const extraerColoresDominantes = (imagen) => {
		return new Promise((resolve) => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			const img = new Image();

			img.crossOrigin = 'anonymous';
			img.onload = () => {
				canvas.width = 200;
				canvas.height = 200;
				ctx.drawImage(img, 0, 0, 200, 200);

				const imageData = ctx.getImageData(0, 0, 200, 200);
				const data = imageData.data;
				const colorCounts = {};
				const colorSamples = [];

				for (let i = 0; i < data.length; i += 4) {
					const r = data[i];
					const g = data[i + 1];
					const b = data[i + 2];
					const a = data[i + 3];

					if (a < 100 || (r < 30 && g < 30 && b < 30)) continue;

					if (r > 240 && g > 240 && b > 240) continue;

					const roundedR = Math.round(r / 10) * 10;
					const roundedG = Math.round(g / 10) * 10;
					const roundedB = Math.round(b / 10) * 10;

					const colorKey = `${roundedR},${roundedG},${roundedB}`;
					colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;

					colorSamples.push({ r, g, b, a });
				}

				const sortedColors = Object.entries(colorCounts)
				.sort(([,a], [,b]) => b - a)
				.slice(0, 6)
				.map(([color]) => {
					const [r, g, b] = color.split(',').map(Number);
					return { r, g, b, key: color };
				});

				const filteredColors = [];
				const usedColors = new Set();

				for (const color of sortedColors) {
					let isSimilar = false;
					for (const usedColor of usedColors) {
						const distance = Math.sqrt(
							Math.pow(color.r - usedColor.r, 2) +
							Math.pow(color.g - usedColor.g, 2) +
							Math.pow(color.b - usedColor.b, 2)
						);
						if (distance < 50) {
							isSimilar = true;
							break;
						}
					}

					if (!isSimilar) {
						filteredColors.push(color);
						usedColors.add(color);
						if (filteredColors.length >= 3) break;
					}
				}

				const finalColors = filteredColors.map(color => {
					const hsl = rgbToHsl(color.r, color.g, color.b);
					const enhancedHsl = {
						h: hsl.h,
						s: Math.min(100, hsl.s * 1.2),
						l: Math.max(20, Math.min(80, hsl.l))
					};
					const enhancedRgb = hslToRgb(enhancedHsl.h, enhancedHsl.s, enhancedHsl.l);
					return `rgb(${Math.round(enhancedRgb.r)},${Math.round(enhancedRgb.g)},${Math.round(enhancedRgb.b)})`;
				});

				while (finalColors.length < 3) {
					const defaultColors = ['#00ff88', '#00ffff', '#0088ff', '#ff6b6b', '#4ecdc4', '#45b7d1'];
					finalColors.push(defaultColors[finalColors.length]);
				}

				resolve(finalColors.slice(0, 3));
			};

			img.src = imagen.src;
		});
	};

	const rgbToHsl = (r, g, b) => {
		r /= 255;
		g /= 255;
		b /= 255;

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h, s, l = (max + min) / 2;

		if (max === min) {
			h = s = 0;
		} else {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}

		return {
			h: h * 360,
			s: s * 100,
			l: l * 100
		};
	};

	const hslToRgb = (h, s, l) => {
		h /= 360;
		s /= 100;
		l /= 100;

		const hue2rgb = (p, q, t) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1/6) return p + (q - p) * 6 * t;
			if (t < 1/2) return q;
			if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
			return p;
		};

		let r, g, b;

		if (s === 0) {
			r = g = b = l;
		} else {
			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}

		return {
			r: Math.round(r * 255),
			g: Math.round(g * 255),
			b: Math.round(b * 255)
		};
	};

	const aplicarColoresAlHero = async () => {
		if (!heroImage || !heroBarcode) return;

		try {
			const colores = await extraerColoresDominantes(heroImage);
			console.log('Colores extraídos:', colores);

			const crearVariaciones = (color) => {
				const rgb = color.match(/\d+/g).map(Number);
				const [r, g, b] = rgb;

				return {
					original: color,
					light: `rgb(${Math.min(255, r + 30)},${Math.min(255, g + 30)},${Math.min(255, b + 30)})`,
					dark: `rgb(${Math.max(0, r - 30)},${Math.max(0, g - 30)},${Math.max(0, b - 30)})`,
					vibrant: `rgb(${Math.min(255, Math.round(r * 1.2))},${Math.min(255, Math.round(g * 1.2))},${Math.min(255, Math.round(b * 1.2))})`
				};
			};

			const variaciones = colores.map(crearVariaciones);

			const gradient = heroBarcode.querySelector('#heroBarcodeGradient');
			if (gradient) {
				const stops = gradient.querySelectorAll('stop');
				stops[0].setAttribute('stop-color', variaciones[0]?.original || '#00ff88');
				stops[1].setAttribute('stop-color', variaciones[1]?.vibrant || '#00ffff');
				stops[2].setAttribute('stop-color', variaciones[2]?.original || '#0088ff');

				stops.forEach(stop => {
					stop.style.transition = 'stop-color 0.5s ease-in-out';
				});
			}

			const scanLines = heroBarcode.querySelectorAll('line[style*="--scan-index"]');
			scanLines.forEach((line, index) => {
				const colorIndex = index % colores.length;
				const variation = index === 0 ? 'vibrant' : index === 1 ? 'light' : 'original';
				line.setAttribute('stroke', variaciones[colorIndex]?.[variation] || colores[colorIndex] || '#00ff88');
				line.style.transition = 'stroke 0.5s ease-in-out';
			});

			const dataPoints = heroBarcode.querySelectorAll('circle[style*="--data-index"]');
			dataPoints.forEach((point, index) => {
				const colorIndex = index % colores.length;
				const variation = index % 2 === 0 ? 'vibrant' : 'light';
				point.setAttribute('fill', variaciones[colorIndex]?.[variation] || colores[colorIndex] || '#00ff88');
				point.style.transition = 'fill 0.5s ease-in-out';
			});

			const particles = heroBarcode.querySelectorAll('circle[style*="--particle-index"]');
			particles.forEach((particle, index) => {
				const colorIndex = index % colores.length;
				const variations = ['original', 'light', 'vibrant', 'dark'];
				const variation = variations[index % variations.length];
				particle.setAttribute('fill', variaciones[colorIndex]?.[variation] || colores[colorIndex] || '#00ff88');
				particle.style.transition = 'fill 0.5s ease-in-out';
			});

			const heroBarcodeElement = heroBarcode;
			if (heroBarcodeElement) {
				const mainColor = colores[0] || '#00ff88';
				const rgbValues = mainColor.match(/\d+/g);
				if (rgbValues && rgbValues.length >= 3) {
					const [r, g, b] = rgbValues.map(Number);
					heroBarcodeElement.style.setProperty('--hero-glow-color', `${r}, ${g}, ${b}`);
				}
			}

			console.log('Colores aplicados exitosamente al código de barras del hero');

		} catch (error) {
			console.log('No se pudieron extraer colores de la imagen, usando colores por defecto:', error);
		}
	};


	const observarCambiosEnHero = () => {
		if (!heroImage) return;


		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
					console.log('Imagen del hero cambiada, actualizando colores...');
					setTimeout(() => {
						aplicarColoresAlHero();
					}, 500);
				}
			});
		});

		observer.observe(heroImage, {
			attributes: true,
			attributeFilter: ['src']
		});


		const styleObserver = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === 'attributes' && 
						(mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
					console.log('Estilo del hero cambiado, actualizando colores...');
					setTimeout(() => {
						aplicarColoresAlHero();
					}, 300);
				}
			});
		});

		styleObserver.observe(heroImage, {
			attributes: true,
			attributeFilter: ['style', 'class']
		});
	};


	const animarCodigoBarras = () => {
		if (!barcode) return;


		gsap.fromTo(barcode, 
								{
			scale: 0,
			rotation: 180,
			opacity: 0
		},
								{
			scale: 1,
			rotation: 0,
			opacity: 1,
			duration: 1.5,
			ease: "back.out(1.7)",
			delay: 0.5
		}
							 );


		gsap.fromTo(barcodeBars,
								{
			scaleY: 0,
			transformOrigin: "center bottom"
		},
								{
			scaleY: 1,
			duration: 0.8,
			stagger: 0.05,
			ease: "power2.out",
			delay: 1.2
		}
							 );


		gsap.fromTo(dataPoints,
								{
			scale: 0,
			opacity: 0
		},
								{
			scale: 1,
			opacity: 1,
			duration: 0.6,
			stagger: 0.1,
			ease: "elastic.out(1, 0.3)",
			delay: 1.8
		}
							 );


		gsap.fromTo(particles,
								{
			scale: 0,
			opacity: 0,
			y: 0
		},
								{
			scale: 1,
			opacity: 0.7,
			y: -20,
			duration: 1,
			stagger: 0.2,
			ease: "power2.out",
			delay: 2.2
		}
							 );


		gsap.to(barcode, {
			filter: "drop-shadow(0 0 20px rgba(0, 255, 136, 0.8))",
			duration: 2,
			ease: "power2.inOut",
			yoyo: true,
			repeat: -1,
			delay: 2.5
		});


		gsap.to(barcodeBars, {
			opacity: 0.3,
			duration: 0.1,
			stagger: {
				amount: 0.5,
				from: "random"
			},
			ease: "power2.inOut",
			yoyo: true,
			repeat: -1,
			delay: 3
		});
	};


	animarCodigoBarras();


	if (barcode) {
		barcode.addEventListener('mouseenter', () => {
			gsap.to(barcode, {
				scale: 1.1,
				filter: "drop-shadow(0 0 25px rgba(0, 255, 136, 1))",
				duration: 0.3,
				ease: "power2.out"
			});

			gsap.to(particles, {
				scale: 1.5,
				duration: 0.3,
				ease: "power2.out"
			});
		});

		barcode.addEventListener('mouseleave', () => {
			gsap.to(barcode, {
				scale: 1,
				filter: "drop-shadow(0 0 10px rgba(0, 255, 136, 0.3))",
				duration: 0.3,
				ease: "power2.out"
			});

			gsap.to(particles, {
				scale: 1,
				duration: 0.3,
				ease: "power2.out"
			});
		});

		barcode.addEventListener('click', () => {
			gsap.to(barcodeBars, {
				scaleY: 0.1,
				duration: 0.1,
				stagger: 0.02,
				ease: "power2.inOut",
				yoyo: true,
				repeat: 1
			});

			gsap.to(dataPoints, {
				scale: 2,
				duration: 0.2,
				ease: "power2.out",
				yoyo: true,
				repeat: 1
			});

			gsap.to(particles, {
				scale: 3,
				opacity: 1,
				duration: 0.3,
				ease: "power2.out",
				yoyo: true,
				repeat: 1
			});
		});
	}

	gsap.to(hero, {
		'--black': '0%',
		'--transparent': '0%',
		'--degrade': '-90deg',
		duration: 2,
		ease: 'power2.out',
	});

	gsap.to('.pixel-loader', {
		filter: 'contrast(100%) saturate(100%)',
		scale: 1,
		duration: 2,
		ease: 'power2.out',
	});

	gsap.to('.pixel-overlay', {
		opacity: 0,
		duration: 2,
		ease: 'power2.out',
		delay: 1
	});

	aplicarColoresAlHero();

	observarCambiosEnHero();

	gsap.fromTo(heroBarcodeContainer, 
							{
		opacity: 0,
		scale: 0,
		rotation: 45,
		y: 50
	},
							{
		opacity: 1,
		scale: 1,
		rotation: 0,
		y: 0,
		duration: 2,
		ease: "back.out(1.7)",
		delay: 1.5
	}
						 );

	const heroBars = heroBarcode?.querySelectorAll('rect[style*="--bar-index"]');
	if (heroBars) {
		gsap.fromTo(heroBars,
								{
			scaleY: 0,
			transformOrigin: "center bottom"
		},
								{
			scaleY: 1,
			duration: 1.2,
			stagger: 0.03,
			ease: "power2.out",
			delay: 3.2
		}
							 );
	}

	const heroDataPoints = heroBarcode?.querySelectorAll('circle[style*="--data-index"]');
	if (heroDataPoints) {
		gsap.fromTo(heroDataPoints,
								{
			scale: 0,
			opacity: 0
		},
								{
			scale: 1,
			opacity: 1,
			duration: 0.8,
			stagger: 0.15,
			ease: "elastic.out(1, 0.3)",
			delay: 4
		}
							 );
	}

	const heroParticles = heroBarcode?.querySelectorAll('circle[style*="--particle-index"]');
	if (heroParticles) {
		gsap.fromTo(heroParticles,
								{
			scale: 0,
			opacity: 0,
			y: 0
		},
								{
			scale: 1,
			opacity: 0.7,
			y: -30,
			duration: 1.5,
			stagger: 0.3,
			ease: "power2.out",
			delay: 4.5
		}
							 );
	}

	gsap.to(heroBarcode, {
		filter: "drop-shadow(0 0 40px rgba(0, 255, 136, 1))",
		duration: 3,
		ease: "power2.inOut",
		yoyo: true,
		repeat: -1,
		delay: 5
	});

	const mostrarGaleria = () => {
		if (gallerySection.classList.contains('animated')) return;

		gallerySection.classList.add('animated');

		const imagesLoaded = Array.from(images).every(img => img.complete);

		if (imagesLoaded) {
			animarImagenes();
		} else {
			const loadPromises = Array.from(images).map(img => {
				return new Promise(resolve => {
					if (img.complete) {
						resolve();
					} else {
						img.onload = resolve;
						img.onerror = resolve;
					}
				});
			});

			Promise.all(loadPromises).then(() => {
				animarImagenes();
			});
		}
	};

	const animarImagenes = () => {
		gsap.fromTo(images, 
								{
			x: 100,
			opacity: 0,
		},
								{
			x: 0,
			opacity: 1,
			duration: 1.5,
			stagger: 0.3,
			ease: 'power2.out',
			delay: 0.2
		}
							 );
	};

	const ocultarGaleria = () => {
		if (!gallerySection.classList.contains('animated')) return;

		gallerySection.classList.remove('animated');
		gsap.to(images, {
			opacity: 0,
			x: 100,
			duration: 0.8,
			stagger: 0.1,
			ease: 'power2.in'
		});
	};

	// NOVO CÓDIGO DE INÍCIO
const setupInitialInteraction = () => {
    const audio = document.getElementById('background-audio');
    const startButton = document.getElementById('start-experience-btn');
    const overlay = document.getElementById('initial-overlay');

    if (!audio || !startButton || !overlay) {
        console.error("Elementos de áudio ou botão/overlay não encontrados.");
        return;
    }

    startButton.addEventListener('click', () => {
        // 1. Inicia o áudio
        audio.play().catch(error => {
            console.error("Falha ao tocar áudio após o clique:", error);
            // Se o áudio falhar mesmo após o clique (raro), 
            // ainda removemos a overlay para continuar a experiência.
        });

        // 2. Anima a saída da tela de sobreposição usando GSAP (opcional, mas polido)
        gsap.to(overlay, {
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            onComplete: () => {
                overlay.style.display = 'none';
                
                // Opcional: Se houver outras animações que deveriam 
                // esperar por este clique, você pode chamá-las aqui.
                // Ex: animarConteudoPrincipal();
            }
        });
        
    }, { once: true });
};

// ...
// No final do seu evento DOMContentLoaded:
// ...

// Chamada da nova função
setupInitialInteraction();

	ScrollTrigger.create({
		trigger: '.main-section',
		start: 'top top',
		end: `+=${window.innerHeight * 3}px`,
		pin: true,
		pinSpacing: true,
		scrub: 1,
		onUpdate: (self) => {
			const progress = self.progress;

			if (progress < 0.2) {
				const scale = 1 - (progress * 0.8);
				gsap.to(mainSection, { scale });
			} else {
				gsap.to(mainSection, { scale: 0.8 });
			}

			if (progress > 0.3) {
				gsap.to(content, {
					'--degrade2': '0deg',
					'--transparent2': '0%',
					'--black2': '0%',
					duration: 1.5,
					ease: 'power2.out',
				});
			} else {
				gsap.to(content, {
					'--degrade2': '-150deg',
					'--transparent2': '100%',
					'--black2': '100%',
					duration: 1.5,
					ease: 'power2.out',
				});
			}

			if (progress > 0.6) {
				gsap.to(contentBefore, {
					'--transparent3': '0%',
					'--black3': '0%',
					duration: 2,
					ease: 'power2.out',
				});
			} else {
				gsap.to(contentBefore, {
					'--transparent3': '100%',
					'--black3': '100%',
					duration: 2,
					ease: 'power2.out',
				});
			}

			if (progress > 0.85) {
				gsap.to(gallerySection, {
					'--transparent4': '0%',
					'--black4': '0%',
					duration: 2,
					ease: 'power2.out',
				});
			} else {
				gsap.to(gallerySection, {
					'--transparent4': '100%',
					'--black4': '100%',
					duration: 2,
					ease: 'power2.out',
				});
			}

			if (progress > 0.9) {
				mostrarGaleria();
			} else {
				ocultarGaleria();
			}
		},
	});
});

