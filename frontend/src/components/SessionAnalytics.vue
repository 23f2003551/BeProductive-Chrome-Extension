<script setup>
import {ref,onMounted} from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { formatDuration } from '../utils/formatFunction';
import {jsPDF} from 'jspdf';

const router=useRouter()
const analyticsData=ref(null)
const getSessionAnalytics=ref(false)
const sessionId=ref(null)
const duration=ref(null)
const productiveDomains=ref(null)
const displayPrevResult=ref(false)
const prevdata=ref(null)
const resultSaved=ref(false)

onMounted(async()=>{
    const storage=await chrome.storage.local.get(['sessionId','duration','productiveDomains'])
    const stored=await chrome.storage.local.get('prevdata')
    sessionId.value=storage.sessionId
    duration.value=storage.duration
    productiveDomains.value=Object.values(storage.productiveDomains || {})
    prevdata.value=stored.prevdata ?? null
})

async function handleGetSessionAnalytics(){
    try{
        const response=await axios.get(`http://127.0.0.1:3000/session/${sessionId.value}/analytics`)
        console.log(response.status)
        analyticsData.value=response.data
        getSessionAnalytics.value=true
    }
    catch(e){
        console.error(e)
    }
}

async function handleNewSession(){
    await chrome.storage.local.remove(['sessionId','duration','productiveDomains'])
    analyticsData.value=null
    getSessionAnalytics.value=false
    displayPrevResult.value=false
    resultSaved.value=false
    router.push('/')
}

async function handleSaveResult(){
    if(!analyticsData.value || resultSaved.value) return
    const snapshot={
        productiveTime: analyticsData.value.productiveTime,
        unproductiveTime: analyticsData.value.unproductiveTime,
        totalunproductiveJumps: analyticsData.value.totalunproductiveJumps,
        totalunproductiveVisits: analyticsData.value.totalunproductiveVisits
    }
    await chrome.storage.local.set({ prevdata: snapshot })
    prevdata.value=snapshot
    resultSaved.value=true
}

function handleCompareResult(){
    displayPrevResult.value=!displayPrevResult.value
}

function compareDuration(current, previous){
    const diff=current-previous
    if(diff===0) return 'no change'
    return diff>0 ? `up by ${formatDuration(diff)}` : `reduced by ${formatDuration(Math.abs(diff))}`
}

function compareCount(current, previous){
    const diff=current-previous
    if(diff===0) return 'no change'
    return diff>0 ? `up by ${diff}` : `reduced by ${Math.abs(diff)}`
}

function handlePDF(){
    const doc=new jsPDF()
    doc.text('BeProductive Productivity Report',70,10,{align:'center'})
    doc.text(`Total Productive Time: ${formatDuration(analyticsData.value.productiveTime)}`, 10, 20);
    doc.text(`Total Unproductive Time: ${formatDuration(analyticsData.value.unproductiveTime)}`, 10, 30);
    doc.text(`Session Duration Selected: ${duration.value}`, 10, 40);
    doc.text(`Actual Session Duration: ${formatDuration(analyticsData.value.actualsessionDuration)} min`, 10, 50);
    doc.text(`Total Unproductive Visits: ${analyticsData.value.totalunproductiveVisits}`, 10, 60);
    doc.text(`Total Unproductive Jumps: ${analyticsData.value.totalunproductiveJumps}`, 10, 70);
    doc.text('Unproductive Domains Visited:', 10, 80);
    const domainLines = analyticsData.value.unproductivedomainsVisited.length > 0
        ? analyticsData.value.unproductivedomainsVisited.map(d => `- ${d}`)
        : ['None']
    doc.text(domainLines, 14, 88);
    doc.save('Beproductive-report.pdf');
    
}
</script>

