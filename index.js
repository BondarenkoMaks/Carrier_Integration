'use strict'
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const csv = require("fast-csv");
const filesDir = path.join(process.cwd(), 'files');
const jsonFilesDir = path.join(process.cwd(), 'jsonFiles');
const files = fs.readdirSync(filesDir).sort();

files.forEach(file => readFile(file));

function readFile(file){

  let fileReadStream = fs.createReadStream(filesDir + path.sep + file);
  let fileWriteStream = fs.createWriteStream(jsonFilesDir + path.sep +file+".json");

  // if error - show error (not found or no rights)
  fileReadStream.on('error', (err) => {    
      console.log("Error "+ err);
    }  
  ); 
  fileWriteStream.on('error', (err) => {    
      console.log("Error "+ err);
    }  
  ); 
  
	let csvStream = csv
    .parse({headers: true, ignoreEmpty: true, delimiter: '|'})
    .on("data", (data)=>{
        // console.log(data);
        if (data){  
          let dataJson =  makeJson(data);
         if (!fileWriteStream.write(dataJson)){
          fileReadStream.pause();
        
         let drainEvent = function (){
            fileReadStream.resume();
            fileWriteStream.write(dataJson);           
          }
          
          fileWriteStream.removeAllListeners("drain", drainEvent);
          
          fileWriteStream.once("drain", drainEvent);
        }
      }		 
    })
    .on("end", ()=>{
         console.log("done");
         fileWriteStream.close();	
    });

  fileReadStream
    .pipe(csvStream);

	function makeJson(obj){
    let newObj = {};
    newObj.name = `${obj.first_name} ${obj.last_name}`;
    newObj.phone = obj.phone.slice(-8);
    newObj.person ={
      firstName:`${obj.first_name}`,
      lastName:`${obj.last_name}`
    };
    newObj.amount = (+obj.amount).toFixed(2);
    newObj.date = moment(obj.date, "YYYY MMM DD", true);
    newObj.costCenterNum = obj.cc.slice(3);
    return JSON.stringify(newObj);
  }
};	
