// Multi-Tag Input Component
class MultiTagInput {
  constructor(inputSelector, suggestionsArray = []) {
    this.container = document.querySelector(inputSelector);
    if (!this.container) return;
    
    this.suggestions = suggestionsArray;
    this.tags = [];
    this.init();
  }

  init() {
    // Create wrapper structure
    this.container.style.display = 'none';
    const wrapper = document.createElement('div');
    wrapper.className = 'tags-wrapper';
    wrapper.innerHTML = `
      <div class="tags-input-wrapper" id="tags-wrapper-${Math.random().toString(36).substr(2, 9)}">
        <input 
          type="text" 
          class="tags-input" 
          placeholder="${this.container.placeholder || 'Add items...'}"
          autocomplete="off"
        />
      </div>
      <div class="tags-suggestions" style="display: none;"></div>
    `;
    
    this.container.parentElement.insertBefore(wrapper, this.container);
    
    this.tagWrapper = wrapper.querySelector('.tags-input-wrapper');
    this.input = wrapper.querySelector('.tags-input');
    this.suggestionsBox = wrapper.querySelector('.tags-suggestions');
    
    // Load existing tags if any
    if (this.container.value) {
      const existingTags = this.container.value.split(',').map(t => t.trim()).filter(t => t);
      existingTags.forEach(tag => this.addTag(tag));
    }
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Input events
    this.input.addEventListener('input', (e) => this.handleInput(e));
    this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.input.addEventListener('blur', () => setTimeout(() => this.suggestionsBox.style.display = 'none', 200));
    this.input.addEventListener('focus', () => this.showSuggestions(''));
    
    // Wrapper click
    this.tagWrapper.addEventListener('click', () => this.input.focus());
  }

  handleInput(e) {
    const value = e.target.value.toLowerCase();
    this.showSuggestions(value);
  }

  handleKeydown(e) {
    const value = this.input.value.trim();
    
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (value) {
        this.addTag(value);
        this.input.value = '';
        this.suggestionsBox.style.display = 'none';
      }
    } else if (e.key === 'Backspace' && !value && this.tags.length > 0) {
      e.preventDefault();
      this.removeTag(this.tags.length - 1);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      this.navigateSuggestions(e.key);
    }
  }

  showSuggestions(searchValue) {
    const filtered = this.suggestions.filter(s => 
      s.toLowerCase().includes(searchValue) && !this.tags.includes(s)
    );
    
    if (filtered.length === 0) {
      this.suggestionsBox.style.display = 'none';
      return;
    }
    
    this.suggestionsBox.innerHTML = filtered.map((item, index) => `
      <div class="tag-suggestion-item" data-index="${index}">
        ${item}
      </div>
    `).join('');
    
    // Add click handlers to suggestions
    this.suggestionsBox.querySelectorAll('.tag-suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        this.addTag(item.textContent.trim());
        this.input.value = '';
        this.showSuggestions('');
      });
    });
    
    this.suggestionsBox.style.display = 'block';
  }

  navigateSuggestions(direction) {
    // TODO: Implement keyboard navigation for suggestions
  }

  addTag(value) {
    const cleanValue = value.trim();
    if (!cleanValue || this.tags.includes(cleanValue)) return;
    
    this.tags.push(cleanValue);
    this.renderTags();
    this.updateHiddenInput();
  }

  removeTag(index) {
    this.tags.splice(index, 1);
    this.renderTags();
    this.updateHiddenInput();
  }

  renderTags() {
    // Find the input and insert tags before it
    const existingTags = this.tagWrapper.querySelectorAll('.tag');
    existingTags.forEach(tag => tag.remove());
    
    this.tags.forEach((tag, index) => {
      const tagEl = document.createElement('div');
      tagEl.className = 'tag';
      tagEl.innerHTML = `
        ${tag}
        <span class="tag-remove" data-index="${index}">×</span>
      `;
      
      tagEl.querySelector('.tag-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeTag(index);
      });
      
      this.tagWrapper.insertBefore(tagEl, this.input);
    });
  }

  updateHiddenInput() {
    this.container.value = this.tags.join(', ');
    // Trigger change event for form validation
    this.container.dispatchEvent(new Event('change', { bubbles: true }));
  }

  getTags() {
    return this.tags;
  }

  setTags(tagsArray) {
    this.tags = tagsArray;
    this.renderTags();
    this.updateHiddenInput();
  }

  addSuggestion(item) {
    if (!this.suggestions.includes(item)) {
      this.suggestions.push(item);
      this.suggestions.sort();
    }
  }
}

// Preset crop suggestions
const COMMON_CROPS = [
  'Wheat',
  'Rice',
  'Corn',
  'Barley',
  'Oats',
  'Rye',
  'Soybean',
  'Peanut',
  'Sunflower',
  'Canola',
  'Cotton',
  'Sugarcane',
  'Sugar Beet',
  'Potato',
  'Tomato',
  'Lettuce',
  'Carrot',
  'Onion',
  'Garlic',
  'Cucumber',
  'Bell Pepper',
  'Cabbage',
  'Broccoli',
  'Spinach',
  'Apple',
  'Banana',
  'Orange',
  'Grape',
  'Strawberry',
  'Blueberry',
  'Raspberry',
  'Watermelon',
  'Peach',
  'Pear',
  'Plum',
  'Cherry',
  'Almond',
  'Walnut',
  'Cashew',
  'Hazelnut',
  'Pistachio',
  'Coffee',
  'Tea',
  'Cocoa',
  'Vanilla',
  'Cinnamon',
  'Black Pepper',
  'Turmeric',
  'Ginger',
  'Chili',
  'Tobacco',
  'Hemp',
  'Flax',
  'Sesame'
];
