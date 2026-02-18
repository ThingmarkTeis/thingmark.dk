// 90-Day Transformation Page Scripts

// Page Timer Countdown
function updatePageTimer() {
    const timerElement = document.getElementById('page-timer');
    let timeString = timerElement.textContent;
    let [minutes, seconds] = timeString.split(':').map(num => parseInt(num));
    
    if (seconds > 0) {
        seconds--;
    } else if (minutes > 0) {
        minutes--;
        seconds = 59;
    } else {
        // Timer expired
        timerElement.textContent = "EXPIRED";
        timerElement.style.background = '#ff4757';
        return;
    }
    
    timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Update timer every second
setInterval(updatePageTimer, 1000);

// Animated Number Counters
function animateNumbers() {
    const numbers = document.querySelectorAll('.stat-number');
    
    numbers.forEach(number => {
        const target = parseFloat(number.getAttribute('data-target'));
        const increment = target / 50; // 50 steps
        let current = 0;
        
        const updateNumber = () => {
            if (current < target) {
                current += increment;
                if (current > target) current = target;
                
                // Format based on whether it's a decimal
                if (target % 1 !== 0) {
                    number.textContent = current.toFixed(1);
                } else {
                    number.textContent = Math.floor(current);
                }
                
                setTimeout(updateNumber, 30);
            } else {
                // Ensure we hit the exact target
                if (target % 1 !== 0) {
                    number.textContent = target.toFixed(1);
                } else {
                    number.textContent = target;
                }
            }
        };
        
        // Start animation when element is in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateNumber();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(number);
    });
}

animateNumbers();

// Form Submission Handler
document.getElementById('transformForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    const button = this.querySelector('.cta-button');
    const buttonText = button.querySelector('.button-text');
    
    // Animate button
    buttonText.textContent = 'TRANSFORMATION STARTING...';
    button.style.background = 'linear-gradient(90deg, #05c46b, #0be881)';
    button.disabled = true;
    
    // Add success animation
    setTimeout(() => {
        buttonText.textContent = '✓ CHECK YOUR EMAIL NOW!';
        
        // Create confetti effect
        createConfetti();
        
        // Reset after delay
        setTimeout(() => {
            buttonText.textContent = 'START MY TRANSFORMATION';
            button.style.background = '';
            button.disabled = false;
            this.reset();
        }, 3000);
    }, 1000);
    
    console.log('Email submitted:', email);
});

// Confetti Effect
function createConfetti() {
    const colors = ['#ff4757', '#ffa502', '#05c46b', '#3742fa', '#ff6348'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            top: -20px;
            opacity: 1;
            transform: rotate(${Math.random() * 360}deg);
            transition: all 1s ease-out;
            z-index: 9999;
        `;
        
        document.body.appendChild(confetti);
        
        // Animate
        setTimeout(() => {
            confetti.style.top = '100%';
            confetti.style.transform = `rotate(${Math.random() * 720}deg)`;
            confetti.style.opacity = '0';
        }, 10);
        
        // Remove
        setTimeout(() => confetti.remove(), 1000);
    }
}

// Smooth scroll functionality
document.querySelectorAll('button[onclick*="scrollIntoView"]').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('transformForm').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    });
});

// Add hover effect to testimonial cards
document.querySelectorAll('.testimonial-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        if (!this.classList.contains('featured')) {
            this.style.transform = '';
        }
    });
});

// Ticker restart when it ends
const ticker = document.querySelector('.ticker-content');
ticker.addEventListener('animationend', () => {
    ticker.style.animation = 'none';
    setTimeout(() => {
        ticker.style.animation = 'ticker 30s linear infinite';
    }, 10);
});