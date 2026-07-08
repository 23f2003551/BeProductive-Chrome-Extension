<script setup>
import { ref,onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const duration=ref(0)
const textInput=ref('')
const allowedDomains=ref([])
const confirmChoice=ref(undefined)
const router=useRouter()

onMounted(async()=>{
    try{
        const {sessionId}=await chrome.storage.local.get(['sessionId'])
        if (sessionId){
            router.push('/SessionTracking')
        }
    } 
    catch (e){
        console.error("Failed to fetch session from storage:",e)
    }
})

function normalizeDomain(input) {
    let hostname
    try {
        
        const url=new URL(input.startsWith('http')? input : `https://${input}`)
        hostname=url.hostname
    } catch (e) {
        return null 
    }
    return hostname.startsWith('www.')? hostname.slice(4) : hostname
}

function addDomain(t){
    const domain=normalizeDomain(t)
    if (domain) {
        allowedDomains.value.push(domain)
    }
    textInput.value=''
}

async function sendSessionData(domainList,time){
    try{
        const payload={allowedDomains:domainList, duration:time}
        const response=await axios.post('http://127.0.0.1:3000/session/start',payload)
        if(response.data && response.data.newSession){
            const newId=response.data.newSession.sessionId
            await chrome.storage.local.set({
             sessionId:newId,
             duration:time,
             productiveDomains:domainList
            })
        }        
        console.log(response.status)
        confirmChoice.value=true
    }
    catch(e){
        console.error(e)
    }
}
</script>


<template>
    <div class="center">
        
        <h1>Welcome to BeProductive</h1>
        <h2>Here to track how productive your sessions are!</h2>
        <br/>
        <h2 v-if="!confirmChoice">Choose duration of your session below</h2>
        <div style="display: flex; flex-direction: row; gap: 3px;" v-if="!confirmChoice">
            <button @click="duration= 30">30 mins</button>
            <button @click="duration= 60">60 mins</button>
            <button @click="duration= 90">90 mins</button>
            <button @click="duration= 120">120 mins</button>
        </div>
        <h3 v-if="duration>0">you choose {{duration}} mins</h3>
        <br/>
        <h2 v-if="!confirmChoice">Enter allowed domains/productive domains one at a time</h2>
        <div style="display: flex; flex-direction: row; gap: 3px;" v-if="!confirmChoice">
            <input v-model="textInput" placeholder="enter url"></input>
            <button v-if="textInput.length>0" @click="addDomain(textInput)">Add Domain</button>
        </div>
        <br/>
        <h3 v-if="allowedDomains.length>0">List of allowed domains</h3>
        <ul v-if="allowedDomains.length>0">
            <li v-for="domain in allowedDomains">
                {{ domain }}
            </li>
        </ul>
        <button v-if="duration>0 && allowedDomains.length>0 && !confirmChoice" 
            @click="sendSessionData(allowedDomains,duration)">
            Confirm Choice
        </button>
        <button v-if="confirmChoice" @click="router.push('/SessionTracking')">Start Session</button>
    </div>
</template>