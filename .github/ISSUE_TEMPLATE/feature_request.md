---
name: 💬 Feedback & Suggestions test
about: Share your feedback, suggestions, or ideas to improve Translation Hub Backend
title: "[FEEDBACK] "
labels: ["feedback", "enhancement"]
assignees: ""
body:
  - type: input
    id: feedback_source
    attributes:
      label: "📍 Source Context"
      description: "Where in the application are you providing feedback from?"
      placeholder: "e.g., /api/v1/translations endpoint, Django Admin, Documentation page"
    validations:
      required: false

  - type: input
    id: user_role
    attributes:
      label: "👤 User Role"
      description: "What is your role when using this system?"
      placeholder: "e.g., Developer, Translator, Project Manager, End User"
    validations:
      required: false

  - type: dropdown
    id: feedback_type
    attributes:
      label: "📝 Feedback Type"
      description: "What type of feedback are you providing?"
      options:
        - "🎯 Feature suggestion"
        - "🔧 Improvement to existing functionality"
        - "📚 Documentation feedback"
        - "🎨 UI/UX feedback (API responses, error messages)"
        - "🏗️ Architecture/Design feedback"
        - "📈 Performance feedback"
        - "🔒 Security feedback"
        - "🧪 Testing feedback"
        - "📋 Process/Workflow feedback"
        - "💡 General suggestion"
    validations:
      required: true

  - type: dropdown
    id: area_focus
    attributes:
      label: "🎯 Area of Focus"
      description: "Which part of the Translation Hub Backend does this relate to?"
      options:
        - "🔗 API Endpoints"
        - "🗃️ Database Models"
        - "🔐 Authentication/Authorization"
        - "🌐 Translation Management"
        - "📊 Data Processing"
        - "🛠️ Development Workflow"
        - "📖 Documentation"
        - "🚀 Deployment/DevOps"
        - "🧪 Testing Framework"
        - "📈 Performance/Optimization"
        - "🔍 Other"
    validations:
      required: true

  - type: textarea
    id: current_scenario
    attributes:
      label: "💭 Current Scenario"
      description: "Describe the current state or functionality you're providing feedback on"
      placeholder: "Explain what currently exists, how it works, and what prompted this feedback..."
    validations:
      required: true

  - type: textarea
    id: suggestion_feedback
    attributes:
      label: "💡 Your Suggestion/Feedback"
      description: "Provide your detailed feedback, suggestion, or idea"
      placeholder: "Describe your suggestion in detail. What would you like to see changed, added, or improved?"
    validations:
      required: true

  - type: textarea
    id: expected_benefits
    attributes:
      label: "🎯 Expected Benefits"
      description: "What benefits would this feedback/suggestion provide?"
      placeholder: |
        **Users:** How would this benefit end users?
        **Developers:** How would this benefit developers?
        **Business:** How would this benefit the business/project?
    validations:
      required: false

  - type: textarea
    id: proposed_implementation
    attributes:
      label: "📋 Proposed Implementation (Optional)"
      description: "If you have ideas on how this could be implemented, share them here"
      placeholder: "Technical approach, API changes, configuration changes, etc."
    validations:
      required: false

  - type: input
    id: related_endpoints
    attributes:
      label: "🔗 Related API Endpoints"
      description: "If applicable, list any API endpoints related to this feedback"
      placeholder: "e.g., /api/v1/translations/, /api/v1/users/"
    validations:
      required: false

  - type: textarea
    id: additional_context
    attributes:
      label: "🏷️ Additional Context"
      description: "Add any other context, considerations, or constraints"
      placeholder: "Browser version, environment details, related issues, external dependencies, etc."
    validations:
      required: false

  - type: checkboxes
    id: priority_indicator
    attributes:
      label: "⚡ Priority Indicator"
      description: "How would you rate the priority of this feedback?"
      options:
        - label: "🔴 High Priority - Blocking current work or critical improvement"
        - label: "🟡 Medium Priority - Important but not blocking"
        - label: "🟢 Low Priority - Nice to have enhancement"

  - type: checkboxes
    id: effort_estimate
    attributes:
      label: "⏱️ Effort Estimate (If Known)"
      description: "If you have technical knowledge, what's your rough effort estimate?"
      options:
        - label: "🚀 Quick Win - Small change, big impact"
        - label: "🔧 Medium Effort - Requires some development time"
        - label: "🏗️ Large Effort - Significant architectural changes needed"
        - label: "❓ Unknown - Need technical assessment"
---
