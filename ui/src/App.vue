<template>
  <div class="app">
    <header class="site-header">
      <div class="site-header__primary">
        <div class="brand-logo">
          <img class="brand-image" :src="denverLogo" alt="Denver logo" />
        </div>
        <div class="status-wrapper">
          <span class="status-label">Status</span>
          <div :class="['status-chip', sessionReady ? 'ready' : initializing ? 'progress' : 'pending']">
            <template v-if="sessionReady">✓ Agent Ready</template>
            <template v-else-if="initializing">Initializing…</template>
            <template v-else>⚠️ Agent Not Initialized</template>
          </div>
        </div>
      </div>
      <nav class="site-nav">
        <button class="toggle-config" type="button" @click="togglePanels">
          {{ showConfig ? 'Hide Connection Settings' : 'Show Connection Settings' }}
        </button>
        <div v-if="sessionReady" class="nav-tabs">
          <button :class="['nav-tab', activeTab === 'submit' ? 'active' : '']" @click="activeTab = 'submit'">📝 Submit Application</button>
          <button :class="['nav-tab', activeTab === 'questions' ? 'active' : '']" @click="activeTab = 'questions'">💬 Ask Questions</button>
          <button :class="['nav-tab', activeTab === 'history' ? 'active' : '']" @click="activeTab = 'history'">📊 Evaluation History</button>
          <button :class="['nav-tab', activeTab === 'library' ? 'active' : '']" @click="activeTab = 'library'">📂 Reference Documents</button>
        </div>
      </nav>
    </header>

    <section class="page-title">
      <h1 class="brand-title">Denver Food Truck Permit Assistant</h1>
    </section>

    <section class="config-card" v-show="showConfig">
      <h2>Connection Settings</h2>
      <div class="config-grid">
        <input v-model="config.protocol" type="hidden" />
        <label class="field">
          <span>Llama Stack Host</span>
          <input v-model="config.host" placeholder="llamastack-server.llama-serve.svc.cluster.local" />
        </label>
        <label class="field">
          <span>Llama Stack Port</span>
          <input v-model="config.port" placeholder="8321" />
        </label>
      </div>
      <div class="config-actions">
        <button class="primary" type="button" :disabled="initializing" @click="initializeAgentHandler">
          {{ initializing ? 'Initializing…' : '🚀 Initialize Agent' }}
        </button>
      </div>
    </section>

    <section class="content-grid">
      <aside v-if="showActivityPanel" class="activity-panel">
        <div class="panel-header">
          <div class="panel-header__title">
            <h2>Activity</h2>
          </div>
        </div>
        <div class="log-list">
          <div
            v-for="log in orderedLogs"
            :key="log.id"
            :class="['log-item', log.type]"
          >
            <div class="log-header">
              <span class="log-time">{{ formatLogTime(log.timestamp) }}</span>
            </div>
            <div class="log-message">{{ log.message }}</div>
          </div>
          <div v-if="!logs.length" class="log-placeholder">Initialize the agent to view activity.</div>
        </div>
        <div class="about-card">
          <p><strong>Denver Food Truck Permit AI Agent</strong></p>
          <ul>
            <li>🤖 Automated compliance checking</li>
            <li>✅ Completeness verification</li>
            <li>📊 Scorecard evaluation</li>
            <li>📚 Regulations knowledge base</li>
            <li>🔎 RAG-powered responses</li>
          </ul>
        </div>
      </aside>

      <main class="main-panel">
        <div v-if="!sessionReady" class="welcome">
          <div class="alert warning alert--large"><span class="alert-icon">⚠️</span><span>Please initialize the agent using the connection settings before proceeding.</span></div>
          <div class="info-panels">
            <div class="info-card">
              <h3>📝 Application Review</h3>
              <p>Automatically reviews submitted permit applications for completeness and accuracy.</p>
            </div>
            <div class="info-card">
              <h3>✅ Compliance Check</h3>
              <p>Verifies compliance with Denver food truck regulations and safety requirements.</p>
            </div>
            <div class="info-card">
              <h3>📊 Scorecard</h3>
              <p>Generates detailed scorecards with actionable feedback and next steps.</p>
            </div>
          </div>
        </div>

        <div v-else class="tabs">

          <section v-if="activeTab === 'submit'" class="tab-content tab-content--form">
            <h2>Evaluate Permit Application</h2>
            <form class="application-form" @submit.prevent="submitApplication">
              <div class="form-hero">
                <div class="form-hero__copy">
                  <h2>Complete Your Permit Application</h2>
                  <p>Fill out each section so the Denver Food Truck agent can review your plan instantly. When a section is complete, it will be highlighted in green. (All sections must be complete to proceed)</p>
                  <ul class="form-highlights">
                    <li :class="{ complete: completedSections.overview }">
                      <span class="status-icon">{{ completedSections.overview ? '✅' : '🧾' }}</span>
                      Capture key business and commissary details
                    </li>
                    <li :class="{ complete: completedSections.water }">
                      <span class="status-icon">{{ completedSections.water ? '✅' : '🚰' }}</span>
                      Confirm water system capacity and sanitation
                    </li>
                    <li :class="{ complete: completedSections.docs }">
                      <span class="status-icon">{{ completedSections.docs ? '✅' : '📎' }}</span>
                      Attach required documentation in one place
                    </li>
                  </ul>
                </div>
                <div class="form-hero__tip">
                  <span class="tip-eyebrow"><span class="tip-icon">💡</span> Agent Tip</span>
                  <p>Detailed responses improve evaluation accuracy and reduce follow-up requests.</p>
                </div>
              </div>

              <section class="form-section">
                <header class="form-section__header">
                  <span class="section-step">Section 1</span>
                  <div>
                    <h3>Business Overview</h3>
                    <p>Introduce your food truck and primary operator.</p>
                  </div>
                </header>
                <div class="form-section__grid form-section__grid--two">
                  <label class="field">
                    <span>Business Name *</span>
                    <input v-model="application.businessName" required />
                  </label>
                  <label class="field">
                    <span>Operator Name *</span>
                    <input v-model="application.operatorName" required />
                  </label>
                  <label class="field">
                    <span>Vehicle Type *</span>
                    <select v-model="application.vehicleType">
                      <option v-for="option in vehicleTypes" :key="option" :value="option">
                        {{ option }}
                      </option>
                    </select>
                  </label>
                  <label class="field field--full">
                    <span>Menu Items *</span>
                    <textarea v-model="application.menuItems" placeholder="One item per line"></textarea>
                  </label>
                </div>
                <div class="section-actions">
                  <button type="button" class="link-button" @click="scrollToTop">⬆️ Back to Top</button>
                </div>
              </section>

              <section class="form-section">
                <header class="form-section__header">
                  <span class="section-step">Section 2</span>
                  <div>
                    <h3>Commissary &amp; Operations</h3>
                    <p>Share where you prep food and when you plan to serve.</p>
                  </div>
                </header>
                <div class="form-section__grid form-section__grid--two">
                  <label class="field">
                    <span>Commissary Name *</span>
                    <input v-model="application.commissaryName" required />
                  </label>
                  <label class="field field--full field--autocomplete">
                    <span>Commissary Address *</span>
                    <input
                      v-model="application.commissaryAddress"
                      type="text"
                      placeholder="Start typing address"
                      @input="handleCommissaryInput"
                      @focus="showCommissarySuggestions = true"
                      @blur="handleCommissaryBlur"
                      autocomplete="off"
                    />
                    <div
                      v-if="showCommissarySuggestions && (commissarySuggestions.length || commissaryLoading)"
                      class="autocomplete-panel"
                    >
                      <div v-if="commissaryLoading" class="autocomplete-status">Searching…</div>
                      <ul v-else-if="commissarySuggestions.length" class="autocomplete-list">
                        <li
                          v-for="suggestion in commissarySuggestions"
                          :key="suggestion.id"
                          class="autocomplete-item"
                          @mousedown.prevent="selectCommissarySuggestion(suggestion)"
                        >
                          <span class="autocomplete-primary">{{ suggestion.primary }}</span>
                          <span class="autocomplete-secondary">{{ suggestion.secondary }}</span>
                        </li>
                      </ul>
                      <div v-else class="autocomplete-status">No matches yet</div>
                    </div>
                    <small class="field-hint">Select a USPS-verified address when available.</small>
                  </label>
                  <label class="field field--full">
                    <span>Proposed Operating Locations *</span>
                    <textarea v-model="application.locations" placeholder="One location per line"></textarea>
                  </label>
                  <label class="field">
                    <span>Hours of Operation *</span>
                    <input v-model="application.hours" />
                  </label>
                </div>
                <div class="section-actions">
                  <button type="button" class="link-button" @click="scrollToTop">⬆️ Back to Top</button>
                </div>
              </section>

              <section class="form-section">
                <header class="form-section__header">
                  <span class="section-step">Section 3</span>
                  <div>
                    <h3>Water System &amp; Equipment</h3>
                    <p>Confirm your health and safety readiness.</p>
                  </div>
                </header>
                <div class="form-section__grid form-section__grid--metrics">
                  <label class="field metric-field">
                    <span>Clean Water Tank *</span>
                    <div class="input-with-unit">
                      <input type="number" min="0" step="1" placeholder="e.g. 35" v-model.number="application.cleanWater" />
                      <span class="input-unit">gal</span>
                    </div>
                  </label>
                  <label class="field metric-field">
                    <span>Wastewater Tank *</span>
                    <div class="input-with-unit">
                      <input type="number" min="0" step="1" placeholder="e.g. 45" v-model.number="application.wasteWater" />
                      <span class="input-unit">gal</span>
                    </div>
                  </label>
                  <label class="field metric-field">
                    <span>Hand Sink Width *</span>
                    <div class="input-with-unit">
                      <input type="number" min="0" step="0.5" placeholder="e.g. 12" v-model.number="application.handSinkWidth" />
                      <span class="input-unit">in</span>
                    </div>
                  </label>
                  <label class="field metric-field">
                    <span>Hand Sink Length *</span>
                    <div class="input-with-unit">
                      <input type="number" min="0" step="0.5" placeholder="e.g. 10" v-model.number="application.handSinkLength" />
                      <span class="input-unit">in</span>
                    </div>
                  </label>
                  <label class="field metric-field">
                    <span>Hot Water Temperature *</span>
                    <div class="input-with-unit">
                      <input type="number" min="0" step="1" placeholder="e.g. 120" max="140" v-model.number="application.waterTemp" />
                      <span class="input-unit">°F</span>
                    </div>
                  </label>
                </div>

                <div class="checkbox-group">
                  <span class="checkbox-group__label">Equipment Readiness</span>
                  <div class="checkbox-chips">
                    <label class="checkbox-chip">
                      <input type="checkbox" v-model="application.hasHood" />
                      <span>Type I Hood with Fire Suppression</span>
                    </label>
                    <label class="checkbox-chip">
                      <input type="checkbox" v-model="application.hasRefrigeration" />
                      <span>Commercial Refrigeration</span>
                    </label>
                    <label class="checkbox-chip">
                      <input type="checkbox" v-model="application.hasVentilation" />
                      <span>Commercial Grade Ventilation System</span>
                    </label>
                  </div>
                </div>

                <label class="field field--full">
                  <span>Cooking Equipment</span>
                  <div class="toggle-chip-list">
                    <button
                      v-for="option in cookingEquipmentOptions"
                      :key="option"
                      type="button"
                      class="toggle-chip"
                      :aria-pressed="application.cookingEquipment.includes(option)"
                      :class="{ active: application.cookingEquipment.includes(option) }"
                      @click="toggleMultiValue(application.cookingEquipment, option)"
                    >
                      <span class="toggle-chip__icon">{{ application.cookingEquipment.includes(option) ? '✔' : '•' }}</span>
                      {{ option }}
                    </button>
                  </div>
                  <small class="toggle-chip__hint">Tap to add equipment. Selected items show a checkmark.</small>
                </label>
                <div class="section-actions">
                  <button type="button" class="link-button" @click="scrollToTop">⬆️ Back to Top</button>
                </div>
              </section>

              <section class="form-section">
                <header class="form-section__header">
                  <span class="section-step">Section 4</span>
                  <div>
                    <h3>Documentation</h3>
                    <p>Confirm the permits and plans you will submit.</p>
                  </div>
                </header>
                <div class="documentation-card" :class="{ 'documentation-card--disabled': !sessionReady }">
                  <header class="documentation-card__header">
                    <div>
                      <h4>Documents Attached *</h4>
                      <p>Choose the documents you’ve prepared. Selected items show a checkmark.</p>
                    </div>
                    <div class="upload-panel__header">
                      <span>Upload Attachments</span>
                      <small v-if="!sessionReady">Initialize the permitting agent to enable uploads.</small>
                      <small v-else-if="!application.documents.length">Select a document below to attach supporting files.</small>
                      <small v-else>Upload files that match each selected document. Accepted formats: PDF, images, DOC, DOCX.</small>
                    </div>
                  </header>
                  <div class="documentation-card__body">
                    <div v-if="sessionDocuments.length" class="upload-summary documentation-card__summary">
                      {{ sessionDocuments.length }} file{{ sessionDocuments.length === 1 ? '' : 's' }} uploaded this session.
                    </div>
                    <div class="documentation-card__list">
                      <div v-for="option in documentOptions" :key="option" class="documentation-option">
                        <button
                          type="button"
                          class="toggle-chip"
                          :aria-pressed="application.documents.includes(option)"
                          :class="{ active: application.documents.includes(option) }"
                          @click="toggleMultiValue(application.documents, option)"
                        >
                          <span class="toggle-chip__icon">{{ application.documents.includes(option) ? '✔' : '•' }}</span>
                          {{ option }}
                        </button>
                        <transition name="fade-slide">
                          <div v-if="application.documents.includes(option)" class="documentation-upload">
                            <div class="upload-item">
                              <div class="upload-item__header">
                                <span class="upload-item__label">Attach {{ option }}</span>
                                <input
                                  class="upload-input"
                                  type="file"
                                  :id="`upload-${slugifyDocumentType(option)}`"
                                  :accept="documentUploadAccept"
                                  :disabled="!sessionReady || documentUploadState[option]?.uploading"
                                  @change="handleDocumentUpload(option, $event)"
                                />
                                <label
                                  class="upload-button"
                                  :class="{ disabled: !sessionReady || documentUploadState[option]?.uploading }"
                                  :for="`upload-${slugifyDocumentType(option)}`"
                                >
                                  {{ documentUploadState[option]?.uploading ? 'Uploading...' : 'Upload File' }}
                                </label>
                              </div>
                              <p v-if="documentUploadState[option]?.error" class="upload-error">
                                {{ documentUploadState[option].error }}
                              </p>
                              <ul v-if="documentsByType[option]?.length" class="upload-files">
                                <li v-for="doc in documentsByType[option]" :key="doc.id">
                                  <a :href="doc.url" target="_blank" rel="noopener">
                                    {{ doc.originalName }}
                                  </a>
                                  <span class="meta">{{ formatFileSize(doc.sizeBytes) }}</span>
                                  <span class="meta">{{ formatUploadedAt(doc.uploadedAt) }}</span>
                                </li>
                              </ul>
                              <p v-else class="upload-hint">No uploads yet.</p>
                            </div>
                          </div>
                        </transition>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="section-actions">
                  <button type="button" class="link-button" @click="scrollToTop">⬆️ Back to Top</button>
                </div>
              </section>

              <div class="form-footer actions">
                <button class="secondary" type="button" @click="resetApplication" :disabled="evaluationLoading">
                  🔄 Clear Form
                </button>
                <button class="primary" type="submit" :disabled="evaluationLoading">
                  {{ evaluationLoading ? 'Evaluating…' : '🔍 Evaluate Application' }}
                </button>
              </div>
            </form>

            <div v-if="formError" class="alert error">{{ formError }}</div>

            <section v-if="evaluationResult" class="evaluation-results">
              <h2>Evaluation Results</h2>
              <div class="result-metrics">
                <div class="metric-card">
                  <span class="metric-label">Overall Score</span>
                  <span class="metric-value">{{ evaluationResult.overall_score ?? 0 }}/100</span>
                </div>
                <div class="metric-card">
                  <span class="metric-label">Recommendation</span>
                  <span class="metric-value">{{ evaluationResult.recommendation ?? 'N/A' }}</span>
                </div>
              </div>

              <div v-if="evaluationResult.categories" class="category-grid">
                <div
                  v-for="(category, key) in evaluationResult.categories"
                  :key="key"
                  class="category-card"
                >
                  <div class="category-header">
                    <span>{{ formatCategoryLabel(key) }}</span>
                    <span class="score">{{ category.score ?? 0 }}/100</span>
                  </div>
                  <div class="progress">
                    <div class="progress-bar" :style="{ width: `${Math.min(category.score ?? 0, 100)}%` }"></div>
                  </div>
                  <div v-if="category.findings?.length" class="category-section">
                    <h4>Findings</h4>
                    <ul>
                      <li v-for="(finding, idx) in category.findings" :key="idx">{{ finding }}</li>
                    </ul>
                  </div>
                  <div v-if="category.required_actions?.length" class="category-section">
                    <h4>Required Actions</h4>
                    <ul>
                      <li v-for="(action, idx) in category.required_actions" :key="idx">{{ action }}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div v-if="evaluationResult.summary" class="summary-card">
                <h3>Summary</h3>
                <p>{{ evaluationResult.summary }}</p>
              </div>

              <div v-if="evaluationResult.next_steps?.length" class="summary-card">
                <h3>Next Steps</h3>
                <ol>
                  <li v-for="(step, idx) in evaluationResult.next_steps" :key="idx">{{ step }}</li>
                </ol>
              </div>

              <details class="raw-response">
                <summary>Debug: Raw Response</summary>
                <pre>{{ evaluationResult.raw_response }}</pre>
              </details>
            </section>
          </section>

          <section v-else-if="activeTab === 'questions'" class="tab-content">
            <h2>Ask Questions About Permit Requirements</h2>
            <p>Ask any questions about Denver food truck permit regulations.</p>
            <label class="field">
              <span>Your Question</span>
              <textarea v-model="questionInput" placeholder="E.g., What are the water tank requirements for a food truck?" rows="4"></textarea>
            </label>
            <div class="actions">
              <button class="primary" :disabled="!questionInput || questionLoading" @click="askQuestionHandler">
                {{ questionLoading ? 'Searching…' : 'Get Answer' }}
              </button>
            </div>
            <div v-if="questionAnswer" class="answer-card">
              <h3>Answer</h3>
              <p>{{ questionAnswer }}</p>
            </div>

            <div class="common-questions">
              <h3>Common Questions</h3>
              <div class="question-grid">
                <button
                  v-for="question in commonQuestions"
                  :key="question"
                  class="question-button"
                  type="button"
                  @click="askCommonQuestion(question)"
                >
                  {{ question }}
                </button>
              </div>
            </div>
          </section>

          <section v-else-if="activeTab === 'library'" class="tab-content document-section">
            <div v-if="libraryLoading" class="alert info">Loading documents…</div>
            <div v-else-if="libraryError" class="alert error">{{ libraryError }}</div>
            <template v-else-if="libraryCards.length">
              <header class="document-hero">
                <div class="document-hero__copy">
                  <span class="document-hero__eyebrow">Reference Library</span>
                  <h2>Document Downloads</h2>
                  <p>
                    Download the official packets, checklists, and guides that Denver Public Health and partner
                    agencies require for food truck permitting.
                  </p>
                </div>
                <div class="document-hero__stats">
                  <div class="document-stat">
                    <span class="document-stat__value">{{ libraryStats.total }}</span>
                    <span class="document-stat__label">Documents</span>
                  </div>
                  <div class="document-stat" v-if="libraryLastUpdatedDisplay">
                    <span class="document-stat__value">{{ libraryLastUpdatedDisplay }}</span>
                    <span class="document-stat__label">Last Updated</span>
                  </div>
                </div>
              </header>
              <div class="document-grid">
                <article
                  v-for="doc in libraryCards"
                  :key="doc.relativePath"
                  class="document-card"
                  :style="{ '--accent-primary': doc.accentPrimary, '--accent-secondary': doc.accentSecondary }"
                >
                  <div class="document-card__thumb">
                    <img :src="doc.icon" :alt="`${doc.title} icon`" class="document-card__icon" />
                    <span class="document-card__tag">{{ doc.tag }}</span>
                  </div>
                  <div class="document-card__body">
                    <h3>{{ doc.title }}</h3>
                    <p>{{ doc.description }}</p>
                    <div class="document-card__details">
                      <span>{{ doc.extension || 'PDF' }}</span>
                      <span>{{ formatFileSize(doc.sizeBytes) || '—' }}</span>
                      <span>{{ formatUploadedAt(doc.modifiedAt) || '—' }}</span>
                    </div>
                    <a
                      class="document-card__download"
                      :href="doc.url"
                      target="_blank"
                      rel="noopener"
                    >
                      Download
                    </a>
                  </div>
                </article>
              </div>
            </template>
            <div v-else class="alert info">No reference documents found.</div>
          </section>

          <section v-else class="tab-content">
            <h2>Evaluation History</h2>
            <div v-if="history.length" class="history">
              <div class="alert success">Total Evaluations: {{ history.length }}</div>
              <div class="history-list">
                <details v-for="(entry, index) in reversedHistory" :key="entry.id" class="history-entry">
                  <summary>
                    #{{ history.length - index }} — {{ entry.application.business_name || 'N/A' }} —
                    {{ entry.evaluation.recommendation || 'N/A' }} ({{ entry.evaluation.overall_score ?? 0 }}/100)
                  </summary>
                  <div class="history-columns">
                    <div>
                      <h4>Application Details</h4>
                      <pre>{{ pretty(entry.application) }}</pre>
                    </div>
                    <div>
                      <h4>Evaluation Results</h4>
                      <pre>{{ pretty(entry.evaluation) }}</pre>
                    </div>
                  </div>
                </details>
              </div>
              <div class="actions">
                <button class="secondary" type="button" @click="clearHistory">🗑️ Clear History</button>
              </div>
            </div>
            <div v-else class="alert info">No evaluations yet. Submit an application in the "Submit Application" tab to see results here.</div>
          </section>
        </div>
      </main>
    </section>
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="footer-logo-block">
            <img :src="redhatLogo" alt="Red Hat logo" class="footer-logo" />
            <span class="footer-powered">Powered by Red Hat</span>
          </div>
          <div class="footer-brand-copy">
            <h3>Denver Food Truck Permit Assistant</h3>
            <p>AI-powered permit guidance for Denver's mobile food community.</p>
          </div>
        </div>
        <div class="footer-columns">
          <div class="footer-column">
            <h4>Resources</h4>
            <ul>
              <li><a href="https://www.denvergov.org/BusinessLicensing" target="_blank" rel="noopener">Business Licensing</a></li>
              <li><a href="https://www.denvergov.org/EnvironmentalHealth" target="_blank" rel="noopener">Environmental Health</a></li>
              <li><a href="https://www.denvergov.org/Permitting" target="_blank" rel="noopener">Permitting Center</a></li>
            </ul>
          </div>
          <div class="footer-column">
            <h4>Support</h4>
            <ul>
              <li><a href="mailto:support@denverfoodtrucks.gov">Contact Support</a></li>
              <li><a href="https://status.redhat.com" target="_blank" rel="noopener">System Status</a></li>
              <li><a href="#" @click.prevent="scrollToTop">Back to Top</a></li>
            </ul>
          </div>
          <div class="footer-column">
            <h4>Stay Connected</h4>
            <ul class="footer-social">
              <li v-for="link in socialLinks" :key="link.label">
                <a :href="link.href" target="_blank" rel="noopener">
                  <img :src="link.icon" :alt="link.label" class="social-icon" />
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© {{ new Date().getFullYear() }} DemoJam AI Team (what's our name?!). All rights reserved.</span>
        <div class="footer-links">
          <a href="https://www.denvergov.org/PrivacyPolicy" target="_blank" rel="noopener">Privacy</a>
          <a href="https://www.denvergov.org/Accessibility" target="_blank" rel="noopener">Accessibility</a>
          <a href="https://www.denvergov.org/Terms" target="_blank" rel="noopener">Terms of Use</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import denverLogo from './assets/denver-logo.png';
import redhatLogo from './assets/redhat-logo.svg';
import twitterIcon from './assets/icons/twitter.svg';
import facebookIcon from './assets/icons/facebook.svg';
import instagramIcon from './assets/icons/instagram.svg';
import pdfIcon from './assets/icons/document-pdf.svg';
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import {
  autocompleteAddress,
  evaluateApplication,
  fetchDocuments,
  fetchDocumentLibrary,
  fetchEvaluationHistory,
  fetchSavedApplication,
  fetchSession,
  initializeAgentStream,
  queryAgent,
  resetSession,
  uploadDocument,
} from './services/api.js';

const config = reactive({
  protocol: 'http',
  host: 'llamastack-server.llama-serve.svc.cluster.local',
  port: '8321',
});

const showConfig = ref(true);
const initializing = ref(false);
const sessionId = ref('');
const logs = ref([]);
const vectorDbId = ref('');
const currentStream = ref(null);
const showActivityPanel = ref(true);

const sessionReady = computed(() => Boolean(sessionId.value));
const orderedLogs = computed(() => [...logs.value].sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0)));

