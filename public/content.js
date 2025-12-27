// This script runs ON the website
console.log("AutoFiller Content Script Active");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SCAN_PAGE") {
    // Try scanning immediately, then retry if empty (dynamic forms)
    scanWithRetry(3, 500).then(fields => {
        sendResponse({ fields });
    });
    return true; // Keep channel open for async response
  } else if (request.action === "FILL_FIELD") {
    fillField(request.id, request.value);
    sendResponse({ success: true });
  }
  return true;
});

async function scanWithRetry(retries, delay) {
    let fields = scanPage();
    if (fields.length > 0) return fields;

    for (let i = 0; i < retries; i++) {
        await new Promise(r => setTimeout(r, delay));
        fields = scanPage();
        if (fields.length > 0) return fields;
    }
    return [];
}

function scanPage() {
  const detected = [];
  
  // 1. Generic Scan
  const allInputs = document.querySelectorAll('input, textarea, select');
  
  allInputs.forEach((input, index) => {
      // Filter out obvious non-data fields
      if (['hidden', 'submit', 'button', 'image', 'reset'].includes(input.type)) return;
      // Skip if very small (invisible tracking pixels etc) unless it looks important
      if (!isVisible(input) && !input.getAttribute('aria-hidden')) return; 

      const uniqueId = input.getAttribute('data-autofill-id') || `autofill_${Date.now()}_${index}`;
      input.setAttribute('data-autofill-id', uniqueId);
      
      let labelText = getLabelForElement(input);
      // Clean label
      labelText = labelText.replace(/\*/g, '').replace(/\s+/g, ' ').trim();

      if (labelText && labelText.length < 200) {
          detected.push({
            id: uniqueId,
            name: labelText,
            type: input.tagName.toLowerCase() === 'textarea' ? 'textarea' : (input.type || 'text'),
            currentValue: input.value
          });
      }
  });

  // 2. Google Forms & Complex ARIA Combobox Fallback
  // Some React Select/Dropdowns use aria-role="combobox" on an input or div
  if (detected.length === 0 || document.querySelector('[role="listitem"], [role="combobox"]')) {
      // Logic for Google Forms list items
      document.querySelectorAll('[role="listitem"]').forEach((item, idx) => {
          const input = item.querySelector('input:not([type="hidden"]), textarea');
          if (input && !input.getAttribute('data-autofill-id')) {
              const titleEl = item.querySelector('[role="heading"]');
              const title = titleEl ? titleEl.innerText : "";
              if (title) {
                   const uniqueId = `gf_${idx}`;
                   input.setAttribute('data-autofill-id', uniqueId);
                   detected.push({
                       id: uniqueId,
                       name: title.replace(/\*/g, '').trim(),
                       type: input.tagName.toLowerCase() === 'textarea' ? 'textarea' : 'text',
                       currentValue: input.value
                   });
              }
          }
      });
  }

  return detected;
}

function getLabelForElement(input) {
    // 1. Aria-labelledby
    if (input.getAttribute('aria-labelledby')) {
        const ids = input.getAttribute('aria-labelledby').split(/\s+/);
        let text = '';
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) text += el.innerText + ' ';
        });
        if (text.trim()) return text.trim();
    }

    // 2. Explicit Label
    if (input.id) {
        const label = document.querySelector(`label[for="${CSS.escape(input.id)}"]`);
        if (label) return label.innerText;
    }

    // 3. Aria-label
    if (input.getAttribute('aria-label')) return input.getAttribute('aria-label');

    // 4. Placeholder
    if (input.placeholder) return input.placeholder;

    // 5. Container Heuristics (Comboboxes/React Selects often wrap input in a div with label nearby)
    const container = input.closest('label, .form-group, .input-group, div[class*="field"], div[class*="container"], [role="presentation"]');
    if (container) {
        // Clone and remove the input itself to get only text
        const clone = container.cloneNode(true);
        const inputsInClone = clone.querySelectorAll('input, textarea, select');
        inputsInClone.forEach(el => el.remove());
        
        // Sometimes labels are in a previous sibling container
        if ((!clone.innerText || clone.innerText.trim().length < 2) && container.previousElementSibling) {
            const siblingText = container.previousElementSibling.innerText;
             if (siblingText && siblingText.length < 100) return siblingText.trim();
        }

        if (clone.innerText && clone.innerText.trim().length < 100) {
            return clone.innerText.trim();
        }
    }
    
    // 6. Previous Sibling Element (often a label or span)
    if (input.previousElementSibling && ['LABEL', 'SPAN', 'DIV'].includes(input.previousElementSibling.tagName)) {
         return input.previousElementSibling.innerText.trim();
    }

    return "";
}

function fillField(id, value) {
  const input = document.querySelector(`[data-autofill-id="${id}"]`);
  if (input) {
    input.focus();
    input.value = value;
    // Dispatch events to trigger framework listeners (React, Angular, etc)
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  }
}

function isVisible(elem) {
    if (!(elem instanceof Element)) return false;
    return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
}