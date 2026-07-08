<script setup>
import {ref,onMounted} from 'vue'
import { useRouter } from 'vue-router';
import axios from 'axios';
import { formatDuration } from '../utils/formatFunction';

const router=useRouter()
const analyticsData=ref(null)
const getSessionAnalytics=ref(false)
const sessionId=ref(null)
const duration=ref(null)
const productiveDomains=ref(null)

onMounted(async()=>{
    const storage=await chrome.storage.local.get(['sessionId','duration','productiveDomains'])
    sessionId.value=storage.sessionId
    duration.value=storage.duration
    productiveDomains.value=storage.productiveDomains
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
    await chrome.storage.local.clear()
    analyticsData.value=null
    getSessionAnalytics.value=false
    router.push('/')
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
        <li v-for="domain in productiveDomains">{{ domain }}</li>
    </ul>
    <button @click="handleGetSessionAnalytics()" v-if="!getSessionAnalytics">Get Session Analytics</button>
    <div class="box" v-if="analyticsData">
        <p>Total Productive Time: {{ formatDuration(analyticsData.productiveTime) }} mins</p>
        <p>Total Unproductive Time: {{ formatDuration(analyticsData.unproductiveTime) }} mins</p>
        <p>Session Time: {{ formatDuration(analyticsData.actualsessionDuration) }}/{{ duration }} min</p>
        <p>List of unproductive domains visited:</p>
        <ul>
            <li v-for="domain in analyticsData.unproductivedomainsVisited">{{ domain }}</li>
        </ul>
        <p>Total Unproductive Jumps: {{ analyticsData.totalunproductiveJumps }}</p>
    </div>
    <button v-if="analyticsData" @click="handleNewSession()">Start New Session</button>
   </div>

</template>