const vehicleTypes = ['Mobile Truck', 'Mobile Trailer', 'Cart', 'Other'];
const cookingEquipmentOptions = ['Griddle', 'Grill', 'Deep Fryer', 'Oven', 'Steamer', 'Other'];
const documentOptions = [
  'Vehicle Registration',
  'Insurance Certificate',
  'Commissary Affidavit',
  'Mobile Unit Floor Plan',
  'Equipment Specification Sheets',
  'Water System Diagram',
  'Waste Disposal Plan',
  'Certified Food Manager Certificate',
];

const sessionDocuments = ref([]);
const documentsByType = computed(() => {
  const grouped = {};
  for (const doc of sessionDocuments.value) {
    const type = doc?.documentType || 'Other';
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(doc);
  }
  Object.keys(grouped).forEach((key) => {
    grouped[key].sort((a, b) => {
      const aTime = new Date(a?.uploadedAt || 0).getTime();
      const bTime = new Date(b?.uploadedAt || 0).getTime();
      return bTime - aTime;
    });
  });
  return grouped;
});
const documentUploadState = reactive({});
const documentUploadAccept = '.pdf,.png,.jpg,.jpeg,.doc,.docx';

const socialLinks = [
  { label: 'Twitter', href: 'https://www.twitter.com/CityofDenver', icon: twitterIcon },
  { label: 'Facebook', href: 'https://www.facebook.com/CityandCountyofDenver', icon: facebookIcon },
  { label: 'Instagram', href: 'https://www.instagram.com/cityofdenver', icon: instagramIcon },
];

