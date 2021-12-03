// Thanks to this link
//
// https://www.reddit.com/r/ethstaker/comments/qjlfsf/how_to_check_upcoming_sync_committee_membership/


const axios = require('axios');
const { DateTime } = require("luxon");
const {validatorList, beaconNode="http://localhost:5051", pushgateway="http://localhost:9091"}= require("./config.js")

const epoch_to_time = (epoch)=>{
    return 1606824000 + ( epoch * 384)
}

const time_to_epoch= (time)=>{
    return Math.floor(( time - 1606824000 ) / 384)
}

const get_committee = async (epoch)=>{
    return await axios.get(`${beaconNode}/eth/v1/beacon/states/finalized/sync_committees?epoch=${epoch}`);
}

const search_committee = async (desc, epoch)=>{
    const {data:{validators=[]}={}} = await get_committee(epoch)
    const foundValidators = validatorList.filter(d=>validators.indexOf(d)>=0)
    if(foundValidators.length>0){
        foundValidators.forEach(d=>{console.log(`validator: ${d} found in ${desc} sync committee`)});
    }
    return foundValidators
}

const display_epoch = (epoch, desc)=>{
    console.log(`epoch: ${epoch} : ${DateTime.fromSeconds(epoch_to_time(epoch)).setZone('America/New_York').toISOTime()} <-- ${desc}`)
}

const CURR_EPOCH=(time_to_epoch(Date.now()))
const CURR_START_EPOCH=Math.floor(CURR_EPOCH / 256 ) * 256
const NEXT_START_EPOCH=CURR_START_EPOCH + 256
const NEXTB1_START_EPOCH=NEXT_START_EPOCH + 256


display_epoch(CURR_START_EPOCH, "current sync committee start")
display_epoch(CURR_EPOCH , "now")
display_epoch(NEXT_START_EPOCH , "next sync committee start")
display_epoch(NEXTB1_START_EPOCH, "next-but-one sync committee start")

const currFoundValidators = search_committee("current", CURR_EPOCH)
const nextFoundValidators = search_committee("next", NEXT_START_EPOCH)

