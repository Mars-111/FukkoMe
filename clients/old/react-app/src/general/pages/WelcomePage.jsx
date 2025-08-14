import { useState, useEffect } from 'react';
import keycloak from '../../auth/keycloak';

export default function WelcomePage() {
    const [counters, setCounters] = useState({ users: 0, countries: 0, uptime: 0 });
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        // Анимация счетчиков
        const animateCounters = () => {
            const targets = { users: -300, countries: 50, uptime: 999 };
            const duration = 2000;
            const steps = 100;
            const stepTime = duration / steps;

            let step = 0;
            const timer = setInterval(() => {
                step++;
                const progress = step / steps;
                
                setCounters({
                    users: Math.floor(targets.users * progress),
                    countries: Math.floor(targets.countries * progress),
                    uptime: Math.floor(targets.uptime * progress) / 10
                });

                if (step >= steps) {
                    clearInterval(timer);
                }
            }, stepTime);
        };

        const timeout = setTimeout(animateCounters, 2000);
        return () => clearTimeout(timeout);
    }, []);

    const handleButtonClick = (e) => {
        e.preventDefault();
        
        // Создание эффекта взрыва
        const rect = e.target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const newParticles = [];
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const velocity = 100;
            newParticles.push({
                id: Date.now() + i,
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                opacity: 1
            });
        }
        
        setParticles(newParticles);
        
        // Очистка частиц через анимацию
        setTimeout(() => setParticles([]), 1000);
        
        keycloak.register();
        console.log('Начать общение clicked');
    };

    const handleMouseMove = (e) => {
        const floatingParticles = document.querySelectorAll('.floating-particle');
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        floatingParticles.forEach((particle, index) => {
            const speed = (index + 1) * 0.5;
            const x = (mouseX - 0.5) * speed;
            const y = (mouseY - 0.5) * speed;
            
            particle.style.transform = `translate(${x}px, ${y}px)`;
        });
    };

    return (
        <div className="welcome-container" onMouseMove={handleMouseMove} style={styles.container}>
            
            {/* Изображение фон */}
            <div style={styles.imageBackground}></div>
            
            {/* Градиентное затемнение */}
            <div style={styles.overlay}></div>
            
            <div style={styles.contentWrapper}>
                {/* Левая часть - информация */}
                <div style={styles.leftSection}>
                    <h1 style={styles.logo}>Fuko</h1>
                    <p style={styles.tagline}>
                        Мессенджер для игроков real life.
                    </p>
                    <p style={styles.description}>
                        Мессенджер для зумеров ебаных. Ну... И не только.<br/>
                        Заходи потроллякать нормально.
                    </p>
                    
                    <div style={styles.features}>
                        <div style={styles.featureItem}>
                            <span style={styles.featureIcon}>👩‍👦</span>
                            <div style={styles.featureText}>
                                <div style={styles.featureTitle}>СосаL?</div>
                                <div style={styles.featureDesc}>Все что надо, что бы потролякать нищих лузеров</div>
                            </div>
                        </div>
                        
                        <div style={styles.featureItem}>
                            <span style={styles.featureIcon}>⚡</span>
                            <div style={styles.featureText}>
                                <div style={styles.featureTitle}>Скорость</div>
                                <div style={styles.featureDesc}>Ну это факты, я старался</div>
                            </div>
                        </div>
                        
                        <div style={styles.featureItem}>
                            <span style={styles.featureIcon}>🤓</span>
                            <div style={styles.featureText}>
                                <div style={styles.featureTitle}>Нетакуся</div>
                                <div style={styles.featureDesc}>Ты будешь не таким как все</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style={styles.stats}>
                        <div style={styles.statItem}>
                            <span style={styles.statNumber}>{counters.users} RUB</span>
                            <span style={styles.statLabel}>Денег у создателя</span>
                        </div>
                        <div style={styles.statItem}>
                            <span style={styles.statNumber}>{counters.countries}+</span>
                            <span style={styles.statLabel}>Стран</span>
                        </div>
                        <div style={styles.statItem}>
                            <span style={styles.statNumber}>{counters.uptime}%</span>
                            <span style={styles.statLabel}>Время работы</span>
                        </div>
                    </div>
                </div>
                
                {/* Правая часть - кнопка */}
                <div style={styles.rightSection}>
                    <div style={styles.ctaContainer}>
                        <div style={styles.floatingParticles}>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className={`floating-particle particle-${i + 1}`} style={{
                                    ...styles.floatingParticle,
                                    ...styles[`particle${i + 1}`]
                                }}></div>
                            ))}
                        </div>
                        
                        <button 
                            style={styles.ctaButton}
                            onClick={handleButtonClick}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-5px) scale(1.05)';
                                e.target.style.boxShadow = '0 25px 50px rgba(102, 126, 234, 0.6)';
                                e.target.style.background = 'linear-gradient(135deg, #7c8ef7 0%, #8a5fb8 50%, #f5a3ff 100%)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'none';
                                e.target.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.4)';
                                e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)';
                            }}
                        >
                            Начать общение
                        </button>
                        
                        <p style={styles.ctaSubtitle}>Присоединяйся на свой страх и риск</p>
                    </div>
                </div>
            </div>
            
            {/* Анимированные частицы взрыва */}
            {particles.map(particle => (
                <div
                    key={particle.id}
                    style={{
                        ...styles.explosionParticle,
                        left: particle.x,
                        top: particle.y,
                        animation: 'explode 1s ease-out forwards',
                        transform: `translate(${particle.vx * 0.016 * 60}px, ${particle.vy * 0.016 * 60}px)`,
                        opacity: 0
                    }}
                />
            ))}
            
            <style>{keyframes}</style>
        </div>
    );
}