const commissarySuggestions = ref([]);
const commissaryLoading = ref(false);
const showCommissarySuggestions = ref(false);
let commissarySuggestionTimeout = null;
let suppressCommissaryFetch = false;
let autoConnectInvoked = false;

const fetchCommissarySuggestions = async (term) => {
  if (suppressCommissaryFetch) {
    suppressCommissaryFetch = false;
    return;
  }
  const searchTerm = term.trim();
  if (searchTerm.length < 3) {
    commissarySuggestions.value = [];
    return;
  }
  commissaryLoading.value = true;
  try {
    const { suggestions = [] } = await autocompleteAddress({ search: searchTerm });
    commissarySuggestions.value = suggestions.map((suggestion, index) => ({
      id: `${suggestion.street_line || ''}-${suggestion.city || ''}-${suggestion.state || ''}-${suggestion.zipcode || ''}-${index}`
        .replace(/\s+/g, '-'),
      primary: `${suggestion.street_line || ''}${suggestion.secondary ? ' ' + suggestion.secondary : ''}`.trim(),
      secondary: `${suggestion.city || ''}, ${suggestion.state || ''} ${suggestion.zipcode || ''}`.trim(),
      fullAddress: `${suggestion.street_line || ''}${suggestion.secondary ? ' ' + suggestion.secondary : ''}, ${suggestion.city || ''}, ${suggestion.state || ''} ${suggestion.zipcode || ''}`.replace(/,\s+,/g, ',').trim(),
    }));
  } catch (error) {
    console.warn('Address autocomplete failed', error);
  } finally {
    commissaryLoading.value = false;
  }
};

