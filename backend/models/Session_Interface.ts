export interface Session{
    sessionId:number,
    startTime:number,
    endTime:number,
    status:"active"|"ended",
    allowedDomains:string[],
    duration:number
}