<template>
  <div class="analytics-page">
    <header class="topbar">
      <div class="brand">
        <div class="brand-icon">B</div>
        <span>BeProductive</span>
      </div>

      <div class="page-label">
        Session Analytics
      </div>
    </header>

    <main class="content">

      <!-- Header -->
      <section class="page-header">
        <div>
          <p class="eyebrow">SESSION COMPLETE</p>

          <h1 v-if="!getSessionAnalytics">Session Ends</h1>
          <h1 v-if="getSessionAnalytics">Session Analytics</h1>

          <p class="subtitle">
            Review how your session went and see where your time was spent.
          </p>
        </div>
      </section>

      <!-- Session Overview -->
      <section class="overview-card">
        <div class="overview-item">
          <span class="overview-label">SESSION DURATION</span>
          <strong>{{ duration }} min</strong>
        </div>

        <div class="overview-divider"></div>

        <div class="overview-item">
          <span class="overview-label">PRODUCTIVE DOMAINS</span>
          <strong>{{ productiveDomains?.length || 0 }}</strong>
        </div>
      </section>

      <!-- Productive Domains -->
      <section class="domains-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">FOCUS AREAS</p>
            <h2>Productive domains</h2>
          </div>
        </div>

        <div class="domain-list" v-if="productiveDomains?.length">
          <span
            v-for="domain in productiveDomains"
            :key="domain"
            class="domain-pill"
          >
            {{ domain }}
          </span>
        </div>

        <p v-else class="empty-text">
          No productive domains were added.
        </p>
      </section>

      <!-- Get Analytics -->
      <section class="get-results" v-if="!getSessionAnalytics">
        <div>
          <p class="eyebrow">READY TO REVIEW</p>
          <h2>Your session has ended.</h2>
          <p>
            Generate your productivity breakdown to see the results.
          </p>
        </div>

        <button
          class="primary-button"
          @click="handleGetSessionAnalytics()"
        >
          Get Session Analytics
        </button>
      </section>

      <!-- Analytics -->
      <section v-if="analyticsData" class="results-section">

        <div class="section-heading">
          <div>
            <p class="eyebrow">PERFORMANCE</p>
            <h2>Your session results</h2>
          </div>
        </div>

        <!-- Main Metrics -->
        <div class="metrics-grid">

          <div class="metric-card">
            <span class="metric-label">PRODUCTIVE TIME</span>
            <strong class="metric-value">
              {{ formatDuration(analyticsData.productiveTime) }}
            </strong>
            <span class="metric-description">
              Time spent on productive domains
            </span>
          </div>

          <div class="metric-card">
            <span class="metric-label">UNPRODUCTIVE TIME</span>
            <strong class="metric-value">
              {{ formatDuration(analyticsData.unproductiveTime) }}
            </strong>
            <span class="metric-description">
              Time spent away from productive work
            </span>
          </div>

          <div class="metric-card">
            <span class="metric-label">UNPRODUCTIVE VISITS</span>
            <strong class="metric-value">
              {{ analyticsData.totalunproductiveVisits }}
            </strong>
            <span class="metric-description">
              Visits to unproductive domains
            </span>
          </div>

          <div class="metric-card">
            <span class="metric-label">UNPRODUCTIVE JUMPS</span>
            <strong class="metric-value">
              {{ analyticsData.totalunproductiveJumps }}
            </strong>
            <span class="metric-description">
              Switches from productive to unproductive domains
            </span>
          </div>

        </div>

        <!-- Session Time -->
        <div class="session-time-card">
          <div>
            <span class="metric-label">ACTUAL SESSION TIME</span>
            <strong>
              {{ formatDuration(analyticsData.actualsessionDuration) }}
            </strong>
          </div>

          <div class="session-time-right">
            <span>Selected</span>
            <strong>{{ duration }} min</strong>
          </div>
        </div>

        <!-- Unproductive Domains -->
        <div class="domains-card">
          <div class="section-heading">
            <div>
              <p class="eyebrow">DISTRACTIONS</p>
              <h2>Unproductive domains visited</h2>
            </div>

            <span class="count-badge">
              {{ analyticsData.unproductivedomainsVisited.length }}
            </span>
          </div>

          <div
            v-if="analyticsData.unproductivedomainsVisited.length > 0"
            class="domain-list"
          >
            <span
              v-for="domain in analyticsData.unproductivedomainsVisited"
              :key="domain"
              class="domain-pill distraction"
            >
              {{ domain }}
            </span>
          </div>

          <p v-else class="empty-text">
            No unproductive domains were visited during this session.
          </p>
        </div>

        <!-- Actions -->
        <div class="actions-card">

          <div class="actions-heading">
            <p class="eyebrow">NEXT STEPS</p>
            <h2>What would you like to do?</h2>
          </div>

          <div class="actions">

            <button
              class="primary-button"
              @click="handleNewSession()"
            >
              Start New Session
            </button>

            <button
              v-if="prevdata !== null"
              class="secondary-button"
              @click="handleCompareResult"
            >
              {{ displayPrevResult ? 'Hide Comparison' : 'Compare Previous Result' }}
            </button>

            <button
              class="secondary-button"
              :disabled="resultSaved"
              @click="handleSaveResult"
            >
              {{ resultSaved ? 'Result Saved' : 'Save Result' }}
            </button>

            <button
              class="secondary-button"
              @click="handlePDF()"
            >
              Export Result to PDF
            </button>

          </div>
        </div>

        <!-- Previous Comparison -->
        <div
          class="comparison-card"
          v-if="displayPrevResult && prevdata"
        >
          <div class="section-heading">
            <div>
              <p class="eyebrow">SESSION COMPARISON</p>
              <h2>Compared with your previous result</h2>
            </div>
          </div>

          <div class="comparison-grid">

            <div class="comparison-item">
              <span>Productive Time</span>
              <strong>
                {{ compareDuration(
                  analyticsData.productiveTime,
                  prevdata.productiveTime
                ) }}
              </strong>
            </div>

            <div class="comparison-item">
              <span>Unproductive Time</span>
              <strong>
                {{ compareDuration(
                  analyticsData.unproductiveTime,
                  prevdata.unproductiveTime
                ) }}
              </strong>
            </div>

            <div class="comparison-item">
              <span>Unproductive Jumps</span>
              <strong>
                {{ compareCount(
                  analyticsData.totalunproductiveJumps,
                  prevdata.totalunproductiveJumps
                ) }}
              </strong>
            </div>

            <div class="comparison-item">
              <span>Unproductive Visits</span>
              <strong>
                {{ compareCount(
                  analyticsData.totalunproductiveVisits,
                  prevdata.totalunproductiveVisits
                ) }}
              </strong>
            </div>

          </div>
        </div>

      </section>

    </main>
  </div>