const handleCommissaryInput = () => {
  showCommissarySuggestions.value = true;
  if (commissarySuggestionTimeout) {
    clearTimeout(commissarySuggestionTimeout);
  }
  commissarySuggestionTimeout = setTimeout(() => {
    fetchCommissarySuggestions(application.commissaryAddress || '');
  }, 250);
};

const handleCommissaryBlur = () => {
  setTimeout(() => {
    showCommissarySuggestions.value = false;
  }, 150);
};

const selectCommissarySuggestion = (suggestion) => {
  suppressCommissaryFetch = true;
  application.commissaryAddress = suggestion.fullAddress;
  showCommissarySuggestions.value = false;
  commissarySuggestions.value = [];
};

const slugifyDocumentType = (value) => (value || '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '') || 'document';

const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '';
  }
  const units = ['bytes', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  const precision = unitIndex === 0 ? 0 : size < 10 ? 1 : 0;
  return `${size.toFixed(precision)} ${units[unitIndex]}`;
};

const formatUploadedAt = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
};

const loadSessionDocuments = async () => {
  if (!sessionId.value) {
    sessionDocuments.value = [];
    return;
  }
  try {
    const { documents = [] } = await fetchDocuments(sessionId.value);
    sessionDocuments.value = documents;
  } catch (error) {
    console.warn('Failed to load session documents', error);
  }
};

