<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const duration = ref(0)
const textInput = ref('')
const allowedDomains = ref([])
const confirmChoice = ref(undefined)
const router = useRouter()

onMounted(async () => {
    try {
        const { sessionId } = await chrome.storage.local.get(['sessionId'])
        if (sessionId) {
            router.push('/SessionTracking')
        }
    } 
    catch (e) {
        console.error("Failed to fetch session from storage:", e)
    }
})

function normalizeDomain(input) {
    let hostname
    try {
        const url = new URL(input.startsWith('http') ? input : `https://${input}`)
        hostname = url.hostname
    } catch (e) {
        return null 
    }
    return hostname.startsWith('www.') ? hostname.slice(4) : hostname
}

function addDomain(t) {
    const domain = normalizeDomain(t)
    if (domain) {
        allowedDomains.value.push(domain)
    }
    textInput.value = ''
}

async function sendSessionData(domainList, time) {
    try {
        const payload = {
            allowedDomains: domainList,
            duration: time
        }

        const response = await axios.post(
            'http://127.0.0.1:3000/session/start',
            payload
        )

        if (response.data && response.data.newSession) {
            const newId = response.data.newSession.sessionId

            await chrome.storage.local.set({
                sessionId: newId,
                duration: time,
                productiveDomains: domainList
            })
        }

        console.log(response.status)
        confirmChoice.value = true
    }
    catch (e) {
        console.error(e)
    }
}
</script>


<template>
    <div class="page">

        <div class="top-bar">
            <div class="brand">
                <div class="brand-icon">B</div>
                <span>BeProductive</span>
            </div>

            <div class="setup-label">
                Session Setup
            </div>
        </div>


        <main class="setup-container">

            <section class="intro">
                <span class="eyebrow">PRODUCTIVITY TRACKER</span>

                <h1>Start a productive session.</h1>

                <p>
                    Choose your session duration and add the websites
                    you want to focus on.
                </p>
            </section>


            <section v-if="!confirmChoice" class="setup-card">

                <div class="section">

                    <div class="section-header">
                        <div>
                            <h2>Session duration</h2>
                            <p>How long do you want to stay focused?</p>
                        </div>

                        <span v-if="duration > 0" class="selected-label">
                            {{ duration }} min selected
                        </span>
                    </div>


                    <div class="duration-grid">

                        <button
                            class="duration-option"
                            :class="{ selected: duration === 30 }"
                            @click="duration = 30"
                        >
                            <span class="duration-number">30</span>
                            <span class="duration-unit">minutes</span>
                        </button>

                        <button
                            class="duration-option"
                            :class="{ selected: duration === 60 }"
                            @click="duration = 60"
                        >
                            <span class="duration-number">60</span>
                            <span class="duration-unit">minutes</span>
                        </button>

                        <button
                            class="duration-option"
                            :class="{ selected: duration === 90 }"
                            @click="duration = 90"
                        >
                            <span class="duration-number">90</span>
                            <span class="duration-unit">minutes</span>
                        </button>

                        <button
                            class="duration-option"
                            :class="{ selected: duration === 120 }"
                            @click="duration = 120"
                        >
                            <span class="duration-number">120</span>
                            <span class="duration-unit">minutes</span>
                        </button>

                    </div>

                </div>


                <div class="divider"></div>


                <div class="section">

                    <div class="section-header">
                        <div>
                            <h2>Productive websites</h2>
                            <p>
                                Add the domains you want to track as productive.
                            </p>
                        </div>
                    </div>


                    <div class="domain-input">

                        <input
                            v-model="textInput"
                            placeholder="e.g. github.com"
                            @keyup.enter="textInput.length > 0 && addDomain(textInput)"
                        />

                        <button
                            v-if="textInput.length > 0"
                            class="add-button"
                            @click="addDomain(textInput)"
                        >
                            Add
                        </button>

                    </div>


                    <div v-if="allowedDomains.length > 0" class="domain-list">

                        <div class="domain-list-header">
                            <span>Added websites</span>
                            <span>{{ allowedDomains.length }}</span>
                        </div>

                        <ul>
                            <li v-for="domain in allowedDomains" :key="domain">
                                <div class="domain-info">
                                    <span class="domain-dot"></span>
                                    <span>{{ domain }}</span>
                                </div>
                            </li>
                        </ul>

                    </div>

                    <div v-else class="empty-domains">
                        <div class="empty-icon">+</div>
                        <span>No productive websites added yet</span>
                    </div>

                </div>


                <div class="card-footer">

                    <div class="requirements">
                        <span
                            :class="{ complete: duration > 0 }"
                        >
                            <span class="status-dot"></span>
                            Duration selected
                        </span>

                        <span
                            :class="{ complete: allowedDomains.length > 0 }"
                        >
                            <span class="status-dot"></span>
                            Website added
                        </span>
                    </div>


                    <button
                        class="confirm-button"
                        :disabled="duration === 0 || allowedDomains.length === 0"
                        @click="sendSessionData(allowedDomains, duration)"
                    >
                        Confirm & Continue
                        <span>→</span>
                    </button>

                </div>

            </section>


            <section v-if="confirmChoice" class="success-card">

                <div class="success-icon">
                    ✓
                </div>

                <span class="eyebrow">SESSION READY</span>

                <h2>You're all set.</h2>

                <p>
                    Your productivity session has been configured.
                    Ready to get focused?
                </p>

                <button
                    class="start-button"
                    @click="router.push('/SessionTracking')"
                >
                    Start Session
                    <span>→</span>
                </button>

            </section>

        </main>

    </div>
</template>


<style scoped>

.page {
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
    color: #17212b;
}

.brand-icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: #003159;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 700;
}

.setup-label {
    font-size: 13px;
    color: #7a8794;
}


