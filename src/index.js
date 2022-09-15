const fs = require("fs");
const bodyParser = require('body-parser');
const requests = require('requests');
const path = require('path');
const hbs = require("hbs");
const chart=require("chart.js");
const express = require("express");
const app = express();
const staticpath = path.join(__dirname, '../static');

app.use(express.static(staticpath));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('view engine', 'hbs');

const homepage = fs.readFileSync("views/home.hbs", "utf-8");
const indxpg=fs.readFileSync("views/index.hbs","utf-8");
 const replacevalue = (tempval, apival) => {
    const temp = (apival[0].list[0].main.temp - 273.15).toFixed(2);
    const pop = ((apival[0].list[0].pop) * 100).toFixed(0);
    var rdate = new Date(apival[0].city.sunrise * 1000);
    var rise = rdate.getHours() + ":" + rdate.getMinutes();

    var sdate = new Date(apival[0].city.sunset* 1000);
    var set = sdate.getHours()-12 + ":" + sdate.getMinutes();


    let hr=new Date().getHours();
    if(hr==0){
        hr=12;
        suffix ="AM";
    }
    if (hr < 12) {
        hour=hr;
        suffix = "AM";
      }else{
        hour=hr;
        hr=hr-12;
        suffix="PM";
      }
    let html="";
   const list=apival[0].list;
   for (let index = 0; index < 8; index++) {
        if(list[index].weather[0].main=="Rain"){
            if(list[index].weather[0].description=="light rain"||list[index].weather[0].description=="Drizzle"){
                if(hr>=7&&hr<=11&&suffix=="PM"||hr>=1&&hr<=4&&suffix=="AM"||hr==12&& suffix=="AM"){
                    image="https://cdn.pixabay.com/photo/2022/04/27/01/13/weather-7159429_1280.png";
                }else{
                    image="https://cdn.pixabay.com/photo/2022/04/27/01/12/weather-7159428_1280.png";
                }
            }else{
            image="https://cdn.pixabay.com/photo/2022/04/27/01/11/weather-7159425_1280.png";
            }
        }
        else if(list[index].weather[0].main=="Clouds"){
            if(list[index].weather[0].description=="few clouds"){
                if(hr>=7&&hr<=11&&suffix=="PM"||hr>=1&&hr<=4&&suffix=="AM"||hr==12&& suffix=="AM"){
                    image="https://cdn.pixabay.com/photo/2022/04/12/00/30/weather-7126914_1280.png";
                }else{
                    image="https://cdn.pixabay.com/photo/2022/03/28/22/48/cloudy-7098481_1280.png";
                }
            }
            else if(list[index].weather[0].description=="scattered clouds"){
                        image="https://cdn.pixabay.com/photo/2022/03/28/22/48/cloudy-7098481_1280.png";
                    }
                    else{
                        image="https://cdn.pixabay.com/photo/2022/03/28/22/48/cloudy-7098479_1280.png";
                    }
                }
        else if(list[index].weather[0].main=="Clear"){
            if(list[index].weather[0].description=="clear sky"){
                if(hr>=7&&hr<=11&&suffix=="PM"||hr>=1&&hr<=4&&suffix=="AM"||hr==12&& suffix=="AM"){
                    image="https://cdn.pixabay.com/photo/2022/03/28/22/48/moon-7098482_1280.png";
                }else{
                    image="https://cdn.pixabay.com/photo/2022/03/28/22/48/sun-7098480_1280.png";
                }
        }
    }
        else if(list[index].weather[0].main=="Thunderstorm"){
            id="https://cdn.pixabay.com/photo/2012/04/18/13/21/clouds-37009_1280.png";
        }
        html=html+`<div class="hourly">
    <p>${hr} ${suffix}</p>
    <img src=${image} height=54 width=54>
    <h5>${(list[index].main.temp-273.15).toFixed(0)}&deg;C</h5>
  </div>`
       hour=hour+3;
       if (hour < 12) {
        hr=hour;
        suffix = "AM";
      }else{
        if(hour==12){
            hr=12;
            suffix="PM";
        }
        if(hour>12&&hour<24){hr=hour-12;
            suffix="PM";
        }
        if(hour>=24&&hour<36){hr=hour-24;
            suffix="AM";}
        if(hour>=36){
            hr=hour-36;
            suffix="PM";
        }
         }
         if(hr==0){
            hr=12;
         }
      }
    let temperature = tempval.replace("{%temp%}", temp);
    temperature = temperature.replace("{%title%}", apival[0].list[0].weather[0].main);
    temperature = temperature.replace("{%status%}", apival[0].list[0].weather[0].description);
    temperature = temperature.replace("{%loc%}", apival[0].city.name);
    temperature = temperature.replace("{%sunrise%}", rise);
    temperature = temperature.replace("{%sunset%}", set);
    temperature = temperature.replace("{%cor%}", pop);
    temperature = temperature.replace("{%wspeed%}", apival[0].list[0].wind.speed);
    temperature=temperature.replace("{%graph%}",html);
    return temperature;
}
function randomno(){
    const randomNr = Math.floor((Math.random()*10)+1);
    return randomNr;
}
app.get("/", (req, res) => {
    const random_num=randomno();
    const no=indxpg.replace("{%random%}",random_num);
    // res.render("index.hbs");
    res.send(no);
})
app.post("/home", async (req, res) => {
    try {
        const city = req.body.cityname;
        requests(`http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=95deff53d0990aa416e079977cafc140`)
            .on("data", function (chunk) {
                const objdata = JSON.parse(chunk);
                const arrdata = [objdata];
                // const chart= createchart(arrdata);
                const apidata = replacevalue(homepage, arrdata);
                res.send(apidata);
            })
            .on("end", function (err) {
                if (err) return console.log('connection closed due to errors', err);
                console.log('end');
                res.end();
            });
    } catch (error) {
        console.log(error);
    }
})
app.get("/home", (req, res) => {
    res.render("home.hbs");
});
app.listen("3000", () => {
    console.log("started");
})