const handleDocumentUpload = async (documentType, event) => {
  const input = event?.target;
  const files = input?.files || [];
  const file = files[0];
  if (!file) {
    return;
  }
  if (!sessionReady.value || !sessionId.value) {
    documentUploadState[documentType] = { uploading: false, error: 'Initialize the agent before uploading files.' };
    if (input) {
      input.value = '';
    }
    return;
  }
  documentUploadState[documentType] = { uploading: true, error: '' };
  try {
    await uploadDocument({ sessionId: sessionId.value, documentType, file });
    await loadSessionDocuments();
    documentUploadState[documentType] = { uploading: false, error: '' };
  } catch (error) {
    const message = error?.response?.data?.message || error.message || 'Upload failed.';
    documentUploadState[documentType] = { uploading: false, error: message };
  } finally {
    if (input) {
      input.value = '';
    }
  }
};

const toPlainApplication = () => JSON.parse(JSON.stringify(application));

const applySavedApplication = (saved) => {
  if (!saved || typeof saved !== 'object') {
    return;
  }
  const defaults = createEmptyApplication();
  const merged = { ...defaults, ...saved };
  merged.cookingEquipment = Array.isArray(merged.cookingEquipment) ? merged.cookingEquipment : [];
  merged.documents = Array.isArray(merged.documents) ? merged.documents : [];
  Object.assign(application, merged);
};

