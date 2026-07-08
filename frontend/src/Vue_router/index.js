import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'
import Home from '../components/Home.vue'
import SessionTracking from '../components/SessionTracking.vue'
import SessionAnalytics from '../components/SessionAnalytics.vue'


const routes=[
    {path:'/', name:'Home', component:Home},
    {path:'/SessionTracking', name:'SessionTracking', component:SessionTracking},
    {path:'/SessionAnalytics', name:'SessionAnalytics', component:SessionAnalytics}
]

const router=createRouter({
    history:createWebHashHistory(),
    routes
})

export default router