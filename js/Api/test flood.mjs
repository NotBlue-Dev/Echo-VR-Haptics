//module

import axios from 'axios';
//bhaptics

let ip = 'localhost'
let timing = []

let flood = setInterval(() => {
    let start = Date.now();
    axios.get(`http://${ip}:6721/session`).then(resp => { 
        let millis = Date.now() - start;
        timing.push(millis)
    }).catch(err => {

    })
}, 45);

setTimeout(() => {
    let total = 0;
    for(let i = 0; i < timing.length; i++) {
        total += timing[i];
    }
    let avg = total / timing.length;
    console.log(avg)
    clearInterval(flood)
}, 60000);
