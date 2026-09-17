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
        const response= await axios.post(
            'http://127.0.0.1:3000/session/end',
            payload
        )

        console.log(response.status)
        router.push('/SessionAnalytics')
    }
    catch(e){
        console.error(e)
    }
}
</script>


<template>
    <div class="tracking-page">

        <header class="top-bar">

            <div class="brand">
                <div class="brand-icon">B</div>
                <span>BeProductive</span>
            </div>

            <div class="session-status">
                <span class="status-dot"></span>
                Session in progress
            </div>

        </header>


        <main class="tracking-container">

            <div class="focus-header">

                <span class="eyebrow">FOCUS MODE</span>

                <h1>Stay focused.</h1>

                <p>
                    Your session is being tracked. Keep working and let BeProductive handle the rest.
                </p>

            </div>


            <section class="timer-card">

                <div class="timer-label">
                    ELAPSED TIME
                </div>

                <div class="timer">
                    {{ formatDuration(elapsedTime * 1000) }}
                </div>

                <div class="progress-section">

                    <div class="progress-info">
                        <span>Session progress</span>
                        <span>
                            {{ Math.min(Math.round((elapsedTime / (duration * 60)) * 100), 100) }}%
                        </span>
                    </div>

                    <div class="progress-bar">
                        <div
                            class="progress-fill"
                            :style="{
                                width: `${Math.min((elapsedTime / (duration * 60)) * 100, 100)}%`
                            }"
                        ></div>
                    </div>

                </div>


                <div class="session-details">

                    <div class="detail">
                        <span class="detail-label">SESSION LENGTH</span>
                        <span class="detail-value">{{ duration }} min</span>
                    </div>

                    <div class="detail-divider"></div>

                    <div class="detail">
                        <span class="detail-label">REMAINING</span>
                        <span class="detail-value">
                            {{ formatDuration(Math.max((duration * 60 - elapsedTime) * 1000, 0)) }}
                        </span>
                    </div>

                </div>


                <button
                    class="end-button"
                    @click="handleEndSession(sessionId)"
                >
                    End Session
                </button>

                <p class="end-note">
                    Ending the session will take you to your analytics.
                </p>

            </section>


            <div class="focus-message">

                <span class="message-icon">⌁</span>

                <span>
                    Stay on your productive websites and keep your momentum going.
                </span>

            </div>

        </main>

    </div>
</template>


<style scoped>

.tracking-page {
    min-height: 100vh;
    background: #f5f7fa;
    color: #17212b;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    box-sizing: border-box;
}


.top-bar {
    height: 64px;
    padding: 0 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #ffffff;
    border-bottom: 1px solid #e7ebef;
}


.brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    font-weight: 700;
}


.brand-icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: #003159;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 700;
}


.session-status {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #71808d;
    font-size: 12px;
}


.status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #3d9b67;
}


.tracking-container {
    width: min(620px, calc(100% - 40px));
    margin: 0 auto;
    padding: 65px 0 60px;
}


.focus-header {
    text-align: center;
    margin-bottom: 32px;
}


.eyebrow {
    display: block;
    margin-bottom: 10px;
    color: #003159;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.2px;
}


.focus-header h1 {
    margin: 0;
    font-size: 34px;
    line-height: 1.2;
    letter-spacing: -0.8px;
}


.focus-header p {
    max-width: 470px;
    margin: 10px auto 0;
    color: #7b8995;
    font-size: 14px;
    line-height: 1.6;
}


.timer-card {
    padding: 42px 42px 32px;
    background: #ffffff;
    border: 1px solid #e4e9ee;
    border-radius: 18px;
    box-shadow: 0 10px 35px rgba(20, 35, 50, 0.06);
    text-align: center;
}


.timer-label {
    color: #8995a0;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.4px;
}


.timer {
    margin: 8px 0 35px;
    color: #17212b;
    font-size: 64px;
    line-height: 1;
    letter-spacing: -2px;
    font-weight: 650;
    font-variant-numeric: tabular-nums;
}


.progress-section {
    text-align: left;
    margin-bottom: 30px;
}


.progress-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    color: #7d8993;
    font-size: 11px;
}


.progress-bar {
    width: 100%;
    height: 6px;
    background: #edf1f3;
    border-radius: 10px;
    overflow: hidden;
}


.progress-fill {
    height: 100%;
    background: #003159;
    border-radius: 10px;
    transition: width 0.8s linear;
}


.session-details {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30px;
    padding: 18px 0;
    border-top: 1px solid #edf0f2;
    border-bottom: 1px solid #edf0f2;
}


.detail {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
}


.detail-label {
    color: #929da6;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.9px;
}


.detail-value {
    color: #354552;
    font-size: 14px;
    font-weight: 600;
}


.detail-divider {
    width: 1px;
    height: 30px;
    background: #e5e9ec;
}


.end-button {
    width: 100%;
    height: 44px;
    border: none;
    border-radius: 9px;
    background: #003159;
    color: #ffffff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s ease;
}


.end-button:hover {
    background: #002440;
    transform: translateY(-1px);
}


.end-note {
    margin: 10px 0 0;
    color: #a0a9b1;
    font-size: 10px;
}


.focus-message {
    margin-top: 18px;
    padding: 13px 16px;
    border: 1px solid #e4e9ee;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #84909a;
    font-size: 11px;
    text-align: center;
}


.message-icon {
    color: #003159;
    font-size: 16px;
}


@media (max-width: 600px) {

    .top-bar {
        padding: 0 20px;
    }

    .session-status {
        display: none;
    }

    .tracking-container {
        width: calc(100% - 24px);
        padding-top: 40px;
    }

    .focus-header h1 {
        font-size: 28px;
    }

    .timer-card {
        padding: 32px 22px 25px;
    }

    .timer {
        font-size: 52px;
    }

}

</style>