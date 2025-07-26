// feedback.js: Enhanced feedback system with direct GitHub issue creation
(function () {
  // Configuration - Update these values for your repository
  const GITHUB_CONFIG = {
    owner: "bapu6",
    repo: "swagger-doc",
    // GitHub API endpoint
    apiUrl: "https://api.github.com",
    // For production, you'd want to use GitHub Apps or OAuth
    // For demo purposes, we'll provide multiple authentication options
  };

  console.log("🔧 GitHub Configuration:", GITHUB_CONFIG);

  // GitHub API integration
  async function createGitHubIssueDirectly(issueData) {
    console.log("🎯 createGitHubIssueDirectly() called with data:", issueData);
    const createButton = document.getElementById("create-github-issue");
    const originalText = createButton.textContent;

    try {
      // Show loading state
      createButton.textContent = "🔄 Creating Issue...";
      createButton.disabled = true;

      // First, try to get authentication token
      console.log("🔍 Getting GitHub token...");
      const token = await getGitHubToken();
      console.log(
        "🔑 Token result:",
        token ? `Found (${token.length} chars)` : "NULL/UNDEFINED"
      );

      if (!token) {
        console.log("❌ No token provided, falling back to URL method");
        // Fallback to URL method if no token
        createGitHubIssueViaURL(issueData);
        return;
      }

      console.log("✅ Token received, creating issue via API...");
      console.log(
        "🏗️ API URL:",
        `${GITHUB_CONFIG.apiUrl}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues`
      );
      console.log("📦 Request payload:", {
        title: issueData.title,
        body: issueData.body,
        labels: [
          "feedback",
          "api",
          "documentation",
          issueData.priority.toLowerCase().replace(/[🔴🟡🟢]\s*/, ""),
        ],
      });

      // Create issue via GitHub API
      const apiUrl = `${GITHUB_CONFIG.apiUrl}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues`;
      const requestBody = {
        title: issueData.title,
        body: issueData.body,
        labels: [
          "feedback",
          "api",
          "documentation",
          issueData.priority.toLowerCase().replace(/[🔴🟡🟢]\s*/, ""),
        ],
      };

      console.log("🚀 Making fetch request to GitHub API...");
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📡 GitHub API response status:", response.status);
      console.log("📡 GitHub API response headers:", response.headers);

      if (response.ok) {
        const issue = await response.json();
        console.log("🎉 Issue created successfully:", issue.number);
        console.log("🔗 Issue URL:", issue.html_url);
        showSuccessMessage(
          `✅ Issue created successfully! <a href="${issue.html_url}" target="_blank">View Issue #${issue.number}</a>`
        );
        document.getElementById("feedback-modal").style.display = "none";
      } else if (response.status === 401) {
        console.log("🔒 Authentication failed, token may be invalid");
        const errorText = await response.text();
        console.log("🔒 Auth error details:", errorText);
        // Authentication failed, fallback to URL method
        showWarningMessage("⚠️ Authentication failed. Opening GitHub page...");
        createGitHubIssueViaURL(issueData);
      } else {
        const errorData = await response.text();
        console.error("❌ GitHub API error:", response.status, errorData);
        console.error("❌ Full response:", response);
        throw new Error(`GitHub API error: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error("Error creating issue:", error);
      showErrorMessage(
        "❌ Failed to create issue. Opening GitHub page as fallback..."
      );
      createGitHubIssueViaURL(issueData);
    } finally {
      // Restore button state
      createButton.textContent = originalText;
      createButton.disabled = false;
    }
  }

  // Multiple authentication strategies
  async function getGitHubToken() {
    console.log("🔍 getGitHubToken() called");

    // Strategy 1: Check for stored token in localStorage
    let token = localStorage.getItem("github_token");
    console.log(
      "📦 Token from localStorage:",
      token ? "Found (length: " + token.length + ")" : "Not found"
    );

    if (token) {
      // Validate token by making a test API call
      try {
        console.log("🔄 Validating token with GitHub API...");
        const response = await fetch(`${GITHUB_CONFIG.apiUrl}/user`, {
          headers: { Authorization: `token ${token}` },
        });
        console.log("📡 Token validation response status:", response.status);
        if (response.ok) {
          console.log("✅ Token is valid, returning it");
          return token;
        } else {
          console.log("❌ Token validation failed, removing invalid token");
          localStorage.removeItem("github_token");
        }
      } catch (e) {
        console.log("❌ Token validation error:", e.message);
        // Token is invalid, remove it
        localStorage.removeItem("github_token");
      }
    }

    // Strategy 2: Prompt user for token
    console.log("🔑 No valid token found, prompting user...");
    return await promptForToken();
  }

  async function promptForToken() {
    console.log("🔑 promptForToken() called - showing token input modal");
    return new Promise((resolve) => {
      const tokenModal = document.createElement("div");
      tokenModal.innerHTML = `
        <div style="
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.7); z-index: 10001; display: flex;
          align-items: center; justify-content: center;
        ">
          <div style="
            background: white; padding: 30px; border-radius: 12px; max-width: 500px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          ">
            <h3>🔐 GitHub Authentication</h3>
            <p>To create issues directly, please enter your GitHub Personal Access Token:</p>
            <input type="password" id="github-token-input" style="
              width: 100%; padding: 10px; border: 1px solid #ddd; 
              border-radius: 4px; box-sizing: border-box; margin: 10px 0;
            " placeholder="ghp_xxxxxxxxxxxxxxxxxxxx">
            <small style="color: #666; display: block; margin-top: 5px;">
              Create token at: <a href="https://github.com/settings/tokens" target="_blank">github.com/settings/tokens</a><br>
              Required scopes: <code>repo</code> or <code>public_repo</code>
            </small>
            <div style="margin: 20px 0;">
              <label style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" id="save-token" checked>
                <span>Save token locally (browser storage)</span>
              </label>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
              <button id="skip-auth" style="
                padding: 10px 16px; border: 1px solid #ddd; background: white;
                border-radius: 4px; cursor: pointer;
              ">Skip (Use GitHub page)</button>
              <button id="use-token" style="
                padding: 10px 16px; background: #28a745; color: white;
                border: none; border-radius: 4px; cursor: pointer;
              ">Use Token</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(tokenModal);

      document.getElementById("skip-auth").onclick = () => {
        console.log("⏭️ User clicked 'Skip' - will use URL method");
        document.body.removeChild(tokenModal);
        resolve(null);
      };

      document.getElementById("use-token").onclick = () => {
        const token = document
          .getElementById("github-token-input")
          .value.trim();
        const saveToken = document.getElementById("save-token").checked;

        console.log(
          "🔑 User provided token:",
          token ? "Yes (length: " + token.length + ")" : "No"
        );
        console.log("💾 Save token:", saveToken);

        if (!token) {
          alert("Please enter a valid GitHub token");
          return;
        }

        if (saveToken) {
          localStorage.setItem("github_token", token);
          console.log("💾 Token saved to localStorage");
        }

        document.body.removeChild(tokenModal);
        resolve(token);
      };

      setTimeout(() => {
        document.getElementById("github-token-input").focus();
      }, 100);
    });
  }

  // Wait for Swagger UI to render
  function addFeedbackButtons() {
    // Find all operation blocks
    const operations = document.querySelectorAll(".opblock");
    operations.forEach((op) => {
      if (op.querySelector(".feedback-btn")) return; // Avoid duplicates
      const btn = document.createElement("button");
      btn.innerText = "💬 Feedback";
      btn.className = "feedback-btn";
      btn.style.cssText = `
        margin-left: 10px;
        background: #007bff;
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      `;
      btn.onclick = function (e) {
        e.stopPropagation();
        showFeedbackModal(op);
      };
      // Add button to operation summary
      const summary = op.querySelector(".opblock-summary");
      if (summary) summary.appendChild(btn);
    });
  }

  // Enhanced Modal with comprehensive form
  function createModal() {
    if (document.getElementById("feedback-modal")) return;
    const modal = document.createElement("div");
    modal.id = "feedback-modal";
    modal.style.display = "none";
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>🚀 API Endpoint Feedback</h2>
        
        <form id="feedback-form">
          <div class="form-group">
            <label for="endpoint-info">📍 Endpoint Information:</label>
            <input type="text" id="endpoint-info" readonly style="background: #f5f5f5;">
          </div>

          <div class="form-group">
            <label for="feedback-type">📝 Feedback Type:</label>
            <select id="feedback-type" required>
              <option value="">Select feedback type...</option>
              <option value="🐛 Bug Report">🐛 Bug Report</option>
              <option value="🎯 Feature Request">🎯 Feature Request</option>
              <option value="📚 Documentation Issue">📚 Documentation Issue</option>
              <option value="🔧 API Improvement">🔧 API Improvement</option>
              <option value="📈 Performance Issue">📈 Performance Issue</option>
              <option value="🔒 Security Concern">🔒 Security Concern</option>
              <option value="💡 General Suggestion">💡 General Suggestion</option>
            </select>
          </div>

          <div class="form-group">
            <label for="priority">⚡ Priority:</label>
            <select id="priority" required>
              <option value="">Select priority...</option>
              <option value="🔴 High">🔴 High - Blocking or Critical</option>
              <option value="🟡 Medium">🟡 Medium - Important</option>
              <option value="🟢 Low">🟢 Low - Enhancement</option>
            </select>
          </div>

          <div class="form-group">
            <label for="current-behavior">💭 Current Behavior:</label>
            <textarea id="current-behavior" rows="3" placeholder="Describe what currently happens when using this endpoint..." required></textarea>
          </div>

          <div class="form-group">
            <label for="expected-behavior">🎯 Expected Behavior / Suggestion:</label>
            <textarea id="expected-behavior" rows="3" placeholder="Describe what you expected to happen or what you'd like to see improved..." required></textarea>
          </div>

          <div class="form-group">
            <label for="steps-to-reproduce">🔄 Steps to Reproduce (if applicable):</label>
            <textarea id="steps-to-reproduce" rows="3" placeholder="1. Call the endpoint with...&#10;2. Send payload...&#10;3. Observe..."></textarea>
          </div>

          <div class="form-group">
            <label for="additional-context">🏷️ Additional Context:</label>
            <textarea id="additional-context" rows="2" placeholder="Browser, environment, related endpoints, etc."></textarea>
          </div>

          <div class="form-actions">
            <button type="button" id="create-github-issue" class="primary-btn">🚀 Create GitHub Issue</button>
            <button type="button" id="preview-issue" class="secondary-btn">👁️ Preview</button>
            <button type="button" id="test-token-btn" class="test-btn">🔍 Test Token</button>
            <button type="button" id="settings-btn" class="settings-btn">⚙️ Settings</button>
            <button type="button" id="cancel-feedback" class="cancel-btn">❌ Cancel</button>
          </div>
        </form>

        <div id="preview-content" style="display: none;">
          <h3>📋 Issue Preview</h3>
          <pre id="preview-text"></pre>
          <button type="button" id="confirm-create">✅ Confirm & Create Issue</button>
          <button type="button" id="edit-more">✏️ Edit More</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Enhanced Styling
    const style = document.createElement("style");
    style.innerHTML = `
      #feedback-modal { 
        position: fixed; z-index: 9999; left: 0; top: 0; 
        width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); 
        display: flex; align-items: center; justify-content: center; 
      }
      #feedback-modal .modal-content { 
        background: #fff; padding: 24px; border-radius: 12px; 
        min-width: 500px; max-width: 90vw; max-height: 90vh; 
        box-shadow: 0 10px 25px rgba(0,0,0,0.2); 
        position: relative; overflow-y: auto;
      }
      #feedback-modal .close { 
        position: absolute; right: 16px; top: 8px; 
        font-size: 28px; cursor: pointer; color: #999;
      }
      #feedback-modal .close:hover { color: #333; }
      #feedback-modal .form-group { 
        margin-bottom: 16px; 
      }
      #feedback-modal label { 
        display: block; margin-bottom: 6px; 
        font-weight: bold; color: #333;
      }
      #feedback-modal input, #feedback-modal select, #feedback-modal textarea { 
        width: 100%; padding: 8px; border: 1px solid #ddd; 
        border-radius: 4px; font-size: 14px; box-sizing: border-box;
      }
      #feedback-modal textarea { 
        resize: vertical; font-family: inherit; 
      }
      #feedback-modal .form-actions { 
        margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap;
      }
      #feedback-modal .primary-btn { 
        background: #28a745; color: white; border: none; 
        padding: 10px 16px; border-radius: 6px; cursor: pointer; font-weight: bold;
      }
      #feedback-modal .secondary-btn { 
        background: #6c757d; color: white; border: none; 
        padding: 10px 16px; border-radius: 6px; cursor: pointer;
      }
      #feedback-modal .settings-btn { 
        background: #6f42c1; color: white; border: none; 
        padding: 10px 16px; border-radius: 6px; cursor: pointer;
      }
      #feedback-modal .test-btn { 
        background: #17a2b8; color: white; border: none; 
        padding: 10px 16px; border-radius: 6px; cursor: pointer;
      }
      #feedback-modal .cancel-btn { 
        background: #dc3545; color: white; border: none; 
        padding: 10px 16px; border-radius: 6px; cursor: pointer;
      }
      #feedback-modal button:hover { opacity: 0.9; }
      #preview-content { 
        margin-top: 20px; padding: 16px; 
        background: #f8f9fa; border-radius: 6px; 
      }
      #preview-text { 
        background: white; padding: 12px; border-radius: 4px; 
        border: 1px solid #ddd; max-height: 300px; overflow-y: auto;
        white-space: pre-wrap; font-size: 13px;
      }
    `;
    document.head.appendChild(style);

    setupModalHandlers(modal);
  }

  function setupModalHandlers(modal) {
    // Close handlers
    modal.querySelector(".close").onclick = () => {
      modal.style.display = "none";
    };
    modal.onclick = (e) => {
      if (e.target === modal) modal.style.display = "none";
    };

    // Form handlers
    document.getElementById("cancel-feedback").onclick = () => {
      modal.style.display = "none";
    };

    document.getElementById("preview-issue").onclick = () => {
      showPreview();
    };

    document.getElementById("create-github-issue").onclick = () => {
      console.log("🎯 'Create GitHub Issue' button clicked");
      if (validateForm()) {
        console.log("✅ Form validation passed, calling createGitHubIssue()");
        createGitHubIssue();
      } else {
        console.log("❌ Form validation failed");
      }
    };

    document.getElementById("confirm-create").onclick = () => {
      createGitHubIssue();
    };

    document.getElementById("edit-more").onclick = () => {
      document.getElementById("preview-content").style.display = "none";
      document.getElementById("feedback-form").style.display = "block";
    };

    document.getElementById("settings-btn").onclick = () => {
      showSettingsPanel();
    };

    document.getElementById("test-token-btn").onclick = async () => {
      console.log("🔍 Test Token button clicked");
      const testButton = document.getElementById("test-token-btn");
      const originalText = testButton.textContent;
      testButton.textContent = "Testing...";
      testButton.disabled = true;

      try {
        const token = await getGitHubToken();
        if (token) {
          showSuccessMessage("✅ Token found and validated successfully!");
          console.log("✅ Token test successful");
        } else {
          showWarningMessage("⚠️ No token available or validation failed");
          console.log("❌ Token test failed - no token");
        }
      } catch (error) {
        showErrorMessage("❌ Token test failed: " + error.message);
        console.error("❌ Token test error:", error);
      } finally {
        testButton.textContent = originalText;
        testButton.disabled = false;
      }
    };
  }
  function validateForm() {
    console.log("🔍 validateForm() called");
    const requiredFields = [
      "feedback-type",
      "priority",
      "current-behavior",
      "expected-behavior",
    ];
    let isValid = true;

    requiredFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      const value = field ? field.value.trim() : "";
      console.log(`📝 Field '${fieldId}':`, value ? `"${value}"` : "EMPTY");

      if (!value) {
        if (field) field.style.border = "2px solid #dc3545";
        isValid = false;
        console.log(`❌ Field '${fieldId}' is required but empty`);
      } else {
        if (field) field.style.border = "1px solid #ddd";
        console.log(`✅ Field '${fieldId}' is valid`);
      }
    });

    console.log("📋 Form validation result:", isValid ? "VALID" : "INVALID");

    if (!isValid) {
      console.log("⚠️ Showing validation alert");
      alert("⚠️ Please fill in all required fields (marked in red)");
    }

    return isValid;
  }

  function showPreview() {
    if (!validateForm()) return;

    const formData = getFormData();
    const issueBody = generateIssueBody(formData);

    document.getElementById("preview-text").textContent = issueBody;
    document.getElementById("feedback-form").style.display = "none";
    document.getElementById("preview-content").style.display = "block";
  }

  function getFormData() {
    console.log("📋 getFormData() called");
    const formData = {
      endpoint: document.getElementById("endpoint-info").value,
      feedbackType: document.getElementById("feedback-type").value,
      priority: document.getElementById("priority").value,
      currentBehavior: document.getElementById("current-behavior").value,
      expectedBehavior: document.getElementById("expected-behavior").value,
      stepsToReproduce: document.getElementById("steps-to-reproduce").value,
      additionalContext: document.getElementById("additional-context").value,
    };
    console.log("📦 Collected form data:", formData);
    return formData;
  }

  function generateIssueBody(data) {
    return `## 📍 Endpoint Information
${data.endpoint}

##  Feedback Type
${data.feedbackType}

## ⚡ Priority
${data.priority}

## 💭 Current Behavior
${data.currentBehavior}

## 🎯 Expected Behavior / Suggestion
${data.expectedBehavior}

${
  data.stepsToReproduce
    ? `## 🔄 Steps to Reproduce
${data.stepsToReproduce}

`
    : ""
}${
      data.additionalContext
        ? `## 🏷️ Additional Context
${data.additionalContext}

`
        : ""
    }## 🌐 Source Context
Generated from Swagger UI Documentation

---
*This issue was created via the API Documentation feedback system*`;
  }

  function createGitHubIssue() {
    console.log("🚀 createGitHubIssue() called");
    try {
      const formData = getFormData();
      const issueTitle = `[API FEEDBACK] ${formData.feedbackType} - ${formData.endpoint}`;
      const issueBody = generateIssueBody(formData);

      const issueData = {
        title: issueTitle,
        body: issueBody,
        priority: formData.priority,
        endpoint: formData.endpoint,
        feedbackType: formData.feedbackType,
      };

      console.log("📋 Issue data prepared:", issueData);
      console.log("🔄 Calling createGitHubIssueDirectly...");

      // Use direct GitHub API creation
      createGitHubIssueDirectly(issueData);
    } catch (error) {
      console.error("❌ Error in createGitHubIssue():", error);
      showErrorMessage("❌ Failed to prepare issue data: " + error.message);
    }
  }

  // Fallback method - creates GitHub issue via URL (original method)
  function createGitHubIssueViaURL(issueData) {
    const params = new URLSearchParams({
      template: "feedback.md",
      title: issueData.title,
      body: issueData.body,
      labels: "feedback,api,documentation",
    });

    const githubUrl = `https://github.com/${GITHUB_CONFIG.owner}/${
      GITHUB_CONFIG.repo
    }/issues/new?${params.toString()}`;

    // Show fallback message
    showWarningMessage("🔗 Opening GitHub page to complete issue creation...");

    // Open GitHub issue creation page
    window.open(githubUrl, "_blank");

    // Close modal
    document.getElementById("feedback-modal").style.display = "none";
  }

  function showSuccessMessage(
    message = "✅ GitHub issue created successfully!"
  ) {
    showNotification(message, "#28a745");
  }

  function showWarningMessage(message) {
    showNotification(message, "#ffc107", "#000");
  }

  function showErrorMessage(message) {
    showNotification(message, "#dc3545");
  }

  function showNotification(message, backgroundColor, textColor = "#fff") {
    const notificationDiv = document.createElement("div");
    notificationDiv.innerHTML = `
      <div style="
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        background: ${backgroundColor}; color: ${textColor}; padding: 16px 20px;
        border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-weight: bold; max-width: 350px; word-wrap: break-word;
        animation: slideIn 0.3s ease-out;
      ">
        ${message}
      </div>
    `;

    // Add animation styles
    if (!document.getElementById("notification-styles")) {
      const style = document.createElement("style");
      style.id = "notification-styles";
      style.innerHTML = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notificationDiv);

    // Auto-remove after 7 seconds with slide-out animation
    setTimeout(() => {
      if (notificationDiv.parentNode) {
        notificationDiv.firstElementChild.style.animation =
          "slideOut 0.3s ease-in";
        setTimeout(() => {
          if (notificationDiv.parentNode) {
            notificationDiv.parentNode.removeChild(notificationDiv);
          }
        }, 300);
      }
    }, 7000);
  }

  // Show modal with endpoint information pre-filled
  function showFeedbackModal(opblock) {
    createModal();
    const modal = document.getElementById("feedback-modal");
    modal.style.display = "flex";

    // Reset form
    document.getElementById("feedback-form").style.display = "block";
    document.getElementById("preview-content").style.display = "none";

    // Pre-fill endpoint information
    const pathElement = opblock.querySelector(".opblock-summary-path");
    const methodElement = opblock.querySelector(".opblock-summary-method");

    if (pathElement && methodElement) {
      const method = methodElement.textContent.trim().toUpperCase();
      const path = pathElement.textContent.trim();
      document.getElementById("endpoint-info").value = `${method} ${path}`;
    }

    // Reset form validation styles
    const inputs = modal.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      input.style.border = "1px solid #ddd";
    });
  }

  // Settings panel for GitHub token management
  function showSettingsPanel() {
    const existingToken = localStorage.getItem("github_token");

    const settingsModal = document.createElement("div");
    settingsModal.innerHTML = `
      <div style="
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.7); z-index: 10001; display: flex;
        align-items: center; justify-content: center;
      ">
        <div style="
          background: white; padding: 30px; border-radius: 12px; max-width: 500px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        ">
          <h3>⚙️ Feedback System Settings</h3>
          
          <div style="margin: 20px 0;">
            <h4>🔐 GitHub Authentication</h4>
            <p>Configure your GitHub token for direct issue creation:</p>
            
            <label style="display: block; margin-bottom: 8px; font-weight: bold;">
              GitHub Personal Access Token:
            </label>
            <input type="password" id="settings-token-input" style="
              width: 100%; padding: 10px; border: 1px solid #ddd; 
              border-radius: 4px; box-sizing: border-box;
            " placeholder="${
              existingToken
                ? "••••••••••••••••••••"
                : "ghp_xxxxxxxxxxxxxxxxxxxx"
            }" 
               value="${existingToken || ""}">
            
            <small style="color: #666; display: block; margin-top: 5px;">
              Create token at: <a href="https://github.com/settings/tokens" target="_blank">github.com/settings/tokens</a><br>
              Required scopes: <code>repo</code> or <code>public_repo</code>
            </small>
            
            <div style="margin: 15px 0;">
              <p><strong>Token Status:</strong> 
                <span id="token-status" style="color: ${
                  existingToken ? "#28a745" : "#dc3545"
                }">
                  ${existingToken ? "✅ Token saved" : "❌ No token configured"}
                </span>
              </p>
            </div>
          </div>

          <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 6px;">
            <h4>📋 How it works:</h4>
            <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
              <li><strong>With Token:</strong> Issues created instantly via GitHub API</li>
              <li><strong>Without Token:</strong> Opens GitHub page to complete creation</li>
              <li><strong>Security:</strong> Token stored locally in your browser only</li>
            </ul>
          </div>

          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button id="clear-token" style="
              padding: 10px 16px; border: 1px solid #dc3545; background: white;
              color: #dc3545; border-radius: 4px; cursor: pointer;
            ">Clear Token</button>
            <button id="test-token" style="
              padding: 10px 16px; border: 1px solid #007bff; background: white;
              color: #007bff; border-radius: 4px; cursor: pointer;
            ">Test Token</button>
            <button id="save-settings" style="
              padding: 10px 16px; background: #28a745; color: white;
              border: none; border-radius: 4px; cursor: pointer;
            ">Save Settings</button>
            <button id="close-settings" style="
              padding: 10px 16px; background: #6c757d; color: white;
              border: none; border-radius: 4px; cursor: pointer;
            ">Close</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(settingsModal);

    // Settings handlers
    document.getElementById("close-settings").onclick = () => {
      document.body.removeChild(settingsModal);
    };

    document.getElementById("clear-token").onclick = () => {
      localStorage.removeItem("github_token");
      document.getElementById("settings-token-input").value = "";
      document.getElementById("token-status").textContent =
        "❌ No token configured";
      document.getElementById("token-status").style.color = "#dc3545";
      showSuccessMessage("🗑️ GitHub token cleared");
    };

    document.getElementById("save-settings").onclick = () => {
      const token = document
        .getElementById("settings-token-input")
        .value.trim();
      if (token) {
        localStorage.setItem("github_token", token);
        document.getElementById("token-status").textContent = "✅ Token saved";
        document.getElementById("token-status").style.color = "#28a745";
        showSuccessMessage("💾 GitHub token saved successfully");
      } else {
        localStorage.removeItem("github_token");
        document.getElementById("token-status").textContent =
          "❌ No token configured";
        document.getElementById("token-status").style.color = "#dc3545";
      }
    };

    document.getElementById("test-token").onclick = async () => {
      const token =
        document.getElementById("settings-token-input").value.trim() ||
        localStorage.getItem("github_token");
      if (!token) {
        showErrorMessage("❌ No token to test");
        return;
      }

      const testButton = document.getElementById("test-token");
      const originalText = testButton.textContent;
      testButton.textContent = "Testing...";
      testButton.disabled = true;

      try {
        const response = await fetch(`${GITHUB_CONFIG.apiUrl}/user`, {
          headers: { Authorization: `token ${token}` },
        });

        if (response.ok) {
          const user = await response.json();
          showSuccessMessage(`✅ Token valid! Authenticated as: ${user.login}`);
        } else {
          showErrorMessage("❌ Invalid token or insufficient permissions");
        }
      } catch (error) {
        showErrorMessage("❌ Network error while testing token");
      } finally {
        testButton.textContent = originalText;
        testButton.disabled = false;
      }
    };
  }

  // Observe DOM changes to re-inject buttons
  const observer = new MutationObserver(() => {
    addFeedbackButtons();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Initial injection
  window.addEventListener("DOMContentLoaded", addFeedbackButtons);
  // Also run after window.onload (Swagger UI ready)
  window.addEventListener("load", addFeedbackButtons);
})();