.setup-container {
    width: min(760px, calc(100% - 40px));
    margin: 0 auto;
    padding: 58px 0 70px;
}


.intro {
    margin-bottom: 30px;
}

.eyebrow {
    display: block;
    margin-bottom: 10px;
    color: #003159;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.2px;
}

.intro h1 {
    margin: 0;
    font-size: 34px;
    line-height: 1.2;
    letter-spacing: -0.8px;
    font-weight: 700;
}

.intro p {
    max-width: 530px;
    margin: 10px 0 0;
    color: #71808d;
    font-size: 15px;
    line-height: 1.6;
}


.setup-card {
    background: #ffffff;
    border: 1px solid #e4e9ee;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(20, 35, 50, 0.05);
}


.section {
    padding: 28px 30px;
}


.section-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 20px;
}

.section-header h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 650;
}

.section-header p {
    margin: 5px 0 0;
    color: #85919d;
    font-size: 13px;
}


.selected-label {
    padding: 6px 10px;
    border-radius: 7px;
    background: #eef4f8;
    color: #003159;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
}


.duration-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
}

.duration-option {
    min-height: 82px;
    padding: 14px;
    border: 1px solid #dfe5ea;
    border-radius: 10px;
    background: #ffffff;
    color: #17212b;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    transition: all 0.18s ease;
}

.duration-option:hover {
    border-color: #9eabb6;
    background: #fafcfd;
    transform: translateY(-1px);
}

.duration-option.selected {
    border-color: #003159;
    background: #f1f6fa;
    box-shadow: inset 0 0 0 1px #003159;
}

.duration-number {
    font-size: 21px;
    font-weight: 700;
}

.duration-unit {
    color: #7b8995;
    font-size: 11px;
}


.divider {
    height: 1px;
    background: #edf0f3;
}


.domain-input {
    display: flex;
    gap: 9px;
}

.domain-input input {
    flex: 1;
    min-width: 0;
    height: 44px;
    padding: 0 13px;
    border: 1px solid #dce3e8;
    border-radius: 9px;
    outline: none;
    background: #fbfcfd;
    color: #17212b;
    font-size: 13px;
    transition: border-color 0.18s, box-shadow 0.18s;
    box-sizing: border-box;
}

.domain-input input::placeholder {
    color: #a4afb8;
}

.domain-input input:focus {
    border-color: #003159;
    box-shadow: 0 0 0 3px rgba(0, 49, 89, 0.08);
    background: #ffffff;
}

.add-button {
    height: 44px;
    padding: 0 19px;
    border: none;
    border-radius: 9px;
    background: #edf2f5;
    color: #253746;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.18s;
}

.add-button:hover {
    background: #e1e8ed;
}


.domain-list {
    margin-top: 18px;
    border: 1px solid #e4e9ed;
    border-radius: 10px;
    overflow: hidden;
}

.domain-list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 13px;
    background: #f8fafb;
    border-bottom: 1px solid #e8edf0;
    color: #7c8994;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.6px;
}

.domain-list-header span:last-child {
    min-width: 20px;
    height: 20px;
    border-radius: 6px;
    background: #e8eef2;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #52616d;
    font-size: 10px;
}

.domain-list ul {
    margin: 0;
    padding: 0;
    list-style: none;
}

.domain-list li {
    padding: 11px 13px;
    border-bottom: 1px solid #edf0f2;
}

.domain-list li:last-child {
    border-bottom: none;
}

.domain-info {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 13px;
    color: #354552;
}

.domain-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #003159;
}


.empty-domains {
    margin-top: 16px;
    padding: 22px;
    border: 1px dashed #d8dfe4;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #9aa5ae;
    font-size: 12px;
}

.empty-icon {
    width: 20px;
    height: 20px;
    border: 1px solid #cbd3d9;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
}


.card-footer {
    padding: 18px 30px;
    background: #fafbfc;
    border-top: 1px solid #edf0f3;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
}


.requirements {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.requirements span {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #a0aab2;
    font-size: 11px;
}

.requirements span.complete {
    color: #52616d;
}

.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #c8d0d6;
}

.requirements span.complete .status-dot {
    background: #003159;
}


.confirm-button,
.start-button {
    height: 43px;
    padding: 0 19px;
    border: none;
    border-radius: 9px;
    background: #003159;
    color: #ffffff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.18s ease;
}

.confirm-button:hover:not(:disabled),
.start-button:hover {
    background: #002440;
    transform: translateY(-1px);
}

.confirm-button:disabled {
    background: #dce2e6;
    color: #9aa4ab;
    cursor: not-allowed;
}

.confirm-button span,
.start-button span {
    font-size: 17px;
}


.success-card {
    padding: 55px 40px;
    background: #ffffff;
    border: 1px solid #e4e9ee;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(20, 35, 50, 0.05);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.success-icon {
    width: 52px;
    height: 52px;
    margin-bottom: 20px;
    border-radius: 50%;
    background: #eef4f8;
    color: #003159;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 23px;
    font-weight: 600;
}

.success-card h2 {
    margin: 0;
    font-size: 26px;
}

.success-card p {
    max-width: 400px;
    margin: 9px 0 25px;
    color: #7b8995;
    font-size: 14px;
    line-height: 1.6;
}


@media (max-width: 650px) {

    .top-bar {
        padding: 0 20px;
    }

    .setup-container {
        width: calc(100% - 24px);
        padding-top: 35px;
    }

    .intro h1 {
        font-size: 28px;
    }

    .section {
        padding: 22px 20px;
    }

    .duration-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .card-footer {
        align-items: stretch;
        flex-direction: column;
    }

    .confirm-button {
        width: 100%;
        justify-content: center;
    }

    .requirements {
        flex-direction: row;
        justify-content: space-between;
    }

}

</style>