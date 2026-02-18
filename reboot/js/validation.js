// Validation Pages JavaScript

// Progress Bar Animation
class ProgressBar {
  constructor(element, options = {}) {
    this.element = element;
    this.currentCount = options.initialCount || 247;
    this.targetCount = options.targetCount || 500;
    this.incrementRange = options.incrementRange || [1, 3];
    this.updateInterval = options.updateInterval || 30000; // 30 seconds
    
    this.countElement = document.querySelector('.progress-count');
    this.fillElement = document.querySelector('.progress-bar-fill');
    
    this.init();
  }
  
  init() {
    this.updateProgress();
    this.startAutoIncrement();
  }
  
  updateProgress() {
    const percentage = (this.currentCount / this.targetCount) * 100;
    this.fillElement.style.width = `${Math.min(percentage, 100)}%`;
    this.countElement.textContent = this.currentCount;
  }
  
  increment() {
    const min = this.incrementRange[0];
    const max = this.incrementRange[1];
    const increment = Math.floor(Math.random() * (max - min + 1)) + min;
    
    this.currentCount = Math.min(this.currentCount + increment, this.targetCount);
    this.updateProgress();
    
    // Save to localStorage for persistence
    localStorage.setItem('waitlistCount', this.currentCount);
  }
  
  startAutoIncrement() {
    // Check localStorage for existing count
    const savedCount = localStorage.getItem('waitlistCount');
    if (savedCount) {
      this.currentCount = parseInt(savedCount);
      this.updateProgress();
    }
    
    // Random increment every 30-60 seconds
    setInterval(() => {
      if (this.currentCount < this.targetCount) {
        this.increment();
      }
    }, this.updateInterval + Math.random() * 30000);
  }
}

// Email Capture Form Handler
class EmailCapture {
  constructor(formElement) {
    this.form = formElement;
    this.emailInput = this.form.querySelector('.email-input');
    this.submitButton = this.form.querySelector('.email-submit');
    
    this.init();
  }
  
  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.emailInput.addEventListener('input', () => this.validateEmail());
  }
  
  validateEmail() {
    const email = this.emailInput.value;
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    if (isValid) {
      this.emailInput.style.borderColor = '#10b981';
    } else if (email.length > 0) {
      this.emailInput.style.borderColor = '#ef4444';
    } else {
      this.emailInput.style.borderColor = '#e5e7eb';
    }
    
    return isValid;
  }
  
  async handleSubmit(e) {
    e.preventDefault();
    
    if (!this.validateEmail()) {
      this.showError('Please enter a valid email address');
      return;
    }
    
    const email = this.emailInput.value;
    
    // Show loading state
    this.submitButton.disabled = true;
    this.submitButton.textContent = 'Joining...';
    
    // Simulate API call
    await this.simulateSubmission(email);
    
    // Show success state
    this.showSuccess();
    
    // Increment progress bar
    const progressBar = window.progressBar;
    if (progressBar) {
      progressBar.increment();
    }
  }
  
  async simulateSubmission(email) {
    // In production, this would be an actual API call
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  showSuccess() {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
      <div class="success-icon">✓</div>
      <p>You're on the list! We'll notify you as soon as we launch.</p>
    `;
    successMessage.style.cssText = `
      text-align: center;
      padding: 20px;
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 8px;
      margin-top: 16px;
      animation: fadeIn 0.3s ease-out;
    `;
    
    this.form.appendChild(successMessage);
    this.form.reset();
    this.submitButton.textContent = 'Joined!';
    
    // Reset after 5 seconds
    setTimeout(() => {
      successMessage.remove();
      this.submitButton.disabled = false;
      this.submitButton.textContent = 'Get Early Access';
    }, 5000);
  }
  
  showError(message) {
    this.emailInput.focus();
    this.emailInput.style.animation = 'shake 0.5s';
    
    setTimeout(() => {
      this.emailInput.style.animation = '';
    }, 500);
  }
}

// Coming Soon Graphic Animations
class ComingSoonGraphic {
  constructor(element, type) {
    this.element = element;
    this.type = type;
    this.init();
  }
  
  init() {
    switch(this.type) {
      case 'rocket':
        this.createRocketAnimation();
        break;
      case 'clock':
        this.createClockAnimation();
        break;
      case 'construction':
        this.createConstructionAnimation();
        break;
      default:
        this.createDefaultAnimation();
    }
  }
  
  createRocketAnimation() {
    this.element.innerHTML = `
      <svg width="80" height="80" viewBox="0 0 80 80" class="rocket-svg">
        <path d="M40 10 L50 30 L40 50 L30 30 Z" fill="#2563eb" class="rocket-body"/>
        <path d="M35 50 L40 60 L45 50" fill="#ef4444" class="rocket-flame"/>
      </svg>
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      .rocket-svg {
        animation: float 3s ease-in-out infinite;
      }
      .rocket-flame {
        animation: flicker 0.3s ease-in-out infinite alternate;
      }
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      @keyframes flicker {
        from { opacity: 0.8; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  createClockAnimation() {
    this.element.innerHTML = `<div class="graphic-icon">⏰</div>`;
  }
  
  createConstructionAnimation() {
    this.element.innerHTML = `<div class="graphic-icon">🚧</div>`;
  }
  
  createDefaultAnimation() {
    this.element.innerHTML = `<div class="graphic-icon">🚀</div>`;
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize progress bar
  const progressContainer = document.querySelector('.progress-bar-container');
  if (progressContainer) {
    window.progressBar = new ProgressBar(progressContainer, {
      initialCount: 247,
      targetCount: 1000,
      incrementRange: [1, 4],
      updateInterval: 45000 // 45 seconds
    });
  }
  
  // Initialize email capture forms
  const emailForms = document.querySelectorAll('.email-form');
  emailForms.forEach(form => {
    new EmailCapture(form);
  });
  
  // Initialize coming soon graphics
  const graphics = document.querySelectorAll('.coming-soon-graphic');
  graphics.forEach((graphic, index) => {
    const types = ['rocket', 'clock', 'construction'];
    new ComingSoonGraphic(graphic, types[index % types.length]);
  });
});

// Add shake animation
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(shakeStyle);