const loadSavedApplication = async (targetSessionId = sessionId.value) => {
  if (!targetSessionId) {
    return;
  }
  try {
    const { application: savedApplication, updatedAt } = await fetchSavedApplication(targetSessionId);
    if (savedApplication && typeof savedApplication === 'object') {
      applySavedApplication(savedApplication);
      logs.value = [
        {
          id: crypto.randomUUID(),
          type: 'info',
          message: `Draft restored from database${updatedAt ? ` (saved ${new Date(updatedAt).toLocaleString()})` : ''}.`,
          timestamp: Date.now(),
        },
        ...logs.value,
      ];
    }
  } catch (error) {
    if (error?.response?.status !== 404) {
      console.warn('Failed to load saved application', error);
    }
  }
};

const loadEvaluationHistory = async (targetSessionId = sessionId.value) => {
  if (!targetSessionId) {
    history.value = [];
    return;
  }
  try {
    const { evaluations = [] } = await fetchEvaluationHistory(targetSessionId);
    const normalized = evaluations.map((entry) => ({
      id: entry.id ?? crypto.randomUUID(),
      createdAt: entry.createdAt,
      application: entry.application ?? {},
      evaluation: entry.evaluation ?? {},
    }));
    history.value = normalized.sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return aTime - bTime;
    });
  } catch (error) {
    console.warn('Failed to load evaluation history', error);
  }
};

const loadDocumentLibrary = async () => {
  libraryLoading.value = true;
  libraryError.value = '';
  try {
    const { documents = [] } = await fetchDocumentLibrary();
    documentLibrary.value = documents;
  } catch (error) {
    libraryError.value = error?.response?.data?.message || error.message || 'Failed to load documents.';
  } finally {
    libraryLoading.value = false;
  }
};

const toggleMultiValue = (targetArray, value) => {
  if (!Array.isArray(targetArray)) {
    return;
  }
  const index = targetArray.indexOf(value);
  if (index === -1) {
    targetArray.push(value);
  } else {
    targetArray.splice(index, 1);
  }
};

const shouldAutoConnect = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  const params = new URLSearchParams(window.location.search || '');
  if (!params.has('autoconnect')) {
    return false;
  }
  const rawValue = params.get('autoconnect');
  if (!rawValue) {
    return true;
  }
  const normalized = rawValue.trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(normalized);
};

const setPanelVisibility = (state) => {
  showConfig.value = state;
  showActivityPanel.value = state;
};

const togglePanels = () => {
  setPanelVisibility(!showConfig.value);
};

const updateUrlForSession = (value) => {
  if (typeof window === 'undefined') {
    return;
  }
  const url = new URL(window.location.href);
  if (value) {
    url.search = `?${encodeURIComponent(value)}`;
  } else {
    url.search = '';
  }
  window.history.replaceState({}, '', url.toString());
};

