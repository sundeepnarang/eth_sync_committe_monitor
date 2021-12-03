// Thanks to this link
//
// https://www.reddit.com/r/ethstaker/comments/qjlfsf/how_to_check_upcoming_sync_committee_membership/

const {appendFileSync} = require("fs");
const axios = require("axios");
const { DateTime } = require("luxon");
const {validatorList, beaconNode="http://localhost:5051"}= require("./config.js")

function Log({logToConsole=true}={}){
    this.logStore = "";
    this.logToConsole = logToConsole
}

Log.prototype.log = function (...data){
    const logVal = data.join("");
    this.logStore = this.logStore + logVal + "\n";
    if(this.logToConsole) console.log(logVal)
}

const logger = new Log()

const epoch_to_time = (epoch)=>{
    return 1606824000 + ( epoch * 384)
}

const epoch_to_time_str = (epoch)=>{
    return DateTime
        .fromSeconds(epoch_to_time(epoch))
        .setZone('America/New_York')
        .toLocaleString(DateTime.DATETIME_FULL)
}

const time_to_epoch= (time)=>{
    return Math.floor(( time - 1606824000 ) / 384)
}

const get_committee = async (epoch)=>{
    const url = `${beaconNode}/eth/v1/beacon/states/finalized/sync_committees?epoch=${epoch}`
    return await axios.get(url);
}

const search_committee = async (desc, epoch)=>{
    const {data={}} = await get_committee(epoch)
    const {data:{validators=[]}={}} = data
    logger.log(`Searching committee ${desc}\n`);
    const foundValidators = validatorList.filter(d=>validators.indexOf(d)>=0)
    if(foundValidators.length>0){
        foundValidators.forEach(d=>{logger.log(`validator: ${d} found in ${desc} sync committee\n`)});
    }else{
        logger.log(`No validators found in ${desc} sync committee\n`)
        foundValidators.push("NONE")
    }
    return foundValidators
}

const display_epoch = (epoch, desc)=>{
    logger.log(`epoch: ${epoch} : ${epoch_to_time_str(epoch)} <-- ${desc}`)
}

async function main(){

    logger.log(` \n\n\n==========================================`)
    logger.log(`STARTING [${DateTime.now().setZone('America/New_York').toLocaleString(DateTime.DATETIME_FULL)}]\n\n`)
    const CURR_EPOCH=(time_to_epoch(Math.floor(Date.now()/1000)))
    const CURR_START_EPOCH=Math.floor(CURR_EPOCH / 256 ) * 256
    const NEXT_START_EPOCH=CURR_START_EPOCH + 256
    const NEXTB1_START_EPOCH=NEXT_START_EPOCH + 256


    display_epoch(CURR_START_EPOCH, "current sync committee start")
    display_epoch(CURR_EPOCH , "now")
    display_epoch(NEXT_START_EPOCH , "next sync committee start")
    display_epoch(NEXTB1_START_EPOCH, "next to next one sync committee start")
    logger.log("")
    
    const currFoundValidators = await search_committee("current", CURR_EPOCH)
    const nextFoundValidators = await search_committee("next", NEXT_START_EPOCH)

    logger.log(`ENDED [${DateTime.now().setZone('America/New_York').toLocaleString(DateTime.DATETIME_FULL)}]`)
    logger.log(`==========================================`)

    appendFileSync(`${__dirname}/logs/main.log`, logger.logStore, {encoding:"utf8"})

}

main()
