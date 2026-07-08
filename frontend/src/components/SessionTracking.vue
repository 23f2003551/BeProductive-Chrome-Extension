<script setup>
import {onMounted,ref} from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { formatDuration } from '../utils/formatFunction'
const elapsedTime=ref(0)
const stopSession=ref(false)
const router=useRouter()
const sessionId=ref(null)
const duration=ref(null)

onMounted(async()=>{
    const storage = await chrome.storage.local.get(['sessionId', 'duration'])
    sessionId.value = storage.sessionId
    duration.value = storage.duration
    let timerId=setInterval(()=>{
        elapsedTime.value++
        if((duration.value*60)==elapsedTime.value){
         clearInterval(timerId)
         timerId=null
         handleEndSession(sessionId.value)
        }
        else if(stopSession.value){
         clearInterval(timerId)
         timerId=null
        }
     },1000)
})

async function handleEndSession(id) {
    stopSession.value=true
    try{
        const payload={sessionId:id}
        const response= await axios.post('http://127.0.0.1:3000/session/end',payload)
        console.log(response.status)
        router.push('/SessionAnalytics')
    }
    catch(e){
        console.error(e)
    }
}


</script>


<template>
    <div class="center">
        <h1>Session Tracking in Progress</h1>
        <h2>Time Elapsed {{ formatDuration(elapsedTime*1000) }} </h2>
        <button @click="handleEndSession(sessionId)">End Session</button>
    </div>
</template>