</template>


<style scoped>

.analytics-page {
  min-height: 100vh;
  background: #f5f7fa;
  color: #17202a;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

/* Topbar */

.topbar {
  height: 68px;
  padding: 0 48px;
  background: #ffffff;
  border-bottom: 1px solid #e7ebef;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 700;
  color: #17202a;
}

.brand-icon {
  width: 32px;
  height: 32px;
  background: #003159;
  color: #ffffff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.page-label {
  font-size: 14px;
  color: #68737d;
}

/* Main */

.content {
  width: min(1000px, calc(100% - 40px));
  margin: 0 auto;
  padding: 56px 0 70px;
}

/* Header */

.page-header {
  margin-bottom: 28px;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
  color: #003159;
}

.page-header h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.15;
  letter-spacing: -0.7px;
}

.subtitle {
  margin: 12px 0 0;
  color: #68737d;
  font-size: 15px;
}

/* Overview */

.overview-card {
  background: #ffffff;
  border: 1px solid #e5e9ed;
  border-radius: 12px;
  padding: 24px 28px;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  box-shadow: 0 4px 14px rgba(20, 35, 50, 0.04);
}

.overview-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.overview-label,
.metric-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.9px;
  color: #7a858f;
}

.overview-item strong {
  font-size: 21px;
  color: #17202a;
}