const extractSessionIdFromQuery = () => {
  if (typeof window === 'undefined') {
    return '';
  }
  const search = window.location.search || '';
  if (!search) {
    return '';
  }
  const trimmed = search.slice(1).trim();
  if (!trimmed) {
    return '';
  }
  if (!trimmed.includes('=')) {
    return decodeURIComponent(trimmed);
  }
  const params = new URLSearchParams(search);
  return params.get('sessionId') || params.get('session') || params.get('id') || '';
};

const restoreSessionFromUrl = async (candidate) => {
  if (!candidate) {
    return;
  }
  try {
    const { session } = await fetchSession(candidate);
    if (!session?.sessionId) {
      return;
    }
    sessionId.value = session.sessionId;
    vectorDbId.value = session.vectorDbId || '';
    setPanelVisibility(false);
    logs.value = [
      {
        id: crypto.randomUUID(),
        type: 'info',
        message: `Restored session ${session.sessionId} from database.`,
        timestamp: Date.now(),
      },
      ...logs.value,
    ];
  } catch (error) {
    const message = error?.response?.data?.message || error.message || 'Failed to restore session from database.';
    logs.value = [
      {
        id: crypto.randomUUID(),
        type: 'error',
        message,
        timestamp: Date.now(),
      },
      ...logs.value,
    ];
    console.warn('Failed to restore session from URL', error);
  }
};

const createEmptyApplication = () => ({
  businessName: '',
  operatorName: '',
  vehicleType: 'Mobile Truck',
  menuItems: '',
  commissaryName: '',
  commissaryAddress: '',
  cleanWater: null,
  wasteWater: null,
  handSinkWidth: null,
  handSinkLength: null,
  waterTemp: null,
  hasHood: false,
  hasRefrigeration: false,
  hasVentilation: false,
  cookingEquipment: [],
  locations: '',
  hours: '',
  documents: [],
});

const application = reactive(createEmptyApplication());
const evaluationResult = ref(null);
const evaluationLoading = ref(false);
const formError = ref('');
const history = ref([]);
const documentLibrary = ref([]);
const libraryLoading = ref(false);
const libraryError = ref('');
const libraryCards = computed(() =>
  documentLibrary.value.map((doc) => ({
    ...doc,
    icon: doc.thumbnail || pdfIcon,
    tag: doc.tag || doc.extension || 'Document',
    accentPrimary: doc.accentPrimary || '#2563eb',
    accentSecondary: doc.accentSecondary || '#60a5fa',
  })),
);
const libraryStats = computed(() => {
  const docs = documentLibrary.value;
  if (!docs.length) {
    return { total: 0, lastUpdated: '' };
  }
  const latestDoc = docs.reduce((latest, current) => {
    const latestTime = latest ? new Date(latest.modifiedAt || latest.uploadedAt || 0).getTime() : 0;
    const currentTime = new Date(current.modifiedAt || current.uploadedAt || 0).getTime();
    return currentTime > latestTime ? current : latest;
  }, null);
  return {
    total: docs.length,
    lastUpdated: latestDoc?.modifiedAt || latestDoc?.uploadedAt || '',
  };
});
const libraryLastUpdatedDisplay = computed(() =>
  libraryStats.value.lastUpdated ? formatUploadedAt(libraryStats.value.lastUpdated) : '',
);
const activeTab = ref('submit');

const completedSections = computed(() => ({
  overview: Boolean(application.businessName && application.operatorName && application.vehicleType && application.menuItems.trim()),
  commissary: Boolean(application.commissaryName && application.commissaryAddress.trim() && application.locations.trim() && application.hours.trim()),
  water: Boolean(
    application.cleanWater > 0 &&
      application.wasteWater > 0 &&
      application.handSinkWidth > 0 &&
      application.handSinkLength > 0 &&
      application.waterTemp > 0
  ),
  docs: Array.isArray(application.documents) && application.documents.length > 0,
}));

const questionInput = ref('');
const questionLoading = ref(false);
const questionAnswer = ref('');

const commonQuestions = [
  'What are the water tank requirements for a food truck?',
  'Where can I operate my food truck in Denver?',
  'What fire safety equipment is required?',
  'What documents do I need to submit for a permit?',
  'What are the commissary requirements?',
  'How much does a food truck permit cost?',
  'What are the hand washing sink requirements?',
  'Can I operate in public parks?',
];

const reversedHistory = computed(() => [...history.value].reverse());

const pretty = (obj) => JSON.stringify(obj, null, 2);

const formatCategoryLabel = (label) => label.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const validateForm = () => {
  if (
    !application.businessName.trim() ||
    !application.operatorName.trim() ||
    !application.menuItems.trim() ||
    !application.commissaryName.trim() ||
    !application.commissaryAddress.trim() ||
    !application.locations.trim()
  ) {
    formError.value = '⚠️ Please fill in all required fields marked with *';
    return false;
  }
  if (
    !Number.isFinite(application.cleanWater) ||
    application.cleanWater <= 0 ||
    !Number.isFinite(application.wasteWater) ||
    application.wasteWater <= 0 ||
    !Number.isFinite(application.handSinkWidth) ||
    application.handSinkWidth <= 0 ||
    !Number.isFinite(application.handSinkLength) ||
    application.handSinkLength <= 0 ||
    !Number.isFinite(application.waterTemp) ||
    application.waterTemp <= 0
  ) {
    formError.value = '⚠️ Please provide positive values for all water system measurements marked with *';
    return false;
  }
  formError.value = '';
  return true;
};

const parseEventData = (event) => {
  if (!event?.data) return null;
  try {
    return JSON.parse(event.data);
  } catch (error) {
    console.warn('Failed to parse event data', error);
    return null;
  }
};

const closeCurrentStream = () => {
  if (currentStream.value) {
    currentStream.value.close();
    currentStream.value = null;
  }
};

