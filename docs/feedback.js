// feedback.js: Injects feedback buttons into Swagger UI and handles modal/issue creation
(function() {
  // Wait for Swagger UI to render
  function addFeedbackButtons() {
    // Find all operation blocks
    const operations = document.querySelectorAll('.opblock');
    operations.forEach(op => {
      if (op.querySelector('.feedback-btn')) return; // Avoid duplicates
      const btn = document.createElement('button');
      btn.innerText = 'Feedback';
      btn.className = 'feedback-btn';
      btn.style.marginLeft = '10px';
      btn.onclick = function(e) {
        e.stopPropagation();
        showFeedbackModal(op);
      };
      // Add button to operation summary
      const summary = op.querySelector('.opblock-summary');
      if (summary) summary.appendChild(btn);
    });
  }

  // Modal HTML
  function createModal() {
    if (document.getElementById('feedback-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'feedback-modal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>API Feedback</h2>
        <textarea id="feedback-text" placeholder="Describe your issue or suggestion..." rows="6" style="width:100%"></textarea>
        <br/>
        <button id="github-issue-btn">Create GitHub Issue</button>
        <button id="submit-suggestion-btn">Submit Suggestion</button>
      </div>
    `;
    document.body.appendChild(modal);
    // Style
    const style = document.createElement('style');
    style.innerHTML = `
      #feedback-modal { position: fixed; z-index: 9999; left: 0; top: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; }
      #feedback-modal .modal-content { background: #fff; padding: 24px; border-radius: 8px; min-width: 320px; max-width: 90vw; box-shadow: 0 2px 16px rgba(0,0,0,0.2); position: relative; }
      #feedback-modal .close { position: absolute; right: 16px; top: 8px; font-size: 28px; cursor: pointer; }
      #feedback-modal textarea { margin-top: 12px; }
      #feedback-modal button { margin: 12px 8px 0 0; }
    `;
    document.head.appendChild(style);
    // Close handler
    modal.querySelector('.close').onclick = () => { modal.style.display = 'none'; };
    // Outside click closes
    modal.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };
    // GitHub Issue using bug_report.yml template
    modal.querySelector('#github-issue-btn').onclick = () => {
      const text = document.getElementById('feedback-text').value;
      // Try to extract endpoint from the text if present
      let endpoint = '';
      const endpointMatch = text.match(/^Endpoint: (.*)$/m);
      if (endpointMatch) {
        endpoint = endpointMatch[1];
      }
      // Compose the URL to use the bug_report.yml template with endpoint pre-filled
      // See: https://docs.github.com/en/issues/using-templates-to-encourage-useful-issues/configuring-issue-templates-for-your-repository#using-query-parameters-to-prefill-issues
      const params = new URLSearchParams({
        template: 'bug_report.md',
        'endpoint': endpoint,
        'description': text.replace(/^Endpoint:.*\n?/m, ''),
      });
      // const url = `https://github.com/bapu6/swagger-doc/issues/new?title=API%20Feedback&body=${encodeURIComponent(text)}`;
      const url = `https://github.com/bapu6/swagger-doc/issues/new?${params.toString()}`;
      window.open(url, '_blank');
    };
    // Suggestion (just closes for now)
    modal.querySelector('#submit-suggestion-btn').onclick = () => {
      const text = document.getElementById('feedback-text');
      console.log(text)
      alert('Thank you for your suggestion!');
      modal.style.display = 'none';
    };
  }

  // Show modal
  function showFeedbackModal(opblock) {
    createModal();
    const modal = document.getElementById('feedback-modal');
    modal.style.display = 'flex';
    // Optionally, prefill feedback with endpoint info
    const summary = opblock.querySelector('.opblock-summary-path');
    if (summary) {
      const text = document.getElementById('feedback-text');
      text.value = `Endpoint: ${summary.innerText}\n`;
    }
  }

  // Observe DOM changes to re-inject buttons
  const observer = new MutationObserver(() => {
    addFeedbackButtons();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Initial injection
  window.addEventListener('DOMContentLoaded', addFeedbackButtons);
  // Also run after window.onload (Swagger UI ready)
  window.addEventListener('load', addFeedbackButtons);
})();