.overview-divider {
  width: 1px;
  height: 40px;
  background: #e5e9ed;
  margin: 0 30px;
}

/* Cards */

.domains-card,
.actions-card,
.comparison-card,
.get-results,
.session-time-card {
  background: #ffffff;
  border: 1px solid #e5e9ed;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(20, 35, 50, 0.04);
}

.domains-card {
  padding: 26px 28px;
  margin-bottom: 20px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-heading h2,
.actions-heading h2,
.get-results h2 {
  margin: 0;
  font-size: 19px;
  letter-spacing: -0.2px;
}

.domain-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.domain-pill {
  padding: 8px 12px;
  border-radius: 7px;
  background: #f0f4f7;
  border: 1px solid #e0e6eb;
  font-size: 13px;
  color: #34414c;
}

.domain-pill.distraction {
  background: #faf5f5;
  border-color: #eadede;
}

.empty-text {
  margin: 0;
  color: #7a858f;
  font-size: 14px;
}

/* Get results */

.get-results {
  padding: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 24px;
}

.get-results h2 {
  margin-bottom: 6px;
}

.get-results p:last-child {
  margin: 0;
  color: #68737d;
  font-size: 14px;
}

/* Results */

.results-section {
  margin-top: 24px;
}

.results-section > .section-heading {
  margin-bottom: 16px;
}

/* Metrics */

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.metric-card {
  background: #ffffff;
  border: 1px solid #e5e9ed;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 14px rgba(20, 35, 50, 0.04);
  display: flex;
  flex-direction: column;
}

.metric-value {
  margin-top: 12px;
  font-size: 28px;
  line-height: 1;
  letter-spacing: -0.5px;
  color: #003159;
}

.metric-description {
  margin-top: 10px;
  font-size: 12px;
  color: #7a858f;
}

/* Session time */

.session-time-card {
  padding: 22px 24px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.session-time-card > div {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.session-time-card strong {
  font-size: 20px;
}

.session-time-right {
  text-align: right;
}

.session-time-right span {
  font-size: 12px;
  color: #7a858f;
}

/* Count */

.count-badge {
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border-radius: 6px;
  background: #eef2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #34414c;
}

/* Actions */

.actions-card {
  padding: 26px 28px;
  margin-bottom: 20px;
}

.actions-heading {
  margin-bottom: 20px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.primary-button,
.secondary-button {
  border-radius: 7px;
  padding: 10px 15px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-button {
  border: 1px solid #003159;
  background: #003159;
  color: #ffffff;
}

.primary-button:hover {
  background: #002542;
}

.secondary-button {
  border: 1px solid #d7dde2;
  background: #ffffff;
  color: #34414c;
}

.secondary-button:hover {
  border-color: #003159;
  color: #003159;
}

.secondary-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* Comparison */

.comparison-card {
  padding: 26px 28px;
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: #e5e9ed;
  border: 1px solid #e5e9ed;
  border-radius: 8px;
  overflow: hidden;
}

.comparison-item {
  background: #ffffff;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.comparison-item span {
  font-size: 12px;
  color: #7a858f;
}

.comparison-item strong {
  font-size: 15px;
  color: #17202a;
}

/* Responsive */

@media (max-width: 700px) {

  .topbar {
    padding: 0 20px;
  }

  .page-label {
    display: none;
  }

  .content {
    width: calc(100% - 28px);
    padding: 35px 0 50px;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .overview-card {
    padding: 20px;
  }

  .overview-divider {
    margin: 0 18px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .get-results {
    flex-direction: column;
    align-items: flex-start;
  }

  .primary-button {
    width: 100%;
  }

  .actions {
    flex-direction: column;
  }

  .secondary-button {
    width: 100%;
  }

  .comparison-grid {
    grid-template-columns: 1fr;
  }

}

</style>