const initializeAgentHandler = async () => {
  if (initializing.value) return;
  closeCurrentStream();
  logs.value = [];

  if (sessionId.value) {
    try {
      await resetSession({ sessionId: sessionId.value });
    } catch (error) {
      console.warn('Failed to reset existing session', error);
    }
    sessionId.value = '';
    vectorDbId.value = '';
  }

  initializing.value = true;

  const stream = initializeAgentStream({
    protocol: config.protocol,
    host: config.host,
    port: config.port,
  });

  currentStream.value = stream;

stream.addEventListener('log', (event) => {
    const payload = parseEventData(event);
    if (payload) {
      logs.value = [...logs.value, payload];
    }
  });

  stream.addEventListener('complete', (event) => {
    const payload = parseEventData(event);
    if (payload) {
      sessionId.value = payload.sessionId || '';
      vectorDbId.value = payload.vectorDbId || '';
      if (Array.isArray(payload.logs)) {
        logs.value = payload.logs;
      }
    }
    initializing.value = false;
    setPanelVisibility(false);
    closeCurrentStream();
  });

  stream.addEventListener('error', (event) => {
    const payload = parseEventData(event);
    const message = payload?.message || 'Initialization failed. Please try again.';
    logs.value = [
      ...logs.value,
      { id: crypto.randomUUID(), type: 'error', message, timestamp: Date.now() },
    ];
    initializing.value = false;
    setPanelVisibility(true);
    closeCurrentStream();
  });

  stream.addEventListener('end', () => {
    initializing.value = false;
    closeCurrentStream();
  });

  stream.onerror = () => {
    if (!initializing.value) return;
    logs.value = [
      ...logs.value,
      { id: crypto.randomUUID(), type: 'error', message: 'Connection lost while initializing agent.', timestamp: Date.now() },
    ];
    initializing.value = false;
    setPanelVisibility(true);
    closeCurrentStream();
  };
};

watch(sessionId, (value) => {
  updateUrlForSession(value);
  sessionDocuments.value = [];
  history.value = [];
  Object.keys(documentUploadState).forEach((key) => {
    delete documentUploadState[key];
  });
  if (value) {
    loadSessionDocuments();
    loadSavedApplication(value);
    loadEvaluationHistory(value);
    showActivityPanel.value = false;
  } else {
    showActivityPanel.value = true;
  }
});

watch(activeTab, (value) => {
  if (value === 'library' && (!documentLibrary.value.length || libraryError.value)) {
    loadDocumentLibrary();
  }
});

watch(
  () => [...application.documents],
  (docs) => {
    const active = new Set(docs);
    Object.keys(documentUploadState).forEach((key) => {
      if (!active.has(key)) {
        delete documentUploadState[key];
      }
    });
  },
);

onBeforeUnmount(() => {
  closeCurrentStream();
  if (commissarySuggestionTimeout) {
    clearTimeout(commissarySuggestionTimeout);
  }
});

onMounted(async () => {
  const candidate = extractSessionIdFromQuery();
  if (candidate) {
    await restoreSessionFromUrl(candidate);
  }
  if (!sessionReady.value && shouldAutoConnect() && !autoConnectInvoked) {
    autoConnectInvoked = true;
    initializeAgentHandler();
  }
  loadDocumentLibrary();
});

const buildApplicationPayload = () => ({
  business_name: application.businessName,
  operator_name: application.operatorName,
  vehicle_type: application.vehicleType,
  commissary: application.commissaryName,
  commissary_address: application.commissaryAddress,
  water_system: {
    clean_water_tank_size: `${application.cleanWater} gallons`,
    wastewater_tank_size: `${application.wasteWater} gallons`,
    hand_sink_dimensions: `${application.handSinkWidth}x${application.handSinkLength} inches`,
    hot_water_temperature: `${application.waterTemp}°F`,
  },
  equipment: {
    type_i_hood: application.hasHood,
    commercial_refrigeration: application.hasRefrigeration,
    ventilation_system: application.hasVentilation,
    cooking_equipment: application.cookingEquipment,
  },
  menu: application.menuItems.split('\n').map((item) => item.trim()).filter(Boolean),
  proposed_locations: application.locations.split('\n').map((loc) => loc.trim()).filter(Boolean),
  hours_of_operation: application.hours,
  documents_attached: application.documents,
});

const submitApplication = async () => {
  if (!validateForm()) return;
  if (!sessionReady.value) {
    formError.value = 'Please initialize the agent first.';
    return;
  }
  evaluationLoading.value = true;
  evaluationResult.value = null;
  try {
    const payload = buildApplicationPayload();
    const formSnapshot = toPlainApplication();
    const { evaluation } = await evaluateApplication({ sessionId: sessionId.value, application: payload, form: formSnapshot });
    evaluationResult.value = evaluation;
    await loadEvaluationHistory(sessionId.value);
  } catch (error) {
    formError.value = error.response?.data?.message || error.message;
  } finally {
    evaluationLoading.value = false;
  }
};

const askQuestionHandler = async () => {
  if (!questionInput.value.trim() || !sessionReady.value) return;
  questionLoading.value = true;
  questionAnswer.value = '';
  try {
    const { answer } = await queryAgent({ sessionId: sessionId.value, prompt: questionInput.value.trim() });
    questionAnswer.value = answer;
  } catch (error) {
    questionAnswer.value = error.response?.data?.message || error.message;
  } finally {
    questionLoading.value = false;
  }
};

const askCommonQuestion = (question) => {
  questionInput.value = question;
  askQuestionHandler();
};

const clearHistory = () => {
  history.value = [];
};

const resetApplication = () => {
  Object.assign(application, createEmptyApplication());
  evaluationResult.value = null;
  formError.value = '';
};

const scrollToTop = () => {
  if (typeof window === 'undefined') {
    return;
  }
  const root = document.querySelector('.app');
  if (root?.scrollIntoView) {
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const formatLogTime = (timestamp) => {
  if (!timestamp) return '--';
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};
</script>