const styles = {
    container: {
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box'
    },
    
    imageBackground: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url(/public/backgrounds/shadow.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: -2
    },
    
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `linear-gradient(
            90deg,
            rgba(13, 27, 62, 0.95) 0%,
            rgba(13, 27, 62, 0.9) 40%,
            rgba(13, 27, 62, 0.7) 60%,
            rgba(13, 27, 62, 0.4) 80%,
            rgba(13, 27, 62, 0.2) 100%
        )`,
        zIndex: -1
    },
    
    contentWrapper: {
        display: 'flex',
        height: '100vh',
        width: '100%'
    },
    
    leftSection: {
        flex: 2,
        padding: '60px 80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        color: 'white',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden'
    },
    
    logo: {
        fontSize: '4rem',
        fontWeight: 'bold',
        marginBottom: '30px',
        background: 'linear-gradient(45deg, #fff, #64b5f6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'fadeInLeft 1s ease-out'
    },
    
    tagline: {
        fontSize: '1.8rem',
        marginBottom: '40px',
        opacity: 0.9,
        animation: 'fadeInLeft 1s ease-out 0.3s both',
        lineHeight: 1.4
    },
    
    description: {
        fontSize: '1.2rem',
        marginBottom: '50px',
        lineHeight: 1.7,
        opacity: 0.8,
        animation: 'fadeInLeft 1s ease-out 0.6s both'
    },
    
    features: {
        display: 'flex',
        flexDirection: 'column',
        gap: '25px',
        marginBottom: '40px'
    },
    
    featureItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        animation: 'fadeInLeft 1s ease-out both',
        opacity: 0.9
    },
    
    featureIcon: {
        fontSize: '2rem',
        width: '60px',
        textAlign: 'center',
        flexShrink: 0
    },
    
    featureText: {
        flex: 1
    },
    
    featureTitle: {
        fontSize: '1.3rem',
        fontWeight: 'bold',
        marginBottom: '5px'
    },
    
    featureDesc: {
        opacity: 0.8,
        lineHeight: 1.5
    },
    
    stats: {
        display: 'flex',
        gap: '40px',
        marginTop: '40px',
        animation: 'fadeInLeft 1s ease-out 1.5s both',
        flexWrap: 'wrap'
    },
    
    statItem: {
        textAlign: 'left',
        minWidth: '120px'
    },
    
    statNumber: {
        fontSize: '2.2rem',
        fontWeight: 'bold',
        display: 'block',
        color: '#64b5f6'
    },
    
    statLabel: {
        opacity: 0.8,
        marginTop: '5px',
        fontSize: '0.9rem'
    },
    
    rightSection: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
        padding: '20px'
    },
    
    ctaContainer: {
        textAlign: 'center',
        animation: 'fadeInRight 1s ease-out 1.8s both',
        position: 'relative'
    },
    
    ctaButton: {
        position: 'relative',
        display: 'inline-block',
        padding: '25px 50px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '60px',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        transition: 'all 0.4s ease',
        boxShadow: '0 15px 35px rgba(102, 126, 234, 0.4)',
        overflow: 'hidden',
        cursor: 'pointer',
        border: '2px solid rgba(255, 255, 255, 0.2)'
    },
    
    ctaSubtitle: {
        marginTop: '20px',
        fontSize: '1rem',
        opacity: 0.9,
        color: 'white'
    },
    
    floatingParticles: {
        position: 'absolute',
        width: '300px',
        height: '300px',
        pointerEvents: 'none',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
    },
    
    floatingParticle: {
        position: 'absolute',
        width: '4px',
        height: '4px',
        background: 'rgba(255, 255, 255, 0.6)',
        borderRadius: '50%',
        animation: 'float-particle 4s infinite ease-in-out'
    },
    
    particle1: {
        top: '20%',
        left: '10%',
        animationDelay: '0s'
    },
    
    particle2: {
        top: '80%',
        right: '15%',
        animationDelay: '1s'
    },
    
    particle3: {
        top: '50%',
        left: '5%',
        animationDelay: '2s'
    },
    
    particle4: {
        top: '30%',
        right: '10%',
        animationDelay: '3s'
    },
    
    particle5: {
        top: '70%',
        left: '20%',
        animationDelay: '0.5s'
    },
    
    explosionParticle: {
        position: 'fixed',
        width: '6px',
        height: '6px',
        background: '#667eea',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 1000
    }
};

const keyframes = `
    @keyframes fadeInLeft {
        from {
            opacity: 0;
            transform: translateX(-50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes fadeInRight {
        from {
            opacity: 0;
            transform: translateX(50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes float-particle {
        0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
        }
        25% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.8;
        }
        50% {
            transform: translateY(-15px) translateX(-5px);
            opacity: 1;
        }
        75% {
            transform: translateY(-25px) translateX(15px);
            opacity: 0.6;
        }
    }
    
    @keyframes explode {
        from {
            transform: translate(0, 0);
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;