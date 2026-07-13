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
    productiveDomains.value=storage.productiveDomains
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
   <div class="center">
    <h1 v-if="!getSessionAnalytics">Session Ends</h1>
    <h1 v-if="getSessionAnalytics">Session Analytics</h1>
    <h2>For the following</h2>
    <h3>Duration you choose: {{ duration }} mins</h3>

    <h3>Productive domains:</h3>
    <ul>
        <li v-for="domain in productiveDomains" :key="domain">{{ domain }}</li>
    </ul>
    <button @click="handleGetSessionAnalytics()" v-if="!getSessionAnalytics">Get Session Analytics</button>
    <div class="box" v-if="analyticsData">
        <p>Total Productive Time: {{ formatDuration(analyticsData.productiveTime) }}</p>
        <p>Total Unproductive Time: {{ formatDuration(analyticsData.unproductiveTime) }}</p>
        <p>Session Time: {{ formatDuration(analyticsData.actualsessionDuration) }} / {{ duration }} min</p>
        <p>List of unproductive domains visited:</p>
        <ul>
            <li v-for="domain in analyticsData.unproductivedomainsVisited" :key="domain">{{ domain }}</li>
        </ul>
        <p>Total Unproductive Jumps: {{ analyticsData.totalunproductiveJumps }}</p>
        <p>Total Unproductive Visits: {{ analyticsData.totalunproductiveVisits }}</p>
    </div>
    <br/>

    <div style="display: flex; flex-direction: row; gap: 5px;" v-if="analyticsData">
        <button @click="handleNewSession()">Start New Session</button>
        <button v-if="prevdata !== null" @click="handleCompareResult">
            {{ displayPrevResult ? 'Hide' : 'Compare Prev Result' }}
        </button>
        <button :disabled="resultSaved" @click="handleSaveResult">{{resultSaved? 'Saved Result' : 'Save Result'}}</button>
        <button v-if="analyticsData" @click="handlePDF()">Export Result to PDF</button>
    </div>
    <br/>

    <div class="box" v-if="displayPrevResult && prevdata">
        <p>Productive Time: {{ compareDuration(analyticsData.productiveTime, prevdata.productiveTime) }}</p>
        <p>Unproductive Time: {{ compareDuration(analyticsData.unproductiveTime, prevdata.unproductiveTime) }}</p>
        <p>Unproductive Jumps: {{ compareCount(analyticsData.totalunproductiveJumps, prevdata.totalunproductiveJumps) }}</p>
        <p>Unproductive Visits: {{ compareCount(analyticsData.totalunproductiveVisits, prevdata.totalunproductiveVisits) }}</p>
    </div>
   </div>
</template>