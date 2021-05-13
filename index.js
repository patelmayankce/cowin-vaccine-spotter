const player = require('play-sound')(opts = {})

const CronJob = require('cron').CronJob;
const axios = require('axios').default;

const authorization = '';
const distId = 770;
const date = '13-05-2021';
axios.defaults.headers = {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Authorization': authorization.indexOf('Bearer') === -1 ? `Bearer ${authorization}` : authorization,
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
};
const url = authorization ? `https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id=${distId}&date=${date}` : `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${distId}&date=${date}`;

const findSlot = async () => {
    try {
        console.log('Start...');
        const response = await axios.get(url);
        if (response.status == 200) {
            const centers = response.data.centers;
            const result = {
                plus_18: [],
                plus_45: [],
            }
            centers.forEach(c => {
                c.sessions.forEach(s => {
                    if (s.available_capacity > 0) {
                        const centerDetail = JSON.parse(JSON.stringify(c));
                        delete centerDetail.sessions;
                        result[`plus_${s.min_age_limit}`] = {
                            ...s,
                            ...centerDetail,
                        }
                        console.log("******************************");
                        console.log("Center Name : " + c.name);
                        console.log("Center Address : " + c.address);
                        console.log("Date : " + s.date);
                        console.log("Availability : " + s.available_capacity);
                        console.log("Slot : " + s.slots);
                        console.log("Vaccine Type : " + s.vaccine);
                        console.log("Age Limit : " + s.min_age_limit);
                        player.play(`./assets/${s.min_age_limit}.mp3`, (err) => {
                            if (err) throw err
                        });
                    }
                })
            });
            if (result.plus_18.length > 0) {
                console.log('18+ Found', result.plus_18);
            } else {
                console.warn('no 18+ found');
            }
            if (result.plus_45.length > 0) {
                console.log('45+ Found', result.plus_45);
            } else {
                console.warn('no 45+ found');
            }
        }
    } catch (error) {
        console.log(error);
    }
    console.log('End.....');
}

findSlot();
const job = new CronJob('10 * * * * *', async () => {
    await findSlot();
}, null, true, 'America/Los_Angeles');

job.start();